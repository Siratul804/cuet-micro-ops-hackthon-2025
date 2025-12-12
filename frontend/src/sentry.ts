import * as Sentry from "@sentry/react";

export const initSentry = () => {
  const dsn = import.meta.env.VITE_SENTRY_DSN;

  // Only initialize if DSN is provided
  if (dsn) {
    console.log("Initializing Sentry with DSN");
    Sentry.init({
      dsn,
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration(),
      ],
      // Performance Monitoring
      tracesSampleRate: 1.0,
      // Session Replay
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
      // Environment
      environment: import.meta.env.MODE,
      // Additional context
      beforeSend(event) {
        console.log("Sentry capturing event:", event);
        return event;
      },
    });
  } else {
    console.log("Sentry DSN not provided - running without Sentry");
    // Create mock functions for development
    if (!window.Sentry) {
      window.Sentry = {
        captureException: (error: any, context?: any) => {
          console.log("Mock Sentry - Error captured:", error, context);
        },
        captureMessage: (message: string, context?: any) => {
          console.log("Mock Sentry - Message captured:", message, context);
        },
      };
    }
  }
};
