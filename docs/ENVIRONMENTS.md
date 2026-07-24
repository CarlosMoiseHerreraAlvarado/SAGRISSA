# Ambientes SAGRISA

La aplicación se configura por variables de entorno Vite. El backend debe publicar el mismo contrato OpenAPI mediante APIM.

| Ambiente | `VITE_API_URL` | Uso |
| --- | --- | --- |
| Desarrollo | `https://sagrissa-bac.onrender.com` | Desarrollo local y pruebas de integración |
| QA | `https://api-qa.sagrissa.com/v1` | Validación funcional, responsive y E2E |
| Producción | `https://api.sagrissa.com/v1` | Operación real |

Variables opcionales:

- `VITE_APPINSIGHTS_CONNECTION_STRING`: telemetría de frontend.
- `VITE_API_URL`: base del backend/APIM; si no se define, usa `https://sagrissa-bac.onrender.com`.
- `VITE_AUTH_LOGIN_PATH`: ruta publicada por el backend para login; en Render usa `/api/auth/login`.

El frontend no debe recibir secretos de backend, conexiones SQL, credenciales de Dynamics ni claves privadas. Los tokens de sesión se mantienen en memoria/session storage controlado hasta que APIM/backend entregue renovación segura.

## Criterios de publicación

1. Verificar `npm run lint` y `npm run build`.
2. Confirmar que APIM expone `/v1` y que CORS permite el dominio del ambiente.
3. Confirmar autenticación DUI + PIN, permisos, alcance y expiración de sesión.
4. Validar sincronización offline únicamente para pedidos y cobros del vendedor.
5. Revisar Application Insights, correlación `X-Correlation-Id` y errores 401/403/409/5xx.
