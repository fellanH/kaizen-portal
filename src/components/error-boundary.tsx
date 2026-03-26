"use client";

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div
          className="flex min-h-[60vh] flex-col items-center justify-center px-6"
          style={{ fontFamily: "var(--font-aspekta)" }}
        >
          <div className="flex w-full max-w-[480px] flex-col items-start">
            <span className="text-sm font-medium tracking-[0.08em] uppercase text-[#e85325]">
              Kaizen
            </span>

            <h1 className="mt-8 text-[clamp(1.5rem,1vw+1.25rem,2rem)] font-light leading-[1.1] tracking-[-0.03em] text-foreground">
              Something went wrong
            </h1>

            <div className="mt-6 mb-4 h-px w-full overflow-hidden">
              <div className="h-full bg-[#e85325]/30" />
            </div>

            <p className="text-[clamp(0.875rem,0.07vw+0.86rem,1rem)] leading-[1.7] text-muted-foreground">
              An unexpected error occurred. Try refreshing the page, or click
              below to retry.
            </p>

            <button
              onClick={this.handleRetry}
              className="group mt-8 inline-flex items-center gap-3 text-[clamp(0.875rem,0.07vw+0.86rem,1rem)] text-foreground transition-colors duration-200"
            >
              <span className="relative">
                Try again
                <span className="absolute inset-x-0 -bottom-0.5 h-px bg-[#e85325] transition-transform duration-300 origin-left scale-x-100 group-hover:scale-x-0" />
              </span>
              <svg
                className="h-4 w-4 text-[#e85325] transition-transform duration-300 group-hover:translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
