import React from 'react'

type Props = {
    children: React.ReactNode
}

type State = {
    hasError: boolean
    error?: Error
}

export default class RoomDetailErrorBoundary extends React.Component<Props, State> {
    state: State = { hasError: false }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error }
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        if (import.meta.env.DEV) {
            console.error('RoomDetailErrorBoundary caught error', error, errorInfo)
        }
    }

    render() {
        if (!this.state.hasError) {
            return this.props.children
        }

        return (
            <div className="max-w-3xl mx-auto">
                <div className="rounded-2xl border border-red-200 bg-white shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-red-100 bg-red-50">
                        <h2 className="text-base font-bold text-red-700">Room Detail Failed to Render</h2>
                        <p className="text-sm text-red-600 mt-1">
                            A runtime error occurred. Reload the page and try again.
                        </p>
                    </div>
                    <div className="p-5 space-y-4">
                        <button
                            type="button"
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 rounded-lg bg-campus-600 text-white text-sm font-semibold hover:bg-campus-700 transition-colors"
                        >
                            Reload
                        </button>
                        {import.meta.env.DEV && this.state.error && (
                            <pre className="text-xs bg-gray-900 text-gray-100 p-4 rounded-lg overflow-auto whitespace-pre-wrap">
                                {this.state.error.stack || this.state.error.message}
                            </pre>
                        )}
                    </div>
                </div>
            </div>
        )
    }
}
