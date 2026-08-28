import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { AuthProvider } from './core/context/AuthContext'
import { ThemeProvider } from './core/context/ThemeContext'
import { initializeAppInsights } from './core/utils/appInsights'

initializeAppInsights()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </AuthProvider>
  </StrictMode>,
)


