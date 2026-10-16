import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Al llegar a una ruta con #ancla (p. ej. "/#catalogo"), baja hasta esa sección cuando el contenido está listo
export const useDesplazarAAncla = (listo = true) => {
  const { hash } = useLocation();

  useEffect(() => {
    if (!listo || !hash) return;
    document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView({ block: 'start' });
  }, [listo, hash]);
};
