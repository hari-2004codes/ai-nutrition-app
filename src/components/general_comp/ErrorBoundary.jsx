import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { motion } from 'framer-motion';


class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null // For error tracking
    };
  }

  static getDerivedStateFromError(error) {
    // Generate unique error ID for tracking
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return { 
      hasError: true,
      errorId 
    };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Enhanced error logging
    const errorDetails = {
      error: error.toString(),
      errorInfo: errorInfo,
      errorId: this.state.errorId,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 Error Boundary Caught Error');
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.error('Full Details:', errorDetails);
      console.groupEnd();
    }

    // In production, you'd send this to your error tracking service
    // this.reportError(errorDetails);
  }

  // Method to report errors to external service
  reportError = (errorDetails) => {
    // Example: Send to error tracking service
    // fetch('/api/errors', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(errorDetails)
    // });
  };

  resetError = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null 
    });
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    // Allow custom fallback UI through props
    if (this.props.fallback) {
      return this.props.fallback(
        this.state.error, 
        this.resetError, 
        this.state.errorInfo
      );
    }

    return (
      <ErrorFallbackUI
        error={this.state.error}
        errorInfo={this.state.errorInfo}
        errorId={this.state.errorId}
        resetError={this.resetError}
        onGoHome={this.props.onGoHome}
      />
    );
  }
}

// Separate fallback UI component for better reusability
const ErrorFallbackUI = ({ 
  error, 
  errorInfo, 
  errorId, 
  resetError, 
  onGoHome 
}) => {
  const handleGoHome = () => {
    if (onGoHome) {
      onGoHome();
    } else {
      // Default behavior - replace current history entry
      window.location.replace('/dashboard');
    }
  };

  const handleReportBug = () => {
    // Option to report bug with pre-filled error details
    const body = `Error ID: ${errorId}\nError: ${error?.toString()}\nTimestamp: ${new Date().toISOString()}`;
    const mailtoLink = `mailto:support@yourapp.com?subject=Bug Report - ${errorId}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink);
  };

  return (
    <div className="min-h-screen bg-dark-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-md w-full bg-dark-200 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl text-center"
      >
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
          className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-8"
        >
          <AlertTriangle className="w-10 h-10 text-primary" />
        </motion.div>
        
        <h2 className="text-3xl font-bold text-white mb-3">
          Oops! Something went wrong
        </h2>
        <p className="text-text-muted mb-2">
          We apologize for the inconvenience. Please try refreshing or return to the dashboard.
        </p>
        
        {errorId && (
          <p className="text-xs text-text-muted/60 mb-8 font-mono">
            Error ID: {errorId}
          </p>
        )}

        {/* Development error details */}
        {process.env.NODE_ENV === 'development' && error && (
          <details className="mb-8 text-left">
            <summary className="cursor-pointer text-sm text-text-muted mb-2 hover:text-white transition-colors">
              🔍 Error Details (Dev Only)
            </summary>
            <div className="text-xs bg-dark-300/50 p-4 rounded-xl overflow-auto max-h-40 text-text-muted font-mono space-y-2">
              <div>
                <strong className="text-primary">Error:</strong>
                <pre className="mt-1">{error.toString()}</pre>
              </div>
              {errorInfo?.componentStack && (
                <div>
                  <strong className="text-primary">Component Stack:</strong>
                  <pre className="mt-1">{errorInfo.componentStack}</pre>
                </div>
              )}
            </div>
          </details>
        )}

        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={resetError}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-primary text-white rounded-xl hover:bg-primary/80 transition-all duration-200 font-medium"
            >
              <RefreshCw className="w-5 h-5" />
              Try Again
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGoHome}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-white/5 text-white rounded-xl hover:bg-white/10 transition-all duration-200 font-medium border border-white/10"
            >
              <Home className="w-5 h-5" />
              Go Home
            </motion.button>
          </div>
          
          {/* Optional bug report button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleReportBug}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 text-sm text-text-muted hover:text-white transition-colors"
          >
            📧 Report this issue
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default ErrorBoundary;