import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { doc, getDoc, collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';

const Home = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  
  // Estados de contenido institucional
  const [infoWeb, setInfoWeb] = useState(null);
  const [cargandoInfo, setCargandoInfo] = useState(true);
  const [catalogoDinamico, setCatalogoDinamico] = useState([]);

  // Estados del Carrito y Pedido (REQ-F05)
  const [carrito, setCarrito] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [productoConfig, setProductoConfig] = useState(null);
  const [pedidoConfirmado, setPedidoConfirmado] = useState(null);
  
  const [datosPedido, setDatosPedido] = useState({
    telefono: '',
    ciudad: '',
    negocio: '',
    frecuencia: 'Mensual'
  });

  // Fases estáticas para el carrusel de trazabilidad
  const fasesTrazabilidad = [
    { fase: "Semilla y Cultivo", desc: "Cuidamos el origen en tierras fértiles de altura (1800-2000 msnm).", img: "https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=600&q=80" },
    { fase: "Cosecha", desc: "Selección manual exclusiva de cerezas maduras rojas.", img: "https://images.unsplash.com/photo-1524350876685-274059332603?auto=format&fit=crop&w=600&q=80" },
    { fase: "Fermentación", desc: "Proceso controlado orgánicamente para resaltar los perfiles de sabor.", img: "https://images.unsplash.com/photo-1611162458324-aae1eb4129a4?auto=format&fit=crop&w=600&q=80" },
    { fase: "Lavado y Secado", desc: "Secado natural al sol para garantizar la humedad perfecta.", img: "https://images.unsplash.com/photo-1498604218683-176378eeb32a?auto=format&fit=crop&w=600&q=80" },
    { fase: "Tostado", desc: "Curvas de tueste artesanales (Suave, Medio, Fuerte).", img: "https://images.unsplash.com/photo-1559525839-b184a4d698c7?auto=format&fit=crop&w=600&q=80" },
    { fase: "Empaquetado", desc: "Sellado hermético para que llegue fresco a tu taza.", img: "https://images.unsplash.com/photo-1559525839-a9a7da738f7a?auto=format&fit=crop&w=600&q=80" }
  ];

  // 1. Validar Sesión
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const docRef = await getDoc(doc(db, "usuarios", currentUser.uid));
        if (docRef.exists()) {
          const data = docRef.data();
          setUserData({ uid: currentUser.uid, ...data });
          setDatosPedido(prev => ({
            ...prev,
            telefono: data.telefono || '',
            ciudad: data.ciudad || '',
            negocio: data.negocio || ''
          }));
        }
      } else {
        setUserData(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // 2. Cargar Info Institucional
  useEffect(() => {
    const cargarInfo = async () => {
      try {
        const docRef = await getDoc(doc(db, "ajustes", "institucional"));
        if (docRef.exists() && docRef.data().titulo) {
          setInfoWeb(docRef.data());
        }
      } catch (error) { console.error(error); }
      setCargandoInfo(false);
    };
    cargarInfo();
  }, []);

  // 3. Cargar Catálogo Activo
  useEffect(() => {
    const cargarCatalogo = async () => {
      const querySnapshot = await getDocs(collection(db, "productos"));
      const lista = querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(prod => prod.activo === true);
      setCatalogoDinamico(lista);
    };
    cargarCatalogo();
  }, []);

  // Lógica del Carrito y Pedidos
  const abrirConfigurador = (producto) => {
    if (!userData) return navigate('/login');
    setProductoConfig({ ...producto, cantidad: 1, pesoElegido: producto.peso, presentacionElegida: producto.presentacion });
  };

  const agregarAlCarrito = (e) => {
    e.preventDefault();
    setCarrito([...carrito, productoConfig]);
    setProductoConfig(null);
    setIsCartOpen(true);
  };

  const eliminarDelCarrito = (index) => {
    const nuevoCarrito = [...carrito];
    nuevoCarrito.splice(index, 1);
    setCarrito(nuevoCarrito);
  };

  const calcularTotal = () => {
    return carrito.reduce((sum, item) => sum + (parseFloat(item.precioReferencial) * item.cantidad), 0);
  };

  const procesarPedido = async (e) => {
    e.preventDefault();
    if (carrito.length === 0) return;

    const codigoUnico = "REQ-" + Math.floor(Math.random() * 10000);
    const totalPedido = calcularTotal();

    const nuevoPedido = {
      codigo: codigoUnico,
      clienteId: userData.uid,
      clienteNombre: userData.nombre,
      clienteEmail: userData.email,
      ...datosPedido,
      productos: carrito.map(item => ({
        nombre: item.nombre,
        cantidad: item.cantidad,
        peso: item.pesoElegido,
        presentacion: item.presentacionElegida,
        precioUnitario: item.precioReferencial,
        subtotal: item.cantidad * item.precioReferencial
      })),
      total: totalPedido,
      estado: "Pendiente",
      fecha: serverTimestamp()
    };

    try {
      await addDoc(collection(db, "pedidos"), nuevoPedido);
      setPedidoConfirmado(nuevoPedido);
      setCarrito([]);
    } catch (error) {
      console.error("Error al registrar pedido: ", error);
    }
  };

  const enviarWhatsApp = () => {
    if (!pedidoConfirmado) return;
    
    let resumenProductos = pedidoConfirmado.productos.map(p => 
      `- ${p.cantidad}x ${p.nombre} (${p.presentacion}, ${p.peso}) = S/ ${p.subtotal}`
    ).join('\n');

    const texto = `Hola El Gosque, soy ${pedidoConfirmado.clienteNombre}. Acabo de registrar un pedido en la web:
*Código de Pedido:* ${pedidoConfirmado.codigo}
*Productos:*
${resumenProductos}
*Total Acordado:* S/ ${pedidoConfirmado.total}
*Ciudad de envío:* ${pedidoConfirmado.ciudad}
*Negocio:* ${pedidoConfirmado.negocio}

Espero su confirmación y medios de pago.`;

    const numeroWhatsApp = "51925414135"; 
    const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(texto)}`;
    window.open(url, '_blank');
    setIsCartOpen(false);
    setPedidoConfirmado(null);
  };

  return (
    <div className="bg-[#F8F9FA] min-h-screen font-sans text-gray-800 scroll-smooth selection:bg-gosque-green selection:text-white">
      
      {/* NAVEGACIÓN */}
      <nav className="bg-white/90 backdrop-blur-md text-gosque-brown p-4 sticky top-0 z-50 border-b border-gray-100">
        <div className="container mx-auto flex justify-between items-center">
          <span className="text-2xl font-black tracking-tighter text-gosque-green">EL GOSQUE.</span>
          <div className="hidden md:flex space-x-8 items-center font-medium text-sm tracking-wide">
            <a href="#trazabilidad" className="hover:text-gosque-green transition-colors">Trazabilidad</a>
            <a href="#catalogo" className="hover:text-gosque-green transition-colors">Catálogo</a>
            <a href="#cafeteria" className="hover:text-gosque-green transition-colors">Cafetería</a>
            
            {userData ? (
              <div className="flex items-center gap-4 bg-gray-50 px-4 py-1.5 rounded-full border border-gray-200">
                <span className="text-xs font-bold text-gray-900">Hola, {userData.nombre?.split(' ')[0] || 'Cliente'}</span>
                
                {userData.rol === 'admin' && (
                  <Link to="/admin" className="text-xs text-amber-600 font-bold uppercase hover:underline">Panel Admin</Link>
                )}
                
                <button onClick={() => setIsCartOpen(true)} className="text-xs font-bold bg-gosque-green text-white px-3 py-1 rounded-full hover:bg-green-700 transition">
                  🛒 Mi Pedido ({carrito.length})
                </button>
                
                <Link to="/mis-pedidos" className="text-xs font-bold bg-amber-100 text-amber-800 px-4 py-1.5 rounded-full hover:bg-amber-200 transition">
                  📄 Ver Mis Pedidos
                </Link>
                
                <button onClick={() => signOut(auth)} className="text-xs text-red-500 hover:text-red-700 font-bold uppercase tracking-wider">Salir</button>
              </div>
            ) : (
              <Link to="/login" className="bg-gosque-green px-6 py-2.5 rounded-full text-white hover:bg-green-700 transition shadow-lg shadow-green-900/20">
                Ingresar
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <header className="relative bg-white pt-24 pb-32 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-green-50/50 to-white"></div>
        <div className="relative z-20 max-w-5xl mx-auto flex flex-col items-center">
          <span className="text-gosque-green font-bold tracking-[0.2em] text-sm uppercase mb-6 bg-green-100 px-4 py-1 rounded-full">De la montaña a tu taza</span>
          
          {cargandoInfo ? (
            <div className="h-32 flex flex-col items-center justify-center animate-pulse gap-4">
              <div className="w-96 h-12 bg-gray-200 rounded-full"></div>
              <div className="w-64 h-6 bg-gray-200 rounded-full"></div>
            </div>
          ) : infoWeb ? (
            <>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-8 text-gray-900 tracking-tight leading-tight">
                {infoWeb.titulo}
              </h1>
              <p className="text-xl md:text-2xl font-light mb-12 max-w-3xl text-gray-500 leading-relaxed">
                {infoWeb.descripcion}
              </p>
            </>
          ) : (
            <div className="bg-amber-50 border border-amber-200 p-8 rounded-3xl max-w-2xl mx-auto my-8">
              <h2 className="text-2xl font-bold text-amber-800 mb-2">Contenido en Actualización</h2>
              <p className="text-amber-700">La información institucional no está disponible en este momento.</p>
            </div>
          )}
          
          <a href="#trazabilidad" className="group flex items-center gap-3 text-gosque-brown font-bold text-lg hover:text-gosque-green transition-colors mt-4">
            Explorar el proceso
            <svg className="w-5 h-5 group-hover:translate-y-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>
          </a>
        </div>
      </header>

      {/* MÓDULO DE TRAZABILIDAD */}
      <section id="trazabilidad" className="py-24 bg-gosque-brown text-white overflow-hidden">
        <div className="container mx-auto px-4 mb-12 md:px-8 flex flex-col md:flex-row justify-between items-end gap-6">
          <div className="max-w-2xl">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-amber-50">El Ciclo de Vida</h2>
            <p className="text-amber-100/70 text-lg font-light">Desliza para conocer cada paso de nuestro riguroso proceso de calidad, garantizando un grano puro y de alto rendimiento.</p>
          </div>
          <Link to="/trazabilidad" className="hidden md:inline-block border border-amber-400/30 text-amber-400 hover:bg-amber-400 hover:text-gosque-brown px-6 py-3 rounded-full transition text-sm font-bold tracking-wide shrink-0">
            Ver Beneficios de Salud →
          </Link>
        </div>
        
        <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-12 px-4 md:px-8 scrollbar-hide">
          {fasesTrazabilidad.map((item, index) => (
            <div key={index} className="relative shrink-0 w-[75vw] sm:w-[50vw] md:w-[350px] aspect-[3/4] snap-center rounded-3xl overflow-hidden group cursor-pointer shadow-2xl">
              <img src={item.img} alt={item.fase} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
              <div className="absolute inset-0 p-8 flex flex-col justify-end">
                <span className="text-amber-400 font-mono text-xl mb-2 opacity-80">0{index + 1}</span>
                <h3 className="text-3xl font-bold text-white mb-3 leading-tight">{item.fase}</h3>
                <p className="text-gray-300 text-sm md:text-base opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="md:hidden text-center mt-4 px-4">
          <Link to="/trazabilidad" className="block w-full bg-white/10 text-white border border-white/20 py-4 rounded-xl font-bold">
            Ver Beneficios Médicos del Café
          </Link>
        </div>
      </section>

      {/* CATÁLOGO DINÁMICO */}
      <section id="catalogo" className="py-24 bg-white container mx-auto px-4 md:px-8">
        <div className="mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">Catálogo y Pedidos</h2>
          <p className="text-gray-500 text-lg max-w-2xl">Selecciona las variedades y configura tu requerimiento de compra directa.</p>
        </div>
        
        {catalogoDinamico.length === 0 ? (
          <div className="text-center bg-gray-50 p-12 rounded-3xl border border-gray-100">
            <p className="text-gray-500 text-lg">Catálogo en actualización. El administrador está registrando los productos.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {catalogoDinamico.map((producto) => (
              <div key={producto.id} className="bg-[#F8F9FA] rounded-[2rem] p-8 hover:bg-white hover:shadow-2xl hover:shadow-green-900/5 transition-all duration-300 group border border-transparent hover:border-gray-100 flex flex-col h-full relative">
                <div className="absolute top-6 right-6 bg-amber-100 text-amber-800 font-black px-4 py-1 rounded-full text-sm z-10">
                  S/ {producto.precioReferencial}
                </div>
                
                {/* Contenedor de la Imagen del Producto */}
                <div className="w-full h-48 mb-6 rounded-2xl overflow-hidden bg-gray-100 flex items-center justify-center shrink-0">
                  {producto.imagenUrl ? (
                    <img src={producto.imagenUrl} alt={producto.nombre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="flex flex-col items-center text-gray-400">
                      <svg className="w-8 h-8 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                      <span className="text-xs font-medium uppercase tracking-widest">Sin Imagen</span>
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{producto.nombre}</h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-md font-semibold">{producto.tipo}</span>
                    <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-md font-semibold">{producto.presentacion}</span>
                  </div>
                  <p className="text-gray-500 mb-8 leading-relaxed text-sm">{producto.descripcion}</p>
                </div>
                
                <button 
                  onClick={() => abrirConfigurador(producto)} 
                  className="w-full bg-white border border-gray-200 text-gray-900 hover:bg-gosque-green hover:text-white hover:border-gosque-green font-bold py-4 rounded-2xl transition-colors duration-300 mt-auto"
                >
                  Agregar al Pedido
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* SECCIÓN CAFETERÍA */}
      <section id="cafeteria" className="py-24 px-4 md:px-8 relative">
        <div className="container mx-auto max-w-6xl bg-gosque-green rounded-[3rem] overflow-hidden relative shadow-2xl">
          <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center mix-blend-overlay"></div>
          
          <div className="relative z-10 p-12 md:p-24 flex flex-col items-center text-center text-white">
            <span className="bg-white/20 px-4 py-1 rounded-full text-xs font-bold tracking-widest uppercase mb-6 backdrop-blur-sm border border-white/30">Experiencia Local</span>
            <h2 className="text-4xl md:text-6xl font-bold mb-6">Visita Nuestra Cafetería</h2>
            <p className="text-lg md:text-xl text-green-50 mb-10 max-w-2xl font-light">Disfruta de nuestras preparaciones exclusivas en Trujillo. Un espacio diseñado para saborear todo nuestro muestreo de productos y postres.</p>
            
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <Link to="/productos-cafeteria" className="bg-white text-gosque-green hover:bg-gray-50 font-bold py-4 px-10 rounded-full shadow-xl transition-transform hover:-translate-y-1">
                Ver Carta Digital
              </Link>
              <span className="text-sm font-medium opacity-80 mt-4 sm:mt-0 sm:ml-4">Lun - Sáb | 9:00 AM - 9:00 PM</span>
            </div>
          </div>
        </div>
      </section>

      {/* BOTÓN FLOTANTE WHATSAPP -> AHORA ABRE EL CARRITO */}
      <button 
        onClick={() => setIsCartOpen(true)}
        className="fixed bottom-8 right-8 bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:scale-110 hover:shadow-green-500/50 transition-all duration-300 z-50 flex items-center gap-0 hover:gap-3 group overflow-hidden"
      >
        <svg className="w-7 h-7 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out font-bold whitespace-nowrap">
          Ver Mi Pedido
        </span>
      </button>

      {/* MODAL CONFIGURADOR DE PRODUCTO ANTES DE AGREGAR */}
      {productoConfig && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full relative shadow-2xl">
            <button onClick={() => setProductoConfig(null)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-900">X</button>
            <h3 className="text-xl font-bold text-gray-900 mb-4">{productoConfig.nombre}</h3>
            
            <form onSubmit={agregarAlCarrito} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Presentación</label>
                <select className="w-full bg-gray-50 border p-3 rounded-xl outline-none" value={productoConfig.presentacionElegida} onChange={e => setProductoConfig({...productoConfig, presentacionElegida: e.target.value})}>
                  <option>En grano</option><option>Molido</option><option>Verde</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Peso / Formato</label>
                <input type="text" className="w-full bg-gray-50 border p-3 rounded-xl outline-none" value={productoConfig.pesoElegida} onChange={e => setProductoConfig({...productoConfig, pesoElegido: e.target.value})} placeholder="Ej. 1kg, 50kg"/>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Cantidad de unidades</label>
                <input type="number" min="1" className="w-full bg-gray-50 border p-3 rounded-xl outline-none" value={productoConfig.cantidad} onChange={e => setProductoConfig({...productoConfig, cantidad: parseInt(e.target.value)})} required/>
              </div>
              <p className="text-right text-lg font-bold text-gosque-green">Subtotal: S/ {(productoConfig.precioReferencial * productoConfig.cantidad).toFixed(2)}</p>
              <button type="submit" className="w-full bg-gosque-green text-white font-bold py-3 rounded-xl">Añadir al Carrito</button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CARRITO Y CHECKOUT */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[70] flex justify-end">
          <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col animate-slide-in-right">
            
            <div className="p-6 border-b flex justify-between items-center bg-gray-50">
              <h2 className="text-2xl font-black text-gray-900">Tu Pedido</h2>
              <button onClick={() => { setIsCartOpen(false); setPedidoConfirmado(null); }} className="text-gray-500 font-bold text-xl hover:text-red-500">X</button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {pedidoConfirmado ? (
                <div className="text-center py-10">
                  <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">✓</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">¡Pedido Registrado!</h3>
                  <p className="text-gray-500 mb-6">Tu código único es: <strong className="text-gosque-green text-lg">{pedidoConfirmado.codigo}</strong></p>
                  <p className="text-sm text-gray-600 mb-8">El pedido ha sido guardado en el sistema. Para definir el método de pago y envío, por favor envía el resumen a nuestro WhatsApp.</p>
                  <button onClick={enviarWhatsApp} className="w-full bg-[#25D366] hover:bg-green-600 text-white font-bold py-4 rounded-xl shadow-lg transition transform hover:-translate-y-1 flex items-center justify-center gap-2">
                    Continuar por WhatsApp
                  </button>
                </div>
              ) : carrito.length === 0 ? (
                <div className="text-center py-20 text-gray-400">
                  <p className="text-xl font-medium">El pedido está vacío.</p>
                  <p className="text-sm mt-2">Agrega productos desde el catálogo.</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4 mb-8">
                    {carrito.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <div>
                          <p className="font-bold text-gray-900">{item.nombre}</p>
                          <p className="text-xs text-gray-500">{item.cantidad}x {item.presentacionElegida} ({item.pesoElegido})</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gosque-brown">S/ {(item.precioReferencial * item.cantidad).toFixed(2)}</p>
                          <button onClick={() => eliminarDelCarrito(idx)} className="text-xs text-red-500 hover:underline">Eliminar</button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <form id="form-pedido" onSubmit={procesarPedido} className="space-y-4 border-t pt-6">
                    <h4 className="font-bold text-gray-900">Datos de Envío y Contacto</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Teléfono</label>
                        <input type="tel" required className="w-full border p-3 rounded-lg bg-gray-50 outline-none" value={datosPedido.telefono} onChange={e => setDatosPedido({...datosPedido, telefono: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Ciudad</label>
                        <input type="text" required className="w-full border p-3 rounded-lg bg-gray-50 outline-none" value={datosPedido.ciudad} onChange={e => setDatosPedido({...datosPedido, ciudad: e.target.value})} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Tipo de Negocio</label>
                      <input type="text" required className="w-full border p-3 rounded-lg bg-gray-50 outline-none" value={datosPedido.negocio} onChange={e => setDatosPedido({...datosPedido, negocio: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Frecuencia de Compra</label>
                      <select className="w-full border p-3 rounded-lg bg-gray-50 outline-none" value={datosPedido.frecuencia} onChange={e => setDatosPedido({...datosPedido, frecuencia: e.target.value})}>
                        <option>Única vez</option><option>Semanal</option><option>Quincenal</option><option>Mensual</option>
                      </select>
                    </div>
                  </form>
                </>
              )}
            </div>

            {!pedidoConfirmado && carrito.length > 0 && (
              <div className="p-6 border-t bg-white">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-gray-500 font-medium">Total Estimado</span>
                  <span className="text-2xl font-black text-gosque-green">S/ {calcularTotal().toFixed(2)}</span>
                </div>
                <button type="submit" form="form-pedido" className="w-full bg-gosque-brown hover:bg-amber-900 text-white font-bold py-4 rounded-xl transition shadow-lg flex justify-center items-center gap-2">
                  Confirmar Pedido
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;