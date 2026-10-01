from __future__ import annotations

from datetime import date
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch, mm
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    PageBreak,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    KeepTogether,
    Flowable,
)
from reportlab.graphics.shapes import Drawing, Rect, String, Line


ROOT = Path(__file__).resolve().parents[2]
OUTPUT = ROOT / "output" / "pdf" / "SAGRISA_Fuente_Tecnica_Maestra_SQL_Server.pdf"
OUTPUT.parent.mkdir(parents=True, exist_ok=True)

PAGE_W, PAGE_H = letter
BLUE = colors.HexColor("#155EAB")
BLUE_DARK = colors.HexColor("#0B2D4D")
BLUE_MID = colors.HexColor("#2F80C9")
BLUE_LIGHT = colors.HexColor("#EAF3FB")
BLUE_PALE = colors.HexColor("#F5F9FD")
BLACK = colors.HexColor("#111827")
WHITE = colors.white


def P(text: str, style: ParagraphStyle):
    return Paragraph(text, style)


class ArchitectureDiagram(Flowable):
    def __init__(self, width=170 * mm, height=94 * mm):
        super().__init__()
        self.width = width
        self.height = height

    def draw(self):
        c = self.canv
        w, h = self.width, self.height
        c.setStrokeColor(BLUE)
        c.setLineWidth(1)
        c.setFillColor(BLUE_PALE)
        c.roundRect(7, h - 40, w - 14, 27, 7, stroke=1, fill=1)
        c.setFillColor(BLUE_DARK)
        c.setFont("Helvetica-Bold", 10)
        c.drawCentredString(w / 2, h - 25, "Experiencia: React PWA")
        c.setFont("Helvetica", 7.4)
        c.drawCentredString(w / 2, h - 34, "Vite + TypeScript + Tailwind + PWA + almacenamiento local controlado")

        boxes = [
            (7, h - 78, w - 14, 24, "Entrada y gobierno", "Azure API Management"),
            (7, h - 116, w - 14, 24, "Servicios de negocio", "ASP.NET Core Web API"),
        ]
        for x, y, bw, bh, title, value in boxes:
            c.setFillColor(WHITE)
            c.roundRect(x, y, bw, bh, 7, stroke=1, fill=1)
            c.setFillColor(BLUE)
            c.setFont("Helvetica-Bold", 8)
            c.drawString(x + 9, y + 14, title)
            c.setFillColor(BLACK)
            c.setFont("Helvetica", 8)
            c.drawRightString(x + bw - 9, y + 14, value)

        c.setFillColor(BLUE_LIGHT)
        c.roundRect(7, 16, (w - 21) * 0.58, 35, 7, stroke=1, fill=1)
        c.setFillColor(WHITE)
        c.roundRect(7 + (w - 21) * 0.58 + 14, 16, (w - 21) * 0.42, 35, 7, stroke=1, fill=1)
        c.setFillColor(BLUE_DARK)
        c.setFont("Helvetica-Bold", 8)
        c.drawString(16, 38, "Base propia SQL Server")
        c.setFont("Helvetica", 7.2)
        c.drawString(16, 27, "SAGRISA_DB - operación, auditoría")
        c.drawString(16, 18, "y sincronización de la API")
        c.setFillColor(BLUE_DARK)
        c.setFont("Helvetica-Bold", 8)
        c.drawString(7 + (w - 21) * 0.58 + 23, 38, "Sistemas fuente")
        c.setFont("Helvetica", 7.2)
        c.drawString(7 + (w - 21) * 0.58 + 23, 27, "ERP / legado, solo mediante")
        c.drawString(7 + (w - 21) * 0.58 + 23, 18, "adaptadores y contratos definidos")

        arrows = [(w / 2, h - 40, w / 2, h - 54), (w / 2, h - 78, w / 2, h - 92), (w / 2, h - 116, w / 2, 51)]
        for x1, y1, x2, y2 in arrows:
            c.setStrokeColor(BLUE_MID)
            c.setLineWidth(1.5)
            c.line(x1, y1, x2, y2)
            c.line(x2, y2, x2 - 3, y2 + 5)
            c.line(x2, y2, x2 + 3, y2 + 5)

        c.setStrokeColor(BLUE_MID)
        c.line(w * 0.64, 16, w * 0.64, 8)
        c.line(w * 0.64, 8, w * 0.80, 8)
        c.line(w * 0.80, 8, w * 0.80, 16)


class SourceFooterCanvas:
    pass


styles = getSampleStyleSheet()
styles.add(ParagraphStyle(
    name="CoverTitle", parent=styles["Title"], fontName="Helvetica-Bold", fontSize=25,
    leading=30, textColor=BLUE_DARK, alignment=TA_LEFT, spaceAfter=10,
))
styles.add(ParagraphStyle(
    name="CoverSubtitle", parent=styles["Normal"], fontName="Helvetica", fontSize=13,
    leading=18, textColor=BLACK, alignment=TA_LEFT, spaceAfter=18,
))
styles.add(ParagraphStyle(
    name="CoverMeta", parent=styles["Normal"], fontName="Helvetica", fontSize=9.2,
    leading=14, textColor=BLACK, alignment=TA_LEFT,
))
styles.add(ParagraphStyle(
    name="H1Custom", parent=styles["Heading1"], fontName="Helvetica-Bold", fontSize=17,
    leading=21, textColor=BLUE, spaceBefore=2, spaceAfter=9, keepWithNext=True,
))
styles.add(ParagraphStyle(
    name="H2Custom", parent=styles["Heading2"], fontName="Helvetica-Bold", fontSize=11.5,
    leading=14, textColor=BLUE_DARK, spaceBefore=8, spaceAfter=5, keepWithNext=True,
))
styles.add(ParagraphStyle(
    name="BodyCustom", parent=styles["BodyText"], fontName="Helvetica", fontSize=9.15,
    leading=13.2, textColor=BLACK, spaceAfter=6,
))
styles.add(ParagraphStyle(
    name="SmallCustom", parent=styles["BodyText"], fontName="Helvetica", fontSize=7.7,
    leading=10.2, textColor=BLACK, spaceAfter=3,
))
styles.add(ParagraphStyle(
    name="TableHead", parent=styles["BodyText"], fontName="Helvetica-Bold", fontSize=7.8,
    leading=9.5, textColor=WHITE,
))
styles.add(ParagraphStyle(
    name="TableCell", parent=styles["BodyText"], fontName="Helvetica", fontSize=7.5,
    leading=9.4, textColor=BLACK,
))
styles.add(ParagraphStyle(
    name="TableCellBold", parent=styles["BodyText"], fontName="Helvetica-Bold", fontSize=7.5,
    leading=9.4, textColor=BLACK,
))
styles.add(ParagraphStyle(
    name="Callout", parent=styles["BodyText"], fontName="Helvetica", fontSize=8.6,
    leading=12.1, textColor=BLACK, leftIndent=5, rightIndent=5, spaceAfter=5,
))
styles.add(ParagraphStyle(
    name="Kicker", parent=styles["Normal"], fontName="Helvetica-Bold", fontSize=8.5,
    leading=11, textColor=BLUE, tracking=1.2, spaceAfter=7,
))
styles.add(ParagraphStyle(
    name="Footer", parent=styles["Normal"], fontName="Helvetica", fontSize=7,
    leading=8, textColor=BLUE_DARK,
))


def para(text: str, small=False):
    return P(text, styles["SmallCustom" if small else "BodyCustom"])


def bullets(items, small=False):
    flow = []
    for item in items:
        flow.append(para(f"- {item}", small=small))
    return flow


def callout(title: str, body: str, fill=BLUE_LIGHT):
    t = Table([[P(f"<b>{title}</b><br/>{body}", styles["Callout"])]], colWidths=[170 * mm])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), fill),
        ("BOX", (0, 0), (-1, -1), 0.7, BLUE),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))
    return t


def table(headers, rows, widths, font_size=7.5):
    data = [[P(h, styles["TableHead"]) for h in headers]]
    for row in rows:
        data.append([P(str(cell), styles["TableCell"]) for cell in row])
    t = Table(data, colWidths=widths, repeatRows=1, hAlign="LEFT")
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), BLUE),
        ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
        ("GRID", (0, 0), (-1, -1), 0.35, BLUE_MID),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 5),
        ("RIGHTPADDING", (0, 0), (-1, -1), 5),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [WHITE, BLUE_PALE]),
    ]))
    return t


def section(title, body=None):
    flow = [P(title, styles["H1Custom"])]
    if body:
        flow.append(para(body))
    return flow


def header_footer(canvas, doc):
    canvas.saveState()
    if doc.page > 1:
        canvas.setStrokeColor(BLUE)
        canvas.setLineWidth(0.6)
        canvas.line(doc.leftMargin, PAGE_H - 17 * mm, PAGE_W - doc.rightMargin, PAGE_H - 17 * mm)
        canvas.setFillColor(BLUE_DARK)
        canvas.setFont("Helvetica-Bold", 7.5)
        canvas.drawString(doc.leftMargin, PAGE_H - 13 * mm, "SAGRISA | Fuente Técnica Maestra")
        canvas.setFillColor(BLUE)
        canvas.setFont("Helvetica", 7)
        canvas.drawRightString(PAGE_W - doc.rightMargin, PAGE_H - 13 * mm, "Diseño de base propia SQL Server")
    canvas.setStrokeColor(BLUE)
    canvas.setLineWidth(0.5)
    canvas.line(doc.leftMargin, 13 * mm, PAGE_W - doc.rightMargin, 13 * mm)
    canvas.setFillColor(BLUE_DARK)
    canvas.setFont("Helvetica", 7)
    canvas.drawString(doc.leftMargin, 8.5 * mm, "Documento técnico de trabajo | Versión 1.0")
    canvas.drawRightString(PAGE_W - doc.rightMargin, 8.5 * mm, f"Página {doc.page}")
    canvas.restoreState()


doc = BaseDocTemplate(
    str(OUTPUT), pagesize=letter, leftMargin=20 * mm, rightMargin=20 * mm,
    topMargin=23 * mm, bottomMargin=19 * mm, title="SAGRISA - Fuente Tecnica Maestra SQL Server",
    author="Equipo técnico SAGRISA",
)
frame = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id="normal")
doc.addPageTemplates([PageTemplate(id="main", frames=[frame], onPage=header_footer)])

story = []

# Cover
story += [Spacer(1, 28 * mm), P("SAGRISA", styles["Kicker"]), P("Fuente Técnica Maestra", styles["CoverTitle"]),
          P("Arquitectura de la plataforma y diseño de una base de datos propia en SQL Server", styles["CoverSubtitle"]),
          Spacer(1, 7 * mm)]
cover_box = Table([[P("PROPÓSITO DEL DOCUMENTO", styles["TableHead"])],
                   [P("Establecer una base técnica común para construir la base de datos de SAGRISA a partir del SQL de referencia y de los requerimientos funcionales recibidos, considerando que no se entregó una base espejo para replicar.", styles["BodyCustom"])]], colWidths=[170 * mm])
cover_box.setStyle(TableStyle([
    ("BACKGROUND", (0, 0), (-1, 0), BLUE), ("BACKGROUND", (0, 1), (-1, 1), BLUE_LIGHT),
    ("BOX", (0, 0), (-1, -1), 0.8, BLUE), ("LEFTPADDING", (0, 0), (-1, -1), 10),
    ("RIGHTPADDING", (0, 0), (-1, -1), 10), ("TOPPADDING", (0, 0), (-1, -1), 8),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
]))
story.append(cover_box)
story += [Spacer(1, 14 * mm), P("Documento de trabajo para alineación entre ingeniería, negocio e integración", styles["CoverMeta"]),
          P("Versión 1.0 | 2 de septiembre de 2026", styles["CoverMeta"]),
          P("Alcance: plataforma multicanal, API y base de datos SQL Server propia", styles["CoverMeta"]),
          Spacer(1, 20 * mm), callout("Decisión de alcance", "La base se diseñará y construirá con la información disponible. La ausencia de un espejo no detiene el proyecto, pero sí obliga a separar con rigor lo confirmado, lo inferido y lo que debe ser validado.")]
story.append(PageBreak())

# 1
story += section("1. Resumen ejecutivo", "SAGRISA requiere una plataforma multicanal que pueda crecer sin depender de accesos directos desde la interfaz a sistemas legados. La decisión actual es construir una base de datos propia en SQL Server con un modelo coherente para la operación de la API, la trazabilidad y la sincronización con los sistemas externos que finalmente sean confirmados.")
story.append(callout("Idea central", "El proyecto no consiste en copiar una base espejo que no fue entregada. Consiste en diseñar una base operativa propia, tomando el SQL de referencia como evidencia del negocio legado y los requerimientos como autoridad para las reglas futuras."))
story += [P("Este documento consolida el punto de partida real:", styles["H2Custom"])]
story += bullets([
    "El frontend actual es una React PWA con TypeScript, Vite, Tailwind, Workbox y almacenamiento local.",
    "El frontend consume una API HTTP centralizada y utiliza tokens Bearer, correlación de solicitudes y telemetría.",
    "La referencia SQL disponible corresponde a SQL Server y al entorno legado SAGRI_MOVIL.",
    "La base nueva debe ser diseñada de forma relacional y controlada; no debe depender de tablas espejo no entregadas.",
    "Los roles, las operaciones de solo lectura y las operaciones de escritura todavía requieren aprobación funcional.",
])
story.append(P("La arquitectura de referencia mantiene una separación clara entre experiencia, gobierno de APIs, servicios de negocio y datos. Esa separación se conserva, pero la capa de datos se redefine como una base propia SQL Server, con integración controlada cuando se confirme el sistema fuente.", styles["BodyCustom"]))
story.append(PageBreak())

# 2
story += section("2. Fuentes, nivel de certeza y alcance", "La fuente técnica debe ayudar a tomar decisiones sin convertir supuestos en hechos. Por eso cada afirmación del documento se clasifica según la evidencia disponible.")
story.append(table(
    ["Fuente", "Qué aporta", "Nivel"],
    [
        ["PDF maestro de arquitectura", "Capas, roles, seguridad objetivo, API, observabilidad y criterios de aceptación.", "Referencia objetivo"],
        ["docs/database/movil.sql", "DDL de SQL Server, tablas, claves, funciones y stored procedures del legado SAGRI_MOVIL.", "Evidencia técnica"],
        ["Código frontend actual", "Tecnologías instaladas, rutas consumidas, sesión, offline, cobros y contratos TypeScript.", "Implementado en checkout"],
        ["Mensaje del equipo remitente", "Requerimientos funcionales aún en refinamiento y operaciones por perfil pendientes de aprobación.", "Entrada de negocio"],
        ["Espejo de base de datos", "No fue entregado.", "Fuera del alcance disponible"],
    ], [43 * mm, 88 * mm, 39 * mm]
))
story += [P("Decisiones confirmadas para este documento", styles["H2Custom"])]
story += bullets([
    "SQL Server es la tecnología de base de datos de referencia y de construcción.",
    "Se diseñará una base propia para la API y la operación de SAGRISA.",
    "La interfaz no tendrá acceso directo a la base de datos.",
    "Los objetos del legado se estudiarán para conservar comportamiento necesario, no para copiar indiscriminadamente toda su estructura.",
    "No se modificará el código actual como parte de la creación de esta fuente técnica.",
])
story.append(P("Decisiones pendientes que no deben ocultarse", styles["H2Custom"]))
story += bullets([
    "Quién es la autoridad final para facturas, inventario, precios y saldos: la base nueva, el ERP legado o un sistema futuro.",
    "Si Dynamics GP continuará como fuente o si Dynamics 365 será el sistema objetivo.",
    "Qué operaciones podrán ejecutarse offline y cuáles requieren conexión obligatoria.",
    "La matriz aprobada de permisos para clientes, directores, gerentes, ventas y supervisores.",
])
story.append(PageBreak())

# 3
story += section("3. Línea base tecnológica observada en el código", "El checkout analizado es principalmente el frontend. No contiene archivos C#, proyectos .NET ni el código del backend. Por ello, los componentes ASP.NET Core, APIM y la configuración de SQL Server se presentan como arquitectura objetivo o contrato de integración, no como implementación comprobada dentro de este repositorio.")
story.append(table(
    ["Componente", "Tecnología observada", "Implicación"],
    [
        ["Experiencia", "React 19 + TypeScript 6", "Frontend único por perfiles y módulos."],
        ["Construcción", "Vite 8 + Tailwind CSS", "Build web moderno y estilos centralizados."],
        ["PWA", "vite-plugin-pwa + Workbox", "Instalación, caché de shell y experiencia móvil."],
        ["Persistencia local", "localforage", "Catálogo, clientes y cola de operaciones offline."],
        ["Transporte", "fetch API centralizado", "Bearer token, correlación y normalización de respuestas."],
        ["Telemetría", "Application Insights Web", "Instrumentación preparada en frontend."],
        ["Backend esperado", "ASP.NET Core Web API", "Contrato asumido por tipos y comentarios del frontend."],
        ["Datos objetivo", "SQL Server", "Referencia DDL disponible en SAGRI_MOVIL."],
    ], [34 * mm, 53 * mm, 83 * mm]
))
story += [P("Evidencias relevantes", styles["H2Custom"])]
story += bullets([
    "package.json declara React, TypeScript, Vite, Tailwind, vite-plugin-pwa, localforage y Application Insights.",
    "api.config.ts centraliza las llamadas HTTP, agrega X-Correlation-Id y Authorization Bearer, y normaliza ApiResponse<T>.",
    "sync.service.ts encola operaciones POST, PUT y PATCH para reintento al recuperar conectividad.",
    "AuthContext.tsx conserva usuario, token y expiración en almacenamiento del navegador.",
])
story.append(callout("Lectura correcta", "La presencia de una dependencia o de un comentario no demuestra por sí sola que un servicio esté desplegado. El documento separa implementación frontend, backend esperado y decisiones de infraestructura pendientes."))
story.append(PageBreak())

# 4
story += section("4. Arquitectura objetivo para la base propia", "La arquitectura conserva la idea de una entrada única y una API que encapsula las reglas. El cambio importante es que la plataforma deja de esperar un mirror no entregado y define una base SQL Server propia como núcleo operativo de la API.")
story.append(ArchitectureDiagram())
story.append(Spacer(1, 3 * mm))
story.append(table(
    ["Capa", "Responsabilidad", "Regla"],
    [
        ["React PWA", "Experiencia por rol, formularios, navegación y estados offline.", "No consulta SQL ni sistemas externos."],
        ["APIM", "Entrada, validación de token, políticas, límites y trazabilidad técnica.", "No contiene lógica de negocio."],
        ["ASP.NET Core", "Casos de uso, autorización fina, validaciones y transacciones.", "Es la única puerta de acceso a datos."],
        ["SQL Server propio", "Operación, catálogo, clientes, pedidos, cobros, auditoría y cola de integración.", "Base transaccional controlada por migraciones."],
        ["Sistemas externos", "ERP o legado que se confirme como autoridad para determinados datos.", "Acceso mediante adaptadores y contratos explícitos."],
    ], [34 * mm, 83 * mm, 53 * mm]
))
story.append(P("El término mirror SQL no se utilizará para describir la base nueva mientras no se confirme que existe una réplica separada y quién la alimenta. La base que se construirá será denominada base operativa propia SQL Server.", styles["BodyCustom"]))
story.append(PageBreak())

# 5
story += section("5. Principios de diseño de la base de datos", "El diseño debe ser suficientemente normalizado para evitar duplicidades, pero también debe permitir consultas rápidas y una integración gradual con el legado.")
story.append(table(
    ["Principio", "Aplicación en SAGRISA"],
    [
        ["Propiedad clara", "Cada tabla tendrá una finalidad y un dueño funcional definido."],
        ["Separación por esquemas", "Seguridad, maestros, comercial, cartera, integración, auditoría y configuración."],
        ["Transacciones completas", "Pedido, cobro y aprobación se guardan con sus detalles y eventos de estado."],
        ["Trazabilidad", "Usuario, canal, fecha, correlación, origen y evidencia en operaciones sensibles."],
        ["Idempotencia", "Toda operación offline o reintentable tendrá una clave única de operación."],
        ["Concurrencia", "Uso de rowversion o equivalente para evitar sobreescrituras silenciosas."],
        ["Integración aislada", "La comunicación con ERP o legado se concentra en integración y outbox."],
        ["Migraciones repetibles", "El esquema se crea mediante scripts versionados y verificables."],
    ], [45 * mm, 125 * mm]
))
story += [P("Esquemas propuestos", styles["H2Custom"])]
story.append(table(
    ["Esquema", "Contenido inicial"],
    [
        ["seguridad", "Usuario, rol, permiso, alcance y relación usuario-rol."],
        ["maestros", "Cliente, dirección, vendedor, división, producto, familia y bodega."],
        ["comercial", "Pedido, detalle, estado, entrega y trazabilidad comercial."],
        ["cartera", "Factura, saldo, cobro, aplicación de cobro y evidencia."],
        ["integracion", "Mensajes de entrada/salida, outbox, importaciones y errores."],
        ["auditoria", "Eventos de seguridad, cambios y operaciones sensibles."],
        ["configuracion", "Métodos de pago, catálogos parametrizables y reglas configurables."],
    ], [38 * mm, 132 * mm]
))
story.append(PageBreak())

# 6
story += section("6. Modelo lógico inicial", "El modelo no se presenta como un DDL definitivo. Es la estructura lógica que debe convertirse en migraciones después de validar los requerimientos de perfiles, datos y autoridad transaccional.")
story.append(table(
    ["Dominio", "Entidades propias", "Relaciones clave"],
    [
        ["Identidad", "Usuario, Rol, Permiso, UsuarioRol, UsuarioAlcance", "Usuario -> roles -> permisos; alcance por país, región, vendedor o cliente."],
        ["Clientes", "Cliente, DirecciónEntrega, ClienteVendedor", "Cliente tiene direcciones y puede estar asignado a vendedores."],
        ["Catálogo", "Producto, Familia, Bodega, Existencia, ListaPrecio, PrecioCliente", "Producto puede tener existencias por bodega y precios por lista/cliente."],
        ["Pedidos", "Pedido, PedidoDetalle, EstadoPedido, PedidoEvento", "Pedido tiene N detalles y un historial de estados."],
        ["Facturación", "Factura, FacturaSaldo, FacturaOrigen", "La factura puede provenir de integración y debe conservar identificador externo."],
        ["Cobros", "Cobro, CobroAplicacion, MétodoPago, EvidenciaCobro", "Un cobro se distribuye en N facturas; la suma aplicada debe coincidir con el total."],
        ["Integración", "OperacionIdempotente, OutboxMessage, Importacion, ErrorIntegracion", "Permite reintentos sin duplicar y deja evidencia de sincronización."],
    ], [33 * mm, 55 * mm, 82 * mm]
))
story += [P("Relación fundamental de cobros", styles["H2Custom"]), callout("Cobro 1:N", "Cobro representa la captura del pago. CobroAplicacion representa cómo se distribuye ese pago entre una o varias facturas. Esta separación refleja el comportamiento real observado en SAGRI_MOVIL y evita forzar una relación un cobro = una factura."), P("Identificadores externos", styles["H2Custom"])]
story.append(para("Las tablas que reciban información del ERP o del legado deben conservar un identificador externo, sistema de origen, fecha de última sincronización y estado de integración. No se deben usar nombres heredados como clave primaria de la base nueva sin una regla explícita de equivalencia."))
story.append(PageBreak())

# 7
story += section("7. Qué se toma del SQL legado y qué no se copia", "El archivo movil.sql es una referencia valiosa porque muestra reglas, nombres, tipos, procesos y problemas existentes. No debe convertirse automáticamente en el modelo final de la plataforma nueva.")
story.append(table(
    ["Hallazgo en legado", "Decisión para la base propia"],
    [
        ["Base [Movil] en SQL Server, compatibilidad 130.", "Mantener SQL Server como tecnología de construcción; confirmar versión destino y servicio de ejecución."],
        ["76 stored procedures activos según el análisis del DDL.", "Catalogar por comportamiento; migrar solo los necesarios para casos de uso aprobados."],
        ["Tablas espejo sin PK/FK y tablas operativas con constraints.", "No replicar la falta de integridad. La base nueva debe tener claves, índices y relaciones propias."],
        ["Tres canales de autenticación legados.", "No copiar contraseñas ni sesiones legadas; definir un mecanismo único para la API."],
        ["Tablas de precios con dimensiones fiscales y por cliente.", "Diseñar precios como dominio explícito y validar país, área, lista y vigencia."],
        ["Cobro separado de pagos y detalles.", "Adoptar Cobro + CobroAplicacion y registrar evidencia y estados."],
        ["Dependencias a Dynamics GP y macros/procesos externos.", "Aislarlas en integración hasta confirmar el sistema fuente futuro."],
    ], [73 * mm, 97 * mm]
))
story.append(callout("Regla de migración", "La ausencia del espejo significa que no se puede prometer una migración fila por fila ni una equivalencia completa de todos los stored procedures. El alcance correcto es construir el modelo requerido y preparar importadores controlados para los datos que sí sean entregados."))
story += [P("Clasificación de datos para una primera carga", styles["H2Custom"])]
story += bullets([
    "Maestros: clientes, productos, familias, bodegas, vendedores, divisiones y métodos de pago.",
    "Operación: pedidos, detalles, entregas, cobros y aplicaciones de cobro.",
    "Consulta: facturas, saldos, inventario y precios, solo si se recibe un origen confiable.",
    "Histórico: cargarlo por lotes y con su origen; no bloquear la operación por datos históricos incompletos.",
])
story.append(PageBreak())

# 8
story += section("8. Contratos API y correspondencia con el frontend", "El frontend actual ya define una expectativa de API. La nueva base debe diseñarse para soportar esos casos de uso, pero el contrato debe alinearse antes de declarar integración terminada.")
story.append(table(
    ["Caso de uso", "Ruta usada actualmente", "Persistencia principal"],
    [
        ["Catálogo y existencias", "/productos", "maestros.Producto, Bodega, Existencia, Precio"],
        ["Clientes", "/clientes", "maestros.Cliente, DirecciónEntrega, asignaciones"],
        ["Pedidos", "/pedidos", "comercial.Pedido, PedidoDetalle, PedidoEvento"],
        ["Cobros", "/cobros", "cartera.Cobro, CobroAplicacion, EvidenciaCobro"],
        ["Facturas", "/invoices", "cartera.Factura y origen externo"],
        ["Cartera", "/accounts/me", "cartera.FacturaSaldo y reglas de alcance"],
        ["Aprobaciones", "/approvals", "comercial o auditoria, según el flujo aprobado"],
        ["Metas y reportes", "/goals y /reports", "agregados calculados y consultas protegidas"],
    ], [42 * mm, 43 * mm, 85 * mm]
))
story.append(P("Existe una diferencia entre el contrato OpenAPI, que usa nombres como /customers, /orders y /collections, y las rutas runtime del frontend, que usan /clientes, /pedidos y /cobros. Debe elegirse una nomenclatura canónica y actualizar el contrato antes de generar clientes, pruebas de integración o políticas APIM.", styles["BodyCustom"]))
story += [P("Respuesta mínima de la API", styles["H2Custom"])]
story += bullets([
    "Identificador interno y, cuando aplique, identificador externo.",
    "Estado de negocio y estado de integración por separado.",
    "Fecha de creación, actualización y usuario responsable.",
    "Correlation ID para seguir la operación entre PWA, APIM, API, SQL Server e integración.",
    "Errores con código estable para que la PWA pueda distinguir validación, conflicto, sesión expirada y fallo temporal.",
])
story.append(PageBreak())

# 9
story += section("9. Operación offline, cobros e idempotencia", "La PWA actual permite encolar operaciones de escritura cuando no hay conectividad. Esta capacidad es útil para vendedores, pero debe tener reglas de negocio y controles de servidor antes de usarse con cobros reales.")
story.append(table(
    ["Momento", "Responsabilidad", "Control requerido"],
    [
        ["Captura offline", "La PWA registra la operación y la conserva localmente.", "No mostrarla como aplicada; mostrar pendiente."],
        ["Reintento", "La cola reenvía el payload al recuperar conexión.", "Enviar operationId e Idempotency-Key."],
        ["Recepción API", "ASP.NET valida permisos, alcance y reglas.", "Rechazar duplicados y conflictos con respuestas estables."],
        ["Transacción SQL", "Se guarda cobro y aplicaciones en una sola transacción.", "La suma aplicada debe coincidir con el monto capturado."],
        ["Integración", "Se publica el evento hacia el sistema fuente, si corresponde.", "Outbox, reintentos y estado de confirmación."],
        ["Resultado", "La PWA actualiza el estado local.", "Distinguir pendiente, aplicado, rechazado y requiere revisión."],
    ], [34 * mm, 75 * mm, 61 * mm]
))
story.append(callout("Riesgo prioritario", "La cola local actualmente genera identificadores del navegador y reenvía el mismo payload. Para evitar doble recaudación, la base SQL Server debe registrar la operación idempotente antes de aplicar el cobro."))
story += [P("Contrato lógico recomendado para un cobro", styles["H2Custom"])]
story.append(table(
    ["Objeto", "Campos esenciales"],
    [
        ["Cobro", "id, cliente, montoTotal, método, fechaCaptura, usuario, canal, estado, operationId"],
        ["CobroAplicacion", "id, cobroId, facturaId, montoAplicado, saldoAntes, saldoDespués"],
        ["EvidenciaCobro", "cobroId, referencia, archivo o ubicación segura, firma, hash, fecha"],
        ["OperacionIdempotente", "operationId, endpoint, usuario, payloadHash, resultado, fecha, expiración"],
    ], [42 * mm, 128 * mm]
))
story.append(PageBreak())

# 10
story += section("10. Seguridad, identidad y autorización", "La seguridad debe vivir en la API y en la base, no solo en los botones de la PWA. El frontend actual ayuda a presentar permisos, pero no puede ser la autoridad final.")
story.append(table(
    ["Nivel", "Responsabilidad"],
    [
        ["APIM", "Validar la presencia, firma y vigencia del token; aplicar políticas comunes."],
        ["ASP.NET Core", "Resolver rol, permisos, alcance, ownership y reglas de transición."],
        ["SQL Server", "Aplicar constraints, claves únicas, relaciones, auditoría y consistencia transaccional."],
        ["PWA", "Ocultar acciones no permitidas y comunicar estados; nunca sustituir la autorización del backend."],
    ], [42 * mm, 128 * mm]
))
story += [P("Perfiles observados en el frontend", styles["H2Custom"])]
story.append(table(
    ["Perfil", "Capacidades visibles actuales", "Validación pendiente"],
    [
        ["Cliente", "Consulta de cuenta, facturas, pedidos y cobros propios.", "Qué puede crear o modificar exactamente."],
        ["Vendedor", "Pedidos, catálogo, clientes, cobros y reportes.", "Límites por división, país y cartera."],
        ["Supervisor", "Seguimiento de equipo, metas, analítica y aprobaciones de lectura.", "Operaciones de escritura y alcance del equipo."],
        ["Gerente", "Aprobaciones, metas, analítica, reportes y catálogo.", "Autorizaciones, anulaciones y límites monetarios."],
        ["Director", "Lectura estratégica, metas, analítica y reportes.", "Reglas de visibilidad regional y datos sensibles."],
    ], [28 * mm, 78 * mm, 64 * mm]
))
story.append(P("La arquitectura objetivo del PDF maestro propone Microsoft Entra ID, pero el frontend actual muestra un flujo DUI + PIN y conserva el token en el navegador. La decisión debe documentarse como transición o sustituirse por una integración corporativa real antes de producción. No se debe afirmar que Entra está implementado sin evidencia del backend y del registro de aplicación.", styles["BodyCustom"]))
story.append(PageBreak())

# 11
story += section("11. Despliegue, configuración y observabilidad", "La base propia debe poder evolucionar por ambientes sin compartir secretos ni depender de configuraciones manuales irrepetibles.")
story.append(table(
    ["Ambiente", "Componentes mínimos", "Objetivo"],
    [
        ["Desarrollo", "PWA local, API local, SQL Server de desarrollo y datos semilla.", "Construcción y pruebas rápidas."],
        ["Staging", "PWA desplegada, API, APIM o gateway equivalente, SQL Server aislado y telemetría.", "Integración y aceptación."],
        ["Producción", "PWA, APIM, API, SQL Server con respaldo y observabilidad.", "Operación controlada y recuperación."],
    ], [31 * mm, 92 * mm, 47 * mm]
))
story += [P("Configuración requerida", styles["H2Custom"])]
story += bullets([
    "Cadena de conexión SQL Server fuera del repositorio y con permisos mínimos.",
    "URL de API y URL real de APIM separadas por ambiente.",
    "Configuración de identidad y validación de audiencia/emisor.",
    "Connection string de Application Insights configurada únicamente en ambientes donde corresponda.",
    "Políticas de CORS, límites de tamaño para evidencias y tiempo de expiración de tokens.",
    "Respaldos, retención y procedimiento de restauración probados.",
])
story.append(P("La instrumentación de Application Insights está preparada en el frontend, pero el ambiente actual solo declara VITE_API_URL y VITE_AUTH_LOGIN_PATH. Para declarar observabilidad activa deben configurarse también las variables y la telemetría del backend y del gateway.", styles["BodyCustom"]))
story += [P("Pruebas de aceptación técnica", styles["H2Custom"])]
story += bullets([
    "La PWA no puede conectarse directamente a SQL Server.",
    "La API rechaza operaciones fuera del alcance del usuario aunque se invoquen manualmente.",
    "Una repetición del mismo operationId no duplica pedido ni cobro.",
    "Un cobro distribuido entre varias facturas conserva suma, saldos y auditoría.",
    "Una migración aplicada dos veces no rompe el esquema.",
    "Los errores pueden rastrearse por correlation ID.",
])
story.append(PageBreak())

# 12
story += section("12. Plan de construcción de la base propia", "La secuencia propuesta reduce riesgos: primero se fija el modelo y la autoridad de cada dato; después se habilita la operación y finalmente se conectan los procesos legados que sean necesarios.")
story.append(table(
    ["Fase", "Entregable", "Condición de salida"],
    [
        ["0. Validación funcional", "Matriz de roles, lectura/escritura, estados y autoridad de datos.", "Aprobación de negocio."],
        ["1. Fundaciones SQL Server", "Base, esquemas, convenciones, migraciones, auditoría e idempotencia.", "Creación limpia y repetible."],
        ["2. Maestros", "Clientes, usuarios, productos, bodegas, precios y métodos de pago.", "Consultas y claves validadas."],
        ["3. Pedidos", "Encabezado, detalle, estados, entregas y trazabilidad.", "Flujo completo probado."],
        ["4. Facturas y cobros", "Facturas, saldos, cobro 1:N, evidencia y conciliación.", "Casos offline y duplicados controlados."],
        ["5. Integración", "Importadores, outbox y adaptadores hacia el sistema fuente.", "Errores y reintentos observables."],
        ["6. Endurecimiento", "Seguridad, rendimiento, respaldos y pruebas de carga.", "Criterios de producción aprobados."],
    ], [35 * mm, 84 * mm, 51 * mm]
))
story.append(callout("Alcance de los 76 stored procedures", "No se recomienda traducir automáticamente los 76 procedimientos al nuevo modelo. Primero se debe crear un inventario por caso de uso, identificar dependencias con GP y migrar únicamente la lógica que la API nueva requiera y que el negocio haya aprobado."))
story.append(P("La Fase 1 funcional y la construcción de la base pueden avanzar de forma coordinada, pero no debe iniciarse la implementación de cobros definitivos mientras no estén aprobados el modelo 1:N, la idempotencia y el dueño de los saldos.", styles["BodyCustom"]))
story.append(PageBreak())

# 13
story += section("13. Riesgos y decisiones que requieren respuesta", "Estas decisiones no bloquean la elaboración de la fuente técnica, pero sí condicionan el DDL final, la integración y las pruebas.")
story.append(table(
    ["Decisión", "Por qué importa", "Recomendación de trabajo"],
    [
        ["Sistema de autoridad", "Evita que API, SQL y ERP mantengan saldos diferentes.", "Definir dueño por dominio: clientes, precios, inventario, facturas, cobros."],
        ["GP frente a Dynamics 365", "El SQL legado contiene dependencias de GP y el PDF menciona Dynamics 365.", "Documentar transición y adaptadores separados."],
        ["APIM real", "La URL actual parece apuntar al App Service directamente.", "Verificar gateway, rutas, JWT, CORS y políticas."],
        ["Identidad", "DUI + PIN actual no equivale a Entra ID.", "Definir transición o integración corporativa definitiva."],
        ["Offline", "Los reintentos pueden duplicar operaciones sensibles.", "Hacer obligatorio operationId e idempotencia en servidor."],
        ["Requerimientos por perfil", "El mensaje recibido indica que aún se refinan.", "No cerrar permisos solo con la matriz inicial del frontend."],
        ["Histórico", "No existe espejo entregado para garantizar completitud.", "Definir fuentes y profundidad de carga por dominio."],
    ], [43 * mm, 61 * mm, 66 * mm]
))
story.append(P("Riesgo operativo principal", styles["H2Custom"]))
story.append(para("El mayor riesgo no es crear las tablas. Es crear una estructura técnicamente correcta pero con una autoridad equivocada para saldos, inventario, facturas o cobros. Por eso la primera aprobación requerida es funcional y de integración, no solamente de infraestructura."))
story.append(PageBreak())

# 14
story += section("14. Criterios para aprobar la fuente técnica", "El documento puede considerarse base de implementación cuando ingeniería y negocio confirmen los siguientes puntos.")
story += bullets([
    "El nombre, ambiente y versión objetivo de SQL Server están definidos.",
    "La base propia y cualquier base de integración están separadas conceptualmente.",
    "Cada dominio tiene una autoridad de datos y una estrategia de sincronización.",
    "Las operaciones de cada rol tienen permiso, alcance y estado esperado.",
    "El cobro soporta una o varias facturas, evidencia y conciliación.",
    "La operación offline tiene una política explícita y no se usa como confirmación contable inmediata.",
    "El contrato OpenAPI coincide con las rutas que consumirá el frontend.",
    "La identidad, el gateway y la telemetría tienen evidencia de configuración en staging.",
    "Las migraciones y cargas iniciales pueden ejecutarse en un ambiente limpio.",
])
story.append(callout("Siguiente acción recomendada", "Convocar una sesión breve con el ingeniero y los responsables funcionales para aprobar la matriz de autoridad de datos, roles y cobros. Con esa aprobación se puede convertir este modelo lógico en el DDL inicial de SQL Server sin inventar reglas."))
story += [P("Anexo A. Evidencia consultada", styles["H1Custom"])]
story.append(table(
    ["Referencia", "Uso en este documento"],
    [
        ["SAGRISA_Fuente_Tecnica_Maestra.pdf", "Arquitectura objetivo, capas, roles, OpenAPI, seguridad y aceptación."],
        ["docs/database/movil.sql", "Referencia SQL Server del entorno SAGRI_MOVIL."],
        ["package.json", "Tecnologías y dependencias reales del frontend."],
        ["vite.config.ts", "Configuración PWA y Workbox."],
        ["src/core/api/api.config.ts", "Transporte, token, correlación, errores y offline."],
        ["src/core/api/sync.service.ts", "Cola local y reintentos de operaciones."],
        ["src/features/cobros/services/cobros.service.ts", "Contrato actual 1:1 de cobros y evidencia."],
        ["docs/openapi/sagrisa-v1.yaml", "Contrato documental que debe alinearse con runtime."],
    ], [67 * mm, 103 * mm]
))
story.append(Spacer(1, 5 * mm))
story.append(P("Cierre", styles["H2Custom"]))
story.append(para("La decisión de construir una base propia es viable y coherente con la información disponible. El enfoque recomendado es SQL Server como núcleo operativo de SAGRISA, una API que encapsule reglas y una integración controlada con el legado o ERP que se confirme. La base se debe construir con integridad, trazabilidad e idempotencia desde el inicio, dejando los supuestos visibles para que puedan aprobarse antes de convertirse en código."))

doc.build(story)
print(OUTPUT)
