import { describe, it, expect } from 'vitest';
import { calcularDetalleCliente, resumirProductos } from '../../src/modules/registro-clientes/detalleCliente';

// CA17 - Detalle comercial del cliente (detalleCliente.js) | REQ-F07-03, REQ-F11-06
const cliente = { uid: 'u1', nombre: 'Ana Torres' };
const pedido = (estado, total, extra = {}) => ({ clienteId: 'u1', estado, total, fecha: { seconds: 1760000000 }, ...extra });

describe('CA17 - Detalle comercial del cliente (detalleCliente.js)', () => {
  it('1.0 [+] Resumen del cliente', () => {
    const { resumen } = calcularDetalleCliente(cliente, [
      pedido('Vendido', 100), pedido('Entregado', 300), pedido('Pendiente', 50), pedido('Cancelado', 80),
    ]);
    expect(resumen).toMatchObject({
      solicitudes: 4, pendientes: 1, pedidosConcretados: 2, noConcretados: 1, totalComprado: 400, ticketPromedio: 200,
    });
  });

  it('2.0 [–] Cliente sin pedidos', () => {
    const { resumen } = calcularDetalleCliente(cliente, []);
    expect(resumen.solicitudes).toBe(0);
    expect(resumen.ticketPromedio).toBe(0);
    expect(resumen.primeraCompra).toBeNull();
  });

  it('3.0 [+] Monto por cobrar', () => {
    const { resumen } = calcularDetalleCliente(cliente, [pedido('Vendido', 100), pedido('Pagado', 300)]);
    expect(resumen.porCobrar).toBe(100);
  });

  it('4.0 [+] Productos favoritos', () => {
    const productos = Array.from({ length: 7 }, (_, i) => ({ nombre: `Producto ${i + 1}`, cantidad: i + 1, subtotal: 10 }));
    const { productosFavoritos } = calcularDetalleCliente(cliente, [pedido('Vendido', 70, { productos })]);
    expect(productosFavoritos).toHaveLength(5);
    expect(productosFavoritos.map(p => p.unidades)).toEqual([7, 6, 5, 4, 3]);
  });

  it('5.0 [+] Texto resumen de productos', () => {
    expect(resumirProductos({ productos: [{ cantidad: 3, nombre: 'Geisha' }, { cantidad: 1, nombre: 'Gourmet' }] })).toBe('3x Geisha, 1x Gourmet');
  });

  it('6.0 [–] Pedido sin productos', () => {
    expect(resumirProductos({})).toBe('');
  });
});
