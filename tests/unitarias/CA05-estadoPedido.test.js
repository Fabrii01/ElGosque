import { describe, it, expect } from 'vitest';
import {
  validarTransicion, estadosDisponibles, validarMotivo, crearEntradaHistorial, filtrarPedidos, motivoDelEstado,
} from '../../src/modules/gestion-pedidos/estadoPedido';

// CA05 - Estados del pedido (estadoPedido.js) | REQ-F08-01, REQ-F08-04, REQ-F08-05, REQ-F08-06, REQ-F08-07, REQ-F10-05
const pedidos = [
  { codigo: 'REQ-20261019-ABC234', clienteNombre: 'Ana Torres', negocio: 'Café Aroma SAC', estado: 'Pagado' },
  { codigo: 'REQ-20261019-DEF567', clienteNombre: 'Beto Ruiz', negocio: 'Bodega Lima', estado: 'Pagado' },
  { codigo: 'REQ-20261019-GHJ892', clienteNombre: 'Carla Díaz', negocio: 'Cafetería Sol', estado: 'Vendido' },
];

describe('CA05 - Estados del pedido (estadoPedido.js)', () => {
  it('1.0 [+] Flujo completo de estados', () => {
    expect(validarTransicion('Pendiente', 'Pagado')).toBeNull();
    expect(validarTransicion('Pagado', 'Enviado')).toBeNull();
    expect(validarTransicion('Enviado', 'Vendido')).toBeNull();
  });

  it('2.0 [+] Mantener el mismo estado', () => {
    expect(validarTransicion('Vendido', 'Vendido')).toBeNull();
  });

  it('3.0 [–] Marcar como vendida una solicitud sin pago', () => {
    expect(validarTransicion('Pendiente', 'Vendido')).toBe('No se puede pasar de "Pendiente" a "Vendido".');
  });

  it('4.0 [–] Saltar el pago', () => {
    expect(validarTransicion('Pendiente', 'Enviado')).toBe('No se puede pasar de "Pendiente" a "Enviado".');
  });

  it('5.0 [–] Cambiar un estado final', () => {
    expect(validarTransicion('Vendido', 'Cancelado')).toBe('No se puede pasar de "Vendido" a "Cancelado".');
    expect(validarTransicion('Cancelado', 'Pendiente')).toBe('No se puede pasar de "Cancelado" a "Pendiente".');
  });

  it('6.0 [+] Estados disponibles desde «Enviado»', () => {
    expect(estadosDisponibles('Enviado')).toEqual(['Enviado', 'Vendido']);
  });

  it('7.0 [–] Estado desconocido', () => {
    expect(estadosDisponibles('Xyz')).toEqual(['Xyz']);
  });

  it('8.0 [+] Motivo al cancelar', () => {
    expect(validarMotivo('Cancelado', 'Cliente no confirmó el pago')).toBeNull();
  });

  it('9.0 [–] Cancelar sin motivo', () => {
    expect(validarMotivo('Cancelado', '')).toBe('Debes ingresar un motivo.');
  });

  it('10.0 [–] Cancelar con motivo de solo espacios', () => {
    expect(validarMotivo('Cancelado', '   ')).toBe('Debes ingresar un motivo.');
  });

  it('11.0 [+] Otros estados no exigen motivo', () => {
    expect(validarMotivo('Vendido', '')).toBeNull();
  });

  it('12.0 [+] Entrada del historial', () => {
    const entrada = crearEntradaHistorial({ estado: 'Pendiente' }, 'Pagado', { nombre: 'Luis Rojas', uid: 'a1' }, '');
    expect(entrada).toMatchObject({
      estadoAnterior: 'Pendiente',
      estadoNuevo: 'Pagado',
      responsable: 'Luis Rojas',
      responsableId: 'a1',
      motivo: 'Gestión operativa',
    });
    expect(Number.isNaN(new Date(entrada.fechaCambio).getTime())).toBe(false);
    expect(entrada.fechaCambio).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  });

  it('13.0 [+] Filtrar pedidos por estado y búsqueda', () => {
    expect(filtrarPedidos(pedidos, 'Pagado', '')).toHaveLength(2);
    const encontrados = filtrarPedidos(pedidos, 'Todos', 'ana');
    expect(encontrados).toHaveLength(1);
    expect(encontrados[0].clienteNombre).toBe('Ana Torres');
  });

  it('14.0 [–] Filtro sin coincidencias', () => {
    expect(filtrarPedidos(pedidos, 'Todos', 'zzz')).toEqual([]);
  });

  it('15.0 [+] Motivo de un pedido cancelado', () => {
    const pedido = {
      estado: 'Cancelado',
      historial: [
        { estadoAnterior: 'Pendiente', estadoNuevo: 'Pagado', motivo: 'Gestión operativa' },
        { estadoAnterior: 'Pagado', estadoNuevo: 'Cancelado', motivo: 'Cliente desistió del pedido' },
      ],
    };
    expect(motivoDelEstado(pedido)).toBe('Cliente desistió del pedido');
  });

  it('16.0 [–] Motivo de un pedido que no fue cancelado', () => {
    expect(motivoDelEstado({ estado: 'Pagado', historial: [] })).toBeNull();
  });
});
