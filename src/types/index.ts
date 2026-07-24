// ------------------
// Base User Types
// ------------------
export type Role = 'cliente' | 'vendedor' | 'supervisor' | 'gerente' | 'director';

export interface User {
  id: string;
  name: string;
  dui: string;
  role: Role;
  email?: string;
  department?: string;
  claims: string[];
  isOfflineCapable: boolean;
}

// ------------------
// Catalog & Inventory
// ------------------
export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  family: string;
  price: number;
  stock: number;
  warehouse: string;
  presentation: string;
}

// ------------------
// Orders & Sales
// ------------------
export type OrderStatus = 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'fulfilled';

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  dateCreated: string;
  deliveryDate: string;
  deliveryAddress: string;
  observations: string;
  status: OrderStatus;
  items: OrderItem[];
  totalAmount: number;
  latitude?: number;
  longitude?: number;
}

// ------------------
// Customers
// ------------------
export interface CustomerAccount {
  customerId: string;
  name: string;
  dui: string;
  totalDebt: number;
  availableCredit: number;
  aging0to30: number;
  aging31to60: number;
  aging61to90: number;
  aging91to120: number;
  aging120Plus: number;
}

// ------------------
// Invoices & Collections
// ------------------
export type InvoiceStatus = 'unpaid' | 'partial' | 'paid' | 'cancelled';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  orderId?: string;
  date: string;
  totalAmount: number;
  balance: number;
  status: InvoiceStatus;
}

// ------------------
// Backend API Types (ASP.NET Core)
// ------------------
export interface BackendLoginRequest {
  dui: string;
  pin: string;
}

export interface BackendLoginResponse {
  nombre: string;
  codVendedor: string;
  cargo: string;
  rol: string;
  token: string;
}

export interface BackendCliente {
  codCliente: string;
  nomCliente: string;
  clase: string | null;
  vendedor: string | null;
  ciudad: string | null;
  tPago: string | null;
  inactive: number;
  hold: number;
  lPrecios: string | null;
  montoCredito: number;
  totalDeuda: number;
  saldoCredito: number;
  correo: string | null;
}

export interface BackendPedidoEncabezado {
  numPedido: string;
  codCliente: string;
  codVendedor: string;
  tpago: string;
  fechaPedido: string;
  fechaEntrega: string | null;
  plazoEntregaPedido: number;
  observacion: string;
  totalPedido: number;
  pais: string;
  idDireccion: number;
  estCorr: string;
  fechHoraInsert: string;
  origen: string;
  idBac: string;
  idClieCaf: string;
  estadoBac: string;
  orderCaf: string;
  estatus: string;
  numFactura: string;
  errCorreo: string;
}

export interface BackendPedidoDetalle {
  numPedido: string;
  codCliente: string;
  codProducto: string;
  nomProducto: string;
  presentacion: string;
  cantidad: number;
  precioUnitario: number;
  precioTotal: number;
  codVendedor: string;
  bodega: string;
  origen: string;
}

export interface BackendPedidoResponse {
  encabezado: BackendPedidoEncabezado;
  detalle: BackendPedidoDetalle[];
}

export interface BackendProducto {
  codigo: string;
  nombre: string;
  presentacion: string;
  precio: number;
  bodega: string;
  activo: boolean;
}
