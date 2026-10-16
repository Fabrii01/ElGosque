import { NUMERO_WHATSAPP } from '../solicitud-pedido/whatsapp';
import GranoCafe from '../../shared/components/portal/GranoCafe';

// Franja verde sobre la navegación del portal, con el contacto para pedidos al por mayor
const FranjaSuperior = () => (
  <div className="bg-cafe-hoja text-cafe-crema font-cuerpo text-xs">
    <div className="container mx-auto px-4 md:px-8 py-2 flex items-center justify-center sm:justify-between gap-4">
      <p className="hidden sm:flex items-center gap-2 tracking-wide">
        <GranoCafe className="w-3 h-4 text-cafe-mostaza" /> Café orgánico de Amazonas, Perú
      </p>
      <a href={`https://wa.me/${NUMERO_WHATSAPP}`} target="_blank" rel="noopener noreferrer" className="hover:underline underline-offset-4">
        Pedidos al por mayor por WhatsApp →
      </a>
    </div>
  </div>
);

export default FranjaSuperior;
