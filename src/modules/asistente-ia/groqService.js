import { obtenerTokenVerificado } from '../inicio-sesion/sesionService';

// Conexión con Groq para el asistente de IA (REQ-F12). El navegador llama al intermediario de servidor-ia/,
// que guarda la clave de Groq como secreto y exige sesión con correo verificado.
export const URL_ASISTENTE = 'https://el-gosque-ia.elgosque.workers.dev';

// Modelo principal y de respaldo: en el plan gratuito cada modelo tiene su propia cuota.
// Deben coincidir con MODELOS_PERMITIDOS de servidor-ia/src/index.js.
export const MODELOS_GROQ = ['openai/gpt-oss-120b', 'openai/gpt-oss-20b'];

const REINTENTOS_POR_MODELO = 2;
const TIEMPO_MAXIMO_MS = 30000;
// Últimos mensajes que se reenvían en cada consulta (el plan gratuito limita los tokens por minuto)
const MAX_MENSAJES_HISTORIAL = 16;

const esperar = (ms) => new Promise(resolver => setTimeout(resolver, ms));

// Conserva los últimos mensajes; si el recorte deja primero una respuesta de la IA, la quita para empezar con el cliente
export const recortarHistorial = (mensajes, maximo = MAX_MENSAJES_HISTORIAL) => {
  const recientes = mensajes.slice(-maximo);
  return recientes[0]?.role === 'assistant' ? recientes.slice(1) : recientes;
};

// 429 = límite de uso alcanzado; 5xx = servicio saturado. Ambos se reintentan; el resto (p. ej. clave inválida) no.
const esReintentable = (estado) => estado === 429 || estado >= 500;

// Espera sugerida por Groq (cabecera retry-after) o una espera creciente
const tiempoDeEspera = (respuesta, intento) => {
  const segundos = Number(respuesta?.headers.get('retry-after'));
  return segundos > 0 && segundos <= 10 ? segundos * 1000 : 1500 * (intento + 1);
};

const pedirAlAsistente = async (url, token, modelo, mensajes) => {
  const controlador = new AbortController();
  const temporizador = setTimeout(() => controlador.abort(), TIEMPO_MAXIMO_MS);
  try {
    return await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ modelo, mensajes }),
      signal: controlador.signal,
    });
  } finally {
    clearTimeout(temporizador);
  }
};

// Envía la conversación ({ role: 'system' | 'user' | 'assistant', content }) y devuelve el texto de la respuesta
export const consultarGroq = async (mensajes, url = URL_ASISTENTE) => {
  if (!url) throw new Error('Falta configurar URL_ASISTENTE.');
  const token = await obtenerTokenVerificado();
  if (!token) {
    const error = new Error('El correo no está verificado.');
    error.code = 'correo-sin-verificar';
    throw error;
  }
  let ultimoError = null;

  for (const modelo of MODELOS_GROQ) {
    for (let intento = 0; intento <= REINTENTOS_POR_MODELO; intento++) {
      let respuesta = null;
      try {
        respuesta = await pedirAlAsistente(url, token, modelo, mensajes);
      } catch (error) {
        // Sin conexión o tiempo de espera agotado
        ultimoError = error;
      }

      if (respuesta?.ok) {
        const datos = await respuesta.json();
        const texto = datos.choices?.[0]?.message?.content?.trim();
        if (texto) return texto;
        ultimoError = new Error('El servicio de IA devolvió una respuesta vacía.');
      } else if (respuesta) {
        ultimoError = new Error(`El asistente respondió con el estado ${respuesta.status}.`);
        if (!esReintentable(respuesta.status)) throw ultimoError;
      }

      if (intento < REINTENTOS_POR_MODELO) await esperar(tiempoDeEspera(respuesta, intento));
    }
  }
  throw ultimoError;
};
