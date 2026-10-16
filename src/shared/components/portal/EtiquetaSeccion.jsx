// Antetítulo editorial de cada sección: "N.º 01 —— Origen".
// color: 'cereza' (sobre crema/leche), 'tostado' (sobre arena), 'mostaza' o 'crema' (sobre fondos oscuros)
const COLORES = {
  cereza: 'text-cafe-cereza',
  tostado: 'text-cafe-tostado',
  mostaza: 'text-cafe-mostaza',
  crema: 'text-cafe-crema',
};

const EtiquetaSeccion = ({ numero, texto, color = 'cereza' }) => (
  <p className={`flex items-center gap-3 font-cuerpo text-xs uppercase tracking-[0.22em] ${COLORES[color]}`}>
    {numero && <span className="font-titulo italic normal-case tracking-normal text-base">N.º {numero}</span>}
    <span className="inline-block w-10 border-t border-current opacity-50" aria-hidden="true" />
    <span>{texto}</span>
  </p>
);

export default EtiquetaSeccion;
