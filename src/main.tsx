import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AppThemeProvider } from './ThemeContext'
import { App } from './App'
import { I18nProvider } from './i18n'

const redirectPath = new URLSearchParams(window.location.search).get('redirect')

if (redirectPath?.startsWith('/')) {
  const redirectUrl = `${redirectPath}${window.location.hash}`
  window.history.replaceState(null, '', redirectUrl)
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <I18nProvider>
        <AppThemeProvider>
          <App />
        </AppThemeProvider>
      </I18nProvider>
    </BrowserRouter>
  </StrictMode>,
)
