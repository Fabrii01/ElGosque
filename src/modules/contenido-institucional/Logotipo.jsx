import { Link } from 'react-router-dom';

// Logotipo tipográfico del portal; siempre lleva al inicio
const Logotipo = ({ claro = false }) => (
  <Link to="/" className="group leading-none" aria-label="El Gosque, ir al inicio">
    <span className={`block font-titulo text-2xl md:text-[1.7rem] font-semibold tracking-tight ${claro ? 'text-cafe-crema' : 'text-cafe-espresso'}`}>
      El Gosque
    </span>
    <span className={`block font-cuerpo text-[9px] md:text-[10px] uppercase tracking-[0.3em] mt-1 ${claro ? 'text-cafe-mostaza' : 'text-cafe-cereza'}`}>
      Café de origen · Amazonas
    </span>
  </Link>
);

export default Logotipo;
