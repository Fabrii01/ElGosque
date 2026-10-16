// Contenedor de cada gráfico: título, descripción, contenido y vista de tabla accesible.
// tabla = { columnas: [{ titulo, valor: fila => texto, numerico? }], filas: [] }
const TarjetaGrafico = ({ titulo, descripcion, children, tabla, acciones, className = '' }) => (
  <section className={`bg-cafe-leche rounded-md p-4 sm:p-5 md:p-6 shadow-sm border border-cafe-espresso/10 flex flex-col min-w-0 ${className}`}>
    <header className="flex flex-wrap justify-between items-start gap-2 mb-4">
      <div>
        <h4 className="font-bold text-cafe-espresso text-sm uppercase tracking-wider">{titulo}</h4>
        {descripcion && <p className="text-xs text-cafe-tostado/80 mt-1">{descripcion}</p>}
      </div>
      {acciones}
    </header>

    <div className="flex-1 min-w-0">{children}</div>

    {tabla && tabla.filas.length > 0 && (
      <details className="mt-4 text-xs">
        <summary className="cursor-pointer font-bold text-cafe-tostado/80 hover:text-cafe-hoja select-none">Ver datos en tabla</summary>
        <div className="overflow-x-auto mt-2 max-h-64 overflow-y-auto">
          <table className="w-full">
            <thead className="text-cafe-tostado/70 uppercase text-[10px] sticky top-0 bg-cafe-leche">
              <tr>{tabla.columnas.map(c => <th key={c.titulo} className={`py-1.5 pr-3 ${c.numerico ? 'text-right' : 'text-left'}`}>{c.titulo}</th>)}</tr>
            </thead>
            <tbody>
              {tabla.filas.map((fila, i) => (
                <tr key={i} className="border-t border-cafe-espresso/10">
                  {tabla.columnas.map(c => <td key={c.titulo} className={`py-1.5 pr-3 text-cafe-tostado ${c.numerico ? 'text-right tabular-nums' : ''}`}>{c.valor(fila)}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    )}
  </section>
);

export default TarjetaGrafico;
