'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home, FileWarning, ServerCrash, Copy, Check } from 'lucide-react';
import Link from 'next/link';
import { logError } from '@/lib/errors';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Log the error
    logError(error, {
      digest: error.digest,
      source: 'app-error-boundary',
    });
  }, [error]);

  const copyError = async () => {
    const errorText = `Error: ${error.message}\nError ID: ${error.digest || 'N/A'}\n\nStack Trace:\n${error.stack}`;
    try {
      await navigator.clipboard.writeText(errorText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Determine error type and provide specific messaging
  const getErrorDetails = () => {
    const errorMessage = error.message?.toLowerCase() || '';
    
    if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
      return {
        icon: ServerCrash,
        title: 'Connection Error',
        description: 'Unable to connect to our servers. Please check your internet connection and try again.',
        showRetry: true,
      };
    }
    
    if (errorMessage.includes('not found') || errorMessage.includes('404')) {
      return {
        icon: FileWarning,
        title: 'Page Not Found',
        description: 'The page you\'re looking for doesn\'t exist or has been moved.',
        showRetry: false,
      };
    }
    
    return {
      icon: AlertTriangle,
      title: 'Something went wrong',
      description: 'An unexpected error occurred. Our team has been notified and is working on a fix.',
      showRetry: true,
    };
  };

  const { icon: Icon, title, description, showRetry } = getErrorDetails();

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Icon className="h-6 w-6 text-destructive" />
            <CardTitle className="text-xl">{title}</CardTitle>
          </div>
          <CardDescription className="mt-2">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <p>Here are some things you can try:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Refresh the page</li>
                <li>Check your internet connection</li>
                <li>Clear your browser cache</li>
                <li>Try again in a few minutes</li>
              </ul>
            </div>
            
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-4 p-4 bg-muted rounded-lg">
                <summary className="cursor-pointer text-sm font-medium flex items-center justify-between">
                  <span>Developer Details</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      copyError();
                    }}
                    className="ml-2"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3 w-3 mr-1" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3 mr-1" />
                        Copy Error
                      </>
                    )}
                  </Button>
                </summary>
                <div className="mt-2 space-y-2">
                  <p className="text-xs font-mono">{error.message}</p>
                  {error.digest && (
                    <p className="text-xs text-muted-foreground">
                      Error ID: {error.digest}
                    </p>
                  )}
                  <pre className="text-xs overflow-auto max-h-40 p-2 bg-background rounded">
                    {error.stack}
                  </pre>
                </div>
              </details>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-2">
          {showRetry && (
            <Button onClick={reset} className="w-full sm:w-auto">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          )}
          <Link href="/dashboard" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full">
              <Home className="mr-2 h-4 w-4" />
              Go to Dashboard
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}