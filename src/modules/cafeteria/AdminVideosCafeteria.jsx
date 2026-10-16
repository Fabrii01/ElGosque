import { interpretarVideo } from './multimedia';
import ReproductorVideo from './ReproductorVideo';

// Videos de la sección "Preparación": enlaces de YouTube (recomendado) o archivos de video
const AdminVideosCafeteria = ({ videos, nuevoVideo, setNuevoVideo, guardandoVideos, agregarVideo, eliminarVideo, moverVideo }) => {
  const actualizar = (campo, valor) => setNuevoVideo({ ...nuevoVideo, [campo]: valor });
  const vistaPrevia = nuevoVideo.url.trim() && interpretarVideo(nuevoVideo.url);

  return (
    <div className="space-y-6">
      <div className="bg-cafe-leche rounded-md shadow-sm border border-cafe-espresso/10 p-5 md:p-8">
        <h3 className="font-bold text-2xl text-cafe-espresso mb-1">Videos de Preparación</h3>
        <p className="text-sm text-cafe-tostado/80 mb-6">
          Sube el video a <strong>YouTube</strong> (puede ser "No listado") y pega aquí su enlace. También se aceptan Shorts
          y archivos de video directos (.mp4/.webm con https).
        </p>
        <form onSubmit={agregarVideo} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-cafe-tostado uppercase mb-1">Enlace del video</label>
            <input type="url" required className="w-full bg-cafe-crema border border-cafe-espresso/15 p-3 rounded-sm outline-none" value={nuevoVideo.url} onChange={e => actualizar('url', e.target.value)} placeholder="https://www.youtube.com/watch?v=..." />
            {nuevoVideo.url.trim() && !vistaPrevia && <p className="text-xs text-red-600 font-bold mt-1">Enlace no compatible.</p>}
          </div>
          <div>
            <label className="block text-xs font-bold text-cafe-tostado uppercase mb-1">Título</label>
            <input type="text" className="w-full bg-cafe-crema border border-cafe-espresso/15 p-3 rounded-sm outline-none" value={nuevoVideo.titulo} onChange={e => actualizar('titulo', e.target.value)} placeholder="Ej. Método V60" />
          </div>
          <div>
            <label className="block text-xs font-bold text-cafe-tostado uppercase mb-1">Descripción (opcional)</label>
            <input type="text" className="w-full bg-cafe-crema border border-cafe-espresso/15 p-3 rounded-sm outline-none" value={nuevoVideo.descripcion} onChange={e => actualizar('descripcion', e.target.value)} />
          </div>
          {vistaPrevia && (
            <div className="md:col-span-2 max-w-md">
              <p className="text-xs font-bold text-cafe-tostado/80 uppercase mb-2">Vista previa</p>
              <ReproductorVideo url={nuevoVideo.url} titulo={nuevoVideo.titulo} />
            </div>
          )}
          <div className="md:col-span-2">
            <button type="submit" disabled={guardandoVideos} className="bg-cafe-hoja text-white font-bold py-3 px-8 rounded-sm disabled:bg-cafe-kraft">{guardandoVideos ? 'Guardando...' : 'Agregar video'}</button>
          </div>
        </form>
      </div>

      <div className="bg-cafe-leche rounded-md shadow-sm border border-cafe-espresso/10 p-5 md:p-8">
        <h4 className="font-bold text-cafe-espresso mb-4">Videos publicados ({videos.length})</h4>
        {videos.length === 0 ? (
          <p className="text-sm text-cafe-tostado/70 italic">Aún no hay videos. La sección "Preparación" no se muestra en la web hasta agregar uno.</p>
        ) : (
          <ul className="space-y-3">
            {videos.map((v, i) => {
              const info = interpretarVideo(v.url);
              return (
                <li key={v.id} className="flex flex-wrap items-center gap-4 bg-cafe-crema border border-cafe-espresso/10 rounded-md p-3">
                  {info?.tipo === 'youtube'
                    ? <img src={info.miniatura} alt="" className="w-28 aspect-video object-cover rounded-lg" />
                    : <div className="w-28 aspect-video rounded-lg bg-cafe-tostado text-white text-[10px] flex items-center justify-center font-bold">VIDEO</div>}
                  <div className="flex-1 min-w-[10rem]">
                    <p className="font-bold text-cafe-espresso">{v.titulo || 'Sin título'}</p>
                    <p className="text-xs text-cafe-tostado/80 break-all">{v.url}</p>
                    {!info && <p className="text-xs text-red-600 font-bold">Enlace no válido: no se muestra en la web.</p>}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => moverVideo(i, -1)} disabled={i === 0 || guardandoVideos} className="w-8 h-8 rounded-full border border-cafe-espresso/25 text-cafe-tostado disabled:opacity-30" aria-label="Subir">↑</button>
                    <button onClick={() => moverVideo(i, 1)} disabled={i === videos.length - 1 || guardandoVideos} className="w-8 h-8 rounded-full border border-cafe-espresso/25 text-cafe-tostado disabled:opacity-30" aria-label="Bajar">↓</button>
                    <button onClick={() => eliminarVideo(v.id)} disabled={guardandoVideos} className="px-3 h-8 rounded-full border border-red-200 text-red-600 text-xs font-bold hover:bg-red-50">Quitar</button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AdminVideosCafeteria;
