import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase';

// Clientes registrados (solo admin puede leer la colección completa según las reglas)
export const obtenerClientes = async () => {
  const q = query(collection(db, 'usuarios'), where('rol', '==', 'cliente'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(d => ({ uid: d.id, ...d.data() }));
};
