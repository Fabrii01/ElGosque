import { useState, useEffect } from 'react';
import { obtenerImagenesSitio } from './imagenesSitioService';
import { ESPACIOS_IMAGEN } from '../../shared/imagenesSitio';

// Devuelve srcImagen(id): la imagen subida desde el panel o, si no hay, el archivo de public/imagenes.
// Mientras carga devuelve null para no mostrar una imagen equivocada.
export const useImagenesSitio = () => {
  const [subidas, setSubidas] = useState(null);

  useEffect(() => {
    obtenerImagenesSitio()
      .then(setSubidas)
      .catch(error => { console.error('Error al cargar imágenes del sitio:', error); setSubidas({}); });
  }, []);

  const srcImagen = (id) => {
    if (subidas === null) return null;
    return subidas[id] || ESPACIOS_IMAGEN.find(e => e.id === id)?.archivo || null;
  };

  return { srcImagen, cargandoImagenes: subidas === null };
};
