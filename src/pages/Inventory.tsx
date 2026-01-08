import { useState, useMemo } from 'react';
import { useInventory } from '@/hooks/useInventory';
import { CATEGORIES, Category } from '@/types/inventory';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { 
  Warehouse, 
  Search, 
  Edit, 
  Package,
  Filter
} from 'lucide-react';
import { format } from 'date-fns';

export default function Inventory() {
  const { products, updateProduct } = useInventory();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  
  // Edit form state
  const [editName, setEditName] = useState('');
  const [editQuantity, setEditQuantity] = useState('');
  const [editCategory, setEditCategory] = useState<Category | ''>('');
  const [editCostPrice, setEditCostPrice] = useState('');

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           product.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, categoryFilter]);

  const openEditDialog = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      setEditName(product.name);
      setEditQuantity(product.quantity.toString());
      setEditCategory(product.category as Category);
      setEditCostPrice(product.costPrice.toString());
      setEditingProduct(productId);
    }
  };

  const handleSaveEdit = () => {
    if (!editingProduct || !editName.trim() || !editQuantity || !editCategory || !editCostPrice) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    updateProduct(editingProduct, {
      name: editName.trim(),
      quantity: parseInt(editQuantity),
      category: editCategory,
      costPrice: parseFloat(editCostPrice),
    });

    toast.success('Producto actualizado');
    setEditingProduct(null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const totalValue = filteredProducts.reduce((sum, p) => sum + (p.costPrice * p.quantity), 0);
  const totalUnits = filteredProducts.reduce((sum, p) => sum + p.quantity, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Warehouse className="w-8 h-8 text-primary" />
            Inventario
          </h1>
          <p className="text-muted-foreground mt-1">
            Visualiza y edita todos tus productos
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-4">
          <p className="text-sm text-muted-foreground">Productos Totales</p>
          <p className="text-2xl font-bold">{filteredProducts.length}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-sm text-muted-foreground">Unidades en Stock</p>
          <p className="text-2xl font-bold">{totalUnits}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-sm text-muted-foreground">Valor del Inventario</p>
          <p className="text-2xl font-bold text-primary">{formatCurrency(totalValue)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre o categoría..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 input-search"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48 input-search">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {CATEGORIES.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No hay productos que coincidan con tu búsqueda</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map(product => (
            <div 
              key={product.id}
              className="glass-card p-5 hover:border-primary/30 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg truncate">{product.name}</h3>
                  <span className="inline-block px-2 py-1 text-xs rounded-full bg-primary/10 text-primary mt-1">
                    {product.category}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => openEditDialog(product.id)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Stock</span>
                  <span className={`font-semibold ${product.quantity <= 5 ? 'text-warning' : 'text-foreground'}`}>
                    {product.quantity} unidades
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Precio costo</span>
                  <span className="font-semibold">{formatCurrency(product.costPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Valor total</span>
                  <span className="font-semibold text-primary">
                    {formatCurrency(product.costPrice * product.quantity)}
                  </span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground mt-4">
                Actualizado: {format(new Date(product.updatedAt), 'dd/MM/yyyy HH:mm')}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingProduct} onOpenChange={() => setEditingProduct(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Producto</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Nombre del producto</Label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="input-search"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Cantidad</Label>
                <Input
                  type="number"
                  value={editQuantity}
                  onChange={(e) => setEditQuantity(e.target.value)}
                  min="0"
                  className="input-search"
                />
              </div>

              <div className="space-y-2">
                <Label>Precio de costo</Label>
                <Input
                  type="number"
                  value={editCostPrice}
                  onChange={(e) => setEditCostPrice(e.target.value)}
                  min="0"
                  className="input-search"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Categoría</Label>
              <Select value={editCategory} onValueChange={(v) => setEditCategory(v as Category)}>
                <SelectTrigger className="input-search">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setEditingProduct(null)} className="flex-1">
                Cancelar
              </Button>
              <Button onClick={handleSaveEdit} className="flex-1 btn-primary-glow">
                Guardar Cambios
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
