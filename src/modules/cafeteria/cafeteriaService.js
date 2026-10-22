import { collection, doc, getDoc, getDocs, addDoc, updateDoc, setDoc, query, where } from 'firebase/firestore';
import { db } from '../../firebase';

const mapearDocs = (querySnapshot) => querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));

// ---------- Carta: colección "cafeteria" (REQ-F13-02) ----------

// Público: solo preparaciones activas (las reglas rechazan leer la colección completa sin ser admin)
export const obtenerPreparacionesActivas = async () => {
  const q = query(collection(db, 'cafeteria'), where('activo', '==', true));
  return mapearDocs(await getDocs(q));
};

export const obtenerPreparaciones = async () => mapearDocs(await getDocs(collection(db, 'cafeteria')));

export const crearPreparacion = (datos) => addDoc(collection(db, 'cafeteria'), { ...datos, activo: true });

export const actualizarPreparacion = (id, datos) => updateDoc(doc(db, 'cafeteria', id), datos);

export const cambiarEstadoPreparacion = (id, estadoActual) => updateDoc(doc(db, 'cafeteria', id), { activo: !estadoActual });

// ---------- Fotos del local: documento ajustes/cafeteria (REQ-F13-03) ----------

const refInfoCafeteria = () => doc(db, 'ajustes', 'cafeteria');

export const obtenerFotosCafeteria = async () => {
  const docSnap = await getDoc(refInfoCafeteria());
  return docSnap.exists() ? (docSnap.data().fotos || []) : [];
};

export const guardarFotosCafeteria = (fotos) => setDoc(refInfoCafeteria(), { fotos }, { merge: true });

// ---------- Videos de preparación: documento ajustes/cafeteriaVideos ----------
// Solo se guardan enlaces (YouTube o archivo de video); los videos no caben en Firestore.

const refVideos = () => doc(db, 'ajustes', 'cafeteriaVideos');

export const obtenerVideosPreparacion = async () => {
  const docSnap = await getDoc(refVideos());
  return docSnap.exists() ? (docSnap.data().videos || []) : [];
};

export const guardarVideosPreparacion = (videos) => setDoc(refVideos(), { videos });

// ---------- Subida de videos: Cloudinary (plan gratuito, sin tarjeta) ----------
// Cloud name y preset "unsigned" son datos públicos (no son claves). El preset limita carpeta y formatos.
// Nunca poner aquí el API Key ni el API Secret de Cloudinary.
const CLOUDINARY_NUBE = 'ukht0909';
const CLOUDINARY_PRESET = 'gosque_videos';

// Sube un video y devuelve su enlace https directo (.mp4/.webm). alProgresar recibe el porcentaje (0-100).
// Se usa XMLHttpRequest porque fetch no informa el progreso de subida.
export const subirVideoCafeteria = (archivo, alProgresar) => new Promise((resolve, reject) => {
  const datos = new FormData();
  datos.append('file', archivo);
  datos.append('upload_preset', CLOUDINARY_PRESET);

  const solicitud = new XMLHttpRequest();
  solicitud.open('POST', `https://api.cloudinary.com/v1_1/${CLOUDINARY_NUBE}/video/upload`);
  solicitud.upload.onprogress = e => { if (e.lengthComputable) alProgresar?.(Math.round((e.loaded / e.total) * 100)); };
  solicitud.onload = () => {
    let respuesta = {};
    try { respuesta = JSON.parse(solicitud.responseText); } catch { /* respuesta no JSON */ }
    if (solicitud.status >= 200 && solicitud.status < 300 && respuesta.secure_url) resolve(respuesta.secure_url);
    else reject(new Error(respuesta.error?.message || `Cloudinary respondió ${solicitud.status}`));
  };
  solicitud.onerror = () => reject(new Error('Sin conexión con Cloudinary.'));
  solicitud.send(datos);
});

// ---------- Ubicación ("Visítanos"): documento ajustes/cafeteriaUbicacion ----------

const refUbicacion = () => doc(db, 'ajustes', 'cafeteriaUbicacion');

export const obtenerUbicacionCafeteria = async () => {
  const docSnap = await getDoc(refUbicacion());
  return docSnap.exists() ? docSnap.data() : null;
};

export const guardarUbicacionCafeteria = (ubicacion) => setDoc(refUbicacion(), ubicacion);
