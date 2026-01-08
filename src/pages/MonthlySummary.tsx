import { useState } from 'react';
import { useInventory } from '@/hooks/useInventory';
import { 
  CalendarRange, 
  ChevronLeft, 
  ChevronRight,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Receipt,
  Wrench,
  DollarSign
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth } from 'date-fns';
import { es } from 'date-fns/locale';

export default function MonthlySummary() {
  const { getMonthlySummary, getDailySummary, sales, expenses } = useInventory();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const monthlySummary = getMonthlySummary(year, month);

  const navigateMonth = (delta: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + delta);
    setCurrentDate(newDate);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Get days with sales for the calendar
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getDaySummary = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const daySales = sales.filter(s => s.date.startsWith(dateStr));
    const dayExpenses = expenses.filter(e => e.date.startsWith(dateStr));
    
    return {
      hasSales: daySales.length > 0,
      hasExpenses: dayExpenses.length > 0,
      salesTotal: daySales.reduce((sum, s) => sum + s.totalAmount, 0),
    };
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <CalendarRange className="w-8 h-8 text-primary" />
            Resumen Mensual
          </h1>
          <p className="text-muted-foreground mt-1">
            Control financiero del mes
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigateMonth(-1)}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-xl font-semibold min-w-[200px] text-center">
            {format(currentDate, 'MMMM yyyy', { locale: es })}
          </span>
          <Button variant="outline" size="icon" onClick={() => navigateMonth(1)}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Ventas</p>
              <p className="text-2xl font-bold text-primary">{formatCurrency(monthlySummary.totalSales)}</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            {monthlySummary.salesCount} ventas realizadas
          </p>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-destructive/20 flex items-center justify-center">
              <Receipt className="w-6 h-6 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Gastos</p>
              <p className="text-2xl font-bold text-destructive">{formatCurrency(monthlySummary.totalExpenses)}</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Incluye costos operativos
          </p>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-warning/20 flex items-center justify-center">
              <Wrench className="w-6 h-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pagos Mecánicos</p>
              <p className="text-2xl font-bold text-warning">{formatCurrency(monthlySummary.totalMechanicPayments)}</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Mano de obra del mes
          </p>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              monthlySummary.profit >= 0 ? 'bg-success/20' : 'bg-destructive/20'
            }`}>
              {monthlySummary.profit >= 0 ? (
                <TrendingUp className="w-6 h-6 text-success" />
              ) : (
                <TrendingDown className="w-6 h-6 text-destructive" />
              )}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ganancia Mensual</p>
              <p className={`text-2xl font-bold ${
                monthlySummary.profit >= 0 ? 'text-success' : 'text-destructive'
              }`}>
                {formatCurrency(monthlySummary.profit)}
              </p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            {monthlySummary.profit >= 0 ? 'Mes positivo' : 'Mes en pérdida'}
          </p>
        </div>
      </div>

      {/* Financial Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary" />
            Desglose Financiero
          </h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 rounded-lg bg-secondary/30">
              <span>Ingresos por ventas</span>
              <span className="font-bold text-primary">{formatCurrency(monthlySummary.totalSales)}</span>
            </div>
            
            <div className="flex justify-between items-center p-3 rounded-lg bg-secondary/30">
              <span>Costo de mercancía</span>
              <span className="font-bold text-destructive">-{formatCurrency(monthlySummary.totalCost)}</span>
            </div>
            
            <div className="flex justify-between items-center p-3 rounded-lg bg-secondary/30">
              <span>Gastos operativos</span>
              <span className="font-bold text-destructive">-{formatCurrency(monthlySummary.totalExpenses)}</span>
            </div>
            
            <div className="flex justify-between items-center p-3 rounded-lg bg-secondary/30">
              <span>Pagos a mecánicos</span>
              <span className="font-bold text-warning">-{formatCurrency(monthlySummary.totalMechanicPayments)}</span>
            </div>
            
            <div className="flex justify-between items-center p-4 rounded-lg bg-primary/10 border border-primary/30">
              <span className="font-semibold">Ganancia Neta</span>
              <span className={`text-xl font-bold ${
                monthlySummary.profit >= 0 ? 'text-success' : 'text-destructive'
              }`}>
                {formatCurrency(monthlySummary.profit)}
              </span>
            </div>
          </div>
        </div>

        {/* Mini Calendar */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold mb-4">Actividad del Mes</h3>
          
          <div className="grid grid-cols-7 gap-1 text-center text-sm">
            {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((day, i) => (
              <div key={i} className="p-2 text-muted-foreground font-medium">
                {day}
              </div>
            ))}
            
            {/* Empty cells for days before month starts */}
            {Array.from({ length: monthStart.getDay() }).map((_, i) => (
              <div key={`empty-${i}`} className="p-2" />
            ))}
            
            {/* Days of month */}
            {daysInMonth.map((day) => {
              const daySummary = getDaySummary(day);
              const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
              
              return (
                <div
                  key={day.toISOString()}
                  className={`p-2 rounded-lg relative ${
                    isToday ? 'bg-primary/20 text-primary font-bold' : ''
                  } ${
                    daySummary.hasSales ? 'bg-success/10' : ''
                  }`}
                >
                  {format(day, 'd')}
                  {daySummary.hasSales && (
                    <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-success" />
                  )}
                </div>
              );
            })}
          </div>
          
          <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-success" />
              <span>Días con ventas</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span>Hoy</span>
            </div>
          </div>
        </div>
      </div>

      {/* Profit Margin */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold mb-4">Margen de Ganancia</h3>
        
        <div className="relative h-8 bg-secondary/30 rounded-full overflow-hidden">
          {monthlySummary.totalSales > 0 && (
            <>
              <div 
                className="absolute left-0 top-0 h-full bg-destructive/50"
                style={{ width: `${(monthlySummary.totalCost / monthlySummary.totalSales) * 100}%` }}
              />
              <div 
                className="absolute top-0 h-full bg-warning/50"
                style={{ 
                  left: `${(monthlySummary.totalCost / monthlySummary.totalSales) * 100}%`,
                  width: `${((monthlySummary.totalExpenses + monthlySummary.totalMechanicPayments) / monthlySummary.totalSales) * 100}%`
                }}
              />
              <div 
                className="absolute top-0 h-full bg-success"
                style={{ 
                  left: `${((monthlySummary.totalCost + monthlySummary.totalExpenses + monthlySummary.totalMechanicPayments) / monthlySummary.totalSales) * 100}%`,
                  width: `${Math.max(0, (monthlySummary.profit / monthlySummary.totalSales) * 100)}%`
                }}
              />
            </>
          )}
        </div>
        
        <div className="flex justify-between mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-destructive/50" />
            <span className="text-muted-foreground">Costo ({((monthlySummary.totalCost / Math.max(1, monthlySummary.totalSales)) * 100).toFixed(1)}%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-warning/50" />
            <span className="text-muted-foreground">Gastos ({(((monthlySummary.totalExpenses + monthlySummary.totalMechanicPayments) / Math.max(1, monthlySummary.totalSales)) * 100).toFixed(1)}%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-success" />
            <span className="text-muted-foreground">Ganancia ({((monthlySummary.profit / Math.max(1, monthlySummary.totalSales)) * 100).toFixed(1)}%)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
