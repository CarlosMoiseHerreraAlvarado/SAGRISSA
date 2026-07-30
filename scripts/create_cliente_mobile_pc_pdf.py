from pathlib import Path
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen import canvas


ROOT = Path(__file__).resolve().parents[1]
LOGIN_IMG = Path(r"C:\Users\tmoyy\AppData\Local\Temp\codex-clipboard-d664b9e5-bd9a-446f-8a0e-17d781862940.png")
HOME_IMG = Path(r"C:\Users\tmoyy\AppData\Local\Temp\codex-clipboard-3ba3b67f-c2d5-4d4a-a851-b7cfbde192c0.png")
BLUE = colors.HexColor("#00A9F4")
BLUE_DARK = colors.HexColor("#0077B6")
INK = colors.HexColor("#0F172A")
MUTED = colors.HexColor("#64748B")
LIGHT = colors.HexColor("#94A3B8")
SOFT = colors.HexColor("#F4F6F9")
BORDER = colors.HexColor("#E8EDF2")
GREEN = colors.HexColor("#10B981")
AMBER = colors.HexColor("#F59E0B")
ORANGE = colors.HexColor("#F97316")
RED = colors.HexColor("#EF4444")
PURPLE = colors.HexColor("#8B5CF6")


def rr(c, x, y, w, h, r=14, fill=colors.white, stroke=None, sw=1):
    c.setLineWidth(sw); c.setFillColor(fill); c.setStrokeColor(stroke or fill)
    c.roundRect(x, y, w, h, r, fill=1, stroke=1 if stroke else 0)


def txt(c, x, y, s, size=10, color=INK, bold=False, align="left"):
    c.setFillColor(color); c.setFont("Helvetica-Bold" if bold else "Helvetica", size)
    if align == "right": c.drawRightString(x, y, s)
    elif align == "center": c.drawCentredString(x, y, s)
    else: c.drawString(x, y, s)


def line(c, x1, y1, x2, y2, color=BORDER, width=1, dash=None):
    c.saveState(); c.setStrokeColor(color); c.setLineWidth(width)
    if dash: c.setDash(dash)
    c.line(x1, y1, x2, y2); c.restoreState()


def dashed_decor(c, alpha=0.35):
    c.saveState(); c.setStrokeColor(colors.Color(BLUE.red, BLUE.green, BLUE.blue, alpha=alpha)); c.setLineWidth(2); c.setDash(5, 5)
    p = c.beginPath(); p.moveTo(300, 844); p.curveTo(306, 795, 340, 790, 362, 806); p.curveTo(371, 812, 378, 814, 386, 811); c.drawPath(p)
    p2 = c.beginPath(); p2.moveTo(-2, 190); p2.curveTo(22, 173, 45, 181, 56, 205); c.drawPath(p2); c.line(368, 64, 368, 132); c.restoreState()


def bottom_nav(c, active="Inicio"):
    c.setFillColor(colors.white); c.setStrokeColor(BORDER); c.rect(0, 0, 390, 70, fill=1, stroke=1)
    labels = [("H", "Inicio"), ("$", "Cartera"), ("D", "Facturas"), ("*", "Ajustes")]; xs = [48, 145, 243, 343]
    for x, (icon, label) in zip(xs, labels):
        selected = label == active
        if selected: c.setFillColor(BLUE); c.roundRect(x - 16, 67, 32, 3, 1.5, fill=1, stroke=0)
        txt(c, x, 39, icon, 17, BLUE if selected else MUTED, bold=True, align="center"); txt(c, x, 15, label, 8, BLUE if selected else MUTED, bold=selected, align="center")


def draw_login(c, pin=False):
    c.setFillColor(colors.white); c.rect(0, 0, 390, 844, fill=1, stroke=0); dashed_decor(c, 0.95)
    txt(c, 28, 730, "SAGRISA", 28, BLUE, bold=True); txt(c, 28, 659, "Bienvenido/a", 20, INK, bold=True); txt(c, 28, 638, "Para iniciar, escriba su nombre y", 13, MUTED); txt(c, 28, 620, "numero de DUI", 13, MUTED)
    rr(c, 28, 528, 336, 46, 12, colors.white, colors.HexColor("#CBD5E1"), 1); txt(c, 44, 546, "Escriba su PIN" if pin else "Escriba su DUI", 13, LIGHT)
    if pin: txt(c, 44, 555, "****", 18, INK, bold=True); txt(c, 28, 489, "Iniciar con huella digital", 13, INK, bold=True)
    rr(c, 28, 457 if not pin else 414, 336, 48, 12, BLUE); txt(c, 196, 474 if not pin else 431, "Iniciar", 14, colors.white, bold=True, align="center")


def draw_actual_image(c, path, x=42, y=140, width=278):
    if not path.exists(): return phone_from_drawer(c, lambda cc: draw_login(cc, False), x, y, width)
    height = width * 844.0 / 390.0; c.saveState(); c.setFillColor(colors.HexColor("#D8E1E8")); c.roundRect(x - 4, y - 4, width + 8, height + 8, 18, fill=1, stroke=0); c.drawImage(ImageReader(str(path)), x, y, width=width, height=height, preserveAspectRatio=True, mask="auto"); c.restoreState(); return width, height


def phone_from_drawer(c, drawer, x=42, y=140, width=278):
    scale = width / 390.0; height = 844 * scale; c.saveState(); c.setFillColor(colors.HexColor("#D8E1E8")); c.roundRect(x - 4, y - 4, width + 8, height + 8, 18, fill=1, stroke=0); c.translate(x, y); c.scale(scale, scale); drawer(c); c.restoreState(); return width, height


def mobile_header(c, title, subtitle=None, active="Inicio"):
    dashed_decor(c, 0.22); txt(c, 24, 802, "<", 25, BLUE, bold=True); txt(c, 56, 805, title, 18, INK, bold=True)
    if subtitle: txt(c, 56, 786, subtitle.upper(), 8.5, BLUE, bold=True)
    bottom_nav(c, active)


def screen_account(c):
    c.setFillColor(colors.white); c.rect(0, 0, 390, 844, fill=1, stroke=0); mobile_header(c, "Estado de cuenta", active="Cartera"); txt(c, 24, 750, "Andrea Montoya", 15, INK, bold=True); txt(c, 24, 733, "CLIENTE SAGRISA", 9, BLUE, bold=True)
    rr(c, 20, 572, 350, 130, 18, BLUE); txt(c, 42, 670, "TOTAL ADEUDADO", 8, colors.Color(1,1,1,alpha=.7), bold=True); txt(c, 42, 630, "$580,000.00", 23, colors.white, bold=True); txt(c, 42, 606, "Credito disponible: $420,000", 10, colors.Color(1,1,1,alpha=.75))
    rr(c, 20, 310, 350, 240, 18, colors.white, BORDER, 1); txt(c, 42, 520, "ANTIGUEDAD DE SALDO", 10, INK, bold=True)
    for i, (name, amount, ratio, col) in enumerate([("0 a 30 dias", "$350,000", .92, GREEN), ("31 a 60 dias", "$130,000", .38, colors.HexColor("#34D399")), ("61 a 90 dias", "$80,000", .23, AMBER), ("Mas de 90 dias", "$20,000", .08, ORANGE)]):
        yy = 482 - i * 47; txt(c, 42, yy, name, 8.5, MUTED, bold=True); txt(c, 346, yy, amount, 8.5, INK, bold=True, align="right"); rr(c, 42, yy-14, 304, 6, 3, colors.HexColor("#E8EEF4")); rr(c, 42, yy-14, 304*ratio, 6, 3, col)
    rr(c, 20, 240, 168, 48, 13, BLUE); txt(c, 104, 258, "DESCARGAR PDF", 8, colors.white, bold=True, align="center"); rr(c, 202, 240, 168, 48, 13, colors.white, BORDER, 1); txt(c, 286, 258, "ENVIAR EMAIL", 8, MUTED, bold=True, align="center")
    bottom_nav(c, "Cartera")


def mobile_invoice_card(c, x, y, num, date, total, balance, status="PENDIENTE", col=ORANGE):
    rr(c, x, y, 342, 105, 16, colors.white, BORDER, 1); txt(c, x+16, y+77, num, 12, INK, bold=True); rr(c, x+228, y+70, 96, 19, 9, colors.Color(col.red,col.green,col.blue,alpha=.12)); txt(c,x+276,y+77,status,7,col,bold=True,align="center"); txt(c,x+16,y+48,"EMISION",7,LIGHT,bold=True); txt(c,x+16,y+31,date,9,MUTED,bold=True); txt(c,x+185,y+48,"TOTAL",7,LIGHT,bold=True); txt(c,x+185,y+31,total,9,INK,bold=True); line(c,x+16,y+20,x+324,y+20,BORDER); txt(c,x+16,y+7,"SALDO",7,LIGHT,bold=True); txt(c,x+324,y+7,balance,9,BLUE if balance != "$0" else MUTED,bold=True,align="right")


def screen_invoices(c):
    c.setFillColor(colors.white); c.rect(0,0,390,844,fill=1,stroke=0); mobile_header(c,"Facturas",active="Facturas"); rr(c,24,704,342,40,12,colors.white,colors.HexColor("#CBD5E1"),1); txt(c,42,718,"Q",12,LIGHT,bold=True); txt(c,62,718,"Buscar por folio...",10,LIGHT); rr(c,24,654,342,36,12,colors.HexColor("#F8FAFC")); rr(c,26,656,164,32,9,BLUE); txt(c,108,668,"PENDIENTES 3",8,colors.white,bold=True,align="center"); txt(c,282,668,"HISTORICO 8",8,MUTED,bold=True,align="center")
    mobile_invoice_card(c,24,520,"FAC-99201-1","30 Abr, 2022","$580,000","$580,000"); mobile_invoice_card(c,24,400,"FAC-99200-4","18 Abr, 2022","$120,000","$95,000"); mobile_invoice_card(c,24,280,"FAC-99198-2","02 Abr, 2022","$75,000","$45,000"); bottom_nav(c,"Facturas")


def screen_invoice_detail(c):
    c.setFillColor(colors.white); c.rect(0,0,390,844,fill=1,stroke=0); mobile_header(c,"DETALLE DOCUMENTO",active="Facturas"); rr(c,298,792,68,26,10,colors.HexColor("#E0F2FE")); txt(c,332,801,"PDF",9,BLUE_DARK,bold=True,align="center")
    rr(c,20,585,350,180,18,colors.white,BORDER,1); txt(c,40,730,"REFERENCIA",8,LIGHT,bold=True); txt(c,40,707,"FAC-99201-1",13,INK,bold=True); txt(c,215,730,"FECHA",8,LIGHT,bold=True); txt(c,215,707,"30 Abr, 2022",10,INK,bold=True); line(c,40,680,350,680,BORDER); txt(c,40,654,"TITULAR CUENTA",8,LIGHT,bold=True); txt(c,40,632,"Andrea Montoya",11,INK,bold=True); txt(c,215,654,"SALDO",8,LIGHT,bold=True); txt(c,215,632,"$580,000",14,RED,bold=True)
    txt(c,20,550,"LINEAS DETALLE",10,INK,bold=True); rr(c,20,335,350,195,18,colors.white,BORDER,1)
    for i,(name,qty,amount) in enumerate([("Concentrado para aves","10 unidades","$300,000"),("Fertilizante NPK","4 unidades","$180,000"),("Semilla hibrida","2 unidades","$100,000")]):
        yy=485-i*48; txt(c,38,yy,name,10,INK,bold=True); txt(c,38,yy-17,qty,8,LIGHT,bold=True); txt(c,350,yy-5,amount,10,INK,bold=True,align="right");
        if i<2: line(c,38,yy-28,350,yy-28,BORDER)
    rr(c,20,277,350,42,0,INK); txt(c,40,301,"TOTAL FACTURADO",7,colors.Color(1,1,1,alpha=.65),bold=True); txt(c,40,285,"$580,000",17,colors.white,bold=True); txt(c,20,245,"PLANIFICACION ENTREGA",10,INK,bold=True); rr(c,20,170,350,58,14,colors.HexColor("#F8FAFC"),BORDER,1); txt(c,40,204,"BODEGA CENTRAL SAGRISA, SAN SALVADOR",8,MUTED,bold=True); bottom_nav(c,"Facturas")


def screen_orders(c):
    c.setFillColor(colors.white); c.rect(0,0,390,844,fill=1,stroke=0); mobile_header(c,"Mis pedidos",active="Inicio"); rr(c,24,704,342,40,12,colors.white,colors.HexColor("#CBD5E1"),1); txt(c,42,718,"Q",12,LIGHT,bold=True); txt(c,62,718,"Buscar por numero...",10,LIGHT)
    for i,(num,date,items,total,status,col) in enumerate([("ORD-99020","15 May, 2022","12","$45,800","BORRADOR",ORANGE),("ORD-99018","12 May, 2022","8","$32,400","ENTREGADO",GREEN),("ORD-99015","08 May, 2022","15","$67,200","ENTREGADO",GREEN),("ORD-99010","01 May, 2022","6","$21,500","ENTREGADO",GREEN)]):
        y=560-i*125; rr(c,24,y,342,105,16,colors.white,BORDER,1); txt(c,42,y+78,num,12,INK,bold=True); rr(c,252,y+70,72,18,9,colors.Color(col.red,col.green,col.blue,alpha=.12)); txt(c,288,y+76,status,6.5,col,bold=True,align="center"); txt(c,42,y+44,"FECHA",7,LIGHT,bold=True); txt(c,42,y+28,date,9,MUTED,bold=True); txt(c,200,y+44,"ARTICULOS",7,LIGHT,bold=True); txt(c,200,y+28,items,9,MUTED,bold=True); txt(c,324,y+10,total,10,BLUE,bold=True,align="right")
    bottom_nav(c,"Inicio")


def screen_order_detail(c):
    c.setFillColor(colors.white); c.rect(0,0,390,844,fill=1,stroke=0); mobile_header(c,"ORD-99020","DETALLE DE PEDIDO",active="Inicio"); rr(c,290,786,76,24,10,colors.HexColor("#FFF7ED")); txt(c,328,794,"BORRADOR",8,ORANGE,bold=True,align="center"); rr(c,20,520,350,220,18,colors.white,BORDER,1); txt(c,40,706,"SEGUIMIENTO DE ENTREGA",10,INK,bold=True); line(c,54,632,338,632,colors.HexColor("#E2E8F0"),2)
    for i,(lab,col) in enumerate([("Recibido",BLUE),("Aprobado",colors.HexColor("#CBD5E1")),("Preparacion",colors.HexColor("#CBD5E1")),("En Camino",colors.HexColor("#CBD5E1")),("Entregado",colors.HexColor("#CBD5E1"))]):
        xx=[54,124,196,268,338][i]; c.setFillColor(col); c.circle(xx,632,14,fill=1,stroke=0); txt(c,xx,628,"1" if i==0 else str(i+1),8,colors.white if i==0 else MUTED,bold=True,align="center"); txt(c,xx,602,lab,6.5,INK if i==0 else LIGHT,bold=True,align="center")
    txt(c,20,485,"ARTICULOS",10,INK,bold=True); rr(c,20,280,350,185,18,colors.white,BORDER,1)
    for i,(name,qty,amount) in enumerate([("Concentrado para aves","10 unidades","$30,000"),("Fertilizante NPK","4 unidades","$12,000"),("Semilla hibrida","2 unidades","$3,800")]):
        yy=425-i*48; txt(c,38,yy,name,9.5,INK,bold=True); txt(c,38,yy-16,qty,8,LIGHT,bold=True); txt(c,350,yy-5,amount,9,INK,bold=True,align="right");
        if i<2: line(c,38,yy-28,350,yy-28,BORDER)
    txt(c,38,300,"TOTAL PEDIDO",8,LIGHT,bold=True); txt(c,350,300,"$45,800",15,BLUE,bold=True,align="right"); rr(c,20,105,350,145,18,colors.white,BORDER,1); txt(c,38,222,"INFORMACION DE ENTREGA",10,INK,bold=True); txt(c,38,190,"20 May, 2022 - Bodega central SAGRISA",9,MUTED,bold=True); bottom_nav(c,"Inicio")


def screen_profile(c):
    c.setFillColor(colors.white); c.rect(0,0,390,844,fill=1,stroke=0); dashed_decor(c,.2); txt(c,24,788,"Mi Perfil",24,INK,bold=True); txt(c,24,768,"CONFIGURACION DE USUARIO",9,BLUE,bold=True); rr(c,20,550,350,195,22,colors.white,BORDER,1); c.setFillColor(colors.HexColor("#F8FAFC")); c.circle(195,696,38,fill=1,stroke=0); txt(c,195,685,"A",30,BLUE,bold=True,align="center"); txt(c,195,640,"Andrea Montoya",17,INK,bold=True,align="center"); rr(c,149,612,92,22,11,colors.HexColor("#E0F2FE")); txt(c,195,619,"CLIENTE",8,BLUE_DARK,bold=True,align="center"); line(c,42,590,348,590,BORDER); txt(c,195,568,"cliente@sagrissa.com",9,MUTED,bold=True,align="center"); txt(c,24,520,"PREFERENCIAS DEL SISTEMA",10,INK,bold=True); rr(c,20,295,350,208,22,colors.white,BORDER,1)
    for i,(name,col,on) in enumerate([("Notificaciones Push",BLUE,True),("Modo Oscuro",LIGHT,False),("Sincronizacion Offline",GREEN,True),("Acceso Biometrico",PURPLE,False)]):
        yy=455-i*50; txt(c,42,yy,name,10.5,INK,bold=True); rr(c,320,yy-2,31,16,8,col if on else colors.HexColor("#E2E8F0")); c.setFillColor(colors.white); c.circle(342 if on else 328,yy+6,6,fill=1,stroke=0); 
        if i<3: line(c,42,yy-27,348,yy-27,BORDER)
    rr(c,20,230,350,42,13,colors.HexColor("#FEF2F2"),colors.HexColor("#FECACA"),1); txt(c,195,246,"CERRAR SESION",10,RED,bold=True,align="center"); bottom_nav(c,"Ajustes")


OUT = ROOT / "output" / "pdf" / "SAGRISA_Rol_Cliente_Flujo_Mobile_PC.pdf"
PAGE_W, PAGE_H = landscape(A4)
DESKTOP_W, DESKTOP_H = 1200, 760


def client_nav(c, active="Inicio", y_top=690):
    items = [("H", "Inicio"), ("$", "Cartera"), ("D", "Facturas"), ("*", "Ajustes")]
    for idx, (icon, label) in enumerate(items):
        y = y_top - idx * 56
        selected = active == label
        if selected:
            rr(c, 18, y - 12, 224, 42, 12, BLUE, None)
        txt(c, 42, y + 2, icon, 16, colors.white if selected else MUTED, bold=True, align="center")
        txt(c, 68, y + 1, label, 10, colors.white if selected else MUTED, bold=selected)


def desktop_shell(c, active="Inicio"):
    c.setFillColor(SOFT)
    c.rect(0, 0, DESKTOP_W, DESKTOP_H, fill=1, stroke=0)
    c.setFillColor(colors.white)
    c.rect(0, 0, 260, DESKTOP_H, fill=1, stroke=0)
    line(c, 260, 0, 260, DESKTOP_H, BORDER)
    rr(c, 28, 690, 34, 34, 10, BLUE, None)
    txt(c, 45, 701, "S", 16, colors.white, bold=True, align="center")
    txt(c, 76, 703, "SAGRISA", 18, INK, bold=True)
    txt(c, 28, 654, "NAVEGACION", 8, LIGHT, bold=True)
    client_nav(c, active, 620)
    rr(c, 20, 105, 220, 105, 14, colors.HexColor("#F8FAFC"), BORDER, 1)
    txt(c, 36, 184, "CONECTIVIDAD", 7.5, LIGHT, bold=True)
    c.setFillColor(GREEN); c.circle(38, 162, 4, fill=1, stroke=0)
    txt(c, 50, 158, "EN LINEA", 9, MUTED, bold=True)
    txt(c, 36, 133, "Sincronizacion local", 8.5, MUTED)
    rr(c, 36, 111, 188, 18, 8, colors.white, BORDER, 1)
    txt(c, 130, 117, "SINCRONIZAR AHORA", 7, BLUE_DARK, bold=True, align="center")
    line(c, 20, 88, 240, 88, BORDER)
    txt(c, 36, 60, "Andrea Montoya", 10, INK, bold=True)
    txt(c, 36, 43, "CLIENTE", 8, BLUE, bold=True)
    txt(c, 218, 50, "->", 13, MUTED, bold=True, align="right")


def desktop_header(c, title, subtitle=None, back=False):
    if back:
        txt(c, 300, 705, "<", 23, BLUE, bold=True)
    x = 340 if back else 300
    txt(c, x, 705, title, 25, INK, bold=True)
    if subtitle:
        txt(c, x, 680, subtitle.upper(), 9, BLUE, bold=True)


def desktop_card(c, x, y, w, h, fill=colors.white, stroke=BORDER, radius=20):
    rr(c, x, y, w, h, radius, fill, stroke, 1)


def desktop_metric(c, x, y, w, h, title, value, detail, fill=colors.white, value_color=INK, detail_color=GREEN):
    desktop_card(c, x, y, w, h, fill)
    title_color = colors.Color(1, 1, 1, alpha=.70) if fill != colors.white else LIGHT
    txt(c, x + 16, y + h - 24, title.upper(), 8, title_color, bold=True)
    txt(c, x + 16, y + h - 58, value, 24, value_color, bold=True)
    txt(c, x + 16, y + 17, detail, 9, detail_color if fill == colors.white else colors.Color(1, 1, 1, alpha=.78), bold=True)


def desktop_login(c, pin=False):
    c.setFillColor(SOFT); c.rect(0, 0, DESKTOP_W, DESKTOP_H, fill=1, stroke=0)
    rr(c, 376, 38, 448, 684, 32, colors.white, None)
    c.setFillColor(BLUE); c.rect(376, 718, 448, 4, fill=1, stroke=0)
    txt(c, 424, 644, "SAGRISA", 29, BLUE, bold=True)
    rr(c, 424, 592, 168, 25, 12, colors.HexColor("#E0F2FE"), None)
    txt(c, 508, 600, "ACCESO SEGURO", 8, BLUE_DARK, bold=True, align="center")
    txt(c, 424, 548, "Bienvenido/a", 22, INK, bold=True)
    txt(c, 424, 522, "Ingrese su DUI y PIN para entrar", 11, MUTED)
    txt(c, 424, 505, "a la experiencia correspondiente.", 11, MUTED)
    txt(c, 424, 463, "PIN" if pin else "DUI", 9, MUTED, bold=True)
    rr(c, 424, 415, 352, 40, 12, colors.white, colors.HexColor("#CBD5E1"), 1)
    txt(c, 442, 429, "****" if pin else "00123456-7", 12, INK if pin else LIGHT, bold=pin)
    rr(c, 424, 356, 352, 43, 12, BLUE, None)
    txt(c, 600, 371, "INICIAR SESION" if pin else "CONTINUAR", 10, colors.white, bold=True, align="center")
    txt(c, 600, 112, "El rol y las capacidades se asignan desde el servidor.", 8.5, LIGHT, align="center")
    txt(c, 600, 90, "SAGRISA - Plataforma comercial", 8, LIGHT, bold=True, align="center")


def desktop_home(c):
    desktop_shell(c, "Inicio")
    desktop_header(c, "Resumen de cuenta", "Cliente")
    desktop_metric(c, 300, 548, 850, 100, "Saldo total adeudado", "$580,000.00", "Informacion actualizada desde el API", BLUE, colors.white, colors.white)
    desktop_metric(c, 300, 432, 190, 92, "Disponible", "$420,000", "Credito", colors.white, INK, BLUE)
    desktop_metric(c, 510, 432, 190, 92, "Dias credito", "30 d", "Termino", colors.white, INK, BLUE)
    desktop_metric(c, 720, 432, 190, 92, "Ultimo pago", "$2,971", "15 May 2022", colors.white, INK, GREEN)
    desktop_metric(c, 930, 432, 220, 92, "Facturas pendientes", "3", "Requieren consulta", colors.white, INK, ORANGE)
    desktop_card(c, 300, 178, 550, 230, colors.white)
    txt(c, 326, 378, "ANTIGUEDAD DE SALDO", 9, INK, bold=True)
    for idx, (name, amount, ratio, col) in enumerate([("0 a 30 dias", "$350,000", .92, GREEN), ("31 a 60 dias", "$130,000", .38, colors.HexColor("#34D399")), ("61 a 90 dias", "$80,000", .23, AMBER), ("Mas de 90 dias", "$20,000", .08, ORANGE)]):
        yy = 340 - idx * 45
        txt(c, 326, yy, name, 9, MUTED, bold=True)
        txt(c, 824, yy, amount, 9, INK, bold=True, align="right")
        rr(c, 326, yy - 15, 498, 7, 3.5, colors.HexColor("#E8EEF4"), None)
        rr(c, 326, yy - 15, 498 * ratio, 7, 3.5, col, None)
    txt(c, 875, 378, "ACTIVIDAD RECIENTE", 9, INK, bold=True)
    for idx, (num, date, status, amount, col) in enumerate([("FAC-99201-1", "30 Abr 2022", "PENDIENTE", "$580,000", ORANGE), ("FAC-99200-4", "18 Abr 2022", "PAGADA", "$120,000", GREEN), ("FAC-99198-2", "02 Abr 2022", "PENDIENTE", "$75,000", ORANGE)]):
        yy = 332 - idx * 62
        desktop_card(c, 875, yy - 28, 275, 52, colors.white)
        txt(c, 890, yy + 7, num, 9, INK, bold=True)
        txt(c, 890, yy - 10, date, 7.5, LIGHT, bold=True)
        txt(c, 1136, yy - 2, amount, 9, BLUE, bold=True, align="right")
        txt(c, 1136, yy - 16, status, 7, col, bold=True, align="right")


def desktop_account(c):
    desktop_shell(c, "Cartera")
    desktop_header(c, "Estado de cuenta", "Andrea Montoya", back=True)
    desktop_card(c, 300, 490, 610, 148, BLUE, None)
    txt(c, 328, 597, "TOTAL ADEUDADO", 9, colors.Color(1, 1, 1, alpha=.72), bold=True)
    txt(c, 328, 552, "$580,000.00", 30, colors.white, bold=True)
    txt(c, 328, 525, "Credito disponible: $420,000", 11, colors.Color(1, 1, 1, alpha=.78))
    desktop_card(c, 300, 205, 610, 255, colors.white)
    txt(c, 326, 425, "ANTIGUEDAD DE SALDO", 9, INK, bold=True)
    for idx, (name, amount, ratio, col) in enumerate([("0 a 30 dias", "$350,000", .92, GREEN), ("31 a 60 dias", "$130,000", .38, colors.HexColor("#34D399")), ("61 a 90 dias", "$80,000", .23, AMBER), ("91 a 120 dias", "$20,000", .08, ORANGE), ("Mas de 120 dias", "$0", .01, RED)]):
        yy = 390 - idx * 37
        txt(c, 326, yy, name, 8.5, MUTED, bold=True)
        txt(c, 872, yy, amount, 8.5, INK, bold=True, align="right")
        rr(c, 326, yy - 13, 546, 6, 3, colors.HexColor("#E8EEF4"), None)
        rr(c, 326, yy - 13, 546 * ratio, 6, 3, col, None)
    txt(c, 935, 612, "ACCIONES", 9, INK, bold=True)
    for yy, label, fill in [(550, "DESCARGAR PDF", BLUE), (486, "ENVIAR POR EMAIL", colors.white), (422, "VER FACTURAS", colors.HexColor("#F8FAFC"))]:
        desktop_card(c, 935, yy, 215, 45, fill, BORDER if fill == colors.white else None, 13)
        txt(c, 1042, yy + 17, label, 8, colors.white if fill == BLUE else MUTED, bold=True, align="center")
    for idx, (label, value) in enumerate([("Facturas pendientes", "3"), ("Pedidos abiertos", "2"), ("Dias de pago", "24")]):
        x = 935 + (idx % 2) * 112
        y = 345 - (idx // 2) * 68
        desktop_card(c, x, y, 103, 54, colors.white)
        txt(c, x + 10, y + 34, label.upper(), 6.2, LIGHT, bold=True)
        txt(c, x + 10, y + 13, value, 16, INK, bold=True)


def desktop_invoice(c, x, y, number, date, amount, balance, status, col):
    desktop_card(c, x, y, 262, 120, colors.white)
    txt(c, x + 16, y + 94, number, 12, INK, bold=True)
    rr(c, x + 165, y + 84, 80, 18, 9, colors.Color(col.red, col.green, col.blue, alpha=.12), None)
    txt(c, x + 205, y + 91, status, 7, col, bold=True, align="center")
    txt(c, x + 16, y + 60, "EMISION", 7, LIGHT, bold=True)
    txt(c, x + 16, y + 43, date, 9, MUTED, bold=True)
    txt(c, x + 140, y + 60, "TOTAL", 7, LIGHT, bold=True)
    txt(c, x + 246, y + 43, amount, 9, INK, bold=True, align="right")
    line(c, x + 16, y + 28, x + 246, y + 28, BORDER)
    txt(c, x + 16, y + 12, "SALDO", 7, LIGHT, bold=True)
    txt(c, x + 246, y + 11, balance, 9, BLUE if balance != "$0" else MUTED, bold=True, align="right")


def desktop_invoices(c):
    desktop_shell(c, "Facturas")
    desktop_header(c, "Facturas", "Listado y busqueda", back=True)
    rr(c, 300, 618, 650, 42, 12, colors.white, BORDER, 1)
    txt(c, 320, 633, "Q", 12, LIGHT, bold=True)
    txt(c, 346, 632, "Buscar por Folio...", 10, LIGHT)
    rr(c, 965, 618, 185, 42, 12, colors.HexColor("#ECFDF5"), None)
    txt(c, 1057, 633, "EXPORTAR EXCEL", 8, GREEN, bold=True, align="center")
    rr(c, 300, 560, 850, 38, 12, colors.HexColor("#F8FAFC"), None)
    rr(c, 302, 562, 420, 34, 10, BLUE, None)
    txt(c, 512, 575, "SALDOS PENDIENTES  3", 8, colors.white, bold=True, align="center")
    txt(c, 940, 575, "FACTURADO HISTORICO  8", 8, MUTED, bold=True, align="center")
    desktop_invoice(c, 300, 405, "FAC-99201-1", "30 Abr, 2022", "$580,000", "$580,000", "PENDIENTE", ORANGE)
    desktop_invoice(c, 580, 405, "FAC-99200-4", "18 Abr, 2022", "$120,000", "$95,000", "PENDIENTE", ORANGE)
    desktop_invoice(c, 860, 405, "FAC-99198-2", "02 Abr, 2022", "$75,000", "$45,000", "PENDIENTE", ORANGE)
    txt(c, 300, 350, "HISTORICO RECIENTE", 9, INK, bold=True)
    desktop_invoice(c, 300, 210, "FAC-99190-2", "22 Mar, 2022", "$42,000", "$0", "PAGADA", GREEN)
    desktop_invoice(c, 580, 210, "FAC-99182-8", "10 Mar, 2022", "$38,500", "$0", "PAGADA", GREEN)


def desktop_invoice_detail(c):
    desktop_shell(c, "Facturas")
    desktop_header(c, "Detalle Documento", "FAC-99201-1", back=True)
    rr(c, 1060, 688, 90, 30, 10, colors.HexColor("#E0F2FE"), None)
    txt(c, 1105, 698, "PDF", 8, BLUE_DARK, bold=True, align="center")
    desktop_card(c, 300, 516, 850, 148, colors.white)
    for x, lab, val, align in [(326, "REFERENCIA", "FAC-99201-1", "left"), (610, "FECHA CONTABLE", "30 Abr, 2022", "left"), (880, "NUMERO PEDIDO", "ORD-99020", "left")]:
        txt(c, x, 628, lab, 8, LIGHT, bold=True); txt(c, x, 604, val, 12, BLUE if lab == "NUMERO PEDIDO" else INK, bold=True, align=align)
    line(c, 326, 580, 1124, 580, BORDER)
    txt(c, 326, 558, "TITULAR CUENTA", 8, LIGHT, bold=True); txt(c, 326, 536, "Andrea Montoya", 11, INK, bold=True)
    txt(c, 880, 558, "SALDO PENDIENTE", 8, LIGHT, bold=True); txt(c, 880, 536, "$580,000", 16, RED, bold=True)
    desktop_card(c, 300, 212, 550, 278, colors.white)
    txt(c, 326, 458, "LINEAS DETALLE", 9, INK, bold=True)
    for i, (name, qty, amount) in enumerate([("Concentrado para aves", "10 unidades", "$300,000"), ("Fertilizante NPK", "4 unidades", "$180,000"), ("Semilla hibrida", "2 unidades", "$100,000")]):
        yy = 410 - i * 57
        txt(c, 326, yy, name, 10, INK, bold=True); txt(c, 326, yy - 17, qty, 8, LIGHT, bold=True); txt(c, 824, yy - 5, amount, 10, INK, bold=True, align="right")
        if i < 2: line(c, 326, yy - 30, 824, yy - 30, BORDER)
    rr(c, 326, 232, 498, 45, 0, INK, None)
    txt(c, 344, 258, "TOTAL FACTURADO", 8, colors.Color(1, 1, 1, alpha=.65), bold=True); txt(c, 344, 241, "$580,000", 17, colors.white, bold=True)
    desktop_card(c, 880, 212, 270, 278, colors.white)
    txt(c, 906, 458, "PLANIFICACION ENTREGA", 9, INK, bold=True)
    txt(c, 906, 420, "LUGAR DE ENTREGA", 8, LIGHT, bold=True)
    txt(c, 906, 397, "Bodega central SAGRISA", 10, MUTED, bold=True)
    txt(c, 906, 380, "San Salvador", 10, MUTED, bold=True)


def desktop_orders(c):
    desktop_shell(c, "Inicio")
    desktop_header(c, "Mis pedidos", "Consulta de pedidos", back=True)
    rr(c, 300, 618, 850, 42, 12, colors.white, BORDER, 1)
    txt(c, 320, 633, "Q", 12, LIGHT, bold=True); txt(c, 346, 632, "Buscar por numero...", 10, LIGHT)
    for idx, (number, date, items, total, status, col) in enumerate([("ORD-99020", "15 May, 2022", "12 articulos", "$45,800", "BORRADOR", ORANGE), ("ORD-99018", "12 May, 2022", "8 articulos", "$32,400", "ENTREGADO", GREEN), ("ORD-99015", "08 May, 2022", "15 articulos", "$67,200", "ENTREGADO", GREEN), ("ORD-99010", "01 May, 2022", "6 articulos", "$21,500", "ENTREGADO", GREEN)]):
        x = 300 + (idx % 3) * 285
        y = 435 - (idx // 3) * 145
        desktop_card(c, x, y, 265, 112, colors.white)
        txt(c, x + 16, y + 84, number, 12, INK, bold=True); txt(c, x + 16, y + 58, "FECHA", 7, LIGHT, bold=True); txt(c, x + 16, y + 41, date, 9, MUTED, bold=True); txt(c, x + 16, y + 21, items, 8, LIGHT, bold=True); txt(c, x + 245, y + 22, total, 10, BLUE, bold=True, align="right")
        rr(c, x + 160, y + 77, 85, 17, 8, colors.Color(col.red, col.green, col.blue, alpha=.12), None); txt(c, x + 202, y + 83, status, 7, col, bold=True, align="center")


def desktop_order_detail(c):
    desktop_shell(c, "Inicio")
    desktop_header(c, "ORD-99020", "DETALLE DE PEDIDO", back=True)
    rr(c, 1040, 688, 110, 28, 10, colors.HexColor("#FFF7ED"), None); txt(c, 1095, 698, "BORRADOR", 8, ORANGE, bold=True, align="center")
    desktop_card(c, 300, 490, 850, 170, colors.white)
    txt(c, 326, 628, "SEGUIMIENTO DE ENTREGA", 9, INK, bold=True)
    line(c, 350, 568, 1100, 568, colors.HexColor("#E2E8F0"), 2)
    steps = [("Recibido", BLUE), ("Aprobado", colors.HexColor("#CBD5E1")), ("Preparacion", colors.HexColor("#CBD5E1")), ("En Camino", colors.HexColor("#CBD5E1")), ("Entregado", colors.HexColor("#CBD5E1"))]
    for i, (lab, col) in enumerate(steps):
        xx = 350 + i * 188
        c.setFillColor(col); c.circle(xx, 568, 17, fill=1, stroke=0); txt(c, xx, 563, "1" if i == 0 else str(i + 1), 9, colors.white if i == 0 else MUTED, bold=True, align="center"); txt(c, xx, 535, lab, 8, INK if i == 0 else LIGHT, bold=True, align="center")
    desktop_card(c, 300, 190, 420, 270, colors.white)
    txt(c, 326, 428, "ARTICULOS", 9, INK, bold=True)
    for i, (name, qty, amount) in enumerate([("Concentrado para aves", "10 unidades", "$30,000"), ("Fertilizante NPK", "4 unidades", "$12,000"), ("Semilla hibrida", "2 unidades", "$3,800")]):
        yy = 385 - i * 52
        txt(c, 326, yy, name, 9.5, INK, bold=True); txt(c, 326, yy - 17, qty, 8, LIGHT, bold=True); txt(c, 694, yy - 5, amount, 9, INK, bold=True, align="right")
        if i < 2: line(c, 326, yy - 29, 694, yy - 29, BORDER)
    txt(c, 326, 218, "TOTAL PEDIDO", 8, LIGHT, bold=True); txt(c, 694, 218, "$45,800", 15, BLUE, bold=True, align="right")
    desktop_card(c, 750, 190, 400, 270, colors.white)
    txt(c, 776, 428, "INFORMACION DE ENTREGA", 9, INK, bold=True)
    for yy, lab, val in [(380, "FECHA ESTIMADA", "20 May, 2022"), (320, "DIRECCION DE ENVIO", "Bodega central SAGRISA"), (260, "OBSERVACIONES", "Sin observaciones")]:
        txt(c, 776, yy, lab, 8, LIGHT, bold=True); txt(c, 776, yy - 20, val, 10, MUTED, bold=True)


def desktop_catalog(c):
    desktop_shell(c, "Inicio")
    desktop_header(c, "Catalogo", "Consulta de productos", back=True)
    rr(c, 300, 618, 710, 42, 12, colors.white, BORDER, 1); txt(c, 320, 633, "Q", 12, LIGHT, bold=True); txt(c, 346, 632, "Buscar SKU o nombre...", 10, LIGHT)
    rr(c, 1024, 618, 126, 42, 12, colors.white, BORDER, 1); txt(c, 1087, 632, "FILTROS", 8, BLUE_DARK, bold=True, align="center")
    for i, cat in enumerate(["TODOS", "FERTILIZANTES", "SEMILLAS", "HERBICIDAS", "FUNGICIDAS"]):
        x = 300 + i * 138
        rr(c, x, 570, 126, 27, 10, BLUE if i == 0 else colors.white, None if i == 0 else BORDER, 1); txt(c, x + 63, 579, cat, 6.5, colors.white if i == 0 else MUTED, bold=True, align="center")
    products = [("SKU-001", "Concentrado para aves", "$30,000", "Stock"), ("SKU-002", "Fertilizante NPK", "$45,000", "Stock"), ("SKU-003", "Semilla hibrida", "$18,500", "Stock"), ("SKU-004", "Herbicida agricola", "$22,000", "Stock"), ("SKU-005", "Fungicida foliar", "$27,900", "Agotado"), ("SKU-006", "Semilla de maiz", "$16,200", "Stock")]
    for idx, (sku, name, price, stock) in enumerate(products):
        x = 300 + (idx % 3) * 285; y = 410 - (idx // 3) * 145
        desktop_card(c, x, y, 265, 112, colors.white)
        rr(c, x + 15, y + 47, 42, 42, 12, colors.HexColor("#F8FAFC"), None); txt(c, x + 36, y + 63, "P", 14, LIGHT, bold=True, align="center")
        txt(c, x + 70, y + 84, sku, 7, BLUE, bold=True); txt(c, x + 70, y + 64, name, 9, INK, bold=True); txt(c, x + 70, y + 43, price, 10, INK, bold=True)
        txt(c, x + 70, y + 22, stock.upper(), 7, GREEN if stock == "Stock" else RED, bold=True)


def desktop_profile(c):
    desktop_shell(c, "Ajustes")
    desktop_header(c, "Mi Perfil", "Configuracion de usuario")
    desktop_card(c, 300, 405, 420, 250, colors.white)
    c.setFillColor(colors.HexColor("#F8FAFC")); c.circle(510, 590, 42, fill=1, stroke=0); txt(c, 510, 578, "A", 30, BLUE, bold=True, align="center")
    txt(c, 510, 530, "Andrea Montoya", 18, INK, bold=True, align="center")
    rr(c, 461, 498, 98, 23, 11, colors.HexColor("#E0F2FE"), None); txt(c, 510, 506, "CLIENTE", 8, BLUE_DARK, bold=True, align="center")
    line(c, 330, 470, 690, 470, BORDER); txt(c, 420, 443, "cliente@sagrissa.com", 10, MUTED, bold=True, align="center"); txt(c, 595, 443, "Comercial", 10, MUTED, bold=True, align="center")
    desktop_card(c, 750, 405, 400, 250, colors.white)
    txt(c, 776, 620, "PREFERENCIAS DEL SISTEMA", 9, INK, bold=True)
    prefs = [("Notificaciones Push", BLUE, True), ("Modo Oscuro", LIGHT, False), ("Sincronizacion Offline", GREEN, True), ("Acceso Biometrico", PURPLE, False)]
    for i, (name, col, on) in enumerate(prefs):
        yy = 580 - i * 45
        txt(c, 776, yy, name, 10, INK, bold=True); rr(c, 1065, yy - 5, 42, 19, 9, col if on else colors.HexColor("#E2E8F0"), None); c.setFillColor(colors.white); c.circle(1097 if on else 1075, yy + 4, 7, fill=1, stroke=0)
        if i < 3: line(c, 776, yy - 22, 1122, yy - 22, BORDER)
    desktop_card(c, 300, 260, 850, 105, colors.HexColor("#0F172A"), None)
    txt(c, 326, 335, "CAPACIDADES EFECTIVAS", 8, colors.Color(1, 1, 1, alpha=.58), bold=True); txt(c, 326, 305, "account.read   invoices.read   orders.read   catalog.read", 11, colors.white, bold=True)
    rr(c, 300, 190, 850, 48, 14, colors.HexColor("#FEF2F2"), colors.HexColor("#FECACA"), 1); txt(c, 725, 208, "CERRAR SESION", 9, RED, bold=True, align="center")


def desktop_frame(c, drawer, x, y, width=390, height=286):
    rr(c, x, y, width, height, 14, colors.HexColor("#D8E1E8"), None)
    rr(c, x + 4, y + height - 25, width - 8, 21, 8, colors.white, None)
    for idx, col in enumerate([RED, AMBER, GREEN]):
        c.setFillColor(col); c.circle(x + 16 + idx * 12, y + height - 14, 3, fill=1, stroke=0)
    inner_w = width - 8
    inner_h = height - 32
    scale_x = inner_w / DESKTOP_W
    scale_y = inner_h / DESKTOP_H
    c.saveState(); c.translate(x + 4, y + 4); c.scale(scale_x, scale_y); drawer(c); c.restoreState()


def page_header(c, page_no, total, title, path):
    c.setFillColor(SOFT); c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    txt(c, 30, PAGE_H - 28, "SAGRISA", 14, BLUE, bold=True)
    txt(c, PAGE_W - 30, PAGE_H - 28, f"{page_no:02d} / {total:02d}", 8.5, MUTED, bold=True, align="right")
    line(c, 30, PAGE_H - 40, PAGE_W - 30, PAGE_H - 40, BORDER)
    txt(c, 30, PAGE_H - 70, title, 18, INK, bold=True)
    txt(c, 30, PAGE_H - 87, path, 8.5, BLUE_DARK, bold=True)


def info_box(c, x, y, w, h, label, value):
    rr(c, x, y, w, h, 10, colors.white, BORDER, 1)
    txt(c, x + 10, y + h - 16, label.upper(), 6.5, LIGHT, bold=True)
    words = value.split(); lines = []; current = ""
    for word in words:
        candidate = (current + " " + word).strip()
        if current and len(candidate) > 32:
            lines.append(current); current = word
        else:
            current = candidate
    if current: lines.append(current)
    for idx, item in enumerate(lines[:4]):
        txt(c, x + 10, y + h - 34 - idx * 11, item, 8.2, INK, bold=True)


def mobile_label(c, x, y, text):
    rr(c, x, y, 150, 18, 8, colors.HexColor("#E0F2FE"), None)
    txt(c, x + 75, y + 6, text, 6.5, BLUE_DARK, bold=True, align="center")


def desktop_label(c, x, y, text):
    rr(c, x, y, 150, 18, 8, colors.HexColor("#E0F2FE"), None)
    txt(c, x + 75, y + 6, text, 6.3, BLUE_DARK, bold=True, align="center")


def screen_catalog_mobile(c):
    c.setFillColor(colors.white); c.rect(0, 0, 390, 844, fill=1, stroke=0)
    dashed_decor(c, 0.25)
    txt(c, 24, 790, "Catalogo", 22, INK, bold=True)
    rr(c, 24, 733, 342, 40, 12, colors.white, colors.HexColor("#CBD5E1"), 1); txt(c, 42, 747, "Q", 12, LIGHT, bold=True); txt(c, 62, 747, "Buscar SKU o nombre...", 10, LIGHT)
    for i, cat in enumerate(["TODOS", "FERTILIZANTES", "SEMILLAS"]):
        x = 24 + i * 113; rr(c, x, 693, 105, 24, 9, BLUE if i == 0 else colors.white, None if i == 0 else BORDER, 1); txt(c, x + 52, 701, cat, 6.5, colors.white if i == 0 else MUTED, bold=True, align="center")
    for idx, (sku, name, price, stock) in enumerate([("SKU-001", "Concentrado para aves", "$30,000", "STOCK"), ("SKU-002", "Fertilizante NPK", "$45,000", "STOCK"), ("SKU-003", "Semilla hibrida", "$18,500", "AGOTADO")]):
        y = 570 - idx * 120; rr(c, 24, y, 342, 100, 16, colors.white, BORDER, 1); rr(c, 40, y + 22, 58, 58, 14, colors.HexColor("#F8FAFC"), None); txt(c, 69, y + 45, "P", 18, LIGHT, bold=True, align="center"); txt(c, 116, y + 74, sku, 8, BLUE, bold=True); txt(c, 116, y + 52, name, 10, INK, bold=True); txt(c, 116, y + 29, price, 10, INK, bold=True); txt(c, 326, y + 29, stock, 7, GREEN if stock == "STOCK" else RED, bold=True, align="right")
    txt(c, 24, 80, "Vista de consulta - sin edicion para Cliente", 8, LIGHT, bold=True)
    # Catalogo is reached from Home quick access, not the client bottom menu.
    bottom_nav(c, active="Inicio")


def build_pdf():
    OUT.parent.mkdir(parents=True, exist_ok=True)
    screens = [
        ("01", "Acceso - DUI", "/login - paso 1", "Identificacion inicial", "El Cliente ingresa su DUI y continua al PIN. La version PC conserva la misma accion en una tarjeta centrada.", "Pantalla publica", "Acceso publico", "login_dui", "desktop_login_dui"),
        ("02", "Acceso - PIN", "/login - paso 2", "Autenticacion", "Se confirma el PIN y la alternativa biometrica. Mobile y PC mantienen la misma jerarquia de acceso.", "Pantalla publica", "DUI -> PIN", "login_pin", "desktop_login_pin"),
        ("03", "Inicio Cliente", "/app/cliente/home", "Resumen de cuenta", "Concentra deuda, credito, antiguedad, accesos rapidos y actividad reciente; en PC se abre una columna lateral de actividad.", "Ruta conectada", "Inicio", "home", "desktop_home"),
        ("04", "Estado de Cuenta", "/app/cliente/cartera", "Consulta financiera", "La vista amplia el resumen de deuda, rangos de antiguedad y acciones de PDF/email; PC separa acciones en una columna lateral.", "Ruta conectada", "Cartera", "account", "desktop_account"),
        ("05", "Facturas", "/app/cliente/facturas", "Listado y busqueda", "Permite filtrar pendientes o historico y abrir cada factura. Mobile apila tarjetas; PC usa grilla y muestra exportacion Excel.", "Ruta conectada", "Facturas", "invoices", "desktop_invoices"),
        ("06", "Detalle de factura", "/app/cliente/facturas/:id", "Lectura del documento", "Muestra referencia, saldo, lineas, notas de credito y entrega; PC divide informacion, detalle y logistica.", "Ruta conectada", "Facturas -> detalle", "invoice_detail", "desktop_invoice_detail"),
        ("07", "Mis Pedidos", "/app/cliente/pedidos", "Consulta de pedidos", "Busca pedidos y abre su detalle. En PC la grilla crece a dos o tres columnas sin cambiar la informacion.", "Ruta conectada", "Acceso desde Inicio", "orders", "desktop_orders"),
        ("08", "Detalle de pedido", "/app/cliente/pedidos/:id", "Seguimiento", "La linea de estados explica el avance y luego separa articulos y entrega; en PC ambos bloques se muestran lado a lado.", "Ruta conectada", "Pedidos -> detalle", "order_detail", "desktop_order_detail"),
        ("09", "Catalogo", "/app/cliente/catalogo", "Consulta de productos", "El Cliente consulta productos, categorias, stock y filtros sin editar. Se accede desde el acceso rapido de Inicio, no desde el menu inferior.", "Ruta conectada - acceso rapido", "Inicio -> Catalogo", "catalog", "desktop_catalog"),
        ("10", "Mi Perfil", "/app/config", "Preferencias y salida", "Perfil, notificaciones, sincronizacion, biometria, claims y cierre de sesion; PC distribuye perfil y preferencias en columnas.", "Ruta conectada", "Ajustes", "profile", "desktop_profile"),
    ]
    total = len(screens) + 1
    c = canvas.Canvas(str(OUT), pagesize=landscape(A4))
    c.setTitle("SAGRISA - Rol Cliente - Flujo Mobile y PC")
    for page_no, (num, title, path, subtitle, desc, status, nav, mobile_kind, desktop_kind) in enumerate(screens, start=1):
        page_header(c, page_no, total, f"{num} - {title}", path)
        mobile_label(c, 36, 460, "MOBILE - 390 x 844")
        desktop_label_x = 218
        desktop_label(c, desktop_label_x, 460, "PC - TARJETA CENTRADA" if path.startswith("/login") else "PC - SIDEBAR 260 PX")
        if mobile_kind == "login_dui":
            draw_actual_image(c, LOGIN_IMG, x=36, y=106, width=150)
        elif mobile_kind == "home":
            draw_actual_image(c, HOME_IMG, x=36, y=106, width=150)
        else:
            mobile_drawers = {"login_pin": lambda cc: draw_login(cc, True), "account": screen_account, "invoices": screen_invoices, "invoice_detail": screen_invoice_detail, "orders": screen_orders, "order_detail": screen_order_detail, "catalog": screen_catalog_mobile, "profile": screen_profile}
            phone_from_drawer(c, mobile_drawers[mobile_kind], x=36, y=106, width=150)
        desktop_drawers = {"desktop_login_dui": lambda cc: desktop_login(cc, False), "desktop_login_pin": lambda cc: desktop_login(cc, True), "desktop_home": desktop_home, "desktop_account": desktop_account, "desktop_invoices": desktop_invoices, "desktop_invoice_detail": desktop_invoice_detail, "desktop_orders": desktop_orders, "desktop_order_detail": desktop_order_detail, "desktop_catalog": desktop_catalog, "desktop_profile": desktop_profile}
        desktop_frame(c, desktop_drawers[desktop_kind], 218, 145, width=380, height=300)
        info_box(c, 620, 382, 192, 80, "Que resuelve", desc)
        info_box(c, 620, 304, 192, 58, "Estado en codigo", status)
        info_box(c, 620, 246, 192, 58, "Navegacion", nav)
        rr(c, 620, 133, 192, 95, 14, colors.HexColor("#E0F2FE"), None)
        txt(c, 634, 207, "PRINCIPIO DE DISENO", 6.5, BLUE_DARK, bold=True)
        txt(c, 634, 184, "Consulta clara", 12, INK, bold=True)
        txt(c, 634, 164, "Mobile y PC conservan", 8.5, MUTED)
        txt(c, 634, 150, "la misma jerarquia", 8.5, MUTED)
        txt(c, 634, 136, "financiera y operativa.", 8.5, MUTED)
        txt(c, 36, 35, "SAGRISA - Racional creativo - Cliente - Mobile + PC", 7.5, MUTED)
        c.showPage()

    page_header(c, total, total, "Hallazgos y criterios responsive", "Comparacion del flujo Cliente con App.tsx y AppLayout")
    txt(c, 30, PAGE_H - 116, "El mismo recorrido mantiene contenido y jerarquia; cambia la forma de organizarlo.", 14, INK, bold=True)
    notes = [
        ("Navegacion", "Mobile usa bottom nav con Inicio, Cartera, Facturas y Ajustes. PC usa sidebar de 260 px, estado de conectividad y perfil."),
        ("Rutas conectadas", "Home, Operaciones, Pedidos, detalle de pedido, Catalogo, Cartera, Facturas, detalle de factura y Config estan registradas para Cliente."),
        ("Accesos secundarios", "Catalogo se abre desde Inicio. Operaciones existe como /app/cliente/operaciones con pestañas, pero no aparece en el menu principal."),
        ("Cambios PC", "Grillas de indicadores, facturas, pedidos y catalogo crecen a 2/3 columnas; Estado de cuenta y detalle de pedido separan acciones o logistica."),
        ("Datos y estados", "Las pantallas usan API con loading/error y servicios de prueba cuando corresponde. Las imagenes PC de este documento son reconstrucciones fieles del responsive del codigo."),
        ("Orden recomendado", "Login -> Inicio -> Cartera -> Facturas -> Detalle -> Pedidos -> Detalle -> Catalogo -> Ajustes."),
    ]
    y = PAGE_H - 154
    for tag, body in notes:
        rr(c, 30, y - 40, PAGE_W - 60, 47, 11, colors.white, BORDER, 1)
        fill = colors.HexColor("#E0F2FE") if tag in ("Navegacion", "Rutas conectadas") else colors.HexColor("#FFF7ED")
        col = BLUE_DARK if tag in ("Navegacion", "Rutas conectadas") else ORANGE
        rr(c, 44, y - 26, 130, 20, 9, fill, None); txt(c, 109, y - 19, tag.upper(), 7, col, bold=True, align="center")
        words = body.split(); lines = []; current = ""
        for word in words:
            candidate = (current + " " + word).strip()
            if current and len(candidate) > 108:
                lines.append(current); current = word
            else: current = candidate
        if current: lines.append(current)
        for idx, item in enumerate(lines[:2]): txt(c, 192, y - 14 - idx * 13, item, 8.5, INK)
        y -= 56
    rr(c, 30, 44, PAGE_W - 60, 60, 14, colors.HexColor("#0F172A"), None)
    txt(c, 48, 80, "Entrega recomendada", 10, colors.white, bold=True)
    txt(c, 48, 61, "Cada pagina compara el mismo estado en Mobile y PC para facilitar handoff de diseno e ingenieria.", 8.5, colors.Color(1, 1, 1, alpha=.82))
    txt(c, 30, 29, "SAGRISA - Racional creativo - Cliente - Mobile + PC", 7.5, MUTED)
    c.showPage()
    c.save()
    return OUT


if __name__ == "__main__":
    print(build_pdf())
