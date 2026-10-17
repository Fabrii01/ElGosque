import { usePerfilUsuario } from '../inicio-sesion/usePerfilUsuario';
import { useContenidoInstitucional } from './useContenidoInstitucional';
import { useImagenesSitio } from './useImagenesSitio';
import BarraNavegacion from './BarraNavegacion';
import FranjaSuperior from './FranjaSuperior';
import HeroInstitucional from './HeroInstitucional';
import FranjaDatos from './FranjaDatos';
import PiePagina from './PiePagina';
import ResumenTrazabilidad from '../trazabilidad/ResumenTrazabilidad';
import { useTrazabilidadPublica } from '../trazabilidad/useTrazabilidadPublica';
import { useCartaCafeteria } from '../cafeteria/useCartaCafeteria';
import { useProductosActivos } from '../catalogo/useProductosActivos';
import CatalogoProductos from '../catalogo/CatalogoProductos';
import SeccionCafeteria from '../cafeteria/SeccionCafeteria';
import { useSolicitudPedido } from '../solicitud-pedido/useSolicitudPedido';
import ConfiguradorProducto from '../solicitud-pedido/ConfiguradorProducto';
import CarritoPedido from '../solicitud-pedido/CarritoPedido';
import BotonVerPedido from '../solicitud-pedido/BotonVerPedido';
import AsistenteIA from '../asistente-ia/AsistenteIA';
import AvisoAsistenteIA from '../asistente-ia/AvisoAsistenteIA';
import { useDesplazarAAncla } from '../../shared/hooks/useDesplazarAAncla';

const PaginaInicio = () => {
  const userData = usePerfilUsuario();
  const { infoWeb, cargandoInfo } = useContenidoInstitucional();
  const catalogo = useProductosActivos();
  const solicitud = useSolicitudPedido(userData, catalogo);
  const trazabilidad = useTrazabilidadPublica();
  const { fotos: fotosCafeteria } = useCartaCafeteria({ incluirCarta: false });
  const { srcImagen } = useImagenesSitio();
  // El admin gestiona pedidos desde el panel; no hace pedidos propios
  const esAdmin = userData?.rol === 'admin';
  const esCliente = Boolean(userData) && !esAdmin;

  // Llegadas desde otras páginas con ancla (p. ej. "/#catalogo")
  useDesplazarAAncla(!catalogo.cargando && !trazabilidad.cargando);

  return (
    <div className="papel min-h-screen font-cuerpo text-cafe-espresso selection:bg-cafe-cereza selection:text-white">
      <FranjaSuperior />
      <BarraNavegacion
        userData={userData}
        cantidadCarrito={solicitud.carrito.length}
        onAbrirCarrito={() => solicitud.setIsCartOpen(true)}
      />

      <main>
        <HeroInstitucional infoWeb={infoWeb} cargandoInfo={cargandoInfo} region={trazabilidad.region} srcPortada={srcImagen('inicioPortada')} />
        <FranjaDatos region={trazabilidad.region} etapasRegistradas={trazabilidad.procesos.length} />
        <ResumenTrazabilidad region={trazabilidad.region} totalEtapas={trazabilidad.procesos.length} srcOrigen={srcImagen('inicioOrigen')} srcImagen={srcImagen} />
        <CatalogoProductos productos={catalogo.productos} cargando={catalogo.cargando} onAgregar={esAdmin ? null : solicitud.abrirConfigurador} />
        <SeccionCafeteria fotoFondo={fotosCafeteria[0]} srcRespaldo={srcImagen('inicioCafeteria')} />
      </main>

      <PiePagina />

      {/* PEDIDO EN CURSO: botón flotante y modales */}
      {esCliente && <BotonVerPedido onClick={() => solicitud.setIsCartOpen(true)} cantidad={solicitud.carrito.length} />}
      {solicitud.productoConfig && (
        <ConfiguradorProducto
          productoConfig={solicitud.productoConfig}
          setProductoConfig={solicitud.setProductoConfig}
          onSubmit={solicitud.agregarAlCarrito}
        />
      )}
      {esCliente && solicitud.isCartOpen && <CarritoPedido {...solicitud} />}

      {/* ASISTENTE IA: solo para clientes con sesión iniciada (no para el admin) */}
      {esCliente && <AsistenteIA userData={userData} catalogo={catalogo.productos} trazabilidad={trazabilidad} />}
      {!userData && <AvisoAsistenteIA />}
    </div>
  );
};

export default PaginaInicio;
