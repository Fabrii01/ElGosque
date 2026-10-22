import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registrarSolicitud, generarCodigoSolicitud } from './solicitudService';
import { construirMensajeWhatsApp, abrirWhatsApp } from './whatsapp';
import { crearSolicitud, crearItemSolicitud } from './solicitud';
import { leerCarritos, guardarCarritos, crearItemCarrito } from './carritoStorage';

// Estado del carrito y del flujo de solicitud de pedido (REQ-F05, REQ-F06)
export const useSolicitudPedido = (userData, { productos: catalogo, cargando: cargandoCatalogo }) => {
  const navigate = useNavigate();

  // Carritos guardados por usuario: { [uid]: items[] }. Se persisten al modificarse.
  const [carritos, setCarritos] = useState(leerCarritos);
  const carritoGuardado = (userData && carritos[userData.uid]) || [];

  // Sincroniza con el catálogo vigente: precio y peso actuales, sin productos desactivados
  const carrito = cargandoCatalogo ? carritoGuardado : carritoGuardado.flatMap(item => {
    const producto = catalogo.find(p => p.id === item.id);
    return producto ? [{ ...item, nombre: producto.nombre, tipo: producto.tipo, precioReferencial: producto.precioReferencial, pesoElegido: producto.peso }] : [];
  });
  const productosRetirados = carritoGuardado.length - carrito.length;
  const setCarrito = (items) => {
    const nuevos = { ...carritos, [userData.uid]: items };
    if (items.length === 0) delete nuevos[userData.uid];
    setCarritos(nuevos);
    guardarCarritos(nuevos);
  };

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [productoConfig, setProductoConfig] = useState(null);
  const [pedidoConfirmado, setPedidoConfirmado] = useState(null);

  // Los datos de contacto parten del perfil del cliente; lo que edite el usuario tiene prioridad
  const [datosEditados, setDatosEditados] = useState({});
  const datosPedido = {
    telefono: userData?.telefono || '',
    ciudad: userData?.ciudad || '',
    negocio: userData?.negocio || '',
    ...datosEditados,
  };
  const actualizarDatoPedido = (campo, valor) => setDatosEditados(prev => ({ ...prev, [campo]: valor }));

  const abrirConfigurador = (producto) => {
    if (!userData) return navigate('/login');
    setProductoConfig({ ...producto, cantidad: 1, pesoElegido: producto.peso, presentacionElegida: producto.presentacion });
  };

  const agregarAlCarrito = (e) => {
    e.preventDefault();
    setCarrito([...carrito, crearItemCarrito(productoConfig)]);
    setProductoConfig(null);
    setIsCartOpen(true);
  };

  const eliminarDelCarrito = (index) => {
    const nuevoCarrito = [...carrito];
    nuevoCarrito.splice(index, 1);
    setCarrito(nuevoCarrito);
  };

  const calcularTotal = () => {
    return carrito.reduce((sum, item) => sum + (parseFloat(item.precioReferencial) * item.cantidad), 0);
  };

  const procesarPedido = async (e) => {
    e.preventDefault();
    if (carrito.length === 0) return;

    const nuevoPedido = crearSolicitud({
      codigo: generarCodigoSolicitud(),
      userData,
      contacto: datosPedido,
      productos: carrito.map(item => crearItemSolicitud(item, item.cantidad, item.presentacionElegida, item.pesoElegido)),
    });

    try {
      await registrarSolicitud(nuevoPedido);
      setPedidoConfirmado(nuevoPedido);
      setCarrito([]);
    } catch (error) {
      console.error("Error al registrar pedido: ", error);
    }
  };

  const enviarWhatsApp = () => {
    if (!pedidoConfirmado) return;
    abrirWhatsApp(construirMensajeWhatsApp(pedidoConfirmado));
    setIsCartOpen(false);
    setPedidoConfirmado(null);
  };

  const cerrarCarrito = () => { setIsCartOpen(false); setPedidoConfirmado(null); };

  return {
    carrito, productosRetirados, isCartOpen, setIsCartOpen, cerrarCarrito,
    productoConfig, setProductoConfig, pedidoConfirmado,
    datosPedido, actualizarDatoPedido,
    abrirConfigurador, agregarAlCarrito, eliminarDelCarrito, calcularTotal, procesarPedido, enviarWhatsApp,
  };
};
