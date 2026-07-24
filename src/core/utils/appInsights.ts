import { ApplicationInsights } from '@microsoft/applicationinsights-web';

const connectionString = import.meta.env.VITE_APPINSIGHTS_CONNECTION_STRING;
const appInsights = connectionString ? new ApplicationInsights({
  config: {
    connectionString,
    enableAutoRouteTracking: true,
    enableRequestHeaderTracking: true,
    enableResponseHeaderTracking: true,
    enableAjaxErrorStatusText: true,
    enableAjaxPerfTracking: true,
  }
}) : null;

export const initializeAppInsights = () => {
  if (!appInsights) return;
  appInsights.loadAppInsights();
  appInsights.trackPageView(); // Registra la primera carga
};

export const trackEvent = (name: string, properties?: Record<string, string | number | boolean>) => {
  if (!appInsights) return;
  appInsights.trackEvent({ name }, properties);
};

export const trackException = (error: Error, severityLevel?: number) => {
  if (!appInsights) return;
  appInsights.trackException({ exception: error, severityLevel });
};

export { appInsights };
