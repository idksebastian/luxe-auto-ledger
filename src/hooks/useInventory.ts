import { useLocalStorage } from './useLocalStorage';
import { Product, Sale, Expense, DailySummary } from '@/types/inventory';
import { useCallback } from 'react';

export function useInventory() {
  const [products, setProducts] = useLocalStorage<Product[]>('inventory-products', []);
  const [sales, setSales] = useLocalStorage<Sale[]>('inventory-sales', []);
  const [expenses, setExpenses] = useLocalStorage<Expense[]>('inventory-expenses', []);
  const [dailySummaries, setDailySummaries] = useLocalStorage<DailySummary[]>('inventory-daily-summaries', []);

  const generateId = () => crypto.randomUUID();
  const getToday = () => new Date().toISOString().split('T')[0];

  const addProduct = useCallback((product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newProduct: Product = {
      ...product,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    setProducts(prev => [...prev, newProduct]);
    return newProduct;
  }, [setProducts]);

  const updateProduct = useCallback((id: string, updates: Partial<Omit<Product, 'id' | 'createdAt'>>) => {
    setProducts(prev => prev.map(p => 
      p.id === id 
        ? { ...p, ...updates, updatedAt: new Date().toISOString() }
        : p
    ));
  }, [setProducts]);

  const addStockToProduct = useCallback((id: string, quantity: number) => {
    setProducts(prev => prev.map(p =>
      p.id === id
        ? { ...p, quantity: p.quantity + quantity, updatedAt: new Date().toISOString() }
        : p
    ));
  }, [setProducts]);

  const reduceStock = useCallback((productId: string, quantity: number) => {
    setProducts(prev => prev.map(p =>
      p.id === productId
        ? { ...p, quantity: Math.max(0, p.quantity - quantity), updatedAt: new Date().toISOString() }
        : p
    ));
  }, [setProducts]);

  const searchProducts = useCallback((query: string) => {
    const lowerQuery = query.toLowerCase();
    return products.filter(p => 
      p.name.toLowerCase().includes(lowerQuery) ||
      p.category.toLowerCase().includes(lowerQuery)
    );
  }, [products]);

  const addSale = useCallback((sale: Omit<Sale, 'id' | 'date'>) => {
    const newSale: Sale = {
      ...sale,
      id: generateId(),
      date: new Date().toISOString(),
    };
    
    // Reduce stock for each sold item
    sale.items.forEach(item => {
      reduceStock(item.product.id, item.quantity);
    });
    
    setSales(prev => [...prev, newSale]);
    return newSale;
  }, [setSales, reduceStock]);

  const addExpense = useCallback((expense: Omit<Expense, 'id' | 'date'>) => {
    const newExpense: Expense = {
      ...expense,
      id: generateId(),
      date: new Date().toISOString(),
    };
    setExpenses(prev => [...prev, newExpense]);
    return newExpense;
  }, [setExpenses]);

  const getTodaySales = useCallback(() => {
    const today = getToday();
    return sales.filter(s => s.date.startsWith(today));
  }, [sales]);

  const getTodayExpenses = useCallback(() => {
    const today = getToday();
    return expenses.filter(e => e.date.startsWith(today));
  }, [expenses]);

  const getDailySummary = useCallback((date: string): DailySummary => {
    const existing = dailySummaries.find(s => s.date === date);
    if (existing) return existing;

    const daySales = sales.filter(s => s.date.startsWith(date));
    const dayExpenses = expenses.filter(e => e.date.startsWith(date));

    const totalSales = daySales.reduce((sum, s) => sum + s.totalAmount, 0);
    const totalCost = daySales.reduce((sum, s) => sum + s.totalCost, 0);
    const totalExpenses = dayExpenses.reduce((sum, e) => sum + e.amount, 0);
    
    const mechanicDetails: { name: string; amount: number }[] = [];
    daySales.forEach(sale => {
      if (sale.mechanicLabor?.enabled) {
        const existing = mechanicDetails.find(m => m.name === sale.mechanicLabor?.mechanicName);
        if (existing) {
          existing.amount += sale.mechanicLabor.amount;
        } else {
          mechanicDetails.push({
            name: sale.mechanicLabor.mechanicName,
            amount: sale.mechanicLabor.amount,
          });
        }
      }
    });

    const totalMechanicPayments = mechanicDetails.reduce((sum, m) => sum + m.amount, 0);
    const profit = totalSales - totalCost - totalExpenses - totalMechanicPayments;

    return {
      date,
      sales: daySales,
      expenses: dayExpenses,
      totalSales,
      totalCost,
      totalExpenses,
      totalMechanicPayments,
      mechanicDetails,
      profit,
      closed: false,
    };
  }, [sales, expenses, dailySummaries]);

  const closeDailySummary = useCallback((date: string) => {
    const summary = getDailySummary(date);
    const closedSummary = { ...summary, closed: true };
    
    setDailySummaries(prev => {
      const filtered = prev.filter(s => s.date !== date);
      return [...filtered, closedSummary];
    });
    
    return closedSummary;
  }, [getDailySummary, setDailySummaries]);

  const getMonthlySummary = useCallback((year: number, month: number) => {
    const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;
    
    const monthSales = sales.filter(s => s.date.startsWith(monthStr));
    const monthExpenses = expenses.filter(e => e.date.startsWith(monthStr));

    const totalSales = monthSales.reduce((sum, s) => sum + s.totalAmount, 0);
    const totalCost = monthSales.reduce((sum, s) => sum + s.totalCost, 0);
    const totalExpenses = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
    
    let totalMechanicPayments = 0;
    monthSales.forEach(sale => {
      if (sale.mechanicLabor?.enabled) {
        totalMechanicPayments += sale.mechanicLabor.amount;
      }
    });

    const profit = totalSales - totalCost - totalExpenses - totalMechanicPayments;

    return {
      totalSales,
      totalCost,
      totalExpenses,
      totalMechanicPayments,
      profit,
      salesCount: monthSales.length,
    };
  }, [sales, expenses]);

  return {
    products,
    sales,
    expenses,
    dailySummaries,
    addProduct,
    updateProduct,
    addStockToProduct,
    reduceStock,
    searchProducts,
    addSale,
    addExpense,
    getTodaySales,
    getTodayExpenses,
    getDailySummary,
    closeDailySummary,
    getMonthlySummary,
  };
}
