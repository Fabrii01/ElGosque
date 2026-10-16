import { useState, useEffect } from 'react';
import { obtenerPedidos } from './pedidosService';
import { filtrarPedidos } from './estadoPedido';

// Lista de pedidos del panel admin con filtros y paginación; carga cuando habilitado = true
export const usePedidosAdmin = (habilitado) => {
  const [pedidos, setPedidos] = useState([]);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);

  const [filtroEstado, setFiltroEstado] = useState('Todos');
  const [busquedaPedido, setBusquedaPedido] = useState('');
  const [pedidosVisibles, setPedidosVisibles] = useState(10);

  const cargarPedidos = () => obtenerPedidos().then(setPedidos);

  useEffect(() => {
    if (habilitado) obtenerPedidos().then(setPedidos);
  }, [habilitado]);

  const pedidosFiltrados = filtrarPedidos(pedidos, filtroEstado, busquedaPedido);
  const solicitudesPorConfirmar = pedidosFiltrados.filter(p => p.estado === 'Pendiente');
  const pedidosConfirmados = pedidosFiltrados.filter(p => p.estado !== 'Pendiente');

  const mostrarMas = () => setPedidosVisibles(prev => prev + 10);

  return {
    pedidos, cargarPedidos, pedidoSeleccionado, setPedidoSeleccionado,
    filtroEstado, setFiltroEstado, busquedaPedido, setBusquedaPedido,
    pedidosVisibles, mostrarMas, pedidosFiltrados, solicitudesPorConfirmar, pedidosConfirmados,
  };
};
