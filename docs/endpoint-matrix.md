# Matriz de endpoints SAGRISA

La aplicación utiliza una única tabla de rutas en `src/core/api/endpoints.ts`. Los servicios no deben declarar rutas API directamente.

| Capacidad | Método | Ruta runtime | Servicio |
| --- | --- | --- | --- |
| Autenticación | POST | `/api/v1/session/login` (vía `VITE_AUTH_LOGIN_PATH`) | `LoginPage` |
| Catálogo | GET | `/api/v1/catalog/products` | `catalogService.getProducts` |
| Producto | GET | `/api/v1/catalog/products/:sku` | `catalogService.getProductBySku` |
| Producto | POST/PUT | `/api/v1/catalog/products` / `/api/v1/catalog/products/:id` | `catalogService` |
| Pedidos | GET | `/api/v1/orders` / `/api/v1/orders/:id` | `orderService` |
| Pedidos | POST/PUT | `/api/v1/orders` / `/api/v1/orders/:id` | `orderService` |
| Clientes | GET | `/clientes` (pendiente de migrar) | `customerService` |
| Cobros | GET/POST | `/cobros` (pendiente de migrar) | `cobrosService` |
| Facturas pendientes | GET | `/cobros/pending-invoices?customerId=:id` | `cobrosService` |

El dominio se configura con `VITE_API_URL`. Las respuestas autenticadas no se guardan en Cache Storage; el catálogo leído se conserva por usuario en `localforage`. Las operaciones POST, PUT y PATCH de pedidos, cobros y productos siguen gestionadas por la cola offline de `localforage`. Los errores del backend siguen el envelope `{ error: { code, message } }` y se leen desde `errorData.error?.message`.
