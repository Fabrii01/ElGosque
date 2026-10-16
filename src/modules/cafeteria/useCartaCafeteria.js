import { useState, useEffect } from 'react';
import { obtenerPreparacionesActivas, obtenerFotosCafeteria } from './cafeteriaService';

// Datos públicos de la cafetería: carta activa y fotos del local
export const useCartaCafeteria = ({ incluirCarta = true } = {}) => {
  const [preparaciones, setPreparaciones] = useState([]);
  const [fotos, setFotos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      try {
        const [listaPreparaciones, listaFotos] = await Promise.all([
          incluirCarta ? obtenerPreparacionesActivas() : Promise.resolve([]),
          obtenerFotosCafeteria(),
        ]);
        setPreparaciones(listaPreparaciones);
        setFotos(listaFotos);
      } catch (error) {
        console.error('Error al cargar la cafetería:', error);
      }
      setCargando(false);
    };
    cargar();
  }, [incluirCarta]);

  return { preparaciones, fotos, cargando };
};
