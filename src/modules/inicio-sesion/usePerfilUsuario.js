import { useState, useEffect } from 'react';
import { escucharSesion, obtenerPerfilUsuario } from './sesionService';

// Devuelve el perfil del usuario logueado ({ uid, ...datos }) o null
export const usePerfilUsuario = () => {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const unsubscribe = escucharSesion(async (currentUser) => {
      if (currentUser) {
        const perfil = await obtenerPerfilUsuario(currentUser.uid);
        if (perfil) setUserData({ uid: currentUser.uid, ...perfil });
      } else {
        setUserData(null);
      }
    });
    return () => unsubscribe();
  }, []);

  return userData;
};
