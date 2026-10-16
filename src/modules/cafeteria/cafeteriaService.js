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

// ---------- Ubicación ("Visítanos"): documento ajustes/cafeteriaUbicacion ----------

const refUbicacion = () => doc(db, 'ajustes', 'cafeteriaUbicacion');

export const obtenerUbicacionCafeteria = async () => {
  const docSnap = await getDoc(refUbicacion());
  return docSnap.exists() ? docSnap.data() : null;
};

export const guardarUbicacionCafeteria = (ubicacion) => setDoc(refUbicacion(), ubicacion);
