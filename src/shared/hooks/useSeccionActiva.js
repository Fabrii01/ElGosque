import { useEffect, useState } from 'react';

// Devuelve el id de la sección que ocupa el centro de la pantalla (para resaltar el menú de secciones)
export const useSeccionActiva = (ids) => {
  const [activa, setActiva] = useState(ids[0] || null);
  const clave = ids.join('|');

  useEffect(() => {
    if (!('IntersectionObserver' in window)) return;
    const observador = new IntersectionObserver((entradas) => {
      const visible = entradas.find(e => e.isIntersecting);
      if (visible) setActiva(visible.target.id);
    }, { rootMargin: '-45% 0px -50% 0px' });
    clave.split('|').forEach(id => {
      const elemento = document.getElementById(id);
      if (elemento) observador.observe(elemento);
    });
    return () => observador.disconnect();
  }, [clave]);

  return activa;
};
