import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PaginaInicio from './modules/contenido-institucional/PaginaInicio';
import PaginaAcceso from './modules/inicio-sesion/PaginaAcceso';
import PaginaTrazabilidad from './modules/trazabilidad/PaginaTrazabilidad';
import PaginaMisPedidos from './modules/gestion-pedidos/PaginaMisPedidos';
import PaginaCartaCafeteria from './modules/cafeteria/PaginaCartaCafeteria';
import SubirAlCambiarRuta from './shared/components/SubirAlCambiarRuta';

// El panel admin (con la librería de gráficos) se descarga solo al entrar a /admin
const PanelAdmin = lazy(() => import('./modules/dashboard/PanelAdmin'));

const Cargando = () => (
  <div className="min-h-screen flex items-center justify-center bg-cafe-crema"><p className="text-xl font-bold text-cafe-hoja">Cargando...</p></div>
);

function App() {
  return (
    <BrowserRouter>
      <SubirAlCambiarRuta />
      <Suspense fallback={<Cargando />}>
        <Routes>
          <Route path="/" element={<PaginaInicio />} />
          <Route path="/login" element={<PaginaAcceso />} />
          <Route path="/trazabilidad" element={<PaginaTrazabilidad />} />
          <Route path="/admin" element={<PanelAdmin />} /> {/* Ruta para el administrador */}
          <Route path="/productos-cafeteria" element={<PaginaCartaCafeteria />} />
          <Route path="/mis-pedidos" element={<PaginaMisPedidos />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
