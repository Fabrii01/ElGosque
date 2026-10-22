import { useState, useEffect } from 'react';
import { obtenerVideosPreparacion, guardarVideosPreparacion, obtenerUbicacionCafeteria, guardarUbicacionCafeteria, subirVideoCafeteria } from './cafeteriaService';
import { interpretarVideo, interpretarMapaEmbebido, interpretarEnlaceMaps, validarArchivoVideo } from './multimedia';
import { comprimirImagenHasta } from '../../shared/utils/imagenes';

// miniatura = imagen propia en base64 (opcional); los videos comparten el documento ajustes/cafeteriaVideos (1 MB)
const MAX_CARACTERES_MINIATURA = 60000;

const videoVacio = { titulo: '', descripcion: '', url: '', miniatura: '' };
const ubicacionVacia = { direccion: '', referencia: '', mapaEmbed: '', enlaceMaps: '', videoUrl: '', videoMiniatura: '' };

const nuevoId = () => crypto.getRandomValues(new Uint32Array(2)).join('-');

// Videos de preparación y ubicación de la cafetería en el panel admin; carga cuando habilitado = true
export const useMultimediaCafeteriaAdmin = (habilitado) => {
  const [videos, setVideos] = useState([]);
  const [nuevoVideo, setNuevoVideo] = useState(videoVacio);
  const [idEdicionVideo, setIdEdicionVideo] = useState(null); // video que se está editando (o null = agregar)
  const [guardandoVideos, setGuardandoVideos] = useState(false);
  const [ubicacion, setUbicacion] = useState(ubicacionVacia);
  const [guardandoUbicacion, setGuardandoUbicacion] = useState(false);
  // Subida en curso: { destino: 'preparacion' | 'ubicacion', progreso: 0-100 } o null
  const [subidaVideo, setSubidaVideo] = useState(null);
  const [procesandoMiniatura, setProcesandoMiniatura] = useState(null); // destino cuya miniatura se comprime

  useEffect(() => {
    if (!habilitado) return;
    obtenerVideosPreparacion().then(setVideos).catch(error => console.error('Error al cargar videos:', error));
    obtenerUbicacionCafeteria()
      .then(datos => { if (datos) setUbicacion({ ...ubicacionVacia, ...datos }); })
      .catch(error => console.error('Error al cargar la ubicación:', error));
  }, [habilitado]);

  const persistirVideos = async (lista) => {
    setGuardandoVideos(true);
    try {
      await guardarVideosPreparacion(lista);
      setVideos(lista);
      return true;
    } catch (error) {
      console.error(error);
      alert('No se pudieron guardar los videos.');
      return false;
    } finally {
      setGuardandoVideos(false);
    }
  };

  // Agrega un video nuevo o, si idEdicionVideo tiene valor, reemplaza ese video conservando su posición
  const guardarVideo = async (e) => {
    e.preventDefault();
    if (!interpretarVideo(nuevoVideo.url)) {
      return alert('Enlace no compatible. Usa un enlace de YouTube (video o short) o un archivo de video .mp4/.webm con https.');
    }
    const datos = { titulo: nuevoVideo.titulo.trim(), descripcion: nuevoVideo.descripcion.trim(), url: nuevoVideo.url.trim(), miniatura: nuevoVideo.miniatura || '' };
    const lista = idEdicionVideo
      ? videos.map(v => (v.id === idEdicionVideo ? { ...v, ...datos } : v))
      : [...videos, { id: nuevoId(), ...datos }];
    if (await persistirVideos(lista)) cancelarEdicionVideo();
  };

  const editarVideo = (video) => {
    setIdEdicionVideo(video.id);
    setNuevoVideo({ titulo: video.titulo || '', descripcion: video.descripcion || '', url: video.url, miniatura: video.miniatura || '' });
  };

  const cancelarEdicionVideo = () => { setIdEdicionVideo(null); setNuevoVideo(videoVacio); };

  // Sube el archivo arrastrado y deja su enlace en el formulario correspondiente (falta pulsar Agregar/Guardar)
  const subirArchivoVideo = async (archivo, destino) => {
    const error = validarArchivoVideo(archivo);
    if (error) return alert(error);
    setSubidaVideo({ destino, progreso: 0 });
    try {
      const url = await subirVideoCafeteria(archivo, progreso => setSubidaVideo({ destino, progreso }));
      if (destino === 'ubicacion') setUbicacion(actual => ({ ...actual, videoUrl: url }));
      else setNuevoVideo(actual => ({ ...actual, url, titulo: actual.titulo || archivo.name.replace(/\.[^.]+$/, '') }));
    } catch (error) {
      console.error(error);
      alert(`No se pudo subir el video: ${error.message}`);
    } finally {
      setSubidaVideo(null);
    }
  };

  // Miniatura propia (opcional): se comprime y queda en el formulario; '' = volver a la automática
  const cambiarMiniatura = (destino, imagen) => {
    if (destino === 'ubicacion') setUbicacion(actual => ({ ...actual, videoMiniatura: imagen }));
    else setNuevoVideo(actual => ({ ...actual, miniatura: imagen }));
  };

  const subirMiniatura = async (archivo, destino) => {
    setProcesandoMiniatura(destino);
    try {
      cambiarMiniatura(destino, await comprimirImagenHasta(archivo, MAX_CARACTERES_MINIATURA));
    } catch (error) {
      alert(error.message);
    } finally {
      setProcesandoMiniatura(null);
    }
  };

  const eliminarVideo = async (id) => {
    if (await persistirVideos(videos.filter(v => v.id !== id)) && id === idEdicionVideo) cancelarEdicionVideo();
  };

  // Cambia el orden en que aparecen los videos en la web
  const moverVideo = (indice, direccion) => {
    const destino = indice + direccion;
    if (destino < 0 || destino >= videos.length) return;
    const lista = [...videos];
    [lista[indice], lista[destino]] = [lista[destino], lista[indice]];
    persistirVideos(lista);
  };

  const guardarUbicacion = async (e) => {
    e.preventDefault();
    if (ubicacion.mapaEmbed.trim() && !interpretarMapaEmbebido(ubicacion.mapaEmbed)) {
      return alert('El mapa debe ser el código de "Compartir > Insertar un mapa" de Google Maps (o su enlace https://www.google.com/maps/embed?...).');
    }
    if (ubicacion.enlaceMaps.trim() && !interpretarEnlaceMaps(ubicacion.enlaceMaps)) {
      return alert('El enlace para abrir en Google Maps no es válido (ej. https://maps.app.goo.gl/...).');
    }
    if (ubicacion.videoUrl.trim() && !interpretarVideo(ubicacion.videoUrl)) {
      return alert('El video de ubicación debe ser un enlace de YouTube o un archivo de video con https.');
    }
    setGuardandoUbicacion(true);
    try {
      // Del código <iframe> pegado solo se guarda el src validado
      const datos = Object.fromEntries(Object.entries(ubicacion).map(([k, v]) => [k, String(v).trim()]));
      datos.mapaEmbed = interpretarMapaEmbebido(datos.mapaEmbed) || '';
      await guardarUbicacionCafeteria(datos);
      setUbicacion(datos);
      alert('Ubicación actualizada');
    } catch (error) {
      console.error(error);
      alert('No se pudo guardar la ubicación.');
    } finally {
      setGuardandoUbicacion(false);
    }
  };

  return {
    videos, nuevoVideo, setNuevoVideo, guardandoVideos, guardarVideo, eliminarVideo, moverVideo,
    idEdicionVideo, editarVideo, cancelarEdicionVideo,
    procesandoMiniatura, subirMiniatura, cambiarMiniatura,
    subidaVideo, subirArchivoVideo,
    ubicacion, setUbicacion, guardandoUbicacion, guardarUbicacion,
  };
};
