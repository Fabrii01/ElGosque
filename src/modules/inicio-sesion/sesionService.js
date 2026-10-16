import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase';

export const iniciarSesion = (email, password) => signInWithEmailAndPassword(auth, email, password);

export const cerrarSesion = () => signOut(auth);

export const escucharSesion = (callback) => onAuthStateChanged(auth, callback);

// Perfil del usuario guardado en la colección "usuarios" (incluye el rol)
export const obtenerPerfilUsuario = async (uid) => {
  const docSnap = await getDoc(doc(db, 'usuarios', uid));
  return docSnap.exists() ? docSnap.data() : null;
};
