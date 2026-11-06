import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { iniciarSesion, recuperarContrasena } from './sesionService';

const FormInicioSesion = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setAviso('');
    try {
      await iniciarSesion(email, password);
      navigate('/');
    } catch {
      setError('Error: Verifica tus credenciales o el formato del correo.');
    }
  };

  // El mensaje es el mismo exista o no la cuenta, para no revelar qué correos están registrados
  const recuperar = async () => {
    setError('');
    setAviso('');
    if (!email.trim()) {
      setError('Escribe tu correo para enviarte el enlace.');
      return;
    }
    try {
      await recuperarContrasena(email.trim());
    } catch (error) {
      if (error.code === 'auth/invalid-email') return setError('El formato del correo no es válido.');
      if (error.code !== 'auth/user-not-found') return setError('No se pudo enviar el enlace. Inténtalo de nuevo en unos minutos.');
    }
    setAviso('Si el correo está registrado, te enviamos un enlace para restablecer tu contraseña. Revisa también la carpeta de spam.');
  };

  return (
    <>
      {aviso && <p role="status" className="bg-cafe-hoja/10 text-cafe-selva p-4 rounded-sm mb-6 text-sm font-medium border border-cafe-hoja/30">{aviso}</p>}
      {error && <p className="bg-red-50 text-red-600 p-4 rounded-sm mb-6 text-sm font-medium border border-red-100">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-cafe-tostado uppercase tracking-wide mb-1">Correo Electrónico</label>
          <input type="email" className="w-full bg-cafe-crema border border-cafe-espresso/15 p-3 rounded-sm focus:ring-2 focus:ring-cafe-hoja outline-none transition" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label className="block text-xs font-bold text-cafe-tostado uppercase tracking-wide mb-1">Contraseña</label>
          <input type="password" minLength="6" className="w-full bg-cafe-crema border border-cafe-espresso/15 p-3 rounded-sm focus:ring-2 focus:ring-cafe-hoja outline-none transition" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button type="button" onClick={recuperar} className="mt-2 text-xs font-semibold text-cafe-tostado hover:text-cafe-cereza transition">¿Olvidaste tu contraseña?</button>
        </div>

        <button type="submit" className="w-full bg-cafe-hoja text-white font-bold py-4 rounded-sm hover:bg-cafe-selva transition shadow-lg shadow-green-900/20 mt-4">
          Ingresar
        </button>
      </form>
    </>
  );
};

export default FormInicioSesion;
