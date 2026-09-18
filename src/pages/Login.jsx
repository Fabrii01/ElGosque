import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth, db } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

const Login = () => {
  const [isRegister, setIsRegister] = useState(false);
  
  // Estados para REQ-F02-01
  const [nombre, setNombre] = useState('');
  const [negocio, setNegocio] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isRegister) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        // Guardar todos los datos exigidos en Firestore (REQ-F02-01)
        await setDoc(doc(db, "usuarios", userCredential.user.uid), {
          nombre: nombre,
          negocio: negocio,
          ciudad: ciudad,
          telefono: telefono,
          email: email,
          rol: "cliente" 
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
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
    <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA] p-4 py-12">
      <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md border border-gray-100">
        <h2 className="text-3xl font-black text-gray-900 mb-6 text-center tracking-tight">
          {isRegister ? 'Crear Cuenta' : 'Iniciar Sesión'}
        </h2>
        
        {error && <p className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm font-medium border border-red-100">{error}</p>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Nombre Completo</label>
                <input type="text" className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-gosque-green outline-none transition" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Negocio</label>
                  <input type="text" placeholder="Ej. Cafetería" className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-gosque-green outline-none transition" value={negocio} onChange={(e) => setNegocio(e.target.value)} required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Ciudad</label>
                  <input type="text" className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-gosque-green outline-none transition" value={ciudad} onChange={(e) => setCiudad(e.target.value)} required />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Teléfono</label>
                <input type="tel" className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-gosque-green outline-none transition" value={telefono} onChange={(e) => setTelefono(e.target.value)} required />
              </div>
            </>
          )}
          
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Correo Electrónico</label>
            <input type="email" className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-gosque-green outline-none transition" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Contraseña</label>
            <input type="password" minLength="6" className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-gosque-green outline-none transition" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          
          <button type="submit" className="w-full bg-gosque-green text-white font-bold py-4 rounded-xl hover:bg-green-700 transition shadow-lg shadow-green-900/20 mt-4">
            {isRegister ? 'Registrarme' : 'Ingresar'}
          </button>
        </form>

        <div className="mt-8 text-center space-y-4">
          <button onClick={() => { setIsRegister(!isRegister); setError(''); }} className="text-gosque-brown hover:text-amber-700 text-sm font-bold transition">
            {isRegister ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate aquí'}
          </button>
          <div className="block">
            <Link to="/" className="text-gray-400 hover:text-gray-800 text-sm font-medium transition">← Volver al inicio</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;