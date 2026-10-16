import { useState } from 'react';
import AdminCartaCafeteria from './AdminCartaCafeteria';
import AdminGaleriaCafeteria from './AdminGaleriaCafeteria';
import AdminVideosCafeteria from './AdminVideosCafeteria';
import AdminUbicacionCafeteria from './AdminUbicacionCafeteria';

const SUBSECCIONES = [
  { id: 'carta', etiqueta: 'Carta' },
  { id: 'galeria', etiqueta: 'Galería' },
  { id: 'videos', etiqueta: 'Videos de preparación' },
  { id: 'ubicacion', etiqueta: 'Ubicación' },
];

// Administración de la página de la cafetería, una sub-pestaña por sección de la web
const AdminCafeteria = ({ carta, multimedia }) => {
  const [subseccion, setSubseccion] = useState('carta');

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide" role="tablist">
          {SUBSECCIONES.map(s => (
            <button
              key={s.id}
              role="tab"
              aria-selected={subseccion === s.id}
              onClick={() => setSubseccion(s.id)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-bold transition ${subseccion === s.id ? 'bg-cafe-hoja text-white' : 'bg-cafe-leche border border-cafe-espresso/15 text-cafe-tostado hover:text-cafe-hoja'}`}
            >
              {s.etiqueta}
            </button>
          ))}
        </div>
        <a href="/productos-cafeteria" target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-cafe-hoja hover:underline">Ver página pública ↗</a>
      </div>

      {subseccion === 'carta' && <AdminCartaCafeteria {...carta} />}
      {subseccion === 'galeria' && <AdminGaleriaCafeteria {...carta} />}
      {subseccion === 'videos' && <AdminVideosCafeteria {...multimedia} />}
      {subseccion === 'ubicacion' && <AdminUbicacionCafeteria {...multimedia} />}
    </div>
  );
};

export default AdminCafeteria;
