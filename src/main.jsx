import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Tipografías del portal (autoalojadas, sin depender de Google Fonts)
import '@fontsource-variable/fraunces/opsz.css'
import '@fontsource-variable/fraunces/opsz-italic.css'
import '@fontsource-variable/work-sans'
import './index.css'
import App from './App.jsx'
import { manejarVersionAntigua } from './shared/utils/nuevaVersion'

window.addEventListener('vite:preloadError', manejarVersionAntigua)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
