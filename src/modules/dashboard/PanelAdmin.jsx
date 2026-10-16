import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useVerificarAdmin } from '../inicio-sesion/useVerificarAdmin';
import { usePedidosAdmin } from '../gestion-pedidos/usePedidosAdmin';
import AdminPedidos from '../gestion-pedidos/AdminPedidos';
import ModalGestionPedido from '../gestion-pedidos/ModalGestionPedido';
import { useDashboardBI } from './useDashboardBI';
import DashboardBI from './DashboardBI';
import { useClientesAdmin } from '../registro-clientes/useClientesAdmin';
import AdminClientes from '../registro-clientes/AdminClientes';
import { useCatalogoAdmin } from '../catalogo/useCatalogoAdmin';
import AdminCatalogo from '../catalogo/AdminCatalogo';
import { useTrazabilidadAdmin } from '../trazabilidad/useTrazabilidadAdmin';
import AdminTrazabilidad from '../trazabilidad/AdminTrazabilidad';
import { useCafeteriaAdmin } from '../cafeteria/useCafeteriaAdmin';
import { useMultimediaCafeteriaAdmin } from '../cafeteria/useMultimediaCafeteriaAdmin';
import AdminCafeteria from '../cafeteria/AdminCafeteria';
import { useContenidoAdmin } from '../contenido-institucional/useContenidoAdmin';
import AdminContenido from '../contenido-institucional/AdminContenido';
import { useImagenesSitioAdmin } from '../contenido-institucional/useImagenesSitioAdmin';
import AdminImagenesSitio from '../contenido-institucional/AdminImagenesSitio';

// Íconos de línea (24 × 24) de cada pestaña
const ICONOS = {
  dashboard: <><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></>,
  pedidos: <><path d="M3.5 8 12 3.5 20.5 8v8L12 20.5 3.5 16z" /><path d="M3.5 8 12 12.5 20.5 8M12 12.5v8" /></>,
  clientes: <><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c.6-3.6 3.3-5.5 6.5-5.5s5.9 1.9 6.5 5.5" /><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18.5 14.8c1.7.8 2.8 2.6 3 5.2" /></>,
  catalogo: <><path d="M5.5 8h13l-1.2 12.2a1.5 1.5 0 0 1-1.5 1.3H8.2a1.5 1.5 0 0 1-1.5-1.3L5.5 8z" /><path d="M9 8V6.5a3 3 0 0 1 6 0V8" /></>,
  trazabilidad: <><path d="M12 21V10" /><path d="M12 14c-4 0-6.5-2.2-6.5-5.5 3.4 0 6.5 2.2 6.5 5.5z" /><path d="M12 11c0-3.4 2.4-6 6.5-6 0 3.6-2.6 6-6.5 6z" /></>,
  cafeteria: <><path d="M4 9h12v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V9z" /><path d="M16 11h1.5a2.5 2.5 0 0 1 0 5H16M7 3v3M11 3v3" /></>,
  contenido: <><rect x="3" y="4" width="18" height="16" rx="1.5" /><path d="M3 9h18M8 13h8M8 16.5h5" /></>,
};
const IconoPestana = ({ id, className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{ICONOS[id]}</svg>
);

const PESTANAS = [
  { id: 'dashboard', etiqueta: 'Dashboard BI' },
  { id: 'pedidos', etiqueta: 'Gestión de Pedidos' },
  { id: 'clientes', etiqueta: 'Clientes' },
  { id: 'catalogo', etiqueta: 'Catálogo de Productos' },
  { id: 'trazabilidad', etiqueta: 'Trazabilidad' },
  { id: 'cafeteria', etiqueta: 'Cafetería' },
  { id: 'contenido', etiqueta: 'Editar Web Pública' },
];

const PanelAdmin = () => {
  const adminUser = useVerificarAdmin();
  const esAdmin = adminUser !== null;
  const [pestanaActiva, setPestanaActiva] = useState('dashboard');

  // El estado de cada módulo vive aquí para conservarse al cambiar de pestaña
  const pedidosAdmin = usePedidosAdmin(esAdmin);
  const clientesAdmin = useClientesAdmin(esAdmin, pedidosAdmin.pedidos);
  const dashboard = useDashboardBI(pedidosAdmin.pedidos, clientesAdmin.clientes);
  const catalogo = useCatalogoAdmin(esAdmin);
  const trazabilidad = useTrazabilidadAdmin(esAdmin);
  const cafeteria = useCafeteriaAdmin(esAdmin);
  const multimediaCafeteria = useMultimediaCafeteriaAdmin(esAdmin);
  const contenido = useContenidoAdmin(esAdmin);
  const imagenesSitio = useImagenesSitioAdmin(esAdmin);

  if (!esAdmin) return <div className="min-h-screen flex items-center justify-center bg-cafe-crema"><p className="text-xl font-bold text-cafe-hoja">Verificando credenciales...</p></div>;

  const { pedidoSeleccionado, setPedidoSeleccionado, cargarPedidos } = pedidosAdmin;
  const pestana = PESTANAS.find(p => p.id === pestanaActiva);

  return (
    <div className="min-h-screen papel font-cuerpo text-cafe-espresso md:flex">
      {/* ESCRITORIO: barra lateral */}
      <aside className="w-64 bg-cafe-selva text-cafe-crema hidden md:flex flex-col shadow-xl shrink-0 sticky top-0 h-screen">
        <div className="p-6 border-b border-cafe-crema/10">
          <Link to="/" title="Ir al inicio" className="block leading-none group">
            <span className="block font-titulo text-2xl font-semibold text-cafe-crema group-hover:text-cafe-mostaza transition-colors">El Gosque</span>
            <span className="block text-[10px] uppercase tracking-[0.3em] text-cafe-mostaza mt-1.5">Panel de administración</span>
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {PESTANAS.map(({ id, etiqueta }) => (
            <button
              key={id}
              onClick={() => setPestanaActiva(id)}
              aria-current={pestanaActiva === id ? 'page' : undefined}
              className={`w-full text-left flex items-center gap-3 py-3 px-4 rounded-sm text-sm transition border-l-4 ${pestanaActiva === id ? 'bg-cafe-hoja text-cafe-crema border-cafe-mostaza font-semibold' : 'text-cafe-crema/80 border-transparent hover:bg-cafe-hoja/40'}`}
            >
              <IconoPestana id={id} />{etiqueta}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-cafe-crema/10"><Link to="/" className="block text-center py-2.5 text-sm rounded-sm bg-cafe-tostado hover:bg-cafe-espresso transition-colors">← Volver a la web</Link></div>
      </aside>

      {/* CELULAR: barra superior con pestañas desplazables */}
      <header className="md:hidden sticky top-0 z-40 bg-cafe-selva text-cafe-crema shadow-lg">
        <div className="flex items-center justify-between px-4 pt-3 pb-2">
          <Link to="/" title="Ir al inicio" className="leading-none">
            <span className="block font-titulo text-xl font-semibold">El Gosque</span>
            <span className="block text-[9px] uppercase tracking-[0.25em] text-cafe-mostaza mt-1">Administración</span>
          </Link>
          <Link to="/" className="text-xs bg-cafe-tostado px-3 py-1.5 rounded-sm">← Web</Link>
        </div>
        <nav className="flex gap-2 overflow-x-auto px-4 pb-3 scrollbar-hide" aria-label="Secciones del panel">
          {PESTANAS.map(({ id, etiqueta }) => (
            <button key={id} onClick={() => setPestanaActiva(id)} className={`shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-sm transition ${pestanaActiva === id ? 'bg-cafe-crema text-cafe-selva' : 'bg-cafe-hoja/60 text-cafe-crema'}`}>
              <IconoPestana id={id} className="w-4 h-4" />{etiqueta}
            </button>
          ))}
        </nav>
      </header>

      <main className="flex-1 min-w-0 p-4 md:p-8 overflow-y-auto">
        <header className="mb-6 md:mb-8 flex items-center gap-3 border-b-2 border-cafe-hoja/20 pb-4">
          <span className="w-10 h-10 rounded-sm bg-cafe-hoja text-cafe-crema flex items-center justify-center"><IconoPestana id={pestana.id} /></span>
          <h1 className="font-titulo text-2xl md:text-3xl font-semibold text-cafe-espresso tracking-tight">{pestana.etiqueta}</h1>
        </header>

        {pestanaActiva === 'dashboard' && <DashboardBI {...dashboard} />}
        {pestanaActiva === 'pedidos' && <AdminPedidos {...pedidosAdmin} />}
        {pestanaActiva === 'clientes' && <AdminClientes {...clientesAdmin} onAbrirPedido={pedidosAdmin.setPedidoSeleccionado} />}
        {pestanaActiva === 'catalogo' && <AdminCatalogo {...catalogo} />}
        {pestanaActiva === 'trazabilidad' && <AdminTrazabilidad {...trazabilidad} />}
        {pestanaActiva === 'cafeteria' && <AdminCafeteria carta={cafeteria} multimedia={multimediaCafeteria} />}
        {pestanaActiva === 'contenido' && (
          <div className="space-y-8">
            <AdminContenido {...contenido} />
            <AdminImagenesSitio {...imagenesSitio} />
          </div>
        )}
      </main>

      {/* MODAL DE GESTIÓN DE PEDIDOS Y PAGOS */}
      {pedidoSeleccionado && (
        <ModalGestionPedido
          key={pedidoSeleccionado.id}
          pedido={pedidoSeleccionado}
          adminUser={adminUser}
          onCerrar={() => setPedidoSeleccionado(null)}
          onGuardado={() => { setPedidoSeleccionado(null); cargarPedidos(); }}
        />
      )}
    </div>
  );
};

export default PanelAdmin;
