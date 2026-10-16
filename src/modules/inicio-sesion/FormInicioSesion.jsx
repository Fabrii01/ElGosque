import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { iniciarSesion } from './sesionService';

const FormInicioSesion = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await iniciarSesion(email, password);
      navigate('/');
    } catch {
      setError('Error: Verifica tus credenciales o el formato del correo.');
    }
  };

  return (
    <>
      {error && <p className="bg-red-50 text-red-600 p-4 rounded-sm mb-6 text-sm font-medium border border-red-100">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-cafe-tostado uppercase tracking-wide mb-1">Correo Electrónico</label>
          <input type="email" className="w-full bg-cafe-crema border border-cafe-espresso/15 p-3 rounded-sm focus:ring-2 focus:ring-cafe-hoja outline-none transition" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label className="block text-xs font-bold text-cafe-tostado uppercase tracking-wide mb-1">Contraseña</label>
          <input type="password" minLength="6" className="w-full bg-cafe-crema border border-cafe-espresso/15 p-3 rounded-sm focus:ring-2 focus:ring-cafe-hoja outline-none transition" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>

        <button type="submit" className="w-full bg-cafe-hoja text-white font-bold py-4 rounded-sm hover:bg-cafe-selva transition shadow-lg shadow-green-900/20 mt-4">
          Ingresar
        </button>
      </form>
    </>
  );
};

export default FormInicioSesion;
