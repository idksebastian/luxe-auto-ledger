import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Receipt, 
  Warehouse, 
  CalendarDays,
  CalendarRange,
  Car
} from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/productos', label: 'Registrar Producto', icon: Package },
  { path: '/ventas', label: 'Nueva Venta', icon: ShoppingCart },
  { path: '/gastos', label: 'Registrar Gasto', icon: Receipt },
  { path: '/inventario', label: 'Ver Inventario', icon: Warehouse },
  { path: '/resumen-diario', label: 'Resumen Diario', icon: CalendarDays },
  { path: '/resumen-mensual', label: 'Resumen Mensual', icon: CalendarRange },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-sidebar border-r border-sidebar-border flex flex-col z-50">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Car className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-foreground">AutoPartes</h1>
            <p className="text-xs text-muted-foreground">Sistema de Inventario</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                'sidebar-item',
                isActive && 'sidebar-item-active'
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="glass-card p-3 text-center">
          <p className="text-xs text-muted-foreground">Datos guardados localmente</p>
          <p className="text-xs text-primary font-medium mt-1">100% Offline</p>
        </div>
      </div>
    </aside>
  );
}
