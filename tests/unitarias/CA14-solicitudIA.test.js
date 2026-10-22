import { describe, it, expect, vi } from 'vitest';

// Firebase simulado: la prueba no se conecta a la base de datos real
vi.mock('../../src/firebase', () => ({ db: {} }));
vi.mock('firebase/firestore', () => ({ collection: vi.fn(), addDoc: vi.fn(), serverTimestamp: vi.fn() }));

import { extraerSolicitud, construirSolicitudIA } from '../../src/modules/asistente-ia/solicitudIA';

// CA14 - Solicitud generada por el asistente de IA (solicitudIA.js) | REQ-F12-01, REQ-F12-02, REQ-F12-03
const catalogo = [
  { id: 'p1', nombre: 'Geisha', tipo: 'Tostado', presentacion: 'En grano', peso: '1 kg', precioReferencial: '45' },
  { id: 'p2', nombre: 'Verde Premium', tipo: 'Verde', presentacion: 'En grano', peso: '1 kg', precioReferencial: '30' },
];
const userData = { uid: 'u1', nombre: 'Ana Torres', email: 'cliente01@correo.com', telefono: '987654321', ciudad: 'Trujillo', negocio: 'Café Aroma SAC' };
const contexto = { userData, catalogo };
const json = (productos) => JSON.stringify({ productos });

describe('CA14 - Solicitud generada por el asistente de IA (solicitudIA.js)', () => {
  it('1.0 [+] Separar texto y etiqueta de solicitud', () => {
    expect(extraerSolicitud('Perfecto, la registro. <<<SOLICITUD:{"a":1}>>>')).toEqual({ texto: 'Perfecto, la registro.', jsonSolicitud: '{"a":1}' });
  });

  it('2.0 [–] Respuesta sin etiqueta', () => {
    expect(extraerSolicitud('¿Qué cantidad necesitas?')).toEqual({ texto: '¿Qué cantidad necesitas?', jsonSolicitud: null });
  });

  it('3.0 [+] Solicitud válida', () => {
    const solicitud = construirSolicitudIA(json([{ productoId: 'p1', cantidad: 2, presentacion: 'En grano' }]), contexto);
    expect(solicitud.total).toBe(90);
    expect(solicitud.estado).toBe('Pendiente');
    expect(solicitud.origen).toBe('Asistente IA');
    expect(solicitud.codigo.startsWith('IA-REQ-')).toBe(true);
  });

  it('4.0 [+] El precio sale del catálogo', () => {
    const solicitud = construirSolicitudIA(json([{ productoId: 'p1', cantidad: 1, presentacion: 'En grano', precioUnitario: 1, precio: '1' }]), contexto);
    expect(solicitud.productos[0].precioUnitario).toBe(45);
  });

  it('5.0 [–] Presentación no disponible', () => {
    const solicitud = construirSolicitudIA(json([{ productoId: 'p2', cantidad: 1, presentacion: 'Molido' }]), contexto);
    expect(solicitud.productos[0].presentacion).toBe('En grano');
  });

  it('6.0 [–] Texto que no es JSON', () => {
    expect(() => construirSolicitudIA('esto no es json', contexto)).toThrow('No pude interpretar la solicitud.');
  });

  it('7.0 [–] Solicitud sin productos', () => {
    expect(() => construirSolicitudIA(json([]), contexto)).toThrow('La solicitud no tiene productos.');
  });

  it('8.0 [–] Productos que no son una lista', () => {
    expect(() => construirSolicitudIA(JSON.stringify({ productos: 'Geisha' }), contexto)).toThrow('La solicitud no tiene productos.');
  });

  it('9.0 [–] Producto que no está en el catálogo', () => {
    expect(() => construirSolicitudIA(json([{ productoId: 'p99', cantidad: 1 }]), contexto))
      .toThrow('Uno de los productos no está en el catálogo.');
  });

  it('10.0 [–] Cantidades inválidas', () => {
    for (const cantidad of [0, 1.5, 'x']) {
      expect(() => construirSolicitudIA(json([{ productoId: 'p1', cantidad, presentacion: 'En grano' }]), contexto))
        .toThrow('La cantidad de Geisha no es válida.');
    }
  });
});

// Corrección detectada al ejecutar CA14 (fuera de las filas del plan)
describe('Corrección CA14 - Café verde registrado como «Molido» en el catálogo', () => {
  it('[–] La IA no registra café verde molido aunque el producto tenga presentación «Molido»', () => {
    const catalogoMalCargado = [{ ...catalogo[1], presentacion: 'Molido' }];
    const solicitud = construirSolicitudIA(json([{ productoId: 'p2', cantidad: 1, presentacion: 'Molido' }]), { userData, catalogo: catalogoMalCargado });
    expect(solicitud.productos[0].presentacion).toBe('En grano');
  });
});

// Corrección del origen: el catálogo no guarda café verde como «Molido» (ajustarPresentacion en solicitud.js)
describe('Corrección CA14 - Catálogo: café verde solo en grano', () => {
  it('[–] Producto Verde con «Molido» se guarda como «En grano»; Tostado conserva «Molido»', async () => {
    const { ajustarPresentacion } = await import('../../src/modules/solicitud-pedido/solicitud');
    expect(ajustarPresentacion({ tipo: 'Verde', presentacion: 'Molido' }).presentacion).toBe('En grano');
    expect(ajustarPresentacion({ tipo: 'Tostado', presentacion: 'Molido' }).presentacion).toBe('Molido');
  });
});

// Ampliación posterior al plan: la solicitud de la IA ya no lleva frecuencia de compra
describe('Ampliación CA14 - Pedido de la IA sin frecuencia de compra', () => {
  it('[+] La solicitud se registra sin el campo frecuencia', () => {
    const solicitud = construirSolicitudIA(json([{ productoId: 'p1', cantidad: 1, presentacion: 'En grano' }]), contexto);
    expect(solicitud).not.toHaveProperty('frecuencia');
    expect(solicitud.total).toBe(45);
  });
});
