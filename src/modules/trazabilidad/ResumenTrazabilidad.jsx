import { Link } from 'react-router-dom';
import Revelar from '../../shared/components/Revelar';
import ImagenPropia from '../../shared/components/ImagenPropia';
import EtiquetaSeccion from '../../shared/components/portal/EtiquetaSeccion';
import { IlustracionCafetal } from '../../shared/components/portal/Ilustraciones';
import CarruselEtapas from './CarruselEtapas';
import LeyendaFases from './LeyendaFases';
import { MOMENTOS_ORIGEN } from './momentosOrigen';

// "El Ciclo de Vida" del inicio: resumen en 6 momentos (distinto de las 9 etapas detalladas de /trazabilidad)
const ResumenTrazabilidad = ({ region, srcOrigen, srcImagen, totalEtapas }) => {
  const momentos = MOMENTOS_ORIGEN.map(m => ({ ...m, img: srcImagen(m.idImagen) }));

  return (
    <section id="origen" className="scroll-mt-20 font-cuerpo bg-cafe-selva">
      <div className="container mx-auto px-4 md:px-8 py-20 md:py-28 grid lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        <div className="lg:col-span-4 min-w-0 flex flex-col gap-6">
          <Revelar className="bg-cafe-crema rounded-md shadow-xl border-t-8 border-cafe-mostaza p-7 md:p-8">
            <EtiquetaSeccion numero="01" texto="Origen" />
            <h2 className="font-titulo font-light text-4xl md:text-5xl text-cafe-espresso mt-5 leading-tight">El Ciclo<br />de Vida</h2>
            <p className="mt-5 text-cafe-tostado leading-relaxed">
              Desliza para conocer cada paso de nuestro riguroso proceso de calidad, garantizando un grano puro y de alto rendimiento.
            </p>
            {region && (
              <p className="mt-5 inline-flex items-center gap-2 bg-cafe-hoja text-cafe-crema text-sm px-3 py-1.5 rounded-sm">Origen: {region}</p>
            )}
            <div className="mt-7 pt-6 border-t border-cafe-espresso/10 flex flex-col gap-3">
              <Link to="/trazabilidad" className="text-center bg-cafe-hoja text-cafe-crema px-6 py-3 rounded-sm hover:bg-cafe-espresso transition-colors">
                {totalEtapas > 0 ? `Ver las ${totalEtapas} etapas de trazabilidad` : 'Ver la trazabilidad completa'}
              </Link>
              <Link to="/trazabilidad#beneficios" className="text-center bg-cafe-tostado text-cafe-crema px-6 py-3 rounded-sm hover:bg-cafe-espresso transition-colors">
                Ver beneficios de salud
              </Link>
            </div>
          </Revelar>
          <Revelar retraso={150} className="hidden lg:block rounded-md overflow-hidden shadow-xl border-4 border-cafe-crema">
            <ImagenPropia
              src={srcOrigen}
              alt="Fincas de El Gosque en Amazonas"
              className="w-full aspect-[3/2] object-cover"
              respaldo={<IlustracionCafetal className="w-full aspect-[3/2] block" />}
            />
          </Revelar>
        </div>

        <Revelar retraso={100} className="lg:col-span-8 min-w-0 bg-cafe-crema rounded-md shadow-xl p-5 md:p-7">
          <CarruselEtapas procesos={momentos} autoavance compacto titulo="El ciclo de vida del café en 6 momentos" />
          <div className="mt-6"><LeyendaFases procesos={momentos} compacta /></div>
        </Revelar>
      </div>
    </section>
  );
};

export default ResumenTrazabilidad;
