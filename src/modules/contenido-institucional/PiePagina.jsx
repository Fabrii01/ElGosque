import { Link } from 'react-router-dom';
import Logotipo from './Logotipo';
import { HORARIO_CAFETERIA } from '../cafeteria/carta';
import { NUMERO_WHATSAPP } from '../solicitud-pedido/whatsapp';

// "51925414135" -> "+51 925 414 135"
const telefonoLegible = `+${NUMERO_WHATSAPP.slice(0, 2)} ${NUMERO_WHATSAPP.slice(2).replace(/(\d{3})(?=\d)/g, '$1 ')}`;

const Columna = ({ titulo, children }) => (
  <div>
    <p className="text-xs uppercase tracking-[0.22em] text-cafe-mostaza mb-4">{titulo}</p>
    <div className="space-y-2.5 text-sm">{children}</div>
  </div>
);

// Pie de página del portal público
const PiePagina = () => (
  <footer className="bg-cafe-espresso text-cafe-crema/80 font-cuerpo border-t-4 border-cafe-mostaza">
    <div className="container mx-auto px-4 md:px-8 py-16 grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
      <div>
        <Logotipo claro />
        <p className="mt-6 text-sm leading-relaxed max-w-xs">Café orgánico cultivado en Amazonas, Perú, y servido en nuestra cafetería de Trujillo.</p>
      </div>
      <Columna titulo="Explorar">
        <Link to="/#origen" className="block hover:text-cafe-crema">Origen</Link>
        <Link to="/#catalogo" className="block hover:text-cafe-crema">Nuestros cafés</Link>
        <Link to="/trazabilidad" className="block hover:text-cafe-crema">Trazabilidad</Link>
        <Link to="/productos-cafeteria" className="block hover:text-cafe-crema">Cafetería</Link>
      </Columna>
      <Columna titulo="Cafetería">
        <p>Trujillo, La Libertad</p>
        <p>{HORARIO_CAFETERIA}</p>
        <Link to="/productos-cafeteria#visitanos" className="inline-block text-cafe-mostaza hover:text-cafe-crema">Cómo llegar →</Link>
      </Columna>
      <Columna titulo="Pedidos al por mayor">
        <p>WhatsApp: <a href={`https://wa.me/${NUMERO_WHATSAPP}`} target="_blank" rel="noopener noreferrer" className="text-cafe-crema hover:text-cafe-mostaza">{telefonoLegible}</a></p>
        <Link to="/login" className="block hover:text-cafe-crema">Crear cuenta de cliente</Link>
      </Columna>
    </div>
    <div className="border-t border-cafe-crema/10">
      <p className="container mx-auto px-4 md:px-8 py-6 text-xs text-cafe-crema/50">© {new Date().getFullYear()} El Gosque · Café orgánico especial</p>
    </div>
  </footer>
);

export default PiePagina;
