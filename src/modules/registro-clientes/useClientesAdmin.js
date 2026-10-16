import { useState, useEffect, useMemo } from 'react';
import { obtenerClientes } from './clientesService';
import { resumirClientes, filtrarClientes } from './clientes';
import { calcularDetalleCliente } from './detalleCliente';

// Clientes registrados con su actividad comercial; carga cuando habilitado = true
export const useClientesAdmin = (habilitado, pedidos) => {
  const [clientes, setClientes] = useState([]);
  const [busquedaCliente, setBusquedaCliente] = useState('');
  const [clienteSeleccionadoId, setClienteSeleccionadoId] = useState(null);

  useEffect(() => {
    if (habilitado) obtenerClientes().then(setClientes).catch(error => console.error('Error al cargar clientes:', error));
  }, [habilitado]);

  const clientesResumidos = useMemo(
    () => resumirClientes(clientes, pedidos).sort((a, b) => b.totalComprado - a.totalComprado),
    [clientes, pedidos]
  );

  // El detalle se recalcula si cambian los pedidos (p. ej. tras actualizar uno desde la ficha)
  const clienteSeleccionado = clientesResumidos.find(c => c.uid === clienteSeleccionadoId) || null;
  const detalleCliente = useMemo(
    () => (clienteSeleccionado ? calcularDetalleCliente(clienteSeleccionado, pedidos) : null),
    [clienteSeleccionado, pedidos]
  );

  return {
    clientes,
    clientesResumidos,
    clientesFiltrados: filtrarClientes(clientesResumidos, busquedaCliente),
    busquedaCliente,
    setBusquedaCliente,
    clienteSeleccionado,
    detalleCliente,
    verDetalleCliente: (cliente) => setClienteSeleccionadoId(cliente.uid),
    cerrarDetalleCliente: () => setClienteSeleccionadoId(null),
  };
};
