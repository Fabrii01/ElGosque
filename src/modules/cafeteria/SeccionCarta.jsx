import { useState } from 'react';
import Revelar from '../../shared/components/Revelar';
import EncabezadoSeccion from './EncabezadoSeccion';
import { categoriasExistentes } from './carta';
import { formatearSoles } from '../../shared/utils/formato';

// Carta de la cafetería con filtro por categoría (REQ-F13-02). Informativa: sin pedidos (REQ-F13-04).
const SeccionCarta = ({ preparaciones, cargando }) => {
  const [categoria, setCategoria] = useState('Todas');
  const categorias = categoriasExistentes(preparaciones);
  const visibles = (categoria === 'Todas' ? preparaciones : preparaciones.filter(p => p.categoria?.trim() === categoria))
    .slice().sort((a, b) => (a.categoria || '').localeCompare(b.categoria || '', 'es') || a.nombre.localeCompare(b.nombre, 'es'));

  return (
    <section id="carta" className="scroll-mt-32 py-20 md:py-28 px-4 bg-cafe-crema">
      <div className="container mx-auto max-w-6xl">
        <EncabezadoSeccion etiqueta="Nuestra carta" titulo="Productos y preparaciones" descripcion="Elaborados con el café orgánico de nuestras fincas en Amazonas. Los pedidos se realizan directamente en el local." />

        {categorias.length > 1 && (
          <Revelar className="flex flex-wrap justify-center gap-2 mb-10">
            {['Todas', ...categorias].map(c => (
              <button
                key={c}
                onClick={() => setCategoria(c)}
                aria-pressed={categoria === c}
                className={`px-5 py-2 rounded-sm text-sm font-bold transition-colors duration-300 border ${categoria === c ? 'bg-cafe-hoja text-white border-cafe-hoja' : 'bg-cafe-leche text-cafe-tostado border-cafe-espresso/15 hover:border-cafe-hoja hover:text-cafe-hoja'}`}
              >
                {c}
              </button>
            ))}
          </Revelar>
        )}

        {cargando ? (
          <p className="text-center text-cafe-tostado/80">Cargando carta...</p>
        ) : visibles.length === 0 ? (
          <p className="text-center text-cafe-tostado/80 bg-cafe-leche rounded-md p-12 border border-cafe-espresso/10">La carta se está actualizando. Vuelve pronto.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {visibles.map((p, i) => (
              <Revelar key={p.id} retraso={(i % 3) * 120} className="h-full">
              <article className="group h-full bg-cafe-leche rounded-md overflow-hidden border border-cafe-espresso/10 shadow-sm hover:shadow-xl hover:-translate-y-1 transition duration-500 flex flex-col">
                <div className="aspect-[4/3] overflow-hidden bg-gradient-to-br from-cafe-arena/40 to-cafe-arena">
                  {p.imagenUrl
                    ? <img src={p.imagenUrl} alt={p.nombre} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    : <div className="w-full h-full flex items-center justify-center text-6xl font-titulo font-semibold text-cafe-tostado/15 select-none">{p.nombre.charAt(0)}</div>}
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-cafe-cereza">{p.categoria}</span>
                  <div className="flex justify-between items-start gap-4 mt-1">
                    <h3 className="text-xl font-bold text-cafe-espresso">{p.nombre}</h3>
                    <span className="text-lg font-titulo font-semibold text-cafe-hoja whitespace-nowrap tabular-nums">{formatearSoles(p.precio)}</span>
                  </div>
                  {p.descripcion && <p className="text-sm text-cafe-tostado/80 mt-2 leading-relaxed">{p.descripcion}</p>}
                </div>
              </article>
              </Revelar>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default SeccionCarta;
