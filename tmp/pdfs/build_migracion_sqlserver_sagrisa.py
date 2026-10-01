from __future__ import annotations

import math
import re
import sys
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import (
    Frame,
    Flowable,
    KeepTogether,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    PageBreak,
)
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen.canvas import Canvas


SCRIPT_DIR = Path(__file__).resolve().parent
ROOT = SCRIPT_DIR.parent.parent
sys.path.insert(0, str(SCRIPT_DIR))
import build_guia_migracion_sagrisa as base


OUT = ROOT / "output" / "pdf" / "plan_migracion_sagrisa_sqlserver.pdf"
PAGE_W, PAGE_H = base.PAGE_W, base.PAGE_H
MARGIN_L, MARGIN_R = base.MARGIN_L, base.MARGIN_R
MARGIN_T, MARGIN_B = base.MARGIN_T, base.MARGIN_B
CONTENT_W = base.CONTENT_W
INK = base.INK
MUTED = base.MUTED
LINE = base.LINE
BLUE = base.BLUE
BLUE_DARK = base.BLUE_DARK
BLUE_BG = base.BLUE_BG
LIGHT = colors.white


if "SQLKicker" not in base.styles:
    base.styles.add(ParagraphStyle(
        name="SQLKicker", parent=base.styles["Kicker"], fontName="Arial-Bold",
        fontSize=8, leading=10, textColor=BLUE, spaceAfter=7,
    ))
if "SQLH1" not in base.styles:
    base.styles.add(ParagraphStyle(
        name="SQLH1", parent=base.styles["H1x"], fontName="Arial-Bold",
        fontSize=20, leading=24, textColor=INK, spaceBefore=0, spaceAfter=8,
    ))
if "SQLH2" not in base.styles:
    base.styles.add(ParagraphStyle(
        name="SQLH2", parent=base.styles["H2x"], fontName="Arial-Bold",
        fontSize=11.5, leading=14, textColor=BLUE_DARK, spaceBefore=5, spaceAfter=5,
    ))
if "SQLBody" not in base.styles:
    base.styles.add(ParagraphStyle(
        name="SQLBody", parent=base.styles["Bodyx"], fontName="Arial",
        fontSize=9.0, leading=12.8, textColor=INK, spaceAfter=5,
    ))
if "SQLSmall" not in base.styles:
    base.styles.add(ParagraphStyle(
        name="SQLSmall", parent=base.styles["Smallx"], fontName="Arial",
        fontSize=7.3, leading=9.5, textColor=MUTED, spaceAfter=3,
    ))
if "SQLTableHead" not in base.styles:
    base.styles.add(ParagraphStyle(
        name="SQLTableHead", parent=base.styles["TableHead"], fontName="Arial-Bold",
        fontSize=7.3, leading=9.0, textColor=colors.white,
    ))
if "SQLTableCell" not in base.styles:
    base.styles.add(ParagraphStyle(
        name="SQLTableCell", parent=base.styles["TableCell"], fontName="Arial",
        fontSize=7.25, leading=9.25, textColor=INK,
    ))


def sp(text: str, style: str = "SQLBody") -> Paragraph:
    return Paragraph(text, base.styles[style])


def sql_title(kicker: str, heading: str, intro: str | None = None):
    items = [sp(kicker.upper(), "SQLKicker"), sp(heading, "SQLH1")]
    if intro:
        items.append(sp(intro, "SQLBody"))
    items.append(Spacer(1, 5))
    return items


def sql_table(headers, rows, widths, tints=None):
    data = [[sp(h, "SQLTableHead") for h in headers]]
    for row in rows:
        data.append([sp(str(cell), "SQLTableCell") for cell in row])
    table = Table(data, colWidths=widths, repeatRows=1, hAlign="LEFT")
    commands = [
        ("BACKGROUND", (0, 0), (-1, 0), BLUE_DARK),
        ("GRID", (0, 0), (-1, -1), 0.35, LINE),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]
    for idx in range(1, len(data)):
        commands.append(("BACKGROUND", (0, idx), (-1, idx), LIGHT if idx % 2 else BLUE_BG))
    for idx in (tints or {}):
        commands.append(("BACKGROUND", (0, idx), (-1, idx), BLUE_BG))
    table.setStyle(TableStyle(commands))
    return table


def sql_callout(heading: str, body: str):
    content = [sp(heading, "SQLH2"), sp(body, "SQLBody")]
    table = Table([[content]], colWidths=[CONTENT_W])
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), BLUE_BG),
        ("BOX", (0, 0), (-1, -1), 0.7, LINE),
        ("LINEBEFORE", (0, 0), (0, -1), 4, BLUE),
        ("LEFTPADDING", (0, 0), (-1, -1), 13),
        ("RIGHTPADDING", (0, 0), (-1, -1), 13),
        ("TOPPADDING", (0, 0), (-1, -1), 9),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
    ]))
    return table


def sql_box(label: str, body: str, width=CONTENT_W / 2 - 7):
    table = Table([[sp(label.upper(), "SQLSmall")], [sp(body, "SQLBody")]], colWidths=[width])
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), BLUE_BG),
        ("BOX", (0, 0), (-1, -1), 0.6, LINE),
        ("LINEABOVE", (0, 0), (-1, 0), 3, BLUE),
        ("LEFTPADDING", (0, 0), (-1, -1), 11),
        ("RIGHTPADDING", (0, 0), (-1, -1), 11),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
    ]))
    return table


def sql_two_col(left, right):
    table = Table([[left, right]], colWidths=[CONTENT_W / 2, CONTENT_W / 2])
    table.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 7),
        ("TOPPADDING", (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
    ]))
    return table


def sql_footer(text: str):
    return Table([[sp(text, "SQLSmall")]], colWidths=[CONTENT_W], style=TableStyle([
        ("LINEABOVE", (0, 0), (-1, 0), 0.5, LINE),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
    ]))


class SqlServerTargetDiagram(Flowable):
    def __init__(self, width=CONTENT_W, height=194):
        super().__init__()
        self.width = width
        self.height = height

    def wrap(self, avail_width, avail_height):
        return min(self.width, avail_width), self.height

    def draw(self):
        c = self.canv
        w, h = self.width, self.height
        c.setFillColor(LIGHT)
        c.setStrokeColor(LINE)
        c.roundRect(0, 0, w, h, 12, fill=1, stroke=1)

        def box(x, y, bw, bh, label, sub):
            c.setFillColor(BLUE_BG)
            c.setStrokeColor(BLUE)
            c.roundRect(x, y, bw, bh, 8, fill=1, stroke=1)
            c.setFillColor(INK)
            c.setFont("Arial-Bold", 8.5)
            c.drawCentredString(x + bw / 2, y + bh - 19, label)
            c.setFillColor(MUTED)
            c.setFont("Arial", 7)
            for index, line in enumerate(sub.split("\n")):
                c.drawCentredString(x + bw / 2, y + bh - 33 - index * 10, line)

        def arrow(x1, y1, x2, y2):
            c.setStrokeColor(BLUE_DARK)
            c.setFillColor(BLUE_DARK)
            c.setLineWidth(1.2)
            c.line(x1, y1, x2, y2)
            angle = math.atan2(y2 - y1, x2 - x1)
            size = 5
            c.line(x2, y2, x2 - size * math.cos(angle - 0.45), y2 - size * math.sin(angle - 0.45))
            c.line(x2, y2, x2 - size * math.cos(angle + 0.45), y2 - size * math.sin(angle + 0.45))

        box(16, 118, 110, 48, "PWA", "captura")
        box(190, 118, 110, 48, "APIM", "acceso")
        box(364, 118, 110, 48, "API", "reglas")
        arrow(126, 142, 190, 142)
        arrow(300, 142, 364, 142)

        box(20, 31, 140, 50, "STAGING", "carga y transformacion")
        box(190, 31, 155, 50, "SQL SERVER TARGET", "base operativa")
        box(375, 31, 153, 50, "SAGRI_MOVIL / GP", "legacy y ERP")
        arrow(419, 118, 270, 81)
        arrow(160, 56, 190, 56)
        arrow(345, 56, 375, 56)
        c.setFillColor(MUTED)
        c.setFont("Arial", 7)
        c.drawCentredString(w / 2, 10, "La base operativa y el legado se integran por contratos, no por acceso directo desde la PWA")


class MigrationTimeline(Flowable):
    def __init__(self, width=CONTENT_W, height=118):
        super().__init__()
        self.width = width
        self.height = height

    def wrap(self, avail_width, avail_height):
        return min(self.width, avail_width), self.height

    def draw(self):
        c = self.canv
        w, h = self.width, self.height
        c.setFillColor(LIGHT)
        c.setStrokeColor(LINE)
        c.roundRect(0, 0, w, h, 10, fill=1, stroke=1)
        xs = [57, 166, 275, 384, 493]
        labels = ["Inventario", "Esquema", "Carga", "Rehearsal", "Cutover"]
        subs = ["evidencia", "DDL", "staging", "prueba", "cambio"]
        c.setStrokeColor(BLUE)
        c.setLineWidth(1.4)
        c.line(xs[0], 67, xs[-1], 67)
        for index, x in enumerate(xs):
            c.setFillColor(BLUE_DARK if index == 4 else BLUE)
            c.circle(x, 67, 13, fill=1, stroke=0)
            c.setFillColor(LIGHT)
            c.setFont("Arial-Bold", 8)
            c.drawCentredString(x, 64, str(index + 1))
            c.setFillColor(INK)
            c.setFont("Arial-Bold", 7.5)
            c.drawCentredString(x, 38, labels[index])
            c.setFillColor(MUTED)
            c.setFont("Arial", 6.8)
            c.drawCentredString(x, 26, subs[index])


def on_sqlserver_page(canvas: Canvas, doc):
    canvas.saveState()
    page = canvas.getPageNumber()
    if page == 1:
        canvas.setFillColor(INK)
        canvas.rect(0, PAGE_H - 8, PAGE_W, 8, fill=1, stroke=0)
    else:
        canvas.setFillColor(BLUE)
        canvas.rect(0, PAGE_H - 6, PAGE_W, 6, fill=1, stroke=0)
        canvas.setFont("Arial-Bold", 7)
        canvas.setFillColor(MUTED)
        canvas.drawString(MARGIN_L, PAGE_H - 28, "SAGRISA  /  PLAN DE MIGRACION A SQL SERVER")
        canvas.setFont("Arial", 7)
        canvas.drawRightString(PAGE_W - MARGIN_R, 22, f"Documento de trabajo  |  {page}")
        canvas.setStrokeColor(LINE)
        canvas.line(MARGIN_L, 32, PAGE_W - MARGIN_R, 32)
    canvas.restoreState()


class SqlServerDocTemplate(base.TechnicalDocTemplate):
    """Plantilla con marcadores para los encabezados de esta guía."""

    def afterFlowable(self, flowable):
        if isinstance(flowable, Paragraph) and flowable.style.name in {"SQLH1", "H1x"}:
            text = flowable.getPlainText()
            key = "sqlserver-section-" + re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
            self.canv.bookmarkPage(key)
            self.canv.addOutlineEntry(text, key, level=0, closed=False)


def build_story():
    story = []

    # Cover
    story.extend([Spacer(1, 25), sp("SAGRISA", "SQLKicker"), sp("Plan de migración a SQL Server", "CoverTitle")])
    story.append(sp("Base operativa de la API y relación controlada con SAGRI_MOVIL / Dynamics GP", "CoverSubtitle"))
    story.append(sql_callout(
        "Decisión central",
        "El destino de la base operativa será SQL Server. El archivo movil.sql ya es un snapshot T-SQL del legado; no lo trataremos como si fuera la migración de la API ni lo ejecutaremos en bloque. La API nueva tendrá su propio esquema, migraciones y controles de operación.",
    ))
    story.append(Spacer(1, 18))
    story.append(SqlServerTargetDiagram(height=194))
    story.append(Spacer(1, 18))
    story.append(sql_two_col(
        sql_box("Estado", "Propuesta técnica de migración. Requiere validar el backend, los requerimientos funcionales y la instancia SQL Server objetivo."),
        sql_box("Base del análisis", "movil.sql, código de la PWA, contrato OpenAPI, correo recibido y documentación oficial de Microsoft."),
    ))
    story.append(Spacer(1, 8))
    story.append(sp("Fecha de corte: 2 de septiembre de 2026. Audiencia: producto, arquitectura, desarrollo, datos, QA, seguridad y operación.", "SQLSmall"))
    story.append(PageBreak())

    # Reading route
    story.extend(sql_title("Ruta de lectura", "Qué decisión guía el documento", "La guía distingue el SQL legacy de la base operativa que se desea llevar a SQL Server. Cada etapa termina con una evidencia concreta para continuar o detenerse."))
    story.append(sql_table(
        ["Sección", "Pregunta", "Salida"],
        [
            ["01. Decisión y alcance", "¿Qué estamos migrando?", "Base API a SQL Server; legacy como integración."],
            ["02. Estado de origen", "¿Qué contiene movil.sql?", "Inventario, dependencias y límites del snapshot."],
            ["03. Diseño objetivo", "¿Cómo quedará la plataforma?", "SQL Server detrás de la API y adaptadores controlados."],
            ["04. Esquema y proveedor", "¿Cómo se traduce el modelo?", "Tipos, migraciones y configuración específica."],
            ["05. Datos", "¿Cómo movemos y comprobamos la información?", "Staging, mapping, cargas, reconciliación y cutover."],
            ["06. Cobros", "¿Cómo protegemos el dinero?", "1:N, idempotencia, bloqueo y auditoría."],
            ["07. Legacy", "¿Qué hacemos con los 76 SP?", "Integración por capacidad; no traducción masiva."],
            ["08. Ejecución", "¿Cuál es el orden?", "Rehearsal, ventana de cambio, rollback y salida."],
            ["09. Decisiones pendientes", "¿Qué debe confirmar el equipo?", "Riesgos, responsables y criterios de aprobación."],
        ],
        [150, 205, 185],
        tints={1: True, 3: True, 5: True, 7: True, 9: True},
    ))
    story.append(Spacer(1, 12))
    story.append(sql_callout(
        "Regla de lectura",
        "Cuando el texto dice ""comprobado"", se refiere a una observación del SQL, de la PWA o del contrato disponible. Cuando dice ""propuesta"", se trata de una decisión recomendada. Los puntos ""pendientes"" necesitan aprobación o información adicional.",
    ))

    # 01 Decision and scope
    story.extend(sql_title("01 / Decisión y alcance", "La migración tiene dos pistas que no debemos confundir", "El destino SQL Server es claro para la base operativa nueva. El legado también vive en SQL Server, pero cumple otra función y no debe dictar la forma interna de la API."))
    story.append(sql_table(
        ["Pista", "Qué se hace", "Qué no se debe asumir"],
        [
            ["A. API operativa", "Llevar el esquema y la ejecución de la API a SQL Server: proveedor, migraciones 001-006, tipos, índices, transacciones y pruebas.", "Que el dump legacy sea el modelo de dominio nuevo."],
            ["B. Legacy", "Conservar SAGRI_MOVIL como sistema integrado mientras se documentan sus capacidades y dependencias.", "Que los 76 procedimientos deban traducirse ahora o que el archivo sea autosuficiente."],
            ["C. Datos", "Mover solo datos cuyo ownership y mapping estén aprobados; cargar staging, transformar y reconciliar.", "Que todos los objetos y filas tengan que pasar al mismo esquema."],
        ],
        [102, 250, 188],
        tints={1: True, 2: True, 3: True},
    ))
    story.append(Spacer(1, 11))
    story.append(sql_two_col(
        sql_box("Dentro de esta guía", "SQL Server como target operativo, traducción del esquema de la API, cobro 1:N, offline, idempotencia, seguridad, migración de datos, integración y cutover."),
        sql_box("Fuera de esta guía", "Traducción completa de la lógica legacy, reemplazo inmediato de Dynamics GP, definición final de perfiles aún no aprobados y datos no trazables."),
    ))
    story.append(Spacer(1, 10))
    story.append(sql_callout(
        "Decisión de alcance",
        "Los scripts 001-006, si corresponden a migraciones reales de la API, sí forman parte del trabajo de SQL Server. Los 76 SP del legado se inventarían como una segunda migración si se metieran en el mismo paquete; por eso se mantienen como track de integración.",
    ))

    # 02 Source audit
    story.extend(sql_title("02 / Estado de origen", "movil.sql es un snapshot T-SQL con responsabilidades mezcladas", "La primera tarea no es ejecutar el archivo. Es confirmar qué ambiente representa, qué dependencias externas requiere y qué partes son reutilizables como evidencia."))
    story.append(base.metrics_row([
        base.metric(str(base.STATS["tables"]), "tablas", BLUE_BG),
        base.metric(str(base.STATS["procedures"]), "procedimientos", BLUE_BG),
        base.metric(str(base.STATS["views"]), "vistas", BLUE_BG),
        base.metric(str(base.STATS["triggers"]), "triggers", BLUE_BG),
    ]))
    story.append(Spacer(1, 10))
    story.append(sql_table(
        ["Evidencia", "Interpretación", "Acción antes de usarla"],
        [
            ["CREATE DATABASE [Movil] y USE [Movil]", "El dump se presenta como una base llamada Movil.", "Confirmar nombre oficial y ambiente objetivo."],
            ["Referencias repetidas a [SAGRI_MOVIL]", "El propio archivo mezcla nombres de base o depende de otra base.", "Resolver ownership, conectividad y orden de despliegue."],
            ["GPSAG, NUTGT, SOP30200 y RM00101", "Parte del negocio depende de otros esquemas o Dynamics GP.", "Probar con un ambiente de integración real."],
            ["Usuarios, roles, rutas .mdf/.ldf y opciones del servidor", "Incluye detalles del ambiente fuente, no solo el modelo lógico.", "Separar seguridad y configuración por ambiente."],
            ["OPENJSON, FOR JSON PATH, correo y macros", "La lógica de aplicación está embebida en procedimientos.", "Inventariar por capacidad y decidir qué se integra."],
        ],
        [176, 218, 146],
        tints={1: True, 2: True, 3: True, 4: True, 5: True},
    ))
    story.append(Spacer(1, 10))
    story.append(sql_callout(
        "No ejecutar tal cual",
        "El archivo contiene configuración física, roles amplios y dependencias externas. Se usará como fuente de análisis y, después de una decisión de ambiente, se extraerán scripts controlados. No se copiarán rutas locales, secretos ni privilegios del origen.",
    ))
    story.append(Spacer(1, 8))
    story.append(sql_footer("Referencias: movil.sql:1, 83-168, 2048-2269, 2471-2509, 3562-3667, 5650-5693, 6104-6266, 8312-8445 y 9100-9112."))

    # 03 Target architecture
    story.append(KeepTogether(sql_title("03 / Diseño objetivo", "SQL Server será la base operativa detrás de la API", "La aplicación conserva sus reglas en el dominio y usa SQL Server como infraestructura de persistencia. SAGRI_MOVIL y GP se conectan mediante adaptadores, workers y contratos observables.") + [SqlServerTargetDiagram(height=198)]))
    story.append(Spacer(1, 10))
    story.append(sql_table(
        ["Componente", "Responsabilidad", "Frontera"],
        [
            ["PWA / APIM", "Captura, acceso, autenticación, límites y observabilidad.", "No conecta directamente a la base."],
            ["API", "Reglas, autorización, transacciones, estados y contratos.", "No delega decisiones financieras a SQL sin una regla explícita."],
            ["SQL Server target", "Datos operativos, idempotencia, auditoría y outbox.", "Es dueño de la escritura de la API."],
            ["Adaptador legacy", "Entrega y consulta con SAGRI_MOVIL y GP.", "No permite escrituras duplicadas ni acopla DTOs legacy al dominio."],
            ["Staging / reconciliación", "Carga controlada, mapping, conteos y diferencias.", "Se limpia o conserva según la política de auditoría."],
        ],
        [118, 242, 180],
        tints={1: True, 2: True, 3: True, 4: True, 5: True},
    ))
    story.append(Spacer(1, 9))
    story.append(sql_two_col(
        sql_box("Esquemas propuestos", "dbo para el modelo público de la API; integration para outbox y adaptadores; staging para cargas temporales; audit para trazabilidad. Los nombres finales deben alinearse con el backend."),
        sql_box("Fuente de verdad", "Pedido, cobro e idempotencia nacen en la API. Factura, saldos o información GP pueden tener autoridad externa y requieren reconciliación, no copia ciega."),
    ))

    # 04 Provider and schema
    story.extend(sql_title("04 / Esquema y proveedor", "La traducción debe ser explícita, no una sustitución de nombres", "La API necesita una configuración SQL Server reproducible y un esquema que conserve precisión, fechas, unicidad e integridad referencial."))
    story.append(sql_table(
        ["Origen habitual", "SQL Server objetivo", "Criterio"],
        [
            ["uuid", "uniqueidentifier", "Mantener Guid estable en contratos e idempotencia."],
            ["jsonb", "nvarchar(max) con validación ISJSON cuando aplique", "Los campos no consultados como JSON pueden almacenarse como texto; validar tamaño y payload."],
            ["timestamptz", "datetime2(7) en UTC o datetimeoffset(7) si se conserva offset", "Elegir una sola convención para toda la API."],
            ["boolean", "bit", "Mapear nullability y valores por defecto."],
            ["numeric / decimal", "decimal(p,s)", "Definir precisión financiera; evitar money como decisión implícita."],
            ["bytea", "varbinary(max)", "Separar evidencia pesada del registro principal si el volumen lo exige."],
            ["serial / bigserial", "IDENTITY o SEQUENCE", "Usar sequence/operación atómica para correlativos de negocio."],
        ],
        [125, 225, 190],
        tints={1: True, 2: True, 3: True, 4: True, 5: True, 6: True, 7: True},
    ))
    story.append(Spacer(1, 10))
    story.append(sql_table(
        ["Punto del backend", "Cambio para SQL Server", "Validación"],
        [
            ["Database:Provider", "Completar rama SqlServer con UseSqlServer y connection string por ambiente.", "Arranque fail-fast con provider válido y health check sin secretos."],
            ["Migraciones 001-006", "Crear la variante SQL Server o generar DDL controlado desde el modelo aprobado.", "Aplicar desde base vacía y verificar checksum / versión."],
            ["jsonb", "Ajustar tipo a nvarchar(max) y converters si el modelo lo requiere.", "Insertar, leer y actualizar datos reales; no asumir por compilación."],
            ["PostgresFacturaRepository:46", "Reemplazar SQL nativo por consulta portable o rama SQL Server controlada.", "Prueba funcional y plan de ejecución en instancia real."],
        ],
        [146, 240, 154],
        tints={1: True, 2: True, 3: True, 4: True},
    ))
    story.append(Spacer(1, 9))
    story.append(sql_callout(
        "Criterio de compatibilidad",
        "InMemory sirve para lógica rápida, pero no demuestra compatibilidad con SQL Server. La evidencia válida incluye una base SQL Server real, aplicación de migraciones, índices, transacciones, tipos y consultas ejecutadas.",
    ))
    story.append(Spacer(1, 8))
    story.append(sql_footer("La documentación oficial de EF Core para SQL Server indica UseSqlServer, configuración de compatibilidad y EnableRetryOnFailure como capacidades a evaluar por ambiente."))

    # 05 Data migration
    story.extend(sql_title("05 / Migración de datos", "Cargar por etapas permite encontrar diferencias antes del cambio", "La migración de estructura y la migración de datos son trabajos relacionados, pero no son la misma operación. Primero se prueba el esquema; después se carga, reconcilia y corta."))
    story.append(MigrationTimeline(height=118))
    story.append(Spacer(1, 10))
    story.append(sql_table(
        ["Etapa", "Actividad", "Evidencia de salida"],
        [
            ["1. Inventario", "Identificar tablas fuente, columnas, nullability, volúmenes, duplicados y owner de cada dato.", "Catálogo de mapping aprobado."],
            ["2. Staging", "Cargar una copia controlada sin escribir aún en el modelo operativo.", "Conteos, checksum y errores por lote."],
            ["3. Transformación", "Convertir tipos, fechas UTC, identificadores, estados y precisión monetaria.", "Reglas repetibles y registros rechazados explicados."],
            ["4. Carga ordenada", "Primero catálogos, luego clientes, pedidos, facturas y finalmente pagos/aplicaciones.", "FK, índices y controles de totales satisfechos."],
            ["5. Reconciliación", "Comparar conteos, montos, saldos, relaciones pedido-factura y estado de integración.", "Acta de diferencias y resolución."],
            ["6. Cutover", "Aplicar delta final, cambiar connection string y monitorear.", "Smoke tests, métricas y rollback disponible."],
        ],
        [100, 260, 180],
        tints={1: True, 2: True, 3: True, 4: True, 5: True, 6: True},
    ))
    story.append(Spacer(1, 10))
    story.append(sql_two_col(
        sql_box("No hacer", "No mezclar carga histórica con escritura online sin una estrategia de delta. No convertir errores de mapping en valores por defecto silenciosos. No declarar éxito por el número de filas solamente."),
        sql_box("Hacer", "Guardar lotes, conteos y rechazos. Tomar backup y probar restore. Definir una ventana de congelamiento o una captura de cambios antes del cutover."),
    ))

    # 06 Payments
    story.extend(sql_title("06 / Cobros e integridad", "Un pago puede aplicar a varias facturas", "El cambio a SQL Server no debe reducir el cobro al modelo actual 1:1 de la PWA. La unidad de captura es el pago; la distribución se registra en aplicaciones."))
    story.append(sql_table(
        ["Entidad objetivo", "Regla", "Control SQL Server"],
        [
            ["Payment / Cobro", "Un registro de captura con monto total, método, evidencia, estado y clientOperationId.", "uniqueidentifier, índice único y auditoría."],
            ["CobroFacturaDetalle", "Una fila por factura aplicada, con monto, área y estado.", "FK al pago, índices por factura y validación de suma."],
            ["Factura", "Referencia a una autoridad contable que puede estar fuera de la base operativa.", "Validación de existencia y reconciliación; no FK inventada contra un mirror incompleto."],
            ["Outbox", "Evento pendiente de integración después del commit local.", "Clave única por evento, reintento y estado de entrega."],
        ],
        [135, 242, 163],
        tints={1: True, 2: True, 3: True, 4: True},
    ))
    story.append(Spacer(1, 10))
    story.append(sql_table(
        ["Regla de idempotencia", "Resultado"],
        [
            ["Misma ClientOperationId y mismo hash de payload", "Devolver el resultado original; no insertar otro pago."],
            ["Misma ClientOperationId con payload distinto", "Responder 409 y registrar el conflicto."],
            ["Cobro en proceso de integración", "Responder 202 con estado consultable, si el contrato lo define así."],
            ["Saldo o aplicación cambió durante la transacción", "Responder 409; el usuario debe revisar, no repetir con otra clave."],
        ],
        [240, 300],
        tints={1: True, 2: True, 3: True, 4: True},
    ))
    story.append(Spacer(1, 10))
    story.append(sql_callout(
        "Bloqueo recomendado",
        "Para la aplicación financiera, leer la factura o saldo dentro de la transacción con WITH (UPDLOCK, ROWLOCK), recalcular disponibilidad, insertar las aplicaciones y confirmar todo junto. ROWLOCK no debe tratarse como garantía absoluta: se debe probar bloqueo, escalamiento, deadlocks y reintentos.",
    ))
    story.append(Spacer(1, 8))
    story.append(sql_footer("La documentación de Table Hints y Transaction Locking de Microsoft describe UPDLOCK, ROWLOCK, HOLDLOCK y sus límites; las sugerencias deben usarse con criterio y pruebas de concurrencia."))

    # 07 Legacy
    story.append(KeepTogether(sql_title("07 / Integración legacy", "Los 76 procedimientos no son 76 migraciones de la API", "El archivo entregado está escrito para SQL Server. La decisión senior es aprovecharlo como conocimiento del negocio y aislarlo como integración, en vez de copiar sus fronteras al nuevo dominio.") + [sql_table(
        ["Capacidad observada", "Evidencia", "Tratamiento objetivo"],
        [
            ["Pedidos", "WS_InsertarPedido parsea JSON, consulta e incrementa Correlativo1 y persiste encabezado/detalle.", "API captura; correlativo atómico; adaptador entrega a legacy."],
            ["Facturación", "UpdateNumFacturas cruza referencias con SOP30200 en GPSAG/NUTGT.", "Worker y reconciliación pedido-factura."],
            ["Pagos", "SAGPagosEncabezado y SAGPagosDetalle representan cabecera y aplicaciones.", "Contrato 1:N explícito y mapping de estados aprobado."],
            ["GP", "WS_PCrearMacroPedidos construye una macro para SOP_Entry.", "Adaptador con idempotencia, observabilidad y pruebas de contrato."],
            ["Identidad", "UsuariosMovil, WS_Cliente y procedimientos comparan PIN o contraseñas antiguas.", "No migrar secretos; reconstruir identidad y mínimo privilegio."],
        ],
        [110, 255, 175],
        tints={1: True, 2: True, 3: True, 4: True, 5: True},
    )]))
    story.append(Spacer(1, 10))
    story.append(sql_two_col(
        sql_box("Contrato de integración", "Mensajes versionados, correlationId, clientOperationId, reintentos, estado de entrega y reconciliación. El adaptador traduce; el dominio no conoce tablas legacy."),
        sql_box("Contrato de retiro", "Inventario de consumidores, fechas de migración, métricas de uso y plan de desactivación. Mantener un SP sin dueño es deuda operativa."),
    ))
    story.append(Spacer(1, 9))
    story.append(sql_callout(
        "Correlativo de pedidos",
        "El patrón SELECT y luego UPDATE observado para Correlativo1 puede duplicar folios si dos sesiones concurren. Debe resolverse con SEQUENCE o una operación atómica y una prueba que demuestre unicidad bajo carga.",
    ))

    # 08 Execution and cutover
    story.extend(sql_title("08 / Ejecución y cutover", "El cambio se ensaya antes de tocar producción", "El criterio de salida no es que la aplicación compile. Es que el esquema, los datos, los contratos y los procesos operativos funcionen juntos y tengan reversa."))
    story.append(sql_table(
        ["Track", "Entregable", "Criterio de salida"],
        [
            ["0. Preparación", "Versión de SQL Server, compatibilidad, collation, backups, usuarios y redes.", "Instancia accesible, restauración probada y secretos fuera del código."],
            ["1. Esquema", "DDL/migraciones SQL Server de la API, índices, constraints y seeds controlados.", "Base vacía levanta desde cero y el checksum coincide."],
            ["2. Aplicación", "Provider SQL Server, queries, transacciones y resiliencia.", "API opera con SQL Server real; no solo InMemory."],
            ["3. Datos", "Staging, mapping, carga, delta y reconciliación.", "Conteos y montos aceptados por dueño de datos."],
            ["4. Rehearsal", "Ensayo cronometrado con copia representativa.", "Duración, bloqueos, errores y rollback documentados."],
            ["5. Cutover", "Congelamiento/delta, cambio de configuración y smoke tests.", "Negocio valida operaciones críticas y métricas estables."],
        ],
        [105, 245, 190],
        tints={1: True, 2: True, 3: True, 4: True, 5: True, 6: True},
    ))
    story.append(Spacer(1, 10))
    story.append(sql_table(
        ["Rollback", "Condición", "Acción"],
        [
            ["Antes del cambio", "Ensayo no reproduce cargas o integridad.", "No avanzar; corregir mapping, índices o contrato."],
            ["Durante ventana", "Smoke test falla o reconciliación no coincide.", "Mantener origen, restaurar target si corresponde y abrir incidencia."],
            ["Después del cambio", "Error operativo con datos confirmados.", "Usar procedimiento aprobado; no escribir simultáneamente en dos dueños sin control."],
        ],
        [145, 235, 160],
        tints={1: True, 2: True, 3: True},
    ))
    story.append(Spacer(1, 9))
    story.append(sql_callout(
        "Regla de cambio",
        "No se debe hacer dual-write improvisado entre PostgreSQL, SQL Server y SAGRI_MOVIL. Si se necesita convivencia temporal, debe existir un owner de escritura, una fuente de eventos y reconciliación diaria con diferencias visibles.",
    ))

    # 09 Decisions and risks
    story.extend(sql_title("09 / Decisiones y riesgos", "Lo que falta decidir también forma parte del plan", "Una migración segura hace visibles las decisiones que no pertenecen al desarrollador individual: fuente de verdad, permisos, ventana de cambio, versionado y aceptación del negocio."))
    story.append(sql_table(
        ["Decisión", "Recomendación", "Responsable de confirmar"],
        [
            ["Versión de SQL Server y compatibilidad", "Fijar versión soportada y compatibility level antes de generar DDL final.", "Infraestructura / DBA."],
            ["Fuente de verdad por dato", "Definir owner de pedido, factura, saldo, precio y pago.", "Producto / datos / GP."],
            ["Perfil y permisos", "Matriz rol x acción x alcance; no deducirla del dump.", "Negocio / seguridad."],
            ["Queries optimizadas", "Catálogo con paginación, SLA, frescura y pruebas de plan.", "Datos / backend."],
            ["Eventos 1:N", "Versionar PaymentCreatedV2 o adaptar formalmente al consumidor.", "Integración / arquitectura."],
            ["Ventana de cutover", "Definir congelamiento, delta, duración máxima y rollback.", "Operación / negocio."],
        ],
        [150, 250, 140],
        tints={1: True, 2: True, 3: True, 4: True, 5: True, 6: True},
    ))
    story.append(Spacer(1, 10))
    story.append(sql_table(
        ["Prioridad", "Riesgo", "Control"],
        [
            ["CRÍTICA", "Ejecutar movil.sql sin resolver Movil / SAGRI_MOVIL y dependencias.", "Inventario de ambiente, script controlado y prueba de restore."],
            ["ALTA", "Doble cobro o folio duplicado por reintentos y concurrencia.", "Idempotencia durable, operación atómica y pruebas concurrentes."],
            ["ALTA", "Copiar credenciales y privilegios del origen.", "Identidad nueva, rotación y mínimo privilegio."],
            ["ALTA", "PWA, OpenAPI y runtime usan convenciones distintas.", "Contrato canónico, versionado y pruebas de integración."],
            ["MEDIA", "Precisión monetaria o fechas cambian durante la traducción.", "decimal explícito, UTC, conteos y reconciliación de montos."],
        ],
        [70, 270, 200],
        tints={1: True, 2: True, 3: True, 4: True, 5: True},
    ))

    # 10 Acceptance
    story.extend(sql_title("10 / Pruebas y aceptación", "La salida se demuestra con evidencia reproducible", "La aprobación técnica debe poder repetirse en otra instancia y la aprobación funcional debe poder explicarse por perfil, flujo y dato."))
    story.append(sql_table(
        ["Área", "Prueba mínima", "Evidencia"],
        [
            ["Esquema", "Crear SQL Server desde cero y aplicar todas las migraciones objetivo.", "Log de migración, versión y checksums."],
            ["Proveedor", "Ejecutar API con SQL Server real y connection string de ambiente.", "Health check, logs sanitizados y pruebas de repositorio."],
            ["Datos", "Cargar lote representativo y comparar conteos, sumas y relaciones.", "Reporte de reconciliación firmado."],
            ["Cobro 1:N", "Un pago con varias facturas, suma válida, error parcial y reversa.", "Pruebas de dominio y API."],
            ["Idempotencia", "Repetir mismo request, cambiar payload, simular timeout y reintentar.", "200 original, 409 conflicto y sin duplicados."],
            ["Concurrencia", "Dos cobros sobre el mismo saldo y dos reservas de correlativo.", "Resultado único, sin saldo negativo ni folio duplicado."],
            ["Legacy", "Entregar pedido, recibir factura tardía y reconciliar estados.", "Contrato, correlationId y auditoría."],
            ["Operación", "Backup, restore, métricas, rollback y revisión de permisos.", "Runbook ejecutado por otra persona."],
        ],
        [105, 270, 165],
        tints={1: True, 2: True, 3: True, 4: True, 5: True, 6: True, 7: True, 8: True},
    ))
    story.append(Spacer(1, 11))
    story.append(sql_callout(
        "Criterio de salida final",
        "La migración queda lista cuando SQL Server puede levantar el esquema, la API puede operar, los datos críticos fueron reconciliados, los cobros no se duplican, la integración legacy es observable y existe un rollback practicado. Compilar no es suficiente.",
    ))

    # Appendix
    story.append(Spacer(1, 18))
    story.extend(sql_title("Anexos", "Fuentes, glosario y entregables propuestos", "Estos anexos dejan un punto de partida auditable para convertir la propuesta en tickets, scripts y pruebas."))
    story.append(sp("Entregables propuestos", "SQLH2"))
    story.append(sql_table(
        ["Entregable", "Contenido"],
        [
            ["01. Inventario de origen", "Tablas, SP, vistas, dependencias, volúmenes, dueños y datos sensibles."],
            ["02. Mapping de datos", "Fuente, destino, transformación, nullability, default, regla de rechazo y responsable."],
            ["03. Migraciones SQL Server", "DDL versionado de la API, índices, constraints, seeds y checksums."],
            ["04. Adaptador legacy", "Contratos, eventos, reintentos, correlationId, reconciliación y plan de retiro."],
            ["05. Runbook de cutover", "Prechecks, backup, carga, delta, cambio, smoke tests, monitoreo y rollback."],
            ["06. Evidencia de aceptación", "Logs, reportes, pruebas de concurrencia, métricas y aprobación por responsable."],
        ],
        [170, 370],
        tints={1: True, 2: True, 3: True, 4: True, 5: True, 6: True},
    ))
    story.append(Spacer(1, 11))
    story.append(sp("Fuentes locales", "SQLH2"))
    story.append(sql_table(
        ["Fuente", "Uso"],
        [
            ["C:\\Users\\tmoyy\\Downloads\\movil.sql", "Snapshot T-SQL de referencia. Se usó para inventario, dependencias, procedimientos y riesgos del legado."],
            ["F:\\SAGRISSA_COD\\SAGRISSA\\src\\features\\cobros\\services\\cobros.service.ts", "Modelo frontend actual 1:1 y estados de cobro; evidencia del cambio contractual requerido."],
            ["F:\\SAGRISSA_COD\\SAGRISSA\\src\\core\\api\\sync.service.ts", "Cola offline y reintentos; evidencia de que la clave debe persistir y viajar al backend."],
            ["F:\\SAGRISSA_COD\\SAGRISSA\\docs\\openapi\\sagrisa-v1.yaml", "Contrato documentado; se contrasta con rutas runtime para resolver drift."],
            ["Correo recibido", "Confirma que perfiles, operaciones y queries optimizadas aún están en refinamiento."],
            ["Backend sagrisa-api", "Database:Provider y PostgresFacturaRepository son observaciones compartidas y deben revalidarse en el repositorio backend."],
        ],
        [195, 305],
        tints={1: True, 2: True, 3: True, 4: True, 5: True, 6: True},
    ))
    story.append(Spacer(1, 11))
    story.append(sp("Fuentes web técnicas", "SQLH2"))
    story.append(sql_table(
        ["Tema", "Referencia"],
        [
            ["Proveedor EF Core SQL Server", "https://learn.microsoft.com/en-us/ef/core/providers/sql-server/"],
            ["Sugerencias de tabla y bloqueos", "https://learn.microsoft.com/en-us/sql/t-sql/queries/hints-transact-sql-table?view=sql-server-ver17"],
            ["Bloqueo y versionado de filas", "https://learn.microsoft.com/en-us/sql/relational-databases/sql-server-transaction-locking-and-row-versioning-guide?view=sql-server-ver17"],
            ["Documentación de migración SQL Server", "https://learn.microsoft.com/en-us/sql/sql-server/migrate/?view=sql-server-ver17"],
            ["Tipos de datos Transact-SQL", "https://learn.microsoft.com/en-us/Sql/t-sql/data-types/data-types-transact-sql?view=sql-server-ver16"],
            ["ADRs de arquitectura", "https://docs.aws.amazon.com/prescriptive-guidance/latest/architectural-decision-records/adr-process.html  |  https://learn.microsoft.com/en-us/azure/well-architected/architect-role/architecture-decision-record"],
        ],
        [160, 340],
        tints={1: True, 2: True, 3: True, 4: True, 5: True, 6: True},
    ))
    story.append(Spacer(1, 11))
    story.append(sp("Glosario breve", "SQLH2"))
    story.append(sql_table(
        ["Término", "Definición de trabajo"],
        [
            ["SQL Server target", "Instancia que alojará la base operativa de la API después del cutover."],
            ["Staging", "Área de carga temporal para validar y transformar datos antes de insertarlos en el modelo objetivo."],
            ["Idempotencia", "Repetir una misma operación con la misma clave conserva un solo resultado."],
            ["Outbox", "Registro transaccional de un evento que todavía debe entregarse a otro sistema."],
            ["Reconciliación", "Comparación controlada de conteos, montos, estados y relaciones entre sistemas."],
            ["Rehearsal", "Ensayo completo y medido de la migración antes de la ventana productiva."],
        ],
        [135, 365],
        tints={1: True, 2: True, 3: True, 4: True, 5: True, 6: True},
    ))
    story.append(Spacer(1, 11))
    story.append(sql_callout(
        "Cierre",
        "La recomendación es migrar la base operativa de la API a SQL Server con un esquema propio, un vertical slice financiero verificable y una integración legacy separada. La decisión queda lista para convertirse en implementación cuando se confirmen versión de SQL Server, migraciones 001-006, matriz de perfiles, queries y ventana de cambio.",
    ))
    story.append(Spacer(1, 8))
    story.append(sp("SAGRISA  |  Plan de migración a SQL Server  |  Documento de trabajo", "SQLSmall"))
    return story


def main():
    OUT.parent.mkdir(parents=True, exist_ok=True)
    frame = Frame(MARGIN_L, MARGIN_B, CONTENT_W, PAGE_H - MARGIN_T - MARGIN_B, id="normal", leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
    doc = SqlServerDocTemplate(
        str(OUT), pagesize=letter, leftMargin=MARGIN_L, rightMargin=MARGIN_R,
        topMargin=MARGIN_T, bottomMargin=MARGIN_B, title="Plan de migracion SAGRISA a SQL Server",
        author="OpenAI - Codex", subject="Migracion de base operativa, datos e integracion legacy a SQL Server",
    )
    doc.addPageTemplates([PageTemplate(id="main", frames=[frame], onPage=on_sqlserver_page)])
    doc.build(build_story())
    print(f"CREATED {OUT}")
    print(f"SOURCE_STATS lines={base.STATS['lines']} tables={base.STATS['tables']} procs={base.STATS['procedures']} views={base.STATS['views']}")


if __name__ == "__main__":
    from reportlab.lib.pagesizes import letter
    main()
