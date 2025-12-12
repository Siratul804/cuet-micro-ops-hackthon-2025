import React from "react";
import * as Sentry from "@sentry/react";

interface ErrorBoundaryState {
    hasError: boolean;
    error?: Error;
}

class ErrorBoundary extends React.Component<
    React.PropsWithChildren<{}>,
    ErrorBoundaryState
> {
    constructor(props: React.PropsWithChildren<{}>) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error("Error Boundary caught an error:", error, errorInfo);

        // Send error to Sentry
        Sentry.captureException(error, {
            tags: {
                section: "error-boundary",
            },
            extra: {
                errorInfo,
                componentStack: errorInfo.componentStack,
            },
        });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    padding: "40px",
                    textAlign: "center",
                    fontFamily: "Arial, sans-serif",
                    maxWidth: "600px",
                    margin: "50px auto",
                    border: "2px solid #f44336",
                    borderRadius: "8px",
                    backgroundColor: "#fff8f8"
                }}>
                    <h1 style={{ color: "#f44336", marginBottom: "20px" }}>
                        🚨 Something went wrong
                    </h1>
                    <p style={{ color: "#666", marginBottom: "20px" }}>
                        An error occurred in the application. The error has been logged and reported.
                    </p>
                    {this.state.error && (
                        <details style={{
                            textAlign: "left",
                            backgroundColor: "#f5f5f5",
                            padding: "15px",
                            borderRadius: "4px",
                            marginBottom: "20px"
                        }}>
                            <summary style={{ cursor: "pointer", fontWeight: "bold" }}>
                                Error Details
                            </summary>
                            <pre style={{
                                fontSize: "12px",
                                color: "#333",
                                marginTop: "10px",
                                whiteSpace: "pre-wrap"
                            }}>
                                {this.state.error.message}
                                {"\n\n"}
                                {this.state.error.stack}
                            </pre>
                        </details>
                    )}
                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            padding: "12px 24px",
                            backgroundColor: "#2196F3",
                            color: "white",
                            border: "none",
                            borderRadius: "6px",
                            fontSize: "16px",
                            cursor: "pointer",
                            fontWeight: "bold"
                        }}
                    >
                        🔄 Reload Page
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;