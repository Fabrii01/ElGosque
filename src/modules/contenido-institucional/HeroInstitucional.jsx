import ImagenPropia from '../../shared/components/ImagenPropia';
import SelloCircular from '../../shared/components/portal/SelloCircular';
import { IlustracionCafetal } from '../../shared/components/portal/Ilustraciones';

// Portada del inicio: título y descripción administrables (REQ-F01) y foto principal sobre panel verde selva
const HeroInstitucional = ({ infoWeb, cargandoInfo, region, srcPortada }) => (
  <header id="inicio" className="relative font-cuerpo overflow-hidden">
    {/* Panel de color a la derecha (escritorio) */}
    <div className="hidden lg:block absolute inset-y-0 right-0 w-[40%] bg-cafe-selva" aria-hidden="true" />

    <div className="relative container mx-auto px-4 md:px-8 pt-12 pb-16 md:pt-20 lg:pb-28 grid lg:grid-cols-12 gap-12 lg:gap-10 items-center">
      <div className="lg:col-span-6 xl:col-span-7 animacion-aparecer bg-cafe-leche rounded-md shadow-lg border-t-8 border-cafe-hoja p-7 sm:p-10 md:p-12 lg:mr-6">
        <p className="flex items-center gap-3 text-xs uppercase tracking-[0.25em] text-cafe-cereza">
          <span className="inline-block w-8 h-[3px] bg-cafe-cereza" aria-hidden="true" />
          Café orgánico de Amazonas · Perú
        </p>

        {cargandoInfo ? (
          <div className="mt-8 space-y-4 animate-pulse" aria-label="Cargando">
            <div className="h-14 w-full max-w-lg bg-cafe-espresso/10 rounded-sm" />
            <div className="h-14 w-3/4 max-w-md bg-cafe-espresso/10 rounded-sm" />
            <div className="h-5 w-2/3 max-w-sm bg-cafe-espresso/10 rounded-sm mt-8" />
          </div>
        ) : infoWeb ? (
          <>
            <h1 className="font-titulo font-light text-cafe-espresso text-4xl sm:text-5xl xl:text-6xl leading-[1.04] tracking-tight mt-6 text-balance">
              {infoWeb.titulo}
            </h1>
            <p className="mt-6 text-lg text-cafe-tostado leading-relaxed max-w-xl">{infoWeb.descripcion}</p>
          </>
        ) : (
          /* REQ-F01-04: mensaje cuando no hay contenido institucional */
          <div className="mt-8 border-l-4 border-cafe-cereza pl-6 py-2 max-w-lg">
            <h1 className="font-titulo text-3xl text-cafe-espresso">Contenido en actualización</h1>
            <p className="mt-2 text-cafe-tostado">La información institucional no está disponible en este momento.</p>
          </div>
        )}

        <div className="mt-10 pt-8 border-t border-cafe-espresso/10 flex flex-wrap items-center gap-x-8 gap-y-4">
          <a href="#catalogo" className="bg-cafe-hoja text-cafe-crema px-7 py-3.5 rounded-sm hover:bg-cafe-selva transition-colors">Ver nuestros cafés</a>
          <a href="#cafeteria" className="bg-cafe-tostado text-cafe-crema px-7 py-3.5 rounded-sm hover:bg-cafe-espresso transition-colors">Visitar la cafetería</a>
        </div>
      </div>

      <div className="lg:col-span-6 xl:col-span-5 relative">
        <div className="bg-cafe-selva lg:bg-transparent -mx-4 md:-mx-8 lg:mx-0 px-8 py-12 lg:p-0">
          <div className="relative w-full max-w-sm mx-auto lg:max-w-md">
            {/* Marco desplazado en mostaza */}
            <div className="absolute inset-0 translate-x-3 translate-y-3 md:translate-x-4 md:translate-y-4 border-2 border-cafe-mostaza" aria-hidden="true" />
            <ImagenPropia
              src={srcPortada}
              alt="Cafetales de El Gosque en Amazonas"
              className="relative w-full aspect-[4/5] object-cover"
              respaldo={<IlustracionCafetal className="relative w-full aspect-[4/5] block" />}
            />
            <SelloCircular className="absolute -left-6 -bottom-8 hidden sm:block" />
            {region && (
              <p className="absolute -bottom-9 right-0 font-titulo italic text-sm text-cafe-mostaza">Origen: {region}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  </header>
);

export default HeroInstitucional;
