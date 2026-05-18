// User types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'cashier';
  createdAt: Date;
}

// Transaction types
export interface Transaction {
  id: string;
  date: Date;
  amount: number;
  paymentMethod: 'cash' | 'card' | 'digital';
  items: TransactionItem[];
  cashierId: string;
  cashierName: string;
}

export interface TransactionItem {
  id: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
}

// Product types
export interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  cost: number;
  stock: number;
  category: string;
}

// Stock Opname types
export interface StockOpname {
  id: string;
  date: Date;
  products: StockOpnameItem[];
  totalValue: number;
  notes: string;
}

export interface StockOpnameItem {
  productId: string;
  productName: string;
  systemStock: number;
  physicalStock: number;
  difference: number;
  cost: number;
}

// Dashboard Analytics types
export interface DashboardStats {
  totalRevenue: number;
  totalTransactions: number;
  totalProducts: number;
  lowStockItems: number;
}

export interface ChartData {
  date: string;
  revenue: number;
  transactions: number;
}

// Login types
export interface LoginCredentials {
  email: string;
  password: string;
}
