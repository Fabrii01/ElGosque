// Reglas y utilidades del estado del pedido (REQ-F08)

// Flujo permitido: Pendiente → Vendido → Pagado → Enviado → Entregado.
// Denegado solo desde una solicitud; Cancelado antes del despacho. Los estados finales no cambian.
// REQ-F10-05: "Entregado" solo es alcanzable desde "Enviado".
const TRANSICIONES_ESTADO = {
  Pendiente: ['Vendido', 'Denegado', 'Cancelado'],
  Vendido: ['Pagado', 'Cancelado'],
  Pagado: ['Enviado', 'Cancelado'],
  Enviado: ['Entregado'],
  Entregado: [],
  Denegado: [],
  Cancelado: [],
};

// Estados que se pueden elegir desde el estado actual (incluye mantenerlo para editar datos)
export const estadosDisponibles = (estadoActual) => [estadoActual, ...(TRANSICIONES_ESTADO[estadoActual] || [])];

export const validarTransicion = (estadoActual, nuevoEstado) => {
  if (estadosDisponibles(estadoActual).includes(nuevoEstado)) return null;
  return `No se puede pasar de "${estadoActual}" a "${nuevoEstado}".`;
};

// REQ-F08-07: motivo obligatorio al denegar o cancelar
export const validarMotivo = (nuevoEstado, motivo) => {
  if ((nuevoEstado === 'Denegado' || nuevoEstado === 'Cancelado') && !motivo.trim()) return "Debes ingresar un motivo.";
  return null;
};

// REQ-F08-05 / REQ-F08-06: entrada del historial de cambios
// (serverTimestamp no se permite dentro de arrays, por eso la fecha es la del navegador del admin;
// la fecha del servidor queda en pedido.fechaActualizacion)
export const crearEntradaHistorial = (pedido, nuevoEstado, adminUser, motivo) => ({
  estadoAnterior: pedido.estado,
  estadoNuevo: nuevoEstado,
  fechaCambio: new Date().toISOString(),
  responsable: adminUser.nombre,
  responsableId: adminUser.uid,
  motivo: motivo || 'Gestión operativa',
});

export const filtrarPedidos = (pedidos, filtroEstado, busqueda) => {
  const termino = busqueda.toLowerCase();
  return pedidos.filter(p => {
    const coincideEstado = filtroEstado === 'Todos' || p.estado === filtroEstado;
    const coincideBusqueda = termino === '' || (p.codigo && p.codigo.toLowerCase().includes(termino)) || (p.clienteNombre && p.clienteNombre.toLowerCase().includes(termino)) || (p.negocio && p.negocio.toLowerCase().includes(termino));
    return coincideEstado && coincideBusqueda;
  });
};

// Motivo registrado por el admin al denegar o cancelar (último cambio hacia el estado actual)
export const motivoDelEstado = (pedido) => {
  if (pedido.estado !== 'Denegado' && pedido.estado !== 'Cancelado') return null;
  const cambio = [...(pedido.historial || [])].reverse().find(h => h.estadoNuevo === pedido.estado);
  return cambio?.motivo || null;
};

// Colores del estado en la vista del cliente
export const colorEstado = (estado) => {
  switch (estado) {
    case 'Pendiente': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'Vendido': return 'bg-teal-100 text-teal-800 border-teal-200';
    case 'Pagado': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'Enviado': return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'Entregado': return 'bg-green-100 text-green-800 border-green-200';
    case 'Cancelado': case 'Denegado': return 'bg-red-100 text-red-800 border-red-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};
