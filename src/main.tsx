import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AppThemeProvider } from './ThemeContext'
import { App } from './App'
import { I18nProvider } from './i18n'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <I18nProvider>
      <AppThemeProvider>
        <App />
      </AppThemeProvider>
    </I18nProvider>
  </StrictMode>,
)
