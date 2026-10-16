import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { escucharSesion, cerrarSesion } from '../inicio-sesion/sesionService';
import { obtenerPedidosCliente } from './pedidosService';
import TarjetaPedidoCliente from './TarjetaPedidoCliente';
import FranjaSuperior from '../contenido-institucional/FranjaSuperior';
import CabeceraPortal from '../contenido-institucional/CabeceraPortal';
import PiePagina from '../contenido-institucional/PiePagina';
import GranoCafe from '../../shared/components/portal/GranoCafe';

const PaginaMisPedidos = () => {
  const navigate = useNavigate();
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Verificación de seguridad y carga de datos (REQ-F07-04)
  useEffect(() => {
    const unsubscribe = escucharSesion(async (currentUser) => {
      if (currentUser) {
        try {
          // Filtrar estrictamente los pedidos que le pertenecen a este cliente
          setPedidos(await obtenerPedidosCliente(currentUser.uid));
        } catch (error) {
          console.error("Error al cargar pedidos:", error);
        }
        setCargando(false);
      } else {
        navigate('/login'); // Expulsa si no está logueado
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // REQ-F07-01/02 y RN-03: una solicitud no es una venta confirmada
  const solicitudes = pedidos.filter(p => p.estado === 'Pendiente');
  const pedidosConfirmados = pedidos.filter(p => p.estado !== 'Pendiente');

  return (
    <div className="papel min-h-screen font-cuerpo text-cafe-espresso">
      <FranjaSuperior />
      <CabeceraPortal>
        <button onClick={cerrarSesion} className="border border-cafe-espresso/25 text-cafe-tostado px-4 py-2 rounded-sm hover:border-cafe-cereza hover:text-cafe-cereza transition-colors">Salir</button>
      </CabeceraPortal>

      <main className="container mx-auto px-4 py-12 max-w-5xl">
        <header className="mb-10 bg-cafe-leche rounded-md shadow-md border-l-8 border-cafe-hoja p-6 md:p-8">
          <h1 className="text-3xl md:text-4xl font-titulo font-semibold text-cafe-espresso tracking-tight mb-2">Mi Historial de Pedidos</h1>
          <p className="text-cafe-tostado/80">Consulta el estado, los productos y los datos de envío de tus solicitudes y pedidos.</p>
        </header>

        {cargando ? (
          <div className="flex justify-center py-20"><div className="w-12 h-12 border-4 border-cafe-hoja border-t-transparent rounded-full animate-spin"></div></div>
        ) : pedidos.length === 0 ? (
          <div className="bg-cafe-leche p-12 rounded-md text-center border border-cafe-espresso/10 shadow-sm">
            <GranoCafe className="w-12 h-14 mx-auto mb-4 text-cafe-kraft" />
            <h3 className="text-xl font-bold text-cafe-espresso mb-2">Aún no tienes pedidos</h3>
            <p className="text-cafe-tostado/80 mb-6">Explora nuestro catálogo y realiza tu primera solicitud de cotización.</p>
            <Link to="/" className="bg-cafe-hoja text-white font-bold py-3 px-8 rounded-sm hover:bg-cafe-selva transition">Ver Catálogo</Link>
          </div>
        ) : (
          <div className="space-y-12">
            <section>
              <h2 className="font-titulo text-2xl text-cafe-crema bg-cafe-tostado rounded-sm px-4 py-2 mb-2">Solicitudes en revisión ({solicitudes.length})</h2>
              <p className="text-sm text-cafe-tostado/80 mb-5">Cotizaciones que el administrador aún no confirma. Los precios son referenciales.</p>
              <div className="space-y-6">
                {solicitudes.map(pedido => <TarjetaPedidoCliente key={pedido.id} pedido={pedido} />)}
                {solicitudes.length === 0 && <p className="text-sm text-cafe-tostado/70 italic">No tienes solicitudes pendientes.</p>}
              </div>
            </section>

            <section>
              <h2 className="font-titulo text-2xl text-cafe-crema bg-cafe-hoja rounded-sm px-4 py-2 mb-2">Pedidos ({pedidosConfirmados.length})</h2>
              <p className="text-sm text-cafe-tostado/80 mb-5">Pedidos procesados por El Gosque, con su estado de pago y envío.</p>
              <div className="space-y-6">
                {pedidosConfirmados.map(pedido => <TarjetaPedidoCliente key={pedido.id} pedido={pedido} />)}
                {pedidosConfirmados.length === 0 && <p className="text-sm text-cafe-tostado/70 italic">Aún no tienes pedidos confirmados.</p>}
              </div>
            </section>
          </div>
        )}
      </main>
      <PiePagina />
    </div>
  );
};

export default PaginaMisPedidos;
