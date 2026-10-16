import Revelar from '../../shared/components/Revelar';
import EtiquetaSeccion from '../../shared/components/portal/EtiquetaSeccion';
import CarruselEtapas from './CarruselEtapas';
import LeyendaFases from './LeyendaFases';

// Recorrido interactivo por las etapas registradas en Firestore (REQ-F04-01/04)
const ProcesoTrazabilidad = ({ procesos, cargando }) => (
  <section id="proceso" className="font-cuerpo bg-cafe-selva">
    <div className="container mx-auto px-4 md:px-8 py-20 md:py-28 space-y-8">
      <Revelar className="bg-cafe-crema rounded-md shadow-xl border-l-8 border-cafe-mostaza p-7 md:p-10 grid lg:grid-cols-12 gap-6 items-end">
        <div className="lg:col-span-7">
          <EtiquetaSeccion numero="01" texto="El proceso" />
          <h2 className="font-titulo font-light text-4xl md:text-5xl text-cafe-espresso mt-5 leading-tight">
            {procesos.length > 0 ? `${procesos.length} etapas, tres fases` : 'El ciclo del café'}
          </h2>
        </div>
        <p className="lg:col-span-5 text-cafe-tostado leading-relaxed">
          Recorre cada etapa con las flechas, tocando su ícono o deslizando la tarjeta. El color indica la fase del proceso.
        </p>
      </Revelar>

      {cargando ? (
        <p className="bg-cafe-leche rounded-md p-6 text-cafe-tostado">Cargando etapas de trazabilidad...</p>
      ) : procesos.length === 0 ? (
        <p className="bg-cafe-leche rounded-md p-6 text-cafe-tostado border-l-4 border-cafe-cereza">Aún no se ha registrado el proceso de trazabilidad.</p>
      ) : (
        <>
          <Revelar><LeyendaFases procesos={procesos} /></Revelar>
          <Revelar className="min-w-0 bg-cafe-crema rounded-md shadow-xl p-5 md:p-8">
            <CarruselEtapas procesos={procesos} titulo="Recorrido por las etapas del café" />
          </Revelar>
        </>
      )}
    </div>
  </section>
);

export default ProcesoTrazabilidad;
