import ZonaArrastrar from '../../shared/components/ZonaArrastrar';
import { TIPOS_VIDEO_SUBIBLES, MAX_MB_VIDEO } from './multimedia';

// Zona de arrastre para subir un video a Cloudinary, con barra de progreso
const SubirVideo = ({ destino, subidaVideo, subirArchivoVideo }) => {
  const subiendoAqui = subidaVideo?.destino === destino;

  return (
    <ZonaArrastrar
      accept={TIPOS_VIDEO_SUBIBLES.join(',')}
      onArchivo={archivo => subirArchivoVideo(archivo, destino)}
      deshabilitado={Boolean(subidaVideo)}
      titulo={subiendoAqui ? `Subiendo video... ${subidaVideo.progreso} %` : 'Arrastra aquí el video o haz clic para elegirlo'}
      ayuda={`Archivo .mp4 o .webm, hasta ${MAX_MB_VIDEO} MB. Se reproduce directo en la web, sin YouTube.`}
    >
      {subiendoAqui && (
        <span className="block mt-3 h-2 rounded-full bg-cafe-arena overflow-hidden" role="progressbar" aria-valuenow={subidaVideo.progreso} aria-valuemin={0} aria-valuemax={100}>
          <span className="block h-full bg-cafe-hoja transition-all" style={{ width: `${subidaVideo.progreso}%` }} />
        </span>
      )}
    </ZonaArrastrar>
  );
};

export default SubirVideo;
