import React from "react";

/**
 * ErrorBoundary Component
 *
 * Catches JavaScript errors anywhere in their child component tree,
 * logs those errors, and displays a fallback UI.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-rose-50 rounded-lg border border-rose-200">
          <h2 className="text-lg font-semibold text-rose-700 mb-2">
            Something went wrong
          </h2>
          <p className="text-sm text-rose-600">
            {this.state.error?.message ||
              "An error occurred while rendering this component."}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-4 px-4 py-2 bg-rose-100 text-rose-700 rounded-md text-sm font-medium hover:bg-rose-200 transition-colors"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
