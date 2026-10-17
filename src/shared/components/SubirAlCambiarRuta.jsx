import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Al cambiar de página, empieza desde arriba (React Router conserva el desplazamiento anterior).
// Si la ruta trae #ancla, la baja useDesplazarAAncla en la página de destino.
const SubirAlCambiarRuta = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
};

export default SubirAlCambiarRuta;
