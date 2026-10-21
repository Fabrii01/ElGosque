import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { crearItemCarrito, guardarCarritos, leerCarritos } from '../../src/modules/solicitud-pedido/carritoStorage';

// CA16 - Carrito de pedido (carritoStorage.js) | REQ-F05-01, REQ-F05-02
// localStorage simulado en memoria (Node no tiene navegador)
const crearLocalStorage = () => {
  const datos = {};
  return {
    getItem: (clave) => (clave in datos ? datos[clave] : null),
    setItem: (clave, valor) => { datos[clave] = String(valor); },
  };
};
const geisha = { id: 'p1', nombre: 'Geisha', tipo: 'Tostado', precioReferencial: '45', cantidad: 2, presentacionElegida: 'Molido', pesoElegido: '1 kg' };

describe('CA16 - Carrito de pedido (carritoStorage.js)', () => {
  beforeEach(() => vi.stubGlobal('localStorage', crearLocalStorage()));
  afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });

  it('1.0 [+] Ítem del carrito sin la imagen', () => {
    const item = crearItemCarrito({ ...geisha, imagenUrl: 'data:image/jpeg;base64,/9j/4AAQSkZJRg...' });
    expect(Object.keys(item)).toHaveLength(7);
    expect(item).toEqual(geisha);
    expect(item).not.toHaveProperty('imagenUrl');
  });

  it('2.0 [+] Guardar y leer carritos', () => {
    const carritos = { u1: [geisha], u2: [{ ...geisha, id: 'p3', nombre: 'Gourmet' }] };
    guardarCarritos(carritos);
    expect(leerCarritos()).toEqual(carritos);
    expect(leerCarritos().u1[0].nombre).toBe('Geisha');
    expect(leerCarritos().u2[0].nombre).toBe('Gourmet');
  });

  it('3.0 [–] Sin carritos guardados', () => {
    expect(leerCarritos()).toEqual({});
  });

  it('4.0 [–] Contenido dañado en el navegador', () => {
    localStorage.setItem('elgosque:carritos', '{no es json');
    expect(() => leerCarritos()).not.toThrow();
    expect(leerCarritos()).toEqual({});
  });

  it('5.0 [–] Almacenamiento bloqueado', () => {
    vi.stubGlobal('localStorage', { getItem: () => null, setItem: () => { throw new Error('QuotaExceededError'); } });
    const aviso = vi.spyOn(console, 'error').mockImplementation(() => {});
    const carritos = { u1: [geisha] };
    expect(() => guardarCarritos(carritos)).not.toThrow();
    expect(aviso).toHaveBeenCalledOnce();
    expect(carritos.u1).toHaveLength(1); // el carrito sigue en memoria
  });
});
