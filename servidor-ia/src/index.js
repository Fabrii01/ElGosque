// Intermediario del asistente de IA (Cloudflare Worker).
// La clave de Groq vive aquí como secreto: nunca llega al navegador (Prueba 7, OWASP A02).
// Solo atiende a clientes con sesión de Firebase y correo verificado.

const URL_GROQ = 'https://api.groq.com/openai/v1/chat/completions';
const URL_CLAVES_FIREBASE = 'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com';
const PROYECTO_FIREBASE = 'el-gosque-app';
const ORIGENES_PERMITIDOS = ['https://el-gosque-app.web.app', 'https://el-gosque-app.firebaseapp.com', 'http://localhost:5173'];

export const MODELOS_PERMITIDOS = ['openai/gpt-oss-120b', 'openai/gpt-oss-20b'];
const ROLES_PERMITIDOS = ['system', 'user', 'assistant'];
const MAX_MENSAJES = 20;
const MAX_CARACTERES = 40000;
const MAX_CONSULTAS_POR_MINUTO = 20;

// Los modelos gpt-oss razonan antes de responder: esfuerzo bajo para responder rápido y sin devolver el razonamiento
const crearCuerpoGroq = (modelo, mensajes) => ({
  model: modelo,
  messages: mensajes,
  temperature: 0.2,
  max_completion_tokens: 1024,
  ...(modelo.startsWith('openai/gpt-oss') && { reasoning_effort: 'low', include_reasoning: false }),
});

const decodificarBase64Url = (texto) => {
  const binario = atob(texto.replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from(binario, c => c.charCodeAt(0));
};
const decodificarJson = (texto) => JSON.parse(new TextDecoder().decode(decodificarBase64Url(texto)));

let clavesEnCache = { claves: null, vence: 0 };

const obtenerClavesFirebase = async () => {
  if (clavesEnCache.claves && Date.now() < clavesEnCache.vence) return clavesEnCache.claves;
  const respuesta = await fetch(URL_CLAVES_FIREBASE);
  if (!respuesta.ok) throw new Error('No se pudieron leer las claves de Firebase.');
  const { keys } = await respuesta.json();
  const segundos = Number(/max-age=(\d+)/.exec(respuesta.headers.get('cache-control') || '')?.[1]) || 3600;
  clavesEnCache = { claves: keys, vence: Date.now() + segundos * 1000 };
  return keys;
};

// Comprueba firma y datos del token de Firebase. Devuelve sus datos, o null si no es válido.
export const verificarToken = async (token) => {
  try {
    const [cabeceraB64, datosB64, firmaB64] = token.split('.');
    const cabecera = decodificarJson(cabeceraB64);
    if (cabecera.alg !== 'RS256') return null;

    const jwk = (await obtenerClavesFirebase()).find(k => k.kid === cabecera.kid);
    if (!jwk) return null;

    const clave = await crypto.subtle.importKey('jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
    const firmado = new TextEncoder().encode(`${cabeceraB64}.${datosB64}`);
    if (!await crypto.subtle.verify('RSASSA-PKCS1-v1_5', clave, decodificarBase64Url(firmaB64), firmado)) return null;

    const datos = decodificarJson(datosB64);
    const ahora = Math.floor(Date.now() / 1000);
    const valido = datos.iss === `https://securetoken.google.com/${PROYECTO_FIREBASE}`
      && datos.aud === PROYECTO_FIREBASE
      && typeof datos.sub === 'string' && datos.sub !== ''
      && datos.exp > ahora
      && datos.iat <= ahora + 60;
    return valido ? datos : null;
  } catch {
    return null;
  }
};

export const validarConsulta = (cuerpo) => {
  if (!MODELOS_PERMITIDOS.includes(cuerpo?.modelo)) return 'Modelo no permitido.';
  const { mensajes } = cuerpo;
  if (!Array.isArray(mensajes) || mensajes.length === 0 || mensajes.length > MAX_MENSAJES) return 'Cantidad de mensajes no válida.';
  if (!mensajes.every(m => ROLES_PERMITIDOS.includes(m?.role) && typeof m.content === 'string')) return 'Mensajes con formato no válido.';
  if (mensajes.reduce((total, m) => total + m.content.length, 0) > MAX_CARACTERES) return 'La conversación es demasiado larga.';
  return '';
};

// Límite por cliente. Cada instancia del Worker cuenta por separado: es un freno, no una cuota exacta.
const consultasPorCliente = new Map();

export const superaLimite = (uid, ahora = Date.now()) => {
  const recientes = (consultasPorCliente.get(uid) || []).filter(t => ahora - t < 60000);
  const excedido = recientes.length >= MAX_CONSULTAS_POR_MINUTO;
  if (!excedido) recientes.push(ahora);
  consultasPorCliente.set(uid, recientes);
  return excedido;
};

const cabecerasCors = (origen) => ({
  'Access-Control-Allow-Origin': origen,
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type',
  'Access-Control-Max-Age': '86400',
  Vary: 'Origin',
});

// Los rechazos quedan en los registros de Cloudflare, sin datos personales ni contenido del chat
const rechazar = (estado, mensaje, cors, extra = {}) => {
  console.warn(JSON.stringify({ evento: 'rechazo', estado, mensaje }));
  return Response.json({ error: mensaje }, { status: estado, headers: { ...cors, ...extra } });
};

export default {
  async fetch(solicitud, env) {
    const origen = solicitud.headers.get('Origin') || '';
    if (!ORIGENES_PERMITIDOS.includes(origen)) return rechazar(403, 'Origen no permitido.', {});
    const cors = cabecerasCors(origen);

    if (solicitud.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    if (solicitud.method !== 'POST') return rechazar(405, 'Método no permitido.', cors);

    const token = /^Bearer (.+)$/.exec(solicitud.headers.get('Authorization') || '')?.[1];
    const usuario = token ? await verificarToken(token) : null;
    if (!usuario) return rechazar(401, 'Sesión no válida.', cors);
    if (usuario.email_verified !== true) return rechazar(403, 'Correo sin verificar.', cors);
    if (superaLimite(usuario.sub)) return rechazar(429, 'Demasiadas consultas.', cors, { 'Retry-After': '10' });

    const cuerpo = await solicitud.json().catch(() => null);
    const invalido = validarConsulta(cuerpo);
    if (invalido) return rechazar(400, invalido, cors);

    const respuesta = await fetch(URL_GROQ, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.GROQ_API_KEY}` },
      body: JSON.stringify(crearCuerpoGroq(cuerpo.modelo, cuerpo.mensajes)),
    });

    const espera = respuesta.headers.get('retry-after');
    return new Response(respuesta.body, {
      status: respuesta.status,
      headers: { ...cors, 'Content-Type': 'application/json', ...(espera && { 'Retry-After': espera }) },
    });
  },
};
