import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { initSentry } from "./sentry";
import ErrorBoundary from "./ErrorBoundary";
import "./index.css";
import App from "./App.tsx";

// Initialize Sentry
initSentry();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
