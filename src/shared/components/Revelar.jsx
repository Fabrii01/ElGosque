import { useEffect, useRef, useState } from 'react';

// Si el usuario pidió reducir movimiento (o el navegador no soporta IntersectionObserver), se muestra sin animar
const mostrarSinAnimacion = () =>
  typeof window === 'undefined'
  || !('IntersectionObserver' in window)
  || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

// Hace aparecer su contenido (desvanecido + desplazamiento hacia arriba) al entrar en pantalla
const Revelar = ({ children, retraso = 0, className = '', como: Etiqueta = 'div' }) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(mostrarSinAnimacion);

  useEffect(() => {
    if (visible || !ref.current) return;
    const observador = new IntersectionObserver(([entrada]) => {
      if (entrada.isIntersecting) {
        setVisible(true);
        observador.disconnect();
      }
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    observador.observe(ref.current);
    return () => observador.disconnect();
  }, [visible]);

  return (
    <Etiqueta
      ref={ref}
      style={{ transitionDelay: visible ? `${retraso}ms` : '0ms' }}
      className={`transition-all duration-700 ease-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`}
    >
      {children}
    </Etiqueta>
  );
};

export default Revelar;
