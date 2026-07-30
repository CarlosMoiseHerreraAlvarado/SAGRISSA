from reportlab.lib import colors
from reportlab.lib.pagesizes import A4, landscape
from reportlab.pdfgen import canvas

from create_cliente_mobile_pc_pdf import (
    ROOT, LOGIN_IMG, BLUE, BLUE_DARK, INK, MUTED, LIGHT, SOFT, BORDER,
    GREEN, AMBER, ORANGE, RED, PURPLE, rr, txt, line, dashed_decor,
    draw_login, draw_actual_image, phone_from_drawer, desktop_frame,
    page_header, info_box, mobile_label, desktop_label,
)


OUT = ROOT / "output" / "pdf" / "SAGRISA_Rol_Vendedor_Flujo_Mobile_PC.pdf"
PAGE_W, PAGE_H = landscape(A4)
DESKTOP_W, DESKTOP_H = 1200, 760


def vendor_nav(c, active="Inicio", y_top=690):
    items = [("H", "Inicio"), ("P", "Catalogo"), ("O", "Pedidos"), ("U", "Clientes"), ("$", "Cobros"), ("*", "Ajustes")]
    for idx, (icon, label) in enumerate(items):
        y = y_top - idx * 50
        selected = active == label
        if selected:
            rr(c, 18, y - 11, 224, 38, 11, BLUE, None)
        txt(c, 40, y + 1, icon, 14, colors.white if selected else MUTED, bold=True, align="center")
        txt(c, 64, y, label, 9, colors.white if selected else MUTED, bold=selected)


def vendor_mobile_nav(c, active="Inicio"):
    c.setFillColor(colors.white); c.setStrokeColor(BORDER); c.rect(0, 0, 390, 70, fill=1, stroke=1)
    items = [("H", "Inicio"), ("P", "Catalogo"), ("O", "Pedidos"), ("U", "Clientes"), ("$", "Cobros"), ("*", "Ajustes")]
    xs = [32, 96, 160, 224, 288, 352]
    for x, (icon, label) in zip(xs, items):
        selected = active == label
        if selected:
            c.setFillColor(BLUE); c.roundRect(x - 14, 67, 28, 3, 1.5, fill=1, stroke=0)
        txt(c, x, 39, icon, 15, BLUE if selected else MUTED, bold=True, align="center")
        txt(c, x, 15, label, 6.2, BLUE if selected else MUTED, bold=selected, align="center")


def vendor_mobile_header(c, title, subtitle=None, active="Inicio", back=True):
    dashed_decor(c, .22)
    if back: txt(c, 24, 802, "<", 24, BLUE, bold=True)
    x = 56 if back else 24
    txt(c, x, 805, title, 18, INK, bold=True)
    if subtitle: txt(c, x, 786, subtitle.upper(), 8, BLUE, bold=True)
    vendor_mobile_nav(c, active)


def vendor_desktop_shell(c, active="Inicio"):
    c.setFillColor(SOFT); c.rect(0, 0, DESKTOP_W, DESKTOP_H, fill=1, stroke=0)
    c.setFillColor(colors.white); c.rect(0, 0, 260, DESKTOP_H, fill=1, stroke=0); line(c, 260, 0, 260, DESKTOP_H, BORDER)
    rr(c, 28, 690, 34, 34, 10, BLUE, None); txt(c, 45, 701, "S", 16, colors.white, bold=True, align="center"); txt(c, 76, 703, "SAGRISA", 18, INK, bold=True)
    txt(c, 28, 654, "NAVEGACION", 8, LIGHT, bold=True); vendor_nav(c, active, 620)
    rr(c, 20, 80, 220, 112, 14, colors.HexColor("#F8FAFC"), BORDER, 1); txt(c, 36, 166, "CONECTIVIDAD", 7.5, LIGHT, bold=True); c.setFillColor(GREEN); c.circle(38, 144, 4, fill=1, stroke=0); txt(c, 50, 140, "EN LINEA", 9, MUTED, bold=True); txt(c, 36, 116, "Sincronizacion local", 8.5, MUTED); rr(c, 36, 94, 188, 18, 8, colors.white, BORDER, 1); txt(c, 130, 100, "SINCRONIZAR AHORA", 7, BLUE_DARK, bold=True, align="center")
    line(c, 20, 60, 240, 60, BORDER); txt(c, 36, 37, "Luis Martinez", 10, INK, bold=True); txt(c, 36, 22, "VENDEDOR", 8, BLUE, bold=True)


def vendor_desktop_header(c, title, subtitle=None, back=False):
    x = 340 if back else 300
    if back: txt(c, 300, 705, "<", 23, BLUE, bold=True)
    txt(c, x, 705, title, 24, INK, bold=True)
    if subtitle: txt(c, x, 680, subtitle.upper(), 8.5, BLUE, bold=True)


def desktop_metric(c, x, y, w, h, title, value, detail, fill=colors.white, value_color=INK, detail_color=GREEN):
    rr(c, x, y, w, h, 18, fill, None if fill != colors.white else BORDER, 1)
    tc = colors.Color(1, 1, 1, alpha=.70) if fill != colors.white else LIGHT
    txt(c, x + 16, y + h - 23, title.upper(), 8, tc, bold=True); txt(c, x + 16, y + h - 57, value, 22, value_color, bold=True); txt(c, x + 16, y + 16, detail, 8.5, detail_color if fill == colors.white else colors.Color(1, 1, 1, alpha=.78), bold=True)


def screen_home_mobile(c):
    c.setFillColor(colors.white); c.rect(0, 0, 390, 844, fill=1, stroke=0); dashed_decor(c, .35)
    txt(c, 28, 785, "VENDEDOR PRINCIPAL", 9, BLUE, bold=True); txt(c, 28, 760, "Hola, Luis", 23, INK, bold=True)
    rr(c, 20, 585, 350, 145, 24, BLUE); txt(c, 44, 686, "RENDIMIENTO MENSUAL", 10, colors.white, bold=True); txt(c, 44, 650, "VENTAS", 8, colors.Color(1,1,1,alpha=.65), bold=True); txt(c, 44, 627, "$45,200", 22, colors.white, bold=True); txt(c, 205, 650, "COBROS", 8, colors.Color(1,1,1,alpha=.65), bold=True); txt(c, 205, 627, "$32,600", 22, colors.white, bold=True); rr(c,44,610,120,5,3,colors.Color(0,0,0,alpha=.14)); rr(c,44,610,110,5,3,colors.white); rr(c,205,610,120,5,3,colors.Color(0,0,0,alpha=.14)); rr(c,205,610,98,5,3,colors.white)
    txt(c, 24, 550, "UBICACION", 9, INK, bold=True); rr(c,20,465,350,67,16,colors.white,BORDER,1); rr(c,36,478,44,44,13,colors.HexColor("#F8FAFC")); txt(c,58,492,"M",16,MUTED,bold=True,align="center"); txt(c,95,503,"Sin ubicacion",10,INK,bold=True); txt(c,95,486,"Presiona para obtener tu ubicacion",7.5,LIGHT); rr(c,282,483,70,24,10,BLUE); txt(c,317,491,"OBTENER",7,colors.white,bold=True,align="center")
    txt(c,24,435,"OPERACIONES",9,INK,bold=True)
    for idx,(label,col) in enumerate([("Catalogo Rapido",GREEN),("Registrar Pedido",BLUE),("Mis Clientes",ORANGE),("Hacer Cobro",PURPLE)]):
        x=20+(idx%2)*182; y=333-(idx//2)*82; rr(c,x,y,168,66,16,colors.white,BORDER,1); rr(c,x+14,y+18,34,34,11,colors.Color(col.red,col.green,col.blue,alpha=.13)); txt(c,x+31,y+29,"+",14,col,bold=True,align="center"); txt(c,x+60,y+37,label,8.5,INK,bold=True); txt(c,x+60,y+21,"ABRIR  >",7,col,bold=True)
    txt(c,24,165,"ACTIVIDAD RECIENTE",9,INK,bold=True); rr(c,20,92,350,60,15,colors.white,BORDER,1); txt(c,38,127,"Distribuidora Central",9,INK,bold=True); txt(c,38,109,"ORD-99020  -  22 Abr 2026",7.5,LIGHT); rr(c,264,113,72,17,8,colors.HexColor("#ECFDF5")); txt(c,300,119,"ENTREGADO",6.5,GREEN,bold=True,align="center"); vendor_mobile_nav(c,"Inicio")


def product_mobile_card(c, x, y, sku, name, price, stock="STOCK", col=GREEN):
    rr(c,x,y,342,92,16,colors.white,BORDER,1); rr(c,x+14,y+18,54,54,13,colors.HexColor("#F8FAFC")); txt(c,x+41,y+39,"P",17,LIGHT,bold=True,align="center"); txt(c,x+84,y+67,sku,7.5,BLUE,bold=True); txt(c,x+84,y+47,name,9.5,INK,bold=True); txt(c,x+84,y+27,price,10,INK,bold=True); txt(c,x+321,y+27,stock,7,col,bold=True,align="right")


def screen_catalog_mobile(c):
    c.setFillColor(colors.white); c.rect(0,0,390,844,fill=1,stroke=0); vendor_mobile_header(c,"Catalogo", "Consulta y productos", "Catalogo"); rr(c,24,721,342,40,12,colors.white,BORDER,1); txt(c,42,735,"Q",11,LIGHT,bold=True); txt(c,62,735,"Buscar SKU o nombre...",9.5,LIGHT); rr(c,24,684,342,27,10,colors.HexColor("#F8FAFC"));
    for i,cat in enumerate(["TODOS","FERTILIZANTES","SEMILLAS"]): x=26+i*113; rr(c,x,686,105,23,9,BLUE if i==0 else colors.white,None if i==0 else BORDER,1); txt(c,x+52,694,cat,6.5,colors.white if i==0 else MUTED,bold=True,align="center")
    rr(c,260,754,106,27,10,BLUE); txt(c,313,763,"NUEVO PRODUCTO",6.2,colors.white,bold=True,align="center")
    product_mobile_card(c,24,565,"SKU-001","Concentrado para aves","$30,000"); product_mobile_card(c,24,463,"SKU-002","Fertilizante NPK","$45,000"); product_mobile_card(c,24,361,"SKU-003","Semilla hibrida","$18,500","AGOTADO",RED); vendor_mobile_nav(c,"Catalogo")


def customer_mobile_card(c, y, name, debt):
    rr(c,24,y,342,96,17,colors.white,BORDER,1); rr(c,40,y+28,44,44,13,colors.HexColor("#F8FAFC")); txt(c,62,y+44,"U",15,MUTED,bold=True,align="center"); txt(c,98,y+67,name,10,INK,bold=True); txt(c,98,y+49,"CLIENTE SAGRISA",7,LIGHT,bold=True); txt(c,342,y+67,debt,9,INK,bold=True,align="right"); txt(c,342,y+49,"SALDO",7,LIGHT,bold=True,align="right"); line(c,98,y+31,342,y+31,BORDER); txt(c,98,y+15,"NUEVO PEDIDO  >",7.5,BLUE,bold=True)


def screen_customers_mobile(c):
    c.setFillColor(colors.white); c.rect(0,0,390,844,fill=1,stroke=0); vendor_mobile_header(c,"Mis Clientes","Cartera asignada","Clientes"); rr(c,24,721,342,40,12,colors.white,BORDER,1); txt(c,42,735,"Q",11,LIGHT,bold=True); txt(c,62,735,"Buscar cliente...",9.5,LIGHT); customer_mobile_card(c,600,"Distribuidora Central","$154,000"); customer_mobile_card(c,492,"Agricola San Jose","$85,000"); customer_mobile_card(c,384,"Ferreteria El Sol","$42,500"); vendor_mobile_nav(c,"Clientes")


def screen_new_order_customer_mobile(c):
    c.setFillColor(colors.white); c.rect(0,0,390,844,fill=1,stroke=0); vendor_mobile_header(c,"Registrar Pedido","PASO 1 DE 3","Inicio"); txt(c,24,738,"1. SELECCIONAR CLIENTE",10,INK,bold=True); rr(c,24,697,342,36,11,colors.HexColor("#F8FAFC"),BORDER,1); txt(c,42,709,"Q",11,LIGHT,bold=True); txt(c,62,709,"Buscar por nombre o DUI...",9,LIGHT); customer_mobile_card(c,585,"Distribuidora Central","DUI 00123456-7"); customer_mobile_card(c,477,"Agricola San Jose","DUI 00876543-2"); customer_mobile_card(c,369,"Ferreteria El Sol","DUI 00556677-1"); vendor_mobile_nav(c,"Inicio")


def screen_new_order_products_mobile(c):
    c.setFillColor(colors.white); c.rect(0,0,390,844,fill=1,stroke=0); vendor_mobile_header(c,"Registrar Pedido","PASO 2 DE 3","Inicio"); rr(c,24,720,342,44,14,colors.HexColor("#F8FAFC"),BORDER,1); txt(c,42,740,"CLIENTE SELECCIONADO",7,LIGHT,bold=True); txt(c,42,726,"Distribuidora Central",10,INK,bold=True); txt(c,24,690,"2. AGREGAR PRODUCTOS",10,INK,bold=True); rr(c,24,646,342,36,11,colors.HexColor("#F8FAFC"),BORDER,1); txt(c,42,658,"Q",11,LIGHT,bold=True); txt(c,62,658,"Buscar SKU o nombre...",9,LIGHT); product_mobile_card(c,24,535,"SKU-001","Biomin Booster 11","$4,000"); product_mobile_card(c,24,433,"SKU-002","Urea 46% Granulada","$35.50"); rr(c,20,120,350,100,19,INK); txt(c,42,190,"2 PRODUCTOS",9,colors.white,bold=True); txt(c,324,190,"$45,800",14,BLUE,bold=True,align="right"); rr(c,42,142,306,30,10,BLUE); txt(c,195,152,"CONTINUAR A ENTREGA",8,colors.white,bold=True,align="center"); vendor_mobile_nav(c,"Inicio")


def screen_new_order_delivery_mobile(c):
    c.setFillColor(colors.white); c.rect(0,0,390,844,fill=1,stroke=0); vendor_mobile_header(c,"Registrar Pedido","PASO 3 DE 3","Inicio"); rr(c,20,665,350,95,20,BLUE); txt(c,42,726,"TOTAL DEL PEDIDO",8,colors.Color(1,1,1,alpha=.7),bold=True); txt(c,42,694,"$45,800.00",24,colors.white,bold=True); txt(c,42,675,"Distribuidora Central",9,colors.white,bold=True); txt(c,24,632,"3. DETALLES DE ENTREGA",10,INK,bold=True); txt(c,24,602,"FECHA SOLICITADA",7,LIGHT,bold=True); rr(c,24,558,342,36,11,colors.white,BORDER,1); txt(c,42,571,"22 Abr 2026",10,MUTED,bold=True); txt(c,24,530,"DIRECCION DE ENTREGA",7,LIGHT,bold=True); rr(c,24,486,342,36,11,colors.white,BORDER,1); txt(c,42,499,"Finca Las Marias, Santa Tecla",9,MUTED,bold=True); txt(c,24,458,"OBSERVACIONES",7,LIGHT,bold=True); rr(c,24,400,342,46,11,colors.white,BORDER,1); txt(c,42,417,"Entrega en horario de manana",9,MUTED,bold=True); rr(c,24,352,342,32,10,colors.HexColor("#F8FAFC"),BORDER,1); txt(c,195,363,"GPS SE CAPTURARA AL FINALIZAR",7,BLUE_DARK,bold=True,align="center"); rr(c,24,285,342,46,12,BLUE); txt(c,195,301,"FINALIZAR PEDIDO",10,colors.white,bold=True,align="center"); vendor_mobile_nav(c,"Inicio")


def screen_order_success_mobile(c):
    c.setFillColor(colors.white); c.rect(0,0,390,844,fill=1,stroke=0); vendor_mobile_header(c,"Pedido realizado","CONFIRMACION","Inicio"); c.setFillColor(colors.HexColor("#ECFDF5")); c.circle(195,530,54,fill=1,stroke=0); txt(c,195,518,"OK",18,GREEN,bold=True,align="center"); txt(c,195,445,"Pedido realizado",22,INK,bold=True,align="center"); txt(c,195,414,"El pedido fue enviado al sistema central",10,MUTED,align="center"); txt(c,195,395,"para su validacion y procesamiento.",10,MUTED,align="center"); rr(c,95,322,200,44,13,INK); txt(c,195,338,"VOLVER AL INICIO",9,colors.white,bold=True,align="center"); vendor_mobile_nav(c,"Inicio")


def screen_orders_mobile(c):
    c.setFillColor(colors.white); c.rect(0,0,390,844,fill=1,stroke=0); vendor_mobile_header(c,"Gestion de pedidos","Mis ventas recientes","Pedidos"); rr(c,24,721,342,40,12,colors.white,BORDER,1); txt(c,42,735,"Q",11,LIGHT,bold=True); txt(c,62,735,"Buscar por folio o cliente...",9,LIGHT); rr(c,280,773,86,26,10,BLUE); txt(c,323,781,"NUEVO",7,colors.white,bold=True,align="center")
    for i,(num,client,total,status,col) in enumerate([("ORD-99020","Distribuidora Central","$45,800","BORRADOR",ORANGE),("ORD-99018","Agricola San Jose","$32,400","ENVIADO",BLUE),("ORD-99015","Ferreteria El Sol","$67,200","ENTREGADO",GREEN)]):
        y=575-i*125; rr(c,24,y,342,105,16,colors.white,BORDER,1); txt(c,42,y+78,client,10,INK,bold=True); txt(c,42,y+59,num,8,BLUE,bold=True); rr(c,250,y+70,74,18,9,colors.Color(col.red,col.green,col.blue,alpha=.12)); txt(c,287,y+76,status,6.5,col,bold=True,align="center"); txt(c,42,y+34,"FECHA",7,LIGHT,bold=True); txt(c,42,y+19,"22 Abr 2026",8,MUTED,bold=True); txt(c,324,y+19,total,10,BLUE,bold=True,align="right")
    vendor_mobile_nav(c,"Pedidos")


def screen_order_detail_mobile(c):
    c.setFillColor(colors.white); c.rect(0,0,390,844,fill=1,stroke=0); vendor_mobile_header(c,"ORD-99020","DETALLE DEL PEDIDO","Pedidos"); rr(c,290,786,76,24,10,colors.HexColor("#FFF7ED")); txt(c,328,794,"BORRADOR",7,ORANGE,bold=True,align="center"); rr(c,20,560,350,198,20,colors.white,BORDER,1); txt(c,42,718,"BORRADOR",8,ORANGE,bold=True); txt(c,42,690,"22 Abr 2026, 10:30 AM",8,LIGHT,bold=True); txt(c,230,718,"MONTO TOTAL",7,LIGHT,bold=True); txt(c,230,690,"$45,800",17,INK,bold=True); line(c,42,668,348,668,BORDER); txt(c,42,642,"CLIENTE",7,LIGHT,bold=True); txt(c,42,624,"Luis Armando S.",10,INK,bold=True); txt(c,42,594,"DIRECCION",7,LIGHT,bold=True); txt(c,42,576,"Finca Las Marias, Santa Tecla",8,MUTED,bold=True); txt(c,24,530,"PRODUCTOS (2)",9,INK,bold=True); rr(c,20,310,350,195,18,colors.white,BORDER,1); txt(c,42,474,"Biomin Booster 11",10,INK,bold=True); txt(c,42,456,"10 unidades x $4,000",8,LIGHT); txt(c,348,456,"$40,000",9,INK,bold=True,align="right"); line(c,42,437,348,437,BORDER); txt(c,42,414,"Urea 46% Granulada",10,INK,bold=True); txt(c,42,396,"163 unidades x $35.50",8,LIGHT); txt(c,348,396,"$5,800",9,INK,bold=True,align="right"); rr(c,20,105,350,46,13,BLUE); txt(c,195,121,"EDITAR PEDIDO  >",10,colors.white,bold=True,align="center"); vendor_mobile_nav(c,"Pedidos")


def screen_cartera_mobile(c):
    c.setFillColor(colors.white); c.rect(0,0,390,844,fill=1,stroke=0); vendor_mobile_header(c,"Estado de Cartera","GESTION DE COBRANZA (AGING)","Cobros"); rr(c,20,590,350,145,22,INK); txt(c,42,697,"DEUDA TOTAL GESTIONADA",8,colors.Color(1,1,1,alpha=.6),bold=True); txt(c,42,660,"$580,000",24,colors.white,bold=True); txt(c,42,631,"0-30 dias     $350,000",8,colors.Color(1,1,1,alpha=.75)); txt(c,42,614,"31-60 dias   $130,000",8,colors.Color(1,1,1,alpha=.75)); rr(c,42,600,304,7,3,colors.Color(1,1,1,alpha=.12)); rr(c,42,600,195,7,3,GREEN); txt(c,24,557,"FACTURAS CRITICAS",9,INK,bold=True); customer_mobile_card(c,440,"Distribuidora Central","$154,000"); customer_mobile_card(c,332,"Agricola San Jose","$85,000"); rr(c,20,210,350,95,18,BLUE); txt(c,42,268,"ACCION RAPIDA",8,colors.Color(1,1,1,alpha=.7),bold=True); txt(c,42,242,"Registra un abono o pago total",10,colors.white,bold=True); rr(c,42,220,190,28,10,colors.white); txt(c,137,229,"REGISTRAR COBRO",8,BLUE,bold=True,align="center"); vendor_mobile_nav(c,"Cobros")


def payment_card(c, y, invoice, client, amount):
    rr(c,24,y,342,86,16,colors.white,BORDER,1); txt(c,42,y+62,invoice,11,INK,bold=True); txt(c,42,y+42,client,8.5,MUTED,bold=True); txt(c,42,y+22,"TRANSFERENCIA  -  22 Abr 2026",7,LIGHT,bold=True); txt(c,342,y+28,amount,12,BLUE,bold=True,align="right"); rr(c,252,y+57,72,17,8,colors.HexColor("#ECFDF5")); txt(c,288,y+63,"APLICADO",6.5,GREEN,bold=True,align="center")


def screen_payments_mobile(c):
    c.setFillColor(colors.white); c.rect(0,0,390,844,fill=1,stroke=0); vendor_mobile_header(c,"Historial de Cobros","PAGOS APLICADOS","Cobros"); rr(c,240,777,126,30,11,BLUE); txt(c,303,787,"NUEVO COBRO",7,colors.white,bold=True,align="center"); rr(c,24,713,342,40,12,colors.white,BORDER,1); txt(c,42,727,"Q",11,LIGHT,bold=True); txt(c,62,727,"Buscar por factura o cliente...",8.5,LIGHT); payment_card(c,590,"FAC-99201-1","Distribuidora Central","$154,000"); payment_card(c,486,"FAC-99200-4","Agricola San Jose","$85,000"); payment_card(c,382,"FAC-99198-2","Ferreteria El Sol","$42,500"); vendor_mobile_nav(c,"Cobros")


def screen_payment_customer_mobile(c):
    c.setFillColor(colors.white); c.rect(0,0,390,844,fill=1,stroke=0); vendor_mobile_header(c,"Registrar cobro","PASO 1 DE 3","Cobros"); txt(c,24,744,"SELECCIONE EL CLIENTE",10,INK,bold=True); rr(c,24,702,342,38,12,colors.white,BORDER,1); txt(c,42,715,"Q",11,LIGHT,bold=True); txt(c,62,715,"Buscar cliente",9,LIGHT); customer_mobile_card(c,590,"Distribuidora Central","$154,000"); customer_mobile_card(c,482,"Agricola San Jose","$85,000"); customer_mobile_card(c,374,"Ferreteria El Sol","$42,500"); vendor_mobile_nav(c,"Cobros")


def screen_payment_invoice_mobile(c):
    c.setFillColor(colors.white); c.rect(0,0,390,844,fill=1,stroke=0); vendor_mobile_header(c,"Registrar cobro","PASO 2 DE 3","Cobros"); rr(c,24,710,342,43,14,colors.HexColor("#F0F9FF")); txt(c,42,728,"CLIENTE",7,BLUE_DARK,bold=True); txt(c,42,714,"Distribuidora Central",10,INK,bold=True); txt(c,24,670,"FACTURAS CON SALDO",10,INK,bold=True)
    for i,(invoice,date,balance) in enumerate([("FAC-99201-1","30 Abr 2022","$154,000"),("FAC-99200-4","18 Abr 2022","$85,000")]):
        y=550-i*112; rr(c,24,y,342,90,16,colors.white,BORDER,1); txt(c,42,y+61,invoice,11,INK,bold=True); txt(c,42,y+40,date,8,LIGHT,bold=True); txt(c,264,y+51,"SALDO",7,LIGHT,bold=True); txt(c,324,y+31,balance,12,RED,bold=True,align="right")
    vendor_mobile_nav(c,"Cobros")


def screen_payment_form_mobile(c):
    c.setFillColor(colors.white); c.rect(0,0,390,844,fill=1,stroke=0); vendor_mobile_header(c,"Registrar cobro","PASO 3 DE 3","Cobros"); rr(c,24,712,342,48,14,colors.HexColor("#F8FAFC"),BORDER,1); txt(c,42,741,"ABONO A FACTURA",7,LIGHT,bold=True); txt(c,42,723,"FAC-99201-1",11,INK,bold=True); txt(c,324,730,"$154,000",12,BLUE,bold=True,align="right"); txt(c,24,680,"MONTO",8,LIGHT,bold=True); rr(c,24,640,342,38,12,colors.white,BORDER,1); txt(c,42,653,"$154,000",16,INK,bold=True); txt(c,24,610,"METODO DE PAGO",8,LIGHT,bold=True)
    for i,(lab,col) in enumerate([("Transferencia",BLUE),("Efectivo",GREEN),("Cheque",PURPLE)]): x=24+i*114; rr(c,x,560,104,38,11,col if i==0 else colors.HexColor("#F8FAFC"),None if i==0 else BORDER,1); txt(c,x+52,573,lab,7,colors.white if i==0 else MUTED,bold=True,align="center")
    txt(c,24,530,"REFERENCIA",8,LIGHT,bold=True); rr(c,24,492,342,34,11,colors.white,BORDER,1); txt(c,42,504,"Numero de transaccion",9,LIGHT); rr(c,24,430,342,45,12,colors.HexColor("#F8FAFC"),BORDER,1); txt(c,195,448,"SUBIR COMPROBANTE",8,MUTED,bold=True,align="center"); rr(c,24,292,342,112,14,colors.HexColor("#F8FAFC"),BORDER,1); txt(c,42,380,"FIRMA DEL CLIENTE",8,LIGHT,bold=True); line(c,42,322,348,322,colors.HexColor("#CBD5E1"),1,[4,4]); rr(c,24,225,342,44,12,BLUE); txt(c,195,241,"CONFIRMAR COBRO",10,colors.white,bold=True,align="center"); vendor_mobile_nav(c,"Cobros")


def report_mobile_card(c,y,title,kind,col):
    rr(c,24,y,342,76,16,colors.white,BORDER,1); rr(c,40,y+18,40,40,11,colors.Color(col.red,col.green,col.blue,alpha=.12)); txt(c,60,y+33,"P" if kind=="PDF" else "X",13,col,bold=True,align="center"); txt(c,96,y+48,title,9,INK,bold=True); txt(c,96,y+28,"22 Abr 2026  -  1.2 MB",7,LIGHT,bold=True); txt(c,340,y+31,"D",12,BLUE,bold=True,align="right")


def screen_reports_mobile(c):
    c.setFillColor(colors.white); c.rect(0,0,390,844,fill=1,stroke=0); vendor_mobile_header(c,"Mis Reportes","VENTAS Y GESTION INDIVIDUAL","Inicio"); rr(c,24,721,288,40,12,colors.white,BORDER,1); txt(c,42,735,"Q",11,LIGHT,bold=True); txt(c,62,735,"Buscar documento...",9,LIGHT); rr(c,320,721,46,40,12,colors.white,BORDER,1); txt(c,343,735,"F",13,MUTED,bold=True,align="center"); report_mobile_card(c,615,"Cierre Mensual Consolidado","PDF",RED); report_mobile_card(c,526,"Matriz de Ventas por Vendedor","XLSX",GREEN); report_mobile_card(c,437,"Analisis de Cartera Vencida","PDF",RED); report_mobile_card(c,348,"Inventario Critico Regional","XLSX",GREEN); vendor_mobile_nav(c,"Inicio")


def screen_vendor_invoices_mobile(c):
    c.setFillColor(colors.white); c.rect(0,0,390,844,fill=1,stroke=0); vendor_mobile_header(c,"Gestion de Facturas","CONSULTA Y SEGUIMIENTO","Inicio"); rr(c,24,721,342,38,12,colors.white,BORDER,1); txt(c,42,734,"Q",11,LIGHT,bold=True); txt(c,62,734,"Buscar cliente o factura...",8.8,LIGHT); txt(c,24,685,"FACTURAS RECIENTES",9,INK,bold=True)
    for i,(num,client,amount,status,col) in enumerate([("F001","Distribuidora Central","$1,540.50","PAGADA",GREEN),("F002","Agricola San Jose","$890.00","PENDIENTE",ORANGE),("F003","Ferreteria El Sol","$2,350.75","VENCIDA",RED)]):
        y=575-i*105; rr(c,24,y,342,85,15,colors.white,BORDER,1); txt(c,42,y+59,num,11,INK,bold=True); txt(c,42,y+37,client,8.5,MUTED,bold=True); rr(c,240,y+54,84,17,8,colors.Color(col.red,col.green,col.blue,alpha=.12)); txt(c,282,y+60,status,6.5,col,bold=True,align="center"); txt(c,324,y+19,amount,10,BLUE,bold=True,align="right")
    vendor_mobile_nav(c,"Inicio")


def screen_profile_mobile(c):
    c.setFillColor(colors.white); c.rect(0,0,390,844,fill=1,stroke=0); dashed_decor(c,.2); txt(c,24,788,"Mi Perfil",24,INK,bold=True); txt(c,24,768,"CONFIGURACION DE USUARIO",9,BLUE,bold=True); rr(c,20,550,350,195,22,colors.white,BORDER,1); c.setFillColor(colors.HexColor("#F8FAFC")); c.circle(195,696,38,fill=1,stroke=0); txt(c,195,685,"L",30,BLUE,bold=True,align="center"); txt(c,195,640,"Luis Martinez",17,INK,bold=True,align="center"); rr(c,149,612,92,22,11,colors.HexColor("#E0F2FE")); txt(c,195,619,"VENDEDOR",8,BLUE_DARK,bold=True,align="center"); line(c,42,590,348,590,BORDER); txt(c,195,568,"vendedor@sagrissa.com",9,MUTED,bold=True,align="center"); txt(c,24,520,"PREFERENCIAS DEL SISTEMA",10,INK,bold=True); rr(c,20,295,350,208,22,colors.white,BORDER,1)
    for i,(name,col,on) in enumerate([("Notificaciones Push",BLUE,True),("Modo Oscuro",LIGHT,False),("Sincronizacion Offline",GREEN,True),("Acceso Biometrico",PURPLE,False)]):
        yy=455-i*50; txt(c,42,yy,name,10.5,INK,bold=True); rr(c,320,yy-2,31,16,8,col if on else colors.HexColor("#E2E8F0")); c.setFillColor(colors.white); c.circle(342 if on else 328,yy+6,6,fill=1,stroke=0); 
        if i<3: line(c,42,yy-27,348,yy-27,BORDER)
    rr(c,20,230,350,42,13,colors.HexColor("#FEF2F2"),colors.HexColor("#FECACA"),1); txt(c,195,246,"CERRAR SESION",10,RED,bold=True,align="center"); vendor_mobile_nav(c,"Ajustes")


# Desktop reconstructions - the same content expands inside the 260 px sidebar shell.
def desktop_home(c):
    vendor_desktop_shell(c,"Inicio"); vendor_desktop_header(c,"Rendimiento del vendedor","Vendedor principal")
    desktop_metric(c,300,568,850,100,"Ventas del periodo","$45,200","Pedidos acumulados",BLUE,colors.white,colors.white); desktop_metric(c,300,450,410,92,"Cobros aplicados","$32,600","Actualizado hoy",colors.white,INK,GREEN); desktop_metric(c,740,450,410,92,"Pedidos recientes","12","3 requieren seguimiento",colors.white,INK,BLUE)
    rr(c,300,290,850,130,22,colors.white,BORDER,1); txt(c,326,392,"UBICACION",8,INK,bold=True); txt(c,326,360,"Sin ubicacion",13,INK,bold=True); txt(c,326,340,"Presiona Obtener para capturar GPS",9,LIGHT); rr(c,980,338,142,36,12,BLUE); txt(c,1051,351,"OBTENER UBICACION",7,colors.white,bold=True,align="center")
    txt(c,300,258,"OPERACIONES RAPIDAS",9,INK,bold=True)
    for i,(label,col) in enumerate([("Catalogo Rapido",GREEN),("Registrar Pedido",BLUE),("Mis Clientes",ORANGE),("Hacer Cobro",PURPLE)]):
        x=300+(i%4)*215; rr(c,x,158,195,80,16,colors.white,BORDER,1); rr(c,x+16,181,34,34,11,colors.Color(col.red,col.green,col.blue,alpha=.13)); txt(c,x+33,192,"+",13,col,bold=True,align="center"); txt(c,x+62,201,label,9,INK,bold=True); txt(c,x+62,183,"ABRIR  >",7,col,bold=True)
    txt(c,300,126,"ACTIVIDAD RECIENTE",9,INK,bold=True); rr(c,300,67,850,45,12,colors.white,BORDER,1); txt(c,320,86,"Distribuidora Central  -  ORD-99020",9,INK,bold=True); txt(c,1080,86,"ENTREGADO",8,GREEN,bold=True,align="right")


def desktop_catalog(c):
    vendor_desktop_shell(c,"Catalogo"); vendor_desktop_header(c,"Catalogo","Productos y disponibilidad",True); rr(c,300,615,690,42,12,colors.white,BORDER,1); txt(c,320,630,"Q",12,LIGHT,bold=True); txt(c,346,629,"Buscar SKU o nombre...",10,LIGHT); rr(c,1010,615,140,42,12,BLUE); txt(c,1080,629,"NUEVO PRODUCTO",7,colors.white,bold=True,align="center")
    for i,cat in enumerate(["TODOS","FERTILIZANTES","SEMILLAS","HERBICIDAS","FUNGICIDAS"]): x=300+i*140; rr(c,x,570,126,27,10,BLUE if i==0 else colors.white,None if i==0 else BORDER,1); txt(c,x+63,579,cat,6.5,colors.white if i==0 else MUTED,bold=True,align="center")
    products=[("SKU-001","Biomin Booster 11","$4,000","STOCK"),("SKU-002","Urea 46% Granulada","$35.50","STOCK"),("SKU-003","Fertilizante NPK","$45,000","STOCK"),("SKU-004","Semilla hibrida","$18,500","STOCK"),("SKU-005","Herbicida agricola","$22,000","AGOTADO"),("SKU-006","Fungicida foliar","$27,900","STOCK")]
    for i,(sku,name,price,stock) in enumerate(products):
        x=300+(i%3)*285; y=420-(i//3)*145; rr(c,x,y,265,112,16,colors.white,BORDER,1); rr(c,x+15,y+48,42,42,11,colors.HexColor("#F8FAFC")); txt(c,x+36,y+64,"P",14,LIGHT,bold=True,align="center"); txt(c,x+70,y+86,sku,7,BLUE,bold=True); txt(c,x+70,y+66,name,8.5,INK,bold=True); txt(c,x+70,y+44,price,10,INK,bold=True); txt(c,x+70,y+23,stock,7,GREEN if stock=="STOCK" else RED,bold=True)


def desktop_customers(c):
    vendor_desktop_shell(c,"Clientes"); vendor_desktop_header(c,"Mis Clientes","Cartera asignada",True); rr(c,300,615,850,42,12,colors.white,BORDER,1); txt(c,320,630,"Q",12,LIGHT,bold=True); txt(c,346,629,"Buscar cliente...",10,LIGHT)
    for i,(name,debt) in enumerate([("Distribuidora Central","$154,000"),("Agricola San Jose","$85,000"),("Ferreteria El Sol","$42,500")]):
        x=300+(i%3)*285; y=420; rr(c,x,y,265,135,18,colors.white,BORDER,1); rr(c,x+18,y+70,44,44,13,colors.HexColor("#F8FAFC")); txt(c,x+40,y+84,"U",15,MUTED,bold=True,align="center"); txt(c,x+76,y+94,name,9.5,INK,bold=True); txt(c,x+76,y+77,"CLIENTE SAGRISA",7,LIGHT,bold=True); txt(c,x+76,y+46,"SALDO ACTUAL",7,LIGHT,bold=True); txt(c,x+76,y+28,debt,11,INK,bold=True); txt(c,x+180,y+28,"NUEVO PEDIDO >",7,BLUE,bold=True)


def desktop_new_order_customer(c):
    vendor_desktop_shell(c,"Inicio"); vendor_desktop_header(c,"Registrar Pedido","Paso 1 de 3",True); txt(c,300,615,"SELECCIONAR CLIENTE",9,INK,bold=True); rr(c,300,570,850,40,12,colors.white,BORDER,1); txt(c,320,584,"Q",12,LIGHT,bold=True); txt(c,346,583,"Buscar por nombre o DUI...",10,LIGHT)
    for i,(name,dui) in enumerate([("Distribuidora Central","00123456-7"),("Agricola San Jose","00876543-2"),("Ferreteria El Sol","00556677-1")]):
        x=300+(i%3)*285; y=400; rr(c,x,y,265,125,16,colors.white,BORDER,1); rr(c,x+18,y+61,40,40,12,colors.HexColor("#F8FAFC")); txt(c,x+38,y+75,"U",14,MUTED,bold=True,align="center"); txt(c,x+72,y+83,name,9,INK,bold=True); txt(c,x+72,y+63,dui,8,LIGHT,bold=True); txt(c,x+72,y+28,"SELECCIONAR  >",7,BLUE,bold=True)


def desktop_new_order_products(c):
    vendor_desktop_shell(c,"Inicio"); vendor_desktop_header(c,"Registrar Pedido","Paso 2 de 3",True); rr(c,300,640,850,43,13,colors.HexColor("#F8FAFC"),BORDER,1); txt(c,320,656,"CLIENTE SELECCIONADO",7,LIGHT,bold=True); txt(c,320,642,"Distribuidora Central",10,INK,bold=True); txt(c,300,608,"AGREGAR PRODUCTOS",9,INK,bold=True); rr(c,300,565,650,36,11,colors.white,BORDER,1); txt(c,320,577,"Q",11,LIGHT,bold=True); txt(c,346,577,"Buscar SKU o nombre...",9,LIGHT); products=[("Biomin Booster 11","$4,000"),("Urea 46% Granulada","$35.50"),("Fertilizante NPK","$45,000"),("Semilla hibrida","$18,500")]
    for i,(name,price) in enumerate(products):
        x=300+(i%2)*285; y=420-(i//2)*130; rr(c,x,y,265,100,16,colors.white,BORDER,1); rr(c,x+15,y+28,44,44,12,colors.HexColor("#F8FAFC")); txt(c,x+37,y+43,"P",14,LIGHT,bold=True,align="center"); txt(c,x+72,y+65,name,8.5,INK,bold=True); txt(c,x+72,y+43,price,9,INK,bold=True); rr(c,x+215,y+27,32,32,9,BLUE); txt(c,x+231,y+37,"+",14,colors.white,bold=True,align="center")
    rr(c,870,275,280,170,18,INK); txt(c,892,410,"2 PRODUCTOS",9,colors.white,bold=True); txt(c,1124,410,"$45,800",14,BLUE,bold=True,align="right"); txt(c,892,378,"Biomin Booster 11",8,colors.Color(1,1,1,alpha=.7)); txt(c,892,356,"Urea 46% Granulada",8,colors.Color(1,1,1,alpha=.7)); rr(c,892,300,236,32,10,BLUE); txt(c,1010,311,"CONTINUAR A ENTREGA",7.5,colors.white,bold=True,align="center")


def desktop_new_order_delivery(c):
    vendor_desktop_shell(c,"Inicio"); vendor_desktop_header(c,"Registrar Pedido","Paso 3 de 3",True); rr(c,300,545,850,105,20,BLUE); txt(c,326,617,"TOTAL DEL PEDIDO",8,colors.Color(1,1,1,alpha=.7),bold=True); txt(c,326,580,"$45,800.00",25,colors.white,bold=True); txt(c,730,586,"Distribuidora Central",10,colors.white,bold=True); txt(c,300,510,"DETALLES DE ENTREGA",9,INK,bold=True)
    for i,(lab,val) in enumerate([("FECHA SOLICITADA","22 Abr 2026"),("DIRECCION DE ENTREGA","Finca Las Marias, Santa Tecla"),("OBSERVACIONES","Entrega en horario de manana")]):
        x=300+(i%2)*430; y=430-(i//2)*110; txt(c,x,y+43,lab,8,LIGHT,bold=True); rr(c,x,y,390,34,11,colors.white,BORDER,1); txt(c,x+18,y+12,val,9,MUTED,bold=True)
    rr(c,300,180,850,36,11,colors.HexColor("#F8FAFC"),BORDER,1); txt(c,725,193,"GPS SE CAPTURARA AUTOMATICAMENTE AL FINALIZAR",7,BLUE_DARK,bold=True,align="center"); rr(c,300,112,850,46,12,BLUE); txt(c,725,128,"FINALIZAR PEDIDO",10,colors.white,bold=True,align="center")


def desktop_success(c):
    vendor_desktop_shell(c,"Inicio"); vendor_desktop_header(c,"Pedido realizado","Confirmacion"); c.setFillColor(colors.HexColor("#ECFDF5")); c.circle(725,500,56,fill=1,stroke=0); txt(c,725,488,"OK",18,GREEN,bold=True,align="center"); txt(c,725,430,"Pedido realizado",23,INK,bold=True,align="center"); txt(c,725,401,"El pedido fue enviado al sistema central.",10,MUTED,align="center"); rr(c,620,330,210,44,13,INK); txt(c,725,346,"VOLVER AL INICIO",9,colors.white,bold=True,align="center")


def desktop_orders(c):
    vendor_desktop_shell(c,"Pedidos"); vendor_desktop_header(c,"Gestion de pedidos","Mis ventas recientes",True); rr(c,300,615,710,42,12,colors.white,BORDER,1); txt(c,320,630,"Q",12,LIGHT,bold=True); txt(c,346,629,"Buscar por folio o cliente...",10,LIGHT); rr(c,1025,615,125,42,12,BLUE); txt(c,1087,629,"NUEVO",8,colors.white,bold=True,align="center")
    for i,(num,client,total,status,col) in enumerate([("ORD-99020","Distribuidora Central","$45,800","BORRADOR",ORANGE),("ORD-99018","Agricola San Jose","$32,400","ENVIADO",BLUE),("ORD-99015","Ferreteria El Sol","$67,200","ENTREGADO",GREEN),("ORD-99010","Agropecuaria El Sol","$21,500","ENTREGADO",GREEN)]):
        x=300+(i%3)*285; y=420-(i//3)*145; rr(c,x,y,265,112,16,colors.white,BORDER,1); txt(c,x+16,y+82,num,11,INK,bold=True); txt(c,x+16,y+60,client,8.5,MUTED,bold=True); txt(c,x+16,y+37,total,11,BLUE,bold=True); rr(c,x+163,y+78,82,17,8,colors.Color(col.red,col.green,col.blue,alpha=.12)); txt(c,x+204,y+84,status,6.5,col,bold=True,align="center")


def desktop_order_detail(c):
    vendor_desktop_shell(c,"Pedidos"); vendor_desktop_header(c,"ORD-99020","Detalle del pedido",True); rr(c,1040,688,110,28,10,colors.HexColor("#FFF7ED")); txt(c,1095,698,"BORRADOR",8,ORANGE,bold=True,align="center"); rr(c,300,488,850,175,20,colors.white,BORDER,1); txt(c,326,633,"BORRADOR",8,ORANGE,bold=True); txt(c,326,606,"22 Abr 2026, 10:30 AM",8,LIGHT,bold=True); txt(c,900,633,"MONTO TOTAL",8,LIGHT,bold=True); txt(c,900,606,"$45,800",20,INK,bold=True); line(c,326,580,1124,580,BORDER); txt(c,326,552,"CLIENTE",8,LIGHT,bold=True); txt(c,326,530,"Luis Armando S.",11,INK,bold=True); txt(c,700,552,"DIRECCION",8,LIGHT,bold=True); txt(c,700,530,"Finca Las Marias, Santa Tecla",10,MUTED,bold=True); rr(c,300,245,560,210,18,colors.white,BORDER,1); txt(c,326,425,"PRODUCTOS (2)",9,INK,bold=True); txt(c,326,380,"Biomin Booster 11 - 10 unidades",9,INK,bold=True); txt(c,830,380,"$40,000",10,INK,bold=True,align="right"); line(c,326,360,834,360,BORDER); txt(c,326,330,"Urea 46% Granulada - 163 unidades",9,INK,bold=True); txt(c,830,330,"$5,800",10,INK,bold=True,align="right"); txt(c,326,270,"TOTAL PEDIDO",8,LIGHT,bold=True); txt(c,830,270,"$45,800",15,BLUE,bold=True,align="right"); rr(c,890,245,260,210,18,colors.HexColor("#F8FAFC"),BORDER,1); txt(c,916,425,"AUDITORIA DE UBICACION",9,BLUE_DARK,bold=True); txt(c,916,386,"13.6894, -89.1872",11,INK,bold=True); txt(c,916,360,"GPS verificado por PWA",9,MUTED); rr(c,916,278,200,40,12,BLUE); txt(c,1016,293,"EDITAR PEDIDO",8,colors.white,bold=True,align="center")


def desktop_cartera(c):
    vendor_desktop_shell(c,"Cobros"); vendor_desktop_header(c,"Estado de Cartera","Gestion de cobranza (aging)",True); rr(c,300,495,560,165,22,INK); txt(c,326,620,"DEUDA TOTAL GESTIONADA",8,colors.Color(1,1,1,alpha=.6),bold=True); txt(c,326,580,"$580,000",28,colors.white,bold=True); txt(c,326,545,"0-30 dias  $350,000     31-60 dias  $130,000",9,colors.Color(1,1,1,alpha=.75)); rr(c,326,515,500,8,4,colors.Color(1,1,1,alpha=.12)); rr(c,326,515,330,8,4,GREEN); txt(c,300,455,"FACTURAS CRITICAS",9,INK,bold=True); rr(c,300,350,560,86,16,colors.white,BORDER,1); txt(c,326,404,"Distribuidora Central",10,INK,bold=True); txt(c,326,384,"FAC-99201-1 - 45 dias vencido",8,LIGHT,bold=True); txt(c,820,386,"$154,000",11,INK,bold=True,align="right"); txt(c,820,366,"COBRAR AHORA",7,BLUE,bold=True,align="right"); rr(c,900,495,250,165,22,BLUE); txt(c,926,620,"ACCION RAPIDA",8,colors.Color(1,1,1,alpha=.7),bold=True); txt(c,926,582,"Registra un abono o pago",11,colors.white,bold=True); rr(c,926,525,198,40,12,colors.white); txt(c,1025,540,"REGISTRAR COBRO",8,BLUE,bold=True,align="center"); rr(c,900,350,250,110,18,colors.white,BORDER,1); txt(c,926,430,"FACTURAS VENCIDAS",8,LIGHT,bold=True); txt(c,926,398,"3",23,INK,bold=True); txt(c,980,404,"requieren gestion",8,MUTED)


def desktop_payments(c):
    vendor_desktop_shell(c,"Cobros"); vendor_desktop_header(c,"Historial de Cobros","Pagos aplicados",True); rr(c,300,615,700,42,12,colors.white,BORDER,1); txt(c,320,630,"Q",12,LIGHT,bold=True); txt(c,346,629,"Buscar por factura o cliente...",9,LIGHT); rr(c,1020,615,130,42,12,BLUE); txt(c,1085,629,"NUEVO COBRO",7,colors.white,bold=True,align="center")
    for i,(inv,client,amount) in enumerate([("FAC-99201-1","Distribuidora Central","$154,000"),("FAC-99200-4","Agricola San Jose","$85,000"),("FAC-99198-2","Ferreteria El Sol","$42,500")]):
        x=300+(i%3)*285; y=425; rr(c,x,y,265,135,17,colors.white,BORDER,1); txt(c,x+16,y+98,inv,11,INK,bold=True); rr(c,x+172,y+90,73,17,8,colors.HexColor("#ECFDF5")); txt(c,x+208,y+96,"APLICADO",6.5,GREEN,bold=True,align="center"); txt(c,x+16,y+68,"CLIENTE",7,LIGHT,bold=True); txt(c,x+16,y+49,client,8.5,MUTED,bold=True); txt(c,x+16,y+23,"TRANSFERENCIA",7,LIGHT,bold=True); txt(c,x+245,y+23,amount,11,BLUE,bold=True,align="right")


def desktop_payment_customer(c):
    vendor_desktop_shell(c,"Cobros"); vendor_desktop_header(c,"Registrar cobro","Paso 1 de 3",True); txt(c,300,620,"SELECCIONE EL CLIENTE",9,INK,bold=True); rr(c,300,575,850,40,12,colors.white,BORDER,1); txt(c,320,589,"Q",12,LIGHT,bold=True); txt(c,346,588,"Buscar cliente...",10,LIGHT)
    for i,name in enumerate(["Distribuidora Central","Agricola San Jose","Ferreteria El Sol"]): x=300+(i%3)*285; rr(c,x,400,265,125,16,colors.white,BORDER,1); rr(c,x+18,460,40,40,12,colors.HexColor("#F8FAFC")); txt(c,x+38,474,"U",14,MUTED,bold=True,align="center"); txt(c,x+72,480,name,8.5,INK,bold=True); txt(c,x+72,458,"SELECCIONAR  >",7,BLUE,bold=True)


def desktop_payment_invoice(c):
    vendor_desktop_shell(c,"Cobros"); vendor_desktop_header(c,"Registrar cobro","Paso 2 de 3",True); rr(c,300,620,850,48,14,colors.HexColor("#F0F9FF")); txt(c,320,642,"CLIENTE",7,BLUE_DARK,bold=True); txt(c,320,626,"Distribuidora Central",10,INK,bold=True); txt(c,300,588,"FACTURAS CON SALDO",9,INK,bold=True)
    for i,(inv,date,bal) in enumerate([("FAC-99201-1","30 Abr 2022","$154,000"),("FAC-99200-4","18 Abr 2022","$85,000")]): x=300+(i%2)*430; rr(c,x,430,390,110,16,colors.white,BORDER,1); txt(c,x+20,502,inv,11,INK,bold=True); txt(c,x+20,478,date,8,LIGHT,bold=True); txt(c,x+250,482,"SALDO",7,LIGHT,bold=True); txt(c,x+365,462,bal,13,RED,bold=True,align="right")


def desktop_payment_form(c):
    vendor_desktop_shell(c,"Cobros"); vendor_desktop_header(c,"Registrar cobro","Paso 3 de 3",True); rr(c,300,600,850,48,14,colors.HexColor("#F8FAFC"),BORDER,1); txt(c,320,626,"ABONO A FACTURA",7,LIGHT,bold=True); txt(c,320,608,"FAC-99201-1",11,INK,bold=True); txt(c,1020,612,"$154,000",13,BLUE,bold=True,align="right"); txt(c,300,555,"MONTO",8,LIGHT,bold=True); rr(c,300,512,400,38,12,colors.white,BORDER,1); txt(c,320,525,"$154,000",16,INK,bold=True); txt(c,300,480,"METODO DE PAGO",8,LIGHT,bold=True)
    for i,lab in enumerate(["Transferencia","Efectivo","Cheque"]): x=300+i*135; rr(c,x,438,120,34,10,BLUE if i==0 else colors.white,None if i==0 else BORDER,1); txt(c,x+60,450,lab,7,colors.white if i==0 else MUTED,bold=True,align="center")
    rr(c,740,512,410,152,18,colors.HexColor("#F8FAFC"),BORDER,1); txt(c,766,635,"COMPROBANTE",8,LIGHT,bold=True); txt(c,766,603,"Subir archivo y firma del cliente",11,INK,bold=True); line(c,766,560,1124,560,colors.HexColor("#CBD5E1"),1,[4,4]); txt(c,766,542,"Firma digital",8,MUTED,bold=True); rr(c,300,332,850,44,12,BLUE); txt(c,725,347,"CONFIRMAR COBRO",10,colors.white,bold=True,align="center")


def desktop_reports(c):
    vendor_desktop_shell(c,"Inicio"); vendor_desktop_header(c,"Mis Reportes","Ventas y gestion individual",True); rr(c,300,615,710,42,12,colors.white,BORDER,1); txt(c,320,630,"Q",12,LIGHT,bold=True); txt(c,346,629,"Buscar documento...",10,LIGHT); rr(c,1025,615,125,42,12,colors.white,BORDER,1); txt(c,1087,629,"FILTROS",7,BLUE_DARK,bold=True,align="center")
    for i,(title,kind,col) in enumerate([("Cierre Mensual Consolidado","PDF",RED),("Matriz de Ventas por Vendedor","XLSX",GREEN),("Analisis de Cartera Vencida","PDF",RED),("Inventario Critico Regional","XLSX",GREEN)]):
        x=300+(i%2)*430; y=465-(i//2)*130; rr(c,x,y,390,105,16,colors.white,BORDER,1); rr(c,x+18,y+31,42,42,12,colors.Color(col.red,col.green,col.blue,alpha=.12)); txt(c,x+39,y+46,"P" if kind=="PDF" else "X",13,col,bold=True,align="center"); txt(c,x+76,y+68,title,9,INK,bold=True); txt(c,x+76,y+47,"22 Abr 2026  -  1.2 MB",7,LIGHT,bold=True); txt(c,x+350,y+46,"D",12,BLUE,bold=True,align="center")


def desktop_invoices(c):
    vendor_desktop_shell(c,"Inicio"); vendor_desktop_header(c,"Gestion de Facturas","Consulta y seguimiento",True); rr(c,300,615,710,42,12,colors.white,BORDER,1); txt(c,320,630,"Q",12,LIGHT,bold=True); txt(c,346,629,"Buscar por cliente o factura...",9,LIGHT); rr(c,1025,615,125,42,12,colors.white,BORDER,1); txt(c,1087,629,"EXPORTAR",7,BLUE_DARK,bold=True,align="center")
    for i,(num,client,amount,status,col) in enumerate([("F001","Distribuidora Central","$1,540.50","PAGADA",GREEN),("F002","Agricola San Jose","$890.00","PENDIENTE",ORANGE),("F003","Ferreteria El Sol","$2,350.75","VENCIDA",RED)]):
        y=450-i*105; rr(c,300,y,850,78,14,colors.white,BORDER,1); txt(c,320,y+50,num,10,INK,bold=True); txt(c,430,y+50,client,9,MUTED,bold=True); txt(c,700,y+50,"22 Abr 2026",8,LIGHT,bold=True); rr(c,850,y+45,95,18,9,colors.Color(col.red,col.green,col.blue,alpha=.12)); txt(c,897,y+51,status,7,col,bold=True,align="center"); txt(c,1124,y+28,amount,11,BLUE,bold=True,align="right")


def desktop_profile(c):
    vendor_desktop_shell(c,"Ajustes"); vendor_desktop_header(c,"Mi Perfil","Configuracion de usuario"); rr(c,300,420,420,240,20,colors.white,BORDER,1); c.setFillColor(colors.HexColor("#F8FAFC")); c.circle(510,590,42,fill=1,stroke=0); txt(c,510,578,"L",30,BLUE,bold=True,align="center"); txt(c,510,530,"Luis Martinez",18,INK,bold=True,align="center"); rr(c,461,498,98,23,11,colors.HexColor("#E0F2FE")); txt(c,510,506,"VENDEDOR",8,BLUE_DARK,bold=True,align="center"); line(c,330,470,690,470,BORDER); txt(c,510,443,"vendedor@sagrissa.com",9,MUTED,bold=True,align="center"); rr(c,750,420,400,240,20,colors.white,BORDER,1); txt(c,776,620,"PREFERENCIAS DEL SISTEMA",9,INK,bold=True)
    for i,(name,col,on) in enumerate([("Notificaciones Push",BLUE,True),("Modo Oscuro",LIGHT,False),("Sincronizacion Offline",GREEN,True),("Acceso Biometrico",PURPLE,False)]): yy=580-i*45; txt(c,776,yy,name,10,INK,bold=True); rr(c,1065,yy-5,42,19,9,col if on else colors.HexColor("#E2E8F0")); c.setFillColor(colors.white); c.circle(1097 if on else 1075,yy+4,7,fill=1,stroke=0); 
    rr(c,300,280,850,100,18,colors.HexColor("#0F172A"),None); txt(c,326,348,"CAPACIDADES EFECTIVAS",8,colors.Color(1,1,1,alpha=.6),bold=True); txt(c,326,318,"orders.create  orders.update  customers.read  collections.create",10,colors.white,bold=True); rr(c,300,208,850,45,12,colors.HexColor("#FEF2F2"),colors.HexColor("#FECACA"),1); txt(c,725,224,"CERRAR SESION",9,RED,bold=True,align="center")


def build_pdf():
    OUT.parent.mkdir(parents=True, exist_ok=True)
    screens = [
        ("01","Acceso - DUI","/login - paso 1","Identificacion inicial","El Vendedor inicia con DUI y continua al PIN; PC usa tarjeta centrada.","Pantalla publica","Acceso publico","login_dui","login_dui"),
        ("02","Acceso - PIN","/login - paso 2","Autenticacion","Confirma PIN y alternativa biometrica antes de entrar al espacio operativo.","Pantalla publica","DUI -> PIN","login_pin","login_pin"),
        ("03","Inicio Vendedor","/app/vendedor/home","Rendimiento y operaciones","Resume ventas, cobros, ubicacion GPS, accesos rapidos y pedidos recientes.","Ruta conectada","Inicio","home","home"),
        ("04","Catalogo","/app/catalogo","Productos y stock","Consulta y administra productos, familias, categorias, filtros y alta de producto desde el rol vendedor.","Ruta conectada","Catalogo","catalog","catalog"),
        ("05","Mis Clientes","/app/clientes","Cartera asignada","Busca clientes y usa su ficha como punto de partida para registrar un nuevo pedido.","Ruta conectada","Clientes","customers","customers"),
        ("06","Registrar Pedido - cliente","/app/pedidos/nuevo - paso 1","Seleccion de cliente","El flujo inicia el pedido buscando por nombre o DUI y seleccionando el cliente.","Ruta conectada","Inicio -> Registrar pedido","order_customer","order_customer"),
        ("07","Registrar Pedido - productos","/app/pedidos/nuevo - paso 2","Construccion del carrito","Agrega productos, cantidades y total; el carrito fijo lleva al paso de entrega.","Estado de componente","Paso 2 de 3","order_products","order_products"),
        ("08","Registrar Pedido - entrega","/app/pedidos/nuevo - paso 3","Datos y auditoria","Captura fecha, direccion, observaciones y GPS antes de finalizar el pedido.","Estado de componente","Paso 3 de 3","order_delivery","order_delivery"),
        ("09","Pedido realizado","/app/pedidos/nuevo - success","Confirmacion","Confirma que el pedido fue enviado al sistema central y permite volver al inicio.","Estado de componente","Success","order_success","success"),
        ("10","Gestion de pedidos","/app/pedidos","Seguimiento de ventas","Lista pedidos recientes, estados, clientes, folios y totales; permite crear uno nuevo.","Ruta conectada","Pedidos","orders","orders"),
        ("11","Detalle del pedido","/app/pedidos/:id","Revision y edicion","Muestra cliente, monto, productos, GPS y acciones de eliminar o editar.","Ruta conectada","Pedidos -> detalle","order_detail","order_detail"),
        ("12","Estado de Cartera","/app/cartera","Gestion de cobranza","Concentra deuda aging, facturas criticas, vencimientos y el acceso rapido a registrar cobro.","Ruta conectada","Cobros -> cartera","cartera","cartera"),
        ("13","Historial de Cobros","/app/cobros","Pagos aplicados","Busca cobros por factura o cliente y muestra metodo, monto, fecha y estado aplicado.","Ruta conectada","Cobros","payments","payments"),
        ("14","Registrar Cobro - cliente","/app/cobros/nuevo - paso 1","Seleccion de cliente","El cobro inicia con el cliente asignado y sus saldos pendientes.","Estado de componente","Paso 1 de 3","pay_customer","pay_customer"),
        ("15","Registrar Cobro - factura","/app/cobros/nuevo - paso 2","Seleccion de factura","Presenta las facturas con saldo para elegir el documento a abonar.","Estado de componente","Paso 2 de 3","pay_invoice","pay_invoice"),
        ("16","Registrar Cobro - formulario","/app/cobros/nuevo - paso 3","Evidencia del cobro","Permite monto, metodo, referencia, comprobante y firma antes de confirmar.","Estado de componente","Paso 3 de 3","pay_form","pay_form"),
        ("17","Mis Reportes","/app/reportes","Descargas individuales","Lista reportes de ventas y gestion; las descargas muestran feedback de exito.","Ruta conectada - fuera del menu","Acceso directo","reports","reports"),
        ("18","Gestion de Facturas","/app/facturas","Consulta transversal","La ruta existe para Vendedor y muestra estados, montos y exportacion, pero no aparece en el menu.","Ruta conectada - fuera del menu","Acceso directo","invoices","invoices"),
        ("19","Mi Perfil","/app/config","Preferencias y salida","Perfil, rol, notificaciones, sincronizacion, biometria, claims y cierre de sesion.","Ruta conectada","Ajustes","profile","profile"),
    ]
    mobile_drawers = {"login_pin": lambda cc: draw_login(cc, True), "home": screen_home_mobile, "catalog": screen_catalog_mobile, "customers": screen_customers_mobile, "order_customer": screen_new_order_customer_mobile, "order_products": screen_new_order_products_mobile, "order_delivery": screen_new_order_delivery_mobile, "order_success": screen_order_success_mobile, "orders": screen_orders_mobile, "order_detail": screen_order_detail_mobile, "cartera": screen_cartera_mobile, "payments": screen_payments_mobile, "pay_customer": screen_payment_customer_mobile, "pay_invoice": screen_payment_invoice_mobile, "pay_form": screen_payment_form_mobile, "reports": screen_reports_mobile, "invoices": screen_vendor_invoices_mobile, "profile": screen_profile_mobile}
    desktop_drawers = {"login_dui": lambda cc: desktop_login_vendor(cc, False), "login_pin": lambda cc: desktop_login_vendor(cc, True), "home": desktop_home, "catalog": desktop_catalog, "customers": desktop_customers, "order_customer": desktop_new_order_customer, "order_products": desktop_new_order_products, "order_delivery": desktop_new_order_delivery, "success": desktop_success, "orders": desktop_orders, "order_detail": desktop_order_detail, "cartera": desktop_cartera, "payments": desktop_payments, "pay_customer": desktop_payment_customer, "pay_invoice": desktop_payment_invoice, "pay_form": desktop_payment_form, "reports": desktop_reports, "invoices": desktop_invoices, "profile": desktop_profile}
    total = len(screens) + 1
    c = canvas.Canvas(str(OUT), pagesize=landscape(A4)); c.setTitle("SAGRISA - Rol Vendedor - Flujo Mobile y PC")
    for page_no,(num,title,path,subtitle,desc,status,nav,mobile_kind,desktop_kind) in enumerate(screens,1):
        page_header(c,page_no,total,f"{num} - {title}",path); mobile_label(c,36,460,"MOBILE - 390 x 844"); desktop_label(c,218,460,"PC - TARJETA CENTRADA" if path.startswith("/login") else "PC - SIDEBAR 260 PX")
        if mobile_kind == "login_dui": draw_actual_image(c,LOGIN_IMG,x=36,y=106,width=150)
        else: phone_from_drawer(c,mobile_drawers[mobile_kind],x=36,y=106,width=150)
        desktop_frame(c,desktop_drawers[desktop_kind],218,145,width=380,height=300)
        info_box(c,620,382,192,80,"Que resuelve",desc); info_box(c,620,304,192,58,"Estado en codigo",status); info_box(c,620,246,192,58,"Navegacion",nav)
        rr(c,620,133,192,95,14,colors.HexColor("#E0F2FE")); txt(c,634,207,"PRINCIPIO DE DISENO",6.5,BLUE_DARK,bold=True); txt(c,634,184,"Operar con evidencia",12,INK,bold=True); txt(c,634,164,"Cada accion conecta",8.5,MUTED); txt(c,634,150,"cliente, producto",8.5,MUTED); txt(c,634,136,"y cobro verificable.",8.5,MUTED)
        txt(c,36,35,"SAGRISA - Racional creativo - Vendedor - Mobile + PC",7.5,MUTED); c.showPage()
    page_header(c,total,total,"Hallazgos y criterios responsive","Comparacion del flujo Vendedor con App.tsx y AppLayout"); txt(c,30,PAGE_H-116,"El Vendedor opera ventas, pedidos y cobros desde un mismo espacio PWA.",14,INK,bold=True); txt(c,30,PAGE_H-138,"Mobile prioriza acciones rapidas; PC distribuye datos en grillas y sidebar.",14,INK,bold=True)
    notes=[("Navegacion","Mobile y PC muestran Inicio, Catalogo, Pedidos, Clientes, Cobros y Ajustes; PC agrega conectividad y perfil en sidebar."),("Rutas conectadas","Home, clientes, cartera, cobros, cobros/nuevo, reportes, catalogo, pedidos, detalle, edicion, pedidos/nuevo, facturas y config estan registradas."),("Flujos compuestos","Registrar Pedido tiene cliente -> productos -> entrega -> success. Registrar Cobro tiene cliente -> factura -> formulario."),("Accesos fuera del menu","Reportes y Facturas existen para Vendedor pero no estan en NAV_CONFIG; deben abrirse por acceso directo o incorporarse al menu."),("Offline y GPS","AppLayout sincroniza cola offline; pedidos capturan GPS al finalizar y cobros pueden quedar en cola offline."),("Responsive","Catalogo, pedidos, clientes, cobros y reportes pasan a grillas de 2/3 columnas en PC; acciones fijas de mobile se vuelven bloques relativos."),("Datos","Las cifras y listas se cargan desde servicios y mocks de desarrollo; validar permisos, API y estados reales antes de presentar al negocio.")]
    y=PAGE_H-174
    for tag,body in notes:
        rr(c,30,y-40,PAGE_W-60,47,11,colors.white,BORDER,1); fill=colors.HexColor("#E0F2FE") if tag in ("Navegacion","Rutas conectadas") else colors.HexColor("#FFF7ED"); col=BLUE_DARK if tag in ("Navegacion","Rutas conectadas") else ORANGE; rr(c,44,y-26,130,20,9,fill); txt(c,109,y-19,tag.upper(),7,col,bold=True,align="center"); words=body.split(); lines=[]; cur=""
        for word in words:
            cand=(cur+" "+word).strip()
            if cur and len(cand)>108: lines.append(cur); cur=word
            else: cur=cand
        if cur: lines.append(cur)
        for idx,item in enumerate(lines[:2]): txt(c,192,y-14-idx*13,item,8.5,INK)
        y-=56
    rr(c,30,36,PAGE_W-60,58,14,colors.HexColor("#0F172A")); txt(c,48,72,"Orden recomendado",10,colors.white,bold=True); txt(c,48,53,"Login -> Inicio -> Catalogo/Clientes -> Pedidos -> Cobros -> Reportes -> Ajustes",8.5,colors.Color(1,1,1,alpha=.82)); txt(c,30,23,"SAGRISA - Racional creativo - Vendedor - Mobile + PC",7.5,MUTED); c.showPage(); c.save(); return OUT


def desktop_login_vendor(c, pin=False):
    c.setFillColor(SOFT); c.rect(0,0,DESKTOP_W,DESKTOP_H,fill=1,stroke=0); rr(c,376,38,448,684,32,colors.white); c.setFillColor(BLUE); c.rect(376,718,448,4,fill=1,stroke=0); txt(c,424,644,"SAGRISA",29,BLUE,bold=True); rr(c,424,592,168,25,12,colors.HexColor("#E0F2FE")); txt(c,508,600,"ACCESO SEGURO",8,BLUE_DARK,bold=True,align="center"); txt(c,424,548,"Bienvenido/a",22,INK,bold=True); txt(c,424,522,"Ingrese su DUI y PIN para entrar",11,MUTED); txt(c,424,505,"al portal comercial.",11,MUTED); txt(c,424,463,"PIN" if pin else "DUI",9,MUTED,bold=True); rr(c,424,415,352,40,12,colors.white,colors.HexColor("#CBD5E1"),1); txt(c,442,429,"****" if pin else "00123456-7",12,INK if pin else LIGHT,bold=pin); rr(c,424,356,352,43,12,BLUE); txt(c,600,371,"INICIAR SESION" if pin else "CONTINUAR",10,colors.white,bold=True,align="center"); txt(c,600,112,"El rol y las capacidades se asignan desde el servidor.",8.5,LIGHT,align="center")


if __name__ == "__main__":
    print(build_pdf())
