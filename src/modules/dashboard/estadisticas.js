// MOTOR DE BUSINESS INTELLIGENCE (REQ-F11). Funciones puras: reciben pedidos y devuelven métricas.
// Las fechas son las de registro de la solicitud (pedido.fecha).
import { ESTADOS_PEDIDO, ESTADOS_VENTA_CONCRETADA } from '../../shared/constants';
import { aFecha } from '../../shared/utils/fechas';
import { tienePagoRegistrado } from '../pagos/pago';
import { tieneDatosEnvio } from '../envios/envio';
import { clienteCompleto } from '../registro-clientes/clientes';

const DIA = 24 * 60 * 60 * 1000;
const MAX_CATEGORIAS = 8; // más categorías se agrupan en "Otros"

export const META_RESPALDO_PEDIDOS = 0.9;
export const META_INTEGRIDAD = 0.9;

// ---------- Periodos ----------

export const PERIODOS_PREDEFINIDOS = [
  { valor: 'todo', etiqueta: 'Todo el historial' },
  { valor: '30d', etiqueta: 'Últimos 30 días' },
  { valor: '90d', etiqueta: 'Últimos 90 días' },
  { valor: 'anio', etiqueta: 'Este año' },
  { valor: 'rango', etiqueta: 'Rango personalizado' },
];

const inicioDelDia = (f) => new Date(f.getFullYear(), f.getMonth(), f.getDate());
const finDelDia = (f) => new Date(f.getFullYear(), f.getMonth(), f.getDate(), 23, 59, 59, 999);
const leerFechaInput = (texto) => { const [a, m, d] = texto.split('-').map(Number); return new Date(a, m - 1, d); };
const claveMes = (f) => `${f.getFullYear()}-${String(f.getMonth() + 1).padStart(2, '0')}`;
const etiquetaMesCorta = (f) => f.toLocaleString('es-PE', { month: 'short', year: '2-digit' });
const etiquetaMesLarga = (f) => f.toLocaleString('es-PE', { month: 'long', year: 'numeric' });

// Meses con actividad, del más reciente al más antiguo, como opciones "mes:AAAA-MM"
export const obtenerMesesDisponibles = (pedidos) => {
  const meses = {};
  pedidos.forEach(p => { if (p.fecha) { const f = aFecha(p.fecha); meses[claveMes(f)] = etiquetaMesLarga(f); } });
  return Object.entries(meses)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([clave, etiqueta]) => ({ valor: `mes:${clave}`, etiqueta }));
};

// Convierte el periodo elegido en { desde, hasta, anterior } (anterior = mismo largo justo antes)
export const resolverRango = (periodo, personalizado = {}, ahora = new Date()) => {
  if (periodo === '30d' || periodo === '90d') {
    const dias = periodo === '30d' ? 30 : 90;
    const desde = inicioDelDia(new Date(ahora.getTime() - (dias - 1) * DIA));
    return { desde, hasta: finDelDia(ahora), anterior: { desde: new Date(desde.getTime() - dias * DIA), hasta: new Date(desde.getTime() - 1) } };
  }
  if (periodo === 'anio') {
    const anio = ahora.getFullYear();
    return {
      desde: new Date(anio, 0, 1), hasta: finDelDia(ahora),
      anterior: { desde: new Date(anio - 1, 0, 1), hasta: finDelDia(new Date(anio - 1, ahora.getMonth(), ahora.getDate())) },
    };
  }
  if (periodo.startsWith('mes:')) {
    const [a, m] = periodo.slice(4).split('-').map(Number);
    return {
      desde: new Date(a, m - 1, 1), hasta: new Date(a, m, 0, 23, 59, 59, 999),
      anterior: { desde: new Date(a, m - 2, 1), hasta: new Date(a, m - 1, 0, 23, 59, 59, 999) },
    };
  }
  if (periodo === 'rango' && personalizado.desde && personalizado.hasta) {
    let desde = leerFechaInput(personalizado.desde);
    let hasta = leerFechaInput(personalizado.hasta);
    if (desde > hasta) [desde, hasta] = [hasta, desde];
    hasta = finDelDia(hasta);
    const duracion = hasta.getTime() - desde.getTime() + 1;
    return { desde, hasta, anterior: { desde: new Date(desde.getTime() - duracion), hasta: new Date(desde.getTime() - 1) } };
  }
  return { desde: null, hasta: null, anterior: null };
};

export const filtrarPorRango = (pedidos, rango) => {
  if (!rango?.desde || !rango?.hasta) return pedidos;
  return pedidos.filter(p => {
    if (!p.fecha) return false;
    const f = aFecha(p.fecha);
    return f >= rango.desde && f <= rango.hasta;
  });
};

// ---------- Utilidades ----------

const esVenta = (p) => ESTADOS_VENTA_CONCRETADA.includes(p.estado);
const unidadesDe = (p) => (p.productos || []).reduce((sum, i) => sum + (Number(i.cantidad) || 0), 0);
const proporcion = (parte, base) => (base > 0 ? parte / base : null);

// Agrupa en { nombre, ingresos, pedidos }, ordena por ingresos y junta la cola en "Otros"
const agruparVentas = (ventas, obtenerNombre, limite = MAX_CATEGORIAS) => {
  const grupos = {};
  ventas.forEach(p => {
    const nombre = obtenerNombre(p);
    grupos[nombre] ||= { nombre, ingresos: 0, pedidos: 0 };
    grupos[nombre].ingresos += p.total || 0;
    grupos[nombre].pedidos += 1;
  });
  const lista = Object.values(grupos).sort((a, b) => b.ingresos - a.ingresos);
  if (lista.length <= limite) return lista;
  const cola = lista.slice(limite - 1);
  return [...lista.slice(0, limite - 1), {
    nombre: `Otros (${cola.length})`,
    ingresos: cola.reduce((s, g) => s + g.ingresos, 0),
    pedidos: cola.reduce((s, g) => s + g.pedidos, 0),
  }];
};

export const variacion = (actual, anterior) => (anterior > 0 ? (actual - anterior) / anterior : null);

// ---------- Métricas ----------

export const calcularKpis = (pedidos) => {
  const ventas = pedidos.filter(esVenta);
  const ingresos = ventas.reduce((sum, p) => sum + (p.total || 0), 0);
  return {
    ingresos,
    pedidosConcretados: ventas.length,
    ticketPromedio: ventas.length ? ingresos / ventas.length : 0,
    unidades: ventas.reduce((sum, p) => sum + unidadesDe(p), 0),
    clientesCompradores: new Set(ventas.map(p => p.clienteId)).size,
    solicitudes: pedidos.length,
    tasaConversion: proporcion(ventas.length, pedidos.length),
  };
};

// REQ-F11-01/02: serie mensual continua (los meses sin ventas aparecen en cero)
export const calcularIngresosPorMes = (pedidos, rango) => {
  const ventas = pedidos.filter(esVenta).filter(p => p.fecha);
  const fechas = ventas.map(p => aFecha(p.fecha));
  const inicio = rango?.desde || (fechas.length ? new Date(Math.min(...fechas)) : null);
  const fin = rango?.hasta || (fechas.length ? new Date(Math.max(...fechas)) : null);
  if (!inicio || !fin) return [];

  const meses = [];
  for (let f = new Date(inicio.getFullYear(), inicio.getMonth(), 1); f <= fin && meses.length < 60; f = new Date(f.getFullYear(), f.getMonth() + 1, 1)) {
    meses.push({ clave: claveMes(f), mes: etiquetaMesCorta(f), mesLargo: etiquetaMesLarga(f), ingresos: 0, pedidos: 0 });
  }
  const porClave = Object.fromEntries(meses.map(m => [m.clave, m]));
  ventas.forEach(p => {
    const mes = porClave[claveMes(aFecha(p.fecha))];
    if (mes) { mes.ingresos += p.total || 0; mes.pedidos += 1; }
  });
  return meses;
};

// Cantidad de solicitudes/pedidos en cada estado del flujo
export const calcularEmbudoEstados = (pedidos) => ESTADOS_PEDIDO.map(estado => ({
  nombre: estado,
  valor: pedidos.filter(p => (p.estado || 'Pendiente') === estado).length,
}));

// REQ-F11-05: unidades solicitadas (todas) frente a vendidas (concretadas) por variedad
export const calcularVariedades = (pedidos) => {
  const variedades = {};
  pedidos.forEach(p => (p.productos || []).forEach(item => {
    const nombre = item.nombre || 'Sin nombre';
    variedades[nombre] ||= { nombre, solicitadas: 0, vendidas: 0 };
    const cantidad = Number(item.cantidad) || 0;
    variedades[nombre].solicitadas += cantidad;
    if (esVenta(p)) variedades[nombre].vendidas += cantidad;
  }));
  return Object.values(variedades).sort((a, b) => b.solicitadas - a.solicitadas);
};

// REQ-F11-04: unidades vendidas en grano frente a molido
export const calcularPresentaciones = (pedidos) => {
  const resultado = { enGrano: 0, molido: 0 };
  pedidos.filter(esVenta).forEach(p => (p.productos || []).forEach(item => {
    const cantidad = Number(item.cantidad) || 0;
    if (item.presentacion === 'Molido') resultado.molido += cantidad;
    else resultado.enGrano += cantidad;
  }));
  return resultado;
};

// REQ-F11-07: ventas en soles por ciudad y por modalidad de entrega
export const calcularVentasPorCiudad = (pedidos) => agruparVentas(pedidos.filter(esVenta), p => p.ciudad?.trim() || 'No especificada');
export const calcularVentasPorModalidad = (pedidos) => agruparVentas(pedidos.filter(esVenta), p => p.datosEnvio?.modalidad || 'Sin registrar');

// REQ-F11-03: ranking de clientes (agrupado por clienteId, no por nombre)
export const calcularTopClientes = (pedidos, limite = 10) => {
  const clientes = {};
  pedidos.filter(esVenta).forEach(p => {
    const id = p.clienteId || p.clienteNombre;
    clientes[id] ||= { clienteId: id, nombre: p.clienteNombre || 'Desconocido', negocio: p.negocio || '', ingresos: 0, unidades: 0, pedidos: 0 };
    clientes[id].ingresos += p.total || 0;
    clientes[id].unidades += unidadesDe(p);
    clientes[id].pedidos += 1;
  });
  return Object.values(clientes).sort((a, b) => b.ingresos - a.ingresos).slice(0, limite);
};

// REQ-F11-06: cantidades vendidas por cliente y producto
export const calcularClienteProducto = (pedidos) => {
  const filas = {};
  pedidos.filter(esVenta).forEach(p => (p.productos || []).forEach(item => {
    const clave = `${p.clienteId}|${item.nombre}|${item.presentacion || ''}`;
    filas[clave] ||= { cliente: p.clienteNombre || 'Desconocido', negocio: p.negocio || '', producto: item.nombre, presentacion: item.presentacion || '', unidades: 0, ingresos: 0 };
    filas[clave].unidades += Number(item.cantidad) || 0;
    filas[clave].ingresos += Number(item.subtotal) || 0;
  }));
  return Object.values(filas).sort((a, b) => a.cliente.localeCompare(b.cliente, 'es') || b.ingresos - a.ingresos);
};

// Origen de las solicitudes: web (carrito) frente al asistente IA
export const calcularCanales = (pedidos) => {
  const ia = pedidos.filter(p => p.origen === 'Asistente IA').length;
  return { web: pedidos.length - ia, ia };
};

// ---------- Indicadores de la tesis (metas a evaluar, no resultados) ----------

export const calcularIndicadores = (pedidos, clientes) => {
  const ventas = pedidos.filter(esVenta);
  const conRespaldo = ventas.filter(p =>
    tienePagoRegistrado(p.datosPago) && (p.datosPago.constancia || p.datosPago.nroOperacion) && tieneDatosEnvio(p.datosEnvio)
  );
  const pedidosIntegros = pedidos.filter(p =>
    p.telefono && p.ciudad && p.negocio && p.productos?.length > 0 && p.productos.every(i => Number(i.cantidad) > 0)
  );
  return {
    respaldoPedidos: { valor: proporcion(conRespaldo.length, ventas.length), cumplen: conRespaldo.length, base: ventas.length, meta: META_RESPALDO_PEDIDOS },
    integridadClientes: { valor: proporcion(clientes.filter(clienteCompleto).length, clientes.length), cumplen: clientes.filter(clienteCompleto).length, base: clientes.length, meta: META_INTEGRIDAD },
    integridadPedidos: { valor: proporcion(pedidosIntegros.length, pedidos.length), cumplen: pedidosIntegros.length, base: pedidos.length, meta: META_INTEGRIDAD },
  };
};

// Todo el tablero para un periodo
export const calcularTablero = (pedidos, clientes, rango) => {
  const delPeriodo = filtrarPorRango(pedidos, rango);
  return {
    hayDatos: delPeriodo.length > 0,
    kpis: calcularKpis(delPeriodo),
    kpisAnteriores: rango?.anterior ? calcularKpis(filtrarPorRango(pedidos, rango.anterior)) : null,
    ingresosPorMes: calcularIngresosPorMes(delPeriodo, rango?.desde ? rango : null),
    embudo: calcularEmbudoEstados(delPeriodo),
    variedades: calcularVariedades(delPeriodo),
    presentaciones: calcularPresentaciones(delPeriodo),
    ciudades: calcularVentasPorCiudad(delPeriodo),
    modalidades: calcularVentasPorModalidad(delPeriodo),
    topClientes: calcularTopClientes(delPeriodo),
    clienteProducto: calcularClienteProducto(delPeriodo),
    canales: calcularCanales(delPeriodo),
    indicadores: calcularIndicadores(delPeriodo, clientes),
    pedidosDelPeriodo: delPeriodo,
  };
};
