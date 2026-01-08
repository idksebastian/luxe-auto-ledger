export interface Product {
  id: string;
  name: string;
  quantity: number;
  category: string;
  costPrice: number;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  salePrice: number;
}

export interface ExternalProduct {
  name: string;
  costPrice: number;
  salePrice: number;
}

export interface MechanicLabor {
  enabled: boolean;
  mechanicName: string;
  amount: number;
}

export interface Sale {
  id: string;
  items: CartItem[];
  externalProducts: ExternalProduct[];
  mechanicLabor: MechanicLabor | null;
  totalAmount: number;
  totalCost: number;
  profit: number;
  date: string;
}

export interface Expense {
  id: string;
  concept: string;
  amount: number;
  date: string;
}

export interface DailySummary {
  date: string;
  sales: Sale[];
  expenses: Expense[];
  totalSales: number;
  totalCost: number;
  totalExpenses: number;
  totalMechanicPayments: number;
  mechanicDetails: { name: string; amount: number }[];
  profit: number;
  closed: boolean;
}

export type Category = 
  | 'Luces'
  | 'Espejos'
  | 'Accesorios'
  | 'Repuestos Motor'
  | 'Frenos'
  | 'Suspensión'
  | 'Eléctricos'
  | 'Carrocería'
  | 'Otros';

export const CATEGORIES: Category[] = [
  'Luces',
  'Espejos',
  'Accesorios',
  'Repuestos Motor',
  'Frenos',
  'Suspensión',
  'Eléctricos',
  'Carrocería',
  'Otros'
];
