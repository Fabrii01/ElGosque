import { crearItemSolicitud, crearSolicitud, presentacionesDisponibles, FRECUENCIAS_COMPRA } from '../solicitud-pedido/solicitud';
import { generarCodigoSolicitud } from '../solicitud-pedido/solicitudService';

const PATRON_ETIQUETA = /<<<SOLICITUD:([\s\S]*?)>>>/;

// Separa el texto visible de la etiqueta de solicitud que genera la IA
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
  if (!FRECUENCIAS_COMPRA.includes(datos.frecuencia)) throw new Error('Falta indicar una frecuencia de compra válida.');

  const productos = datos.productos.map(item => {
    const producto = catalogo.find(p => p.id === item.productoId);
    if (!producto) throw new Error('Uno de los productos no está en el catálogo.');

    const cantidad = Number(item.cantidad);
    if (!Number.isInteger(cantidad) || cantidad < 1) throw new Error(`La cantidad de ${producto.nombre} no es válida.`);

    const presentacion = presentacionesDisponibles(producto).includes(item.presentacion) ? item.presentacion : producto.presentacion;
    // El peso es fijo por producto: el precio referencial corresponde a ese peso
    return crearItemSolicitud(producto, cantidad, presentacion, producto.peso);
  });

  return crearSolicitud({
    codigo: generarCodigoSolicitud('IA-REQ'),
    userData,
    contacto: { telefono: userData.telefono || '', ciudad: userData.ciudad || '', negocio: userData.negocio || '', frecuencia: datos.frecuencia },
    productos,
    origen: 'Asistente IA',
  });
};
