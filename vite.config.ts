import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        devOptions: { enabled: false },
        manifest: {
          name: 'SAGRISA',
          short_name: 'SAGRISA',
          description: 'Plataforma comercial SAGRISA',
          lang: 'es-SV',
          start_url: '/',
          scope: '/',
          theme_color: '#00A9F4',
          background_color: '#ffffff',
          display: 'standalone',
          icons: [
            { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
            { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest}'],
          navigateFallback: '/index.html',
          // Las respuestas autenticadas se gestionan por localforage y no se
          // guardan en Cache Storage para evitar mezclar sesiones.
          runtimeCaching: [],
        },
      }),
    ],
});
