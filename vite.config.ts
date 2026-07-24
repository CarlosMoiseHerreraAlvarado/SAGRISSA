import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
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
          { src: '/icons/icon-192.svg', sizes: '192x192', type: 'image/svg+xml' },
          { src: '/icons/icon-512.svg', sizes: '512x512', type: 'image/svg+xml' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest}'],
        navigateFallback: '/index.html',
        runtimeCaching: [
          { urlPattern: /\/catalog\/products/i, handler: 'NetworkFirst', options: { cacheName: 'sagrissa-catalog', networkTimeoutSeconds: 5 } },
          { urlPattern: /\/accounts\//i, handler: 'NetworkFirst', options: { cacheName: 'sagrissa-account', networkTimeoutSeconds: 5 } },
        ],
      },
    }),
  ],
});
