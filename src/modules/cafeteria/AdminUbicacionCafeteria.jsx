import { mapaParaMostrar } from './multimedia';

// Datos de la sección "Visítanos": dirección, mapa de Google Maps y video opcional de cómo llegar
const AdminUbicacionCafeteria = ({ ubicacion, setUbicacion, guardandoUbicacion, guardarUbicacion }) => {
  const actualizar = (campo, valor) => setUbicacion({ ...ubicacion, [campo]: valor });
  const mapa = mapaParaMostrar(ubicacion);

  return (
    <div className="bg-cafe-leche rounded-md shadow-sm border border-cafe-espresso/10 p-5 md:p-8">
      <h3 className="font-bold text-2xl text-cafe-espresso mb-1">Ubicación ("Visítanos")</h3>
      <p className="text-sm text-cafe-tostado/80 mb-6">Si no pegas un mapa, se genera uno automáticamente a partir de la dirección.</p>

      <form onSubmit={guardarUbicacion} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-cafe-tostado uppercase mb-1">Dirección</label>
          <input type="text" className="w-full bg-cafe-crema border border-cafe-espresso/15 p-3 rounded-sm outline-none" value={ubicacion.direccion} onChange={e => actualizar('direccion', e.target.value)} placeholder="Ej. Av. España 123, Trujillo, La Libertad" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-cafe-tostado uppercase mb-1">Referencia (opcional)</label>
          <input type="text" className="w-full bg-cafe-crema border border-cafe-espresso/15 p-3 rounded-sm outline-none" value={ubicacion.referencia} onChange={e => actualizar('referencia', e.target.value)} placeholder="Ej. Frente a la plaza, segundo piso" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-cafe-tostado uppercase mb-1">Mapa exacto de Google Maps (opcional)</label>
          <textarea rows="3" className="w-full bg-cafe-crema border border-cafe-espresso/15 p-3 rounded-sm outline-none font-mono text-xs" value={ubicacion.mapaEmbed} onChange={e => actualizar('mapaEmbed', e.target.value)} placeholder={'<iframe src="https://www.google.com/maps/embed?pb=..."></iframe>'} />
          <p className="text-xs text-cafe-tostado/80 mt-1">En Google Maps: busca el local → <strong>Compartir</strong> → <strong>Insertar un mapa</strong> → <strong>Copiar HTML</strong>, y pégalo aquí.</p>
        </div>
        <div>
          <label className="block text-xs font-bold text-cafe-tostado uppercase mb-1">Enlace para abrir en Google Maps (opcional)</label>
          <input type="url" className="w-full bg-cafe-crema border border-cafe-espresso/15 p-3 rounded-sm outline-none" value={ubicacion.enlaceMaps} onChange={e => actualizar('enlaceMaps', e.target.value)} placeholder="https://maps.app.goo.gl/..." />
        </div>
        <div>
          <label className="block text-xs font-bold text-cafe-tostado uppercase mb-1">Video de cómo llegar (opcional)</label>
          <input type="url" className="w-full bg-cafe-crema border border-cafe-espresso/15 p-3 rounded-sm outline-none" value={ubicacion.videoUrl} onChange={e => actualizar('videoUrl', e.target.value)} placeholder="https://youtu.be/..." />
        </div>

        {mapa && (
          <div className="md:col-span-2">
            <p className="text-xs font-bold text-cafe-tostado/80 uppercase mb-2">Vista previa del mapa</p>
            <iframe src={mapa} title="Vista previa del mapa" className="w-full h-64 rounded-sm border border-cafe-espresso/15" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
          </div>
        )}

        <div className="md:col-span-2">
          <button type="submit" disabled={guardandoUbicacion} className="bg-cafe-hoja text-white font-bold py-3 px-8 rounded-sm disabled:bg-cafe-kraft">{guardandoUbicacion ? 'Guardando...' : 'Guardar ubicación'}</button>
        </div>
      </form>
    </div>
  );
};

export default AdminUbicacionCafeteria;
