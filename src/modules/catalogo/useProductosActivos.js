import { useState, useEffect } from 'react';
import { obtenerProductosActivos } from './productosService';

export const useProductosActivos = () => {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarCatalogo = async () => {
      try {
        setProductos(await obtenerProductosActivos());
      } catch (error) {
        console.error('Error al cargar el catálogo:', error);
      }
      setCargando(false);
    };
    cargarCatalogo();
  }, []);

  return { productos, cargando };
};
