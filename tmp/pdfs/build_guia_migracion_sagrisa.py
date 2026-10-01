from __future__ import annotations

import os
import re
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    Flowable,
    HRFlowable,
    KeepTogether,
    PageBreak,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)


ROOT = Path(r"F:\SAGRISSA_COD\SAGRISSA")
SQL_PATH = Path(r"C:\Users\tmoyy\Downloads\movil.sql")
OUT = ROOT / "output" / "pdf" / "guia_migracion_sagrisa_legacy_api.pdf"
FONT_DIR = Path(r"C:\Windows\Fonts")

PAGE_W, PAGE_H = letter
MARGIN_L = 42
MARGIN_R = 42
MARGIN_T = 48
MARGIN_B = 42
CONTENT_W = PAGE_W - MARGIN_L - MARGIN_R

# Palette restricted to blue, black and neutral white.
INK = colors.HexColor("#111111")
MUTED = colors.HexColor("#333333")
LIGHT = colors.white
LINE = colors.HexColor("#B7C9E8")
BLUE = colors.HexColor("#0B63CE")
BLUE_DARK = colors.HexColor("#0B2F6B")
PURPLE = BLUE
TEAL = BLUE
GREEN = BLUE
AMBER = BLUE
RED = BLUE_DARK
RED_BG = colors.HexColor("#F2F6FC")
AMBER_BG = RED_BG
GREEN_BG = RED_BG
BLUE_BG = RED_BG
PURPLE_BG = RED_BG


pdfmetrics.registerFont(TTFont("Arial", str(FONT_DIR / "arial.ttf")))
pdfmetrics.registerFont(TTFont("Arial-Bold", str(FONT_DIR / "arialbd.ttf")))


def sql_stats() -> dict[str, int | str]:
    try:
        raw = SQL_PATH.read_bytes()
        encoding = "utf-16" if raw.startswith((b"\xff\xfe", b"\xfe\xff")) else "utf-8"
        text = raw.decode(encoding, errors="replace")
    except OSError:
        text = ""
    lines = text.splitlines()
    def count(pattern: str, flags: int = re.I | re.M) -> int:
        return len(re.findall(pattern, text, flags))
    return {
        "lines": len(lines),
        "bytes": SQL_PATH.stat().st_size if SQL_PATH.exists() else 0,
        "tables": count(r"^\s*CREATE\s+TABLE\b"),
        "procedures": count(r"^\s*CREATE\s+(?:OR\s+ALTER\s+)?PROCEDURE\b"),
        "views": count(r"^\s*CREATE\s+(?:OR\s+ALTER\s+)?VIEW\b"),
        "functions": count(r"^\s*CREATE\s+(?:OR\s+ALTER\s+)?FUNCTION\b"),
        "triggers": count(r"^\s*CREATE\s+(?:OR\s+ALTER\s+)?TRIGGER\b"),
        "pks": count(r"PRIMARY\s+KEY"),
        "fks": count(r"FOREIGN\s+KEY"),
        "openjson": count(r"OPENJSON"),
        "for_json": count(r"FOR\s+JSON\s+PATH"),
        "sagri_refs": count(r"SAGRI_MOVIL"),
        "gpsag_refs": count(r"GPSAG"),
        "nutgt_refs": count(r"NUTGT"),
    }


STATS = sql_stats()


styles = getSampleStyleSheet()
styles.add(ParagraphStyle(
    name="Kicker", parent=styles["Normal"], fontName="Arial-Bold", fontSize=8,
    leading=10, textColor=BLUE, tracking=1.1, spaceAfter=7,
))
styles.add(ParagraphStyle(
    name="CoverTitle", parent=styles["Title"], fontName="Arial-Bold", fontSize=29,
    leading=33, textColor=INK, alignment=TA_LEFT, spaceAfter=12,
))
styles.add(ParagraphStyle(
    name="CoverSubtitle", parent=styles["Normal"], fontName="Arial", fontSize=13,
    leading=18, textColor=MUTED, spaceAfter=18,
))
styles.add(ParagraphStyle(
    name="H1x", parent=styles["Heading1"], fontName="Arial-Bold", fontSize=21,
    leading=25, textColor=INK, spaceBefore=0, spaceAfter=8,
))
styles.add(ParagraphStyle(
    name="H2x", parent=styles["Heading2"], fontName="Arial-Bold", fontSize=12.5,
    leading=15, textColor=BLUE_DARK, spaceBefore=6, spaceAfter=5,
))
styles.add(ParagraphStyle(
    name="Bodyx", parent=styles["BodyText"], fontName="Arial", fontSize=9.2,
    leading=13.2, textColor=INK, spaceAfter=6,
))
styles.add(ParagraphStyle(
    name="Smallx", parent=styles["BodyText"], fontName="Arial", fontSize=7.6,
    leading=10.2, textColor=MUTED, spaceAfter=3,
))
styles.add(ParagraphStyle(
    name="TableHead", parent=styles["Normal"], fontName="Arial-Bold", fontSize=7.6,
    leading=9.4, textColor=colors.white,
))
styles.add(ParagraphStyle(
    name="TableCell", parent=styles["Normal"], fontName="Arial", fontSize=7.5,
    leading=9.6, textColor=INK,
))
styles.add(ParagraphStyle(
    name="TableCellBold", parent=styles["Normal"], fontName="Arial-Bold", fontSize=7.5,
    leading=9.6, textColor=INK,
))
styles.add(ParagraphStyle(
    name="CardValue", parent=styles["Normal"], fontName="Arial-Bold", fontSize=19,
    leading=22, textColor=INK, alignment=TA_LEFT,
))
styles.add(ParagraphStyle(
    name="CardLabel", parent=styles["Normal"], fontName="Arial-Bold", fontSize=7.2,
    leading=9, textColor=MUTED, tracking=0.6,
))
styles.add(ParagraphStyle(
    name="Quote", parent=styles["Normal"], fontName="Arial-Bold", fontSize=13,
    leading=18, textColor=BLUE_DARK, alignment=TA_LEFT,
))
styles.add(ParagraphStyle(
    name="CoverMeta", parent=styles["Normal"], fontName="Arial-Bold", fontSize=8,
    leading=10, textColor=MUTED,
))


def p(text: str, style: str = "Bodyx") -> Paragraph:
    return Paragraph(text, styles[style])


def bullet(text: str, style: str = "Bodyx") -> Paragraph:
    return Paragraph(f"- {text}", styles[style])


def title(kicker: str, heading: str, intro: str | None = None):
    items = [p(kicker.upper(), "Kicker"), p(heading, "H1x")]
    if intro:
        items.append(p(intro, "Bodyx"))
    items.append(Spacer(1, 5))
    return items


def callout(heading: str, body: str, bg=BLUE_BG, accent=BLUE, width=CONTENT_W):
    content = [p(heading, "H2x"), p(body, "Bodyx")]
    t = Table([[content]], colWidths=[width])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), bg),
        ("BOX", (0, 0), (-1, -1), 0.7, LINE),
        ("LINEBEFORE", (0, 0), (0, -1), 4, accent),
        ("LEFTPADDING", (0, 0), (-1, -1), 13),
        ("RIGHTPADDING", (0, 0), (-1, -1), 13),
        ("TOPPADDING", (0, 0), (-1, -1), 9),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
    ]))
    return t


def metric(value: str, label: str, tint=BLUE_BG):
    content = [p(value, "CardValue"), p(label.upper(), "CardLabel")]
    return Table([[content]], colWidths=[CONTENT_W / 4 - 8], rowHeights=[62], style=TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), tint),
        ("BOX", (0, 0), (-1, -1), 0.6, LINE),
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 11),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]))


def metrics_row(items):
    t = Table([items], colWidths=[CONTENT_W / 4] * 4)
    t.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 5),
    ]))
    return t


def data_table(headers, rows, widths, header_color=BLUE_DARK, row_tints=None, font_size=7.5):
    data = [[p(h, "TableHead") for h in headers]]
    for row in rows:
        data.append([p(str(cell), "TableCell") for cell in row])
    t = Table(data, colWidths=widths, repeatRows=1, hAlign="LEFT")
    commands = [
        ("BACKGROUND", (0, 0), (-1, 0), header_color),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("GRID", (0, 0), (-1, -1), 0.35, LINE),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]
    for idx in range(1, len(data)):
        commands.append(("BACKGROUND", (0, idx), (-1, idx), colors.white if idx % 2 else LIGHT))
    if row_tints:
        for idx, tint in row_tints.items():
            commands.append(("BACKGROUND", (0, idx), (-1, idx), tint))
    t.setStyle(TableStyle(commands))
    return t


def labeled_box(label, body, bg=LIGHT, accent=BLUE, width=CONTENT_W / 2 - 7):
    t = Table([[p(label.upper(), "CardLabel")], [p(body, "Bodyx")]], colWidths=[width])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), bg),
        ("BOX", (0, 0), (-1, -1), 0.6, LINE),
        ("LINEABOVE", (0, 0), (-1, 0), 3, accent),
        ("LEFTPADDING", (0, 0), (-1, -1), 11),
        ("RIGHTPADDING", (0, 0), (-1, -1), 11),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
    ]))
    return t


def two_col(left, right, widths=None):
    widths = widths or [CONTENT_W / 2, CONTENT_W / 2]
    t = Table([[left, right]], colWidths=widths)
    t.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 7),
        ("TOPPADDING", (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
    ]))
    return t


def section_footer(text):
    return Table([[p(text, "Smallx")]], colWidths=[CONTENT_W], style=TableStyle([
        ("LINEABOVE", (0, 0), (-1, 0), 0.5, LINE),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
    ]))


class ArchitectureDiagram(Flowable):
    def __init__(self, width=CONTENT_W, height=188):
        super().__init__()
        self.width = width
        self.height = height

    def wrap(self, availWidth, availHeight):
        return min(self.width, availWidth), self.height

    def draw(self):
        c = self.canv
        w, h = self.width, self.height
        c.setStrokeColor(LINE)
        c.setLineWidth(0.8)
        c.setFillColor(colors.white)
        c.roundRect(0, 0, w, h, 12, fill=1, stroke=1)

        def box(x, y, bw, bh, label, sub, fill, stroke):
            c.setFillColor(fill)
            c.setStrokeColor(stroke)
            c.roundRect(x, y, bw, bh, 8, fill=1, stroke=1)
            c.setFillColor(INK)
            c.setFont("Helvetica-Bold", 9)
            c.drawCentredString(x + bw / 2, y + bh - 19, label)
            c.setFillColor(MUTED)
            c.setFont("Helvetica", 7.3)
            for i, line in enumerate(sub.split("\n")):
                c.drawCentredString(x + bw / 2, y + bh - 34 - i * 10, line)

        def arrow(x1, y1, x2, y2, color=BLUE):
            c.setStrokeColor(color)
            c.setFillColor(color)
            c.setLineWidth(1.3)
            c.line(x1, y1, x2, y2)
            import math
            angle = math.atan2(y2 - y1, x2 - x1)
            size = 5
            c.line(x2, y2, x2 - size * math.cos(angle - 0.45), y2 - size * math.sin(angle - 0.45))
            c.line(x2, y2, x2 - size * math.cos(angle + 0.45), y2 - size * math.sin(angle + 0.45))

        box(16, 116, 116, 48, "PWA", "clientes y equipos", BLUE_BG, BLUE)
        box(169, 116, 116, 48, "APIM", "gobierno y acceso", PURPLE_BG, PURPLE)
        box(322, 116, 116, 48, "API", "reglas de negocio", GREEN_BG, GREEN)
        arrow(132, 140, 169, 140)
        arrow(285, 140, 322, 140)

        box(254, 28, 148, 50, "BASE OPERATIVA NUEVA", "PostgreSQL staging / SQL Server target", BLUE_BG, BLUE)
        box(20, 28, 175, 50, "INTEGRACION LEGACY", "SAGRI_MOVIL + adaptadores", AMBER_BG, AMBER)
        box(430, 28, 125, 50, "GP", "GPSAG / NUTGT", RED_BG, RED)
        arrow(380, 116, 330, 78, BLUE_DARK)
        arrow(322, 78, 195, 58, AMBER)
        arrow(402, 53, 430, 53, RED)
        c.setFillColor(MUTED)
        c.setFont("Helvetica-Oblique", 7.1)
        c.drawCentredString(w / 2, 9, "La PWA no accede directamente a SQL ni a Dynamics GP")


class OrderPaymentFlow(Flowable):
    def __init__(self, width=CONTENT_W, height=190):
        super().__init__()
        self.width = width
        self.height = height

    def wrap(self, availWidth, availHeight):
        return min(self.width, availWidth), self.height

    def draw(self):
        c = self.canv
        w, h = self.width, self.height
        c.setFillColor(colors.white)
        c.setStrokeColor(LINE)
        c.roundRect(0, 0, w, h, 12, fill=1, stroke=1)

        xs = [55, 178, 301, 424]
        labels = [
            ("1", "Captura", "cliente / vendedor"),
            ("2", "Registro", "API + base operativa"),
            ("3", "Integracion", "outbox / adapter"),
            ("4", "Confirmacion", "GP / factura"),
        ]
        for x, (num, lab, sub) in zip(xs, labels):
            c.setFillColor(BLUE if num in ("1", "2") else (AMBER if num == "3" else RED))
            c.circle(x, 137, 17, fill=1, stroke=0)
            c.setFillColor(colors.white)
            c.setFont("Helvetica-Bold", 11)
            c.drawCentredString(x, 133, num)
            c.setFillColor(INK)
            c.setFont("Helvetica-Bold", 8.5)
            c.drawCentredString(x, 101, lab)
            c.setFillColor(MUTED)
            c.setFont("Helvetica", 7)
            c.drawCentredString(x, 87, sub)
        c.setStrokeColor(LINE)
        c.setLineWidth(1.2)
        for x1, x2 in zip(xs, xs[1:]):
            c.line(x1 + 18, 137, x2 - 18, 137)
        c.setFillColor(RED_BG)
        c.roundRect(92, 22, 350, 34, 7, fill=1, stroke=0)
        c.setFillColor(RED)
        c.setFont("Helvetica-Bold", 8)
        c.drawCentredString(267, 42, "La factura puede llegar después del pedido")
        c.setFillColor(MUTED)
        c.setFont("Helvetica", 7)
        c.drawCentredString(267, 30, "El estado debe ser durable y reconciliable; no se asume sincronía inmediata")


class PaymentIdempotencyFlow(Flowable):
    def __init__(self, width=CONTENT_W, height=188):
        super().__init__()
        self.width = width
        self.height = height

    def wrap(self, availWidth, availHeight):
        return min(self.width, availWidth), self.height

    def draw(self):
        c = self.canv
        w, h = self.width, self.height
        c.setFillColor(colors.white)
        c.setStrokeColor(LINE)
        c.roundRect(0, 0, w, h, 12, fill=1, stroke=1)

        def lane(y, label, color):
            c.setFillColor(color)
            c.setFont("Helvetica-Bold", 7.5)
            c.drawString(12, y + 8, label)
            c.setStrokeColor(LINE)
            c.setLineWidth(0.7)
            c.line(90, y + 10, w - 12, y + 10)

        def node(x, y, bw, label, sub, fill):
            c.setFillColor(fill)
            c.setStrokeColor(LINE)
            c.roundRect(x, y, bw, 31, 6, fill=1, stroke=1)
            c.setFillColor(INK)
            c.setFont("Helvetica-Bold", 7.4)
            c.drawCentredString(x + bw / 2, y + 19, label)
            c.setFillColor(MUTED)
            c.setFont("Helvetica", 6.5)
            c.drawCentredString(x + bw / 2, y + 8, sub)

        lane(123, "CLIENTE", BLUE)
        lane(74, "API", GREEN)
        lane(25, "BASE", PURPLE)
        node(104, 113, 100, "UUID estable", "antes del primer envío", BLUE_BG)
        node(250, 113, 112, "POST cobro", "online u offline", BLUE_BG)
        node(409, 113, 99, "reintento", "misma clave", AMBER_BG)
        node(104, 64, 100, "validar clave", "payload hash", GREEN_BG)
        node(250, 64, 112, "transacción", "saldo + aplicación", GREEN_BG)
        node(409, 64, 99, "respuesta", "200 / 409 / 202", GREEN_BG)
        node(155, 15, 123, "UNIQUE", "client_operation_id", PURPLE_BG)
        node(350, 15, 123, "resultado", "reproducible", PURPLE_BG)
        c.setStrokeColor(BLUE)
        c.setLineWidth(1)
        c.line(204, 128, 250, 128)
        c.line(362, 128, 409, 128)
        c.setStrokeColor(GREEN)
        c.line(204, 79, 250, 79)
        c.line(362, 79, 409, 79)
        c.setStrokeColor(PURPLE)
        c.line(210, 64, 210, 46)
        c.line(210, 46, 216, 46)
        c.line(406, 64, 406, 46)
        c.line(406, 46, 412, 46)


def on_page(canvas, doc):
    canvas.saveState()
    page = canvas.getPageNumber()
    if page == 1:
        canvas.setFillColor(INK)
        canvas.rect(0, PAGE_H - 8, PAGE_W, 8, fill=1, stroke=0)
    else:
        canvas.setFillColor(BLUE)
        canvas.rect(0, PAGE_H - 6, PAGE_W, 6, fill=1, stroke=0)
        canvas.setFont("Helvetica-Bold", 7)
        canvas.setFillColor(MUTED)
        canvas.drawString(MARGIN_L, PAGE_H - 28, "SAGRISA  /  GUIA DE MIGRACION E INTEGRACION")
        canvas.setFont("Helvetica", 7)
        canvas.drawRightString(PAGE_W - MARGIN_R, 22, f"Documento de trabajo  |  {page}")
        canvas.setStrokeColor(LINE)
        canvas.line(MARGIN_L, 32, PAGE_W - MARGIN_R, 32)
    canvas.restoreState()


class TechnicalDocTemplate(BaseDocTemplate):
    """Plantilla con marcadores PDF para las secciones principales."""

    def afterFlowable(self, flowable):
        if isinstance(flowable, Paragraph) and flowable.style.name == "H1x":
            text = flowable.getPlainText()
            key = "section-" + re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
            self.canv.bookmarkPage(key)
            self.canv.addOutlineEntry(text, key, level=0, closed=False)


def build_story():
    story = []

    # 1. Cover
    story.extend([Spacer(1, 26), p("SAGRISA", "Kicker"), p("Guía de migración e integración", "CoverTitle")])
    story.append(p("Del legado SAGRI_MOVIL a una API operativa con soporte dual PostgreSQL / SQL Server", "CoverSubtitle"))
    story.append(Spacer(1, 5))
    story.append(callout(
        "Idea central",
        "No migraremos la base legacy completa tal como está. Construiremos una base operativa nueva y conectaremos SAGRI_MOVIL y Dynamics GP mediante una integración gobernada.",
        bg=BLUE_BG, accent=BLUE,
    ))
    story.append(Spacer(1, 22))
    story.append(ArchitectureDiagram(height=205))
    story.append(Spacer(1, 22))
    story.append(two_col(
        labeled_box("Documento", "Documento de trabajo para alinear arquitectura, alcance y siguientes decisiones.", bg=LIGHT, accent=PURPLE),
        labeled_box("Estado y fecha", "Documento de trabajo, no aprobación funcional. 2 de septiembre de 2026. Basado en el SQL, la PWA, OpenAPI y el correo recibido.", bg=LIGHT, accent=BLUE),
    ))
    story.append(PageBreak())

    # Route of reading: the main headings also become PDF bookmarks.
    story.extend(title("Ruta de lectura", "Qué contiene este documento", "La guía separa hechos, interpretación, propuesta y pendientes para que cada equipo pueda revisar la parte que le corresponde."))
    story.append(data_table(
        ["Sección", "Pregunta que responde", "Resultado"],
        [
            ["01. Resumen ejecutivo", "¿Cuál es la ruta recomendada?", "Base dual mínima, cobro 1:N e integración legacy separada."],
            ["02. Lectura del SQL", "¿Qué representa realmente el dump?", "Snapshot de SQL Server y mapa de dependencias."],
            ["03. Arquitectura legacy", "¿Qué responsabilidades están mezcladas?", "Operación, consultas, identidad e integración."],
            ["04. Flujos", "¿Cómo se relacionan pedido, factura y cobro?", "Estados durables y reconciliación con GP."],
            ["05. Cobros", "¿Cómo se modela un pago 1:N?", "Pago más aplicaciones, no un único invoiceId."],
            ["06. Cobros offline", "¿Cómo evitamos doble cobro?", "Idempotencia durable y bloqueo transaccional."],
            ["07. Dual-provider", "¿Qué implica PostgreSQL + SQL Server?", "Código común, DDL hermana y pruebas por motor."],
            ["08. Alcance", "¿Qué migramos y qué integramos?", "Frontera explícita; 76 SP fuera de esta fase."],
            ["09. Requerimientos", "¿Qué falta cerrar con el negocio?", "Perfiles, queries, contratos y fuente de verdad."],
            ["10. Plan", "¿Qué hacemos primero?", "Prerequisite pequeño, vertical slice y validación."],
            ["11-15. Riesgos y anexos", "¿Cómo se decide y valida?", "Controles, fuentes y criterio visual."],
        ],
        [143, 222, 167],
        row_tints={1: BLUE_BG, 3: BLUE_BG, 5: BLUE_BG, 7: BLUE_BG, 9: BLUE_BG, 11: BLUE_BG},
    ))
    story.append(Spacer(1, 12))
    story.append(callout("Cómo leer las afirmaciones", "“Confirmado” identifica algo observado en un archivo o fuente. “Propuesta” indica una decisión técnica recomendada. “Pendiente” significa que falta información o aprobación; no es una regla que debamos inventar por el cliente.", bg=BLUE_BG, accent=BLUE))
    story.append(Spacer(1, 10))
    story.append(section_footer("Los marcadores del PDF permiten saltar a los encabezados principales. La numeración orienta la lectura; no sustituye el plan de ejecución."))

    # 2. Executive decision
    story.extend(title("01 / Resumen ejecutivo", "La migración es una separación de responsabilidades", "El SQL entregado es valioso como mapa del negocio, pero no debe convertirse en el modelo operativo nuevo mediante copia directa."))
    story.append(callout("Decisión recomendada", "Adoptar una base dual mínima para la API, implementar cobros 1:N con idempotencia y mantener el legado como integración separada. La compatibilidad SQL Server se valida antes de declararla lista para producción.", bg=GREEN_BG, accent=GREEN))
    story.append(Spacer(1, 12))
    story.append(metrics_row([
        metric(str(STATS["tables"]), "tablas en el dump", BLUE_BG),
        metric(str(STATS["procedures"]), "procedimientos", PURPLE_BG),
        metric(str(STATS["views"]), "vistas", AMBER_BG),
        metric(str(STATS["triggers"]), "triggers detectados", GREEN_BG),
    ]))
    story.append(Spacer(1, 14))
    story.append(data_table(
        ["Certeza", "Qué podemos afirmar", "Cómo se usará"],
        [
            ["Confirmado", "movil.sql es SQL Server y contiene el legado SAGRI_MOVIL, procedimientos, vistas y dependencias GP.", "Fuente de entendimiento y mapa de integración."],
            ["Interpretación", "La nueva API necesita separar operación, consulta e integración contable.", "Base para el diseño propuesto."],
            ["Pendiente", "Requerimientos de perfiles, lecturas, inserciones y consultas optimizadas aún se están refinando.", "No congelar permisos ni contrato definitivo."],
        ],
        [83, 225, 192],
        row_tints={1: GREEN_BG, 2: BLUE_BG, 3: AMBER_BG},
    ))
    story.append(Spacer(1, 12))
    story.append(section_footer("Fuente de contexto: correo recibido por el equipo. El documento expresa una propuesta técnica, no una aprobación funcional definitiva."))
    story.append(Spacer(1, 18))

    # 3. What SQL really is
    story.extend(title("02 / Lectura del SQL", "El archivo es un snapshot de SQL Server, no una migración incremental", "Su contenido mezcla infraestructura, seguridad, esquema, lógica de negocio e integración. Por eso no debe ejecutarse ni traducirse en bloque."))
    story.append(metrics_row([
        metric(f"{STATS['lines']:,}", "líneas", BLUE_BG),
        metric(str(STATS["functions"]), "función", PURPLE_BG),
        metric(str(STATS["pks"]), "PK detectadas", AMBER_BG),
        metric(str(STATS["fks"]), "FK detectadas", RED_BG),
    ]))
    story.append(Spacer(1, 13))
    story.append(two_col(
        labeled_box("Incluye", "CREATE DATABASE, opciones de SQL Server, usuarios y roles, esquema SAG, tablas, vistas, procedimientos, función, propiedades extendidas y diagramas.", bg=BLUE_BG, accent=BLUE),
        labeled_box("No incluye", "No representa por sí solo datos completos, jobs de SQL Agent, SSIS, linked servers, secretos del servidor, procesos de replicación ni la configuración de Dynamics GP.", bg=AMBER_BG, accent=AMBER),
    ))
    story.append(Spacer(1, 12))
    story.append(callout("Bloqueo de despliegue", "El script crea y usa la base [Movil], pero contiene alrededor de 276 referencias a [SAGRI_MOVIL]. Debe resolverse si se trata de un renombrado, una base externa o una inconsistencia del dump antes de ejecutarlo.", bg=RED_BG, accent=RED))
    story.append(Spacer(1, 12))
    story.append(data_table(
        ["Rasgo", "Lectura técnica", "Impacto"],
        [
            ["116 tablas", "Hay tablas operativas, históricos, staging, proyecciones y tablas de autorización.", "No todo debe ser entidad de la API."],
            ["76 procedimientos", "La lógica vive en procedimientos, transacciones, JSON, correo y referencias GP.", "La integración requiere adaptadores y contratos."],
            ["14 PK / 4 FK", "Muchas tablas no tienen integridad referencial formal.", "No mapear pedidos legacy como entidades EF normales sin estrategia."],
        ],
        [92, 224, 184],
        row_tints={3: RED_BG},
    ))
    story.append(Spacer(1, 18))

    # 4. Legacy map
    story.extend(title("03 / Arquitectura legacy", "SAGRI_MOVIL es un puente entre operación y ERP", "El dump muestra que las responsabilidades actuales están mezcladas: captura móvil, consultas, autorizaciones, facturación, correo y sincronización con GP."))
    story.append(ArchitectureDiagram(height=210))
    story.append(Spacer(1, 13))
    story.append(data_table(
        ["Zona", "Evidencia del SQL", "Destino propuesto"],
        [
            ["Operación", "PedidoEncabezado, PedidoDetalle, Cobro, SAGPagosEncabezado y SAGPagosDetalle.", "Modelo nuevo de la API, normalizado e idempotente."],
            ["Consulta / mirror", "TSAG*, SAGT*, tablas de saldos, precios, facturas y vistas SAG*.", "Read model o adaptador de consulta; validar frescura."],
            ["Integración GP", "GPSAG, NUTGT, SOP30200, RM00101, macros Dexterity y actualización de factura.", "Worker / outbox / adaptador legacy separado."],
            ["Identidad legacy", "UsuariosMovil, WS_Usuarios y WS_Cliente con credenciales antiguas.", "No copiar credenciales; migrar a identidad moderna."],
        ],
        [80, 247, 173],
        row_tints={3: AMBER_BG, 4: RED_BG},
    ))
    story.append(Spacer(1, 11))
    story.append(section_footer("Referencias clave: movil.sql:2471, movil.sql:3562, movil.sql:6104, movil.sql:8312. La numeración corresponde al archivo entregado."))
    story.append(Spacer(1, 18))

    # 5. Business flows
    story.append(KeepTogether(title("04 / Flujos que debemos preservar", "Pedido, factura y cobro no ocurren en una sola transacción", "La nueva plataforma debe mostrar estados durables y reconciliables, porque GP puede facturar después de que la PWA capture el pedido.") + [OrderPaymentFlow(height=208)]))
    story.append(Spacer(1, 14))
    story.append(two_col(
        labeled_box("Pedido", "La API captura encabezado, detalle, dirección, origen y trazabilidad. El legado usa correlativos y puede generar una macro para SOP_Entry.", bg=BLUE_BG, accent=BLUE),
        labeled_box("Factura", "UpdateNumFacturas cruza referencias del pedido con SOP30200 en GPSAG/NUTGT. La relación debe ser idempotente y auditable.", bg=RED_BG, accent=RED),
    ))
    story.append(Spacer(1, 11))
    story.append(callout("Riesgo detectado", "WS_InsertarPedido lee y luego incrementa Correlativo1. La migración debe usar una operación atómica para evitar folios duplicados bajo concurrencia.", bg=AMBER_BG, accent=AMBER))
    story.append(Spacer(1, 18))

    # 6. Payments
    story.extend(title("05 / Cobros", "El modelo correcto es pago + aplicaciones", "El legado confirma que un pago puede aplicarse a varias facturas. La API nueva debe conservar esa semántica sin copiar sus debilidades de integridad."))
    story.append(data_table(
        ["Objeto", "Responsabilidad legacy", "Diseño nuevo"],
        [
            ["Cobro", "Captura monto, método, comprobante, firma, DUI y correo.", "Payment / Cobro como agregado de captura."],
            ["SAGPagosEncabezado", "Identifica pago, cliente, vendedor, fecha y monto total.", "Cabecera del pago y estado durable."],
            ["SAGPagosDetalle", "Relaciona NumPago con NumFactura, monto, estado, tipo y área.", "PaymentAllocation / CobroFacturaDetalle."],
            ["Factura", "No tiene FK local en el dump; su autoridad está fuera del detalle de pago.", "Referencia externa con validación transaccional y reconciliación."],
        ],
        [100, 228, 172],
        row_tints={4: AMBER_BG},
    ))
    story.append(Spacer(1, 13))
    story.append(data_table(
        ["Estado legacy", "Significado", "Tratamiento inicial"],
        [
            ["P / R", "Pendiente / Recibido", "Mapear a captura o revisión."],
            ["A", "Aprobado", "Aplicación confirmada."],
            ["Y / Z", "En análisis / En espera", "Estado intermedio visible."],
            ["C / X", "Cancelado / Anulado", "Terminal, auditable y no reutilizable."],
        ],
        [105, 185, 210],
        row_tints={1: AMBER_BG, 4: RED_BG},
    ))
    story.append(Spacer(1, 12))
    story.append(callout("Regla de diseño", "No se debe reducir automáticamente los siete estados legacy a tres estados de la API sin una tabla de mapeo aprobada por negocio. El correo confirma que los perfiles y operaciones aún están en refinamiento.", bg=PURPLE_BG, accent=PURPLE))
    story.append(Spacer(1, 18))

    # 7. Idempotency/concurrency
    story.append(KeepTogether(title("06 / Cobros offline", "El bloqueo protege la transacción; la idempotencia protege el reintento", "Una fila bloqueada no identifica por sí sola que el mismo cobro fue enviado dos veces desde un dispositivo sin conexión.") + [PaymentIdempotencyFlow(height=210)]))
    story.append(Spacer(1, 12))
    story.append(data_table(
        ["Control", "Qué debe garantizar", "Respuesta"],
        [
            ["Idempotencia", "Misma clave + mismo payload no crea otro pago.", "200 con resultado original."],
            ["Payload hash", "Misma clave con monto o facturas diferentes se rechaza.", "409 conflicto de operación."],
            ["Bloqueo", "Saldo se relee dentro de transacción antes de aplicar.", "409 si el saldo cambió."],
            ["Reintento técnico", "Timeout o caída reenvía la misma clave.", "Reintento seguro; no generar UUID nuevo."],
        ],
        [100, 230, 170],
        row_tints={2: GREEN_BG, 3: RED_BG},
    ))
    story.append(Spacer(1, 11))
    story.append(callout("Decisión", "Mantener concurrencia pesimista para la aplicación financiera. Usar concurrencia optimista después para ediciones no financieras; no utilizarla como sustituto de idempotencia.", bg=GREEN_BG, accent=GREEN))
    story.append(Spacer(1, 18))

    # 8. Dual provider
    story.extend(title("07 / Dual-provider", "La base dual es una capacidad técnica, no una promesa de portabilidad total", "El backend ya tiene, según la inspección compartida, un punto de extensión en Database:Provider. Hay que completar la rama SQL Server sin confundir InMemory con una prueba relacional."))
    story.append(data_table(
        ["Capa", "Común", "Específico por proveedor"],
        [
            ["Configuración", "Provider validado y fail-fast.", "UseNpgsql / UseSqlServer y connection string."],
            ["Modelo", "Entidades y casos de uso comunes.", "jsonb versus nvarchar(max), collation y tipos."],
            ["Consultas", "LINQ portable cuando sea posible.", "ILike, SQL manual y consultas de bloqueo."],
            ["Esquema", "Versión de modelo y checksums.", "Migraciones/DDL PostgreSQL y SQL Server separadas."],
            ["Pruebas", "Casos funcionales idénticos.", "Instancia real de cada motor; InMemory no basta."],
        ],
        [92, 203, 205],
        row_tints={3: AMBER_BG, 4: BLUE_BG, 5: RED_BG},
    ))
    story.append(Spacer(1, 13))
    story.append(two_col(
        labeled_box("PostgreSQL", "Staging operativo y primera implementación de cobros 1:N. Validar JSON, bloqueo, transacciones y outbox.", bg=BLUE_BG, accent=BLUE),
        labeled_box("SQL Server", "Rama preparada y luego probada en una instancia compatible. No declararla productiva sin migración, integración y concurrencia verificadas.", bg=PURPLE_BG, accent=PURPLE),
    ))
    story.append(Spacer(1, 11))
    story.append(section_footer("El soporte de varios proveedores exige mantener artefactos de esquema separados y ejecutar pruebas específicas por motor. La configuración por setting es solo el punto de entrada."))
    story.append(Spacer(1, 18))

    # 9. Migrate/keep/not copy
    story.extend(title("08 / Alcance", "Qué migra, qué se integra y qué no se copia", "Esta separación evita convertir el dump legacy en una dependencia estructural de la nueva API."))
    story.append(data_table(
        ["Migrar a la API nueva", "Mantener como integración", "No copiar automáticamente"],
        [
            ["Pedidos normalizados, detalles, estados, auditoría, origen y trazabilidad.", "WS_PCrearMacroPedidos y procesos de GP.", "Los 116 objetos como entidades EF."],
            ["Cobro, aplicaciones 1:N, idempotencia, outbox y conciliación.", "UpdateNumFacturas y cruces SOP30200.", "Contraseñas y usuarios legacy."],
            ["Identidad, permisos, alcance por rol y consultas contractuales.", "GPSAG, NUTGT, SAGRI_MOVIL y mirror de lectura.", "Opciones físicas .mdf/.ldf del dump."],
            ["Precios con cliente, país, lista, oferta y precisión necesaria.", "Macros, correo y estados BAC/Caféina.", "Roles db_owner/datawriter del ambiente origen."],
        ],
        [168, 168, 164],
        row_tints={1: BLUE_BG, 2: GREEN_BG, 3: AMBER_BG, 4: RED_BG},
    ))
    story.append(Spacer(1, 14))
    story.append(callout("Regla de frontera", "La PWA entra por APIM. La API decide reglas y permisos. La base operativa registra la operación. El adaptador legacy conversa con SAGRI_MOVIL y GP. Ningún frontend debe conectarse directamente a SQL o Dynamics.", bg=BLUE_BG, accent=BLUE))
    story.append(Spacer(1, 18))

    # 10. Requirements and contract
    story.append(KeepTogether(title("09 / Requerimientos pendientes", "El correo recibido impide cerrar todavía el contrato funcional", "El equipo remitente está refinando perfiles y consultas. Eso debe reflejarse en el documento como pendiente, no como una ausencia que podamos resolver por suposición.") + [data_table(
        ["Pendiente del cliente", "Por qué importa", "Salida necesaria"],
        [
            ["Operaciones por perfil", "Define comandos, consultas y autorización fina.", "Matriz rol x acción x alcance."],
            ["Gerentes, ventas y supervisores", "El flujo aún no está revisado completamente.", "Casos de uso y pruebas por perfil."],
            ["Queries optimizadas", "Afecta endpoints, paginación, frescura y rendimiento.", "Catálogo de consultas con SLA."],
            ["Fuente de verdad", "Pedidos, facturas, saldos y precios no viven todos en el mismo sitio.", "Mapa de ownership y reconciliación."],
            ["Offline", "La operación puede llegar tarde o repetida.", "Política de estados, idempotencia y revisión manual."],
        ],
        [150, 200, 150],
        row_tints={1: AMBER_BG, 2: AMBER_BG, 3: BLUE_BG, 4: RED_BG, 5: PURPLE_BG},
    )]))
    story.append(Spacer(1, 14))
    story.append(two_col(
        labeled_box("Contrato actual a revisar", "La PWA usa rutas de pedidos/cobros y modelos 1:1 en algunos servicios, mientras el OpenAPI documenta convenciones distintas. Se debe elegir una convención canónica.", bg=RED_BG, accent=RED),
        labeled_box("Contrato objetivo", "POST de cobro con clientOperationId y allocations[]. Estados explícitos, errores 409/202, y eventos de integración versionados.", bg=GREEN_BG, accent=GREEN),
    ))
    story.append(Spacer(1, 18))

    # 11. Exact plan
    story.extend(title("10 / Plan de ejecución", "Primero una base dual pequeña; después una funcionalidad financiera completa", "La secuencia reduce retrabajo y permite validar el negocio sobre PostgreSQL sin esconder los requisitos de SQL Server."))
    story.append(data_table(
        ["Rastreo", "Entregable", "Criterio de salida"],
        [
            ["0. Base dual mínima", "Provider, paquete SQL Server, fail-fast, migraciones separadas y health check sanitizado.", "La API inicia y aplica esquema en PostgreSQL; SQL Server queda preparado."],
            ["1. Cobro 1:N", "Payment + allocations, estados, evidencia y contrato estable.", "Unit tests de dominio y API sobre PostgreSQL."],
            ["2. Integridad", "Idempotencia, bloqueo, saldo, auditoría y outbox.", "Casos concurrentes y reintentos sin doble cobro."],
            ["3. Frontend", "Multi-factura, clave estable offline, estados y errores.", "Flujo E2E online, offline, retry y conflicto."],
            ["4. SQL Server", "DDL hermana y pruebas de proveedor.", "Misma batería en instancia real; no solo compilación."],
            ["5. Legacy", "Adaptador GP/SAGRI_MOVIL, eventos y reconciliación.", "Pruebas de contrato sin duplicar escrituras."],
        ],
        [105, 230, 165],
        row_tints={1: BLUE_BG, 2: GREEN_BG, 3: GREEN_BG, 4: PURPLE_BG, 5: AMBER_BG, 6: RED_BG},
    ))
    story.append(Spacer(1, 12))
    story.append(callout("Orden recomendado", "Implementar la base dual mínima como prerequisite pequeño. Implementar la Fase 1 sobre PostgreSQL. Validar SQL Server en paralelo después del vertical slice. Mantener la traducción de los 76 SP fuera de esta fase.", bg=GREEN_BG, accent=GREEN))
    story.append(Spacer(1, 18))

    # 12. Decisions A-D
    story.extend(title("11 / Decisiones concretas", "Respuestas recomendadas para cerrar el plan", "Estas respuestas incorporan lo descubierto en el SQL, la PWA y el mensaje de requerimientos pendientes."))
    story.append(data_table(
        ["Pregunta", "Decisión", "Condición"],
        [
            ["A. Webhook / GP", "Actualizar el contrato ahora mediante evento versionado PaymentCreatedV2.", "No dejar un consumidor 1:1 oculto detrás de un flujo 1:N."],
            ["B. Frontend", "Misma fase funcional, aunque sea un entregable separado.", "Debe enviar y conservar clientOperationId en online/offline."],
            ["C. SQL Server", "Marcarlo preparado pero no validado si no hay instancia disponible.", "Producción exige probar un motor real compatible."],
            ["D. Naming", "ClientOperationId como nombre canónico en C#, JSON y base.", "Idempotency-Key puede ser transporte HTTP del mismo valor."],
        ],
        [115, 220, 165],
        row_tints={1: RED_BG, 2: BLUE_BG, 3: AMBER_BG, 4: PURPLE_BG},
    ))
    story.append(Spacer(1, 15))
    story.append(callout("Decisión financiera", "Para cobros: concurrencia pesimista + idempotencia durable. Para ediciones no financieras: concurrencia optimista cuando corresponda.", bg=GREEN_BG, accent=GREEN))
    story.append(Spacer(1, 12))
    story.append(callout("Decisión de alcance", "El SQL legacy se documenta y se integra; no se traduce completo ni se ejecuta como migración de la API.", bg=AMBER_BG, accent=AMBER))
    story.append(Spacer(1, 18))

    # 13. Security and risks
    story.extend(title("12 / Riesgos de producción", "Los puntos críticos son de integridad, seguridad y operación", "El dump revela riesgos que una migración mecánica conservaría. Deben convertirse en controles explícitos."))
    story.append(data_table(
        ["Prioridad", "Riesgo", "Control"],
        [
            ["CRITICA", "Movil / SAGRI_MOVIL inconsistente y dependencias externas no declaradas.", "Resolver nombre, ownership, conectividad y orden de despliegue."],
            ["ALTA", "Credenciales legacy en PIN, password directo y cifrado con clave fija.", "No migrar secretos; usar identidad moderna y rotación."],
            ["ALTA", "Cobros sin idempotencia y facturas sin FK local.", "Clave única, hash de payload, transacción y reconciliación."],
            ["ALTA", "Correlativo leído y actualizado en pasos separados.", "Secuencia u operación atómica con prueba concurrente."],
            ["MEDIA", "Tablas con muchas columnas nullable, char/nchar y money.", "Mapeo explícito, normalización y reglas de precisión."],
            ["MEDIA", "Usuarios y roles del ambiente original incluidos en el dump.", "Excluir y reconstruir acceso con mínimo privilegio."],
        ],
        [63, 240, 197],
        row_tints={1: RED_BG, 2: RED_BG, 3: AMBER_BG, 4: AMBER_BG, 5: BLUE_BG, 6: PURPLE_BG},
    ))
    story.append(Spacer(1, 13))
    story.append(callout("No ejecutar tal cual", "El archivo contiene CREATE DATABASE, rutas locales de archivos, usuarios, roles y referencias a GPSAG/NUTGT. Debe convertirse en artefactos controlados por ambiente, no reutilizarse directamente en Azure.", bg=RED_BG, accent=RED))
    story.append(Spacer(1, 18))

    # 14. Validation checklist
    story.extend(title("13 / Checklist de validación", "No declarar migración terminada sin evidencia", "Cada etapa debe producir pruebas reproducibles y una decisión clara de continuar, corregir o bloquear."))
    story.append(data_table(
        ["Área", "Evidencia mínima"],
        [
            ["Requerimientos", "Matriz de roles, lecturas/escrituras, alcance de datos y criterios de aceptación aprobados."],
            ["Contrato", "OpenAPI consistente con rutas runtime, DTOs, estados, errores y versionado de eventos."],
            ["PostgreSQL", "Aplicación de DDL, pruebas de cobro 1:N, transacciones, idempotencia y outbox."],
            ["SQL Server", "Aplicación de DDL hermana y misma batería en instancia real; no solo InMemory."],
            ["Offline", "Misma clave en reintento, resolución de 200/202/409 y revisión manual de conflictos."],
            ["Legacy", "Pruebas de adaptador con GP/SAGRI_MOVIL, correlación pedido-factura y reconciliación."],
            ["Seguridad", "Secretos fuera del frontend, mínimo privilegio, logs sin PII innecesaria y auditoría."],
            ["Operación", "Health check, métricas, correlación, backups, rollback y RPO/RTO definidos."],
        ],
        [105, 395],
        row_tints={1: BLUE_BG, 2: PURPLE_BG, 3: GREEN_BG, 4: AMBER_BG, 5: AMBER_BG, 6: RED_BG},
    ))
    story.append(Spacer(1, 13))
    story.append(callout("Siguiente paso", "Obtener el documento de requerimientos refinado y las migraciones reales 001-006 del backend. Con esos artefactos se puede convertir esta guía en un plan de implementación por archivo y prueba.", bg=BLUE_BG, accent=BLUE))
    story.append(Spacer(1, 18))

    # 15. Sources and notes
    story.append(KeepTogether(title("14 / Fuentes y límites", "Base documental utilizada", "Este PDF consolida el análisis disponible hasta el 2 de septiembre de 2026. Los puntos que dependen del backend se etiquetan como observaciones proporcionadas y deben revalidarse en ese repositorio.") + [data_table(
        ["Fuente", "Uso en este documento"],
        [
            ["C:\\Users\\tmoyy\\Downloads\\movil.sql", "Snapshot legacy SQL Server. Líneas críticas: 1, 2471, 3562, 5650, 6104, 6135, 8312 y 9100."],
            ["F:\\SAGRISSA_COD\\SAGRISSA\\docs\\analisis_integracion_sagri_movil.md", "Consolidación local de integración legacy, precios, cobros, roles y brechas."],
            ["F:\\SAGRISSA_COD\\SAGRISSA\\docs\\openapi\\sagrisa-v1.yaml", "Contrato documentado de la PWA/APIM y dominios de API."],
            ["F:\\SAGRISSA_COD\\SAGRISSA\\src\\features\\cobros\\services\\cobros.service.ts", "Modelo frontend actual 1:1 y estados de cobro actuales."],
            ["F:\\SAGRISSA_COD\\SAGRISSA\\src\\core\\api\\sync.service.ts", "Cola offline, reintentos y necesidad de una clave estable de idempotencia."],
            ["Correo recibido", "Confirma que requerimientos, perfiles y queries optimizadas todavía están en refinamiento."],
            ["Backend sagrisa-api", "Las referencias a Database:Provider y PostgresFacturaRepository son observaciones compartidas; no fueron revalidadas en este checkout de la PWA."],
        ],
        [180, 320],
        row_tints={1: BLUE_BG, 6: AMBER_BG, 7: PURPLE_BG},
    )]))
    story.append(Spacer(1, 15))
    story.append(callout("Cierre", "La ruta propuesta protege lo avanzado: permite continuar con la Fase 1 sin convertir el legacy en deuda estructural y deja SQL Server listo para validación real cuando infraestructura y requerimientos estén confirmados.", bg=GREEN_BG, accent=GREEN))
    story.append(Spacer(1, 18))
    story.append(p("SAGRISA  |  Guía de migración e integración  |  Documento de trabajo", "Smallx"))
    story.append(Spacer(1, 18))

    # 16. Color and accessibility rationale
    story.extend(title("15 / Criterio visual", "Azul, negro y blanco para lectura y reproducción", "La investigación distingue entre el espacio de color del PDF y la paleta visual del documento. No existe un único color obligatorio para todos los PDF: el destino - pantalla o impresión - determina la gestión de color."))
    story.append(data_table(
        ["Referencia", "Hallazgo", "Aplicación en esta versión"],
        [
            ["Adobe / visualización", "Para documentos vistos principalmente en línea, Adobe recomienda trabajar en sRGB.", "El PDF usa gráficos vectoriales simples y una paleta azul/negro, sin imágenes que introduzcan perfiles distintos."],
            ["Adobe / impresión", "En impresión los colores RGB y CMYK se gestionan según el dispositivo y su perfil; PDF/X-1a convierte al CMYK de destino.", "Se entrega una versión digital sobria. Si se enviará a imprenta, se debe solicitar el perfil y hacer una prueba de salida."],
            ["W3C / contraste", "WCAG 2.2 pide 4.5:1 para texto normal y 3:1 para texto grande.", "Texto negro sobre blanco y encabezados en azul oscuro; los significados también están escritos, no dependen del color."],
            ["W3C / uso del color", "El color no debe ser el único medio para indicar un estado, acción o diferencia.", "Prioridades, estados, riesgos y decisiones se identifican con etiquetas, tablas, títulos y texto explícito."],
        ],
        [112, 220, 188],
        row_tints={1: BLUE_BG, 2: BLUE_BG, 3: BLUE_BG, 4: BLUE_BG},
    ))
    story.append(Spacer(1, 14))
    story.append(callout("Paleta aplicada", "Negro para lectura y datos; azul oscuro para títulos y advertencias; azul para estructura, líneas y navegación; blanco para fondos y espacios de descanso. Se eliminaron los tonos verdes, rojos, morados y amarillos.", bg=BLUE_BG, accent=BLUE))
    story.append(Spacer(1, 14))
    story.append(p("Fuentes web consultadas", "H2x"))
    story.append(data_table(
        ["Fuente", "Enlace"],
        [
            ["Google - documentos técnicos", "https://developers.google.com/tech-writing/one/documents"],
            ["Google - documentos grandes", "https://developers.google.com/tech-writing/two/large-docs"],
            ["Google - edición y tono", "https://developers.google.com/tech-writing/two/editing  |  https://developers.google.com/style/tone"],
            ["AWS / Microsoft / Fowler - ADR", "https://docs.aws.amazon.com/prescriptive-guidance/latest/architectural-decision-records/adr-process.html  |  https://learn.microsoft.com/en-us/azure/well-architected/architect-role/architecture-decision-record  |  https://martinfowler.com/bliki/ArchitectureDecisionRecord.html"],
            ["ReportLab - Platypus", "https://docs.reportlab.com/reportlab/userguide/ch5_platypus/  |  https://docs.reportlab.com/reportlab/userguide/ch6_paragraphs/"],
            ["Adobe - PDF accesible y color", "https://helpx.adobe.com/acrobat/using/creating-accessible-pdfs.html  |  https://helpx.adobe.com/acrobat/using/color-managing-documents.html"],
            ["W3C - WCAG 2.2", "https://www.w3.org/TR/WCAG22/"],
            ["YouTube - ADR, C4 y práctica senior", "https://www.youtube.com/watch?v=Akv39MNdR1M  |  https://www.youtube.com/watch?v=KvoBrUd1-5E  |  https://www.youtube.com/watch?v=pNtkOZuWetg"],
        ],
        [210, 310],
        row_tints={1: BLUE_BG, 2: BLUE_BG, 3: BLUE_BG, 4: BLUE_BG, 5: BLUE_BG, 6: BLUE_BG, 7: BLUE_BG, 8: BLUE_BG},
    ))
    story.append(Spacer(1, 14))
    story.append(callout("Conclusión visual", "La versión final prioriza impresión legible, copia de texto y consistencia entre pantalla y papel. El azul funciona como señal de estructura, pero ninguna decisión del documento depende exclusivamente de verlo en color.", bg=BLUE_BG, accent=BLUE))
    return story


def main():
    OUT.parent.mkdir(parents=True, exist_ok=True)
    frame = Frame(MARGIN_L, MARGIN_B, CONTENT_W, PAGE_H - MARGIN_T - MARGIN_B, id="normal", leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
    doc = TechnicalDocTemplate(
        str(OUT), pagesize=letter, leftMargin=MARGIN_L, rightMargin=MARGIN_R,
        topMargin=MARGIN_T, bottomMargin=MARGIN_B, title="Guia de migracion e integracion SAGRISA",
        author="OpenAI - Codex", subject="Arquitectura legacy, API dual-provider y cobros 1:N",
    )
    doc.addPageTemplates([PageTemplate(id="main", frames=[frame], onPage=on_page)])
    doc.build(build_story())
    print(f"CREATED {OUT}")
    print(f"PAGES_STATS lines={STATS['lines']} tables={STATS['tables']} procs={STATS['procedures']} views={STATS['views']}")


if __name__ == "__main__":
    main()
