import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Trazabilidad from './pages/Trazabilidad';
import AdminDashboard from './pages/AdminDashboard'; // Importamos el Panel Admin

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/trazabilidad" element={<Trazabilidad />} />
        <Route path="/admin" element={<AdminDashboard />} /> {/* Ruta para el administrador */}
        <Route path="/productos-cafeteria" element={<div className="p-20 text-center text-2xl font-bold">Catálogo Completo de la Cafetería (En construcción)</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;