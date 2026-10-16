import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../firebase';

// Crea la cuenta en Firebase Auth y guarda los datos exigidos en Firestore (REQ-F02-01).
// aceptaPrivacidad deja constancia del consentimiento para el tratamiento de datos (RN-15).
export const registrarCliente = async ({ nombre, negocio, ciudad, telefono, email, password }) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  await setDoc(doc(db, 'usuarios', userCredential.user.uid), {
    nombre,
    negocio,
    ciudad,
    telefono,
    email,
    rol: 'cliente',
    aceptaPrivacidad: true,
    fechaRegistro: serverTimestamp(),
  });
};
