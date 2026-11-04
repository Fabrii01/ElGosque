import { crearItemSolicitud, crearSolicitud, presentacionesDisponibles } from '../solicitud-pedido/solicitud';
import { generarCodigoSolicitud } from '../solicitud-pedido/solicitudService';

const PATRON_ETIQUETA = /<<<SOLICITUD:([\s\S]*?)>>>/;

// Separa el texto visible de la etiqueta de solicitud que genera la IA
export const PREGUNTA_CONFIRMACION = '¿Confirmas tu pedido?';

// Respaldo del flujo de confirmación: solo se registra si el mensaje anterior de la IA mostró el resumen y pidió confirmación
export const confirmacionPedida = (mensajes) => {
  const ultimaRespuestaIA = [...mensajes].reverse().find(m => m.role === 'assistant');
  return Boolean(ultimaRespuestaIA?.content.includes(PREGUNTA_CONFIRMACION));
};

// Respaldo por si el modelo responde con Markdown: el chat muestra texto plano (**negrita**, # títulos, `código`)
export const limpiarFormato = (texto) => texto
  .replace(/\*\*(.+?)\*\*/g, '$1')
  .replace(/__(.+?)__/g, '$1')
  .replace(/^#{1,6}\s+/gm, '')
  .replace(/`([^`]+)`/g, '$1')
  .replace(/^(\s*)\*\s+/gm, '$1- ');

export const extraerSolicitud = (respuesta) => {
  const coincidencia = respuesta.match(PATRON_ETIQUETA);
  return {
    texto: respuesta.replace(PATRON_ETIQUETA, '').trim(),
    jsonSolicitud: coincidencia ? coincidencia[1] : null,
  };
};

// Valida lo que propuso la IA contra el catálogo real y arma la solicitud con precios del catálogo.
// Lanza un Error con mensaje para el cliente si algo no es válido.
export const construirSolicitudIA = (jsonSolicitud, { userData, catalogo }) => {
  let datos;
  try {
    datos = JSON.parse(jsonSolicitud);
  } catch {
    throw new Error('No pude interpretar la solicitud.');
  }

  if (!Array.isArray(datos.productos) || datos.productos.length === 0) throw new Error('La solicitud no tiene productos.');

  const productos = datos.productos.map(item => {
    const producto = catalogo.find(p => p.id === item.productoId);
    if (!producto) throw new Error('Uno de los productos no está en el catálogo.');

    const cantidad = Number(item.cantidad);
    if (!Number.isInteger(cantidad) || cantidad < 1) throw new Error(`La cantidad de ${producto.nombre} no es válida.`);

    // Si la IA pide una presentación no permitida se usa la del producto, solo si es válida para su tipo
    // (el catálogo podría tener un café verde guardado como "Molido")
    const disponibles = presentacionesDisponibles(producto);
    const presentacion = [item.presentacion, producto.presentacion].find(p => disponibles.includes(p)) || disponibles[0];
    // El peso es fijo por producto: el precio referencial corresponde a ese peso
    return crearItemSolicitud(producto, cantidad, presentacion, producto.peso);
  });

  return crearSolicitud({
    codigo: generarCodigoSolicitud('IA-REQ'),
    userData,
    contacto: { telefono: userData.telefono || '', ciudad: userData.ciudad || '', negocio: userData.negocio || '' },
    productos,
    origen: 'Asistente IA',
  });
};
