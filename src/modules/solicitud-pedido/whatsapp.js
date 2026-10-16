// Comunicación por WhatsApp con mensaje preformateado (REQ-F06)
export const NUMERO_WHATSAPP = "51925414135";

export const construirMensajeWhatsApp = (pedido) => {
  const resumenProductos = pedido.productos.map(p =>
    `- ${p.cantidad}x ${p.nombre} (${p.presentacion}, ${p.peso}) = S/ ${p.subtotal}`
  ).join('\n');

  return `Hola El Gosque, soy ${pedido.clienteNombre}. Acabo de registrar un pedido en la web:
*Código de Pedido:* ${pedido.codigo}
*Productos:*
${resumenProductos}
*Total Referencial:* S/ ${pedido.total.toFixed(2)} (precio final sujeto a confirmación)
*Ciudad de envío:* ${pedido.ciudad}
*Negocio:* ${pedido.negocio}

Espero su confirmación y medios de pago.`;
};

export const abrirWhatsApp = (texto) => {
  const url = `https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(texto)}`;
  window.open(url, '_blank');
};
