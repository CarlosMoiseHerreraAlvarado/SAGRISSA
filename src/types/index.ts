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
