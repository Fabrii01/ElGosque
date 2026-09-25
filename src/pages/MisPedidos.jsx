import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';

const MisPedidos = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Verificación de seguridad y carga de datos (REQ-F07-04)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUserData(currentUser);
        cargarHistorial(currentUser.uid);
      } else {
        navigate('/login'); // Expulsa si no está logueado
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const cargarHistorial = async (uid) => {
    try {
      // Filtrar estrictamente los pedidos que le pertenecen a este cliente
      const q = query(collection(db, "pedidos"), where("clienteId", "==", uid));
      const querySnapshot = await getDocs(q);
      
      const historial = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Ordenar localmente por fecha (los más recientes primero)
      historial.sort((a, b) => b.fecha?.seconds - a.fecha?.seconds);
      setPedidos(historial);
    } catch (error) {
      console.error("Error al cargar pedidos:", error);
    }
    setCargando(false);
  };

  // Función auxiliar para formatear la fecha
  const formatearFecha = (timestamp) => {
    if (!timestamp) return 'Fecha pendiente';
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // Asignar colores según el estado del pedido
  const colorEstado = (estado) => {
    switch (estado) {
      case 'Pendiente': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Pagado': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Enviado': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Entregado': return 'bg-green-100 text-green-800 border-green-200';
      case 'Cancelado': case 'Denegado': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="bg-[#F8F9FA] min-h-screen font-sans text-gray-800">
      {/* NAVEGACIÓN */}
      <nav className="bg-white/90 backdrop-blur-md text-gosque-brown p-4 sticky top-0 z-50 border-b border-gray-100">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/" className="text-2xl font-black tracking-tighter text-gosque-green">EL GOSQUE.</Link>
          <div className="flex items-center gap-4 bg-gray-50 px-4 py-1.5 rounded-full border border-gray-200">
            <Link to="/" className="text-xs font-bold text-gray-600 hover:text-gosque-green transition">Volver al Catálogo</Link>
            <span className="text-gray-300">|</span>
            <button onClick={() => signOut(auth)} className="text-xs text-red-500 hover:text-red-700 font-bold uppercase">Salir</button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-12 max-w-5xl">
        <header className="mb-12">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">Mi Historial de Pedidos</h1>
          <p className="text-gray-500">Consulta el estado, los productos y los datos de envío de tus solicitudes.</p>
        </header>

        {cargando ? (
          <div className="flex justify-center py-20"><div className="w-12 h-12 border-4 border-gosque-green border-t-transparent rounded-full animate-spin"></div></div>
        ) : pedidos.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl text-center border border-gray-100 shadow-sm">
            <span className="text-6xl mb-4 block">📦</span>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Aún no tienes pedidos</h3>
            <p className="text-gray-500 mb-6">Explora nuestro catálogo y realiza tu primera solicitud de cotización.</p>
            <Link to="/" className="bg-gosque-green text-white font-bold py-3 px-8 rounded-xl hover:bg-green-700 transition">Ver Catálogo</Link>
          </div>
        ) : (
          <div className="space-y-6">
            {pedidos.map((pedido) => (
              <div key={pedido.id} className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm hover:shadow-md transition">
                
                {/* Cabecera del Pedido (REQ-F07-03) */}
                <div className="flex flex-col md:flex-row justify-between md:items-center border-b border-gray-100 pb-4 mb-4 gap-4">
                  <div>
                    <span className="text-sm font-bold text-gray-400 uppercase tracking-wider block mb-1">Código de Pedido</span>
                    <span className="text-2xl font-black text-gosque-green">{pedido.codigo}</span>
                    <span className="text-sm text-gray-500 ml-4">{formatearFecha(pedido.fecha)}</span>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-4 py-1.5 rounded-full text-sm font-bold border ${colorEstado(pedido.estado)}`}>
                      Estado: {pedido.estado}
                    </span>
                    <span className="text-xl font-black text-gosque-brown">Total: S/ {pedido.total?.toFixed(2)}</span>
                  </div>
                </div>

                {/* Lista de Productos (REQ-F07-03) */}
                <div className="mb-6">
                  <h4 className="text-sm font-bold text-gray-900 uppercase mb-3">Productos Solicitados</h4>
                  <ul className="space-y-3">
                    {pedido.productos?.map((prod, idx) => (
                      <li key={idx} className="flex justify-between items-center bg-gray-50 p-3 rounded-xl">
                        <div>
                          <span className="font-bold text-gray-800">{prod.cantidad}x {prod.nombre}</span>
                          <span className="text-xs text-gray-500 block">{prod.presentacion} | {prod.peso}</span>
                        </div>
                        <span className="font-semibold text-gray-600">S/ {prod.subtotal?.toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Datos de Envío Condicionales (REQ-F07-05) */}
                {pedido.datosEnvio ? (
                  <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                    <div>
                      <h4 className="text-xs font-bold text-amber-900 uppercase mb-1">Información de Despacho</h4>
                      <p className="text-sm text-amber-800">
                        <span className="font-bold">Modalidad:</span> {pedido.datosEnvio.modalidad} | 
                        <span className="font-bold ml-2">Agencia:</span> {pedido.datosEnvio.agencia || 'N/A'}
                      </p>
                      {pedido.datosEnvio.fechaEnvio && (
                        <p className="text-sm text-amber-800 mt-1"><span className="font-bold">Fecha de envío:</span> {pedido.datosEnvio.fechaEnvio}</p>
                      )}
                    </div>
                    {pedido.datosEnvio.numeroGuia && (
                      <div className="bg-white px-4 py-2 rounded-lg border border-amber-200 text-center">
                        <span className="text-xs text-amber-600 font-bold block">NRO. DE GUÍA</span>
                        <span className="font-mono font-bold text-gray-900">{pedido.datosEnvio.numeroGuia}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic">Los datos de envío se actualizarán cuando el administrador procese el despacho.</p>
                )}

              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default MisPedidos;