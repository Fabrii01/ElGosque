import { describe, it, expect, vi, beforeAll, beforeEach, afterEach } from 'vitest';
import servidor, { MODELOS_PERMITIDOS, superaLimite, validarConsulta, verificarToken } from '../../servidor-ia/src/index';

// Ampliación posterior al plan: intermediario de la IA (Prueba 7, OWASP A02)
const ORIGEN = 'https://el-gosque-app.web.app';
const PROYECTO = 'el-gosque-app';
const modelo = MODELOS_PERMITIDOS[0];
const mensajes = [{ role: 'user', content: 'Hola' }];

const base64Url = (bytes) => btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const textoBase64Url = (objeto) => base64Url(new TextEncoder().encode(JSON.stringify(objeto)));

let claves;
let jwkPublica;

const firmar = async (cambios = {}, llave = claves.privateKey) => {
  const ahora = Math.floor(Date.now() / 1000);
  const datos = { iss: `https://securetoken.google.com/${PROYECTO}`, aud: PROYECTO, sub: `uid-${Math.random()}`, iat: ahora - 10, exp: ahora + 3600, email_verified: true, ...cambios };
  const contenido = `${textoBase64Url({ alg: 'RS256', kid: 'clave-1' })}.${textoBase64Url(datos)}`;
  const firma = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', llave, new TextEncoder().encode(contenido));
  return `${contenido}.${base64Url(firma)}`;
};

const generar = () => crypto.subtle.generateKey(
  { name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' }, true, ['sign', 'verify'],
);

const consulta = (token, { origen = ORIGEN, metodo = 'POST', cuerpo = { modelo, mensajes } } = {}) => new Request('https://ia.ejemplo.dev/', {
  method: metodo,
  headers: { Origin: origen, 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
  ...(metodo === 'POST' && { body: JSON.stringify(cuerpo) }),
});

const env = { GROQ_API_KEY: 'clave-de-prueba' };
const llamadasAGroq = () => fetch.mock.calls.filter(([url]) => String(url).includes('api.groq.com'));

beforeAll(async () => {
  claves = await generar();
  jwkPublica = { ...await crypto.subtle.exportKey('jwk', claves.publicKey), kid: 'clave-1' };
});

beforeEach(() => {
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.stubGlobal('fetch', vi.fn(async (url) => (String(url).includes('googleapis.com')
    ? Response.json({ keys: [jwkPublica] }, { headers: { 'cache-control': 'max-age=3600' } })
    : Response.json({ choices: [{ message: { content: 'Respuesta' } }] }))));
});

afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });

describe('Ampliación - Token de Firebase en el intermediario', () => {
  it('[+] Acepta un token firmado para el proyecto', async () => {
    await expect(verificarToken(await firmar({ sub: 'u1' }))).resolves.toMatchObject({ sub: 'u1' });
  });

  it('[–] Rechaza un token firmado con otra clave', async () => {
    const otra = await generar();
    await expect(verificarToken(await firmar({}, otra.privateKey))).resolves.toBeNull();
  });

  it('[–] Rechaza un token vencido o de otro proyecto', async () => {
    await expect(verificarToken(await firmar({ exp: 10 }))).resolves.toBeNull();
    await expect(verificarToken(await firmar({ aud: 'otro-proyecto' }))).resolves.toBeNull();
  });

  it('[–] Rechaza texto que no es un token', async () => {
    await expect(verificarToken('no-es-un-token')).resolves.toBeNull();
  });
});

describe('Ampliación - Acceso al intermediario', () => {
  it('[+] Cliente verificado: reenvía a Groq con la clave secreta', async () => {
    const respuesta = await servidor.fetch(consulta(await firmar()), env);
    expect(respuesta.status).toBe(200);
    expect(respuesta.headers.get('Access-Control-Allow-Origin')).toBe(ORIGEN);
    const [, opciones] = llamadasAGroq()[0];
    expect(opciones.headers.Authorization).toBe('Bearer clave-de-prueba');
    expect(JSON.parse(opciones.body)).toMatchObject({ model: modelo, messages: mensajes, max_completion_tokens: 1024 });
  });

  it.each([
    ['sin token', async () => undefined, 401],
    ['correo sin verificar', () => firmar({ email_verified: false }), 403],
  ])('[–] %s: no llega a Groq', async (_, crearToken, estado) => {
    const respuesta = await servidor.fetch(consulta(await crearToken()), env);
    expect(respuesta.status).toBe(estado);
    expect(llamadasAGroq()).toHaveLength(0);
  });

  it('[–] Origen no permitido', async () => {
    const respuesta = await servidor.fetch(consulta(await firmar(), { origen: 'https://sitio-ajeno.com' }), env);
    expect(respuesta.status).toBe(403);
    expect(llamadasAGroq()).toHaveLength(0);
  });

  it('[+] Responde la comprobación previa del navegador', async () => {
    const respuesta = await servidor.fetch(consulta(null, { metodo: 'OPTIONS' }), env);
    expect(respuesta.status).toBe(204);
  });

  it('[–] Conserva el estado 429 de Groq y su espera sugerida', async () => {
    fetch.mockImplementation(async (url) => (String(url).includes('googleapis.com')
      ? Response.json({ keys: [jwkPublica] })
      : new Response('{}', { status: 429, headers: { 'retry-after': '3' } })));
    const respuesta = await servidor.fetch(consulta(await firmar()), env);
    expect(respuesta.status).toBe(429);
    expect(respuesta.headers.get('Retry-After')).toBe('3');
  });
});

describe('Ampliación - Límites del intermediario', () => {
  it('[–] Rechaza modelos no permitidos, roles extraños y conversaciones excesivas', () => {
    expect(validarConsulta({ modelo: 'otro', mensajes })).toMatch(/Modelo/);
    expect(validarConsulta({ modelo, mensajes: [] })).toMatch(/Cantidad/);
    expect(validarConsulta({ modelo, mensajes: [{ role: 'tool', content: 'x' }] })).toMatch(/formato/);
    expect(validarConsulta({ modelo, mensajes: [{ role: 'user', content: 'x'.repeat(40001) }] })).toMatch(/larga/);
    expect(validarConsulta(null)).toMatch(/Modelo/);
  });

  it('[+] Acepta una consulta normal', () => {
    expect(validarConsulta({ modelo, mensajes })).toBe('');
  });

  it('[–] Frena al cliente que supera 20 consultas por minuto y lo libera al minuto siguiente', () => {
    const inicio = 1000000;
    for (let i = 0; i < 20; i++) expect(superaLimite('cliente-limite', inicio)).toBe(false);
    expect(superaLimite('cliente-limite', inicio)).toBe(true);
    expect(superaLimite('cliente-limite', inicio + 60001)).toBe(false);
  });
});
