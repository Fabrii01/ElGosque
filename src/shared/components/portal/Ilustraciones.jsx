// Ilustraciones a color del portal. Se usan mientras no haya fotos propias
// y rellenan su contenedor (preserveAspectRatio "slice").

const COLORES = {
  cielo: '#efe4d0', sol: '#d9a441', lejano: '#7d9a6a', medio: '#3e6b35', frente: '#1e3a2b',
  arbusto: '#2f5a2a', arbustoSombra: '#244a22', cereza: '#a8432a', cerezaClara: '#c75b3b',
  crema: '#f5efe4', arena: '#ead9bf', espresso: '#2a1d17', kraft: '#c9a27e',
};

const Arbusto = ({ x, y, escala = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${escala})`}>
    <ellipse cx="0" cy="0" rx="30" ry="22" fill={COLORES.arbusto} />
    <ellipse cx="-14" cy="7" rx="18" ry="13" fill={COLORES.arbustoSombra} />
    <ellipse cx="15" cy="-8" rx="15" ry="11" fill={COLORES.arbusto} />
    {[[-12, -6], [-4, 4], [6, -2], [14, 6], [-18, 10], [2, 12], [20, -4]].map(([cx, cy], i) => (
      <circle key={i} cx={cx} cy={cy} r="3.2" fill={i % 2 ? COLORES.cereza : COLORES.cerezaClara} />
    ))}
  </g>
);

// Cafetal en las montañas de Amazonas
export const IlustracionCafetal = ({ className = '' }) => (
  <svg viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice" className={className} role="img" aria-label="Ilustración de un cafetal en las montañas de Amazonas">
    <rect width="400" height="500" fill={COLORES.cielo} />
    <circle cx="290" cy="125" r="50" fill={COLORES.sol} />
    <path d="M0 270 L70 195 L130 235 L210 150 L290 225 L350 185 L400 215 L400 500 L0 500Z" fill={COLORES.lejano} />
    <path d="M0 330 Q60 280 120 310 T240 300 T400 290 L400 500 L0 500Z" fill={COLORES.medio} />
    <path d="M0 405 Q100 355 200 395 T400 375 L400 500 L0 500Z" fill={COLORES.frente} />
    {[70, 170, 265, 345].map((x, i) => <Arbusto key={`m${x}`} x={x} y={325 + (i % 2) * 8} escala={0.75} />)}
    {[35, 125, 215, 300, 385].map((x, i) => <Arbusto key={`f${x}`} x={x} y={440 + (i % 2) * 10} escala={1.25} />)}
  </svg>
);

// Taza de café humeante sobre fondo cereza
export const IlustracionTaza = ({ className = '' }) => (
  <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" className={className} role="img" aria-label="Ilustración de una taza de café">
    <rect width="400" height="300" fill={COLORES.cereza} />
    {[[40, 50, 30], [350, 60, -20], [60, 250, 60], [345, 240, 10], [300, 30, 45]].map(([cx, cy, rot], i) => (
      <g key={i} transform={`rotate(${rot} ${cx} ${cy})`} opacity="0.55">
        <ellipse cx={cx} cy={cy} rx="11" ry="15" fill={COLORES.kraft} />
        <path d={`M${cx} ${cy - 14} c-5 8 5 20 0 28`} stroke={COLORES.cereza} strokeWidth="2" fill="none" />
      </g>
    ))}
    {[165, 200, 235].map((x, i) => (
      <path key={x} d={`M${x} ${100 - i % 2 * 6} c-16 -22 14 -30 0 -60`} stroke={COLORES.sol} strokeWidth="6" strokeLinecap="round" fill="none" opacity="0.9" />
    ))}
    <ellipse cx="200" cy="252" rx="132" ry="18" fill={COLORES.arena} />
    <path d="M280 140 C322 140 322 198 276 198" stroke={COLORES.crema} strokeWidth="14" fill="none" />
    <path d="M118 118 H282 V168 C282 214 246 240 200 240 C154 240 118 214 118 168 Z" fill={COLORES.crema} />
    <ellipse cx="200" cy="120" rx="80" ry="12" fill={COLORES.espresso} />
  </svg>
);

// Saco de café con etiqueta: respaldo de los productos sin foto
export const IlustracionSaco = ({ verde = false, className = '' }) => (
  <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden="true">
    <rect width="400" height="300" fill={verde ? COLORES.medio : '#5b3a29'} />
    <path d="M140 70 Q200 55 260 70 L272 250 Q200 268 128 250 Z" fill={COLORES.kraft} />
    <path d="M140 70 Q200 85 260 70" stroke="#a9825d" strokeWidth="4" fill="none" />
    <path d="M150 62 Q200 40 250 62" stroke="#a9825d" strokeWidth="5" fill="none" strokeLinecap="round" />
    {[[90, 240], [310, 238], [330, 90], [70, 95]].map(([cx, cy], i) => (
      <ellipse key={i} cx={cx} cy={cy} rx="10" ry="14" transform={`rotate(${i * 35} ${cx} ${cy})`} fill={verde ? '#a3b884' : '#3d2418'} opacity="0.8" />
    ))}
  </svg>
);
