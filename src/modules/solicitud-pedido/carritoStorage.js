// Persistencia del carrito en el navegador (localStorage), separada por usuario,
// para que el pedido en armado no se pierda al recargar la página.
const CLAVE_STORAGE = 'elgosque:carritos';

// Solo los campos necesarios: la imagen en base64 llenaría el límite de localStorage
export const crearItemCarrito = (productoConfig) => ({
  id: productoConfig.id,
  nombre: productoConfig.nombre,
  tipo: productoConfig.tipo,
  precioReferencial: productoConfig.precioReferencial,
  cantidad: productoConfig.cantidad,
  presentacionElegida: productoConfig.presentacionElegida,
  pesoElegido: productoConfig.pesoElegido,
});

// Devuelve { [uid]: items[] }; si el navegador bloquea el almacenamiento, el carrito funciona solo en memoria
export const leerCarritos = () => {
  try {
    return JSON.parse(localStorage.getItem(CLAVE_STORAGE)) || {};
  } catch {
    return {};
  }
};

export const guardarCarritos = (carritos) => {
  try {
    localStorage.setItem(CLAVE_STORAGE, JSON.stringify(carritos));
  } catch (error) {
    console.error('No se pudo guardar el carrito en el navegador:', error);
  }
};
