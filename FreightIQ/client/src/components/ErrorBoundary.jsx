import React from 'react'
import { AlertTriangle, RefreshCw, LogOut } from 'lucide-react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('FreightIQ Uncaught React Exception:', error, errorInfo)
    this.setState({ errorInfo })
  }

  handleReset = () => {
    localStorage.clear()
    window.location.href = '/login'
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0d1424] flex items-center justify-center p-6 font-sans text-white">
          <div className="max-w-lg w-full bg-[#111c33] border border-rose-500/30 rounded-3xl p-8 shadow-2xl space-y-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center mx-auto text-rose-400">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div>
              <span className="px-3 py-1 rounded-full bg-rose-500/10 text-rose-300 text-[11px] font-mono font-bold uppercase tracking-wider">
                Application Rendering Alert
              </span>
              <h2 className="text-xl font-black text-white mt-2">
                Something encountered an unexpected issue
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {this.state.error?.message || 'A component error occurred.'}
              </p>
            </div>

            <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800 text-left text-[11px] font-mono text-slate-400 overflow-x-auto max-h-36">
              {this.state.error?.stack?.split('\n').slice(0, 4).join('\n') || 'No stack trace available.'}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={this.handleReload}
                className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-blue-600/20"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload Page</span>
              </button>
              <button
                onClick={this.handleReset}
                className="flex-1 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border border-slate-700"
              >
                <LogOut className="w-4 h-4" />
                <span>Clear Cache & Re-login</span>
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
