import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/figtree/300.css'
import '@fontsource/figtree/700.css'
import '@fontsource/figtree/400.css'
import '@fontsource/figtree/800.css'
import './index.css'
import App from './App.tsx'
import { enableReveal } from './reveal'

enableReveal()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
