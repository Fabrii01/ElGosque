// Construcción de solicitudes de pedido, compartida por el carrito y el asistente IA (REQ-F05)

// El café verde solo se vende en grano
export const presentacionesDisponibles = (producto) => (producto.tipo === 'Verde' ? ['En grano'] : ['En grano', 'Molido']);

// Corrige la presentación de un producto del catálogo si no es válida para su tipo (p. ej. Verde + Molido)
export const ajustarPresentacion = (producto) => {
  const disponibles = presentacionesDisponibles(producto);
  return disponibles.includes(producto.presentacion) ? producto : { ...producto, presentacion: disponibles[0] };
};

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

// Documento final de la solicitud; los datos del cliente salen de su perfil (REQ-F02-01).
// La frecuencia de compra ya no se pide (un cliente nuevo no la conoce); los pedidos antiguos la conservan.
export const crearSolicitud = ({ codigo, userData, contacto, productos, origen }) => ({
  codigo,
  clienteId: userData.uid,
  clienteNombre: userData.nombre || '',
  clienteEmail: userData.email || '',
  telefono: contacto.telefono,
  ciudad: contacto.ciudad,
  negocio: contacto.negocio,
  productos,
  total: calcularTotalItems(productos),
  estado: 'Pendiente',
  ...(origen && { origen }),
});
