import { describe, it, expect } from 'vitest';
import {
  calcularTopClientes, calcularPresentaciones, calcularVariedades, calcularVentasPorCiudad, calcularVentasPorModalidad,
  calcularClienteProducto, calcularCanales,
} from '../../src/modules/dashboard/estadisticas';

// CA10 - Dashboard: rankings y comparaciones (estadisticas.js) | REQ-F11-03, REQ-F11-04, REQ-F11-05, REQ-F11-06, REQ-F11-07
const pedido = (cambios) => ({ clienteId: 'u1', clienteNombre: 'Ana Torres', estado: 'Vendido', total: 0, productos: [], ...cambios });
const item = (nombre, cantidad, presentacion = 'En grano', subtotal = 0) => ({ nombre, cantidad, presentacion, subtotal });

describe('CA10 - Dashboard: rankings y comparaciones (estadisticas.js)', () => {
  it('1.0 [+] Ranking de clientes por ingresos', () => {
    const ranking = calcularTopClientes([
      pedido({ total: 100 }),
      pedido({ clienteId: 'u2', clienteNombre: 'Beto Ruiz', total: 250 }),
      pedido({ total: 300 }),
    ]);
    expect(ranking.map(c => [c.clienteId, c.ingresos, c.pedidos])).toEqual([['u1', 400, 2], ['u2', 250, 1]]);
  });

  it('2.0 [+] Ranking agrupado por identificador', () => {
    const ranking = calcularTopClientes([
      pedido({ clienteNombre: 'Ana Torres', total: 100 }),
      pedido({ clienteNombre: 'A. Torres', total: 50 }),
    ]);
    expect(ranking).toHaveLength(1);
    expect(ranking[0].pedidos).toBe(2);
  });

  it('3.0 [+] Límite del ranking', () => {
    const pedidos = ['u1', 'u2', 'u3'].map((clienteId, i) => pedido({ clienteId, total: 100 * (i + 1) }));
    expect(calcularTopClientes(pedidos, 2)).toHaveLength(2);
  });

  it('4.0 [–] Cliente sin ventas concretadas', () => {
    const ranking = calcularTopClientes([
      pedido({ clienteId: 'u1', total: 100 }),
      pedido({ clienteId: 'u7', estado: 'Pendiente', total: 500 }),
      pedido({ clienteId: 'u8', estado: 'Cancelado', total: 500 }),
    ]);
    expect(ranking.map(c => c.clienteId)).toEqual(['u1']);
  });

  it('5.0 [+] Grano frente a molido', () => {
    const resultado = calcularPresentaciones([
      pedido({ productos: [item('Geisha', 5, 'En grano'), item('Gourmet', 3, 'Molido')] }),
      pedido({ estado: 'Pendiente', productos: [item('Geisha', 10, 'Molido')] }),
    ]);
    expect(resultado).toEqual({ enGrano: 5, molido: 3 });
  });

  it('6.0 [–] Grano frente a molido sin pedidos', () => {
    expect(calcularPresentaciones([])).toEqual({ enGrano: 0, molido: 0 });
  });

  it('7.0 [+] Variedades más solicitadas', () => {
    const variedades = calcularVariedades([
      pedido({ productos: [item('Gourmet', 2), item('Geisha', 3)] }),
      pedido({ estado: 'Pendiente', productos: [item('Geisha', 1)] }),
    ]);
    expect(variedades).toEqual([
      { nombre: 'Geisha', solicitadas: 4, vendidas: 3 },
      { nombre: 'Gourmet', solicitadas: 2, vendidas: 2 },
    ]);
  });

  it('8.0 [+] Ventas por ciudad', () => {
    const ciudades = calcularVentasPorCiudad([
      pedido({ ciudad: 'Trujillo', total: 100 }),
      pedido({ ciudad: 'Lima', total: 50 }),
      pedido({ ciudad: 'Trujillo', total: 200 }),
      pedido({ ciudad: '', total: 20 }),
    ]);
    expect(ciudades).toEqual([
      { nombre: 'Trujillo', ingresos: 300, pedidos: 2 },
      { nombre: 'Lima', ingresos: 50, pedidos: 1 },
      { nombre: 'No especificada', ingresos: 20, pedidos: 1 },
    ]);
  });

  it('9.0 [–] Ventas por modalidad sin envío registrado', () => {
    const modalidades = calcularVentasPorModalidad([
      pedido({ total: 100 }),
      pedido({ total: 80, datosEnvio: { modalidad: 'Delivery Local' } }),
    ]);
    expect(modalidades.map(m => m.nombre)).toEqual(['Sin registrar', 'Delivery Local']);
  });

  it('10.0 [+] Más de 8 categorías', () => {
    const ciudades = ['Trujillo', 'Lima', 'Chiclayo', 'Piura', 'Cajamarca', 'Chachapoyas', 'Tarapoto', 'Huaraz', 'Arequipa', 'Cusco'];
    const filas = calcularVentasPorCiudad(ciudades.map((ciudad, i) => pedido({ ciudad, total: 100 - i })));
    expect(filas).toHaveLength(8);
    expect(filas[7].nombre).toBe('Otros (3)');
  });

  it('11.0 [+] Cantidades por cliente y producto', () => {
    const filas = calcularClienteProducto([
      pedido({ clienteId: 'u2', clienteNombre: 'Beto', productos: [item('Gourmet', 1, 'En grano', 45)] }),
      pedido({ clienteNombre: 'Ana', productos: [item('Geisha', 2, 'Molido', 90)] }),
      pedido({ clienteNombre: 'Ana', productos: [item('Geisha', 3, 'Molido', 135)] }),
    ]);
    expect(filas.map(f => [f.cliente, f.producto, f.unidades])).toEqual([['Ana', 'Geisha', 5], ['Beto', 'Gourmet', 1]]);
  });

  it('12.0 [+] Origen de las solicitudes', () => {
    expect(calcularCanales([pedido({}), pedido({}), pedido({ origen: 'Asistente IA' })])).toEqual({ web: 2, ia: 1 });
  });

  it('13.0 [–] Rankings sin pedidos', () => {
    expect(calcularVariedades([])).toEqual([]);
    expect(calcularVentasPorCiudad([])).toEqual([]);
    expect(calcularClienteProducto([])).toEqual([]);
  });
});

// Corrección detectada al ejecutar CA10 (fuera de las filas del plan)
describe('Corrección CA10 - Ciudad escrita con distintas mayúsculas', () => {
  it('[+] «Trujillo», «trujillo» y «TRUJILLO » se agrupan en una sola ciudad', () => {
    const ciudades = calcularVentasPorCiudad([
      pedido({ ciudad: 'Trujillo', total: 100 }),
      pedido({ ciudad: 'trujillo', total: 50 }),
      pedido({ ciudad: 'TRUJILLO ', total: 20 }),
    ]);
    expect(ciudades).toEqual([{ nombre: 'Trujillo', ingresos: 170, pedidos: 3 }]);
  });
});
