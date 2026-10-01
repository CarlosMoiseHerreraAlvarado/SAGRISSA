# Reporte de Arquitectura e Integración Técnica: SAGRISA

## 1. Resumen Ejecutivo
El presente informe consolida el diseño arquitectónico objetivo para la modernización de la plataforma multicanal de SAGRISA, junto con el análisis técnico forense del entorno de base de datos legado (`SAGRI_MOVIL`). La nueva plataforma reemplaza un modelo frágil con múltiples puntos de integración improvisados por un ecosistema gobernable compuesto por una aplicación web progresiva (React PWA), un gateway central (Azure API Management), servicios de negocio en ASP.NET Core, una capa de datos de consulta (Mirror SQL) y la conexión oficial de transacciones con Dynamics 365. El documento expone la realidad operativa actual, las brechas con la nueva API y las recomendaciones estratégicas para mitigar riesgos.

## 2. Arquitectura Objetivo
La arquitectura se enfoca en separación de responsabilidades y seguridad:
- **Capa de Experiencia (React PWA):** Frontend unificado multiplataforma para todos los perfiles de usuario, evitando lógicas de presentación duplicadas.
- **Exposición y Gobierno (Azure APIM):** Puerta de entrada única que gestiona políticas, límites y validación inicial de identidades.
- **Servicios de Negocio (ASP.NET Core Web APIs):** Centralizan las reglas de negocio, autorizaciones y cálculos. Documentados siempre con OpenAPI/Swagger.
- **Mirror SQL (Capa de Consulta):** Base de datos espejo dedicada a lecturas intensivas (catálogos, históricos). Es **estrictamente de solo lectura (read-only)** para las aplicaciones.
- **Sistema Transaccional (Dynamics 365 y sistemas fuente):** Mantienen la "única verdad". Toda escritura transaccional recae sobre ellos.
- **Autenticación (Microsoft Entra ID) y Observabilidad (Application Insights):** Proveen el modelo de seguridad unificado y monitoreo integral centralizado.

## 3. Modelo de Roles y Flujos
La plataforma identifica 5 roles principales, controlados funcionalmente desde los tokens JWT emitidos por el proveedor de identidad corporativo:
* **Cliente:** Perfil de consulta. Visualiza estado de cuenta, historial, facturas y saldo propios.
* **Vendedor:** Perfil operativo con alta agilidad. Realiza búsqueda de clientes, gestión de inventario, creación de pedidos y captura de cobros.
* **Supervisor:** Perfil mixto de operación y seguimiento. Visualiza cobros y pedidos de su equipo.
* **Gerente:** Perfil táctico y aprobador. Gestiona autorizaciones formales (aprobación/denegación/anulación) e inventario.
* **Director:** Perfil ejecutivo para lectura estratégica de agregados regionales, ventas y tableros.

## 4. Análisis de la Integración con el Sistema Legacy (`SAGRI_MOVIL`)
El análisis forense identificó que `SAGRI_MOVIL` es un entorno híbrido con 76 Stored Procedures activos:
- **Modelo Híbrido de Datos:** Combina tablas sin llaves primarias/foráneas (mirrors de réplica masiva desde Dynamics GP, ej. `PedidoEncabezado`) con tablas operativas con restricciones (ej. `Cobro`, `SAGPagosEncabezado`).
- **Precios e Inventario:** Operación basada en un cruce complejo entre `TSAGPreciosEnLinea` (datos fiscales/impuestos) y listas pactadas `WS_ClienteListPrecio`. 
- **Modelo de Cobros (1:N):** Implementa cobros en dos fases: captura física (`Cobro`) y la imputación contable donde un pago amortiza múltiples facturas simultáneamente (`SAGPagosDetalle`).
- **Autenticación Dispersa:** Tres canales legados: Interno (texto plano), Vendedores (PIN en `UsuariosMovil`), y Clientes Web (contraseñas simétricas con hardcode `SAG`).
- **Facturación Asíncrona:** Ciclo delegado a macros de GP (SOP_Entry) y notificaciones manejadas vía colas de email con `sp_send_dbmail`.

## 5. Las Brechas Críticas Identificadas
Al contrastar el legacy con la nueva API (`sagrisa-v1.yaml`), resaltan los siguientes *Gaps*:

> [!WARNING]
> - **Precios Multi-País:** La API actual solo provee un campo `precio`, omitiendo variables fiscales, descuentos pactados, y resolución cruzada entre países.
> - **Cobros Multi-Factura (1:N):** La API solo acepta un `invoiceId` individual, ignorando que un pago en campo puede liquidar *N* facturas.
> - **Estados de Cobro Reducidos:** Legacy maneja 7 estados granulares (P, R, Y, Z, A, C, X) pero la API solo 3, lo cual reduce gravemente la visibilidad operativa del vendedor.
> - **Receptores de Entrega:** Falta de campos en la API para modelar destinatarios que no son titulares de la cuenta en el sector agropecuario.
> - **Segmentación por Área:** La API no modela las 5 áreas de negocio (Agrícola, Veterinaria, Industrial, etc.) vitales para la analítica gerencial.
> - **Cola de Notificaciones:** Falta de integración robusta de la API con emails transaccionales confirmando facturación a los vendedores.
> - **Trazabilidad de Origen:** La API carece de estandarización en el envío del canal de origen (PWA, Portal, etc.) para auditoría de pedidos.

## 6. Recomendaciones de Diseño y Próximos Pasos

> [!IMPORTANT]
> 1. **Rediseñar Contrato API de Cobros:** Actualizar `RegisterPaymentInput` para aceptar arreglos de `invoiceIds` con montos aplicados, dando soporte al modelo 1:N real.
> 2. **Expandir el Contrato de Precios:** Integrar las dimensiones fiscales y de áreas de negocio dentro de `BackendProducto` y endpoints paramétricos.
> 3. **Unificar la Identidad de Inmediato:** Descartar los 3 canales frágiles legados y delegar completamente a Microsoft Entra ID.
> 4. **Alinear Trazabilidad y Estados:** Adaptar la PWA y los *enums* de la API para visualizar los 7 estados de cobro e incorporar el campo obligatorio de `origen` en las transacciones.
> 5. **Aplicar Reglas en Backend, No en UI:** Toda regla de resolución de precios y transiciones de estado debe resolverse en ASP.NET Core, limitando la PWA a funciones presentacionales y de pre-validación simple.
