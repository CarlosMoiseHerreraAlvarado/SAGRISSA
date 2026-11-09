# Guía de análisis y paso a producción de SAGRISA

**Versión:** 1.0  
**Fecha de corte:** 15 de octubre de 2026  
**Uso:** guía interna para planificar, preparar y aprobar el despliegue del frontend y backend de SAGRISA.  
**Principio:** no se considera producción por tener una pantalla, una API desplegada o un respaldo disponible. Cada etapa requiere evidencia y aprobación.

## 1. Objetivo

Pasar la PWA y la API a producción de forma coordinada, con datos correctos, accesos por rol, operaciones trazables y un mecanismo probado para detener o revertir el cambio si algo sale mal.

La salida tiene dos planos que deben llegar juntos:

- **Frontend:** experiencia para Cliente, Vendedor, Supervisor, Gerente y Director; publicación de la PWA, configuración por ambiente y manejo seguro de sesión.
- **Backend y datos:** autenticación, permisos, reglas de negocio, consultas autorizadas, conexión con la base aprobada y envío de operaciones al sistema transaccional oficial.

No se debe activar una operación de escritura solo porque su pantalla o endpoint ya exista.

## 2. Arquitectura objetivo

La arquitectura definida para el proyecto establece:

```text
PWA React
   │ HTTPS
   ▼
API ASP.NET Core
   ├── consultas ──► base espejo SQL (solo lectura)
   └── escrituras ─► Dynamics 365 / sistema transaccional aprobado

Identidad: Microsoft Entra ID
Contrato: OpenAPI / Swagger
Monitoreo: Application Insights
```

La API es la frontera de seguridad y negocio. El frontend no se conecta directamente a SQL ni al sistema transaccional. La base espejo sirve para consultas; las escrituras oficiales deben ir al sistema que SAGRISA confirme.

La Fuente Técnica Maestra V2 y el Entregable 1 describen esta arquitectura. Documentos previos de ambientes todavía mencionan un gateway externo y rutas distintas. Antes de desplegar, debe existir una única definición aprobada para arquitectura, URL base, versión y rutas de API.

## 3. Estado actual comprobado y límites

### Frontend

- Existe una PWA en React/TypeScript con rutas y pantallas de los cinco perfiles.
- Carlos informa que realizó cambios para los cinco perfiles y que funcionan; se deben conservar las capturas y pasos de prueba que sustenten esa afirmación.
- La configuración de publicación contiene una reescritura para navegación de una SPA y Vite genera el manifiesto/service worker de la PWA.
- El servicio HTTP obtiene la URL de la API desde una variable de entorno. Si falta, usa una ruta relativa; si la URL termina en `/api`, la conserva, y si no, agrega `/api`.
- La documentación de ambientes menciona una ruta de producción versionada que no parece coincidir con esa normalización. Hay que confirmar el valor final y probar cada ruta antes de generar la versión productiva.
- El frontend puede encolar ciertas escrituras cuando pierde conexión. No se debe habilitar operación offline real hasta probar deduplicación, reintentos, conciliación, recuperación y protección ante envío duplicado.
- La PWA tiene actualización automática de assets. Verificar el comportamiento con una sesión activa y formularios con cambios pendientes antes de publicar.

### Backend

- Existe una API ASP.NET Core sobre .NET 8, con controladores de autenticación, clientes, productos, pedidos, facturas, cobros, cuentas y gestión.
- Hay un Dockerfile de .NET 8 y un perfil de publicación que apunta a un entorno de prueba. Eso no demuestra que la API esté desplegada, configurada o validada para producción.
- También existe una plantilla de infraestructura antigua para una Function App con .NET 3.1. **No reutilizarla para desplegar esta API.**
- El backend aplica actualmente autenticación JWT propia basada en credenciales DUI/PIN. La identidad corporativa definida como objetivo no se encuentra confirmada como integración terminada.
- La API exige configuración de clave JWT e issuer/audience en producción, exige CORS configurado y fija un proveedor de datos específico. La implementación de infraestructura inspeccionada no registra el proveedor SQL Server descrito como destino. La API no está lista para conectarse a ese destino sin completar y verificar esa adaptación.
- Swagger se habilita en la raíz de la API. Debe protegerse o limitarse en producción.
- No se encontró evidencia de un pipeline automatizado de construcción y despliegue en los archivos de automatización revisados. Definir quién publica, desde qué versión y con qué aprobaciones.

### Datos

- El archivo entregado `Movil.rar` contiene un respaldo válido `Movil.bak`, fechado el 1 de septiembre de 2026.
- El respaldo se examinó de forma aislada consultando metadatos y luego se eliminó la restauración temporal. Se observaron 117 tablas, 67 vistas, 83 procedimientos, 2 funciones, 4 triggers, 4 claves foráneas y 102 tablas sin clave primaria.
- Su contenido es híbrido y tiene dependencias externas. Es un respaldo puntual; no demuestra una réplica actualizada ni de solo lectura.
- Existen scripts propuestos para crear y validar un esquema de staging, pero no equivalen a una migración completa ni prueban conexión desde la API.
- El mapeo entre el modelo heredado y las entidades nuevas está pendiente de validación. No restaurar ni ejecutar todo el legado directamente en producción.

### Validación de usuarios

- Carlos reporta que los cinco perfiles ya fueron modificados y que los recorridos funcionan.
- La prueba interna debe quedar registrada por perfil, con ambiente, pasos, resultado y captura anonimizada.
- La revisión de Francisco y Roberto permanece pendiente. No reportar aceptación de SAGRISA hasta recibirla.

## 4. Decisiones que bloquean el plan definitivo

Resolver estas decisiones antes de preparar producción:

| Decisión | Confirmación necesaria | Responsable sugerido |
| --- | --- | --- |
| Hosting del frontend | La documentación objetivo propone Azure Static Web Apps, pero existe configuración de publicación para otra plataforma. Confirmar servicio productivo, dominio, CDN, despliegue y propietario. | Arquitectura / infraestructura |
| Hosting de la API | La documentación objetivo propone Azure App Service. Confirmar servicio .NET 8, región, plan, redes, TLS, escalado, disponibilidad y responsable operativo. | Infraestructura |
| URL y contrato API | Definir una sola URL base y si las rutas usan `/api` o `/v1`; alinear frontend, backend y OpenAPI. | Frontend + backend |
| Base de consultas | Confirmar si hay una base espejo vigente, su esquema, actualización, permisos de solo lectura y dueño. | SAGRISA / datos |
| Sistema de escrituras | Confirmar servicio autorizado para pedidos, cobros, aprobaciones y anulaciones. | SAGRISA / arquitectura |
| Identidad | Confirmar integración corporativa, roles, claims, altas/bajas, recuperación y soporte. | SAGRISA / seguridad |
| Ambientes | Acordar nombres, dominios, datos permitidos y responsables de Desarrollo, QA/Staging y Producción. | Proyecto / infraestructura |
| Aceptación | Definir criterios y persona que firma la aceptación por cada rol y flujo. | SAGRISA / responsable funcional |

No decidir hosting o contrato por la presencia de un archivo de despliegue. La persona responsable de infraestructura debe confirmar acceso, propiedad, configuración y soporte.

## 5. Ruta de producción por etapas

### Etapa 0 — Alinear alcance y congelar la línea base

1. Nombrar un responsable para frontend, backend, datos, identidad, infraestructura y aceptación.
2. Confirmar qué versión se considera candidata; preservar los cambios locales actuales del backend y evitar que varios programadores publiquen desde estados distintos.
3. Aprobar la arquitectura vigente, los dominios/URL, las rutas, la versión del contrato y los roles.
4. Clasificar cada flujo como consulta, escritura, aprobación o acción offline.
5. Registrar todo lo que todavía depende de SAGRISA.

**Salida requerida:** alcance de producción aprobado, responsables nombrados y lista de bloqueos.

### Etapa 1 — Preparar Desarrollo y Staging

1. Crear ambientes separados de producción, con configuración propia y datos autorizados.
2. Configurar TLS, dominios, CORS estrictamente limitado, variables por ambiente y mecanismo de secretos seguro.
3. Confirmar la disponibilidad de la base espejo autorizada y sus accesos mínimos de solo lectura.
4. Confirmar el servicio del sistema transaccional para pruebas; usar cuentas y datos ficticios o anonimizados.
5. Configurar logs, correlation ID, métricas, alertas y health checks de API y dependencias.
6. Restringir Swagger en ambientes públicos y revisar encabezados, CORS y política de errores.

**Salida requerida:** staging aislado y observable; nunca usar datos reales hasta que SAGRISA autorice propósito, privacidad y accesos.

### Etapa 2 — Completar y desplegar el backend en Staging

1. Implementar el proveedor de datos compatible con el destino SQL aprobado y separar consultas de solo lectura de escrituras oficiales.
2. Eliminar la contradicción entre la configuración de producción, el proveedor usado por infraestructura y la documentación de la base de staging.
3. Revisar autenticación y autorización: claims, roles, alcance por cliente/equipo/país, expiración, revocación y acceso denegado.
4. Integrar el proveedor de identidad objetivo o aprobar formalmente el mecanismo temporal y sus límites.
5. Revisar todos los controladores y servicios: validación, errores, paginación, transacciones, auditoría, idempotencia y límites de tasa.
6. Proteger Swagger, restringir CORS a los dominios reales y configurar secretos fuera del código.
7. Asegurar health checks separados para disponibilidad de API y disponibilidad de base/servicios.
8. Construir y publicar una versión Release identificable, con commit/tag y aprobación.
9. Verificar endpoints, OpenAPI y logs usando solo datos de staging.

**Salida requerida:** API desplegada en staging, versión identificada, configuración revisada y pruebas documentadas.

### Etapa 3 — Completar y desplegar el frontend en Staging

1. Confirmar el proveedor de hosting y registrar dominios de prueba y producción.
2. Configurar URL de API, ruta de login y telemetría por ambiente. Confirmar si el host agrega o no prefijos de ruta.
3. Hacer coincidir endpoints y formatos del frontend con OpenAPI.
4. Revisar que no se incluya ningún secreto en variables compiladas del cliente. Las variables `VITE_*` terminan disponibles en el navegador.
5. Validar instalación PWA, manifest, iconos, navegación directa a rutas internas, actualizaciones y logout.
6. Revisar manejo de 401/403/409/5xx, errores de red, sesión expirada, reintentos y descargas.
7. Revisar almacenamiento local y cola offline: solo conservar datos estrictamente necesarios, proteger la separación entre usuarios y evitar reenvíos duplicados.
8. Ejecutar lint y build de producción; guardar resultado y artefacto asociado a la versión.
9. Publicar en staging y comprobar la versión realmente servida, no solo el resultado local.

**Salida requerida:** PWA de staging conectada únicamente a la API de staging, con artefacto y configuración identificables.

### Etapa 4 — Validación funcional, técnica y de seguridad

Ejecutar pruebas integrales desde el navegador y desde la API:

- Acceso permitido y denegado para Cliente, Vendedor, Supervisor, Gerente y Director.
- Alcance de cada usuario: un cliente no consulta otra cuenta; un vendedor no ve carteras ajenas; un supervisor/gerente/director ve solo el ámbito autorizado.
- Flujos de lectura: catálogo, cuenta, facturas, pedidos e informes habilitados.
- Flujos de escritura: pedido y cobro en entorno de prueba, con confirmación de resultado en el sistema oficial.
- Cobro aplicado a una y varias facturas; estados, montos, redondeo, errores y reintentos.
- Aprobación, rechazo y prevención de doble decisión, si está dentro del alcance confirmado.
- Operación offline: guardar, recuperar conexión, sincronizar una sola vez, resolver conflicto y recuperar una cola fallida.
- Límites de API, CORS, TLS, errores controlados, expiración de sesión, auditoría y protección de información.
- Navegación móvil, PWA instalada, actualización durante sesión y recuperación tras reinicio.
- Carga y tiempos de respuesta acordados con negocio.
- Restauración de respaldo y reversión ensayadas en staging cuando haya cambios de esquema.

Las evidencias deben contener fecha, versión, ambiente, pasos, esperado/observado y resultado. No usar capturas con DUI, PIN, tokens, datos personales ni secretos.

**Salida requerida:** checklist firmado por responsables técnicos y funcionales, incidencias clasificadas y bloqueos cerrados o aceptados formalmente.

### Etapa 5 — UAT y aceptación de SAGRISA

1. Entregar a Francisco, Roberto y demás usuarios nombrados una versión de staging estable.
2. Explicar perfiles, datos de prueba y escenarios incluidos.
3. Registrar observaciones, responsable y prioridad.
4. Repetir pruebas tras las correcciones.
5. Obtener aceptación explícita de los flujos acordados; dejar lo no respondido como pendiente.

**Salida requerida:** aceptación escrita por perfil/flujo o acta de pendientes aprobados con impacto y fecha.

### Etapa 6 — Preparar la ventana productiva

Antes de publicar:

- Aprobar ventana, responsable de despliegue y contacto de soporte.
- Congelar cambios y etiquetar versiones de frontend y backend compatibles.
- Confirmar respaldo de base, configuración y plan de restauración.
- Revisar migraciones: revisión del SQL, ensayo en staging, orden, duración y reversión.
- Preparar secretos, certificados, dominios, CORS, identidad y conexiones con mínimo privilegio.
- Definir umbrales para detener el despliegue y criterio de rollback.
- Avisar a usuarios afectados y coordinar disponibilidad de SAGRISA.
- Confirmar que producción no usará datos de demostración, repositorios en memoria ni cuentas de prueba.

### Etapa 7 — Publicación controlada y verificación

1. Publicar API y frontend con versiones compatibles, siguiendo el orden acordado.
2. Ejecutar smoke tests de solo lectura primero.
3. Verificar autenticación y navegación por rol.
4. Confirmar health checks, logs, errores, latencia y conexión con cada dependencia.
5. Habilitar escrituras por etapas únicamente con autorización del dueño funcional.
6. Vigilar duplicados, errores, cola offline y discrepancias de datos.
7. Registrar quién aprobó, qué versiones se desplegaron, hora y resultado.
8. Si se cumple una condición de parada, deshabilitar operaciones afectadas y ejecutar el plan de rollback aprobado.

No probar en producción con cobros, pedidos o aprobaciones ficticias que puedan afectar el sistema real.

### Etapa 8 — Soporte posterior

Durante el periodo acordado:

- Revisar métricas y alertas; clasificar incidentes por impacto.
- Comparar operaciones procesadas con la fuente oficial.
- Confirmar que los backups y la recuperación funcionan.
- Publicar un reporte de estabilidad y pendientes.
- Cerrar la transición solo cuando negocio, soporte e infraestructura acepten la operación.

## 6. Criterios de parada

No pasar a la siguiente etapa si se presenta cualquiera de estas condiciones:

- No se sabe qué fuente es oficial para lectura o escritura.
- La API no puede conectarse al destino de datos aprobado.
- El frontend apunta a una URL o prefijo de rutas no confirmado.
- Un rol puede consultar o modificar información fuera de su alcance.
- El sistema puede registrar dos veces un pedido/cobro al reintentar.
- Las operaciones offline pueden sincronizarse sin control de duplicidad.
- Hay secretos en el código, bundle, repositorio o capturas.
- La documentación y la configuración de producción se contradicen.
- No existe respaldo verificable o plan de reversión.
- La aceptación funcional o la autorización de escrituras siguen pendientes.

## 7. Matriz de responsabilidades

| Área | Responsable principal | Apoyo | Evidencia esperada |
| --- | --- | --- | --- |
| PWA, rutas y experiencia por perfil | Programador frontend | Carlos y responsable funcional | Build, matriz de perfiles, capturas anonimizadas |
| API, contratos y permisos | Programador backend | Arquitectura y seguridad | OpenAPI, pruebas por rol, logs y decisiones |
| Modelo y mapeo de datos | Programador asignado a datos | SAGRISA y backend | Diccionario, mapeo, conciliación aprobada |
| Hosting, DNS, certificados y pipelines | Infraestructura | Backend y frontend | Configuración por ambiente y registro de despliegue |
| Aceptación de negocio | SAGRISA | Carlos | Evidencia firmada por flujo y perfil |
| Coordinación y control de cambios | Carlos | Todo el equipo | Versión candidata, bloqueos, decisiones y reporte |

Los nombres se deben sustituir por responsables confirmados. No asignar decisiones de arquitectura o accesos productivos a quien no sea dueño de esa área.

## 8. Checklist ejecutivo antes de autorizar Producción

### Frontend
- [ ] Host y dominio aprobados.
- [ ] URL base y rutas confirmadas con OpenAPI.
- [ ] Build de Release y artefacto identificados.
- [ ] Sin secretos ni datos reales embebidos.
- [ ] Cinco perfiles probados con acceso permitido y denegado.
- [ ] PWA, actualización, almacenamiento local y desconexión validados.
- [ ] Frontend conectado solo al backend productivo aprobado.

### Backend
- [ ] .NET 8 publicado desde artefacto identificado.
- [ ] Conexión a la base aprobada realmente verificada.
- [ ] Lecturas/escrituras separadas según arquitectura.
- [ ] Identidad, permisos y alcance validados.
- [ ] CORS, secretos, TLS y Swagger revisados.
- [ ] OpenAPI coincide con la PWA.
- [ ] Health checks, logs, auditoría y alertas operativos.
- [ ] Idempotencia y protección financiera comprobadas.

### Datos e integración
- [ ] Base espejo identificada, vigente, con permisos de solo lectura.
- [ ] Mapeo y conciliación aprobados.
- [ ] Operaciones de escritura apuntan a la fuente oficial.
- [ ] Respaldo y rollback ensayados.
- [ ] No se ejecutó el legado completo en producción.

### Operación
- [ ] UAT y aceptación de SAGRISA documentadas.
- [ ] Ventana y responsables confirmados.
- [ ] Plan de incidentes y rollback aprobado.
- [ ] Smoke tests y monitoreo posterior asignados.

## 9. Prioridad inmediata para SAGRISA

Antes de fijar una fecha de producción, el equipo necesita cerrar cuatro tareas:

1. Confirmar hosting definitivo del frontend y backend, dominios y responsables.
2. Alinear URL/prefijo de API y contrato OpenAPI con el frontend.
3. Definir la conexión real al destino de datos, el uso del respaldo y el sistema oficial de escrituras.
4. Completar la evidencia por los cinco roles y obtener la aceptación funcional de SAGRISA.

Con esas respuestas se puede convertir esta guía en un calendario de despliegue con fechas realistas. Mientras estén pendientes, el estado correcto es **preparación y validación de staging**, no salida a producción.

