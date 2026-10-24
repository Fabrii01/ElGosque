import { useState, useEffect } from 'react';
import { obtenerTrazabilidad } from './trazabilidadService';
import { descripcionPorDefecto } from './etapas';

export const useTrazabilidadPublica = () => {
  const [region, setRegion] = useState('');
  const [procesos, setProcesos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarTrazabilidad = async () => {
      try {
        const data = await obtenerTrazabilidad();
        if (data) {
          setRegion(data.region || 'No especificada');
          // Etapas sin descripción guardada muestran el texto base de El Gosque
          setProcesos((data.etapas || []).map(e => ({ ...e, descripcion: e.descripcion || descripcionPorDefecto(e.nombre) })));
        }
      } catch (error) {
        console.error("Error al cargar trazabilidad", error);
      }
      setCargando(false);
    };
    cargarTrazabilidad();
  }, []);

  return { region, procesos, cargando };
};
