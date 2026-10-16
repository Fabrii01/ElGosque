import { Link } from 'react-router-dom';
import Logotipo from './Logotipo';

// Cabecera de las páginas secundarias del portal; children = acciones extra (p. ej. "Salir")
const CabeceraPortal = ({ children, mostrarVolver = true }) => (
  <nav className="sticky top-0 z-50 bg-cafe-crema/95 backdrop-blur-md border-b border-cafe-espresso/10 font-cuerpo">
    <div className="container mx-auto px-4 md:px-8 h-16 md:h-20 flex justify-between items-center gap-4">
      <Logotipo />
      <div className="flex items-center gap-3 md:gap-6 text-sm">
        <Link to="/#catalogo" className="hidden md:inline text-cafe-tostado hover:text-cafe-cereza transition-colors">Nuestros cafés</Link>
        <Link to="/productos-cafeteria" className="hidden md:inline text-cafe-tostado hover:text-cafe-cereza transition-colors">Cafetería</Link>
        {children}
        {mostrarVolver && (
          <Link to="/" className="bg-cafe-hoja text-cafe-crema px-4 py-2 rounded-sm hover:bg-cafe-selva transition-colors whitespace-nowrap">Volver al inicio</Link>
        )}
      </div>
    </div>
  </nav>
);

export default CabeceraPortal;
