import { useState, useEffect } from 'react';
import {
  obtenerPreparaciones, crearPreparacion, actualizarPreparacion, cambiarEstadoPreparacion,
  obtenerFotosCafeteria, guardarFotosCafeteria,
} from './cafeteriaService';
import { MAX_FOTOS_LOCAL } from './carta';
import { comprimirImagen, comprimirImagenHasta } from '../../shared/utils/imagenes';

const estadoInicialPreparacion = { nombre: '', categoria: '', descripcion: '', precio: '', imagenUrl: '' };
// Todas las fotos viven en un documento (máx. 1 MB, el base64 ocupa ~33 % más que la imagen)
const MAX_CARACTERES_DOCUMENTO = 950000;
const MAX_CARACTERES_FOTO = Math.floor(MAX_CARACTERES_DOCUMENTO / MAX_FOTOS_LOCAL);

// Carta y fotos de la cafetería en el panel admin; carga cuando habilitado = true
export const useCafeteriaAdmin = (habilitado) => {
  const [preparaciones, setPreparaciones] = useState([]);
  const [nuevaPreparacion, setNuevaPreparacion] = useState(estadoInicialPreparacion);
  const [idEdicion, setIdEdicion] = useState(null);
  const [imagenArchivo, setImagenArchivo] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [fotos, setFotos] = useState([]);
  const [subiendoFoto, setSubiendoFoto] = useState(false);

  const cargarPreparaciones = () => obtenerPreparaciones().then(setPreparaciones);

  useEffect(() => {
    if (!habilitado) return;
    obtenerPreparaciones().then(setPreparaciones);
    obtenerFotosCafeteria().then(setFotos);
  }, [habilitado]);

  const guardarPreparacion = async (e) => {
    e.preventDefault();
    setGuardando(true);
    try {
      let imagenUrl = nuevaPreparacion.imagenUrl || '';
      if (imagenArchivo) imagenUrl = await comprimirImagen(imagenArchivo, { maxLado: 800 });
      const datos = {
        nombre: nuevaPreparacion.nombre.trim(),
        categoria: nuevaPreparacion.categoria.trim(),
        descripcion: nuevaPreparacion.descripcion.trim(),
        precio: parseFloat(nuevaPreparacion.precio) || 0,
        imagenUrl,
      };
      if (idEdicion) await actualizarPreparacion(idEdicion, datos);
      else await crearPreparacion(datos);
      cancelarEdicion();
      cargarPreparaciones();
    } catch (error) {
      console.error(error);
      alert(error.message || 'Error al guardar la preparación');
    } finally {
      setGuardando(false);
    }
  };

  const editarPreparacion = (p) => {
    setIdEdicion(p.id);
    setNuevaPreparacion({ nombre: p.nombre, categoria: p.categoria || '', descripcion: p.descripcion || '', precio: p.precio ?? '', imagenUrl: p.imagenUrl || '' });
    setImagenArchivo(null);
  };
  const cancelarEdicion = () => { setIdEdicion(null); setNuevaPreparacion(estadoInicialPreparacion); setImagenArchivo(null); };
  const toggleActivo = async (id, estadoActual) => { await cambiarEstadoPreparacion(id, estadoActual); cargarPreparaciones(); };

  const agregarFoto = async (archivo) => {
    if (!archivo) return;
    if (fotos.length >= MAX_FOTOS_LOCAL) return alert(`Máximo ${MAX_FOTOS_LOCAL} fotos del local.`);
    setSubiendoFoto(true);
    try {
      const nuevas = [...fotos, await comprimirImagenHasta(archivo, MAX_CARACTERES_FOTO)];
      await guardarFotosCafeteria(nuevas);
      setFotos(nuevas);
    } catch (error) {
      console.error(error);
      alert(error.message || 'No se pudo subir la foto');
    } finally {
      setSubiendoFoto(false);
    }
  };

  const eliminarFoto = async (indice) => {
    const nuevas = fotos.filter((_, i) => i !== indice);
    await guardarFotosCafeteria(nuevas);
    setFotos(nuevas);
  };

  return {
    preparaciones, nuevaPreparacion, setNuevaPreparacion, idEdicion, imagenArchivo, setImagenArchivo, guardando,
    guardarPreparacion, editarPreparacion, cancelarEdicion, toggleActivo,
    fotos, subiendoFoto, agregarFoto, eliminarFoto,
  };
};
