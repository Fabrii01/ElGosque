import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registrarCliente } from './registroService';
import AvisoPrivacidad from './AvisoPrivacidad';

const FormRegistroCliente = () => {
  // Estados para REQ-F02-01
  const [nombre, setNombre] = useState('');
  const [negocio, setNegocio] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [aceptaPrivacidad, setAceptaPrivacidad] = useState(false);

  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await registrarCliente({ nombre, negocio, ciudad, telefono, email, password });
      navigate('/');
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        setError('Este correo ya está registrado. Inicia sesión.');
      } else {
        setError('Error: Verifica tus credenciales o el formato del correo.');
      }
    }
  };

  return (
    <>
      {error && <p className="bg-red-50 text-red-600 p-4 rounded-sm mb-6 text-sm font-medium border border-red-100">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-cafe-tostado uppercase tracking-wide mb-1">Nombre Completo</label>
          <input type="text" className="w-full bg-cafe-crema border border-cafe-espresso/15 p-3 rounded-sm focus:ring-2 focus:ring-cafe-hoja outline-none transition" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-cafe-tostado uppercase tracking-wide mb-1">Negocio</label>
            <input type="text" placeholder="Ej. Cafetería" className="w-full bg-cafe-crema border border-cafe-espresso/15 p-3 rounded-sm focus:ring-2 focus:ring-cafe-hoja outline-none transition" value={negocio} onChange={(e) => setNegocio(e.target.value)} required />
          </div>
          <div>
            <label className="block text-xs font-bold text-cafe-tostado uppercase tracking-wide mb-1">Ciudad</label>
            <input type="text" className="w-full bg-cafe-crema border border-cafe-espresso/15 p-3 rounded-sm focus:ring-2 focus:ring-cafe-hoja outline-none transition" value={ciudad} onChange={(e) => setCiudad(e.target.value)} required />
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-cafe-tostado uppercase tracking-wide mb-1">Teléfono</label>
          <input type="tel" className="w-full bg-cafe-crema border border-cafe-espresso/15 p-3 rounded-sm focus:ring-2 focus:ring-cafe-hoja outline-none transition" value={telefono} onChange={(e) => setTelefono(e.target.value)} required />
        </div>
        <div>
          <label className="block text-xs font-bold text-cafe-tostado uppercase tracking-wide mb-1">Correo Electrónico</label>
          <input type="email" className="w-full bg-cafe-crema border border-cafe-espresso/15 p-3 rounded-sm focus:ring-2 focus:ring-cafe-hoja outline-none transition" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label className="block text-xs font-bold text-cafe-tostado uppercase tracking-wide mb-1">Contraseña</label>
          <input type="password" minLength="6" className="w-full bg-cafe-crema border border-cafe-espresso/15 p-3 rounded-sm focus:ring-2 focus:ring-cafe-hoja outline-none transition" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>

        {/* RN-15: consentimiento para el tratamiento de datos */}
        <AvisoPrivacidad />
        <label className="flex items-start gap-3 text-sm text-cafe-tostado cursor-pointer">
          <input type="checkbox" required className="mt-1 w-4 h-4 accent-gosque-green" checked={aceptaPrivacidad} onChange={(e) => setAceptaPrivacidad(e.target.checked)} />
          <span>He leído el aviso de privacidad y acepto el tratamiento de mis datos para gestionar mis solicitudes y pedidos.</span>
        </label>

        <button type="submit" className="w-full bg-cafe-hoja text-white font-bold py-4 rounded-sm hover:bg-cafe-selva transition shadow-lg shadow-green-900/20 mt-4">
          Registrarme
        </button>
      </form>
    </>
  );
};

export default FormRegistroCliente;
