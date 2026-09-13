import { Component, type ErrorInfo, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />
    }
    return this.props.children
  }
}

const ErrorFallback = () => {
  const { i18n } = useTranslation()
  return (
    <div className="container text-center section-padding">
      <h2>{i18n.language === 'ar' ? 'حدث خطأ ما' : 'Something went wrong'}</h2>
      <p className="text-muted mb-4">
        {i18n.language === 'ar'
          ? 'يرجى تحديث الصفحة والمحاولة مرة أخرى.'
          : 'Please refresh the page and try again.'}
      </p>
      <button className="pill-btn-primary" onClick={() => window.location.reload()}>
        {i18n.language === 'ar' ? 'تحديث' : 'Refresh'}
      </button>
    </div>
  )
}
