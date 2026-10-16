import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { escucharSesion, obtenerPerfilUsuario } from './sesionService';

// Solo deja pasar a usuarios con rol "admin"; devuelve null mientras verifica
export const useVerificarAdmin = () => {
  const navigate = useNavigate();
  const [adminUser, setAdminUser] = useState(null);

  useEffect(() => {
    const unsubscribe = escucharSesion(async (user) => {
      if (user) {
        const perfil = await obtenerPerfilUsuario(user.uid);
        if (perfil && perfil.rol === 'admin') {
          setAdminUser({ uid: user.uid, nombre: perfil.nombre });
        } else { navigate('/'); }
      } else { navigate('/login'); }
    });
    return () => unsubscribe();
  }, [navigate]);

  return adminUser;
};
