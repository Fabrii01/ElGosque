// Botón flotante que abre el pedido en curso (solo con sesión iniciada)
const BotonVerPedido = ({ onClick, cantidad }) => (
  <button
    onClick={onClick}
    className="fixed bottom-6 right-5 md:bottom-8 md:right-8 z-50 bg-cafe-espresso text-cafe-crema pl-4 pr-5 py-3.5 rounded-full shadow-lg hover:bg-cafe-cereza transition-colors flex items-center gap-2.5 font-cuerpo text-sm"
    aria-label={`Abrir mi pedido (${cantidad} productos)`}
  >
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinejoin="round" d="M5 8h14l-1.2 11.2a2 2 0 01-2 1.8H8.2a2 2 0 01-2-1.8L5 8z" /><path strokeLinecap="round" d="M9 8V6a3 3 0 016 0v2" />
    </svg>
    Mi pedido
    {cantidad > 0 && <span className="bg-cafe-cereza text-white text-xs font-semibold rounded-full min-w-[1.4rem] h-[1.4rem] px-1 flex items-center justify-center tabular-nums">{cantidad}</span>}
  </button>
);

export default BotonVerPedido;
