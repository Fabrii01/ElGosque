import { useState } from 'react';
import { Link } from 'react-router-dom';
import { cerrarSesion } from '../inicio-sesion/sesionService';
import Logotipo from './Logotipo';

const ENLACES = [
  { href: '#origen', texto: 'Origen' },
  { href: '#catalogo', texto: 'Nuestros cafés' },
  { href: '#cafeteria', texto: 'Cafetería' },
];

const enlaceClase = 'text-cafe-tostado hover:text-cafe-cereza transition-colors';

// Navegación del inicio: horizontal en escritorio y desplegable en celular
const BarraNavegacion = ({ userData, cantidadCarrito, onAbrirCarrito }) => {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const cerrarMenu = () => setMenuAbierto(false);
  const nombreCorto = userData?.nombre?.split(' ')[0] || 'Cliente';

  return (
    <nav className="sticky top-0 z-50 bg-cafe-crema/95 backdrop-blur-md border-b border-cafe-espresso/10 font-cuerpo">
      <div className="container mx-auto px-4 md:px-8 h-16 md:h-20 flex justify-between items-center gap-4">
        <Logotipo />

        {/* ESCRITORIO */}
        <div className="hidden lg:flex items-center gap-8 text-sm">
          {ENLACES.map(({ href, texto }) => <a key={href} href={href} className={enlaceClase}>{texto}</a>)}
          <Link to="/trazabilidad" className={enlaceClase}>Trazabilidad</Link>
          <span className="h-5 border-l border-cafe-espresso/15" aria-hidden="true" />

          {userData ? (
            <div className="flex items-center gap-5">
              {userData.rol === 'admin' && <Link to="/admin" className="text-cafe-cereza font-medium hover:underline underline-offset-4">Panel admin</Link>}
              <Link to="/mis-pedidos" className={enlaceClase}>Mis pedidos</Link>
              <button onClick={onAbrirCarrito} className="border border-cafe-espresso text-cafe-espresso px-4 py-2 rounded-sm hover:bg-cafe-espresso hover:text-cafe-crema transition-colors">
                Mi pedido <span className="tabular-nums">({cantidadCarrito})</span>
              </button>
              <button onClick={cerrarSesion} className="text-cafe-tostado/80 hover:text-cafe-cereza" title={`Sesión de ${nombreCorto}`}>Salir</button>
            </div>
          ) : (
            <Link to="/login" className="bg-cafe-espresso text-cafe-crema px-5 py-2.5 rounded-sm hover:bg-cafe-cereza transition-colors">Ingresar</Link>
          )}
        </div>

        {/* CELULAR Y TABLET */}
        <div className="flex lg:hidden items-center gap-2">
          {userData && (
            <button onClick={onAbrirCarrito} className="border border-cafe-espresso text-cafe-espresso text-sm px-3 py-1.5 rounded-sm" aria-label={`Abrir mi pedido (${cantidadCarrito} productos)`}>
              Pedido ({cantidadCarrito})
            </button>
          )}
          <button
            onClick={() => setMenuAbierto(!menuAbierto)}
            className="p-2 text-cafe-espresso"
            aria-label={menuAbierto ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={menuAbierto}
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              {menuAbierto
                ? <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
                : <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h10" />}
            </svg>
          </button>
        </div>
      </div>

      {menuAbierto && (
        <div className="lg:hidden border-t border-cafe-espresso/10 bg-cafe-crema">
          <div className="container mx-auto px-4 py-4 flex flex-col text-base">
            {ENLACES.map(({ href, texto }) => (
              <a key={href} href={href} onClick={cerrarMenu} className="py-3 border-b border-cafe-espresso/10 text-cafe-espresso">{texto}</a>
            ))}
            <Link to="/trazabilidad" className="py-3 border-b border-cafe-espresso/10 text-cafe-espresso">Trazabilidad</Link>

            {userData ? (
              <>
                <p className="pt-5 pb-2 text-xs uppercase tracking-[0.2em] text-cafe-tostado">Hola, {nombreCorto}</p>
                <Link to="/mis-pedidos" className="py-3 border-b border-cafe-espresso/10 text-cafe-espresso">Mis pedidos</Link>
                {userData.rol === 'admin' && <Link to="/admin" className="py-3 border-b border-cafe-espresso/10 text-cafe-cereza font-medium">Panel admin</Link>}
                <button onClick={() => { cerrarMenu(); cerrarSesion(); }} className="py-3 text-left text-cafe-tostado">Salir</button>
              </>
            ) : (
              <Link to="/login" className="mt-4 bg-cafe-espresso text-cafe-crema text-center py-3 rounded-sm">Ingresar</Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default BarraNavegacion;
