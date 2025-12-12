/*
 * OpenTelemetry Instrumentation for Delineate Frontend
 */
import { WebTracerProvider } from "@opentelemetry/sdk-trace-web";
import { getWebAutoInstrumentations } from "@opentelemetry/auto-instrumentations-web";
import { registerInstrumentations } from "@opentelemetry/instrumentation";
import { ZoneContextManager } from "@opentelemetry/context-zone";

const provider = new WebTracerProvider();

provider.register({
  contextManager: new ZoneContextManager(),
});

registerInstrumentations({
  instrumentations: [
    getWebAutoInstrumentations({
      // load custom configuration for xml-http-request instrumentation
      "@opentelemetry/instrumentation-xml-http-request": {
        propagateTraceHeaderCorsUrls: [new RegExp("http://localhost:3000.*")],
      },
      // load custom configuration for fetch instrumentation
      "@opentelemetry/instrumentation-fetch": {
        propagateTraceHeaderCorsUrls: [new RegExp("http://localhost:3000.*")],
      },
    }),
  ],
});
