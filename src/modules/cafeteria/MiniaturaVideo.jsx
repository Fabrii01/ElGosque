import ZonaArrastrar from '../../shared/components/ZonaArrastrar';
import { miniaturaAutomatica } from './multimedia';

// Miniatura del video en el panel: muestra la propia (si se subió) o la automática, y permite cambiarla
const MiniaturaVideo = ({ destino, url, miniatura, procesandoMiniatura, subirMiniatura, cambiarMiniatura }) => {
  const automatica = miniaturaAutomatica(url);
  const actual = miniatura || automatica;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-[10rem_1fr] gap-3 items-center">
      <div className="aspect-video rounded-sm overflow-hidden bg-cafe-arena border border-cafe-espresso/15 flex items-center justify-center">
        {actual
          ? <img src={actual} alt="Miniatura del video" className="w-full h-full object-cover" />
          : <span className="text-[11px] text-cafe-tostado/80 px-2 text-center">Sin miniatura</span>}
      </div>
      <div className="space-y-2">
        <p className="text-xs text-cafe-tostado/80">
          {miniatura ? 'Miniatura propia.' : automatica ? 'Miniatura automática (fotograma del video).' : 'Aún no hay miniatura.'}
          {miniatura && (
            <button type="button" onClick={() => cambiarMiniatura(destino, '')} className="ml-2 font-bold text-red-600 hover:underline">
              Quitar{automatica ? ' (usar la automática)' : ''}
            </button>
          )}
        </p>
        <ZonaArrastrar
          accept="image/*"
          onArchivo={archivo => subirMiniatura(archivo, destino)}
          deshabilitado={procesandoMiniatura !== null}
          titulo={procesandoMiniatura === destino ? 'Procesando imagen...' : 'Arrastra una imagen para usarla de miniatura'}
          ayuda="Opcional. Se recomienda horizontal (16:9)."
        />
      </div>
    </div>
  );
};

export default MiniaturaVideo;
