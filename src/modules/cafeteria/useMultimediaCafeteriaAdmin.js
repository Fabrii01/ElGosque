import { useState, useEffect } from 'react';
import { obtenerVideosPreparacion, guardarVideosPreparacion, obtenerUbicacionCafeteria, guardarUbicacionCafeteria } from './cafeteriaService';
import { interpretarVideo, interpretarMapaEmbebido, interpretarEnlaceMaps } from './multimedia';

const videoVacio = { titulo: '', descripcion: '', url: '' };
const ubicacionVacia = { direccion: '', referencia: '', mapaEmbed: '', enlaceMaps: '', videoUrl: '' };

const nuevoId = () => crypto.getRandomValues(new Uint32Array(2)).join('-');

// Videos de preparación y ubicación de la cafetería en el panel admin; carga cuando habilitado = true
export const useMultimediaCafeteriaAdmin = (habilitado) => {
  const [videos, setVideos] = useState([]);
  const [nuevoVideo, setNuevoVideo] = useState(videoVacio);
  const [guardandoVideos, setGuardandoVideos] = useState(false);
  const [ubicacion, setUbicacion] = useState(ubicacionVacia);
  const [guardandoUbicacion, setGuardandoUbicacion] = useState(false);

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

  const agregarVideo = async (e) => {
    e.preventDefault();
    if (!interpretarVideo(nuevoVideo.url)) {
      return alert('Enlace no compatible. Usa un enlace de YouTube (video o short) o un archivo de video .mp4/.webm con https.');
    }
    const video = { id: nuevoId(), titulo: nuevoVideo.titulo.trim(), descripcion: nuevoVideo.descripcion.trim(), url: nuevoVideo.url.trim() };
    if (await persistirVideos([...videos, video])) setNuevoVideo(videoVacio);
  };

  const eliminarVideo = (id) => persistirVideos(videos.filter(v => v.id !== id));

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
    videos, nuevoVideo, setNuevoVideo, guardandoVideos, agregarVideo, eliminarVideo, moverVideo,
    ubicacion, setUbicacion, guardandoUbicacion, guardarUbicacion,
  };
};
