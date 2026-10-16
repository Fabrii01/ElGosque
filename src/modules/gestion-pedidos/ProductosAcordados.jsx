import { calcularTotalAcordado } from './preciosAcordados';
import { formatearSoles } from '../../shared/utils/formato';

// Tabla de productos del pedido; editable mientras se negocia (REQ-F08-03)
const ProductosAcordados = ({ productos, setProductos, editable }) => {
  const actualizar = (indice, campo, valor) => setProductos(productos.map((p, i) => (i === indice ? { ...p, [campo]: valor } : p)));

  return (
    <div className="bg-cafe-crema p-4 rounded-sm border border-cafe-espresso/10">
      <div className="flex flex-wrap justify-between items-center gap-2 mb-3">
        <h4 className="text-sm font-bold text-cafe-espresso uppercase">Productos y Precio Acordado</h4>
        {!editable && <span className="text-[10px] font-bold uppercase text-cafe-tostado/80 bg-cafe-leche border px-2 py-1 rounded-full">Bloqueado tras el pago</span>}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[480px]">
          <thead className="text-[10px] uppercase text-cafe-tostado/70 font-bold">
            <tr><th className="text-left pb-2">Producto</th><th className="text-right pb-2 w-24">Cantidad</th><th className="text-right pb-2 w-32">Precio unit. (S/)</th><th className="text-right pb-2 w-28">Subtotal</th></tr>
          </thead>
          <tbody>
            {productos.map((p, i) => (
              <tr key={i} className="border-t border-cafe-espresso/15">
                <td className="py-2 pr-2">
                  <span className="font-bold text-cafe-espresso block">{p.nombre}</span>
                  <span className="text-xs text-cafe-tostado/80">{[p.presentacion, p.peso].filter(Boolean).join(' · ')}</span>
                </td>
                <td className="py-2 text-right">
                  {editable
                    ? <input type="number" min="1" step="1" required aria-label={`Cantidad de ${p.nombre}`} className="w-20 bg-cafe-leche border border-cafe-espresso/25 p-1.5 rounded-lg text-right" value={p.cantidad} onChange={e => actualizar(i, 'cantidad', e.target.value)} />
                    : <span className="tabular-nums">{p.cantidad}</span>}
                </td>
                <td className="py-2 text-right">
                  {editable
                    ? <input type="number" min="0" step="0.10" required aria-label={`Precio unitario de ${p.nombre}`} className="w-28 bg-cafe-leche border border-cafe-espresso/25 p-1.5 rounded-lg text-right" value={p.precioUnitario} onChange={e => actualizar(i, 'precioUnitario', e.target.value)} />
                    : <span className="tabular-nums">{formatearSoles(p.precioUnitario)}</span>}
                </td>
                <td className="py-2 text-right font-semibold tabular-nums">{formatearSoles((Number(p.cantidad) || 0) * (Number(p.precioUnitario) || 0))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-between items-center border-t border-cafe-espresso/25 mt-2 pt-3">
        <span className="text-xs font-bold text-cafe-tostado uppercase">Total acordado</span>
        <span className="text-2xl font-titulo font-semibold text-cafe-tostado tabular-nums">{formatearSoles(calcularTotalAcordado(productos))}</span>
      </div>
    </div>
  );
};

export default ProductosAcordados;
