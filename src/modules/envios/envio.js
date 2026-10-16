// Datos del registro de envíos (REQ-F10-01/02/03)

export const MODALIDADES_ENVIO = ['Agencia (Encomienda)', 'Delivery Local', 'Recojo en Tienda'];

// Hay datos de envío solo si el admin llenó al menos un campo
export const tieneDatosEnvio = (datosEnvio) => Boolean(datosEnvio && (datosEnvio.modalidad || datosEnvio.agencia || datosEnvio.numeroGuia || datosEnvio.fechaEnvio));

// REQ-F10-04: para marcar "Enviado" se exigen modalidad y fecha de despacho
export const validarEnvio = (nuevoEstado, envio) => {
  if (nuevoEstado === 'Enviado' && (!envio.modalidad || !envio.fechaEnvio)) return "Para marcar como Enviado registra la modalidad y la fecha de despacho.";
  return null;
};

// Estado inicial del formulario a partir de pedido.datosEnvio
export const crearEnvioInicial = (datosEnvio = {}) => ({
  modalidad: datosEnvio.modalidad || '',
  agencia: datosEnvio.agencia || '',
  numeroGuia: datosEnvio.numeroGuia || '',
  fechaEnvio: datosEnvio.fechaEnvio || '',
});
