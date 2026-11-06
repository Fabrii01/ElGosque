import { signInWithEmailAndPassword, signOut, onAuthStateChanged, sendEmailVerification, sendPasswordResetEmail, reload } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase';

export const iniciarSesion = (email, password) => signInWithEmailAndPassword(auth, email, password);

export const cerrarSesion = () => signOut(auth);

export const escucharSesion = (callback) => onAuthStateChanged(auth, callback);

export const enviarVerificacionCorreo = () => sendEmailVerification(auth.currentUser);

export const recuperarContrasena = (email) => sendPasswordResetEmail(auth, email);

// Consulta a Firebase si el correo ya se verificó y renueva el token, porque firestore.rules lee
// email_verified del token: sin renovarlo, un cliente recién verificado seguiría bloqueado.
export const comprobarCorreoVerificado = async () => {
  const usuario = auth.currentUser;
  if (!usuario) return false;
  await reload(usuario);
  if (!usuario.emailVerified) return false;
  await usuario.getIdToken(true);
  return true;
};

// Token para el intermediario de la IA, o null si el correo no está verificado.
// Solo se fuerza la renovación cuando el token guardado todavía dice "sin verificar".
export const obtenerTokenVerificado = async () => {
  const usuario = auth.currentUser;
  if (!usuario) return null;
  const { token, claims } = await usuario.getIdTokenResult();
  if (claims.email_verified) return token;
  return (await comprobarCorreoVerificado()) ? usuario.getIdToken() : null;
};

// Perfil del usuario guardado en la colección "usuarios" (incluye el rol)
export const obtenerPerfilUsuario = async (uid) => {
  const docSnap = await getDoc(doc(db, 'usuarios', uid));
  return docSnap.exists() ? docSnap.data() : null;
};
