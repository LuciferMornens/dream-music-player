'use client';
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-surface-950 relative">
          {/* Background effects */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-accent-500/10 rounded-full blur-3xl animate-float"
                 style={{ animationDelay: '0s' }} />
            <div className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-primary-500/10 rounded-full blur-3xl animate-float"
                 style={{ animationDelay: '-3s' }} />
          </div>

          <div className="relative z-10">
            <div className="glass rounded-xl p-8 max-w-md w-full hover-card">
              {/* Error icon */}
              <div className="w-16 h-16 mx-auto mb-6 relative">
                <div className="absolute inset-0 bg-accent-500/20 rounded-full blur-xl animate-pulse-subtle" />
                <div className="relative w-full h-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-accent-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              </div>

              <h1 className="text-2xl font-bold cosmic-text text-center mb-4">
                Oops! Something went wrong
              </h1>
              
              <p className="text-surface-300 mb-6 text-center">
                {this.state.error?.message || 'An unexpected error occurred'}
              </p>
              
              <div className="flex justify-center">
                <button
                  onClick={() => window.location.reload()}
                  className="relative group px-6 py-2 rounded-full overflow-hidden"
                >
                  {/* Button background */}
                  <div className="absolute inset-0 bg-gradient-neon opacity-90 group-hover:opacity-100 transition-opacity" />
                  
                  {/* Button content */}
                  <span className="relative z-10 flex items-center text-white">
                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Reload Page
                  </span>
                  
                  {/* Button glow effect */}
                  <div className="absolute inset-0 -z-10 bg-gradient-neon opacity-0 group-hover:opacity-50 blur-lg transition-opacity" />
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}