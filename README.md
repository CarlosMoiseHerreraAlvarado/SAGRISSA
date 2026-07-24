# SAGRISA PWA

Frontend mobile-first de SAGRISA. La identidad, permisos y datos de negocio se reciben mediante APIM; el frontend no accede directamente a Dynamics ni SQL.

## Desarrollo local

```bash
npm install
npm run dev
```

Para validar producción:

```bash
npm run lint
npm run build
```

## Roles y sesión

El acceso visible usa DUI + PIN y consume `POST /v1/auth/login`. Los permisos efectivos vienen en la respuesta de sesión y se validan en navegación, rutas y acciones. No hay fallback silencioso a vendedor ni credenciales persistidas en `localStorage`.

## PWA y offline

VitePWA registra un único service worker. El app shell se precarga; catálogo y consultas usan red con caché de respaldo. Solo pedidos y cobros del vendedor pueden encolarse offline. La interfaz muestra explícitamente pendiente, sincronizando, sincronizado o error.

## Contrato para backend/APIM

El contrato versionado está en [docs/openapi/sagrisa-v1.yaml](docs/openapi/sagrisa-v1.yaml). La configuración de ambientes y variables se documenta en [docs/ENVIRONMENTS.md](docs/ENVIRONMENTS.md).
