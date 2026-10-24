// Reglas de la entrega (REQ-F10-04/05)
// La entrega se registra solo como cambio de estado a "Vendido" (el pedido llegó al cliente); no hay datos propios de entrega.
import { MODALIDAD_RECOJO } from '../envios/envio';

// Para marcar "Vendido" se exige la modalidad; sin pasar por "Enviado" solo si el cliente recoge en tienda
export const validarEntrega = (nuevoEstado, envio, estadoActual) => {
  if (nuevoEstado !== 'Vendido') return null;
  if (!envio.modalidad) return "Faltan datos de envío.";
  if (estadoActual === 'Pagado' && envio.modalidad !== MODALIDAD_RECOJO) return `Para marcar como Vendido sin pasar por Enviado, la modalidad debe ser «${MODALIDAD_RECOJO}».`;
  return null;
};
