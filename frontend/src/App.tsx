import { HelmetProvider } from 'react-helmet-async'
import { AppRouter } from './router'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { ToastProvider } from '@/components/ui/Toast'

function App() {
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <ToastProvider>
          <AppRouter />
        </ToastProvider>
      </HelmetProvider>
    </ErrorBoundary>
  )
}

export default App
