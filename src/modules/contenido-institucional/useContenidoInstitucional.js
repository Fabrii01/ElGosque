import { useState, useEffect } from 'react';
import { obtenerContenidoInstitucional } from './contenidoService';

// Contenido público del portal; infoWeb queda en null si no hay título registrado (REQ-F01-04)
export const useContenidoInstitucional = () => {
  const [infoWeb, setInfoWeb] = useState(null);
  const [cargandoInfo, setCargandoInfo] = useState(true);

  useEffect(() => {
    const cargarInfo = async () => {
      try {
        const data = await obtenerContenidoInstitucional();
        if (data && data.titulo) setInfoWeb(data);
      } catch (error) { console.error(error); }
      setCargandoInfo(false);
    };
    cargarInfo();
  }, []);

  return { infoWeb, cargandoInfo };
};
