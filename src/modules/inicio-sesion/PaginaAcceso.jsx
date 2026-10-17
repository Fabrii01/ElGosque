import { useState } from 'react';
import FormInicioSesion from './FormInicioSesion';
import FormRegistroCliente from '../registro-clientes/FormRegistroCliente';
import FranjaSuperior from '../contenido-institucional/FranjaSuperior';
import CabeceraPortal from '../contenido-institucional/CabeceraPortal';
import { IlustracionCafetal } from '../../shared/components/portal/Ilustraciones';

const PaginaAcceso = () => {
  const [isRegister, setIsRegister] = useState(false);

  return (
    <div className="papel min-h-screen font-cuerpo text-cafe-espresso">
      <FranjaSuperior />
      <CabeceraPortal />

      <main className="container mx-auto px-4 md:px-8 py-10 md:py-16">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-2 rounded-md overflow-hidden shadow-xl">
          {/* Panel de marca (escritorio) */}
          <div className="hidden lg:flex flex-col bg-cafe-selva text-cafe-crema">
            <div className="p-10">
              <p className="text-xs uppercase tracking-[0.25em] text-cafe-mostaza">Clientes El Gosque</p>
              <h1 className="font-titulo font-light text-4xl mt-4 leading-tight">Pide café de origen<br />para tu negocio</h1>
              <ul className="mt-6 space-y-2 text-sm text-cafe-crema/90">
                <li>· Solicita pedidos de nuestras variedades</li>
                <li>· Revisa el estado de tus pedidos</li>
                <li>· Usa el asistente virtual de El Gosque</li>
              </ul>
            </div>
            <IlustracionCafetal className="w-full flex-1 min-h-[14rem] block" />
          </div>

          {/* Formulario */}
          <div className="bg-cafe-leche p-7 sm:p-10 border-t-8 lg:border-t-0 lg:border-l-8 border-cafe-hoja">
            <h2 className="font-titulo text-3xl font-semibold text-cafe-espresso tracking-tight">
              {isRegister ? 'Crear cuenta' : 'Iniciar sesión'}
            </h2>
            <p className="text-sm text-cafe-tostado mt-1 mb-6">
              {isRegister ? 'Regístrate para solicitar pedidos.' : 'Ingresa con tu correo y contraseña.'}
            </p>

            {isRegister ? <FormRegistroCliente /> : <FormInicioSesion />}

            <div className="mt-8 pt-6 border-t border-cafe-espresso/10 text-center">
              <button onClick={() => setIsRegister(!isRegister)} className="text-cafe-tostado hover:text-cafe-cereza text-sm font-semibold transition">
                {isRegister ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate aquí'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PaginaAcceso;
