import { Component, type ReactNode, type ErrorInfo } from 'react';
import { AlertTriangle, RefreshCw, Home, ChevronDown, ChevronUp } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
}

/**
 * ErrorBoundary - Catches JavaScript errors in child components
 *
 * Prevents the entire app from crashing when a component throws.
 * Displays a user-friendly error message with recovery options.
 *
 * Usage:
 * ```tsx
 * <ErrorBoundary>
 *   <YourComponent />
 * </ErrorBoundary>
 *
 * // With custom fallback
 * <ErrorBoundary fallback={<CustomError />}>
 *   <YourComponent />
 * </ErrorBoundary>
 *
 * // With error callback
 * <ErrorBoundary onError={(error) => logToService(error)}>
 *   <YourComponent />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });

    // Call optional error callback
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error);
      console.error('Component stack:', errorInfo.componentStack);
    }
  }

  handleRefresh = (): void => {
    window.location.reload();
  };

  handleGoHome = (): void => {
    window.location.href = '/';
  };

  handleRetry = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    });
  };

  toggleDetails = (): void => {
    this.setState((prev) => ({ showDetails: !prev.showDetails }));
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-[400px] flex items-center justify-center p-8">
          <div className="max-w-md w-full bg-white border border-red-200 rounded-lg shadow-lg p-6">
            {/* Error Icon and Title */}
            <div className="flex items-center space-x-3 mb-4">
              <div className="shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Something went wrong
                </h2>
                <p className="text-sm text-gray-500">
                  An unexpected error occurred
                </p>
              </div>
            </div>

            {/* Error Message */}
            <div className="mb-6">
              <p className="text-sm text-gray-600">
                We're sorry, but something went wrong while displaying this content.
                You can try refreshing the page or going back to the home page.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={this.handleRetry}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Try Again</span>
              </button>
              <button
                onClick={this.handleRefresh}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Refresh Page</span>
              </button>
              <button
                onClick={this.handleGoHome}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200 transition-colors"
              >
                <Home className="h-4 w-4" />
                <span>Go Home</span>
              </button>
            </div>

            {/* Error Details (Development) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="border-t border-gray-200 pt-4">
                <button
                  onClick={this.toggleDetails}
                  className="flex items-center space-x-2 text-sm text-gray-500 hover:text-gray-700"
                >
                  {this.state.showDetails ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                  <span>
                    {this.state.showDetails ? 'Hide' : 'Show'} Error Details
                  </span>
                </button>

                {this.state.showDetails && (
                  <div className="mt-3 space-y-3">
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1">
                        Error Message:
                      </p>
                      <pre className="text-xs bg-red-50 text-red-800 p-2 rounded overflow-x-auto">
                        {this.state.error.message}
                      </pre>
                    </div>
                    {this.state.errorInfo?.componentStack && (
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">
                          Component Stack:
                        </p>
                        <pre className="text-xs bg-gray-50 text-gray-700 p-2 rounded overflow-x-auto max-h-48">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * PageErrorBoundary - Full-page error boundary with centered layout
 */
export function PageErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center p-8">
            <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Page Error
            </h1>
            <p className="text-gray-600 mb-6">
              Sorry, something went wrong loading this page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}
