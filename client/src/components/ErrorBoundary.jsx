import { Component } from 'react'
import { Building2, RefreshCw, Home } from 'lucide-react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo })
    // Log to console in dev; swap for a real error reporting service in prod
    console.error('[ErrorBoundary]', error, errorInfo)
  }

  handleReload = () => {
    window.location.reload()
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div className="min-h-screen bg-hero flex items-center justify-center px-4">
        {/* Ambient glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-red-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-gold-500/5 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 text-center max-w-lg w-full">
          {/* Logo */}
          <div className="inline-flex items-center gap-2 mb-10">
            <div className="w-9 h-9 bg-gradient-to-br from-gold-400 to-gold-600 rounded-xl flex items-center justify-center shadow-gold">
              <Building2 className="w-5 h-5 text-navy-950" strokeWidth={2.5} />
            </div>
            <span className="font-display text-2xl font-bold">
              <span className="text-white">Elite</span>
              <span className="text-gradient-gold">Estate</span>
            </span>
          </div>

          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <span className="text-4xl">⚠️</span>
            </div>
          </div>

          {/* Heading */}
          <h1 className="font-display text-3xl md:text-4xl font-bold text-white mb-3">
            Something Went Wrong
          </h1>
          <p className="text-slate-400 text-base mb-2">
            An unexpected error occurred. Our team has been notified.
          </p>
          <p className="text-slate-500 text-sm mb-10">
            Try reloading the page — if the problem persists, go back to the homepage.
          </p>

          {/* Error detail (dev only) */}
          {import.meta.env.DEV && this.state.error && (
            <div className="glass-card border border-red-500/20 p-4 mb-8 text-left">
              <p className="text-red-400 text-xs font-mono break-all">
                {this.state.error.toString()}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              id="error-boundary-reload-btn"
              onClick={this.handleReload}
              className="btn-primary justify-center py-3 px-6"
            >
              <RefreshCw className="w-4 h-4" />
              Reload Page
            </button>
            <button
              id="error-boundary-home-btn"
              onClick={this.handleGoHome}
              className="btn-secondary justify-center py-3 px-6"
            >
              <Home className="w-4 h-4" />
              Go to Homepage
            </button>
          </div>
        </div>
      </div>
    )
  }
}
