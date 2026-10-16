/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'gosque-green': '#166534', // Verde característico
        'gosque-brown': '#78350f', // Marrón café
        'gosque-light': '#fef3c7', // Fondo crema claro
        // Identidad del portal público (inicio y trazabilidad)
        cafe: {
          espresso: '#2a1d17', // texto principal y fondos oscuros
          tostado: '#5b3a29',  // marrón medio, texto secundario sobre crema
          kraft: '#c9a27e',    // papel kraft de los sacos de café
          crema: '#f5efe4',    // fondo tipo papel
          leche: '#fbf8f2',    // tarjetas sobre crema
          cereza: '#a8432a',   // acento: el fruto maduro del café
          selva: '#1e3a2b',    // verde de la selva amazónica
          hoja: '#3e6b35',     // verde hoja del cafeto (fase de campo)
          mostaza: '#d9a441',  // grano secándose al sol; acento cálido sobre fondos oscuros
          arena: '#ead9bf',    // kraft claro para fondos de sección (cereza sobre arena: solo texto grande)
        },
      },
      fontFamily: {
        titulo: ['"Fraunces Variable"', 'Georgia', '"Times New Roman"', 'serif'],
        cuerpo: ['"Work Sans Variable"', 'system-ui', '-apple-system', '"Segoe UI"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
