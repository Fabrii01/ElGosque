import { useState, useEffect } from 'react';
import { obtenerTrazabilidad, guardarTrazabilidad as guardarEnFirestore, ETAPAS_TRAZABILIDAD, REGION_POR_DEFECTO } from './trazabilidadService';
import { comprimirImagenHasta } from '../../shared/utils/imagenes';
import { descripcionPorDefecto } from './etapas';

// Las imágenes de las 9 etapas comparten el documento ajustes/trazabilidad (1 MB): ~105 000 caracteres cada una
const MAX_CARACTERES_IMAGEN_ETAPA = Math.floor(950000 / ETAPAS_TRAZABILIDAD.length);

// Estado del formulario de trazabilidad del panel admin; carga cuando habilitado = true
export const useTrazabilidadAdmin = (habilitado) => {
  const [regionProcedencia, setRegionProcedencia] = useState(REGION_POR_DEFECTO);
  const [etapasTrazabilidad, setEtapasTrazabilidad] = useState(() => ETAPAS_TRAZABILIDAD.map(e => ({ nombre: e, descripcion: descripcionPorDefecto(e), img: '' })));

  useEffect(() => {
    if (!habilitado) return;
    const cargarTrazabilidad = async () => {
      const data = await obtenerTrazabilidad();
      if (data) {
        setRegionProcedencia(data.region || REGION_POR_DEFECTO);
        if (data.etapas) setEtapasTrazabilidad(data.etapas.map(e => ({ ...e, descripcion: e.descripcion || descripcionPorDefecto(e.nombre) })));
      }
    };
    cargarTrazabilidad();
  }, [habilitado]);

  // Reemplaza las descripciones por los textos base de El Gosque (conserva las imágenes); se guarda al pulsar "Actualizar Trazabilidad"
  const usarTextosElGosque = () => {
    setEtapasTrazabilidad(actuales => actuales.map(e => ({ ...e, descripcion: descripcionPorDefecto(e.nombre) || e.descripcion })));
  };

  // Índice de la etapa cuya imagen se está comprimiendo (o null)
  const [procesandoEtapa, setProcesandoEtapa] = useState(null);

  const handleEtapaChange = (index, campo, valor) => {
    setEtapasTrazabilidad(actuales => actuales.map((etapa, i) => (i === index ? { ...etapa, [campo]: valor } : etapa)));
  };

  // Imagen arrastrada: se comprime en el navegador y se guarda en base64 al pulsar "Actualizar Trazabilidad"
  const subirImagenEtapa = async (index, archivo) => {
    setProcesandoEtapa(index);
    try {
      handleEtapaChange(index, 'img', await comprimirImagenHasta(archivo, MAX_CARACTERES_IMAGEN_ETAPA));
    } catch (error) {
      alert(error.message);
    } finally {
      setProcesandoEtapa(null);
    }
  };

  const guardarTrazabilidad = async (e) => {
    e.preventDefault();
    try {
      await guardarEnFirestore(regionProcedencia, etapasTrazabilidad);
      alert("Trazabilidad actualizada exitosamente");
    } catch (error) {
      console.error(error);
      alert('No se pudo guardar la trazabilidad. Si el problema persiste, usa imágenes más livianas.');
    }
  };

  return { regionProcedencia, setRegionProcedencia, etapasTrazabilidad, handleEtapaChange, guardarTrazabilidad, procesandoEtapa, subirImagenEtapa, usarTextosElGosque };
};
