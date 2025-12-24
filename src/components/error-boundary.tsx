'use client';

import { Component, ReactNode } from 'react';
import { Button } from './ui/button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

interface ErrorBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error?: Error;
    errorInfo?: React.ErrorInfo;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        // Log error to console in development
        console.error('Error caught by boundary:', error, errorInfo);

        this.setState({ errorInfo });

        // In production, you could send this to an error tracking service
        // Example: Sentry.captureException(error, { extra: errorInfo });
    }

    handleReset = () => {
        this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    };

    render() {
        if (this.state.hasError) {
            // Custom fallback provided
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // Default error UI
            return (
                <div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center">
                    <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mb-6">
                        <AlertTriangle className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                    </div>

                    <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                        Something went wrong
                    </h2>

                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 max-w-md">
                        {this.state.error?.message || 'An unexpected error occurred. Please try again.'}
                    </p>

                    <div className="flex gap-3">
                        <Button
                            onClick={() => window.location.reload()}
                            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl"
                        >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Reload Page
                        </Button>

                        <Link href="/dashboard">
                            <Button variant="outline" className="rounded-xl">
                                <Home className="w-4 h-4 mr-2" />
                                Go Home
                            </Button>
                        </Link>
                    </div>

                    {/* Show stack trace in development only */}
                    {process.env.NODE_ENV === 'development' && this.state.error && (
                        <details className="mt-8 w-full max-w-lg text-left">
                            <summary className="text-gray-500 text-xs cursor-pointer hover:text-gray-700">
                                Show error details
                            </summary>
                            <pre className="mt-2 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs overflow-x-auto text-red-600 dark:text-red-400">
                                {this.state.error.stack}
                            </pre>
                        </details>
                    )}
                </div>
            );
        }

        return this.props.children;
    }
}

// Functional wrapper for easier use
export function withErrorBoundary<P extends object>(
    WrappedComponent: React.ComponentType<P>,
    fallback?: ReactNode
) {
    return function WithErrorBoundaryWrapper(props: P) {
        return (
            <ErrorBoundary fallback={fallback}>
                <WrappedComponent {...props} />
            </ErrorBoundary>
        );
    };
}
