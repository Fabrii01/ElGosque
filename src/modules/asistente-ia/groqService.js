// Conexión con Groq (API compatible con OpenAI) para el asistente de IA (REQ-F12)
// Se llama directo desde el navegador: Groq permite CORS para cualquier origen.
const URL_GROQ = 'https://api.groq.com/openai/v1/chat/completions';

// Modelo principal y de respaldo: en el plan gratuito cada modelo tiene su propia cuota
export const MODELOS_GROQ = ['openai/gpt-oss-120b', 'llama-3.3-70b-versatile'];

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

// Los modelos gpt-oss razonan antes de responder: esfuerzo bajo para responder rápido y sin devolver el razonamiento
export const crearCuerpoGroq = (modelo, mensajes) => ({
  model: modelo,
  messages: mensajes,
  temperature: 0.2,
  max_completion_tokens: 1024,
  ...(modelo.startsWith('openai/gpt-oss') && { reasoning_effort: 'low', include_reasoning: false }),
});

// 429 = límite de uso alcanzado; 5xx = servicio saturado. Ambos se reintentan; el resto (p. ej. clave inválida) no.
const esReintentable = (estado) => estado === 429 || estado >= 500;

// Espera sugerida por Groq (cabecera retry-after) o una espera creciente
const tiempoDeEspera = (respuesta, intento) => {
  const segundos = Number(respuesta?.headers.get('retry-after'));
  return segundos > 0 && segundos <= 10 ? segundos * 1000 : 1500 * (intento + 1);
};

const pedirAGroq = async (apiKey, modelo, mensajes) => {
  const controlador = new AbortController();
  const temporizador = setTimeout(() => controlador.abort(), TIEMPO_MAXIMO_MS);
  try {
    return await fetch(URL_GROQ, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify(crearCuerpoGroq(modelo, mensajes)),
      signal: controlador.signal,
    });
  } finally {
    clearTimeout(temporizador);
  }
};

// Envía la conversación ({ role: 'system' | 'user' | 'assistant', content }) y devuelve el texto de la respuesta
export const consultarGroq = async (apiKey, mensajes) => {
  if (!apiKey) throw new Error('Falta la clave de Groq.');
  let ultimoError = null;

  for (const modelo of MODELOS_GROQ) {
    for (let intento = 0; intento <= REINTENTOS_POR_MODELO; intento++) {
      let respuesta = null;
      try {
        respuesta = await pedirAGroq(apiKey, modelo, mensajes);
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
        ultimoError = new Error(`Groq respondió con el estado ${respuesta.status}.`);
        if (!esReintentable(respuesta.status)) throw ultimoError;
      }

      if (intento < REINTENTOS_POR_MODELO) await esperar(tiempoDeEspera(respuesta, intento));
    }
  }
  throw ultimoError;
};
