import { useState, useEffect } from 'react';
import { obtenerProductos, crearProducto, actualizarProducto, cambiarEstadoProducto, eliminarProducto } from './productosService';
import { comprimirImagen } from '../../shared/utils/imagenes';

const estadoInicialProducto = { nombre: 'Gourmet', descripcion: '', tipo: 'Tostado', presentacion: 'En grano', peso: '1 kg', precioReferencial: '' };

// Estado y acciones del CRUD de catálogo del panel admin; carga cuando habilitado = true
export const useCatalogoAdmin = (habilitado) => {
  const [productos, setProductos] = useState([]);
  const [nuevoProducto, setNuevoProducto] = useState(estadoInicialProducto);
  const [idEdicion, setIdEdicion] = useState(null);
  const [imagenArchivo, setImagenArchivo] = useState(null);
  const [subiendoImg, setSubiendoImg] = useState(false);
  const [productoAEliminar, setProductoAEliminar] = useState(null);
  const [eliminando, setEliminando] = useState(false);

  const cargarProductos = () => obtenerProductos().then(setProductos);

  useEffect(() => {
    if (habilitado) obtenerProductos().then(setProductos);
  }, [habilitado]);

  const guardarProducto = async (e) => {
    e.preventDefault();
    setSubiendoImg(true);
    try {
      let urlImagen = nuevoProducto.imagenUrl || "";
      // Se redimensiona y comprime en el navegador (fotos de celular de varios MB funcionan)
      if (imagenArchivo) urlImagen = await comprimirImagen(imagenArchivo, { maxLado: 900 });
      const datosFinales = { ...nuevoProducto, imagenUrl: urlImagen };
      if (idEdicion) { await actualizarProducto(idEdicion, datosFinales); setIdEdicion(null); }
      else { await crearProducto(datosFinales); }
      setNuevoProducto(estadoInicialProducto); setImagenArchivo(null); cargarProductos();
    } catch (error) { console.error(error); alert(error.message || "Error al guardar producto"); }
    finally { setSubiendoImg(false); }
  };

  const editarProducto = (producto) => { setIdEdicion(producto.id); setNuevoProducto(producto); };
  const cancelarEdicion = () => { setIdEdicion(null); setNuevoProducto(estadoInicialProducto); setImagenArchivo(null); };
  const toggleActivo = async (id, estadoActual) => { await cambiarEstadoProducto(id, estadoActual); cargarProductos(); };

  // Eliminación definitiva: se pide confirmación en un modal antes de borrar
  const confirmarEliminacion = async () => {
    if (!productoAEliminar) return;
    setEliminando(true);
    try {
      await eliminarProducto(productoAEliminar.id);
      if (idEdicion === productoAEliminar.id) cancelarEdicion();
      setProductoAEliminar(null);
      cargarProductos();
    } catch (error) {
      console.error(error);
      alert('No se pudo eliminar el producto. Verifica que las reglas de Firestore estén publicadas.');
    } finally {
      setEliminando(false);
    }
  };

  return {
    productos, nuevoProducto, setNuevoProducto, idEdicion, imagenArchivo, setImagenArchivo, subiendoImg,
    guardarProducto, editarProducto, cancelarEdicion, toggleActivo,
    productoAEliminar, setProductoAEliminar, eliminando, confirmarEliminacion,
  };
};
