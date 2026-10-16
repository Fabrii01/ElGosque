import { useTrazabilidadPublica } from './useTrazabilidadPublica';
import ProcesoTrazabilidad from './ProcesoTrazabilidad';
import BeneficiosSalud from './BeneficiosSalud';
import CabeceraPortal from '../contenido-institucional/CabeceraPortal';
import PiePagina from '../contenido-institucional/PiePagina';
import { useImagenesSitio } from '../contenido-institucional/useImagenesSitio';
import FranjaSuperior from '../contenido-institucional/FranjaSuperior';
import { useDesplazarAAncla } from '../../shared/hooks/useDesplazarAAncla';
import ImagenPropia from '../../shared/components/ImagenPropia';
import SelloCircular from '../../shared/components/portal/SelloCircular';
import { IlustracionCafetal } from '../../shared/components/portal/Ilustraciones';

const PaginaTrazabilidad = () => {
  // REQ-F04: configuración desde Firebase
  const { region, procesos, cargando } = useTrazabilidadPublica();
  const { srcImagen } = useImagenesSitio();
  useDesplazarAAncla(!cargando); // p. ej. "/trazabilidad#beneficios" desde el inicio

  return (
    <div className="papel min-h-screen font-cuerpo text-cafe-espresso selection:bg-cafe-cereza selection:text-white">
      <FranjaSuperior />
      <CabeceraPortal />

      <header className="bg-cafe-tostado text-cafe-crema overflow-hidden">
        <div className="container mx-auto px-4 md:px-8 pt-14 pb-20 md:pt-20 md:pb-28 grid lg:grid-cols-12 gap-14 items-center">
          <div className="lg:col-span-7 animacion-aparecer bg-cafe-leche text-cafe-espresso rounded-md shadow-xl border-t-8 border-cafe-mostaza p-7 sm:p-10 md:p-12">
            <p className="flex items-center gap-3 text-xs uppercase tracking-[0.25em] text-cafe-cereza">
              <span className="inline-block w-8 h-[3px] bg-cafe-cereza" aria-hidden="true" />
              Trazabilidad
            </p>
            <h1 className="font-titulo font-light text-5xl sm:text-6xl leading-[1.02] tracking-tight mt-6">Del grano<br />a la taza</h1>
            <p className="mt-6 text-lg text-cafe-tostado leading-relaxed max-w-xl">
              Conoce el recorrido de nuestro café: cada etapa, desde la semilla hasta el empaque.
            </p>
            {/* REQ-F04-03: se muestra únicamente la región de procedencia */}
            <dl className="mt-8 flex flex-col bg-cafe-hoja text-cafe-crema rounded-md px-5 py-4">
              <dt className="text-xs uppercase tracking-[0.22em]">Región de procedencia</dt>
              <dd className="font-titulo text-2xl md:text-3xl mt-1">{cargando ? '…' : (region || 'No especificada')}</dd>
            </dl>
          </div>

          <div className="lg:col-span-5 relative w-full max-w-sm mx-auto lg:max-w-md lg:mr-0">
            <div className="absolute inset-0 -translate-x-4 translate-y-4 border-2 border-cafe-mostaza" aria-hidden="true" />
            <ImagenPropia
              src={srcImagen('trazabilidadPortada')}
              alt="Cafetales de El Gosque"
              className="relative w-full aspect-[4/5] object-cover"
              respaldo={<IlustracionCafetal className="relative w-full aspect-[4/5] block" />}
            />
            <SelloCircular className="absolute -right-6 -bottom-8 hidden sm:block" />
          </div>
        </div>
      </header>

      <ProcesoTrazabilidad procesos={procesos} cargando={cargando} />
      <BeneficiosSalud />
      <PiePagina />
    </div>
  );
};

export default PaginaTrazabilidad;
