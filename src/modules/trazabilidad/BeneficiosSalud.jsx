import Revelar from '../../shared/components/Revelar';
import EtiquetaSeccion from '../../shared/components/portal/EtiquetaSeccion';
import GranoCafe from '../../shared/components/portal/GranoCafe';

// Contenido provisional: afirmaciones sin fuente citada, pendientes de validación por El Gosque (RN-11)
const beneficios = [
  { titulo: "Escudo Neuroprotector", desc: "El consumo regular previene enfermedades neurodegenerativas." },
  { titulo: "Salud Digestiva", desc: "Antioxidantes que reducen riesgos en el colon." },
  { titulo: "Poder del Café Verde", desc: "Potente depurador metabólico al consumirse como té." },
  { titulo: "Energía Pura", desc: "Energizante 100% natural. Recomendado sin azúcar." }
];

const BeneficiosSalud = () => (
  <section id="beneficios" className="scroll-mt-24 bg-cafe-arena text-cafe-espresso font-cuerpo">
    <div className="container mx-auto px-4 md:px-8 py-24 md:py-28">
      <Revelar className="max-w-2xl mb-10 bg-cafe-tostado text-cafe-crema rounded-md shadow-lg border-l-8 border-cafe-mostaza p-7 md:p-9">
        <EtiquetaSeccion numero="02" texto="Bienestar" color="mostaza" />
        <h2 className="font-titulo font-light text-4xl md:text-5xl mt-5">Salud en cada taza</h2>
      </Revelar>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {beneficios.map((beneficio, i) => (
          <Revelar key={beneficio.titulo} retraso={i * 100} className="bg-cafe-hoja text-cafe-crema rounded-md shadow-md border-b-8 border-cafe-selva p-6 h-full hover:-translate-y-1 transition-transform">
            <span className="flex items-center gap-2 text-cafe-mostaza">
              <GranoCafe className="w-4 h-5" />
              <span className="font-titulo italic">{String(i + 1).padStart(2, '0')}</span>
            </span>
            <h3 className="font-titulo text-2xl mt-3">{beneficio.titulo}</h3>
            <p className="mt-3 text-sm text-cafe-crema/90 leading-relaxed">{beneficio.desc}</p>
          </Revelar>
        ))}
      </div>
    </div>
  </section>
);

export default BeneficiosSalud;
