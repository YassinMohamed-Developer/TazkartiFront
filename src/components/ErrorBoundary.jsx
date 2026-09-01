import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary caught error]:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background text-on-background flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-surface-container-lowest border border-outline-variant rounded-2xl p-8 shadow-xl text-center space-y-5">
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-3xl">sentiment_dissatisfied</span>
            </div>

            <div>
              <h2 className="text-xl font-bold text-on-surface">Something went wrong</h2>
              <p className="text-sm text-secondary mt-1.5 leading-relaxed">
                An unexpected interface issue occurred. Don't worry, your session and tickets remain safe.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <button
                onClick={() => window.location.reload()}
                className="px-5 py-2.5 bg-surface-container hover:bg-surface-container-high border border-outline-variant text-on-surface font-semibold text-sm rounded-xl transition-all cursor-pointer"
              >
                Reload Page
              </button>
              <button
                onClick={this.handleReset}
                className="px-5 py-2.5 bg-primary hover:bg-primary-container text-white font-bold text-sm rounded-xl shadow-sm transition-all cursor-pointer"
              >
                Return to Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
