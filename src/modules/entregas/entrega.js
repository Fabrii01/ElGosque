// Reglas del registro de entregas (REQ-F10-04/05)
// Hoy la entrega se registra solo como cambio de estado a "Entregado"; no hay datos propios de entrega.

// Para marcar "Entregado" se exigen modalidad y fecha de despacho
export const validarEntrega = (nuevoEstado, envio) => {
  if (nuevoEstado === 'Entregado' && (!envio.modalidad || !envio.fechaEnvio)) return "Faltan datos de envío.";
  return null;
};
