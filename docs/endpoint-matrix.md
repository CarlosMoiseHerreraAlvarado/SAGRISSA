# Matriz de endpoints SAGRISA

La aplicación utiliza una única tabla de rutas en `src/core/api/endpoints.ts`. Los servicios no deben declarar rutas API directamente.

| Capacidad | Método | Ruta runtime | Servicio |
| --- | --- | --- | --- |
| Catálogo | GET | `/productos` | `catalogService.getProducts` |
| Producto | GET | `/productos/:sku` | `catalogService.getProductBySku` |
| Producto | POST/PUT | `/productos` / `/productos/:id` | `catalogService` |
| Pedidos | GET | `/pedidos` / `/pedidos/:id` | `orderService` |
| Pedidos | POST/PUT | `/pedidos` / `/pedidos/:id` | `orderService` |
| Clientes | GET | `/clientes` | `customerService` |
| Cobros | GET/POST | `/cobros` | `cobrosService` |
| Facturas pendientes | GET | `/cobros/pending-invoices?customerId=:id` | `cobrosService` |

El dominio se configura con `VITE_API_URL`. Las respuestas autenticadas no se guardan en Cache Storage; el catálogo leído se conserva por usuario en `localforage`. Las operaciones POST, PUT y PATCH de pedidos, cobros y productos siguen gestionadas por la cola offline de `localforage`.
