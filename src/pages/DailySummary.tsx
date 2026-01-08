import { useState, useRef } from 'react';
import { useInventory } from '@/hooks/useInventory';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { 
  CalendarDays, 
  Download, 
  Check,
  ShoppingCart,
  Receipt,
  Wrench,
  TrendingUp,
  Package
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import html2canvas from 'html2canvas';

export default function DailySummary() {
  const { getDailySummary, closeDailySummary } = useInventory();
  const ticketRef = useRef<HTMLDivElement>(null);
  
  const today = new Date().toISOString().split('T')[0];
  const [selectedDate] = useState(today);
  
  const summary = getDailySummary(selectedDate);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleCloseDayAndDownload = async () => {
    if (summary.sales.length === 0 && summary.expenses.length === 0) {
      toast.error('No hay datos para cerrar el día');
      return;
    }

    closeDailySummary(selectedDate);
    
    // Generate ticket image
    if (ticketRef.current) {
      try {
        const canvas = await html2canvas(ticketRef.current, {
          backgroundColor: '#0f172a',
          scale: 2,
        });
        
        const link = document.createElement('a');
        link.download = `ticket-${selectedDate}.jpg`;
        link.href = canvas.toDataURL('image/jpeg', 0.9);
        link.click();
        
        toast.success('Día cerrado y ticket descargado');
      } catch (error) {
        toast.error('Error al generar el ticket');
      }
    }
  };

  // Get all sold products flattened
  const allSoldProducts = summary.sales.flatMap(sale => [
    ...sale.items.map(item => ({
      name: item.product.name,
      quantity: item.quantity,
      salePrice: item.salePrice,
      cost: item.product.costPrice,
      isExternal: false,
    })),
    ...sale.externalProducts.map(ext => ({
      name: ext.name,
      quantity: 1,
      salePrice: ext.salePrice,
      cost: ext.costPrice,
      isExternal: true,
    })),
  ]);

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <CalendarDays className="w-8 h-8 text-primary" />
            Resumen Diario
          </h1>
          <p className="text-muted-foreground mt-1">
            {format(new Date(selectedDate), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
          </p>
        </div>
        
        {summary.closed && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-success/20 text-success">
            <Check className="w-4 h-4" />
            <span className="font-medium">Día Cerrado</span>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <ShoppingCart className="w-4 h-4" />
            <span className="text-sm">Ventas</span>
          </div>
          <p className="text-2xl font-bold text-primary">{formatCurrency(summary.totalSales)}</p>
        </div>
        
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Package className="w-4 h-4" />
            <span className="text-sm">Mercancía</span>
          </div>
          <p className="text-2xl font-bold text-destructive">{formatCurrency(summary.totalCost)}</p>
        </div>
        
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Receipt className="w-4 h-4" />
            <span className="text-sm">Gastos</span>
          </div>
          <p className="text-2xl font-bold text-destructive">{formatCurrency(summary.totalExpenses)}</p>
        </div>
        
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm">Ganancia</span>
          </div>
          <p className={`text-2xl font-bold ${summary.profit >= 0 ? 'text-success' : 'text-destructive'}`}>
            {formatCurrency(summary.profit)}
          </p>
        </div>
      </div>

      {/* Mechanic Payments */}
      {summary.mechanicDetails.length > 0 && (
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Wrench className="w-5 h-5 text-primary" />
            Pagos a Mecánicos
          </h3>
          <div className="space-y-2">
            {summary.mechanicDetails.map((mechanic, index) => (
              <div 
                key={index}
                className="flex justify-between items-center p-3 rounded-lg bg-secondary/30"
              >
                <span className="font-medium">{mechanic.name}</span>
                <span className="font-bold text-warning">{formatCurrency(mechanic.amount)}</span>
              </div>
            ))}
            <div className="flex justify-between items-center pt-2 border-t border-border">
              <span className="font-semibold">Total Mecánicos</span>
              <span className="font-bold text-warning">{formatCurrency(summary.totalMechanicPayments)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Products Sold */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold mb-4">Productos Vendidos</h3>
        {allSoldProducts.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">No hay productos vendidos hoy</p>
        ) : (
          <div className="space-y-2">
            {allSoldProducts.map((product, index) => (
              <div 
                key={index}
                className={`flex justify-between items-center p-3 rounded-lg ${
                  product.isExternal ? 'bg-warning/10 border border-warning/30' : 'bg-secondary/30'
                }`}
              >
                <div>
                  <span className="font-medium">{product.name}</span>
                  {product.isExternal && (
                    <span className="ml-2 text-xs px-2 py-0.5 rounded bg-warning/20 text-warning">Externo</span>
                  )}
                  <p className="text-sm text-muted-foreground">
                    Cantidad: {product.quantity} • Costo: {formatCurrency(product.cost)}
                  </p>
                </div>
                <span className="font-bold text-primary">{formatCurrency(product.salePrice * product.quantity)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Expenses */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold mb-4">Gastos del Día</h3>
        {summary.expenses.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">No hay gastos registrados hoy</p>
        ) : (
          <div className="space-y-2">
            {summary.expenses.map(expense => (
              <div 
                key={expense.id}
                className="flex justify-between items-center p-3 rounded-lg bg-secondary/30"
              >
                <span className="font-medium">{expense.concept}</span>
                <span className="font-bold text-destructive">{formatCurrency(expense.amount)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Close Day Button */}
      {!summary.closed && (
        <Button 
          onClick={handleCloseDayAndDownload}
          className="w-full btn-primary-glow"
          size="lg"
        >
          <Download className="w-5 h-5 mr-2" />
          Cerrar Día y Generar Ticket
        </Button>
      )}

      {/* Hidden Ticket for Export */}
      <div className="fixed -left-[9999px]">
        <div 
          ref={ticketRef}
          className="w-[400px] p-6 bg-slate-900 text-white"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-amber-500">AutoPartes</h2>
            <p className="text-sm text-gray-400">Resumen del Día</p>
            <p className="text-lg font-semibold mt-2">
              {format(new Date(selectedDate), "d 'de' MMMM 'de' yyyy", { locale: es })}
            </p>
          </div>

          <div className="border-t border-gray-700 py-4">
            <h3 className="font-semibold mb-2 text-amber-500">Productos Vendidos</h3>
            {allSoldProducts.map((product, index) => (
              <div key={index} className="flex justify-between text-sm py-1">
                <span>{product.name} x{product.quantity}</span>
                <span>{formatCurrency(product.salePrice * product.quantity)}</span>
              </div>
            ))}
          </div>

          {summary.expenses.length > 0 && (
            <div className="border-t border-gray-700 py-4">
              <h3 className="font-semibold mb-2 text-amber-500">Gastos</h3>
              {summary.expenses.map(expense => (
                <div key={expense.id} className="flex justify-between text-sm py-1">
                  <span>{expense.concept}</span>
                  <span className="text-red-400">-{formatCurrency(expense.amount)}</span>
                </div>
              ))}
            </div>
          )}

          {summary.mechanicDetails.length > 0 && (
            <div className="border-t border-gray-700 py-4">
              <h3 className="font-semibold mb-2 text-amber-500">Pagos a Mecánicos</h3>
              {summary.mechanicDetails.map((mechanic, index) => (
                <div key={index} className="flex justify-between text-sm py-1">
                  <span>{mechanic.name}</span>
                  <span className="text-yellow-400">-{formatCurrency(mechanic.amount)}</span>
                </div>
              ))}
            </div>
          )}

          <div className="border-t border-gray-700 pt-4 space-y-2">
            <div className="flex justify-between">
              <span>Total Ventas</span>
              <span className="font-bold">{formatCurrency(summary.totalSales)}</span>
            </div>
            <div className="flex justify-between">
              <span>Costo Mercancía</span>
              <span className="text-red-400">-{formatCurrency(summary.totalCost)}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Gastos</span>
              <span className="text-red-400">-{formatCurrency(summary.totalExpenses)}</span>
            </div>
            <div className="flex justify-between">
              <span>Pagos Mecánicos</span>
              <span className="text-yellow-400">-{formatCurrency(summary.totalMechanicPayments)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-700">
              <span>GANANCIA FINAL</span>
              <span className={summary.profit >= 0 ? 'text-green-400' : 'text-red-400'}>
                {formatCurrency(summary.profit)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
