import GranoCafe from './GranoCafe';

// Sello redondo con texto en círculo (como el timbre de un saco de café); gira muy lento
const SelloCircular = ({ texto = 'Café orgánico · Amazonas · Perú · ', className = '' }) => (
  <div className={`relative w-28 h-28 rounded-full bg-cafe-crema text-cafe-espresso shadow-sm ${className}`} aria-hidden="true">
    <svg viewBox="0 0 120 120" className="absolute inset-0 w-full h-full motion-safe:animate-[spin_40s_linear_infinite]">
      <defs><path id="circulo-sello" d="M60,60 m-44,0 a44,44 0 1,1 88,0 a44,44 0 1,1 -88,0" /></defs>
      <text className="font-cuerpo" fontSize="10.5" letterSpacing="2.6" fill="currentColor">
        <textPath href="#circulo-sello">{texto.toUpperCase()}</textPath>
      </text>
    </svg>
    <span className="absolute inset-0 flex items-center justify-center text-cafe-cereza"><GranoCafe className="w-6 h-8" /></span>
  </div>
);

export default SelloCircular;
