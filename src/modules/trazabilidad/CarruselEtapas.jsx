import { useState, useEffect, useRef } from 'react';
import ImagenPropia from '../../shared/components/ImagenPropia';
import IconoEtapa from './IconoEtapa';
import { FASES, claveFase } from './etapas';

const prefiereSinMovimiento = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const numero = (i) => String(i + 1).padStart(2, '0');
const INTERVALO_MS = 7000;
const DISTANCIA_DESLIZAR = 50;

// Arte de la etapa cuando no tiene foto: su ícono grande sobre el color de la fase (REQ-F04-04)
const ArteEtapa = ({ paso }) => (
  <div className="w-full h-full min-h-[14rem] flex flex-col items-center justify-center text-center p-8 bg-black/15 text-cafe-crema"
    style={{ backgroundImage: 'radial-gradient(circle at 70% 25%, rgba(255,255,255,0.14), transparent 60%)' }}>
    <IconoEtapa nombre={paso.icono || paso.nombre} className="w-24 h-24 md:w-28 md:h-28" />
    <p className="text-[11px] uppercase tracking-[0.18em] mt-5">Contenido audiovisual no disponible</p>
  </div>
);

const Flecha = ({ direccion, onClick, etiqueta }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={etiqueta}
    className="w-11 h-11 rounded-full border-2 border-cafe-crema/70 text-cafe-crema flex items-center justify-center hover:bg-cafe-crema hover:text-cafe-espresso transition-colors"
  >
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d={direccion > 0 ? 'M9 5l7 7-7 7' : 'M15 5l-7 7 7 7'} />
    </svg>
  </button>
);

// Carrusel interactivo de etapas o momentos del proceso (REQ-F04-01). Cada elemento: { nombre, descripcion, img, fase?, icono? }: barra de recorrido + tarjeta del color de la fase.
// Se navega con flechas, tocando una etapa, deslizando (celular) o con ← →. Con autoavance tiene botón de pausa.
const CarruselEtapas = ({ procesos, autoavance = false, compacto = false, titulo = 'Etapas del proceso' }) => {
  const total = procesos.length;
  const [indice, setIndice] = useState(0);
  const [direccion, setDireccion] = useState(1);
  const [pausado, setPausado] = useState(() => !autoavance || prefiereSinMovimiento());
  const [sobreCarrusel, setSobreCarrusel] = useState(false);
  const inicioToque = useRef(null);

  const actual = Math.min(indice, total - 1);
  const mover = (paso) => { setDireccion(paso); setIndice(i => (Math.min(i, total - 1) + paso + total) % total); };
  const irA = (i) => { setDireccion(i >= actual ? 1 : -1); setIndice(i); };

  // Autoavance: se detiene con el botón de pausa o mientras el cursor/foco está sobre el carrusel
  useEffect(() => {
    if (pausado || sobreCarrusel || total < 2) return;
    const temporizador = setInterval(() => { setDireccion(1); setIndice(i => (i + 1) % total); }, INTERVALO_MS);
    return () => clearInterval(temporizador);
  }, [pausado, sobreCarrusel, total]);

  if (total === 0) return null;
  const paso = procesos[actual];
  const fase = FASES[claveFase(paso, actual, total)];
  const animacion = direccion > 0 ? 'animacion-desde-derecha' : 'animacion-desde-izquierda';

  const alTeclear = (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); mover(1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); mover(-1); }
  };
  const alSoltar = (e) => {
    if (inicioToque.current === null) return;
    const recorrido = e.clientX - inicioToque.current;
    inicioToque.current = null;
    if (Math.abs(recorrido) > DISTANCIA_DESLIZAR) mover(recorrido < 0 ? 1 : -1);
  };

  return (
    <section
      aria-roledescription="carrusel"
      aria-label={titulo}
      className="font-cuerpo outline-none min-w-0 focus-visible:ring-4 focus-visible:ring-cafe-mostaza/50 rounded-md"
      tabIndex={0}
      onKeyDown={alTeclear}
      onMouseEnter={() => setSobreCarrusel(true)}
      onMouseLeave={() => setSobreCarrusel(false)}
      onFocus={() => setSobreCarrusel(true)}
      onBlur={() => setSobreCarrusel(false)}
    >
      {/* BARRA DE RECORRIDO */}
      <ol className="flex overflow-x-auto scrollbar-hide pb-2 mb-6 -mx-1 px-1" aria-label="Elegir etapa">
        {procesos.map((p, i) => {
          const f = FASES[claveFase(p, i, total)];
          const esActual = i === actual;
          const recorrida = i < actual;
          return (
            <li key={i} className={`relative flex-1 flex flex-col items-center ${compacto ? 'min-w-[4.25rem]' : 'min-w-[5.5rem]'}`}>
              {i < total - 1 && (
                <span className={`absolute top-5 left-1/2 w-full h-[3px] ${recorrida ? f.fondo : 'bg-cafe-espresso/15'} transition-colors duration-500`} aria-hidden="true" />
              )}
              <button
                type="button"
                onClick={() => irA(i)}
                aria-label={`Etapa ${i + 1}: ${p.nombre}`}
                aria-current={esActual ? 'step' : undefined}
                className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                  esActual ? `${f.fondo} text-cafe-crema scale-110 ring-4 ${f.anillo}`
                    : recorrida ? `${f.fondo} text-cafe-crema`
                      : 'bg-cafe-leche text-cafe-tostado border-2 border-cafe-espresso/20 hover:border-cafe-tostado'
                }`}
              >
                <IconoEtapa nombre={p.icono || p.nombre} className="w-5 h-5" />
              </button>
              <span className={`mt-2 text-[11px] text-center leading-tight px-1 ${esActual ? 'text-cafe-espresso font-semibold' : 'text-cafe-tostado'}`}>{p.nombre}</span>
            </li>
          );
        })}
      </ol>

      {/* TARJETA DE LA ETAPA */}
      <div
        className={`grid md:grid-cols-2 rounded-md overflow-hidden shadow-xl ${fase.fondo} transition-colors duration-500 touch-pan-y select-none`}
        onPointerDown={(e) => { inicioToque.current = e.clientX; }}
        onPointerUp={alSoltar}
        onPointerCancel={() => { inicioToque.current = null; }}
      >
        <div key={`imagen-${actual}`} className={`${animacion} ${compacto ? 'aspect-[16/10] md:aspect-auto' : 'aspect-[4/3] md:aspect-auto md:min-h-[26rem]'}`}>
          <ImagenPropia
            src={paso.img}
            alt={`Etapa de ${paso.nombre}`}
            className="w-full h-full object-cover"
            draggable={false}
            respaldo={<ArteEtapa paso={paso} />}
          />
        </div>

        <div className={`text-cafe-crema flex flex-col ${compacto ? 'p-6 md:p-8' : 'p-7 md:p-12'}`} aria-live={pausado ? 'polite' : 'off'}>
          <div key={`texto-${actual}`} className={`${animacion} flex-1`}>
            <div className="flex items-center justify-between gap-3">
              <span className="text-[11px] uppercase tracking-[0.2em] bg-cafe-crema/15 border border-cafe-crema/25 px-3 py-1 rounded-sm">{fase.nombre}</span>
              <span className="font-titulo italic text-cafe-crema/90 tabular-nums">{numero(actual)} / {numero(total - 1)}</span>
            </div>
            <h3 className={`font-titulo leading-tight mt-6 ${compacto ? 'text-3xl md:text-4xl' : 'text-4xl md:text-5xl'}`}>{paso.nombre}</h3>
            <p className={`mt-4 leading-relaxed text-cafe-crema/90 ${compacto ? 'text-base line-clamp-5' : 'text-lg'}`}>
              {paso.descripcion || 'Información en proceso de actualización.'}
            </p>
          </div>

          {/* CONTROLES */}
          <div className="mt-8 flex items-center gap-3">
            <Flecha direccion={-1} onClick={() => mover(-1)} etiqueta="Etapa anterior" />
            <Flecha direccion={1} onClick={() => mover(1)} etiqueta="Etapa siguiente" />
            <div className="flex-1 h-1 bg-cafe-crema/20 rounded-full overflow-hidden ml-2" aria-hidden="true">
              <div className="h-full bg-cafe-crema transition-all duration-500" style={{ width: `${((actual + 1) / total) * 100}%` }} />
            </div>
            {autoavance && (
              <button
                type="button"
                onClick={() => setPausado(!pausado)}
                className="text-xs uppercase tracking-[0.15em] border border-cafe-crema/40 px-3 py-2 rounded-sm hover:bg-cafe-crema/15"
                aria-label={pausado ? 'Reanudar avance automático' : 'Pausar avance automático'}
              >
                {pausado ? 'Reanudar' : 'Pausar'}
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CarruselEtapas;
