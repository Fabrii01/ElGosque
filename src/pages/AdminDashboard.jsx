import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
// Nota: onAuthStateChanged se eliminó de aquí porque pertenece a 'firebase/auth'
import { doc, getDoc, setDoc, collection, addDoc, getDocs, updateDoc } from 'firebase/firestore';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [verificando, setVerificando] = useState(true);
  const [pestanaActiva, setPestanaActiva] = useState('pedidos');
  
  // ==========================================
  // ESTADOS: CONTENIDO INSTITUCIONAL (REQ-F01)
  // ==========================================
  const [contenidoInfo, setContenidoInfo] = useState({ titulo: '', descripcion: '' });
  const [guardandoMsg, setGuardandoMsg] = useState('');

  // ==========================================
  // ESTADOS: CATÁLOGO DE PRODUCTOS (REQ-F03)
  // ==========================================
  const [productos, setProductos] = useState([]);
  const estadoInicialProducto = { nombre: 'Gourmet', descripcion: '', tipo: 'Tostado', presentacion: 'En grano', peso: '1 kg', precioReferencial: '' };
  const [nuevoProducto, setNuevoProducto] = useState(estadoInicialProducto);
  const [idEdicion, setIdEdicion] = useState(null); // Controla si estamos editando un producto

  // ==========================================
  // PROTECCIÓN DE RUTA Y CARGA INICIAL
  // ==========================================
  useEffect(() => {
    // Usamos auth.onAuthStateChanged correctamente desde el módulo de autenticación
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, "usuarios", user.uid));
        // Validamos que el usuario tenga el rol de administrador
        if (userDoc.exists() && userDoc.data().rol === "admin") {
          setVerificando(false);
          cargarContenidoWeb();
          cargarProductos();
        } else {
          navigate('/'); // Si es cliente, lo expulsa al Home
        }
      } else {
        navigate('/login'); // Si no hay sesión, va al Login
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // ==========================================
  // FUNCIONES: CONTENIDO INSTITUCIONAL
  // ==========================================
  const cargarContenidoWeb = async () => {
    const docSnap = await getDoc(doc(db, "ajustes", "institucional"));
    if (docSnap.exists()) {
      setContenidoInfo(docSnap.data());
    }
  };

  const guardarContenidoWeb = async (e) => {
    e.preventDefault();
    setGuardandoMsg('Guardando...');
    await setDoc(doc(db, "ajustes", "institucional"), contenidoInfo);
    setGuardandoMsg('¡Contenido actualizado con éxito!');
    setTimeout(() => setGuardandoMsg(''), 3000);
  };

  // ==========================================
  // FUNCIONES: CATÁLOGO DE PRODUCTOS
  // ==========================================
  const cargarProductos = async () => {
    const querySnapshot = await getDocs(collection(db, "productos"));
    const lista = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setProductos(lista);
  };

  const guardarProducto = async (e) => {
    e.preventDefault();
    if (idEdicion) {
      // Lógica para Editar producto existente
      await updateDoc(doc(db, "productos", idEdicion), nuevoProducto);
      setIdEdicion(null);
    } else {
      // Lógica para Crear producto nuevo
      await addDoc(collection(db, "productos"), {
        ...nuevoProducto,
        activo: true // El producto nace activo por defecto
      });
    }
    setNuevoProducto(estadoInicialProducto);
    cargarProductos();
  };

  const editarProducto = (producto) => {
    setIdEdicion(producto.id);
    setNuevoProducto(producto);
  };

  const cancelarEdicion = () => {
    setIdEdicion(null);
    setNuevoProducto(estadoInicialProducto);
  };

  const toggleActivo = async (id, estadoActual) => {
    await updateDoc(doc(db, "productos", id), { activo: !estadoActual });
    cargarProductos();
  };

  // Pantalla de carga mientras verifica credenciales
  if (verificando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-xl font-bold text-gosque-green">Verificando credenciales de seguridad...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 flex">
      
      {/* BARRA LATERAL */}
      <aside className="w-64 bg-gosque-green text-white hidden md:flex flex-col shadow-xl">
        <div className="p-6 text-center border-b border-green-800">
          <h2 className="text-2xl font-black tracking-wider text-amber-400">EL GOSQUE.</h2>
          <p className="text-xs text-green-200 mt-1 font-bold uppercase tracking-widest">Admin Panel</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button onClick={() => setPestanaActiva('pedidos')} className={`w-full text-left block py-3 px-4 rounded-xl font-bold transition ${pestanaActiva === 'pedidos' ? 'bg-green-800 text-white' : 'text-green-100 hover:bg-green-700'}`}>
            📦 Gestión de Pedidos
          </button>
          <button onClick={() => setPestanaActiva('catalogo')} className={`w-full text-left block py-3 px-4 rounded-xl font-bold transition ${pestanaActiva === 'catalogo' ? 'bg-green-800 text-white' : 'text-green-100 hover:bg-green-700'}`}>
            ☕ Catálogo de Productos
          </button>
          <button onClick={() => setPestanaActiva('contenido')} className={`w-full text-left block py-3 px-4 rounded-xl font-bold transition ${pestanaActiva === 'contenido' ? 'bg-green-800 text-white' : 'text-green-100 hover:bg-green-700'}`}>
            📝 Editar Web Pública
          </button>
        </nav>
        <div className="p-4 border-t border-green-800">
          <Link to="/" className="block text-center py-2 text-sm hover:text-amber-300 font-bold transition">← Salir a la Web</Link>
        </div>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Panel de Control</h1>
        </header>

        {/* PESTAÑA: CATÁLOGO */}
        {pestanaActiva === 'catalogo' && (
          <div className="space-y-8 max-w-5xl">
            
            {/* Formulario de Creación / Edición */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
              <h3 className="font-bold text-2xl text-gray-900 mb-2">
                {idEdicion ? 'Editar Producto' : 'Registrar Nuevo Producto'}
              </h3>
              <p className="text-gray-500 mb-6">Gestiona las variedades, especificando su tipo, presentación y precio.</p>
              
              <form onSubmit={guardarProducto} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Variedad</label>
                  <select className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-gosque-green outline-none" value={nuevoProducto.nombre} onChange={e => setNuevoProducto({...nuevoProducto, nombre: e.target.value})}>
                    <option>Gourmet</option>
                    <option>Especial El Gosque</option>
                    <option>Oro Negro</option>
                    <option>Caracolillo</option>
                    <option>Orgone</option>
                    <option>Gran Selección</option>
                    <option>Geisha</option>
                    <option>Huayacho</option>
                    <option>Suflexión</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Precio Referencial (S/)</label>
                  <input type="number" step="0.10" required className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-gosque-green outline-none" value={nuevoProducto.precioReferencial} onChange={e => setNuevoProducto({...nuevoProducto, precioReferencial: e.target.value})} placeholder="Ej. 45.00"/>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Tipo de Café</label>
                  <select className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-gosque-green outline-none" value={nuevoProducto.tipo} onChange={e => setNuevoProducto({...nuevoProducto, tipo: e.target.value})}>
                    <option>Tostado</option>
                    <option>Verde</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Presentación</label>
                  <select className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-gosque-green outline-none" value={nuevoProducto.presentacion} onChange={e => setNuevoProducto({...nuevoProducto, presentacion: e.target.value})}>
                    <option>En grano</option>
                    <option>Molido</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Peso / Formato</label>
                  <input type="text" required className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-gosque-green outline-none" value={nuevoProducto.peso} onChange={e => setNuevoProducto({...nuevoProducto, peso: e.target.value})} placeholder="Ej. 250g, 1kg, Saco 50kg"/>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Descripción de cata / Detalles</label>
                  <input type="text" required className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-gosque-green outline-none" value={nuevoProducto.descripcion} onChange={e => setNuevoProducto({...nuevoProducto, descripcion: e.target.value})} placeholder="Ej. Notas frutales y aroma silvestre."/>
                </div>
                
                <div className="md:col-span-2 mt-4 flex gap-4">
                  <button type="submit" className="bg-gosque-green text-white font-bold py-3 px-8 rounded-xl hover:bg-green-700 transition shadow-lg">
                    {idEdicion ? 'Actualizar Producto' : 'Registrar Producto'}
                  </button>
                  {idEdicion && (
                    <button type="button" onClick={cancelarEdicion} className="bg-gray-200 text-gray-700 font-bold py-3 px-8 rounded-xl hover:bg-gray-300 transition shadow">
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Tabla de Productos */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-gray-50">
                <h3 className="font-bold text-lg text-gray-900">Productos Registrados</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-100 text-xs uppercase text-gray-500 font-bold">
                    <tr>
                      <th className="p-4">Variedad</th>
                      <th className="p-4">Tipo / Pres.</th>
                      <th className="p-4">Peso</th>
                      <th className="p-4">Precio Ref.</th>
                      <th className="p-4 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {productos.map(prod => (
                      <tr key={prod.id} className="hover:bg-gray-50">
                        <td className="p-4 font-bold text-gray-900">{prod.nombre}</td>
                        <td className="p-4 text-sm text-gray-600">{prod.tipo} - {prod.presentacion}</td>
                        <td className="p-4 text-sm text-gray-600">{prod.peso}</td>
                        <td className="p-4 font-bold text-gosque-brown">S/ {prod.precioReferencial}</td>
                        <td className="p-4 text-center flex justify-center gap-2">
                          <button onClick={() => editarProducto(prod)} className="px-4 py-1 text-xs font-bold rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 transition">
                            Editar
                          </button>
                          <button onClick={() => toggleActivo(prod.id, prod.activo)} className={`px-4 py-1 text-xs font-bold rounded-full transition ${prod.activo ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}>
                            {prod.activo ? 'Activo' : 'Inactivo'}
                          </button>
                        </td>
                      </tr>
                    ))}
                    {productos.length === 0 && (
                      <tr>
                        <td colSpan="5" className="p-8 text-center text-gray-500">No hay productos registrados en el catálogo.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* PESTAÑA: CONTENIDO WEB */}
        {pestanaActiva === 'contenido' && (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 max-w-3xl">
            <h3 className="font-bold text-2xl text-gray-900 mb-2">Información Institucional</h3>
            <p className="text-gray-500 mb-8">Actualiza el texto principal que los clientes ven en la página de inicio.</p>
            
            <form onSubmit={guardarContenidoWeb} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Título Principal</label>
                <input type="text" className="w-full bg-gray-50 border border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-gosque-green outline-none transition" value={contenidoInfo.titulo} onChange={(e) => setContenidoInfo({...contenidoInfo, titulo: e.target.value})} placeholder="Ej. Café Verde y Tostado" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Descripción de la Empresa</label>
                <textarea rows="4" className="w-full bg-gray-50 border border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-gosque-green outline-none transition" value={contenidoInfo.descripcion} onChange={(e) => setContenidoInfo({...contenidoInfo, descripcion: e.target.value})} placeholder="Escribe la historia o enfoque de la empresa..." required></textarea>
              </div>
              <div className="flex items-center gap-4">
                <button type="submit" className="bg-gosque-green text-white font-bold py-3 px-8 rounded-xl hover:bg-green-700 transition shadow-lg shadow-green-900/20">
                  Publicar Cambios
                </button>
                {guardandoMsg && <span className="text-green-600 font-bold bg-green-50 px-4 py-2 rounded-lg">{guardandoMsg}</span>}
              </div>
            </form>
          </div>
        )}

        {/* PESTAÑA: GESTIÓN DE PEDIDOS */}
        {pestanaActiva === 'pedidos' && (
           <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-12 text-center">
              <h3 className="font-bold text-2xl text-gray-900 mb-2">Módulo de Pedidos</h3>
              <p className="text-gray-500">Aquí irá la tabla para consultar solicitudes, convertir pedidos y actualizar estados (vendido, pagado, enviado).</p>
           </div>
        )}

      </main>
    </div>
  );
};

export default AdminDashboard;