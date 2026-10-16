// Construcción de solicitudes de pedido, compartida por el carrito y el asistente IA (REQ-F05)

export const FRECUENCIAS_COMPRA = ['Única vez', 'Semanal', 'Quincenal', 'Mensual'];

// El café verde solo se vende en grano
export const presentacionesDisponibles = (producto) => (producto.tipo === 'Verde' ? ['En grano'] : ['En grano', 'Molido']);

// El precio sale siempre del catálogo (precio referencial, RN-01)
export const crearItemSolicitud = (producto, cantidad, presentacion, peso) => {
  const precioUnitario = parseFloat(producto.precioReferencial) || 0;
  return {
    nombre: producto.nombre,
    cantidad,
    peso,
    presentacion,
    precioUnitario,
    subtotal: precioUnitario * cantidad,
  };
};

export const calcularTotalItems = (items) => items.reduce((sum, item) => sum + item.subtotal, 0);

// Documento final de la solicitud; los datos del cliente salen de su perfil (REQ-F02-01)
export const crearSolicitud = ({ codigo, userData, contacto, productos, origen }) => ({
  codigo,
  clienteId: userData.uid,
  clienteNombre: userData.nombre || '',
  clienteEmail: userData.email || '',
  telefono: contacto.telefono,
  ciudad: contacto.ciudad,
  negocio: contacto.negocio,
  frecuencia: contacto.frecuencia,
  productos,
  total: calcularTotalItems(productos),
  estado: 'Pendiente',
  ...(origen && { origen }),
});
