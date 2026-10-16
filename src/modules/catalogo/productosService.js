import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { db } from '../../firebase';

export const obtenerProductos = async () => {
  const querySnapshot = await getDocs(collection(db, 'productos'));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Solo productos visibles al público (REQ-F03-06). El filtro debe ir en la consulta:
// las reglas de Firestore rechazan leer la colección completa sin ser admin.
export const obtenerProductosActivos = async () => {
  const q = query(collection(db, 'productos'), where('activo', '==', true));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const crearProducto = (datos) => addDoc(collection(db, 'productos'), { ...datos, activo: true });

export const actualizarProducto = (id, datos) => updateDoc(doc(db, 'productos', id), datos);

export const cambiarEstadoProducto = (id, estadoActual) => updateDoc(doc(db, 'productos', id), { activo: !estadoActual });

// Eliminación definitiva. Los pedidos no se afectan: guardan su propia copia de nombre, precio y cantidad.
export const eliminarProducto = (id) => deleteDoc(doc(db, 'productos', id));
