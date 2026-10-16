import { useState, useEffect } from 'react';
import { obtenerImagenesSitio, guardarImagenSitio, quitarImagenSitio } from './imagenesSitioService';
import { ESPACIOS_IMAGEN, maxCaracteresEspacio } from '../../shared/imagenesSitio';
import { comprimirImagenHasta } from '../../shared/utils/imagenes';

// Subida de las imágenes propias del portal desde el panel admin; carga cuando habilitado = true
export const useImagenesSitioAdmin = (habilitado) => {
  const [imagenesSitio, setImagenesSitio] = useState({});
  const [espacioSubiendo, setEspacioSubiendo] = useState(null);

  useEffect(() => {
    if (habilitado) obtenerImagenesSitio().then(setImagenesSitio).catch(error => console.error('Error al cargar imágenes del sitio:', error));
  }, [habilitado]);

  const subirImagenSitio = async (id, archivo) => {
    const espacio = ESPACIOS_IMAGEN.find(e => e.id === id);
    if (!archivo || !espacio) return;
    setEspacioSubiendo(id);
    try {
      const imagen = await comprimirImagenHasta(archivo, maxCaracteresEspacio(espacio));
      await guardarImagenSitio(espacio, imagen);
      setImagenesSitio(prev => ({ ...prev, [id]: imagen }));
    } catch (error) {
      console.error(error);
      alert(error.message || 'No se pudo subir la imagen.');
    } finally {
      setEspacioSubiendo(null);
    }
  };

  const quitarImagen = async (id) => {
    try {
      await quitarImagenSitio(ESPACIOS_IMAGEN.find(e => e.id === id));
      setImagenesSitio(prev => {
        const siguiente = { ...prev };
        delete siguiente[id];
        return siguiente;
      });
    } catch (error) {
      console.error(error);
      alert('No se pudo quitar la imagen.');
    }
  };

  return { imagenesSitio, espacioSubiendo, subirImagenSitio, quitarImagen };
};
