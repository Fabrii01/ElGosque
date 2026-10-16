import { useState, useEffect } from 'react';
import { obtenerTrazabilidad } from './trazabilidadService';

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
          setProcesos(data.etapas || []);
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
