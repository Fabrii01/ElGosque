import { createUserWithEmailAndPassword, deleteUser, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import { normalizarTelefono } from './validacionRegistro';

// Crea la cuenta en Firebase Auth y guarda los datos exigidos en Firestore (REQ-F02-01).
// aceptaPrivacidad deja constancia del consentimiento para el tratamiento de datos (RN-15).
export const registrarCliente = async ({ nombre, negocio, ciudad, telefono, email, password }) => {
  const { user } = await createUserWithEmailAndPassword(auth, email, password);
  try {
    await setDoc(doc(db, 'usuarios', user.uid), {
      nombre: nombre.trim(),
      negocio: negocio.trim(),
      ciudad: ciudad.trim(),
      telefono: normalizarTelefono(telefono),
      email: user.email, // Firebase lo guarda en minúsculas; firestore.rules exige que coincida con el del token
      rol: 'cliente',
      aceptaPrivacidad: true,
      fechaRegistro: serverTimestamp(),
    });
  } catch (error) {
    // Sin perfil la cuenta quedaría inservible y el correo ocupado: se revierte para poder reintentar
    await deleteUser(user).catch(() => {});
    throw error;
  }

  // Si el envío falla el registro sigue siendo válido: el aviso de la página permite reenviarlo
  await sendEmailVerification(user).catch(error => console.error('No se pudo enviar la verificación de correo:', error.code));
};
