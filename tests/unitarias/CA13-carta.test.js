import { describe, it, expect } from 'vitest';
import { HORARIO_CAFETERIA, CATEGORIAS_CAFETERIA, agruparPorCategoria, categoriasExistentes } from '../../src/modules/cafeteria/carta';

// CA13 - Carta de la cafetería (carta.js) | REQ-F13-01, REQ-F13-02
describe('CA13 - Carta de la cafetería (carta.js)', () => {
  it('1.0 [+] Horario de atención', () => {
    expect(HORARIO_CAFETERIA).toBe('Lun - Sáb | 9:00 AM - 9:00 PM');
  });

  it('2.0 [+] Categorías de la carta', () => {
    expect(CATEGORIAS_CAFETERIA).toEqual(['Postres', 'Café', 'Sandwich', 'Jugos', 'Desayunos Especiales']);
  });

  it('3.0 [+] Agrupar por categoría', () => {
    const grupos = agruparPorCategoria([
      { nombre: 'Torta', categoria: 'Postres' },
      { nombre: 'Americano', categoria: 'Café' },
      { nombre: 'Brownie', categoria: 'Postres' },
    ]);
    expect(grupos.map(g => g.categoria)).toEqual(['Café', 'Postres']);
    expect(grupos[1].items.map(p => p.nombre)).toEqual(['Brownie', 'Torta']);
  });

  it('4.0 [–] Preparación sin categoría', () => {
    expect(agruparPorCategoria([{ nombre: 'Agua', categoria: '   ' }])[0].categoria).toBe('Otros');
    expect(agruparPorCategoria([{ nombre: 'Agua' }])[0].categoria).toBe('Otros');
  });

  it('5.0 [–] Carta sin preparaciones', () => {
    expect(agruparPorCategoria([])).toEqual([]);
  });

  it('6.0 [+] Categorías existentes sin repetir', () => {
    const preparaciones = [
      { nombre: 'Torta', categoria: 'Postres' },
      { nombre: 'Americano', categoria: 'Café' },
      { nombre: 'Brownie', categoria: 'Postres' },
      { nombre: 'Agua', categoria: '' },
      { nombre: 'Té' },
    ];
    expect(categoriasExistentes(preparaciones)).toEqual(['Café', 'Postres']);
  });
});
