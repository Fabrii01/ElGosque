import { useState, useEffect } from 'react';
import { obtenerContenidoInstitucional, guardarContenidoInstitucional } from './contenidoService';

// Formulario de contenido institucional del panel admin; carga cuando habilitado = true
export const useContenidoAdmin = (habilitado) => {
  const [contenidoInfo, setContenidoInfo] = useState({ titulo: '', descripcion: '' });

  useEffect(() => {
    if (!habilitado) return;
    const cargarContenidoWeb = async () => {
      const data = await obtenerContenidoInstitucional();
      if (data) setContenidoInfo(data);
    };
    cargarContenidoWeb();
  }, [habilitado]);

  const guardarContenidoWeb = async (e) => {
    e.preventDefault();
    await guardarContenidoInstitucional(contenidoInfo);
    alert("Contenido actualizado exitosamente");
  };

  return { contenidoInfo, setContenidoInfo, guardarContenidoWeb };
};
