// Convierte un Timestamp de Firestore (o una fecha serializable) a Date
export const aFecha = (valor) => new Date(valor.seconds ? valor.seconds * 1000 : valor);

// Formato corto para la vista del cliente
export const formatearFechaCorta = (timestamp) => {
  if (!timestamp) return 'Fecha pendiente';
  const date = new Date(timestamp.seconds * 1000);
  return date.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
};

// Formato con hora para el panel administrativo
export const formatearFechaHora = (timestamp) => {
  if (!timestamp) return 'Pendiente';
  return aFecha(timestamp).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};
