import { ApplicationInsights } from '@microsoft/applicationinsights-web';

const appInsights = new ApplicationInsights({
  config: {
    connectionString: import.meta.env.VITE_APPINSIGHTS_CONNECTION_STRING || 'InstrumentationKey=00000000-0000-0000-0000-000000000000',
    enableAutoRouteTracking: true,
    enableRequestHeaderTracking: true,
    enableResponseHeaderTracking: true,
    enableAjaxErrorStatusText: true,
    enableAjaxPerfTracking: true,
  }
});

export const initializeAppInsights = () => {
  appInsights.loadAppInsights();
  appInsights.trackPageView(); // Registra la primera carga
};

export const trackEvent = (name: string, properties?: Record<string, string | number | boolean>) => {
  appInsights.trackEvent({ name }, properties);
};

export const trackException = (error: Error, severityLevel?: number) => {
  appInsights.trackException({ exception: error, severityLevel });
};

export { appInsights };
