import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { I18nextProvider } from 'react-i18next'
import i18n, { initI18n } from './i18n'
import App from './App'
import './styles/main.scss'

const root = document.getElementById('root')!

void initI18n()
  .then(() => {
    createRoot(root).render(
      <StrictMode>
        <I18nextProvider i18n={i18n}>
          <App />
        </I18nextProvider>
      </StrictMode>,
    )
  })
  .catch((error) => {
    console.error('Failed to initialize i18n:', error)
    root.textContent = 'Failed to load the app. Please refresh the page.'
  })
