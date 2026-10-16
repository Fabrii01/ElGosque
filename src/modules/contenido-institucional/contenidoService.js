import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';

const refInstitucional = () => doc(db, 'ajustes', 'institucional');

// Devuelve { titulo, descripcion } o null si no existe (REQ-F01)
export const obtenerContenidoInstitucional = async () => {
  const docSnap = await getDoc(refInstitucional());
  return docSnap.exists() ? docSnap.data() : null;
};

export const guardarContenidoInstitucional = (contenido) => setDoc(refInstitucional(), contenido);
