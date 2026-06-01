'use client';

import React, { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';
import { logError } from '@/lib/errors';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, errorInfo: React.ErrorInfo, resetError: () => void) => ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log the error
    logError(error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: true,
    });

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    // Update state with error info
    this.setState({
      error,
      errorInfo,
    });
  }

  resetError = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError && this.state.error && this.state.errorInfo) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.state.errorInfo, this.resetError);
      }

      // Default error UI
      return (
        <div className="min-h-[400px] flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <CardTitle>Something went wrong</CardTitle>
              </div>
              <CardDescription>
                We encountered an unexpected error. Please try again or contact support if the problem persists.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {process.env.NODE_ENV === 'development' && (
                <details className="mt-4 p-4 bg-muted rounded-lg text-sm">
                  <summary className="cursor-pointer font-medium">Error details</summary>
                  <pre className="mt-2 whitespace-pre-wrap text-xs">
                    {this.state.error.toString()}
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button onClick={this.resetError} variant="default">
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
              <Link href="/dashboard">
                <Button variant="outline">
                  <Home className="mr-2 h-4 w-4" />
                  Go to Dashboard
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook for error handling in functional components
export function useErrorHandler() {
  return (error: Error, errorInfo?: { componentStack?: string }) => {
    logError(error, {
      ...errorInfo,
      source: 'useErrorHandler',
    });
  };
}

// Error Fallback Component for specific use cases
export function ErrorFallback({ 
  error, 
  resetError,
  className = "",
}: { 
  error: Error; 
  resetError: () => void;
  className?: string;
}) {
  return (
    <div className={`flex flex-col items-center justify-center p-4 ${className}`}>
      <AlertCircle className="h-12 w-12 text-destructive mb-4" />
      <h3 className="text-lg font-semibold mb-2">Oops! Something went wrong</h3>
      <p className="text-muted-foreground text-center mb-4 max-w-md">
        We are sorry for the inconvenience. Please try refreshing the page or contact support if the issue persists.
      </p>
      <div className="flex gap-2">
        <Button onClick={resetError} variant="default">
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
        <Link href="/dashboard">
          <Button variant="outline">
            <Home className="mr-2 h-4 w-4" />
            Dashboard
          </Button>
        </Link>
      </div>
      {process.env.NODE_ENV === 'development' && (
        <details className="mt-4 p-4 bg-muted rounded-lg text-sm max-w-2xl">
          <summary className="cursor-pointer font-medium">Error details</summary>
          <pre className="mt-2 whitespace-pre-wrap text-xs overflow-auto">
            {error.toString()}
            {error.stack}
          </pre>
        </details>
      )}
    </div>
  );
}