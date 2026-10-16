// Datos y reglas del registro de pagos (REQ-F09)

// REQ-F09-01: efectivo, Yape, Plin, transferencia u otro medio autorizado
export const METODOS_PAGO = ['Efectivo', 'Yape', 'Plin', 'Transferencia Bancaria', 'Otro'];

// Medios electrónicos que siempre generan número de operación
const METODOS_CON_OPERACION = ['Yape', 'Plin', 'Transferencia Bancaria'];

// Estado inicial del formulario a partir de pedido.datosPago (sin la constancia, que es su propio módulo)
export const crearPagoInicial = (datosPago = {}) => ({
  metodo: datosPago.metodo || '',
  monto: datosPago.monto || '',
  fecha: datosPago.fecha || '',
  nroOperacion: datosPago.nroOperacion || '',
});

export const requiereNroOperacion = (metodo) => METODOS_CON_OPERACION.includes(metodo);

// Un pago está registrado si tiene medio, monto y fecha (indicador de la tesis)
export const tienePagoRegistrado = (datosPago) => Boolean(datosPago && datosPago.metodo && datosPago.monto && datosPago.fecha);

// REQ-F09-04 / RN-08: para validar el pago y marcar "Pagado" se exigen medio, monto y fecha;
// el número de operación aplica a pagos electrónicos
export const validarPago = (nuevoEstado, pago) => {
  if (nuevoEstado !== 'Pagado') return null;
  if (!tienePagoRegistrado(pago)) return "Para marcar como Pagado registra medio, monto y fecha de pago.";
  if (requiereNroOperacion(pago.metodo) && !pago.nroOperacion.trim()) return "Falta Número de Operación.";
  return null;
};
