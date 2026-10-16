import { useState } from 'react';

const PALABRA_CONFIRMACION = 'ELIMINAR';

// Confirmación de eliminación definitiva: hay que escribir ELIMINAR para habilitar el botón
const ModalEliminarProducto = ({ producto, eliminando, onConfirmar, onCancelar }) => {
  const [texto, setTexto] = useState('');
  const confirmado = texto.trim().toUpperCase() === PALABRA_CONFIRMACION;

  return (
    <div className="fixed inset-0 bg-cafe-espresso/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="titulo-eliminar">
      <div className="bg-cafe-leche rounded-md w-full max-w-md shadow-xl p-6 space-y-4">
        <h3 id="titulo-eliminar" className="text-xl font-titulo font-semibold text-cafe-espresso">¿Eliminar este producto?</h3>

        <div className="flex items-center gap-3 bg-cafe-crema border border-cafe-espresso/15 rounded-sm p-3">
          {producto.imagenUrl
            ? <img src={producto.imagenUrl} alt="" className="w-12 h-12 rounded-lg object-cover" />
            : <div className="w-12 h-12 rounded-lg bg-cafe-arena" />}
          <div>
            <p className="font-bold text-cafe-espresso">{producto.nombre}</p>
            <p className="text-xs text-cafe-tostado/80">{producto.tipo} · {producto.presentacion} · {producto.peso} · S/ {producto.precioReferencial}</p>
          </div>
        </div>

        <ul className="text-sm text-cafe-tostado space-y-1 list-disc pl-5">
          <li>Se borrará definitivamente y <strong>no se puede deshacer</strong>.</li>
          <li>Los pedidos y solicitudes ya registrados <strong>no se modifican</strong>.</li>
          <li>Si solo quieres ocultarlo de la web, usa el botón <strong>Activo/Inactivo</strong>.</li>
        </ul>

        <label className="block text-sm text-cafe-tostado">
          Escribe <strong>{PALABRA_CONFIRMACION}</strong> para confirmar:
          <input type="text" autoFocus className="mt-1 w-full border border-cafe-espresso/25 p-2.5 rounded-sm outline-none focus:ring-2 focus:ring-red-400" value={texto} onChange={e => setTexto(e.target.value)} />
        </label>

        <div className="flex justify-end gap-3 pt-2">
          <button onClick={onCancelar} disabled={eliminando} className="px-5 py-2.5 rounded-sm font-bold text-cafe-tostado hover:bg-cafe-arena/60">Cancelar</button>
          <button onClick={onConfirmar} disabled={!confirmado || eliminando} className="px-5 py-2.5 rounded-sm font-bold bg-red-600 text-white hover:bg-red-700 disabled:bg-cafe-kraft">
            {eliminando ? 'Eliminando...' : 'Eliminar definitivamente'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalEliminarProducto;
