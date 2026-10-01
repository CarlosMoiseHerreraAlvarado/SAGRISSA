# Documento Maestro de Integración: SAGRI_MOVIL ↔ API Nueva ↔ PWA

> **Versión:** 1.0 — Consolidación de 5 rondas de verificación cruzada
> **Fecha:** 2 de septiembre de 2026
> **Fuentes verificadas:**
> - [`movil.sql`](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql) — 17,682 líneas, 578 KB (DDL completo de `[Movil]` / `SAGRI_MOVIL`)
> - [`sagrisa-v1.yaml`](file:///F:/SAGRISSA_COD/SAGRISSA/docs/openapi/sagrisa-v1.yaml) — Contrato OpenAPI 3.0.3
> - [`index.ts`](file:///F:/SAGRISSA_COD/SAGRISSA/src/types/index.ts) — Tipos TypeScript del frontend PWA
> - [`cobros.service.ts`](file:///F:/SAGRISSA_COD/SAGRISSA/src/features/cobros/services/cobros.service.ts) — Servicio de cobros del frontend
> - [`endpoints.ts`](file:///F:/SAGRISSA_COD/SAGRISSA/src/core/api/endpoints.ts) — Rutas runtime del frontend
> - [`pdf_text.txt`](file:///F:/SAGRISSA_COD/SAGRISSA/pdf_text.txt) — Texto extraído de la Fuente Técnica Maestra y PDFs de roles
> - Backend ASP.NET Core (`sagrisa-api`) — Repositorio [`SAGRISA-i-moves/sagrisa-api`](https://github.com/SAGRISA-i-moves/sagrisa-api.git), rama `APIs`

> [!IMPORTANT]
> Este documento es producto de 5 rondas de análisis forense con correcciones cruzadas entre dos analistas.
> Cada afirmación está respaldada por número de línea verificado contra el DDL real.
> Las afirmaciones erróneas de documentos anteriores han sido identificadas, corregidas y documentadas.

---

## 1. Naturaleza Real de `SAGRI_MOVIL`

`SAGRI_MOVIL` (base de datos `[Movil]` en SQL Server, compatibilidad 130) es un **entorno híbrido** que combina dos naturalezas:

1. **Tablas espejo sin integridad referencial** — mirrors de replicación masiva desde Dynamics GP 2016 (`GPSAG.dbo` para SV, `NUTGT.dbo` para GT). Carecen de Primary Keys y Foreign Keys para permitir `BULK INSERT` a máxima velocidad.

2. **Tablas operativas con PKs y FKs** — escrituras transaccionales directas de la app móvil y portal web. Estas sí tienen constraints formales.

### Inventario cuantitativo verificado

| Tipo de objeto | Cantidad |
| :--- | :---: |
| Stored Procedures activos | **76** |
| SP comentado | 1 (`WS_GetCliente` línea 5221) |
| Funciones de usuario (UDF) | 1 (`WS_ObtenerDiaHabil` línea 176) |
| Tablas | 85+ |
| Vistas | 40+ |

> [!NOTE]
> El conteo de 76 SPs se obtiene con el patrón regex `CREATE\s+PROCEDURE` (case-insensitive).
> El DDL generado por SQL Server Management Studio inserta espacios variables entre `CREATE` y `PROCEDURE`.
> El patrón literal `CREATE PROCEDURE` (un espacio) solo captura 47 de 76 — **pierde el 38% de los SPs**.

---

## 2. Los 3 Canales de Autenticación

`SAGRI_MOVIL` implementa **3 mecanismos de autenticación independientes** para 3 poblaciones de usuarios distintas:

### Canal 1: Personal Interno (Servicios Web / Administración)

| Aspecto | Detalle | Evidencia |
| :--- | :--- | :--- |
| **Tabla** | `WS_Usuarios` | [`movil.sql:2889`](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L2889) |
| **PK** | `Usuario nchar(25)` — `PK_WS_Usuarios` CLUSTERED | [`movil.sql:2898-2901`](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L2898-L2901) |
| **SP de Auth** | `WS_validarUsuario` | [`movil.sql:9100`](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L9100) |
| **Mecanismo** | `WHERE Usuario = @Usuario AND Password = @Password` | Comparación directa |
| **Password** | `nchar(50)` — **TEXTO PLANO** | 🔴 CWE-256 / OWASP A02 |
| **Empresa** | `nchar(15) NULL` — multi-empresa primitivo | [`movil.sql:2893`](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L2893) |
| **Otros campos** | `IdIncrement int IDENTITY(1,1)` | Autoincremental |

### Canal 2: Vendedores Móvil (App Nativa / Ruta)

| Aspecto | Detalle | Evidencia |
| :--- | :--- | :--- |
| **Tabla** | `UsuariosMovil` | [`movil.sql:2589`](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L2589) |
| **PK** | ❌ Sin PK formal | — |
| **SP de Auth** | `WEB_PObtenerCredenciales` | [`movil.sql:2997`](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L2997) |
| **Mecanismo** | `WHERE CodVendedor = @Usuario AND Pin = @Pin` | — |
| **Pin** | `nchar(10)` — sin hash ni salt | 🟡 Débil |
| **Jerarquía** | `SupervisadoPor`, `GerenciadoPor`, `Division`, `Cargo`, `Rol` | Campos de perfil operativo |
| **Sesión** | `Token`, `FechaSesion`, `Cambiado` | Control de sesión rudimentario |

### Canal 3: Clientes Web / E-Commerce

| Aspecto | Detalle | Evidencia |
| :--- | :--- | :--- |
| **Tabla** | `WS_Cliente` | [`movil.sql:2645`](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L2645) |
| **PK** | ❌ Sin PK formal | `CodCliente char(15)` e `IdClieCafeina char(10)` coexisten como identificadores de facto |
| **SP de Auth** | `WS_AutenticacionCliente_AG_VET` | [`movil.sql:4193`](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L4193) |
| **Mecanismo** | `DECRYPTBYPASSPHRASE('SAG', C.Contrasena)` | Cifrado simétrico con clave hardcodeada |
| **Password legacy** | `Password nchar(100) NULL` — residuo histórico sin uso confirmado | [`movil.sql:2648`](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L2648) |
| **Contrasena activa** | `Contrasena varbinary(200) NULL` | [`movil.sql:2649`](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L2649) |
| **Dualidad de identidad** | `CodCliente` (mundo GP) vs `IdClieCafeina` (mundo Caféina/Web) | — |

> [!WARNING]
> `WS_Cliente` tiene **DOS campos de contraseña** coexistiendo:
> - `Password nchar(100)` — probable legacy en texto plano, sin SP que lo use
> - `Contrasena varbinary(200)` — campo activo usado por `WS_AutenticacionCliente_AG_VET`
>
> El campo `Password` es un vector de confusión si un desarrollador futuro lo confunde con el campo activo.

### Decisión arquitectónica de la API nueva

La API nueva unifica los 3 canales bajo un modelo estándar:
- Auth por DUI + PIN → JWT con BCrypt
- Claims: `rol`, `division`, `pais`, `supervisor`, `gerente`
- Definido en [`sagrisa-v1.yaml:11-27`](file:///F:/SAGRISSA_COD/SAGRISSA/docs/openapi/sagrisa-v1.yaml#L11-L27) (`POST /auth/login`)
- Roles: `cliente | vendedor | supervisor | gerente | director` — [`index.ts:4`](file:///F:/SAGRISSA_COD/SAGRISSA/src/types/index.ts#L4)

---

## 3. Integridad Referencial — Estado Verificado

### Tablas SIN Primary Key (Mirrors / Staging de GP)

| Tabla | Línea DDL | Observación |
| :--- | :---: | :--- |
| `PedidoEncabezado` | [2247](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L2247) | Todos los campos `NULL`, sin `CONSTRAINT PK_*` |
| `PedidoDetalle` | [2153](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L2153) | Todos los campos `NULL`, sin `CONSTRAINT PK_*` |
| `TClientes` | [1030](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L1030) | Sin PK |
| `TClientesGT` | — | Sin PK |
| `TSAGMovilExistencias` | [836](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L836) | Sin PK |
| `WS_Cliente` | [2645](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L2645) | Sin PK formal (2 identificadores de facto) |
| `ClaseProductos` | [2038](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L2038) | Sin PK |
| `Divisiones` | [2115](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L2115) | Sin PK |

### Tablas CON Primary Key (Operativas Transaccionales)

| Tabla | Línea DDL | PK | Tipo |
| :--- | :---: | :--- | :--- |
| `Cobro` | [2048](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L2048) | `id_cobro` IDENTITY(1,1) | PK CLUSTERED + FKs a `Banco`, `MetodoPago`, `MarcaTarjeta` |
| `SAGPagosEncabezado` | [2497](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L2497) | `NumPago` numeric(18,0) IDENTITY | `PK_SAGPagosEncabezado` CLUSTERED |
| `SAGPagosDetalle` | [2471](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L2471) | `NumPagoDetalle` numeric(18,0) IDENTITY | `PK_SAGPagosDetalle` CLUSTERED + FK a `SAGPagosEncabezado` |
| `WS_Usuarios` | [2889](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L2889) | `Usuario nchar(25)` | `PK_WS_Usuarios` CLUSTERED |
| `WS_DireccCliente` | [2756](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L2756) | (`IdClieCafeina`, `IdDireccionCaf`) | PK compuesta CLUSTERED |
| `WS_ClienteListPrecio` | [2685](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L2685) | (`CodLstPrec`, `CodProd`, `CodCliente`) | PK compuesta CLUSTERED |
| `WS_ListaPrecio` | [2790](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L2790) | `CodLstPrec nchar(15)` | `PK_WS_ListaPrecio` CLUSTERED |
| `TipoPago` | [2575](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L2575) | `id_tipo_pago` IDENTITY(1,1) | PK CLUSTERED |
| `MetodoPago` | [2139](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L2139) | `id_metodo_pago` IDENTITY(1,1) | PK CLUSTERED |
| `Banco` | [2013](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L2013) | `id_banco` IDENTITY(1,1) | PK CLUSTERED |
| `MarcaTarjeta` | [2125](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L2125) | `id_marca_tarjeta` IDENTITY(1,1) | PK CLUSTERED |
| `CorreosPendientes` | [2083](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L2083) | `Id` IDENTITY(1,1) | PK CLUSTERED |
| `WS_Departamentos` | [2730](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L2730) | `idDepto nchar(2)` | `PK_WS_Departamentos` |
| `WS_Municipios` | [2809](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L2809) | (`IdDepartamento`, `IdMunicipio`) | PK compuesta CLUSTERED |

### Inconsistencias de tipos entre tablas (verificadas)

| Columna | Tabla A | Tipo A | Tabla B | Tipo B |
| :--- | :--- | :--- | :--- | :--- |
| `NumPedido` | `PedidoEncabezado` | `numeric(18,0)` | `PedidoDetalle` | `varchar(10)` |
| `NumPedido` | `PedidoDetalleHistorico` | `numeric(18,0)` | `PedidoDetalle` | `varchar(10)` |
| `CodCliente` | `TClientes` | `varchar(15)` | `PedidoEncabezado` | `varchar(10)` |

> El SP `WS_ObtenerHistorialPedidosCliente` ([línea 7202](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L7202)) usa `RTRIM(C.NumPedido)` para compensar el mismatch — confirmando que la inconsistencia es conocida y parcheada.

---

## 4. Dualidad de Tablas de Precios

Existen **dos tablas diferentes** con nombres confusamente similares:

### `TSAGPreciosEnLinea` — Espejo fiscal completo de GP

**Ubicación:** [`movil.sql:972-987`](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L972-L987)

| Campo | Tipo |
| :--- | :--- |
| `CodProducto` | `char(31) NOT NULL` |
| `NomProducto` | `char(101) NOT NULL` |
| `Bodega` | `char(11) NULL` |
| `Existencia` | `numeric(22,5) NULL` |
| `Pbase` | `numeric(19,5) NULL` |
| `Costo` | `numeric(19,5) NOT NULL` |
| `Peso` | **`numeric(16,6) NULL`** |
| `ListaPrecio` | `char(11) NOT NULL` |
| **`PorcentajeDesc`** | **`numeric(19,5) NOT NULL`** |
| `PrecioVenta` | `numeric(38,7) NULL` |
| `Pais` | `varchar(2) NOT NULL` |
| **`Clase`** | **`char(31) NOT NULL`** |
| **`PrecioSinIVA`** | **`numeric(38,9) NULL`** |
| **`CantDecimales`** | **`int NULL`** |

### `SAGTPreciosEnLinea` — Versión operativa / e-commerce

**Ubicación:** [`movil.sql:2554-2568`](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L2554-L2568)

| Campo | Tipo |
| :--- | :--- |
| `CodProducto` | `char(31) NOT NULL` |
| `NomProducto` | `char(101) NOT NULL` |
| `Bodega` | `char(11) NULL` |
| `Existencia` | `numeric(20,5) NULL` |
| `Pbase` | `numeric(19,5) NULL` |
| `Costo` | `numeric(19,5) NOT NULL` |
| `Peso` | **`int NOT NULL`** |
| `ListaPrecio` | `char(11) NOT NULL` |
| **`UOMPRICE`** | **`numeric(19,5) NOT NULL`** |
| `PrecioVenta` | `numeric(38,9) NULL` |
| `Pais` | `varchar(2) NOT NULL` |
| **`TodoPublico`** | **`nchar(2) NULL`** |
| **`Oferta`** | **`numeric(18,2) NULL`** |

### Campos exclusivos de cada tabla

| Campo | `TSAGPreciosEnLinea` | `SAGTPreciosEnLinea` |
| :--- | :---: | :---: |
| `PorcentajeDesc` | ✅ | ❌ |
| `PrecioSinIVA` | ✅ | ❌ |
| `CantDecimales` | ✅ | ❌ |
| `Clase` | ✅ | ❌ |
| `TodoPublico` | ❌ | ✅ |
| `Oferta` | ❌ | ✅ |
| `UOMPRICE` | ❌ | ✅ |
| `Peso` tipo | `numeric(16,6)` | `int` |

### Jerarquía de resolución de precios

El SP `WS_GetListaPreciosClientes` ([línea 5352](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L5352)) ejecuta un `UNION` multi-país cruzando `GPSAG.dbo.RM00101` (SV) y `NUTGT.dbo.RM00101` (GT):

```
Precio Final =
    OfertaPactadaCliente (WS_ClienteListPrecio.PrecioUOferta)
    ?? PrecioListaClase (TSAGPreciosEnLinea.PrecioVenta × PorcentajeDesc)
    ?? PrecioBase (TSAGMovilExistencias.Pbase)
```

**API nueva (actual):** `BackendProducto` tiene un solo campo `precio: number` — [`index.ts:217`](file:///F:/SAGRISSA_COD/SAGRISSA/src/types/index.ts#L217)

---

## 5. Máquina de Estados de Cobros

### Descubierta en `WS_GetPagosDetalleVendedor`

**Ubicación:** [`movil.sql:5650-5699`](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L5650-L5699)

#### 7 Estados de cobro (campo `Estado` en `SAGPagosDetalle`)

| Código | Significado | Verificado línea |
| :---: | :--- | :---: |
| `'P'` | Pendiente | [5675](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L5675) |
| `'R'` | Recibido | [5676](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L5676) |
| `'Y'` | En Análisis | [5680](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L5680) |
| `'Z'` | En Espera | [5681](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L5681) |
| `'A'` | Aprobado | [5677](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L5677) |
| `'C'` | Cancelado | [5678](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L5678) |
| `'X'` | Anulado | [5679](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L5679) |

#### 4 Tipos de cobro (campo `TipoCobro`)

| Código | Significado | Verificado línea |
| :---: | :--- | :---: |
| `'1'` | Efectivo | [5665](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L5665) |
| `'2'` | Cheque | [5666](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L5666) |
| `'3'` | Transferencia o Remesa | [5667](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L5667) |
| `'4'` | Tarjeta de Crédito | [5668](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L5668) |

#### 5 Áreas de negocio (campo `Area`)

| Código | Significado | Verificado línea |
| :---: | :--- | :---: |
| `'A'` | Agrícola | [5686](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L5686) |
| `'V'` | Veterinaria | [5687](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L5687) |
| `'I'` | Industrial | [5688](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L5688) |
| `'T'` | Taller | [5689](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L5689) |
| `'P'` | Proyecto | [5690](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L5690) |

**API nueva (actual):** [`cobros.service.ts:24`](file:///F:/SAGRISSA_COD/SAGRISSA/src/features/cobros/services/cobros.service.ts#L24) solo contempla 3 estados: `'applied' | 'pending' | 'rejected'`

---

## 6. Modelo de Cobros: 2 Fases con Aplicación 1:N

### Fase 1: Captura Física (`Cobro`)

**Ubicación:** [`movil.sql:2048-2065`](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L2048-L2065)

| `id_cobro` | `int IDENTITY PK` | Identificador único |
| `monto_cobro` | `decimal(8,2)` | Monto capturado |
| `metodo_pago_fk_cobro` | `int FK → MetodoPago` | Método de pago (FK en l. 2982) |
| `banco_fk_cobro` | `int FK → Banco` | Banco (FK en l. 2976) |
| `marca_tarjeta_fk_cobro` | `int FK → MarcaTarjeta` | Marca de tarjeta (FK en l. 2979) |
| `numero_transaccion_cobro` | `varchar(100)` | Número de transacción POS / transferencia |
| `uri_comprobante_cobro` | `varchar(255)` | Foto/scan del comprobante |
| `uri_firma_cobro` | `varchar(255)` | Firma digital capturada |
| `dui_cobro` | `varchar(10)` | DUI del pagador |
| `correo_cobro` | `varchar(100)` | Correo para envío digital de recibo |
| `numero_cheque_cobro` | `varchar(100)` | Número de cheque |
| `fecha_cobro` | `date` | Fecha del cobro |

> [!NOTE]
> Las Foreign Keys formales de `Cobro` y `SAGPagosDetalle` se definen mediante sentencias `ALTER TABLE` en las líneas 2976-2988 de `movil.sql`.
> Asimismo, el valor por defecto `DEFAULT 'MOV'` de `Origen` en `PedidoEncabezado` y `PedidoDetalle` se define en las líneas 2972 y 2974.

### Fase 2: Imputación Contable 1:N (`SAGPagos*`)

**Encabezado:** [`movil.sql:2497-2509`](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L2497-L2509)

| Campo | Tipo |
| :--- | :--- |
| `NumPago` | `numeric(18,0) IDENTITY PK` |
| `CodCliente` | `nvarchar(15) NOT NULL` |
| `CodVendedor` | `nvarchar(15) NOT NULL` |
| `FechaPago` | `datetime NOT NULL` |
| `MontoTotal` | `money NOT NULL` |

**Detalle (1 pago → N facturas):** [`movil.sql:2471-2490`](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L2471-L2490)

| Campo | Tipo |
| :--- | :--- |
| `NumPagoDetalle` | `numeric(18,0) IDENTITY PK` |
| `NumPago` | `numeric(18,0) FK → SAGPagosEncabezado` |
| `NumFactura` | `nvarchar(50) NOT NULL` |
| `MontoCancelado` | `money NOT NULL` |
| `Estado` | `nvarchar(15)` — **7 estados (P,R,Y,Z,A,C,X)** |
| `TipoCobro` | `nvarchar(15)` — **4 tipos (1,2,3,4)** |
| `Area` | `nvarchar(15)` — **5 áreas (A,V,I,T,P)** |
| `Imagen` | `varbinary(max)` |

**API nueva (actual):** [`RegisterPaymentInput`](file:///F:/SAGRISSA_COD/SAGRISSA/src/features/cobros/services/cobros.service.ts#L28-L38) recibe un solo `invoiceId: string` — modelo 1:1, no 1:N.

---

## 7. Integración BAC / Caféina

### En `WS_Cliente`

| Campo | Tipo | Línea |
| :--- | :--- | :---: |
| `IdClieCafeina` | `char(10)` | [2647](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L2647) |
| `IdDireccCaf` | `char(10)` | [2660](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L2660) |
| `RutaCCF` | `char(200)` | [2670](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L2670) |

### En `PedidoEncabezado`

| Campo | Tipo | Línea |
| :--- | :--- | :---: |
| `idBac` | `char(50)` | [2263](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L2263) |
| `idClieCaf` | `char(15)` | [2264](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L2264) |
| `EstadoBac` | `char(15)` | [2265](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L2265) |
| `orderCaf` | `char(50)` | [2266](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L2266) |
| `Origen` | `nchar(3) DEFAULT 'MOV'` | [2261](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L2261) |

### Trazabilidad de origen

`WS_SitioOrigenPedido` ([línea 2876](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L2876)): `SitioOrigen nchar(10)`, `RequiereEnvio bit`.

### SP de alta automática en GP

`WS_CrearMacroClienteCCF` ([línea 4268](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L4268)): genera macros Dexterity para ventana `RM_Customer_Maintenance` de GP.

---

## 8. Campos de Receptor en `WS_Cliente`

**Ubicación:** [`movil.sql:2673-2677`](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L2673-L2677)

| Campo | Tipo |
| :--- | :--- |
| `Receptor_Nombre` | `char(50) NULL` |
| `Receptor_email` | `char(50) NULL` |
| `Receptor_Telefono` | `char(25) NULL` |
| `Receptor_IdPais` | `char(5) NULL` |
| `Receptor_Pais` | `char(25) NULL` |

**Contexto de negocio:** En el sector agropecuario centroamericano, es común que el receptor de la mercancía (administrador de finca) no sea el titular de la cuenta (sociedad agrícola). La API nueva no modela esta dualidad.

---

## 9. Ciclo de Facturación Asíncrona

### Flujo verificado

```
PedidoEncabezado.estatus = NULL (pedido creado)
    ↓
GP procesa via WS_PCrearMacroPedidos → SOP_Entry (SOP30200, SOPTYPE='3')
    ↓
UpdateNumFacturas (línea 3562) → estatus = 'F', NumFactura = <numero>
    ↓
PedidioNuevoCorreo (línea 3386) → sp_send_dbmail
    ↓
CorreosPendientes (línea 2083) → cola con Procesado/MensajeError
    ↓
ProcesarCorreosPendientes (línea 3510) → reintentos
```

### Vistas de reconciliación

| Vista/Tabla | Línea | Propósito |
| :--- | :---: | :--- |
| `TSAGPedidosAppVrsGP` | [256](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L256) | **Vista** de reconciliación 3-vías (App vs GP vs Factura) |
| `TSAGPedidosAppVrsFactVrsDespacho` | [1975](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L1975) | Comparativo Pedido → Factura → Despacho |

### Variantes de `PedidoEncabezado`

| Tabla | Línea | Propósito confirmable |
| :--- | :---: | :--- |
| `PedidoEncabezado` | [2247](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L2247) | Buffer activo de pedidos |
| `PedidoEncabezadoH` | [2305](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L2305) | Archivo histórico (destino de `UpdateNumFacturas`) |
| `PedidoEncabezadoHistorico` | [2334](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L2334) | Archivo histórico pre-BAC (sin campos `idBac`/`idClieCaf`) |
| `PedidoEncabezadoStatusBac` | [2359](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L2359) | Respaldo de pedidos BAC |
| `PedidoEncabezadoE` | — | **Propósito desconocido** (variante con `nvarchar`) |
| `PedidoEncabezadoX` | — | **Propósito desconocido** (estructura idéntica) |
| `PedidoEncabezadoVs` | [2385](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L2385) | **Tabla** (NO vista), estructura simplificada, propósito desconocido |

> [!CAUTION]
> Las variantes `E`, `X` y `Vs` **no tienen evidencia en el DDL** que confirme su propósito.
> Cualquier asignación de significado (errores, anuladas, auditoría) es especulación sin base técnica.

---

## 10. Catálogos Normativos Existentes pero No Referenciados

| Catálogo | Línea | Tiene PK | Es referenciado por FK |
| :--- | :---: | :---: | :---: |
| `TipoPago` | [2575](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L2575) | ✅ `id_tipo_pago IDENTITY` | ❌ (`PedidoEncabezado.Tpago` es `varchar(30)` libre) |
| `MetodoPago` | [2139](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L2139) | ✅ `id_metodo_pago IDENTITY` | ✅ FK desde `Cobro` |
| `Banco` | [2013](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L2013) | ✅ `id_banco IDENTITY` | ✅ FK desde `Cobro` |
| `MarcaTarjeta` | [2125](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L2125) | ✅ `id_marca_tarjeta IDENTITY` | ✅ FK desde `Cobro` |
| `ClaseProductos` | [2038](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L2038) | ❌ | ❌ |
| `Divisiones` | [2115](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L2115) | ❌ | ❌ |
| `Cargos` | [2027](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L2027) | ❌ | ❌ |
| `SAGProductosDescuentos` | [2516](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L2516) | ❌ | ❌ |
| `WS_ListaPrecio` | [2790](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L2790) | ✅ `CodLstPrec PK` | ✅ referenciada en `WS_ClienteListPrecio` |
| `WS_Pais` | [2862](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L2862) | ❌ | ❌ |

---

## 11. Stored Procedures Clave — Los 76 Verificados

### 12 SPs Críticos para la Arquitectura de la API

| # | SP | Esquema | Línea | Función |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `WS_validarUsuario` | `SAG` | [9100](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L9100) | Auth personal interno (plaintext) |
| 2 | `WEB_PObtenerCredenciales` | `dbo` | [2997](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L2997) | Auth vendedores móvil (Pin) |
| 3 | `WS_AutenticacionCliente_AG_VET` | `SAG` | [4193](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L4193) | Auth clientes web (simétrico) |
| 4 | `UpdateNumFacturas` | `SAG` | [3562](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L3562) | Cierra ciclo facturación asíncrona |
| 5 | `PedidioNuevoCorreo` | `SAG` | [3386](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L3386) | Email via `sp_send_dbmail` |
| 6 | `ProcesarCorreosPendientes` | `SAG` | [3510](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L3510) | Cola de emails con reintentos |
| 7 | `PedidioNuevo` | `SAG` | [3249](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L3249) | Notificación nuevo pedido |
| 8 | `InsertAutorizacion` | `SAG` | [3174](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L3174) | Autorización de margen en GP |
| 9 | `WS_GetListaPreciosClientes` | `SAG` | [5352](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L5352) | Precios multi-país (UNION SV+GT) |
| 10 | `WS_CrearMacroClienteCCF` | `SAG` | [4268](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L4268) | Macro Dexterity para alta en GP |
| 11 | `WS_ObtenerHistorialPedidosCliente` | `SAG` | [7202](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L7202) | Histórico con JOIN a GP |
| 12 | `WS_GetPagosDetalleVendedor` | `SAG` | [5650](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L5650) | Detalle cobros (7 estados, 4 tipos, 5 áreas) |

### SPs Adicionales por Dominio

<details>
<summary><strong>Gestión de Clientes (12 SPs)</strong></summary>

| SP | Línea | Función |
| :--- | :---: | :--- |
| `WS_InsertarCliente` | [5881](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L5881) | Insertar cliente |
| `WS_ActualizarCliente` | [3698](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L3698) | Actualizar cliente |
| `WS_ObtenerCliente` | [6887](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L6887) | Obtener cliente |
| `WS_GetCliente` | [5222](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L5222) | Get cliente |
| `WS_VerificarCliente` | [9127](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L9127) | Verificar existencia |
| `WS_VerificarCliente_GP` | [9177](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L9177) | Verificar en GP por NRC |
| `WS_ObtenerInfoCliente_AG_VET` | [7384](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L7384) | Info agrícola/veterinaria |
| `WS_agregarDireccCliente` | [4059](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L4059) | Agregar dirección |
| `WS_ActualizarDireccCliente` | [3803](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L3803) | Actualizar dirección |
| `WS_DireccionClienteCCF` | [4922](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L4922) | Dirección CCF |
| `WS_DireccionUsuariosCCF` | [4957](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L4957) | Dirección usuarios CCF |
| `WS_ActualizarUsuarioCCF` | [3968](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L3968) | Actualizar usuario CCF |

</details>

<details>
<summary><strong>Precios y Listas (10 SPs)</strong></summary>

| SP | Línea | Función |
| :--- | :---: | :--- |
| `WS_GetListaPrecios` | [5325](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L5325) | Lista de precios |
| `WS_GetListaPreciosClientes` | [5352](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L5352) | Precios por cliente (multi-país) |
| `WS_GetListaPreciosClientesxCli` | [5422](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L5422) | Precios por cliente específico |
| `WS_GetListaPreciosxPais` | [5490](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L5490) | Precios por país |
| `WS_GetLPC` | [5509](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L5509) | Lista precios corta |
| `WS_GetAllListaPreciosClientes` | [5123](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L5123) | Todas las listas |
| `WS_GetAllListaPreciosClientes_Agricola` | [5176](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L5176) | Todas las listas agrícola |
| `WS_InsertarListaPrecioCliente` | [6011](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L6011) | Insertar lista |
| `WS_EliminarListaPrecioCliente` | [4990](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L4990) | Eliminar lista |
| `WS_EliminarListaPrecioCliente_Agricola` | [5047](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L5047) | Eliminar lista agrícola |

</details>

<details>
<summary><strong>Productos por Área (10 SPs)</strong></summary>

| SP | Línea | Función |
| :--- | :---: | :--- |
| `WS_GetProducto` | [5723](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L5723) | Producto genérico |
| `WS_ObtenerProductosAgricola` | [7702](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L7702) | Agrícola |
| `WS_ObtenerProductosAgricolaxCli` | [7756](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L7756) | Agrícola por cliente |
| `WS_ObtenerProductosAgricolaxClixProd` | [7821](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L7821) | Agrícola específico |
| `WS_ObtenerProductosVeterinaria` | [7985](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L7985) | Veterinaria |
| `WS_ObtenerProductosVeterinariaxCli` | [8031](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L8031) | Veterinaria por cliente |
| `WS_ObtenerProductosVeterinariaxClixProd` | [8137](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L8137) | Veterinaria específico |
| `WS_ObtenerProductosHonda` | [7900](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L7900) | Honda |
| `WS_ObtenerProductosHondaxCod` | [7952](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L7952) | Honda por código |
| `WS_ObtenerProdHondaSensitive` | [7677](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L7677) | Honda sensible |

</details>

<details>
<summary><strong>Pedidos y Macros GP (10 SPs)</strong></summary>

| SP | Línea | Función |
| :--- | :---: | :--- |
| `WS_InsertarPedido` | [6106](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L6106) | Insertar pedido completo |
| `WS_GenerarMacroPedido` | [5102](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L5102) | Macro GP para pedido |
| `WS_PCrearMacroPedidos` | [8312](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L8312) | Macro masiva GP |
| `WS_PCrearMacroPedidos_PRU` (dbo) | [3029](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L3029) | Variante prueba (dbo) |
| `WS_PCrearMacroPedidos_PRU` (SAG) | [8466](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L8466) | Variante prueba (SAG) |
| `WS_ObtenerDetallePedidos` | [6970](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L6970) | Detalle por país |
| `WS_ObtenerDetallePedidos_PRU` | [7006](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L7006) | Variante prueba |
| `WS_ObtenerPedidosaGenerar` | [7581](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L7581) | Pedidos pendientes de GP |
| `WS_ObtenerPedidosaGenerar_PRU` | [7633](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L7633) | Variante prueba |
| `WS_ObtenerFacturaProyecto_PRU` | [7159](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L7159) | Factura proyecto prueba |

</details>

<details>
<summary><strong>Deuda y Cartera (4 SPs)</strong></summary>

| SP | Línea | Función |
| :--- | :---: | :--- |
| `WS_ObtenerDeudaCliente` | [7038](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L7038) | Deuda general |
| `WS_ObtenerDeudaClienteDatos` | [7065](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L7065) | Datos de deuda |
| `WS_ObtenerDeudaClienteDetalle` | [7094](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L7094) | Detalle de deuda |
| `WS_ObtenerDeudaClienteResumen` | [7124](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L7124) | Resumen de deuda |

</details>

<details>
<summary><strong>Otros (18 SPs)</strong></summary>

| SP | Línea | Función |
| :--- | :---: | :--- |
| `getCobrosSV` | [3116](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L3116) | Cobros SV |
| `getCobrosSVbyDivision` | [3137](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L3137) | Cobros SV por división |
| `PedidioNuevoControl` | [3327](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L3327) | Control nuevo pedido |
| `WS_ActualizarPassAGR_VET` | [3927](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L3927) | Actualizar contraseña |
| `WS_AgregarArchivoCCFCliente` | [4018](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L4018) | Agregar archivo CCF |
| `WS_DefaultSVC0809` | [4814](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L4814) | Default SVC0809 |
| `WS_deleteSAGRIMOVIL` | [4873](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L4873) | Limpieza SAGRI_MOVIL |
| `WS_GetDepto` | [5283](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L5283) | Departamentos |
| `WS_GetMunicipio` | [5595](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L5595) | Municipios |
| `WS_GetProveedor` | [5825](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L5825) | Proveedores |
| `WS_ObtenerCorrelativo` | [6940](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L6940) | Correlativo |
| `WS_InsertarPrecioClienteAgricola` | [6801](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L6801) | Precio agrícola |
| `WS_ObtenerUsuariosAGR_VET` | [8225](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L8225) | Usuarios agrícola/veterinaria |
| `WS_ObtenerUsuariosCCF` | [8263](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L8263) | Usuarios CCF |
| `WS_UpdDireccion_Pedido` | [8600](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L8600) | Actualizar dirección pedido |
| `WS_UpdDireccionSVC0016_Pedido` | [8666](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L8666) | Dirección SVC0016 |
| `WS_UpdDireccionSVC0809_Pedido` | [8999](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L8999) | Dirección SVC0809 |
| `WSCel_InsertarListaPrecio` | [9252](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L9252) | Lista precio (celular) |

</details>

---

## 12. Los 7 Gaps Críticos — API Nueva vs. Realidad Operativa

### Gap 1: Precios Multi-País con Cascada de Prioridades

| Aspecto | Legacy (`SAGRI_MOVIL`) | API Nueva (actual) |
| :--- | :--- | :--- |
| **Modelo** | 2 tablas de precios + listas pactadas por cliente | 1 campo `precio: number` |
| **Campos fiscales** | `PrecioSinIVA`, `PorcentajeDesc`, `CantDecimales` | ❌ Ausentes |
| **Resolución multi-país** | UNION cross-database SV+GT en SP [5352](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L5352) | ❌ No implementado |
| **Ofertas por cliente** | `WS_ClienteListPrecio.PrecioUOferta` | ❌ No modelado |
| **Impacto** | La facturación fiscal centroamericana requiere desglose con/sin IVA | Incompleto para cumplimiento tributario |

**Evidencia PWA:** [`BackendProducto`](file:///F:/SAGRISSA_COD/SAGRISSA/src/types/index.ts#L212-L223) — solo `precio`, `stock`, `bodega`, `presentacion`, `familia`, `categoria`.

---

### Gap 2: Cobros con Aplicación Multi-Factura (1:N)

| Aspecto | Legacy | API Nueva |
| :--- | :--- | :--- |
| **Modelo** | `SAGPagosEncabezado` (1) → `SAGPagosDetalle` (N facturas) | `RegisterPaymentInput` recibe 1 `invoiceId` |
| **Pago parcial** | `MontoCancelado money` por factura en detalle | ❌ No soportado |
| **Impacto** | Un vendedor en campo no puede registrar un cheque que liquida 3 facturas simultáneamente | Limitación operativa crítica |

**Evidencia PWA:** [`RegisterPaymentInput`](file:///F:/SAGRISSA_COD/SAGRISSA/src/features/cobros/services/cobros.service.ts#L28-L38) — `invoiceId: string` (singular).

---

### Gap 3: Máquina de Estados de Cobros (7 estados vs 3)

| Aspecto | Legacy | API Nueva |
| :--- | :--- | :--- |
| **Estados** | P → R → Y → Z → A \| C \| X (7 estados) | `applied \| pending \| rejected` (3 estados) |
| **Transiciones faltantes** | `Recibido`, `En Análisis`, `En Espera`, `Anulado`, `Cancelado` | Solo `applied`, `pending`, `rejected` |
| **Impacto** | Sin granularidad, un cobrador no puede distinguir un cobro en revisión de uno rechazado definitivamente | Pérdida de visibilidad operativa |

**Evidencia PWA:** [`PaymentRecord.status`](file:///F:/SAGRISSA_COD/SAGRISSA/src/features/cobros/services/cobros.service.ts#L24) — 3 valores.
**Evidencia DDL:** [`WS_GetPagosDetalleVendedor`](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L5675-L5683) — 7 valores.

---

### Gap 4: Receptor de Facturación/Entrega Diferenciado

| Aspecto | Legacy | API Nueva |
| :--- | :--- | :--- |
| **Campos** | `Receptor_Nombre`, `Receptor_email`, `Receptor_Telefono`, `Receptor_IdPais`, `Receptor_Pais` | ❌ No existe |
| **Impacto** | Fincas agropecuarias donde la persona que recibe ≠ la persona que paga | No se puede capturar destinatario alterno |

**Evidencia DDL:** [`WS_Cliente:2673-2677`](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L2673-L2677)

---

### Gap 5: Canal de Origen y Trazabilidad

| Aspecto | Legacy | API Nueva |
| :--- | :--- | :--- |
| **Discriminador** | `Origen nchar(3) DEFAULT 'MOV'` + `WS_SitioOrigenPedido` | Campo `origen` en tipos TypeScript pero no enviado en `createOrder` |
| **Valores legacy** | `'MOV'` (Móvil), `'WEB'` (Tienda en línea) | Sin estandarización de canal |
| **Impacto** | Sin trazabilidad de si un pedido viene de la PWA, del portal de clientes, o de API directa | Auditoría incompleta |

**Evidencia PWA:** [`BackendPedidoEncabezado.origen`](file:///F:/SAGRISSA_COD/SAGRISSA/src/types/index.ts#L183) existe como tipo pero no se envía al crear.

---

### Gap 6: Cola de Notificaciones y Emails Transaccionales

| Aspecto | Legacy | API Nueva |
| :--- | :--- | :--- |
| **Infraestructura** | `CorreosPendientes` (tabla cola) + `ProcesarCorreosPendientes` + `sp_send_dbmail` | Outbox pattern en `outbox_events` pero sin integración email |
| **Reintentos** | `Procesado bit`, `MensajeError nvarchar(500)` | No definido |
| **Impacto** | El vendedor no recibe confirmación cuando GP procesa su pedido | Canal de comunicación roto |

---

### Gap 7: Áreas de Negocio y Catálogos Paramétricos

| Aspecto | Legacy | API Nueva |
| :--- | :--- | :--- |
| **5 Áreas** | A (Agrícola), V (Veterinaria), I (Industrial), T (Taller), P (Proyecto) | ❌ No modelado |
| **TipoPago** | Tabla con PK e IDENTITY | `tpago varchar(30)` texto libre |
| **ClaseProductos** | Tabla con `Porcentaje decimal` para descuentos por clase | `familia string` sin FK |
| **Impacto** | Sin segmentación por área, la analítica gerencial (SP `getCobrosSVbyDivision`) no puede replicarse | Pérdida de dimensión analítica |

---

## 13. Cruce con Documentación Arquitectónica

La Fuente Técnica Maestra ([`pdf_text.txt`](file:///F:/SAGRISSA_COD/SAGRISSA/pdf_text.txt)) establece reglas que el DDL confirma y que la API debe respetar:

| Regla Documentada | Línea PDF | Confirmación en DDL | Estado en API |
| :--- | :---: | :--- | :--- |
| "Mirror es read-only desde la lógica de la aplicación" | ~327 | Tablas sin PK = mirrors de GP | ✅ Respetado |
| "Las operaciones de cobro deben ser rastreables de extremo a extremo, incluyendo adjuntos y firma" | ~483 | `Cobro.uri_comprobante_cobro`, `uri_firma_cobro` | ✅ Parcial (existe pero sin 7 estados) |
| "Anticipo, pago parcial, pago total, pago múltiple" | ~282 | `SAGPagosDetalle` 1:N | ❌ API es 1:1 |
| "Autorización de facturas, denegación, anulación" | ~275-276 | `InsertAutorizacion` SP [3174](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql#L3174) | ⚠️ Endpoint existe pero sin flujo completo |
| "Productos, categorías, familias, bodegas, lotes, vencimientos, precios base y costos" | ~456 | `TSAGPreciosEnLinea` + `TSAGMovilExistenciasLote` | ❌ `BackendProducto` simplificado |
| "5 roles: cliente, vendedor, supervisor, gerente, director" | ~362 | `UsuariosMovil.Rol`, `Cargo` | ✅ Implementado en JWT |
| "Consolidación de cobro múltiple" | ~221 | `SAGPagos*` (1:N) | ❌ No implementado |

---

## 14. Tabla Consolidada de Veracidad — 5 Rondas

| Afirmación | Estado | Ronda Confirmada |
| :--- | :---: | :---: |
| 3 canales de auth (WS_Usuarios, UsuariosMovil, WS_Cliente) | ✅ Verificado | Ronda 4 |
| WEB_PObtenerCredenciales existe (línea 2997) | ✅ Verificado | Ronda 4 (corregido) |
| WS_validarUsuario usa passwords en texto plano | ✅ Verificado | Ronda 2 |
| DecryptByPassPhrase('SAG') para clientes web | ✅ Verificado | Ronda 2 |
| WS_Cliente tiene Password + Contrasena (duplicado) | ✅ Verificado | Ronda 3 |
| WS_Usuarios tiene campo Empresa | ✅ Verificado | Ronda 3 |
| WS_Cliente tiene Receptor_* fields | ✅ Verificado | Ronda 3 |
| Facturación asíncrona (estatus NULL → 'F') | ✅ Verificado | Ronda 1 |
| Cobro 2-fases (Cobro + SAGPagos 1:N) | ✅ Verificado | Ronda 1 |
| 7 estados de cobro (P,R,Y,Z,A,C,X) | ✅ Verificado | Ronda 5 |
| 5 áreas de negocio (A,V,I,T,P) | ✅ Verificado | Ronda 5 |
| 4 tipos de cobro (1,2,3,4) | ✅ Verificado | Ronda 5 |
| Jerarquía (SupervisadoPor, GerenciadoPor) | ✅ Verificado | Ronda 1 |
| Multi-país SV→GPSAG, GT→NUTGT | ✅ Verificado | Ronda 1 |
| Aging 5 buckets (0-120+) | ✅ Verificado | Ronda 1 |
| Inconsistencia NumPedido (numeric vs varchar) | ✅ Verificado | Ronda 2 |
| Inconsistencia CodCliente (varchar 15 vs 10) | ✅ Verificado | Ronda 2 |
| PedidoEncabezado sin PK | ✅ Verificado | Ronda 2 |
| Integración BAC/Cafeina | ✅ Verificado | Ronda 2 |
| Dualidad TSAGPreciosEnLinea vs SAGTPreciosEnLinea | ✅ Verificado | Ronda 3 (corregido) |
| 76 SPs activos (no 47 ni 58) | ✅ Verificado | Ronda 5 |
| PedidoEncabezadoE es para "errores" | ❌ Sin evidencia | Ronda 3 |
| PedidoEncabezadoX es para "anuladas" | ❌ Sin evidencia | Ronda 3 |
| PedidoEncabezadoVs es "vista de auditoría" | ❌ Es tabla, no vista | Ronda 3 |

---

## 15. Errores Cometidos y Corregidos Durante el Proceso

> [!NOTE]
> Documentar los errores propios es tan importante como documentar los hallazgos.
> Este registro existe para que ningún análisis futuro repita los mismos fallos.

| Error | Quién lo cometió | Ronda detectada | Corrección |
| :--- | :--- | :---: | :--- |
| Atribuir `PorcentajeDesc`, `PrecioSinIVA`, `CantDecimales` a `SAGTPreciosEnLinea` | Analista 1 | Ronda 3 | Campos pertenecen a `TSAGPreciosEnLinea` (con T al inicio) |
| Afirmar que `WEB_PObtenerCredenciales` no existe | Analista 2 | Ronda 4 | Sí existe en línea 2997. El grep falló por espacios entre CREATE y PROCEDURE |
| Contar 47 SPs | Analista 1 | Ronda 1 | Son 76. El patrón de un solo espacio pierde el 38% |
| Contar 58 SPs | Analista 1 | Ronda 5 | Son 76. Patrón aún incompleto |
| Asignar propósito a tablas por sufijo (E=Error, X=Cancelada) | Analista 1 | Ronda 3 | Sin evidencia en DDL, propósito desconocido |
| Llamar `PedidoEncabezadoVs` una "vista" | Analista 1 | Ronda 3 | Es una tabla (CREATE TABLE), no una vista |
| Omitir campo `Empresa` en `WS_Usuarios` | Analista 1 | Ronda 3 | Existe: `nchar(15) NULL` en línea 2893 |
| Omitir `WS_GetPagosDetalleVendedor` con 7 estados | Analista 1 | Ronda 5 | SP crítico en línea 5650, revela Gap 7 |

---

> [!IMPORTANT]
> **Este documento es la fuente de verdad consolidada para la integración SAGRI_MOVIL ↔ API nueva.**
> Cualquier decisión de implementación sobre los 7 gaps debe basarse en este análisis, no en documentos individuales anteriores.
> Los números de línea son verificables directamente contra [`movil.sql`](file:///F:/SAGRISSA_COD/SAGRISSA/docs/database/movil.sql).
