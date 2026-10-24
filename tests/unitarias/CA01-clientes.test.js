import { describe, it, expect } from 'vitest';
import { clienteCompleto, filtrarClientes, resumirClientes } from '../../src/modules/registro-clientes/clientes';

// CA01 - Registro de clientes (clientes.js) | REQ-F02-01
const cliente = {
  uid: 'u1',
  nombre: 'Ana Torres',
  negocio: 'Café Aroma SAC',
  ciudad: 'Trujillo',
  telefono: '987654321',
  email: 'cliente01@correo.com',
};
const clienteLima = { ...cliente, uid: 'u2', nombre: 'Beto Ruiz', negocio: 'Bodega Lima', ciudad: 'Lima', email: 'cliente02@correo.com' };
const pedido = (clienteId, estado, total, seconds) => ({ clienteId, estado, total, fecha: { seconds } });

describe('CA01 - Registro de clientes (clientes.js)', () => {
  it('1.0 [+] Cliente con los 5 campos obligatorios completos', () => {
    expect(clienteCompleto(cliente)).toBe(true);
  });

  it('2.0 [–] Cliente sin teléfono', () => {
    expect(clienteCompleto({ ...cliente, telefono: '' })).toBe(false);
  });

  it('3.0 [–] Campo con solo espacios', () => {
    expect(clienteCompleto({ ...cliente, ciudad: '   ' })).toBe(false);
  });

  it('4.0 [–] Campo inexistente', () => {
    const sinEmail = { ...cliente };
    delete sinEmail.email;
    expect(() => clienteCompleto(sinEmail)).not.toThrow();
    expect(clienteCompleto(sinEmail)).toBe(false);
  });

  it('5.0 [+] Búsqueda sin distinguir mayúsculas', () => {
    expect(filtrarClientes([cliente, clienteLima], 'TRUJILLO')).toEqual([cliente]);
  });

  it('6.0 [+] Búsqueda vacía', () => {
    expect(filtrarClientes([cliente, clienteLima], '   ')).toHaveLength(2);
  });

  it('7.0 [–] Búsqueda sin coincidencias', () => {
    expect(filtrarClientes([cliente, clienteLima], 'zzz')).toEqual([]);
  });

  it('8.0 [+] Resumen de actividad de un cliente', () => {
    const pedidos = [
      pedido('u1', 'Vendido', 100, 1760000000),
      pedido('u1', 'Pendiente', 50, 1760100000),
      pedido('u1', 'Enviado', 200, 1760200000),
    ];
    const [resumen] = resumirClientes([cliente], pedidos);
    expect(resumen.solicitudes).toBe(3);
    expect(resumen.pedidosConcretados).toBe(2);
    expect(resumen.totalComprado).toBe(300);
    expect(resumen.datosCompletos).toBe(true);
  });

  it('9.0 [–] Cliente sin pedidos', () => {
    const [resumen] = resumirClientes([cliente], []);
    expect(resumen.solicitudes).toBe(0);
    expect(resumen.totalComprado).toBe(0);
    expect(resumen.ultimaActividad).toBeNull();
  });

  it('10.0 [–] Pedidos de otro cliente', () => {
    const [resumen] = resumirClientes([cliente], [pedido('u9', 'Vendido', 100, 1760000000)]);
    expect(resumen.solicitudes).toBe(0);
  });
});
