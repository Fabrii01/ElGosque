import { useEffect } from 'react';

// Visor de fotos a pantalla completa: flechas, teclado (← → Esc) y contador
const VisorGaleria = ({ fotos, indice, onCambiar, onCerrar }) => {
  const anterior = () => onCambiar((indice - 1 + fotos.length) % fotos.length);
  const siguiente = () => onCambiar((indice + 1) % fotos.length);

  useEffect(() => {
    const alPresionar = (e) => {
      if (e.key === 'Escape') onCerrar();
      if (e.key === 'ArrowLeft') onCambiar((indice - 1 + fotos.length) % fotos.length);
      if (e.key === 'ArrowRight') onCambiar((indice + 1) % fotos.length);
    };
    window.addEventListener('keydown', alPresionar);
    // Evita que la página de fondo se desplace mientras el visor está abierto
    const desbordeAnterior = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', alPresionar);
      document.body.style.overflow = desbordeAnterior;
    };
  }, [indice, fotos.length, onCambiar, onCerrar]);

  return (
    <div className="fixed inset-0 z-[80] bg-black/95 flex items-center justify-center animacion-aparecer" role="dialog" aria-modal="true" aria-label="Galería de fotos" onClick={onCerrar}>
      <img
        src={fotos[indice]}
        alt={`Foto ${indice + 1} de ${fotos.length} del local`}
        className="max-w-[92vw] max-h-[82vh] object-contain rounded-lg shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      />

      <button onClick={onCerrar} className="absolute top-4 right-4 text-white/80 hover:text-white text-3xl font-light w-12 h-12" aria-label="Cerrar galería">✕</button>
      <p className="absolute top-6 left-1/2 -translate-x-1/2 text-white/70 text-sm font-medium tabular-nums">{indice + 1} / {fotos.length}</p>

      {fotos.length > 1 && (
        <>
          <button onClick={(e) => { e.stopPropagation(); anterior(); }} className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 text-white text-2xl" aria-label="Foto anterior">‹</button>
          <button onClick={(e) => { e.stopPropagation(); siguiente(); }} className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 text-white text-2xl" aria-label="Foto siguiente">›</button>
        </>
      )}
    </div>
  );
};

export default VisorGaleria;
