import { doc, getDoc, setDoc, updateDoc, deleteField } from 'firebase/firestore';
import { db } from '../../firebase';
import { DOCUMENTOS_IMAGEN } from '../../shared/imagenesSitio';

// Imágenes del portal subidas desde el panel: documentos ajustes/<documento> { [idEspacio]: dataUrl }
const refDocumento = (documento) => doc(db, 'ajustes', documento);

// Todas las imágenes subidas, de todos los documentos, en un solo objeto { [idEspacio]: dataUrl }
export const obtenerImagenesSitio = async () => {
  const instantaneas = await Promise.all(Object.keys(DOCUMENTOS_IMAGEN).map(d => getDoc(refDocumento(d))));
  return Object.assign({}, ...instantaneas.map(s => (s.exists() ? s.data() : {})));
};

export const guardarImagenSitio = (espacio, dataUrl) => setDoc(refDocumento(espacio.documento), { [espacio.id]: dataUrl }, { merge: true });

export const quitarImagenSitio = (espacio) => updateDoc(refDocumento(espacio.documento), { [espacio.id]: deleteField() });
