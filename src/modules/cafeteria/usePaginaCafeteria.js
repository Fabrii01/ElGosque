import { useState, useEffect } from 'react';
import { obtenerPreparacionesActivas, obtenerFotosCafeteria, obtenerVideosPreparacion, obtenerUbicacionCafeteria } from './cafeteriaService';
import { interpretarVideo } from './multimedia';

// Todo el contenido público de la página de la cafetería (cada parte falla de forma independiente)
export const usePaginaCafeteria = () => {
  const [datos, setDatos] = useState({ preparaciones: [], fotos: [], videos: [], ubicacion: null });
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      const [preparaciones, fotos, videos, ubicacion] = await Promise.allSettled([
        obtenerPreparacionesActivas(), obtenerFotosCafeteria(), obtenerVideosPreparacion(), obtenerUbicacionCafeteria(),
      ]);
      [preparaciones, fotos, videos, ubicacion].forEach(r => r.status === 'rejected' && console.error('Error al cargar la cafetería:', r.reason));
      const valor = (r, porDefecto) => (r.status === 'fulfilled' ? r.value : porDefecto);
      setDatos({
        preparaciones: valor(preparaciones, []),
        fotos: valor(fotos, []),
        // Solo se muestran videos con enlaces válidos
        videos: valor(videos, []).filter(v => interpretarVideo(v.url)),
        ubicacion: valor(ubicacion, null),
      });
      setCargando(false);
    };
    cargar();
  }, []);

  return { ...datos, cargando };
};
