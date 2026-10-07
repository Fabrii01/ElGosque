import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase'; 
import { doc, getDoc, setDoc, collection, addDoc, getDocs, updateDoc, query, orderBy, serverTimestamp } from 'firebase/firestore';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [verificando, setVerificando] = useState(true);
  const [adminUser, setAdminUser] = useState(null);
  const [pestanaActiva, setPestanaActiva] = useState('dashboard');
  
  // ESTADOS: CONTENIDO INSTITUCIONAL
  const [contenidoInfo, setContenidoInfo] = useState({ titulo: '', descripcion: '' });

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
  const [pedidosVisibles, setPedidosVisibles] = useState(10);

  const [precioAcordado, setPrecioAcordado] = useState(''); 
  const [nuevoEstado, setNuevoEstado] = useState(''); 
  const [motivoCancelacion, setMotivoCancelacion] = useState(''); 

  const [metodoPago, setMetodoPago] = useState('');
  const [montoPagado, setMontoPagado] = useState('');
  const [fechaPago, setFechaPago] = useState('');
  const [nroOperacion, setNroOperacion] = useState('');
  const [referenciaConstancia, setReferenciaConstancia] = useState('');

  const [modalidadEnvio, setModalidadEnvio] = useState('');
  const [agenciaEnvio, setAgenciaEnvio] = useState('');
  const [nroGuia, setNroGuia] = useState('');
  const [fechaDespacho, setFechaDespacho] = useState('');

  // ESTADO: BUSINESS INTELLIGENCE (REQ-F11)
  const [periodoBI, setPeriodoBI] = useState('Todos');

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

  // FUNCIONES DE CARGA BÁSICA
  const cargarContenidoWeb = async () => {
    const docSnap = await getDoc(doc(db, "ajustes", "institucional"));
    if (docSnap.exists()) setContenidoInfo(docSnap.data());
  };
  const guardarContenidoWeb = async (e) => {
    e.preventDefault();
    await setDoc(doc(db, "ajustes", "institucional"), contenidoInfo);
    alert("Contenido actualizado exitosamente");
  };
  
  const cargarTrazabilidad = async () => {
    const docTraza = await getDoc(doc(db, "ajustes", "trazabilidad"));
    if (docTraza.exists()) {
      setRegionProcedencia(docTraza.data().region || 'Rodríguez de Mendoza, Amazonas');
      if (docTraza.data().etapas) setEtapasTrazabilidad(docTraza.data().etapas);
    }
  };
  const guardarTrazabilidad = async (e) => {
    e.preventDefault();
    await setDoc(doc(db, "ajustes", "trazabilidad"), { region: regionProcedencia, etapas: etapasTrazabilidad });
    alert("Trazabilidad actualizada exitosamente");
  };
  const handleEtapaChange = (index, campo, valor) => {
    const nuevasEtapas = [...etapasTrazabilidad];
    nuevasEtapas[index][campo] = valor;
    setEtapasTrazabilidad(nuevasEtapas);
  };
  
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
        if (imagenArchivo.size > 800000) { alert("La imagen debe pesar menos de 800 KB."); setSubiendoImg(false); return; }
        urlImagen = await convertirABase64(imagenArchivo);
      }
      const datosFinales = { ...nuevoProducto, imagenUrl: urlImagen };
      if (idEdicion) { await updateDoc(doc(db, "productos", idEdicion), datosFinales); setIdEdicion(null); } 
      else { await addDoc(collection(db, "productos"), { ...datosFinales, activo: true }); }
      setNuevoProducto(estadoInicialProducto); setImagenArchivo(null); cargarProductos();
    } catch (error) { console.error(error); alert("Error al guardar producto"); } 
    finally { setSubiendoImg(false); }
  };
  const editarProducto = (producto) => { setIdEdicion(producto.id); setNuevoProducto(producto); };
  const cancelarEdicion = () => { setIdEdicion(null); setNuevoProducto(estadoInicialProducto); setImagenArchivo(null); };
  const toggleActivo = async (id, estadoActual) => { await updateDoc(doc(db, "productos", id), { activo: !estadoActual }); cargarProductos(); };

  const cargarPedidos = async () => {
    const q = query(collection(db, "pedidos"), orderBy("fecha", "desc"));
    const querySnapshot = await getDocs(q);
    setPedidos(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  // MOTOR DE BUSINESS INTELLIGENCE
  const estadisticasBI = useMemo(() => {
    const ventasConcretadas = pedidos.filter(p => ['Vendido', 'Pagado', 'Enviado', 'Entregado'].includes(p.estado));
    const pedidosFiltrados = ventasConcretadas.filter(p => {
      if (periodoBI === 'Todos') return true;
      if (!p.fecha) return false;
      const mesPedido = new Date(p.fecha.seconds ? p.fecha.seconds * 1000 : p.fecha).getMonth() + 1;
      return mesPedido.toString() === periodoBI;
    });

    if (pedidosFiltrados.length === 0) return null; 

    const stats = {
      ingresosTotales: 0,
      totalTransacciones: pedidosFiltrados.length,
      unidadesVendidas: 0,
      ventasPorMes: {},      
      rankingClientes: {},   
      comparativaMolido: { 'En grano': 0, 'Molido': 0, 'Verde': 0 }, 
      variedades: {},        
      ciudades: {},          
      modalidades: {}        
    };

    pedidosFiltrados.forEach(pedido => {
      stats.ingresosTotales += (pedido.total || 0);
      
      const ciudad = pedido.ciudad || 'No especificada';
      stats.ciudades[ciudad] = (stats.ciudades[ciudad] || 0) + 1;
      
      const modalidad = pedido.datosEnvio?.modalidad || 'Pendiente';
      stats.modalidades[modalidad] = (stats.modalidades[modalidad] || 0) + 1;

      if (pedido.fecha) {
        const fechaObj = new Date(pedido.fecha.seconds ? pedido.fecha.seconds * 1000 : pedido.fecha);
        const mesStr = fechaObj.toLocaleString('es-PE', { month: 'long', year: 'numeric' });
        stats.ventasPorMes[mesStr] = (stats.ventasPorMes[mesStr] || 0) + (pedido.total || 0);
      }

      const nombreCli = pedido.clienteNombre || 'Desconocido';
      if (!stats.rankingClientes[nombreCli]) { stats.rankingClientes[nombreCli] = { totalComprado: 0, volumenItems: 0, negocio: pedido.negocio }; }
      stats.rankingClientes[nombreCli].totalComprado += (pedido.total || 0);

      if (pedido.productos && Array.isArray(pedido.productos)) {
        pedido.productos.forEach(prod => {
          stats.unidadesVendidas += prod.cantidad;
          stats.variedades[prod.nombre] = (stats.variedades[prod.nombre] || 0) + prod.cantidad;
          if (stats.comparativaMolido[prod.presentacion] !== undefined) {
             stats.comparativaMolido[prod.presentacion] += prod.cantidad;
          }
          stats.rankingClientes[nombreCli].volumenItems += prod.cantidad;
        });
      }
    });

    stats.ticketPromedio = stats.ingresosTotales / stats.totalTransacciones;

    stats.topClientesArray = Object.entries(stats.rankingClientes).map(([nombre, data]) => ({ nombre, ...data })).sort((a, b) => b.totalComprado - a.totalComprado).slice(0, 5);
    stats.topVariedadesArray = Object.entries(stats.variedades).map(([nombre, cantidad]) => ({ nombre, cantidad })).sort((a, b) => b.cantidad - a.cantidad);
    stats.mesesArray = Object.entries(stats.ventasPorMes).map(([mes, total]) => ({ mes, total })).sort((a, b) => b.total - a.total); // Ordenado de mayor a menor venta

    return stats;
  }, [pedidos, periodoBI]);

  const calcularPorcentaje = (valor, maximo) => maximo === 0 ? 0 : Math.round((valor / maximo) * 100);

  // FUNCIONES DEL MODAL DE PEDIDOS
  const formatearFecha = (timestamp) => {
    if (!timestamp) return 'Pendiente';
    let date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
    return date.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric', hour:'2-digit', minute:'2-digit' });
  };

  const abrirModalPedido = (pedido) => {
    setPedidoSeleccionado(pedido);
    setPrecioAcordado(pedido.total || ''); 
    setNuevoEstado(pedido.estado || 'Pendiente'); 
    setMotivoCancelacion('');
    const pago = pedido.datosPago || {};
    setMetodoPago(pago.metodo || ''); setMontoPagado(pago.monto || ''); setFechaPago(pago.fecha || ''); setNroOperacion(pago.nroOperacion || ''); setReferenciaConstancia(pago.constancia || '');
    const envio = pedido.datosEnvio || {};
    setModalidadEnvio(envio.modalidad || ''); setAgenciaEnvio(envio.agencia || ''); setNroGuia(envio.numeroGuia || ''); setFechaDespacho(envio.fechaEnvio || '');
    setModalPedidoVisible(true);
  };

  const actualizarPedido = async (e) => {
    e.preventDefault();
    if ((nuevoEstado === 'Denegado' || nuevoEstado === 'Cancelado') && !motivoCancelacion.trim()) return alert("Debes ingresar un motivo.");
    if (nuevoEstado === 'Pagado' && !nroOperacion.trim()) return alert("Falta Número de Operación.");
    if (nuevoEstado === 'Entregado' && (!modalidadEnvio || !fechaDespacho)) return alert("Faltan datos de envío.");
    const docRef = doc(db, "pedidos", pedidoSeleccionado.id);
    const nuevoHistorial = { estadoAnterior: pedidoSeleccionado.estado, estadoNuevo: nuevoEstado, fechaCambio: new Date().toISOString(), responsable: adminUser.nombre, motivo: motivoCancelacion || 'Gestión operativa' };
    const historialAcumulado = pedidoSeleccionado.historial ? [...pedidoSeleccionado.historial, nuevoHistorial] : [nuevoHistorial];
    await updateDoc(docRef, { total: parseFloat(precioAcordado), estado: nuevoEstado, historial: historialAcumulado, datosPago: { metodo: metodoPago, monto: montoPagado, fecha: fechaPago, nroOperacion: nroOperacion, constancia: referenciaConstancia }, datosEnvio: { modalidad: modalidadEnvio, agencia: agenciaEnvio, numeroGuia: nroGuia, fechaEnvio: fechaDespacho }, fechaActualizacion: serverTimestamp() });
    setModalPedidoVisible(false); cargarPedidos();
  };

  const pedidosFiltrados = pedidos.filter(p => {
    const coincideEstado = filtroEstado === 'Todos' || p.estado === filtroEstado;
    const termino = busquedaPedido.toLowerCase();
    const coincideBusqueda = termino === '' || (p.codigo && p.codigo.toLowerCase().includes(termino)) || (p.clienteNombre && p.clienteNombre.toLowerCase().includes(termino)) || (p.negocio && p.negocio.toLowerCase().includes(termino));
    return coincideEstado && coincideBusqueda;
  });
  const solicitudesPorConfirmar = pedidosFiltrados.filter(p => p.estado === 'Pendiente');
  const pedidosConfirmados = pedidosFiltrados.filter(p => p.estado !== 'Pendiente');

  if (verificando) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><p className="text-xl font-bold text-gosque-green">Verificando credenciales...</p></div>;

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 flex">
      <aside className="w-64 bg-gosque-green text-white hidden md:flex flex-col shadow-xl shrink-0">
        <div className="p-6 text-center border-b border-green-800">
          <h2 className="text-2xl font-black tracking-wider text-amber-400">EL GOSQUE.</h2>
          <p className="text-xs text-green-200 mt-1 font-bold uppercase tracking-widest">Admin Panel</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button onClick={() => setPestanaActiva('dashboard')} className={`w-full text-left block py-3 px-4 rounded-xl font-bold transition ${pestanaActiva === 'dashboard' ? 'bg-green-800 text-white' : 'text-green-100 hover:bg-green-700'}`}>📊 Dashboard BI</button>
          <button onClick={() => setPestanaActiva('pedidos')} className={`w-full text-left block py-3 px-4 rounded-xl font-bold transition ${pestanaActiva === 'pedidos' ? 'bg-green-800 text-white' : 'text-green-100 hover:bg-green-700'}`}>📦 Gestión de Pedidos</button>
          <button onClick={() => setPestanaActiva('catalogo')} className={`w-full text-left block py-3 px-4 rounded-xl font-bold transition ${pestanaActiva === 'catalogo' ? 'bg-green-800 text-white' : 'text-green-100 hover:bg-green-700'}`}>☕ Catálogo de Productos</button>
          <button onClick={() => setPestanaActiva('trazabilidad')} className={`w-full text-left block py-3 px-4 rounded-xl font-bold transition ${pestanaActiva === 'trazabilidad' ? 'bg-green-800 text-white' : 'text-green-100 hover:bg-green-700'}`}>🌱 Trazabilidad</button>
          <button onClick={() => setPestanaActiva('contenido')} className={`w-full text-left block py-3 px-4 rounded-xl font-bold transition ${pestanaActiva === 'contenido' ? 'bg-green-800 text-white' : 'text-green-100 hover:bg-green-700'}`}>📝 Editar Web Pública</button>
        </nav>
        <div className="p-4 border-t border-green-800"><Link to="/" className="block text-center py-2 text-sm hover:text-amber-300 font-bold">← Salir a la Web</Link></div>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">
        <header className="mb-8"><h1 className="text-3xl font-black text-gray-900 tracking-tight">Panel de Control</h1></header>

        {/* PESTAÑA: DASHBOARD BI */}
        {pestanaActiva === 'dashboard' && (
          <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
               <div>
                  <h3 className="font-bold text-2xl text-gray-900">Inteligencia Comercial</h3>
                  <p className="text-sm text-gray-500">Métricas basadas en transacciones confirmadas (Vendido, Pagado, Enviado, Entregado).</p>
               </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Filtrar Mes:</span>
                <select className="border border-gray-200 p-3 rounded-xl text-sm font-bold bg-gray-50 outline-none focus:ring-2 focus:ring-gosque-green" value={periodoBI} onChange={e => setPeriodoBI(e.target.value)}>
                  <option value="Todos">Histórico Global</option>
                  <option value="1">Enero</option><option value="2">Febrero</option><option value="3">Marzo</option>
                  <option value="4">Abril</option><option value="5">Mayo</option><option value="6">Junio</option>
                  <option value="7">Julio</option><option value="8">Agosto</option><option value="9">Septiembre</option>
                  <option value="10">Octubre</option><option value="11">Noviembre</option><option value="12">Diciembre</option>
                </select>
              </div>
            </div>

            {!estadisticasBI ? (
              <div className="bg-amber-50 rounded-3xl p-12 text-center border border-amber-100">
                <div className="text-5xl mb-4">📭</div>
                <h3 className="text-xl font-bold text-amber-900 mb-2">No hay datos para el filtro seleccionado.</h3>
                <p className="text-amber-700">El motor BI requiere pedidos procesados comercialmente para generar reportes.</p>
              </div>
            ) : (
              <>
                {/* TARJETAS MÉTRICAS PRINCIPALES */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gosque-green rounded-3xl p-6 text-white shadow-lg flex flex-col justify-center">
                    <p className="text-green-100 font-bold uppercase tracking-widest text-xs mb-1">Ingresos Acumulados</p>
                    <h2 className="text-4xl font-black mb-1">S/ {estadisticasBI.ingresosTotales.toFixed(2)}</h2>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm flex flex-col justify-center">
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-1">Ticket Promedio</p>
                    <h2 className="text-4xl font-black text-gosque-brown mb-1">S/ {estadisticasBI.ticketPromedio.toFixed(2)}</h2>
                    <p className="text-xs text-gray-500">Por orden de compra.</p>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm flex flex-col justify-center">
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-1">Volumen Desplazado</p>
                    <h2 className="text-4xl font-black text-gray-900 mb-1">{estadisticasBI.unidadesVendidas}</h2>
                    <p className="text-xs text-gray-500">Unidades de café vendidas.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* COMPARATIVA MENSUAL EN BARRAS HORIZONTALES (SIEMPRE VISIBLE) */}
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <h4 className="font-bold text-gray-900 mb-6 uppercase text-sm tracking-wider flex justify-between items-center">
                      Ingresos por Mes <span className="text-xs font-normal text-gray-400 normal-case">Ordenado por volumen</span>
                    </h4>
                    <div className="space-y-4">
                      {estadisticasBI.mesesArray.map((m, idx) => {
                        const maxMes = estadisticasBI.mesesArray[0].total; // El mayor siempre es el 100%
                        const widthPct = calcularPorcentaje(m.total, maxMes);
                        return (
                          <div key={idx} className="w-full">
                            <div className="flex justify-between text-xs font-bold mb-1 text-gray-600">
                              <span className="uppercase">{m.mes}</span>
                              <span>S/ {m.total.toFixed(2)}</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-3">
                              <div className="bg-gosque-green h-3 rounded-full transition-all duration-1000" style={{ width: `${Math.max(widthPct, 2)}%` }}></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* RANKING B2B */}
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <h4 className="font-bold text-gray-900 mb-6 uppercase text-sm tracking-wider">Top Clientes B2B</h4>
                    <div className="space-y-5">
                      {estadisticasBI.topClientesArray.map((cliente, idx) => {
                        const maxCompra = estadisticasBI.topClientesArray[0].totalComprado;
                        const widthPct = calcularPorcentaje(cliente.totalComprado, maxCompra);
                        return (
                          <div key={idx}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="font-bold text-gray-800">{idx + 1}. {cliente.nombre} <span className="text-gray-400 font-normal">({cliente.negocio})</span></span>
                              <span className="font-black text-gosque-brown">S/ {cliente.totalComprado.toFixed(2)}</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2">
                              <div className="bg-amber-400 h-2 rounded-full transition-all duration-1000" style={{ width: `${Math.max(widthPct, 2)}%` }}></div>
                            </div>
                            <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold text-right">{cliente.volumenItems} unidades</p>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* COMPARATIVA GRANO VS MOLIDO */}
                  <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col justify-center">
                    <h4 className="font-bold text-gray-900 mb-4 uppercase text-xs tracking-wider text-center">Grano vs Molido</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-amber-50 py-4 rounded-xl border border-amber-100 text-center">
                        <p className="text-3xl font-black text-amber-900 mb-1">{estadisticasBI.comparativaMolido['En grano']}</p>
                        <p className="text-[10px] font-bold text-amber-700 uppercase">En Grano</p>
                      </div>
                      <div className="bg-stone-50 py-4 rounded-xl border border-stone-200 text-center">
                        <p className="text-3xl font-black text-stone-900 mb-1">{estadisticasBI.comparativaMolido['Molido']}</p>
                        <p className="text-[10px] font-bold text-stone-700 uppercase">Molido</p>
                      </div>
                    </div>
                  </div>

                  {/* VARIEDADES TOP */}
                  <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 lg:col-span-2">
                    <h4 className="font-bold text-gray-900 mb-4 uppercase text-sm tracking-wider">Distribución de Variedades</h4>
                    <div className="flex flex-wrap gap-2">
                      {estadisticasBI.topVariedadesArray.map((v, i) => (
                        <div key={i} className="bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl flex items-center justify-between gap-4 grow min-w-[150px]">
                          <span className="text-sm font-bold text-gray-700">{v.nombre}</span>
                          <span className="bg-gray-900 text-white text-xs font-black px-3 py-1 rounded-full">{v.cantidad}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* DISTRIBUCIÓN LOGÍSTICA */}
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                  <h4 className="font-bold text-gray-900 mb-6 uppercase text-sm tracking-wider">Logística y Entregas</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase mb-3 border-b pb-2">Por Ciudad Logística</p>
                      <div className="space-y-2">
                        {Object.entries(estadisticasBI.ciudades).sort((a,b)=>b[1]-a[1]).map(([ciudad, count]) => (
                          <div key={ciudad} className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded-lg">
                            <span className="text-sm font-medium text-gray-700">{ciudad}</span>
                            <span className="text-sm font-black text-gray-900">{count} ped</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase mb-3 border-b pb-2">Por Modalidad de Envío</p>
                      <div className="space-y-2">
                        {Object.entries(estadisticasBI.modalidades).sort((a,b)=>b[1]-a[1]).map(([mod, count]) => (
                          <div key={mod} className="flex justify-between items-center bg-purple-50 px-3 py-2 rounded-lg">
                            <span className="text-sm font-medium text-purple-900">{mod}</span>
                            <span className="text-sm font-black text-purple-700">{count} despachos</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* PESTAÑA: PEDIDOS */}
        {pestanaActiva === 'pedidos' && (
          <div className="space-y-8 max-w-7xl mx-auto">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
               <div><h3 className="font-bold text-lg text-gray-900">Búsqueda Logística</h3></div>
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                <input type="text" placeholder="Buscar código, cliente o negocio..." className="border border-gray-200 p-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-gosque-green w-full sm:w-64" value={busquedaPedido} onChange={e => setBusquedaPedido(e.target.value)} />
                <select className="border border-gray-200 p-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-gosque-green w-full sm:w-auto" value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>
                  <option>Todos</option><option>Pendiente</option><option>Vendido</option><option>Pagado</option><option>Enviado</option><option>Entregado</option><option>Denegado</option><option>Cancelado</option>
                </select>
              </div>
            </div>

            {/* TABLA 1: SOLICITUDES PENDIENTES */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-amber-100 bg-amber-50 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-lg text-amber-900">Cotizaciones (Pendientes)</h3>
                  <p className="text-xs text-amber-700">Requerimientos por analizar.</p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-white text-xs uppercase text-gray-400 font-bold border-b">
                    <tr><th className="p-4">Registro</th><th className="p-4">Cliente / B2B</th><th className="p-4">Estado</th><th className="p-4 text-center">Acción</th></tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {solicitudesPorConfirmar.slice(0, pedidosVisibles).map(pedido => (
                      <tr key={pedido.id} className="hover:bg-gray-50">
                        <td className="p-4"><span className="font-black text-gosque-green block">{pedido.codigo}</span><span className="text-xs text-gray-500">{formatearFecha(pedido.fecha)}</span></td>
                        <td className="p-4"><span className="font-bold text-gray-900 block">{pedido.clienteNombre}</span><span className="text-xs text-gray-500">{pedido.negocio}</span></td>
                        <td className="p-4"><span className="px-3 py-1 rounded-full text-[10px] font-bold border border-yellow-200 bg-yellow-50 text-yellow-700 uppercase tracking-widest">Solicitud</span></td>
                        <td className="p-4 text-center"><button onClick={() => abrirModalPedido(pedido)} className="bg-amber-400 hover:bg-amber-500 text-amber-950 px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm">Atender</button></td>
                      </tr>
                    ))}
                    {solicitudesPorConfirmar.length === 0 && <tr><td colSpan="4" className="p-8 text-center text-gray-400 italic">No hay cotizaciones pendientes.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>

            {/* TABLA 2: PEDIDOS EN FIRME */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-green-100 bg-gosque-green flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-lg text-white">Órdenes Activas</h3>
                  <p className="text-xs text-green-100">Transacciones en curso logístico.</p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-white text-xs uppercase text-gray-400 font-bold border-b">
                    <tr><th className="p-4">Tracking</th><th className="p-4">Cliente</th><th className="p-4">Acuerdo</th><th className="p-4">Situación</th><th className="p-4 text-center">Panel</th></tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {pedidosConfirmados.slice(0, pedidosVisibles).map(pedido => (
                      <tr key={pedido.id} className="hover:bg-gray-50">
                        <td className="p-4"><span className="font-black text-gray-900 block">{pedido.codigo}</span><span className="text-xs text-gray-500">{formatearFecha(pedido.fecha)}</span></td>
                        <td className="p-4"><span className="font-bold text-gray-900 block">{pedido.clienteNombre}</span><span className="text-xs text-gray-500">{pedido.negocio}</span></td>
                        <td className="p-4 font-black text-gosque-brown">S/ {pedido.total?.toFixed(2)}</td>
                        <td className="p-4"><span className="px-3 py-1 rounded-full text-[10px] font-bold border border-blue-200 bg-blue-50 text-blue-700 uppercase tracking-widest">{pedido.estado}</span></td>
                        <td className="p-4 text-center"><button onClick={() => abrirModalPedido(pedido)} className="border border-gray-300 hover:bg-gray-900 hover:text-white hover:border-gray-900 text-gray-700 px-4 py-2 rounded-xl text-xs font-bold transition">Operar</button></td>
                      </tr>
                    ))}
                     {pedidosConfirmados.length === 0 && <tr><td colSpan="5" className="p-8 text-center text-gray-400 italic">No se encontraron órdenes.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
            
            {pedidosFiltrados.length > pedidosVisibles && (
                <div className="text-center mt-4">
                  <button onClick={() => setPedidosVisibles(prev => prev + 10)} className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 shadow-sm font-bold py-3 px-8 rounded-xl transition">
                    Cargar más registros históricos
                  </button>
                </div>
            )}
          </div>
        )}

        {/* PESTAÑA: CATÁLOGO */}
        {pestanaActiva === 'catalogo' && (
          <div className="space-y-8 max-w-5xl mx-auto">
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

        {/* PESTAÑA: TRAZABILIDAD */}
        {pestanaActiva === 'trazabilidad' && (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 max-w-4xl mx-auto">
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

        {/* PESTAÑA: CONTENIDO WEB */}
        {pestanaActiva === 'contenido' && (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 max-w-3xl mx-auto">
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
              <div><span className="text-xs font-bold text-gray-400 uppercase block mb-1">Operación Operativa</span><h3 className="font-black text-2xl text-gosque-green">{pedidoSeleccionado.codigo}</h3></div>
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
                
                <div className="border border-blue-100 bg-blue-50/30 p-5 rounded-xl">
                  <h4 className="text-sm font-black text-blue-900 uppercase mb-4 flex items-center gap-2">💰 Conciliación de Pago</h4>
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
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Referencia / URL Constancia</label>
                      <input type="text" className="w-full bg-white border border-gray-300 p-2 rounded-lg outline-none" value={referenciaConstancia} onChange={e => setReferenciaConstancia(e.target.value)} placeholder="Enlace a captura o ubicación de la constancia" />
                    </div>
                  </div>
                </div>

                <div className="border border-purple-100 bg-purple-50/30 p-5 rounded-xl">
                  <h4 className="text-sm font-black text-purple-900 uppercase mb-4 flex items-center gap-2">📦 Logística y Despacho</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Modalidad de Entrega</label>
                      <select className="w-full bg-white border border-gray-300 p-2 rounded-lg outline-none focus:ring-2 focus:ring-purple-500" value={modalidadEnvio} onChange={e => setModalidadEnvio(e.target.value)}>
                        <option value="">-- Seleccionar --</option>
                        <option>Agencia (Encomienda)</option><option>Delivery Local</option><option>Recojo en Tienda</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Agencia / Courier</label>
                      <input type="text" className="w-full bg-white border border-gray-300 p-2 rounded-lg outline-none" value={agenciaEnvio} onChange={e => setAgenciaEnvio(e.target.value)} placeholder="Ej. Shalom, Olva, Moto 1..." />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Fecha de Despacho</label>
                      <input type="date" className="w-full bg-white border border-gray-300 p-2 rounded-lg outline-none" value={fechaDespacho} onChange={e => setFechaDespacho(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Tracking / Número de Guía</label>
                      <input type="text" className="w-full bg-white border border-gray-300 p-2 rounded-lg outline-none" value={nroGuia} onChange={e => setNroGuia(e.target.value)} placeholder="Ej. TRU-009812" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
                    <label className="block text-xs font-bold text-amber-900 uppercase mb-2">Monto Fijo Acordado (S/)</label>
                    <input type="number" step="0.10" required className="w-full bg-white border border-amber-300 p-2 rounded-lg font-bold outline-none text-xl text-gosque-brown" value={precioAcordado} onChange={e => setPrecioAcordado(e.target.value)} />
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <label className="block text-xs font-bold text-gray-900 uppercase mb-2">Actualizar Fase</label>
                    <select className="w-full bg-white border border-gray-300 p-2 rounded-lg font-bold outline-none text-lg" value={nuevoEstado} onChange={e => setNuevoEstado(e.target.value)}>
                      <option>Pendiente</option><option>Vendido</option><option>Pagado</option><option>Enviado</option><option>Entregado</option><option>Denegado</option><option>Cancelado</option>
                    </select>
                  </div>
                </div>

                {(nuevoEstado === 'Denegado' || nuevoEstado === 'Cancelado') && (
                  <div>
                    <label className="block text-xs font-bold text-red-700 uppercase mb-2">Sustento Operativo (Obligatorio)</label>
                    <input type="text" className="w-full border border-red-300 p-3 rounded-lg outline-none bg-red-50" value={motivoCancelacion} onChange={e => setMotivoCancelacion(e.target.value)} />
                  </div>
                )}
              </form>

              {pedidoSeleccionado.historial && pedidoSeleccionado.historial.length > 0 && (
                <div className="mt-8 border-t pt-6">
                  <h4 className="text-sm font-black text-gray-900 uppercase mb-4">Registro Histórico (Auditoría)</h4>
                  <div className="space-y-4 border-l-2 border-gosque-green ml-3 pl-4">
                    {pedidoSeleccionado.historial.map((hist, idx) => (
                      <div key={idx} className="relative">
                        <div className="absolute -left-[21px] top-1 w-3 h-3 bg-gosque-green rounded-full border-2 border-white"></div>
                        <p className="text-xs text-gray-500 font-bold mb-1">
                          {new Date(hist.fechaCambio).toLocaleString('es-PE')} — Registrado por: <span className="text-gray-900">{hist.responsable}</span>
                        </p>
                        <p className="text-sm text-gray-800">
                          Cambio a <span className="font-black text-gosque-green">{hist.estadoNuevo}</span>. 
                          <span className="text-gray-500 italic ml-2">Nota: {hist.motivo}</span>
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-gray-50 p-6 border-t border-gray-100 flex justify-end gap-4">
              <button onClick={() => setModalPedidoVisible(false)} className="px-6 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-200">Descartar</button>
              <button type="submit" form="form-actualizar-pedido" className="px-6 py-3 rounded-xl font-bold bg-gosque-green text-white hover:bg-green-700 shadow-lg">Aplicar Cambios</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;