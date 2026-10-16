import { collection, doc, getDocs, updateDoc, query, where, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';

const mapearDocs = (querySnapshot) => querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

// Todas las solicitudes y pedidos, más recientes primero (panel admin)
export const obtenerPedidos = async () => {
  const q = query(collection(db, 'pedidos'), orderBy('fecha', 'desc'));
  return mapearDocs(await getDocs(q));
};

// Solo los pedidos del cliente indicado (REQ-F07-04), ordenados localmente por fecha
export const obtenerPedidosCliente = async (uid) => {
  const q = query(collection(db, 'pedidos'), where('clienteId', '==', uid));
  const historial = mapearDocs(await getDocs(q));
  historial.sort((a, b) => b.fecha?.seconds - a.fecha?.seconds);
  return historial;
};

export const actualizarPedido = (id, cambios) => updateDoc(doc(db, 'pedidos', id), { ...cambios, fechaActualizacion: serverTimestamp() });
