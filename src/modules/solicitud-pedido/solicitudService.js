import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';

// Las solicitudes se guardan en "pedidos" con estado Pendiente (REQ-F05)
export const registrarSolicitud = (solicitud) => addDoc(collection(db, 'pedidos'), { ...solicitud, fecha: serverTimestamp() });

// Sin caracteres ambiguos (0/O, 1/I) para que el cliente pueda dictar el código
const CARACTERES_CODIGO = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

const generarSufijo = (longitud) => {
  const valores = crypto.getRandomValues(new Uint32Array(longitud));
  return Array.from(valores, v => CARACTERES_CODIGO[v % CARACTERES_CODIGO.length]).join('');
};

// REQ-F05-04: formato PREFIJO-AAAAMMDD-XXXXXX (32^6 ≈ 1 070 millones de combinaciones por día;
// con 100 solicitudes diarias la probabilidad de repetir un código es ≈ 0,0005 %)
export const generarCodigoSolicitud = (prefijo = 'REQ') => {
  const hoy = new Date();
  const fecha = `${hoy.getFullYear()}${String(hoy.getMonth() + 1).padStart(2, '0')}${String(hoy.getDate()).padStart(2, '0')}`;
  return `${prefijo}-${fecha}-${generarSufijo(6)}`;
};
