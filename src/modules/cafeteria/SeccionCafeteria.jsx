import { Link } from 'react-router-dom';
import { HORARIO_CAFETERIA } from './carta';
import Revelar from '../../shared/components/Revelar';
import ImagenPropia from '../../shared/components/ImagenPropia';
import EtiquetaSeccion from '../../shared/components/portal/EtiquetaSeccion';
import { IlustracionTaza } from '../../shared/components/portal/Ilustraciones';

// Sección informativa de la cafetería en el inicio (REQ-F13, sin pedidos de bebidas).
// Foto: la primera de la galería de la cafetería o la imagen del sitio "Cafetería (inicio)" (RN-11).
const SeccionCafeteria = ({ fotoFondo, srcRespaldo }) => (
  <section id="cafeteria" className="scroll-mt-20 bg-cafe-selva text-cafe-crema font-cuerpo">
    <div className="container mx-auto px-4 md:px-8 py-24 md:py-32 grid lg:grid-cols-2 gap-14 items-center">
      <Revelar className="order-2 lg:order-1 relative">
        <div className="absolute inset-0 -translate-x-3 translate-y-3 md:-translate-x-4 md:translate-y-4 border-2 border-cafe-mostaza" aria-hidden="true" />
        <ImagenPropia
          src={fotoFondo || srcRespaldo}
          alt="Interior de la cafetería El Gosque en Trujillo"
          className="relative w-full aspect-[4/3] object-cover"
          respaldo={<IlustracionTaza className="relative w-full aspect-[4/3] block" />}
        />
      </Revelar>

      <Revelar retraso={150} className="order-1 lg:order-2 bg-cafe-crema text-cafe-espresso rounded-md shadow-xl border-t-8 border-cafe-mostaza p-7 md:p-10">
        <EtiquetaSeccion numero="03" texto="La cafetería" />
        <h2 className="font-titulo font-light text-4xl md:text-5xl mt-5 leading-tight">Un rincón de Amazonas<br />en Trujillo</h2>
        <p className="mt-5 text-cafe-tostado leading-relaxed max-w-md">
          Disfruta de nuestras preparaciones con el mismo café que cultivamos en origen, en un espacio pensado para conversar sin prisa.
        </p>
        <p className="mt-7 inline-flex items-center gap-3 bg-cafe-selva text-cafe-crema px-4 py-2 rounded-sm">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path strokeLinecap="round" d="M12 7v5l3 2" /></svg>
          {HORARIO_CAFETERIA}
        </p>
        <div className="mt-8 pt-7 border-t border-cafe-espresso/10 flex flex-wrap items-center gap-3">
          <Link to="/productos-cafeteria" className="bg-cafe-hoja text-cafe-crema px-7 py-3.5 rounded-sm hover:bg-cafe-selva transition-colors">Ver carta y galería</Link>
          <Link to="/productos-cafeteria#visitanos" className="bg-cafe-tostado text-cafe-crema px-7 py-3.5 rounded-sm hover:bg-cafe-espresso transition-colors">Cómo llegar</Link>
        </div>
      </Revelar>
    </div>
  </section>
);

export default SeccionCafeteria;
