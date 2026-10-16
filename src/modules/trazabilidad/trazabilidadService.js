import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';

export const ETAPAS_TRAZABILIDAD = ['Semilla', 'Cultivo', 'Cosecha', 'Despulpado', 'Fermentación', 'Lavado', 'Secado', 'Tostado', 'Empaquetado'];
export const REGION_POR_DEFECTO = 'Rodríguez de Mendoza, Amazonas';

const refTrazabilidad = () => doc(db, 'ajustes', 'trazabilidad');

// Devuelve { region, etapas } o null si aún no se configuró (REQ-F04)
export const obtenerTrazabilidad = async () => {
  const docTraza = await getDoc(refTrazabilidad());
  return docTraza.exists() ? docTraza.data() : null;
};

export const guardarTrazabilidad = (region, etapas) => setDoc(refTrazabilidad(), { region, etapas });
