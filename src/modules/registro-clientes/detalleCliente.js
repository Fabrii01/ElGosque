import { ESTADOS_VENTA_CONCRETADA } from '../../shared/constants';

const unidadesDe = (pedido) => (pedido.productos || []).reduce((sum, i) => sum + (Number(i.cantidad) || 0), 0);
const segundos = (pedido) => pedido.fecha?.seconds || 0;

// Resumen comercial de un cliente a partir de sus pedidos (vista de detalle del admin)
export const calcularDetalleCliente = (cliente, pedidos) => {
  const propios = pedidos.filter(p => p.clienteId === cliente.uid).sort((a, b) => segundos(b) - segundos(a));
  const ventas = propios.filter(p => ESTADOS_VENTA_CONCRETADA.includes(p.estado));
  const totalComprado = ventas.reduce((sum, p) => sum + (p.total || 0), 0);

  // Productos que más compra (unidades e importe en ventas concretadas)
  const productos = {};
  ventas.forEach(p => (p.productos || []).forEach(item => {
    const nombre = item.nombre || 'Sin nombre';
    productos[nombre] ||= { nombre, unidades: 0, importe: 0 };
    productos[nombre].unidades += Number(item.cantidad) || 0;
    productos[nombre].importe += Number(item.subtotal) || 0;
  }));

  const fechasVenta = ventas.map(segundos).filter(Boolean);

  return {
    pedidos: propios,
    resumen: {
      solicitudes: propios.length,
      pendientes: propios.filter(p => p.estado === 'Pendiente').length,
      pedidosConcretados: ventas.length,
      noConcretados: propios.filter(p => p.estado === 'Denegado' || p.estado === 'Cancelado').length,
      totalComprado,
      ticketPromedio: ventas.length ? totalComprado / ventas.length : 0,
      unidades: ventas.reduce((sum, p) => sum + unidadesDe(p), 0),
      // Ventas confirmadas que aún no registran pago
      porCobrar: ventas.filter(p => p.estado === 'Vendido').reduce((sum, p) => sum + (p.total || 0), 0),
      desdeIA: propios.filter(p => p.origen === 'Asistente IA').length,
      primeraCompra: fechasVenta.length ? { seconds: Math.min(...fechasVenta) } : null,
      ultimaCompra: fechasVenta.length ? { seconds: Math.max(...fechasVenta) } : null,
      frecuenciaDeclarada: propios.find(p => p.frecuencia)?.frecuencia || null,
    },
    productosFavoritos: Object.values(productos).sort((a, b) => b.unidades - a.unidades).slice(0, 5),
  };
};

// Texto corto con los productos de un pedido: "3x Geisha, 1x Gourmet"
export const resumirProductos = (pedido) => (pedido.productos || []).map(i => `${i.cantidad}x ${i.nombre}`).join(', ');
