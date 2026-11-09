# Contexto integral del proyecto SAGRISA

**Fecha de actualización:** 15 de octubre de 2026  
**Audiencia:** equipo de desarrollo, coordinación técnica y responsables funcionales  
**Propósito:** explicar la idea completa del sistema, su estado, las decisiones vigentes, los riesgos y el trabajo que falta, sin confundir diseño con implementación o aceptación.

## 1. ¿Qué se quiere construir?

SAGRISA busca modernizar sus flujos comerciales mediante una plataforma web progresiva (PWA) que dé acceso, desde una experiencia común, a clientes y personal interno. La solución debe organizar la información y las operaciones por rol, aplicar las reglas en una API central y conservar el sistema corporativo autorizado como fuente oficial de las transacciones.

La PWA permite navegar y operar desde distintos dispositivos. La API recibe las solicitudes, comprueba identidad y permisos, aplica reglas de negocio, consulta información y encamina las operaciones. Una base espejo puede acelerar consultas de catálogos, saldos e históricos; esa base se considera de solo lectura para la aplicación. Pedidos, cobros y autorizaciones deben registrarse mediante el sistema transaccional que SAGRISA confirme como oficial.

### Arquitectura objetivo

```text
PWA React
   │
   ▼
API ASP.NET Core ─────► base espejo SQL (consultas, solo lectura)
   │
   └──────────────────► Dynamics 365 / sistema transaccional autorizado
Identidad: Microsoft Entra ID
Contrato de servicios: OpenAPI / Swagger
Monitoreo: Application Insights
```

La PWA no debe conectarse directamente a bases de datos ni al sistema transaccional. La API es la frontera para autenticar, autorizar, validar, aplicar reglas, registrar trazabilidad y responder.

Esta arquitectura está definida en la Fuente Técnica Maestra V2 y el Entregable 1. Que esté documentada no significa que todos sus componentes ya estén construidos, conectados o aprobados.

## 2. Perfiles y propósito funcional

| Perfil | Necesidad principal | Capacidades esperadas |
| --- | --- | --- |
| **Cliente** | Consultar su relación comercial con SAGRISA. | Ver cuenta, facturas, saldo, pedidos e historial propio. El acceso debe limitarse a su cuenta. |
| **Vendedor** | Atender clientes y gestionar operación de campo. | Consultar clientes asignados, catálogo, existencias y precios; preparar pedidos y registrar cobros según permisos. |
| **Supervisor** | Dar seguimiento a su equipo. | Consultar actividad, pedidos, cobros y metas de vendedores bajo su alcance. |
| **Gerente** | Supervisar resultados y resolver decisiones operativas. | Revisar indicadores, metas y solicitudes; aprobar, rechazar o escalar solo cuando el proceso esté autorizado. |
| **Director** | Consultar resultados ejecutivos. | Revisar analítica e informes dentro del alcance regional u organizativo autorizado. |

La matriz definitiva de permisos debe indicar por perfil y operación: qué puede consultar, qué puede crear o cambiar, a qué clientes o equipos tiene alcance, qué requiere aprobación y qué debe quedar auditado. La existencia de una pantalla o ruta protegida no demuestra por sí sola que el permiso esté bien aplicado en el servidor.

## 3. Dominios funcionales del sistema

1. **Identidad y acceso:** inicio de sesión, perfiles, permisos, alcance de datos, renovación y revocación de sesión.
2. **Clientes y cuentas:** información del cliente, direcciones, saldo, crédito, facturas e historial.
3. **Catálogo e inventario:** productos, familias, bodegas, existencias, lotes, vencimientos, listas de precio y precios particulares.
4. **Pedidos:** encabezado, detalle, entrega, validaciones comerciales, estados, historial y envío al sistema oficial.
5. **Facturación:** consulta, estados, documentos y relación con pedidos y cobros.
6. **Cobros:** método de pago, referencia, comprobante, aplicación a facturas, estado, aprobación y auditoría.
7. **Aprobaciones:** decisión, responsable, justificación, fecha, estado anterior y protección ante decisiones duplicadas.
8. **Metas y reportes:** consultas agregadas con filtros por vendedor, equipo, división, país o región, según los permisos aprobados.
9. **Sincronización y trazabilidad:** seguimiento de operaciones, reintentos seguros, errores y conciliación con la fuente oficial.
10. **Archivos:** comprobantes y documentos, con acceso restringido y reglas de conservación que defina SAGRISA.

Estos dominios describen el alcance de negocio. Cada función debe quedar asociada a un flujo, un contrato de API, permisos y criterios de aceptación.

## 4. Estado actual: qué sabemos y qué no

### PWA y perfiles

- El frontend contiene pantallas y rutas con controles de acceso para Cliente, Vendedor, Supervisor, Gerente y Director.
- Carlos reporta que realizó cambios para los cinco roles y que los recorridos funcionan.
- Falta dejar la evidencia de ejecución en una matriz repetible: ambiente, perfil probado, pasos, resultado, fecha y captura anonimizada.
- La respuesta de Francisco y Roberto sobre la revisión de perfiles continúa pendiente; no debe presentarse como aprobación del cliente.
- Algunos documentos anteriores describen una arquitectura distinta de la V2. Para nuevas decisiones se debe usar la arquitectura V2 y registrar cualquier cambio aprobado.

### API

- Hay un backend ASP.NET Core con controladores y servicios para áreas como autenticación, clientes, productos, pedidos, facturas, cobros, cuentas y gestión.
- La presencia de endpoints no demuestra que todos los flujos estén completos, que persistan correctamente, que utilicen información real o que estén desplegados.
- El estado actual de inicio de sesión y la transición a la identidad corporativa objetivo deben revisarse junto con el responsable del backend.
- El backend tiene cambios locales de varios tipos que aún no están integrados. El equipo debe acordar quién modifica cada parte y preservar el trabajo existente.

### Archivo de referencia de datos

- El archivo entregado `Movil.rar` contiene un respaldo `Movil.bak`, verificado como un conjunto válido y fechado el 1 de septiembre de 2026.
- Se analizó en una restauración temporal aislada consultando metadatos, sin ejecutar procedimientos ni revisar filas de clientes. La base temporal se eliminó al terminar.
- El inventario observado fue de 117 tablas, 67 vistas, 83 procedimientos, 2 funciones, 4 triggers y 4 claves foráneas; 102 tablas no tenían clave primaria.
- El contenido es híbrido: combina objetos asociados a datos replicados con tablas de operación. También hay referencias a otras bases y módulos que contienen patrones de escritura.
- Por ser un respaldo puntual, no demuestra que exista una réplica actualizada continuamente, que sea de solo lectura o que sea la fuente vigente autorizada.
- Debe utilizarse como material de análisis y mapeo. No ejecutar el respaldo o todos sus procedimientos en un entorno compartido o productivo.

### Base y conexión

Hay scripts propuestos para crear y validar un esquema de staging, además de un proceso de importación controlada. Eso no prueba que la API esté conectada a dicho esquema: la configuración inspeccionada del backend y lo que afirma la documentación de esos scripts no coinciden plenamente. Esta diferencia requiere revisión conjunta del equipo antes de afirmar que la integración está lista.

### Datos demostrativos y datos reales

Para cada demostración se debe indicar qué fuente alimenta el recorrido: datos de demostración, API local, ambiente de staging o integración real comprobada. No clasificar una integración como real por el simple hecho de que la pantalla cargue o que un endpoint responda.

## 5. Brechas que pueden afectar la integración

1. **Origen y vigencia de datos:** confirmar con SAGRISA si el respaldo es histórico, de referencia o parte de un proceso de réplica; identificar la fuente vigente y su responsable.
2. **Mapeo de datos:** asociar tablas y columnas de referencia con las entidades nuevas, reglas de transformación, claves, nulos, duplicados y conciliaciones.
3. **Dependencias externas:** identificar las bases y servicios de los que dependen los objetos heredados, y cuáles siguen activos.
4. **Pedidos y cobros:** el modelo heredado permite distribuir un pago entre varias facturas; el contrato nuevo debe representar esa relación y sus montos aplicados.
5. **Precios e inventario:** validar reglas por cliente, país, lista, impuestos, descuentos, bodegas, lotes y fechas de vigencia antes de afirmar que el precio mostrado es definitivo.
6. **Estados de negocio:** mapear estados heredados a estados nuevos con reglas de transición, responsables y trazabilidad.
7. **Contrato PWA/API:** confirmar que las rutas y formatos usados por el frontend coinciden con los endpoints y OpenAPI vigentes.
8. **Autorización:** validar permisos también en la API y en el alcance de los datos, no solo en la navegación del frontend.
9. **Operaciones oficiales:** confirmar qué servicio registra pedidos, cobros, aprobaciones y anulaciones en la fuente autorizada.
10. **Aceptación:** documentar por separado la prueba interna y la respuesta de SAGRISA.

## 6. Organización del equipo

### Programador A — inventario y mapeo del respaldo

Trabajar en modo de solo lectura. Entregar:

- Inventario de objetos por dominio.
- Clasificación como candidato a espejo, objeto operativo, dependencia externa o uso todavía desconocido.
- Mapeo inicial de origen a entidad destino, con regla de transformación y dudas.
- Riesgos de claves, duplicados, nulos, relaciones implícitas y conciliación.
- Lista de preguntas concretas para SAGRISA.

No exportar ni compartir información personal. No ejecutar scripts heredados en ambientes compartidos.

### Programador B — contrato y pruebas de perfiles

Trabajar en coordinación con Carlos y el responsable del backend. Entregar:

- Matriz de rutas, servicios de frontend, endpoints y contrato OpenAPI.
- Fuente de datos usada por cada pantalla y flujo.
- Pruebas repetibles de los cinco perfiles, con acceso permitido y denegado.
- Capturas o grabación sin datos sensibles.
- Discrepancias del contrato y propuesta antes de hacer cambios que afecten ambos lados.

No hacer cambios simultáneos sobre archivos del backend sin acordar propiedad e integración.

### Carlos — coordinación e integración

- Confirmar con Francisco y Roberto si revisaron los perfiles y registrar la respuesta, incluso si sigue pendiente.
- Proteger los cambios locales del backend y asignar responsables por componente.
- Revisar los entregables de los otros programadores antes de priorizar correcciones.
- Definir el flujo de demostración y rotular claramente la fuente de los datos.
- Solicitar a SAGRISA decisiones, accesos y apoyo técnico mediante el canal corporativo aprobado.
- No incluir contraseñas, PIN, tokens ni cadenas de conexión en correo o documentos.

## 7. Preguntas que SAGRISA debe resolver

Solicitar respuesta y responsable para estos puntos:

1. ¿Cuál es el propósito del respaldo recibido y cuál es su fecha de corte aprobada?
2. ¿Existe un ambiente de staging con una base espejo separada, vigente y de solo lectura? ¿Quién la administra y con qué frecuencia se actualiza?
3. ¿Quién proporcionará el diccionario de datos y validará el mapeo y la conciliación?
4. ¿Cuál es el sistema oficial de registro para pedidos, cobros, aprobaciones y anulaciones?
5. ¿Qué APIs o servicios autorizados deben usarse para esas operaciones?
6. ¿Qué usuarios de prueba por rol y datos ficticios están autorizados?
7. ¿Qué proveedor de identidad y permisos se utilizará para el ambiente de pruebas?
8. ¿Quién aprobará la matriz de permisos y los criterios de aceptación por perfil?
9. ¿Qué apoyo técnico se necesita de SAGRISA para resolver dependencias externas?

Los accesos deben entregarse por el mecanismo seguro que defina la organización, no como secretos en un correo.

## 8. Primer flujo demostrable

Propuesta inicial por ser de consulta y limitar el riesgo: **Cliente → inicio de sesión → panel → consulta de cuenta y facturas → regreso a operaciones**.

Antes de grabarlo, verificar que el flujo funciona en el ambiente acordado y documentar:

- Perfil y pasos ejecutados.
- Resultado esperado y resultado observado.
- Fuente de los datos.
- Capturas o grabación anonimizada.
- Errores, correcciones realizadas y pendientes.
- Diferencia entre prueba interna y aceptación del cliente.

Si aún se usan datos demostrativos, identificarlo de forma visible. No presentar el recorrido como integración real hasta comprobar la conexión y el origen de los datos.

## 9. Orden recomendado de ejecución

| Prioridad | Trabajo | Responsable propuesto | Evidencia de cierre |
| --- | --- | --- | --- |
| Inmediata | Registrar pruebas de los cinco perfiles y mantener la aceptación del cliente como pendiente hasta recibir respuesta. | Carlos y Programador B | Matriz con pasos y evidencia por perfil. |
| Inmediata | Resolver la diferencia entre los scripts de staging y la configuración real de la API. | Responsable del backend y Carlos | Diagnóstico técnico y decisión de arquitectura acordada. |
| Alta | Confirmar finalidad y vigencia del respaldo, además de si existe una réplica actual. | Carlos, Programador A y SAGRISA | Confirmación de origen, fecha, responsable y permisos. |
| Alta | Alinear el contrato PWA/API/OpenAPI. | Programador B y responsable del backend | Matriz de endpoints aprobada. |
| Alta | Completar mapeo inicial de datos y dependencias. | Programador A | Inventario versionado y dudas abiertas. |
| Alta | Definir cómo se registrarán operaciones en el sistema oficial. | SAGRISA, arquitectura y backend | Contrato, permisos y plan de prueba. |
| Siguiente etapa | Corregir el primer bloque priorizado y grabar el flujo acordado. | Equipo según componente | Evidencia interna y lista de pendientes con fecha. |

## 10. Condiciones antes de declarar producción

No llamar producción al sistema hasta contar con:

- Arquitectura y fuente oficial de datos confirmadas por SAGRISA.
- Ambiente de staging aislado, permisos mínimos y origen/actualización de datos verificados.
- Mapeo, reglas y conciliaciones aprobadas.
- API realmente conectada a la base y servicios previstos.
- Identidad, permisos por rol y límites de datos probados.
- Contratos de frontend, backend y OpenAPI consistentes.
- Operaciones financieras y aprobaciones probadas con trazabilidad y protección ante duplicados.
- Pruebas repetibles, aceptación de SAGRISA, monitoreo y plan de reversión aprobados.

Hasta cumplir estas condiciones, reportar el estado con términos precisos: desarrollo, prueba interna, staging, integración comprobada o aceptación del cliente pendiente.

## 11. Principio para mantener la documentación confiable

En cada actualización separar estas cuatro categorías:

1. **Definido:** aparece en la arquitectura o especificación aprobada.
2. **Implementado:** existe en el código revisado.
3. **Probado internamente:** hay pasos y evidencia reproducible en un ambiente identificado.
4. **Validado por SAGRISA:** existe respuesta o aceptación explícita del cliente.

Una pantalla implementada no equivale a una integración; una prueba interna no equivale a aceptación; y un respaldo válido no equivale a una base espejo activa.

