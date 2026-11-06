// Aviso de tratamiento de datos personales basado en RN-15.
// Texto pendiente de validación por El Gosque (Ley N.° 29733, Protección de Datos Personales).
const AvisoPrivacidad = () => (
  <div className="text-xs text-cafe-tostado leading-relaxed space-y-2 bg-cafe-crema border border-cafe-espresso/15 rounded-sm p-4 max-h-40 overflow-y-auto">
    <p className="font-bold text-cafe-espresso">Aviso de privacidad</p>
    <p>El Gosque es responsable de los datos que registras (nombre, negocio, ciudad, teléfono y correo). Los usamos únicamente para gestionar tus solicitudes y pedidos, y para comunicarnos contigo sobre ellos, incluso por WhatsApp. Sin estos datos no podemos atender tus pedidos.</p>
    <p>Para operar la plataforma usamos proveedores que pueden tratar datos fuera del Perú: Google Firebase guarda tu cuenta y tus pedidos, y Groq procesa lo que escribes al asistente virtual (solo recibe tu primer nombre y tus mensajes, así que no escribas datos personales en el chat). No vendemos ni compartimos tus datos para otros fines.</p>
    <p>Conservamos tus datos mientras tengas una cuenta y, después, solo el tiempo necesario para cumplir obligaciones legales.</p>
    <p>Puedes ejercer tus derechos de acceso, rectificación, cancelación y oposición comunicándote con El Gosque por WhatsApp.</p>
  </div>
);

export default AvisoPrivacidad;
