import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, getDocs } from 'firebase/firestore';

const Home = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [catalogoDinamico, setCatalogoDinamico] = useState([]);
  
  // Estados para el contenido institucional dinámico
  const [infoWeb, setInfoWeb] = useState(null);
  const [cargandoInfo, setCargandoInfo] = useState(true);

  const [formData, setFormData] = useState({
    variedad: 'Especial El Gosque',
    presentacion: 'En grano',
    cantidad: '',
    ciudad: '',
    negocio: ''
  });
  useEffect(() => {
  const cargarCatalogo = async () => {
    const querySnapshot = await getDocs(collection(db, "productos"));
    // Solo traemos los que el admin marcó como activos
    const lista = querySnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(prod => prod.activo === true); 
    setCatalogoDinamico(lista);
  };
  cargarCatalogo();
}, []);

  // Validar sesión, obtener datos del usuario y su rol
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const docRef = await getDoc(doc(db, "usuarios", currentUser.uid));
        if (docRef.exists()) {
          setUserData(docRef.data());
        }
      } else {
        setUserData(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Cargar contenido institucional desde Firebase (REQ-F01-03)
  useEffect(() => {
    const cargarInfo = async () => {
      try {
        const docRef = await getDoc(doc(db, "ajustes", "institucional"));
        if (docRef.exists() && docRef.data().titulo) {
          setInfoWeb(docRef.data());
        } else {
          setInfoWeb(null); // Activa el mensaje de falta de contenido (REQ-F01-04)
        }
      } catch (error) {
        setInfoWeb(null);
      }
      setCargandoInfo(false);
    };
    cargarInfo();
  }, []);

  const handleCotizarClick = () => {
    if (userData) {
      setShowModal(true);
    } else {
      navigate('/login');
    }
  };

  const enviarCotizacion = (e) => {
    e.preventDefault();
    const codigo = "REQ-" + Math.floor(Math.random() * 10000);
    
    const texto = `Hola El Gosque, soy ${userData.nombre}. Deseo generar una solicitud de cotización:
*Código:* ${codigo}
*Variedad:* ${formData.variedad}
*Presentación:* ${formData.presentacion}
*Cantidad / Peso:* ${formData.cantidad}
*Ciudad:* ${formData.ciudad}
*Tipo de Negocio:* ${formData.negocio}`;

    const numeroWhatsApp = "51925414135"; 
    const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(texto)}`;
    
    window.open(url, '_blank');
    setShowModal(false);
  };

  const variedades = [
    { nombre: "Gourmet", desc: "Equilibrio perfecto de acidez y cuerpo." },
    { nombre: "Especial El Gosque", desc: "Nuestra reserva exclusiva de la casa." },
    { nombre: "Oro Negro", desc: "Tueste oscuro, intenso y con carácter." },
    { nombre: "Caracolillo", desc: "Grano exótico de sabor concentrado." },
    { nombre: "Orgone", desc: "Notas frutales y aroma silvestre." },
    { nombre: "Gran Selección", desc: "Los mejores granos de la cosecha." },
    { nombre: "Geisha", desc: "Perfil floral y elegante, calidad premium." },
    { nombre: "Huayacho", desc: "Cuerpo robusto con notas a chocolate." },
    { nombre: "Suflexión", desc: "Edición limitada de proceso especial." }
  ];

  const fasesTrazabilidad = [
    { fase: "Semilla y Cultivo", desc: "Cuidamos el origen en tierras fértiles de altura (1800-2000 msnm).", img: "https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=600&q=80" },
    { fase: "Cosecha", desc: "Selección manual exclusiva de cerezas maduras rojas.", img: "https://images.unsplash.com/photo-1524350876685-274059332603?auto=format&fit=crop&w=600&q=80" },
    { fase: "Fermentación", desc: "Proceso controlado orgánicamente para resaltar los perfiles de sabor.", img: "https://images.unsplash.com/photo-1611162458324-aae1eb4129a4?auto=format&fit=crop&w=600&q=80" },
    { fase: "Lavado y Secado", desc: "Secado natural al sol para garantizar la humedad perfecta.", img: "https://images.unsplash.com/photo-1498604218683-176378eeb32a?auto=format&fit=crop&w=600&q=80" },
    { fase: "Tostado", desc: "Curvas de tueste artesanales (Suave, Medio, Fuerte).", img: "https://images.unsplash.com/photo-1559525839-b184a4d698c7?auto=format&fit=crop&w=600&q=80" },
    { fase: "Empaquetado", desc: "Sellado hermético para que llegue fresco a tu taza.", img: "https://images.unsplash.com/photo-1559525839-a9a7da738f7a?auto=format&fit=crop&w=600&q=80" }
  ];

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
                
                {/* Botón exclusivo para administradores */}
                {userData.rol === 'admin' && (
                  <Link to="/admin" className="text-xs text-amber-600 font-bold uppercase hover:underline">Panel Admin</Link>
                )}
                
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

      {/* HERO SECTION DINÁMICO */}
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
            // Mensaje informativo si no hay contenido (REQ-F01-04)
            <div className="bg-amber-50 border border-amber-200 p-8 rounded-3xl max-w-2xl mx-auto my-8">
              <h2 className="text-2xl font-bold text-amber-800 mb-2">Contenido en Actualización</h2>
              <p className="text-amber-700">La información institucional no está disponible en este momento. Por favor, revisa nuestro catálogo o regresa pronto.</p>
            </div>
          )}
          
          <a href="#trazabilidad" className="group flex items-center gap-3 text-gosque-brown font-bold text-lg hover:text-gosque-green transition-colors mt-4">
            Explorar el proceso
            <svg className="w-5 h-5 group-hover:translate-y-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>
          </a>
        </div>
      </header>

      {/* MÓDULO DE TRAZABILIDAD - CARRUSEL VERTICAL */}
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

      {/* CATÁLOGO DE PRODUCTOS */}
      <section id="catalogo" className="py-24 bg-white container mx-auto px-4 md:px-8">
  <div className="mb-16">
    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">Catálogo de Origen</h2>
    <p className="text-gray-500 text-lg max-w-2xl">Nuestras variedades exclusivas. Sujetas a evaluación y control de calidad continuo.</p>
  </div>
  
  {catalogoDinamico.length === 0 ? (
    <div className="text-center bg-gray-50 p-12 rounded-3xl border border-gray-100">
      <p className="text-gray-500 text-lg">Catálogo en actualización. El administrador está registrando los productos.</p>
    </div>
  ) : (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {catalogoDinamico.map((producto) => (
        <div key={producto.id} className="bg-[#F8F9FA] rounded-[2rem] p-8 hover:bg-white hover:shadow-2xl hover:shadow-green-900/5 transition-all duration-300 group border border-transparent hover:border-gray-100 flex flex-col h-full relative">
          
          {/* Etiqueta de Precio Referencial (REQ-F03-04) */}
          <div className="absolute top-6 right-6 bg-amber-100 text-amber-800 font-black px-4 py-1 rounded-full text-sm">
            S/ {producto.precioReferencial}
          </div>

          <div className="flex-1">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-gosque-green mb-6 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{producto.nombre}</h3>
            
            {/* Atributos del producto (REQ-F03-02, 03) */}
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-md font-semibold">{producto.tipo}</span>
              <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-md font-semibold">{producto.presentacion}</span>
              <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-md font-semibold">{producto.peso}</span>
            </div>

            <p className="text-gray-500 mb-8 leading-relaxed text-sm">{producto.descripcion}</p>
          </div>
          <button 
            onClick={() => {
              setFormData({ ...formData, variedad: producto.nombre, presentacion: producto.presentacion, cantidad: producto.peso });
              handleCotizarClick();
            }} 
            className="w-full bg-white border border-gray-200 text-gray-900 hover:bg-gosque-green hover:text-white hover:border-gosque-green font-bold py-4 rounded-2xl transition-colors duration-300 mt-auto"
          >
            Solicitar Cotización
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

      {/* BOTÓN FLOTANTE WHATSAPP EXPANSIBLE */}
      <button 
        onClick={handleCotizarClick}
        className="fixed bottom-8 right-8 bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:scale-110 hover:shadow-green-500/50 transition-all duration-300 z-50 flex items-center gap-0 hover:gap-3 group overflow-hidden"
      >
        <svg className="w-7 h-7 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out font-bold whitespace-nowrap">
          Cotiza con nosotros
        </span>
      </button>

      {/* MODAL DE COTIZACIÓN */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4 transition-opacity">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full relative shadow-2xl">
            <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-900 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Generar Cotización</h3>
            <p className="text-sm text-gray-500 mb-8">La solicitud se enviará a nuestro WhatsApp corporativo.</p>
            
            <form onSubmit={enviarCotizacion} className="space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Variedad</label>
                  <select className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-gosque-green outline-none transition" value={formData.variedad} onChange={e => setFormData({...formData, variedad: e.target.value})}>
                    {variedades.map((v, i) => <option key={i}>{v.nombre}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Presentación</label>
                  <select className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-gosque-green outline-none transition" value={formData.presentacion} onChange={e => setFormData({...formData, presentacion: e.target.value})}>
                    <option>En grano</option>
                    <option>Molido</option>
                    <option>Verde</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Cantidad y Peso</label>
                <input type="text" placeholder="Ej: 5 sacos de 50kg" required className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-gosque-green outline-none transition" value={formData.cantidad} onChange={e => setFormData({...formData, cantidad: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Ciudad de Envío</label>
                <input type="text" placeholder="Ej: Trujillo, Lima..." required className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-gosque-green outline-none transition" value={formData.ciudad} onChange={e => setFormData({...formData, ciudad: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Tipo de Negocio</label>
                <input type="text" placeholder="Ej: Cafetería, Consumo propio" required className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-gosque-green outline-none transition" value={formData.negocio} onChange={e => setFormData({...formData, negocio: e.target.value})} />
              </div>
              <button type="submit" className="w-full bg-[#25D366] hover:bg-green-600 text-white font-bold py-4 rounded-xl mt-6 shadow-lg shadow-green-500/30 transition-all transform hover:-translate-y-1">
                Enviar Solicitud a WhatsApp
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;