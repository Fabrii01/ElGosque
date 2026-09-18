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
      }
    },
  },
  plugins: [],
}