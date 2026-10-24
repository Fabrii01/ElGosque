// Constantes de negocio compartidas entre módulos

// Variedades (muestras) que comercializa El Gosque; desde el 2026-10-23 son 4 (antes 9)
export const VARIEDADES_CAFE = [
  'Especial El Gosque',
  'Gourmet',
  'Geisha',
  'Oro Negro',
];

export const ESTADOS_PEDIDO = ['Pendiente', 'Pagado', 'Enviado', 'Vendido', 'Cancelado'];

// Estados que cuentan como venta concretada para el dashboard (REQ-F11): desde que se registra el pago
export const ESTADOS_VENTA_CONCRETADA = ['Pagado', 'Enviado', 'Vendido'];
