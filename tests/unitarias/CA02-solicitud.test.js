import { describe, it, expect } from 'vitest';
import { presentacionesDisponibles, crearItemSolicitud, calcularTotalItems, crearSolicitud } from '../../src/modules/solicitud-pedido/solicitud';

// CA02 - Solicitud de pedido (solicitud.js) | REQ-F05-01, REQ-F05-02, REQ-F05-03, REQ-F05-08
const userData = { uid: 'u1', nombre: 'Ana Torres', email: 'cliente01@correo.com' };
const contacto = { telefono: '987654321', ciudad: 'Trujillo', negocio: 'Café Aroma SAC', frecuencia: 'Semanal' };
const productos = [{ nombre: 'Gourmet', cantidad: 2, peso: '1 kg', presentacion: 'En grano', precioUnitario: 45, subtotal: 90 }];
const datosSolicitud = { codigo: 'REQ-20261019-ABC234', userData, contacto, productos };

describe('CA02 - Solicitud de pedido (solicitud.js)', () => {
  it('1.0 [+] Presentaciones del café tostado', () => {
    expect(presentacionesDisponibles({ tipo: 'Tostado' })).toEqual(['En grano', 'Molido']);
  });

  it('2.0 [–] Café verde no se vende molido', () => {
    const presentaciones = presentacionesDisponibles({ tipo: 'Verde' });
    expect(presentaciones).toEqual(['En grano']);
    expect(presentaciones).not.toContain('Molido');
  });

  it('3.0 [+] Ítem con precio de catálogo', () => {
    const item = crearItemSolicitud({ nombre: 'Geisha', precioReferencial: '45.50' }, 3, 'Molido', '250 g');
    expect(item.precioUnitario).toBe(45.5);
    expect(item.subtotal).toBe(136.5);
  });

  it('4.0 [–] Precio de catálogo con texto', () => {
    const item = crearItemSolicitud({ nombre: 'Geisha', precioReferencial: 'abc' }, 2, 'En grano', '250 g');
    expect(item.precioUnitario).toBe(0);
    expect(item.subtotal).toBe(0);
    expect(Number.isNaN(item.subtotal)).toBe(false);
  });

  it('5.0 [–] Producto sin precio de catálogo', () => {
    const item = crearItemSolicitud({ nombre: 'Geisha' }, 5, 'En grano', '250 g');
    expect(item.precioUnitario).toBe(0);
    expect(item.subtotal).toBe(0);
  });

  it('6.0 [+] Total de varios productos', () => {
    expect(calcularTotalItems([{ subtotal: 136.5 }, { subtotal: 90 }])).toBe(226.5);
  });

  it('7.0 [–] Total sin productos', () => {
    expect(calcularTotalItems([])).toBe(0);
  });

  it('8.0 [+] Documento de solicitud de la web', () => {
    const solicitud = crearSolicitud(datosSolicitud);
    expect(solicitud.estado).toBe('Pendiente');
    expect(solicitud.total).toBe(90);
    expect(solicitud.clienteId).toBe('u1');
    expect(solicitud).not.toHaveProperty('origen');
  });

  it('9.0 [+] Solicitud generada por el asistente de IA', () => {
    const solicitud = crearSolicitud({ ...datosSolicitud, origen: 'Asistente IA' });
    expect(solicitud.origen).toBe('Asistente IA');
  });

  it('10.0 [–] Cliente sin nombre en su perfil', () => {
    const solicitud = crearSolicitud({ ...datosSolicitud, userData: { uid: 'u1' } });
    expect(solicitud.clienteNombre).toBe('');
    expect(solicitud.clienteEmail).toBe('');
  });
});
