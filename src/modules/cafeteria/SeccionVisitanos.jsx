import Revelar from '../../shared/components/Revelar';
import EncabezadoSeccion from './EncabezadoSeccion';
import ReproductorVideo from './ReproductorVideo';
import { HORARIO_CAFETERIA } from './carta';
import { mapaParaMostrar, enlaceComoLlegar, interpretarEnlaceMaps, interpretarVideo } from './multimedia';

const IconoUbicacion = () => (
  <svg className="w-5 h-5 shrink-0 text-cafe-hoja" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
const IconoReloj = () => (
  <svg className="w-5 h-5 shrink-0 text-cafe-hoja" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="12" r="9" /><path strokeLinecap="round" d="M12 7v5l3 2" />
  </svg>
);

// Ubicación con Google Maps, cómo llegar y video opcional del recorrido
const SeccionVisitanos = ({ ubicacion }) => {
  const mapa = mapaParaMostrar(ubicacion);
  const comoLlegar = enlaceComoLlegar(ubicacion);
  const abrirEnMaps = interpretarEnlaceMaps(ubicacion?.enlaceMaps);
  const hayVideo = interpretarVideo(ubicacion?.videoUrl);

  return (
    <section id="visitanos" className="scroll-mt-32 py-20 md:py-28 px-4 bg-cafe-crema">
      <div className="container mx-auto max-w-6xl">
        <EncabezadoSeccion etiqueta="Te esperamos" titulo="Visítanos" />

        <div className="grid lg:grid-cols-5 gap-6 md:gap-8 items-stretch">
          <Revelar className="lg:col-span-2 bg-cafe-leche rounded-md p-6 md:p-8 border border-cafe-espresso/10 shadow-sm flex flex-col">
            <h3 className="text-2xl font-titulo font-semibold text-cafe-espresso">Cafetería El Gosque</h3>
            <ul className="mt-6 space-y-5 text-cafe-tostado">
              <li className="flex gap-3">
                <IconoUbicacion />
                <div>
                  <p className="font-semibold">{ubicacion?.direccion || 'Trujillo, La Libertad'}</p>
                  {ubicacion?.referencia && <p className="text-sm text-cafe-tostado/80 mt-1">{ubicacion.referencia}</p>}
                </div>
              </li>
              <li className="flex gap-3">
                <IconoReloj />
                <p className="font-semibold">{HORARIO_CAFETERIA}</p>
              </li>
            </ul>
            <div className="mt-auto pt-8 flex flex-col sm:flex-row lg:flex-col gap-3">
              {comoLlegar && (
                <a href={comoLlegar} target="_blank" rel="noopener noreferrer" className="text-center bg-cafe-hoja hover:bg-cafe-selva text-white font-bold py-3.5 px-6 rounded-sm transition-colors">Cómo llegar</a>
              )}
              {abrirEnMaps && (
                <a href={abrirEnMaps} target="_blank" rel="noopener noreferrer" className="text-center border border-cafe-espresso/25 hover:border-cafe-hoja hover:text-cafe-hoja text-cafe-tostado font-bold py-3.5 px-6 rounded-sm transition-colors">Abrir en Google Maps</a>
              )}
            </div>
          </Revelar>

          <Revelar retraso={150} className="lg:col-span-3 rounded-md overflow-hidden border border-cafe-espresso/10 shadow-sm bg-cafe-arena/60 min-h-[320px]">
            {mapa ? (
              <iframe
                src={mapa}
                title="Ubicación de la cafetería El Gosque en Google Maps"
                className="w-full h-full min-h-[320px] lg:min-h-[420px]"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            ) : (
              <div className="h-full min-h-[320px] flex items-center justify-center text-cafe-tostado/70 text-sm">Mapa de ubicación próximamente.</div>
            )}
          </Revelar>
        </div>

        {hayVideo && (
          <Revelar className="mt-12 max-w-4xl mx-auto">
            <h3 className="text-xl font-bold text-cafe-espresso mb-4 text-center">Así llegas a nuestro local</h3>
            <ReproductorVideo url={ubicacion.videoUrl} titulo="Cómo llegar a la cafetería El Gosque" miniatura={ubicacion.videoMiniatura} />
          </Revelar>
        )}
      </div>
    </section>
  );
};

export default SeccionVisitanos;
