import { describe, it, expect } from 'vitest';
import { calcularIndicadores } from '../../src/modules/dashboard/estadisticas';

// CA11 - Dashboard: indicadores de integridad y respaldo (estadisticas.js) | REQ-F11 (indicadores de la tesis)
const datosPago = { metodo: 'Yape', monto: '480', fecha: '2026-10-20', nroOperacion: '', constancia: 'https://drive.google.com/constancia-001' };
const datosEnvio = { modalidad: 'Delivery Local', agencia: '', numeroGuia: '', fechaEnvio: '2026-10-21' };
const pedido = (cambios) => ({
  estado: 'Vendido', telefono: '987654321', ciudad: 'Trujillo', negocio: 'Café Aroma SAC',
  productos: [{ nombre: 'Geisha', cantidad: 2 }], ...cambios,
});
const cliente = { nombre: 'Ana Torres', negocio: 'Café Aroma SAC', ciudad: 'Trujillo', telefono: '987654321', email: 'cliente01@correo.com' };

describe('CA11 - Dashboard: indicadores de integridad y respaldo (estadisticas.js)', () => {
  it('1.0 [+] Pedidos confirmados con respaldo', () => {
    const { respaldoPedidos } = calcularIndicadores([pedido({ estado: 'Pagado', datosPago, datosEnvio }), pedido({})], []);
    expect(respaldoPedidos.valor).toBe(0.5);
    expect(respaldoPedidos.cumplen).toBe(1);
    expect(respaldoPedidos.base).toBe(2);
    expect(respaldoPedidos.meta).toBe(0.9);
  });

  it('2.0 [–] Venta con pago pero sin envío', () => {
    const { respaldoPedidos } = calcularIndicadores([pedido({ estado: 'Pagado', datosPago })], []);
    expect(respaldoPedidos.valor).toBe(0);
  });

  it('3.0 [+] Integridad de datos de clientes', () => {
    const { integridadClientes } = calcularIndicadores([], [cliente, { ...cliente, telefono: '' }]);
    expect(integridadClientes.valor).toBe(0.5);
  });

  it('4.0 [–] Indicadores sin clientes ni pedidos', () => {
    const { respaldoPedidos, integridadClientes, integridadPedidos } = calcularIndicadores([], []);
    expect(respaldoPedidos.valor).toBeNull();
    expect(integridadClientes.valor).toBeNull();
    expect(integridadPedidos.valor).toBeNull();
  });

  it('5.0 [–] Pedidos con datos incompletos', () => {
    const { integridadPedidos } = calcularIndicadores([
      pedido({}),
      pedido({ telefono: '' }),
      pedido({ productos: [{ nombre: 'Geisha', cantidad: 0 }] }),
    ], []);
    expect(integridadPedidos.cumplen).toBe(1);
    expect(integridadPedidos.base).toBe(3);
  });
});

// Ampliación posterior al plan: la captura del comprobante cuenta como respaldo del pago
describe('Ampliación CA11 - Captura como comprobante', () => {
  it('[+] Venta pagada con captura (sin constancia ni nro. de operación) y con envío', () => {
    const conCaptura = { metodo: 'Yape', monto: '480', fecha: '2026-10-20', nroOperacion: '', constancia: '', constanciaImagen: 'data:image/jpeg;base64,/9j/4AAQ' };
    const { respaldoPedidos } = calcularIndicadores([pedido({ estado: 'Pagado', datosPago: conCaptura, datosEnvio })], []);
    expect(respaldoPedidos.valor).toBe(1);
  });
});
