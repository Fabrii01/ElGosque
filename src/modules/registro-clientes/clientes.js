import { ESTADOS_VENTA_CONCRETADA } from '../../shared/constants';

export const CAMPOS_OBLIGATORIOS_CLIENTE = ['nombre', 'negocio', 'ciudad', 'telefono', 'email'];

// Un cliente tiene datos completos si todos los campos de REQ-F02-01 tienen valor
export const clienteCompleto = (cliente) => CAMPOS_OBLIGATORIOS_CLIENTE.every(campo => String(cliente[campo] || '').trim() !== '');

// Agrega a cada cliente su actividad comercial calculada desde los pedidos
export const resumirClientes = (clientes, pedidos) => clientes.map(cliente => {
  const propios = pedidos.filter(p => p.clienteId === cliente.uid);
  const concretados = propios.filter(p => ESTADOS_VENTA_CONCRETADA.includes(p.estado));
  const ultimaFecha = propios.reduce((max, p) => Math.max(max, p.fecha?.seconds || 0), 0);
  return {
    ...cliente,
    solicitudes: propios.length,
    pedidosConcretados: concretados.length,
    totalComprado: concretados.reduce((sum, p) => sum + (p.total || 0), 0),
    ultimaActividad: ultimaFecha ? { seconds: ultimaFecha } : null,
    datosCompletos: clienteCompleto(cliente),
  };
});

export const filtrarClientes = (clientes, busqueda) => {
  const termino = busqueda.trim().toLowerCase();
  if (!termino) return clientes;
  return clientes.filter(c => ['nombre', 'negocio', 'ciudad', 'telefono', 'email'].some(campo => String(c[campo] || '').toLowerCase().includes(termino)));
};
