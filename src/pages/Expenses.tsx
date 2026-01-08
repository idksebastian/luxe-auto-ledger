import { useState } from 'react';
import { useInventory } from '@/hooks/useInventory';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Receipt, Plus, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function Expenses() {
  const { expenses, addExpense, getTodayExpenses } = useInventory();
  
  const [concept, setConcept] = useState('');
  const [amount, setAmount] = useState('');

  const todayExpenses = getTodayExpenses();

  const handleAddExpense = () => {
    if (!concept.trim() || !amount) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    addExpense({
      concept: concept.trim(),
      amount: parseFloat(amount),
    });

    toast.success('Gasto registrado exitosamente');
    setConcept('');
    setAmount('');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const totalTodayExpenses = todayExpenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <Receipt className="w-8 h-8 text-primary" />
          Registrar Gasto
        </h1>
        <p className="text-muted-foreground mt-1">
          Registra los gastos del negocio
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Add Expense Form */}
        <div className="glass-card p-6 animate-slide-up">
          <h2 className="text-xl font-semibold mb-6">Nuevo Gasto</h2>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Concepto del gasto</Label>
              <Input
                placeholder="Ej: Pago de luz, Compra de herramientas..."
                value={concept}
                onChange={(e) => setConcept(e.target.value)}
                className="input-search"
              />
            </div>

            <div className="space-y-2">
              <Label>Monto</Label>
              <Input
                type="number"
                placeholder="Ej: 50000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="0"
                className="input-search"
              />
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2">
              <Calendar className="w-4 h-4" />
              <span>Fecha: {format(new Date(), "d 'de' MMMM 'de' yyyy", { locale: es })}</span>
            </div>

            <Button 
              onClick={handleAddExpense} 
              className="w-full btn-primary-glow mt-4"
            >
              <Plus className="w-4 h-4 mr-2" />
              Registrar Gasto
            </Button>
          </div>
        </div>

        {/* Today's Summary */}
        <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
          <h2 className="text-xl font-semibold mb-6">Gastos de Hoy</h2>

          <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/30">
            <p className="text-sm text-muted-foreground">Total gastado hoy</p>
            <p className="text-3xl font-bold text-destructive">{formatCurrency(totalTodayExpenses)}</p>
          </div>

          {todayExpenses.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No hay gastos registrados hoy
            </p>
          ) : (
            <div className="space-y-3">
              {todayExpenses.map(expense => (
                <div 
                  key={expense.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border/30"
                >
                  <div>
                    <p className="font-medium">{expense.concept}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(expense.date), 'HH:mm')}
                    </p>
                  </div>
                  <p className="font-bold text-destructive">{formatCurrency(expense.amount)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Expenses */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold mb-4">Gastos Recientes</h3>
        {expenses.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No hay gastos registrados
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {expenses.slice(-9).reverse().map(expense => (
              <div 
                key={expense.id}
                className="p-4 rounded-lg bg-secondary/30 border border-border/30"
              >
                <p className="font-medium truncate">{expense.concept}</p>
                <div className="flex justify-between items-center mt-2 text-sm">
                  <span className="text-muted-foreground">
                    {format(new Date(expense.date), 'dd/MM/yyyy')}
                  </span>
                  <span className="font-semibold text-destructive">{formatCurrency(expense.amount)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
