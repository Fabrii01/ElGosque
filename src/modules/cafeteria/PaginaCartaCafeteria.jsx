import FranjaSuperior from '../contenido-institucional/FranjaSuperior';
import CabeceraPortal from '../contenido-institucional/CabeceraPortal';
import PiePagina from '../contenido-institucional/PiePagina';
import { usePaginaCafeteria } from './usePaginaCafeteria';
import { useSeccionActiva } from '../../shared/hooks/useSeccionActiva';
import { useDesplazarAAncla } from '../../shared/hooks/useDesplazarAAncla';
import { HORARIO_CAFETERIA } from './carta';
import { enlaceComoLlegar } from './multimedia';
import SeccionCarta from './SeccionCarta';
import SeccionPreparacion from './SeccionPreparacion';
import SeccionGaleria from './SeccionGaleria';
import SeccionVisitanos from './SeccionVisitanos';

// Página de la cafetería (REQ-F13): portada, carta, preparación, galería y ubicación.
// Informativa: no permite pedidos, reservas ni pagos de bebidas (REQ-F13-04).
const PaginaCartaCafeteria = () => {
  const { preparaciones, fotos, videos, ubicacion, cargando } = usePaginaCafeteria();

  // Las secciones sin contenido no se muestran (ni en el menú)
  const secciones = [
    { id: 'carta', etiqueta: 'Carta' },
    videos.length > 0 && { id: 'preparacion', etiqueta: 'Preparación' },
    fotos.length > 0 && { id: 'galeria', etiqueta: 'Galería' },
    { id: 'visitanos', etiqueta: 'Visítanos' },
  ].filter(Boolean);
  const activa = useSeccionActiva(secciones.map(s => s.id));
  const comoLlegar = enlaceComoLlegar(ubicacion);
  useDesplazarAAncla(!cargando); // p. ej. llegar desde el inicio a "#visitanos"

  return (
    <div className="papel min-h-screen font-cuerpo text-cafe-espresso">
      <FranjaSuperior />
      <CabeceraPortal />

      {/* PORTADA */}
      <header className="relative h-[78vh] min-h-[520px] max-h-[820px] overflow-hidden flex items-center justify-center text-center text-white">
        {fotos[0]
          ? <img src={fotos[0]} alt="" className="absolute inset-0 w-full h-full object-cover animacion-portada" />
          : <div className="absolute inset-0 bg-gradient-to-br from-cafe-hoja via-cafe-selva to-cafe-espresso" />}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/75" />

        <div className="relative z-10 px-4 max-w-3xl">
          <span className="animacion-aparecer inline-block border border-white/40 bg-white/10 backdrop-blur-sm px-5 py-1.5 rounded-sm text-xs font-bold tracking-[0.25em] uppercase">Cafetería · Trujillo</span>
          <h1 className="animacion-aparecer text-5xl md:text-7xl font-titulo font-semibold tracking-tight mt-6 leading-[1.05]" style={{ animationDelay: '150ms' }}>Cafetería<br />El Gosque</h1>
          <p className="animacion-aparecer text-lg md:text-xl text-white/85 mt-6 font-light" style={{ animationDelay: '300ms' }}>Disfruta de nuestras preparaciones con café orgánico de Amazonas.</p>
          <p className="animacion-aparecer text-sm font-semibold text-cafe-mostaza mt-3 tracking-wide" style={{ animationDelay: '400ms' }}>{HORARIO_CAFETERIA}</p>
          <div className="animacion-aparecer flex flex-col sm:flex-row gap-3 justify-center mt-10" style={{ animationDelay: '550ms' }}>
            <a href="#carta" className="bg-cafe-leche text-cafe-hoja font-bold py-3.5 px-8 rounded-sm hover:bg-cafe-arena/50 transition-colors shadow-xl">Ver la carta</a>
            <a href={comoLlegar || '#visitanos'} {...(comoLlegar && { target: '_blank', rel: 'noopener noreferrer' })} className="border border-white/70 text-white font-bold py-3.5 px-8 rounded-sm hover:bg-white/10 transition-colors">Cómo llegar</a>
          </div>
        </div>

        <a href="#carta" className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/70 hover:text-white animate-bounce motion-reduce:animate-none" aria-label="Bajar a la carta">
          <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
        </a>
      </header>

      {/* MENÚ DE SECCIONES (fijo bajo la navegación) */}
      <nav aria-label="Secciones de la cafetería" className="sticky top-16 md:top-20 z-40 bg-cafe-crema/95 backdrop-blur-md border-b border-cafe-espresso/10 shadow-sm">
        <div className="container mx-auto flex justify-start md:justify-center gap-1 overflow-x-auto scrollbar-hide px-4 py-2">
          {secciones.map(s => (
            <a
              key={s.id}
              href={`#${s.id}`}
              aria-current={activa === s.id ? 'true' : undefined}
              className={`shrink-0 px-5 py-2 rounded-sm text-sm font-bold transition-colors duration-300 ${activa === s.id ? 'bg-cafe-hoja text-white' : 'text-cafe-tostado hover:text-cafe-hoja'}`}
            >
              {s.etiqueta}
            </a>
          ))}
        </div>
      </nav>

      <main className="scroll-smooth">
        <SeccionCarta preparaciones={preparaciones} cargando={cargando} />
        {videos.length > 0 && <SeccionPreparacion videos={videos} />}
        {fotos.length > 0 && <SeccionGaleria fotos={fotos} />}
        <SeccionVisitanos ubicacion={ubicacion} />
      </main>

      <PiePagina />
    </div>
  );
};

export default PaginaCartaCafeteria;
