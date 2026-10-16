import { useState, useMemo } from 'react';
import { calcularTablero, obtenerMesesDisponibles, resolverRango, PERIODOS_PREDEFINIDOS } from './estadisticas';
import { COLUMNAS_PEDIDOS, COLUMNAS_CLIENTE_PRODUCTO } from './reportes';
import { generarCSV, descargarCSV } from '../../shared/utils/csv';

const hoyISO = () => new Date().toISOString().slice(0, 10);

export const useDashboardBI = (pedidos, clientes) => {
  const [periodo, setPeriodo] = useState('todo');
  const [rangoPersonalizado, setRangoPersonalizado] = useState({ desde: '', hasta: '' });

  const opcionesPeriodo = useMemo(() => [...PERIODOS_PREDEFINIDOS, ...obtenerMesesDisponibles(pedidos)], [pedidos]);
  const rango = useMemo(() => resolverRango(periodo, rangoPersonalizado), [periodo, rangoPersonalizado]);
  const tablero = useMemo(() => calcularTablero(pedidos, clientes, rango), [pedidos, clientes, rango]);

  const etiquetaPeriodo = opcionesPeriodo.find(o => o.valor === periodo)?.etiqueta || '';

  const exportarPedidos = () => descargarCSV(`pedidos_${periodo.replace(':', '-')}_${hoyISO()}.csv`, generarCSV(tablero.pedidosDelPeriodo, COLUMNAS_PEDIDOS));
  const exportarClienteProducto = () => descargarCSV(`ventas_cliente_producto_${periodo.replace(':', '-')}_${hoyISO()}.csv`, generarCSV(tablero.clienteProducto, COLUMNAS_CLIENTE_PRODUCTO));

  return {
    periodo, setPeriodo, rangoPersonalizado, setRangoPersonalizado, opcionesPeriodo, etiquetaPeriodo,
    tablero, exportarPedidos, exportarClienteProducto,
  };
};
