import { useInventory } from '@/hooks/useInventory';
import { StatCard } from '@/components/ui/stat-card';
import { 
  Package, 
  ShoppingCart, 
  DollarSign, 
  TrendingUp,
  AlertCircle,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function Dashboard() {
  const { 
    products, 
    getTodaySales, 
    getTodayExpenses, 
    getDailySummary 
  } = useInventory();

  const today = new Date().toISOString().split('T')[0];
  const todaySales = getTodaySales();
  const todayExpenses = getTodayExpenses();
  const dailySummary = getDailySummary(today);

  const lowStockProducts = products.filter(p => p.quantity <= 5);
  const totalInventoryValue = products.reduce((sum, p) => sum + (p.costPrice * p.quantity), 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            {format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground glass-card px-4 py-2">
          <Clock className="w-4 h-4" />
          <span>{format(new Date(), 'HH:mm')}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Ventas del Día"
          value={formatCurrency(dailySummary.totalSales)}
          icon={ShoppingCart}
          variant="primary"
        />
        <StatCard
          title="Gastos del Día"
          value={formatCurrency(dailySummary.totalExpenses)}
          icon={DollarSign}
          variant="destructive"
        />
        <StatCard
          title="Ganancia del Día"
          value={formatCurrency(dailySummary.profit)}
          icon={TrendingUp}
          variant={dailySummary.profit >= 0 ? 'success' : 'destructive'}
        />
        <StatCard
          title="Productos en Stock"
          value={products.length}
          icon={Package}
          variant="default"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">Resumen de Ventas</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Número de ventas</span>
              <span className="font-semibold">{todaySales.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Costo mercancía</span>
              <span className="font-semibold">{formatCurrency(dailySummary.totalCost)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Pagos mecánicos</span>
              <span className="font-semibold">{formatCurrency(dailySummary.totalMechanicPayments)}</span>
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">Valor del Inventario</h3>
          <p className="text-3xl font-bold text-foreground">{formatCurrency(totalInventoryValue)}</p>
          <p className="text-sm text-muted-foreground mt-2">
            {products.reduce((sum, p) => sum + p.quantity, 0)} unidades totales
          </p>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-4 h-4 text-warning" />
            <h3 className="text-sm font-medium text-muted-foreground">Stock Bajo</h3>
          </div>
          {lowStockProducts.length === 0 ? (
            <p className="text-muted-foreground text-sm">Todos los productos tienen stock suficiente</p>
          ) : (
            <div className="space-y-2">
              {lowStockProducts.slice(0, 3).map(product => (
                <div key={product.id} className="flex justify-between items-center">
                  <span className="text-sm truncate flex-1">{product.name}</span>
                  <span className="text-warning font-semibold text-sm ml-2">
                    {product.quantity} uds
                  </span>
                </div>
              ))}
              {lowStockProducts.length > 3 && (
                <p className="text-xs text-muted-foreground">
                  +{lowStockProducts.length - 3} productos más
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold mb-4">Ventas Recientes de Hoy</h3>
        {todaySales.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No hay ventas registradas hoy
          </p>
        ) : (
          <div className="space-y-3">
            {todaySales.slice(-5).reverse().map(sale => (
              <div 
                key={sale.id} 
                className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border/30"
              >
                <div>
                  <p className="font-medium">
                    {sale.items.map(i => i.product.name).join(', ').substring(0, 40)}
                    {sale.items.map(i => i.product.name).join(', ').length > 40 ? '...' : ''}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(sale.date), 'HH:mm')} • {sale.items.length + sale.externalProducts.length} productos
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary">{formatCurrency(sale.totalAmount)}</p>
                  <p className="text-sm text-success">+{formatCurrency(sale.profit)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
