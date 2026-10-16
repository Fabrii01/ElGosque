// Columnas de los reportes exportables del dashboard
import { aFecha } from '../../shared/utils/fechas';

const fechaTexto = (timestamp) => (timestamp ? aFecha(timestamp).toLocaleString('es-PE') : '');
const dosDecimales = (n) => (Number(n) || 0).toFixed(2);

export const COLUMNAS_PEDIDOS = [
  { titulo: 'Código', valor: p => p.codigo },
  { titulo: 'Fecha de registro', valor: p => fechaTexto(p.fecha) },
  { titulo: 'Estado', valor: p => p.estado },
  { titulo: 'Origen', valor: p => p.origen || 'Web' },
  { titulo: 'Cliente', valor: p => p.clienteNombre },
  { titulo: 'Negocio', valor: p => p.negocio },
  { titulo: 'Ciudad', valor: p => p.ciudad },
  { titulo: 'Teléfono', valor: p => p.telefono },
  { titulo: 'Frecuencia', valor: p => p.frecuencia },
  { titulo: 'Productos', valor: p => (p.productos || []).map(i => `${i.cantidad}x ${i.nombre} (${[i.presentacion, i.peso].filter(Boolean).join(', ')})`).join(' | ') },
  { titulo: 'Unidades', valor: p => (p.productos || []).reduce((s, i) => s + (Number(i.cantidad) || 0), 0) },
  { titulo: 'Total (S/)', valor: p => dosDecimales(p.total) },
  { titulo: 'Medio de pago', valor: p => p.datosPago?.metodo },
  { titulo: 'Monto pagado (S/)', valor: p => (p.datosPago?.monto ? dosDecimales(p.datosPago.monto) : '') },
  { titulo: 'Fecha de pago', valor: p => p.datosPago?.fecha },
  { titulo: 'Nro. operación', valor: p => p.datosPago?.nroOperacion },
  { titulo: 'Constancia', valor: p => p.datosPago?.constancia },
  { titulo: 'Modalidad de entrega', valor: p => p.datosEnvio?.modalidad },
  { titulo: 'Agencia', valor: p => p.datosEnvio?.agencia },
  { titulo: 'Nro. guía', valor: p => p.datosEnvio?.numeroGuia },
  { titulo: 'Fecha de envío', valor: p => p.datosEnvio?.fechaEnvio },
];

export const COLUMNAS_CLIENTE_PRODUCTO = [
  { titulo: 'Cliente', valor: f => f.cliente },
  { titulo: 'Negocio', valor: f => f.negocio },
  { titulo: 'Producto', valor: f => f.producto },
  { titulo: 'Presentación', valor: f => f.presentacion },
  { titulo: 'Unidades vendidas', valor: f => f.unidades },
  { titulo: 'Ingresos (S/)', valor: f => dosDecimales(f.ingresos) },
];
