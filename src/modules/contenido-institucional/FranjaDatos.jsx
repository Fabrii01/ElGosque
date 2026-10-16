import { VARIEDADES_CAFE } from '../../shared/constants';
import GranoCafe from '../../shared/components/portal/GranoCafe';

// Franja marrón con datos reales del negocio (solo se muestran los que existen)
const FranjaDatos = ({ region, etapasRegistradas }) => {
  const datos = [
    { valor: VARIEDADES_CAFE.length, texto: 'variedades de café orgánico' },
    etapasRegistradas > 0 && { valor: etapasRegistradas, texto: 'etapas trazadas, de la semilla al empaque' },
    region && { valor: region, texto: 'región de origen', esTexto: true },
    { valor: 'Trujillo', texto: 'nuestra cafetería', esTexto: true },
  ].filter(Boolean);

  return (
    <section aria-label="El Gosque en cifras" className="bg-cafe-tostado text-cafe-crema font-cuerpo">
      <dl className="container mx-auto px-4 md:px-8 py-10 md:py-12 grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
        {datos.map(d => (
          <div key={d.texto} className="flex flex-col-reverse justify-end bg-cafe-espresso/40 border border-cafe-crema/15 rounded-md p-5 md:p-7 hover:bg-cafe-espresso/60 transition-colors">
            <dt className="mt-3 text-xs uppercase tracking-[0.2em] text-cafe-crema/90">{d.texto}</dt>
            <dd className={`font-titulo font-light leading-tight flex items-center gap-3 ${d.esTexto ? "text-2xl md:text-3xl" : "text-5xl md:text-6xl"}`}>
              {!d.esTexto && <GranoCafe className="w-5 h-7 text-cafe-mostaza" />}
              {d.valor}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
};

export default FranjaDatos;
