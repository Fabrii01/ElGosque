import { useState, useCallback } from 'react';
import Revelar from '../../shared/components/Revelar';
import EncabezadoSeccion from './EncabezadoSeccion';
import VisorGaleria from './VisorGaleria';

// Galería de fotos autorizadas del local (REQ-F13-03, RN-11), en mosaico con visor ampliado
const SeccionGaleria = ({ fotos }) => {
  const [indiceAbierto, setIndiceAbierto] = useState(null);
  const cerrar = useCallback(() => setIndiceAbierto(null), []);

  return (
    <section id="galeria" className="scroll-mt-32 py-20 md:py-28 px-4 bg-cafe-leche">
      <div className="container mx-auto max-w-6xl">
        <EncabezadoSeccion etiqueta="Nuestro espacio" titulo="Galería" descripcion="Un lugar pensado para disfrutar el café de Amazonas en Trujillo." />

        <div className="columns-2 md:columns-3 gap-3 md:gap-5">
          {fotos.map((foto, i) => (
            <Revelar key={i} retraso={(i % 3) * 100} className="mb-3 md:mb-5 break-inside-avoid">
              <button onClick={() => setIndiceAbierto(i)} className="group block w-full overflow-hidden rounded-md focus:outline-none focus-visible:ring-4 focus-visible:ring-gosque-green/40" aria-label={`Ampliar foto ${i + 1}`}>
                <img src={foto} alt={`Local de la cafetería El Gosque, foto ${i + 1}`} loading="lazy" className="w-full h-auto object-cover transition duration-700 group-hover:scale-105 group-hover:brightness-90" />
              </button>
            </Revelar>
          ))}
        </div>
      </div>

      {indiceAbierto !== null && <VisorGaleria fotos={fotos} indice={indiceAbierto} onCambiar={setIndiceAbierto} onCerrar={cerrar} />}
    </section>
  );
};

export default SeccionGaleria;
