// REQ-F08-03: cantidad y precio final acordado por producto

// Solo se negocian cantidades y precios antes de registrar el pago
export const ESTADOS_CON_PRECIO_EDITABLE = ['Pendiente'];

export const crearProductosEditables = (productos = []) => productos.map(p => ({
  ...p,
  cantidad: Number(p.cantidad) || 1,
  precioUnitario: Number(p.precioUnitario) || 0,
}));

export const recalcularProductos = (productos) => productos.map(p => {
  const cantidad = Number(p.cantidad) || 0;
  const precioUnitario = Number(p.precioUnitario) || 0;
  return { ...p, cantidad, precioUnitario, subtotal: Math.round(cantidad * precioUnitario * 100) / 100 };
});

export const calcularTotalAcordado = (productos) => recalcularProductos(productos).reduce((sum, p) => sum + p.subtotal, 0);

// El navegador del cliente envía los precios: el administrador debe ver si alguno no coincide con el catálogo
export const productosConPrecioDistinto = (productos = [], catalogo = []) => {
  if (catalogo.length === 0) return [];
  return productos.filter(p => {
    const enCatalogo = catalogo.find(c => c.nombre === p.nombre && c.peso === p.peso);
    return !enCatalogo || Number(enCatalogo.precioReferencial) !== Number(p.precioUnitario);
  });
};

export const validarProductosAcordados = (nuevoEstado, productos) => {
  if (productos.some(p => !Number.isInteger(Number(p.cantidad)) || Number(p.cantidad) < 1)) return "Las cantidades deben ser números enteros mayores que 0.";
  if (productos.some(p => Number(p.precioUnitario) < 0 || p.precioUnitario === '')) return "Los precios no pueden estar vacíos ni ser negativos.";
  // No se registra el pago sin precio acordado (p. ej. solicitudes de la IA aún sin cotizar)
  if (nuevoEstado === 'Pagado' && calcularTotalAcordado(productos) <= 0) return "Registra el precio acordado antes de marcar el pedido como Pagado.";
  return null;
};
