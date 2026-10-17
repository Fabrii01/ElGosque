import { Link } from 'react-router-dom';

// Se muestra en lugar del asistente cuando no hay sesión iniciada.
// En celular es una pastilla compacta para no tapar otros botones.
const AvisoAsistenteIA = () => (
  <>
    <Link to="/login" className="sm:hidden fixed bottom-6 left-4 z-50 bg-cafe-leche text-cafe-espresso rounded-full shadow-lg border border-cafe-espresso/15 px-4 py-3 text-xs font-cuerpo">
      Ingresa para usar el asistente
    </Link>

    <div className="hidden sm:block fixed bottom-8 left-8 z-50 bg-cafe-leche rounded-sm shadow-lg border border-cafe-espresso/15 p-5 max-w-[17rem] font-cuerpo">
      <p className="font-titulo text-lg text-cafe-espresso">Asistente El Gosque</p>
      <p className="text-xs text-cafe-tostado leading-relaxed mt-2 mb-4">Inicia sesión para resolver dudas sobre nuestros cafés y registrar tus solicitudes de pedido.</p>
      <Link to="/login" className="inline-block bg-cafe-espresso hover:bg-cafe-cereza text-cafe-crema text-xs px-4 py-2 rounded-sm transition-colors">Ingresar</Link>
    </div>
  </>
);

export default AvisoAsistenteIA;
