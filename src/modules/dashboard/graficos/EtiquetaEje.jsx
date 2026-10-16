import { COLOR_TEXTO } from './colores';

// Etiqueta de categoría en una sola línea, recortada con "…" según el ancho disponible
// (Recharts parte el texto en varias líneas si no cabe)
const EtiquetaEje = ({ x, y, payload, ancho = 130 }) => {
  const maxCaracteres = Math.floor(ancho / 7);
  const texto = String(payload.value);
  const visible = texto.length > maxCaracteres ? `${texto.slice(0, maxCaracteres - 1)}…` : texto;
  return (
    <text x={x} y={y} dy={4} textAnchor="end" fontSize={12} fill={COLOR_TEXTO}>
      <title>{texto}</title>
      {visible}
    </text>
  );
};

export default EtiquetaEje;
