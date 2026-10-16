import { useState, useEffect } from 'react';
import { obtenerTrazabilidad, guardarTrazabilidad as guardarEnFirestore, ETAPAS_TRAZABILIDAD, REGION_POR_DEFECTO } from './trazabilidadService';

// Estado del formulario de trazabilidad del panel admin; carga cuando habilitado = true
export const useTrazabilidadAdmin = (habilitado) => {
  const [regionProcedencia, setRegionProcedencia] = useState(REGION_POR_DEFECTO);
  const [etapasTrazabilidad, setEtapasTrazabilidad] = useState(() => ETAPAS_TRAZABILIDAD.map(e => ({ nombre: e, descripcion: '', img: '' })));

  useEffect(() => {
    if (!habilitado) return;
    const cargarTrazabilidad = async () => {
      const data = await obtenerTrazabilidad();
      if (data) {
        setRegionProcedencia(data.region || REGION_POR_DEFECTO);
        if (data.etapas) setEtapasTrazabilidad(data.etapas);
      }
    };
    cargarTrazabilidad();
  }, [habilitado]);

  const handleEtapaChange = (index, campo, valor) => {
    const nuevasEtapas = [...etapasTrazabilidad];
    nuevasEtapas[index] = { ...nuevasEtapas[index], [campo]: valor };
    setEtapasTrazabilidad(nuevasEtapas);
  };

  const guardarTrazabilidad = async (e) => {
    e.preventDefault();
    await guardarEnFirestore(regionProcedencia, etapasTrazabilidad);
    alert("Trazabilidad actualizada exitosamente");
  };

  return { regionProcedencia, setRegionProcedencia, etapasTrazabilidad, handleEtapaChange, guardarTrazabilidad };
};
