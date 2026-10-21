import { describe, it, expect, vi, afterEach } from 'vitest';
import { NUMERO_WHATSAPP, construirMensajeWhatsApp, abrirWhatsApp } from '../../src/modules/solicitud-pedido/whatsapp';

// CA04 - Mensaje de WhatsApp (whatsapp.js) | REQ-F06-01, REQ-F06-02
const geisha = { nombre: 'Geisha', cantidad: 2, presentacion: 'Molido', peso: '250 g', subtotal: 91 };
const pedido = {
  codigo: 'REQ-20261019-ABC234',
  clienteNombre: 'Ana Torres',
  productos: [geisha],
  total: 91,
  ciudad: 'Trujillo',
  negocio: 'Café Aroma SAC',
};

describe('CA04 - Mensaje de WhatsApp (whatsapp.js)', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('1.0 [+] Mensaje con un producto', () => {
    const mensaje = construirMensajeWhatsApp(pedido);
    expect(mensaje).toContain('REQ-20261019-ABC234');
    expect(mensaje).toContain('- 2x Geisha (Molido, 250 g) = S/ 91');
    expect(mensaje).toContain('*Total Referencial:* S/ 91.00');
    expect(mensaje).toContain('Trujillo');
    expect(mensaje).toContain('Café Aroma SAC');
  });

  it('2.0 [+] Mensaje con varios productos', () => {
    const productos = [
      geisha,
      { nombre: 'Gourmet', cantidad: 1, presentacion: 'En grano', peso: '1 kg', subtotal: 45 },
      { nombre: 'Verde Premium', cantidad: 3, presentacion: 'En grano', peso: '1 kg', subtotal: 90 },
    ];
    const mensaje = construirMensajeWhatsApp({ ...pedido, productos, total: 226 });
    expect(mensaje.split('\n').filter(linea => /^- \d+x /.test(linea))).toHaveLength(3);
  });

  it('3.0 [+] Número de destino', () => {
    expect(NUMERO_WHATSAPP).toBe('51925414135');
  });

  it('4.0 [+] Enlace de WhatsApp con tildes y ñ', () => {
    const open = vi.fn();
    vi.stubGlobal('window', { open }); // window.open simulado
    const texto = 'Hola, soy Ñandú Pérez';
    abrirWhatsApp(texto);
    const [url, destino] = open.mock.calls[0];
    expect(url.startsWith('https://wa.me/51925414135?text=')).toBe(true);
    expect(decodeURIComponent(new URL(url).search.replace('?text=', ''))).toBe(texto);
    expect(destino).toBe('_blank');
  });

  it('5.0 [–] Pedido sin total', () => {
    const sinTotal = { ...pedido };
    delete sinTotal.total;
    expect(() => construirMensajeWhatsApp(sinTotal)).toThrow();
  });

  it('6.0 [–] Pedido sin lista de productos', () => {
    const sinProductos = { ...pedido };
    delete sinProductos.productos;
    expect(() => construirMensajeWhatsApp(sinProductos)).toThrow();
  });
});
