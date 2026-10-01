import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase'; 
import { doc, getDoc, setDoc, collection, addDoc, getDocs, updateDoc, query, orderBy, serverTimestamp } from 'firebase/firestore';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [verificando, setVerificando] = useState(true);
  const [adminUser, setAdminUser] = useState(null);
  const [pestanaActiva, setPestanaActiva] = useState('pedidos');
  
  // ESTADOS: CONTENIDO INSTITUCIONAL
  const [contenidoInfo, setContenidoInfo] = useState({ titulo: '', descripcion: '' });
  const [guardandoMsg, setGuardandoMsg] = useState('');

  // ESTADOS: TRAZABILIDAD
  const etapasBase = ["Semilla", "Cultivo", "Cosecha", "Despulpado", "Fermentación", "Lavado", "Secado", "Tostado", "Empaquetado"];
  const [regionProcedencia, setRegionProcedencia] = useState('Rodríguez de Mendoza, Amazonas');
  const [etapasTrazabilidad, setEtapasTrazabilidad] = useState(etapasBase.map(e => ({ nombre: e, descripcion: '', img: '' })));

  // ESTADOS: CATÁLOGO DE PRODUCTOS (BASE64)
  const [productos, setProductos] = useState([]);
  const estadoInicialProducto = { nombre: 'Gourmet', descripcion: '', tipo: 'Tostado', presentacion: 'En grano', peso: '1 kg', precioReferencial: '' };
  const [nuevoProducto, setNuevoProducto] = useState(estadoInicialProducto);
  const [idEdicion, setIdEdicion] = useState(null); 
  const [imagenArchivo, setImagenArchivo] = useState(null);
  const [subiendoImg, setSubiendoImg] = useState(false);

  // ESTADOS: PEDIDOS, PAGOS (REQ-F08, REQ-F09) Y ENVÍOS (REQ-F10)
  const [pedidos, setPedidos] = useState([]);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [modalPedidoVisible, setModalPedidoVisible] = useState(false);
  
  const [filtroEstado, setFiltroEstado] = useState('Todos'); 
  const [busquedaPedido, setBusquedaPedido] = useState(''); 
  
  // Paginación
  const [pedidosVisibles, setPedidosVisibles] = useState(10);

  const [precioAcordado, setPrecioAcordado] = useState(''); 
  const [nuevoEstado, setNuevoEstado] = useState(''); 
  const [motivoCancelacion, setMotivoCancelacion] = useState(''); 

  const [metodoPago, setMetodoPago] = useState('');
  const [montoPagado, setMontoPagado] = useState('');
  const [fechaPago, setFechaPago] = useState('');
  const [nroOperacion, setNroOperacion] = useState('');
  const [referenciaConstancia, setReferenciaConstancia] = useState('');

  // Estados para Despacho / Envíos (REQ-F10)
  const [modalidadEnvio, setModalidadEnvio] = useState('');
  const [agenciaEnvio, setAgenciaEnvio] = useState('');
  const [nroGuia, setNroGuia] = useState('');
  const [fechaDespacho, setFechaDespacho] = useState('');

  // CARGA INICIAL
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, "usuarios", user.uid));
        if (userDoc.exists() && userDoc.data().rol === "admin") {
          setAdminUser({ uid: user.uid, nombre: userDoc.data().nombre });
          setVerificando(false);
          cargarContenidoWeb();
          cargarTrazabilidad();
          cargarProductos();
          cargarPedidos();
        } else { navigate('/'); }
      } else { navigate('/login'); }
    });
    return () => unsubscribe();
  }, [navigate]);

  // FUNCIONES: CONTENIDO INSTITUCIONAL
  const cargarContenidoWeb = async () => {
    const docSnap = await getDoc(doc(db, "ajustes", "institucional"));
    if (docSnap.exists()) setContenidoInfo(docSnap.data());
  };

  const guardarContenidoWeb = async (e) => {
    e.preventDefault();
    setGuardandoMsg('Guardando contenido...');
    await setDoc(doc(db, "ajustes", "institucional"), contenidoInfo);
    setGuardandoMsg('¡Contenido actualizado!');
    setTimeout(() => setGuardandoMsg(''), 3000);
  };

  // FUNCIONES: TRAZABILIDAD
  const cargarTrazabilidad = async () => {
    const docTraza = await getDoc(doc(db, "ajustes", "trazabilidad"));
    if (docTraza.exists()) {
      setRegionProcedencia(docTraza.data().region || 'Rodríguez de Mendoza, Amazonas');
      if (docTraza.data().etapas) setEtapasTrazabilidad(docTraza.data().etapas);
    }
  };

  const guardarTrazabilidad = async (e) => {
    e.preventDefault();
    setGuardandoMsg('Guardando trazabilidad...');
    await setDoc(doc(db, "ajustes", "trazabilidad"), { region: regionProcedencia, etapas: etapasTrazabilidad });
    setGuardandoMsg('¡Trazabilidad actualizada!');
    setTimeout(() => setGuardandoMsg(''), 3000);
  };

  const handleEtapaChange = (index, campo, valor) => {
    const nuevasEtapas = [...etapasTrazabilidad];
    nuevasEtapas[index][campo] = valor;
    setEtapasTrazabilidad(nuevasEtapas);
  };

  // FUNCIONES: CATÁLOGO CON BASE64
  const cargarProductos = async () => {
    const querySnapshot = await getDocs(collection(db, "productos"));
    setProductos(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const convertirABase64 = (archivo) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(archivo);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const guardarProducto = async (e) => {
    e.preventDefault();
    setSubiendoImg(true);

    try {
      let urlImagen = nuevoProducto.imagenUrl || "";

      if (imagenArchivo) {
        if (imagenArchivo.size > 800000) {
          alert("La imagen es muy pesada. Por favor, elige una imagen que pese menos de 800 KB.");
          setSubiendoImg(false);
          return;
        }
        urlImagen = await convertirABase64(imagenArchivo);
      }

      const datosFinales = {
        ...nuevoProducto,
        imagenUrl: urlImagen
      };

      if (idEdicion) {
        await updateDoc(doc(db, "productos", idEdicion), datosFinales);
        setIdEdicion(null);
      } else {
        await addDoc(collection(db, "productos"), { ...datosFinales, activo: true });
      }

      setNuevoProducto(estadoInicialProducto);
      setImagenArchivo(null);
      cargarProductos();
    } catch (error) {
      console.error("Error al guardar producto:", error);
      alert("Hubo un problema al guardar el producto.");
    } finally {
      setSubiendoImg(false);
    }
  };

  const editarProducto = (producto) => { setIdEdicion(producto.id); setNuevoProducto(producto); };
  
  const cancelarEdicion = () => { 
    setIdEdicion(null); 
    setNuevoProducto(estadoInicialProducto); 
    setImagenArchivo(null);
  };
  
  const toggleActivo = async (id, estadoActual) => {
    await updateDoc(doc(db, "productos", id), { activo: !estadoActual });
    cargarProductos();
  };

  // FUNCIONES: GESTIÓN DE PEDIDOS
  const cargarPedidos = async () => {
    const q = query(collection(db, "pedidos"), orderBy("fecha", "desc"));
    const querySnapshot = await getDocs(q);
    setPedidos(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const abrirModalPedido = (pedido) => {
    setPedidoSeleccionado(pedido);
    setPrecioAcordado(pedido.total || ''); 
    setNuevoEstado(pedido.estado || 'Pendiente'); 
    setMotivoCancelacion('');

    const pago = pedido.datosPago || {};
    setMetodoPago(pago.metodo || '');
    setMontoPagado(pago.monto || '');
    setFechaPago(pago.fecha || '');
    setNroOperacion(pago.nroOperacion || '');
    setReferenciaConstancia(pago.constancia || '');

    const envio = pedido.datosEnvio || {};
    setModalidadEnvio(envio.modalidad || '');
    setAgenciaEnvio(envio.agencia || '');
    setNroGuia(envio.numeroGuia || '');
    setFechaDespacho(envio.fechaEnvio || '');

    setModalPedidoVisible(true);
  };

  const actualizarPedido = async (e) => {
    e.preventDefault();
    if (!pedidoSeleccionado) return;

    if ((nuevoEstado === 'Denegado' || nuevoEstado === 'Cancelado') && !motivoCancelacion.trim()) {
      alert("Debes ingresar un motivo para denegar o cancelar el pedido.");
      return;
    }

    if (nuevoEstado === 'Pagado' && !nroOperacion.trim()) {
      alert("Para validar el pago, debes registrar el Número de Operación.");
      return;
    }

    // Validación REQ-F10-05
    if (nuevoEstado === 'Entregado' && (!modalidadEnvio || !fechaDespacho)) {
      alert("No puedes marcar el pedido como 'Entregado' si no has registrado primero los datos de envío (Modalidad y Fecha).");
      return;
    }

    const docRef = doc(db, "pedidos", pedidoSeleccionado.id);
    
    const nuevoHistorial = {
      estadoAnterior: pedidoSeleccionado.estado,
      estadoNuevo: nuevoEstado,
      fechaCambio: new Date().toISOString(),
      responsable: adminUser.nombre,
      motivo: motivoCancelacion || 'Actualización administrativa'
    };

    const historialAcumulado = pedidoSeleccionado.historial ? [...pedidoSeleccionado.historial, nuevoHistorial] : [nuevoHistorial];

    const datosPagoActualizados = {
      metodo: metodoPago,
      monto: montoPagado,
      fecha: fechaPago,
      nroOperacion: nroOperacion,
      constancia: referenciaConstancia 
    };

    const datosEnvioActualizados = {
      modalidad: modalidadEnvio,
      agencia: agenciaEnvio,
      numeroGuia: nroGuia,
      fechaEnvio: fechaDespacho
    };

    await updateDoc(docRef, {
      total: parseFloat(precioAcordado),
      estado: nuevoEstado,
      historial: historialAcumulado,
      datosPago: datosPagoActualizados,
      datosEnvio: datosEnvioActualizados, 
      fechaActualizacion: serverTimestamp()
    });

    setModalPedidoVisible(false);
    cargarPedidos();
  };

  const formatearFecha = (timestamp) => {
    if (!timestamp) return 'Fecha pendiente';
    let date;
    if (timestamp.seconds) {
        date = new Date(timestamp.seconds * 1000);
    } else if (typeof timestamp === 'string') {
        date = new Date(timestamp);
    } else {
        return 'Fecha pendiente';
    }
    return date.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric', hour:'2-digit', minute:'2-digit' });
  };

  // Lógica combinada: Filtro de Estado + Buscador de texto
  const pedidosFiltrados = pedidos.filter(p => {
    const coincideEstado = filtroEstado === 'Todos' || p.estado === filtroEstado;
    
    const termino = busquedaPedido.toLowerCase();
    const coincideBusqueda = termino === '' || 
      (p.codigo && p.codigo.toLowerCase().includes(termino)) || 
      (p.clienteNombre && p.clienteNombre.toLowerCase().includes(termino)) || 
      (p.negocio && p.negocio.toLowerCase().includes(termino));

    return coincideEstado && coincideBusqueda;
  });
  
  const solicitudesPorConfirmar = pedidosFiltrados.filter(p => p.estado === 'Pendiente');
  const pedidosConfirmados = pedidosFiltrados.filter(p => p.estado !== 'Pendiente');

  if (verificando) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><p className="text-xl font-bold text-gosque-green">Verificando credenciales...</p></div>;

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 flex">
      <aside className="w-64 bg-gosque-green text-white hidden md:flex flex-col shadow-xl">
        <div className="p-6 text-center border-b border-green-800">
          <h2 className="text-2xl font-black tracking-wider text-amber-400">EL GOSQUE.</h2>
          <p className="text-xs text-green-200 mt-1 font-bold uppercase tracking-widest">Admin Panel</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button onClick={() => setPestanaActiva('pedidos')} className={`w-full text-left block py-3 px-4 rounded-xl font-bold transition ${pestanaActiva === 'pedidos' ? 'bg-green-800 text-white' : 'text-green-100 hover:bg-green-700'}`}>📦 Gestión de Pedidos</button>
          <button onClick={() => setPestanaActiva('catalogo')} className={`w-full text-left block py-3 px-4 rounded-xl font-bold transition ${pestanaActiva === 'catalogo' ? 'bg-green-800 text-white' : 'text-green-100 hover:bg-green-700'}`}>☕ Catálogo de Productos</button>
          <button onClick={() => setPestanaActiva('trazabilidad')} className={`w-full text-left block py-3 px-4 rounded-xl font-bold transition ${pestanaActiva === 'trazabilidad' ? 'bg-green-800 text-white' : 'text-green-100 hover:bg-green-700'}`}>🌱 Trazabilidad</button>
          <button onClick={() => setPestanaActiva('contenido')} className={`w-full text-left block py-3 px-4 rounded-xl font-bold transition ${pestanaActiva === 'contenido' ? 'bg-green-800 text-white' : 'text-green-100 hover:bg-green-700'}`}>📝 Editar Web Pública</button>
        </nav>
        <div className="p-4 border-t border-green-800"><Link to="/" className="block text-center py-2 text-sm hover:text-amber-300 font-bold">← Salir a la Web</Link></div>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">
        <header className="mb-8"><h1 className="text-3xl font-black text-gray-900 tracking-tight">Panel de Control</h1></header>

        {/* 1. PESTAÑA: PEDIDOS */}
        {pestanaActiva === 'pedidos' && (
          <div className="space-y-8">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
               <div>
                  <h3 className="font-bold text-lg text-gray-900">Filtrar y Buscar</h3>
               </div>
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                <input 
                  type="text" 
                  placeholder="Buscar por código, cliente o negocio..." 
                  className="border border-gray-200 p-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-gosque-green w-full sm:w-64"
                  value={busquedaPedido}
                  onChange={e => setBusquedaPedido(e.target.value)}
                />
                <select 
                  className="border border-gray-200 p-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-gosque-green w-full sm:w-auto" 
                  value={filtroEstado} 
                  onChange={e => setFiltroEstado(e.target.value)}
                >
                  <option>Todos</option><option>Pendiente</option><option>Vendido</option><option>Pagado</option>
                  <option>Enviado</option><option>Entregado</option><option>Denegado</option><option>Cancelado</option>
                </select>
              </div>
            </div>
            {/* TABLA 1: SOLICITUDES PENDIENTES */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-amber-50">
                <h3 className="font-bold text-lg text-amber-900">Nuevas Solicitudes (Por Confirmar)</h3>
                <p className="text-xs text-amber-700">Revisar, cotizar y convertir a pedido.</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-bold">
                    <tr><th className="p-4">Código / Fecha</th><th className="p-4">Cliente</th><th className="p-4">Estado</th><th className="p-4 text-center">Acción</th></tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {solicitudesPorConfirmar.slice(0, pedidosVisibles).map(pedido => (
                      <tr key={pedido.id} className="hover:bg-amber-50/50">
                        <td className="p-4"><span className="font-black text-gosque-green block">{pedido.codigo}</span><span className="text-xs text-gray-500">{formatearFecha(pedido.fecha)}</span></td>
                        <td className="p-4"><span className="font-bold block">{pedido.clienteNombre}</span></td>
                        <td className="p-4"><span className="px-3 py-1 rounded-full text-xs font-bold border bg-yellow-100 text-yellow-800">Solicitud</span></td>
                        <td className="p-4 text-center"><button onClick={() => abrirModalPedido(pedido)} className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl text-xs font-bold transition">Cotizar</button></td>
                      </tr>
                    ))}
                    {solicitudesPorConfirmar.length === 0 && <tr><td colSpan="4" className="p-8 text-center text-gray-500">No se encontraron solicitudes.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>

            {/* TABLA 2: PEDIDOS CONFIRMADOS */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-gosque-green">
                <h3 className="font-bold text-lg text-white">Pedidos Confirmados</h3>
                <p className="text-xs text-green-100">Gestión de pagos, envíos y entregas.</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-bold">
                    <tr><th className="p-4">Código</th><th className="p-4">Cliente</th><th className="p-4">Total Acordado</th><th className="p-4">Estado Operativo</th><th className="p-4 text-center">Gestión</th></tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {pedidosConfirmados.slice(0, pedidosVisibles).map(pedido => (
                      <tr key={pedido.id} className="hover:bg-gray-50">
                        <td className="p-4 font-black text-gosque-green">{pedido.codigo}</td>
                        <td className="p-4 font-bold">{pedido.clienteNombre}</td>
                        <td className="p-4 font-black text-gosque-brown">S/ {pedido.total?.toFixed(2)}</td>
                        <td className="p-4"><span className="px-3 py-1 rounded-full text-xs font-bold border bg-blue-100 text-blue-800">{pedido.estado}</span></td>
                        <td className="p-4 text-center"><button onClick={() => abrirModalPedido(pedido)} className="bg-gray-900 hover:bg-gray-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition">Administrar</button></td>
                      </tr>
                    ))}
                     {pedidosConfirmados.length === 0 && <tr><td colSpan="5" className="p-8 text-center text-gray-500">No se encontraron pedidos.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
            
            {pedidosFiltrados.length > pedidosVisibles && (
                <div className="text-center mt-4">
                  <button 
                     onClick={() => setPedidosVisibles(prev => prev + 10)} 
                     className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-6 rounded-full transition"
                  >
                    Cargar más pedidos
                  </button>
                </div>
            )}
          </div>
        )}

        {/* 2. PESTAÑA: CATÁLOGO */}
        {pestanaActiva === 'catalogo' && (
          <div className="space-y-8 max-w-5xl">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
              <h3 className="font-bold text-2xl text-gray-900 mb-6">{idEdicion ? 'Editar Producto' : 'Registrar Nuevo Producto'}</h3>
              
              <form onSubmit={guardarProducto} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Variedad</label>
                  <select className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-gosque-green outline-none" value={nuevoProducto.nombre} onChange={e => setNuevoProducto({...nuevoProducto, nombre: e.target.value})}>
                    <option>Gourmet</option><option>Especial El Gosque</option><option>Oro Negro</option><option>Caracolillo</option><option>Orgone</option><option>Gran Selección</option><option>Geisha</option><option>Huayacho</option><option>Suflexión</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Precio Ref. (S/)</label>
                  <input type="number" step="0.10" required className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl outline-none" value={nuevoProducto.precioReferencial} onChange={e => setNuevoProducto({...nuevoProducto, precioReferencial: e.target.value})}/>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Tipo</label>
                  <select className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl outline-none" value={nuevoProducto.tipo} onChange={e => setNuevoProducto({...nuevoProducto, tipo: e.target.value})}><option>Tostado</option><option>Verde</option></select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Presentación</label>
                  <select className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl outline-none" value={nuevoProducto.presentacion} onChange={e => setNuevoProducto({...nuevoProducto, presentacion: e.target.value})}><option>En grano</option><option>Molido</option></select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Peso</label>
                  <input type="text" required className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl outline-none" value={nuevoProducto.peso} onChange={e => setNuevoProducto({...nuevoProducto, peso: e.target.value})} placeholder="Ej. 1kg"/>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Descripción</label>
                  <input type="text" required className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl outline-none" value={nuevoProducto.descripcion} onChange={e => setNuevoProducto({...nuevoProducto, descripcion: e.target.value})}/>
                </div>

                <div className="md:col-span-2 bg-white border border-gray-200 p-4 rounded-xl mt-2">
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Imagen del Producto (Max 800 KB)</label>
                  <input type="file" accept="image/*" onChange={(e) => setImagenArchivo(e.target.files[0])} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-green-50 file:text-gosque-green hover:file:bg-green-100 transition" />
                  {nuevoProducto.imagenUrl && !imagenArchivo && <p className="text-xs text-amber-600 mt-2 font-bold">Este producto ya tiene una imagen guardada.</p>}
                </div>

                <div className="md:col-span-2 mt-4 flex gap-4">
                  <button type="submit" disabled={subiendoImg} className="bg-gosque-green text-white font-bold py-3 px-8 rounded-xl disabled:bg-gray-400">{subiendoImg ? 'Procesando...' : (idEdicion ? 'Actualizar Producto' : 'Registrar Producto')}</button>
                  {idEdicion && <button type="button" onClick={cancelarEdicion} className="bg-gray-200 font-bold py-3 px-8 rounded-xl">Cancelar</button>}
                </div>
              </form>
            </div>
            
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-100 text-xs uppercase text-gray-500 font-bold">
                  <tr><th className="p-4">Variedad</th><th className="p-4">Tipo / Pres.</th><th className="p-4">Precio</th><th className="p-4 text-center">Acciones</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {productos.map(prod => (
                    <tr key={prod.id} className="hover:bg-gray-50">
                      <td className="p-4 font-bold flex items-center gap-3">
                        {prod.imagenUrl ? <img src={prod.imagenUrl} alt={prod.nombre} className="w-10 h-10 object-cover rounded-full shadow-sm" /> : <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-xs text-gray-500 shadow-sm">N/A</div>}
                        {prod.nombre}
                      </td>
                      <td className="p-4 text-sm text-gray-600">{prod.tipo} - {prod.presentacion}</td>
                      <td className="p-4 font-bold text-gosque-brown">S/ {prod.precioReferencial}</td>
                      <td className="p-4 text-center flex justify-center gap-2">
                        <button onClick={() => editarProducto(prod)} className="px-4 py-1 text-xs font-bold rounded-full bg-blue-100 text-blue-700">Editar</button>
                        <button onClick={() => toggleActivo(prod.id, prod.activo)} className={`px-4 py-1 text-xs font-bold rounded-full ${prod.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{prod.activo ? 'Activo' : 'Inactivo'}</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. PESTAÑA: TRAZABILIDAD */}
        {pestanaActiva === 'trazabilidad' && (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 max-w-4xl">
            <h3 className="font-bold text-2xl text-gray-900 mb-6">Trazabilidad del Café</h3>
            <form onSubmit={guardarTrazabilidad} className="space-y-6">
              <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
                <label className="block text-xs font-bold text-amber-900 uppercase mb-2">Región de Procedencia</label>
                <input type="text" className="w-full bg-white border border-amber-300 p-3 rounded-lg outline-none" value={regionProcedencia} onChange={(e) => setRegionProcedencia(e.target.value)} required />
              </div>
              <div className="space-y-4">
                {etapasTrazabilidad.map((etapa, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <div className="md:col-span-3"><span className="font-bold text-gosque-green">{index + 1}. {etapa.nombre}</span></div>
                    <div className="md:col-span-5"><input type="text" placeholder="Descripción..." className="w-full text-sm border p-2 rounded outline-none" value={etapa.descripcion} onChange={(e) => handleEtapaChange(index, 'descripcion', e.target.value)} /></div>
                    <div className="md:col-span-4"><input type="text" placeholder="URL Imagen" className="w-full text-sm border p-2 rounded outline-none" value={etapa.img} onChange={(e) => handleEtapaChange(index, 'img', e.target.value)} /></div>
                  </div>
                ))}
              </div>
              <button type="submit" className="bg-gosque-green text-white font-bold py-3 px-8 rounded-xl shadow-lg">Actualizar Trazabilidad</button>
            </form>
          </div>
        )}

        {/* 4. PESTAÑA: CONTENIDO WEB */}
        {pestanaActiva === 'contenido' && (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 max-w-3xl">
            <h3 className="font-bold text-2xl text-gray-900 mb-6">Información Institucional</h3>
            <form onSubmit={guardarContenidoWeb} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Título Principal</label>
                <input type="text" className="w-full bg-gray-50 border p-4 rounded-xl outline-none" value={contenidoInfo.titulo} onChange={(e) => setContenidoInfo({...contenidoInfo, titulo: e.target.value})} required />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Descripción</label>
                <textarea rows="4" className="w-full bg-gray-50 border p-4 rounded-xl outline-none" value={contenidoInfo.descripcion} onChange={(e) => setContenidoInfo({...contenidoInfo, descripcion: e.target.value})} required></textarea>
              </div>
              <button type="submit" className="bg-gosque-green text-white font-bold py-3 px-8 rounded-xl shadow-lg">Publicar Cambios</button>
            </form>
          </div>
        )}
      </main>

      {/* MODAL DE GESTIÓN DE PEDIDOS Y PAGOS */}
      {modalPedidoVisible && pedidoSeleccionado && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-gray-50 p-6 border-b flex justify-between items-center">
              <div><span className="text-xs font-bold text-gray-400 uppercase block mb-1">Gestión de Pedido</span><h3 className="font-black text-2xl text-gosque-green">{pedidoSeleccionado.codigo}</h3></div>
              <button onClick={() => setModalPedidoVisible(false)} className="text-gray-400 hover:text-red-500 font-black text-xl">X</button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <h4 className="text-sm font-bold text-gray-900 uppercase mb-3">Productos Solicitados</h4>
                <ul className="space-y-1">
                  {pedidoSeleccionado.productos?.map((prod, idx) => (
                    <li key={idx} className="flex justify-between text-sm"><span className="font-bold">{prod.cantidad}x {prod.nombre}</span><span className="text-gray-500">S/ {prod.subtotal?.toFixed(2)}</span></li>
                  ))}
                </ul>
              </div>

              <form id="form-actualizar-pedido" onSubmit={actualizarPedido} className="space-y-6">
                
                {/* REQ-F09: REGISTRO DE PAGOS */}
                <div className="border border-blue-100 bg-blue-50/30 p-5 rounded-xl">
                  <h4 className="text-sm font-black text-blue-900 uppercase mb-4 flex items-center gap-2">💰 Registro de Pago y Validación</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Medio de Pago</label>
                      <select className="w-full bg-white border border-gray-300 p-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" value={metodoPago} onChange={e => setMetodoPago(e.target.value)}>
                        <option value="">-- Seleccionar --</option>
                        <option>Efectivo</option><option>Yape</option><option>Plin</option><option>Transferencia Bancaria</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Monto Pagado (S/)</label>
                      <input type="number" step="0.10" className="w-full bg-white border border-gray-300 p-2 rounded-lg outline-none" value={montoPagado} onChange={e => setMontoPagado(e.target.value)} placeholder="Ej. 150.00" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Fecha de Pago</label>
                      <input type="date" className="w-full bg-white border border-gray-300 p-2 rounded-lg outline-none" value={fechaPago} onChange={e => setFechaPago(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Nro. de Operación</label>
                      <input type="text" className="w-full bg-white border border-gray-300 p-2 rounded-lg outline-none" value={nroOperacion} onChange={e => setNroOperacion(e.target.value)} placeholder="Ej. 984523" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Referencia / Constancia (URL o Nota)</label>
                      <input type="text" className="w-full bg-white border border-gray-300 p-2 rounded-lg outline-none" value={referenciaConstancia} onChange={e => setReferenciaConstancia(e.target.value)} placeholder="Enlace a captura o ubicación de la constancia" />
                    </div>
                  </div>
                </div>

                {/* REQ-F10: REGISTRO DE ENVÍOS Y ENTREGAS */}
                <div className="border border-purple-100 bg-purple-50/30 p-5 rounded-xl">
                  <h4 className="text-sm font-black text-purple-900 uppercase mb-4 flex items-center gap-2">📦 Datos de Despacho</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Modalidad de Entrega</label>
                      <select className="w-full bg-white border border-gray-300 p-2 rounded-lg outline-none focus:ring-2 focus:ring-purple-500" value={modalidadEnvio} onChange={e => setModalidadEnvio(e.target.value)}>
                        <option value="">-- Seleccionar --</option>
                        <option>Agencia (Encomienda)</option><option>Delivery Local</option><option>Recojo en Tienda</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Agencia / Transportista</label>
                      <input type="text" className="w-full bg-white border border-gray-300 p-2 rounded-lg outline-none" value={agenciaEnvio} onChange={e => setAgenciaEnvio(e.target.value)} placeholder="Ej. Shalom, Olva, Moto 1..." />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Fecha de Envío</label>
                      <input type="date" className="w-full bg-white border border-gray-300 p-2 rounded-lg outline-none" value={fechaDespacho} onChange={e => setFechaDespacho(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Número de Guía (Tracking)</label>
                      <input type="text" className="w-full bg-white border border-gray-300 p-2 rounded-lg outline-none" value={nroGuia} onChange={e => setNroGuia(e.target.value)} placeholder="Ej. TRU-009812" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
                    <label className="block text-xs font-bold text-amber-900 uppercase mb-2">Total Acordado (S/)</label>
                    <input type="number" step="0.10" required className="w-full bg-white border border-amber-300 p-2 rounded-lg font-bold outline-none" value={precioAcordado} onChange={e => setPrecioAcordado(e.target.value)} />
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <label className="block text-xs font-bold text-gray-900 uppercase mb-2">Estado General</label>
                    <select className="w-full bg-white border border-gray-300 p-2 rounded-lg font-bold outline-none" value={nuevoEstado} onChange={e => setNuevoEstado(e.target.value)}>
                      <option>Pendiente</option><option>Vendido</option><option>Pagado</option><option>Enviado</option><option>Entregado</option><option>Denegado</option><option>Cancelado</option>
                    </select>
                  </div>
                </div>

                {(nuevoEstado === 'Denegado' || nuevoEstado === 'Cancelado') && (
                  <div>
                    <label className="block text-xs font-bold text-red-700 uppercase mb-2">Motivo (Obligatorio)</label>
                    <input type="text" className="w-full border border-red-300 p-3 rounded-lg outline-none bg-red-50" value={motivoCancelacion} onChange={e => setMotivoCancelacion(e.target.value)} />
                  </div>
                )}
              </form>

              {/* Renderizado del Historial en el Modal */}
              {pedidoSeleccionado.historial && pedidoSeleccionado.historial.length > 0 && (
                <div className="mt-8 border-t pt-6">
                  <h4 className="text-sm font-black text-gray-900 uppercase mb-4">Auditoría de Estados (REQ-F08-05)</h4>
                  <div className="space-y-4 border-l-2 border-gosque-green ml-3 pl-4">
                    {pedidoSeleccionado.historial.map((hist, idx) => (
                      <div key={idx} className="relative">
                        <div className="absolute -left-[21px] top-1 w-3 h-3 bg-gosque-green rounded-full border-2 border-white"></div>
                        <p className="text-xs text-gray-500 font-bold mb-1">
                          {new Date(hist.fechaCambio).toLocaleString('es-PE')} — Modificado por: <span className="text-gray-900">{hist.responsable}</span>
                        </p>
                        <p className="text-sm text-gray-800">
                          Cambio a <span className="font-black text-gosque-green">{hist.estadoNuevo}</span>. 
                          <span className="text-gray-500 italic ml-2">Motivo: {hist.motivo}</span>
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-gray-50 p-6 border-t border-gray-100 flex justify-end gap-4">
              <button onClick={() => setModalPedidoVisible(false)} className="px-6 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-200">Cerrar</button>
              <button type="submit" form="form-actualizar-pedido" className="px-6 py-3 rounded-xl font-bold bg-gosque-green text-white hover:bg-green-700 shadow-lg">Guardar y Validar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;