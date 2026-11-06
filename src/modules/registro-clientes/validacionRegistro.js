// Validaciones del formulario de registro (REQ-F02-01). La misma regla de teléfono está en firestore.rules.

// Largo mínimo para contraseñas nuevas; las cuentas antiguas pueden seguir ingresando con la suya
export const LARGO_MINIMO_CONTRASENA = 8;

export const MENSAJE_TELEFONO = 'Ingresa un celular de Perú de 9 dígitos que empiece con 9. Ejemplo: 987 654 321.';

// Acepta espacios, guiones, paréntesis y el prefijo de Perú (+51 o 51): "+51 987-654-321" -> "987654321"
export const normalizarTelefono = (telefono) => {
  const digitos = String(telefono ?? '').replace(/[\s\-().]/g, '').replace(/^\+/, '');
  return /^51\d{9}$/.test(digitos) ? digitos.slice(2) : digitos;
};

// Celular peruano: 9 dígitos que empiezan con 9 (se coordina por WhatsApp, REQ-F06)
export const telefonoValido = (telefono) => /^9\d{8}$/.test(normalizarTelefono(telefono));

// Devuelve el mensaje del primer dato no válido, o '' si todo está bien
export const validarRegistro = ({ nombre, negocio, ciudad, telefono, password }) => {
  if (![nombre, negocio, ciudad].every(campo => String(campo ?? '').trim() !== '')) return 'Completa tu nombre, negocio y ciudad.';
  if (!telefonoValido(telefono)) return MENSAJE_TELEFONO;
  if (String(password ?? '').length < LARGO_MINIMO_CONTRASENA) return `La contraseña debe tener al menos ${LARGO_MINIMO_CONTRASENA} caracteres.`;
  return '';
};
