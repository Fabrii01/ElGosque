// Tras publicar una versión, una pestaña abierta puede pedir archivos que ya no existen en el servidor.
// Se recarga para obtener la versión nueva, sin repetir la recarga si el error continúa.
const CLAVE_RECARGA = 'gosque-recarga-version';
const ESPERA_ENTRE_RECARGAS_MS = 30000;

export const debeRecargar = (ultimaRecarga, ahora) => !(ahora - Number(ultimaRecarga) < ESPERA_ENTRE_RECARGAS_MS);

export const manejarVersionAntigua = (evento) => {
  try {
    const ahora = Date.now();
    if (!debeRecargar(sessionStorage.getItem(CLAVE_RECARGA), ahora)) return;
    sessionStorage.setItem(CLAVE_RECARGA, String(ahora));
  } catch {
    return; // Sin almacenamiento no se puede evitar un ciclo de recargas
  }
  evento.preventDefault();
  window.location.reload();
};
