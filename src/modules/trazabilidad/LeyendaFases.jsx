import { FASES, claveFase } from './etapas';

// Leyenda de colores: qué etapas pertenecen a cada fase
const LeyendaFases = ({ procesos, compacta = false }) => {
  const grupos = Object.entries(FASES).map(([clave, fase]) => ({
    clave,
    fase,
    etapas: procesos.filter((p, i) => claveFase(p, i, procesos.length) === clave).map(p => p.nombre),
  })).filter(g => g.etapas.length > 0);

  return (
    <ul className={`grid gap-3 ${compacta ? 'sm:grid-cols-3' : 'md:grid-cols-3 gap-4'}`}>
      {grupos.map(({ clave, fase, etapas }) => (
        <li key={clave} className={`${fase.fondo} text-cafe-crema rounded-sm ${compacta ? 'px-4 py-3' : 'px-5 py-5'}`}>
          <p className={`font-titulo ${compacta ? 'text-lg' : 'text-xl'}`}>{fase.nombre}</p>
          <p className="text-xs mt-1 leading-relaxed">{etapas.join(' · ')}</p>
        </li>
      ))}
    </ul>
  );
};

export default LeyendaFases;
