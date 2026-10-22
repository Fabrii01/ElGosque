import { useState } from 'react';
import { interpretarVideo, miniaturaAutomatica } from './multimedia';

const IconoPlay = () => (
  <span className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-cafe-crema/95 text-cafe-hoja flex items-center justify-center shadow-xl transition-transform duration-300 group-hover:scale-110">
    <svg className="w-7 h-7 md:w-8 md:h-8 ml-1" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
  </span>
);

// Video de YouTube o archivo. Hasta que se pulsa "play" solo se muestra la miniatura (carga rápida).
// miniatura = imagen propia elegida en el panel; si no hay, se usa la automática (YouTube o Cloudinary).
const ReproductorVideo = ({ url, titulo, miniatura }) => {
  const [reproduciendo, setReproduciendo] = useState(false);
  const [portadaFallida, setPortadaFallida] = useState(false);
  const video = interpretarVideo(url);
  if (!video) return null;

  const proporcion = video.vertical ? 'aspect-[9/16] max-h-[70vh] mx-auto' : 'aspect-video';
  const portada = !portadaFallida && (miniatura || miniaturaAutomatica(url));

  return (
    <div className={`relative w-full ${proporcion} rounded-md overflow-hidden bg-cafe-espresso shadow-xl`}>
      {reproduciendo ? (
        video.tipo === 'youtube' ? (
          <iframe
            src={video.embed}
            title={titulo || 'Video de El Gosque'}
            className="absolute inset-0 w-full h-full"
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        ) : (
          <video src={video.src} poster={portada || undefined} className="absolute inset-0 w-full h-full object-contain bg-black" controls autoPlay playsInline />
        )
      ) : (
        <button type="button" onClick={() => setReproduciendo(true)} className="group absolute inset-0 w-full h-full" aria-label={`Reproducir: ${titulo || 'video'}`}>
          {portada
            ? <img src={portada} alt="" loading="lazy" onError={() => setPortadaFallida(true)} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            : <video src={`${video.src}#t=0.5`} preload="metadata" muted playsInline className="absolute inset-0 w-full h-full object-cover" aria-hidden="true" />}
          <span className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-black/20" />
          <span className="absolute inset-0 flex items-center justify-center"><IconoPlay /></span>
        </button>
      )}
    </div>
  );
};

export default ReproductorVideo;
