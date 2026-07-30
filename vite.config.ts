import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiUrl = (env.VITE_API_URL || 'https://sagrissa-bac.onrender.com').replace(/\/$/, '');
  const parsedApiUrl = new URL(apiUrl);
  const apiPrefix = `${parsedApiUrl.origin}${parsedApiUrl.pathname.replace(/\/$/, '')}`;
  const escapedApiPrefix = apiPrefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const apiPathPattern = new RegExp(`^${escapedApiPrefix}/(productos|pedidos|clientes|cobros)(?:/|$)`, 'i');

  return {
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        devOptions: { enabled: true },
        manifest: {
          name: 'SAGRISA',
          short_name: 'SAGRISA',
          description: 'Plataforma comercial SAGRISA',
          lang: 'es-SV',
          start_url: '/onboarding',
          scope: '/',
          theme_color: '#00A9F4',
          background_color: '#ffffff',
          display: 'standalone',
          icons: [
            { src: '/icons/icon-192.svg', sizes: '192x192', type: 'image/svg+xml', purpose: 'any maskable' },
            { src: '/icons/icon-512.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'any maskable' },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest}'],
          navigateFallback: '/index.html',
          runtimeCaching: [
            { urlPattern: apiPathPattern, handler: 'NetworkFirst', options: { cacheName: 'sagrissa-api-read', networkTimeoutSeconds: 5, cacheableResponse: { statuses: [0, 200] } } },
          ],
        },
      }),
    ],
  };
});
