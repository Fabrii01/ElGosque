import { CATEGORIAS_CAFETERIA } from './carta';
import { formatearSoles } from '../../shared/utils/formato';

// Carta de la cafetería: alta, edición y visibilidad de preparaciones (REQ-F13-02)
const AdminCartaCafeteria = ({
  preparaciones, nuevaPreparacion, setNuevaPreparacion, idEdicion, imagenArchivo, setImagenArchivo, guardando,
  guardarPreparacion, editarPreparacion, cancelarEdicion, toggleActivo, cargarCartaInicial,
}) => {
  const actualizar = (campo, valor) => setNuevaPreparacion({ ...nuevaPreparacion, [campo]: valor });

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* CARTA (REQ-F13-02) */}
      <div className="bg-cafe-leche rounded-md shadow-sm border border-cafe-espresso/10 p-5 md:p-8">
        <h3 className="font-bold text-2xl text-cafe-espresso mb-6">{idEdicion ? 'Editar Preparación' : 'Nueva Preparación de la Carta'}</h3>
        <form onSubmit={guardarPreparacion} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-cafe-tostado uppercase mb-1">Nombre</label>
            <input type="text" required className="w-full bg-cafe-crema border border-cafe-espresso/15 p-3 rounded-sm outline-none" value={nuevaPreparacion.nombre} onChange={e => actualizar('nombre', e.target.value)} placeholder="Ej. Capuchino" />
          </div>
          <div>
            <label className="block text-xs font-bold text-cafe-tostado uppercase mb-1">Categoría</label>
            <select required className="w-full bg-cafe-crema border border-cafe-espresso/15 p-3 rounded-sm outline-none" value={nuevaPreparacion.categoria} onChange={e => actualizar('categoria', e.target.value)}>
              <option value="" disabled>Elige una categoría</option>
              {CATEGORIAS_CAFETERIA.map(c => <option key={c} value={c}>{c}</option>)}
              {/* Preparaciones antiguas con una categoría fuera de la lista: se conserva hasta que se cambie */}
              {nuevaPreparacion.categoria && !CATEGORIAS_CAFETERIA.includes(nuevaPreparacion.categoria) && (
                <option value={nuevaPreparacion.categoria}>{nuevaPreparacion.categoria} (anterior)</option>
              )}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-cafe-tostado uppercase mb-1">Precio (S/)</label>
            <input type="number" step="0.10" min="0" required className="w-full bg-cafe-crema border border-cafe-espresso/15 p-3 rounded-sm outline-none" value={nuevaPreparacion.precio} onChange={e => actualizar('precio', e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-bold text-cafe-tostado uppercase mb-1">Foto (opcional)</label>
            <input type="file" accept="image/*" onChange={(e) => setImagenArchivo(e.target.files[0])} className="w-full text-sm text-cafe-tostado/80 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-cafe-hoja/10 file:text-cafe-hoja" />
            {nuevaPreparacion.imagenUrl && !imagenArchivo && <p className="text-xs text-cafe-cereza mt-1 font-bold">Ya tiene una foto guardada.</p>}
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-cafe-tostado uppercase mb-1">Descripción</label>
            <input type="text" className="w-full bg-cafe-crema border border-cafe-espresso/15 p-3 rounded-sm outline-none" value={nuevaPreparacion.descripcion} onChange={e => actualizar('descripcion', e.target.value)} />
          </div>
          <div className="md:col-span-2 flex flex-wrap gap-3">
            <button type="submit" disabled={guardando} className="bg-cafe-hoja text-white font-bold py-3 px-8 rounded-sm disabled:bg-cafe-kraft">{guardando ? 'Guardando...' : (idEdicion ? 'Actualizar' : 'Agregar a la Carta')}</button>
            {idEdicion && <button type="button" onClick={cancelarEdicion} className="bg-cafe-arena font-bold py-3 px-8 rounded-sm">Cancelar</button>}
          </div>
        </form>
      </div>

      <div className="bg-cafe-leche rounded-md shadow-sm border border-cafe-espresso/10 p-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-cafe-tostado">Carga los productos de la carta impresa (sin foto). No duplica los que ya existen con el mismo nombre.</p>
        <button type="button" onClick={cargarCartaInicial} disabled={guardando} className="bg-cafe-tostado text-cafe-crema font-bold py-2.5 px-6 rounded-sm hover:bg-cafe-espresso disabled:bg-cafe-kraft">Cargar carta impresa</button>
      </div>

      <div className="bg-cafe-leche rounded-md shadow-sm border border-cafe-espresso/10 overflow-x-auto">
        <table className="w-full text-left min-w-[560px]">
          <thead className="bg-cafe-arena/60 text-xs uppercase text-cafe-tostado/80 font-bold">
            <tr><th className="p-4">Preparación</th><th className="p-4">Categoría</th><th className="p-4">Precio</th><th className="p-4 text-center">Acciones</th></tr>
          </thead>
          <tbody className="divide-y divide-cafe-espresso/10">
            {preparaciones.map(p => (
              <tr key={p.id} className="hover:bg-cafe-crema">
                <td className="p-4 font-bold">{p.nombre}</td>
                <td className="p-4 text-sm text-cafe-tostado">{p.categoria}</td>
                <td className="p-4 font-bold text-cafe-tostado">{formatearSoles(p.precio)}</td>
                <td className="p-4">
                  <div className="flex justify-center gap-2">
                    <button onClick={() => editarPreparacion(p)} className="px-4 py-1 text-xs font-bold rounded-full bg-cafe-arena text-cafe-tostado">Editar</button>
                    <button onClick={() => toggleActivo(p.id, p.activo)} className={`px-4 py-1 text-xs font-bold rounded-full ${p.activo ? 'bg-cafe-hoja/15 text-cafe-hoja' : 'bg-red-100 text-red-700'}`}>{p.activo ? 'Visible' : 'Oculta'}</button>
                  </div>
                </td>
              </tr>
            ))}
            {preparaciones.length === 0 && <tr><td colSpan="4" className="p-8 text-center text-cafe-tostado/70 italic">La carta está vacía.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminCartaCafeteria;
