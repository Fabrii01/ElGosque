// Datos y reglas del registro de pagos (REQ-F09)

// REQ-F09-01: efectivo, Yape, Plin, transferencia u otro medio autorizado
export const METODOS_PAGO = ['Efectivo', 'Yape', 'Plin', 'Transferencia Bancaria', 'Otro'];

// Medios electrónicos que siempre generan un comprobante (captura de Yape/Plin o voucher de transferencia)
const METODOS_CON_COMPROBANTE = ['Yape', 'Plin', 'Transferencia Bancaria'];

// Estado inicial del formulario a partir de pedido.datosPago (sin la constancia, que es su propio módulo).
// nroOperacion ya no se pide en el panel; se conserva para no perder el dato de pedidos anteriores.
export const crearPagoInicial = (datosPago = {}) => ({
  metodo: datosPago.metodo || '',
  monto: datosPago.monto || '',
  fecha: datosPago.fecha || '',
  nroOperacion: datosPago.nroOperacion || '',
});

export const requiereComprobante = (metodo) => METODOS_CON_COMPROBANTE.includes(metodo);

// Un pago está registrado si tiene medio, monto y fecha (indicador de la tesis)
export const tienePagoRegistrado = (datosPago) => Boolean(datosPago && datosPago.metodo && datosPago.monto && datosPago.fecha);

// REQ-F09-04 / RN-08: para validar el pago y marcar "Pagado" se exigen medio, monto y fecha;
// en pagos electrónicos se exige la captura del comprobante (pago.constanciaImagen)
export const validarPago = (nuevoEstado, pago) => {
  if (nuevoEstado !== 'Pagado') return null;
  if (!tienePagoRegistrado(pago)) return "Para marcar como Pagado registra medio, monto y fecha de pago.";
  if (!(Number(pago.monto) > 0)) return "El monto pagado debe ser un número mayor que 0.";
  if (requiereComprobante(pago.metodo) && !pago.constanciaImagen) return "Adjunta la captura del comprobante de pago.";
  return null;
};
