import Revelar from '../../shared/components/Revelar';
import EncabezadoSeccion from './EncabezadoSeccion';
import ReproductorVideo from './ReproductorVideo';

// Videos de preparación grabados por El Gosque (enlaces de YouTube o archivos de video)
const SeccionPreparacion = ({ videos }) => (
  <section id="preparacion" className="scroll-mt-32 py-20 md:py-28 px-4 bg-cafe-espresso">
    <div className="container mx-auto max-w-6xl">
      <EncabezadoSeccion oscuro etiqueta="Detrás de la barra" titulo="Preparación" descripcion="Así preparamos cada taza en nuestra cafetería." />

      <div className={`grid gap-10 md:gap-12 ${videos.length > 1 ? 'md:grid-cols-2' : 'max-w-4xl mx-auto'}`}>
        {videos.map((v, i) => (
          <Revelar key={v.id} retraso={(i % 2) * 150}>
            <ReproductorVideo url={v.url} titulo={v.titulo} miniatura={v.miniatura} />
            {(v.titulo || v.descripcion) && (
              <div className="mt-5">
                {v.titulo && <h3 className="text-xl font-bold text-white">{v.titulo}</h3>}
                {v.descripcion && <p className="text-cafe-crema/70 mt-2 leading-relaxed">{v.descripcion}</p>}
              </div>
            )}
          </Revelar>
        ))}
      </div>
    </div>
  </section>
);

export default SeccionPreparacion;
