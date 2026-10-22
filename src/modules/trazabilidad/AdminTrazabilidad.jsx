import ZonaArrastrar from '../../shared/components/ZonaArrastrar';

const AdminTrazabilidad = ({ regionProcedencia, setRegionProcedencia, etapasTrazabilidad, handleEtapaChange, guardarTrazabilidad, procesandoEtapa, subirImagenEtapa }) => (
  <div className="bg-cafe-leche rounded-md shadow-sm border border-cafe-espresso/10 p-8 max-w-4xl mx-auto">
    <h3 className="font-bold text-2xl text-cafe-espresso mb-6">Trazabilidad del Café</h3>
    <form onSubmit={guardarTrazabilidad} className="space-y-6">
      <div className="bg-cafe-arena/50 p-4 rounded-sm border border-cafe-kraft/60">
        <label className="block text-xs font-bold text-cafe-tostado uppercase mb-2">Región de Procedencia</label>
        <input type="text" className="w-full bg-cafe-leche border border-cafe-kraft p-3 rounded-lg outline-none" value={regionProcedencia} onChange={(e) => setRegionProcedencia(e.target.value)} required />
      </div>
      <div className="space-y-4">
        {etapasTrazabilidad.map((etapa, index) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-cafe-crema p-4 rounded-sm border border-cafe-espresso/15">
            <div className="md:col-span-3"><span className="font-bold text-cafe-hoja">{index + 1}. {etapa.nombre}</span></div>
            <div className="md:col-span-5"><input type="text" placeholder="Descripción..." className="w-full text-sm border p-2 rounded outline-none" value={etapa.descripcion} onChange={(e) => handleEtapaChange(index, 'descripcion', e.target.value)} /></div>
            <div className="md:col-span-4">
              {etapa.img ? (
                <div className="flex items-center gap-3">
                  <img src={etapa.img} alt={`Imagen de la etapa ${etapa.nombre}`} className="w-24 aspect-[4/3] object-cover rounded-sm border border-cafe-espresso/15" />
                  <button type="button" onClick={() => handleEtapaChange(index, 'img', '')} className="text-xs font-bold text-red-600 hover:underline">Quitar</button>
                </div>
              ) : (
                <ZonaArrastrar
                  accept="image/*"
                  onArchivo={archivo => subirImagenEtapa(index, archivo)}
                  deshabilitado={procesandoEtapa !== null}
                  titulo={procesandoEtapa === index ? 'Procesando...' : 'Arrastra la imagen'}
                  ayuda="o haz clic para elegirla"
                />
              )}
            </div>
          </div>
        ))}
      </div>
      <button type="submit" disabled={procesandoEtapa !== null} className="bg-cafe-hoja text-white font-bold py-3 px-8 rounded-sm shadow-lg disabled:bg-cafe-kraft">Actualizar Trazabilidad</button>
    </form>
  </div>
);

export default AdminTrazabilidad;
