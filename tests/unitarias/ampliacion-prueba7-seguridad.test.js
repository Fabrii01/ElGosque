import { describe, it, expect } from 'vitest';
import { normalizarTelefono, telefonoValido, validarRegistro, MENSAJE_TELEFONO } from '../../src/modules/registro-clientes/validacionRegistro';
import { generarCSV } from '../../src/shared/utils/csv';
import { construirPromptSistema } from '../../src/modules/asistente-ia/promptAsistente';

// Ampliación posterior al plan: correcciones de la Prueba 7 (OWASP Top 10:2025 y Ley N.° 29733)
const registro = { nombre: 'Ana Torres', negocio: 'Café Aroma', ciudad: 'Trujillo', telefono: '987654321', password: 'clave-segura' };

describe('Ampliación - Validación del teléfono en el registro', () => {
  it.each([
    ['987654321', '987654321'],
    ['987 654 321', '987654321'],
    ['987-654-321', '987654321'],
    ['+51 987 654 321', '987654321'],
    ['51987654321', '987654321'],
    ['(+51) 987-654-321', '987654321'],
  ])('[+] Acepta %s y lo guarda como %s', (entrada, esperado) => {
    expect(telefonoValido(entrada)).toBe(true);
    expect(normalizarTelefono(entrada)).toBe(esperado);
  });

  it.each(['', '   ', '12345', '98765432', '9876543210', '887654321', '044123456', '+1 987654321', '98765432a', 'correo@x.com', null, undefined])(
    '[–] Rechaza %s',
    (entrada) => { expect(telefonoValido(entrada)).toBe(false); }
  );
});

describe('Ampliación - Validación del formulario de registro', () => {
  it('[+] Datos completos y válidos no devuelven error', () => {
    expect(validarRegistro(registro)).toBe('');
  });

  it('[–] Teléfono con formato inválido', () => {
    expect(validarRegistro({ ...registro, telefono: '123' })).toBe(MENSAJE_TELEFONO);
  });

  it('[–] Contraseña de menos de 8 caracteres', () => {
    expect(validarRegistro({ ...registro, password: '1234567' })).toMatch(/al menos 8/);
  });

  it('[–] Campo obligatorio con solo espacios', () => {
    expect(validarRegistro({ ...registro, ciudad: '   ' })).toMatch(/Completa/);
  });
});

describe('Ampliación - Inyección de fórmulas en el CSV exportado', () => {
  const columnas = [{ titulo: 'Valor', valor: f => f.v }];
  const celda = (v) => generarCSV([{ v }], columnas).split('\r\n')[1];

  it.each(['=HYPERLINK("http://x")', '+1+1', '-2+3', '@SUM(A1)', '\t=1'])('[–] Neutraliza %s', (texto) => {
    expect(celda(texto).replace(/^"/, '').startsWith("'")).toBe(true);
  });

  it('[+] Conserva textos normales y números, incluidos los negativos', () => {
    expect(celda('Café Aroma')).toBe('Café Aroma');
    expect(celda(150.5)).toBe('150.5');
    expect(celda(-20)).toBe('-20');
  });
});

describe('Ampliación - Datos mínimos enviados a la IA (Ley N.° 29733)', () => {
  it('[+] El prompt no incluye teléfono, negocio, ciudad, correo ni apellidos del cliente', () => {
    const prompt = construirPromptSistema({
      userData: { nombre: 'Ana Torres', negocio: 'Negocio Secreto', ciudad: 'CiudadPrueba', telefono: '987654321', email: 'ana@correo.com' },
      catalogo: [],
      trazabilidad: {},
    });
    ['Torres', 'Negocio Secreto', 'CiudadPrueba', '987654321', 'ana@correo.com'].forEach(dato => expect(prompt).not.toContain(dato));
    expect(prompt).toContain('Ana');
  });
});
