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
import { toast } from 'sonner';
import { Package, Plus, Search, PackagePlus } from 'lucide-react';

export default function ProductRegistration() {
  const { products, addProduct, addStockToProduct, searchProducts } = useInventory();
  
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [category, setCategory] = useState<Category | ''>('');
  const [costPrice, setCostPrice] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExistingProduct, setSelectedExistingProduct] = useState<string | null>(null);
  const [addQuantity, setAddQuantity] = useState('');

  const searchResults = useMemo(() => {
    if (searchQuery.length < 2) return [];
    return searchProducts(searchQuery).slice(0, 5);
  }, [searchQuery, searchProducts]);

  const handleAddNewProduct = () => {
    if (!name.trim() || !quantity || !category || !costPrice) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    addProduct({
      name: name.trim(),
      quantity: parseInt(quantity),
      category,
      costPrice: parseFloat(costPrice),
    });

    toast.success(`Producto "${name}" agregado exitosamente`);
    setName('');
    setQuantity('');
    setCategory('');
    setCostPrice('');
  };

  const handleAddStock = () => {
    if (!selectedExistingProduct || !addQuantity) {
      toast.error('Selecciona un producto y cantidad');
      return;
    }

    const product = products.find(p => p.id === selectedExistingProduct);
    if (product) {
      addStockToProduct(selectedExistingProduct, parseInt(addQuantity));
      toast.success(`Se agregaron ${addQuantity} unidades a "${product.name}"`);
      setSelectedExistingProduct(null);
      setAddQuantity('');
      setSearchQuery('');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <Package className="w-8 h-8 text-primary" />
          Registrar Producto
        </h1>
        <p className="text-muted-foreground mt-1">
          Agrega nuevos productos o suma stock a productos existentes
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Add Stock to Existing Product */}
        <div className="glass-card p-6 animate-slide-up">
          <div className="flex items-center gap-2 mb-6">
            <PackagePlus className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">Agregar Stock</h2>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Buscar producto existente</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Escribe para buscar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 input-search"
                />
              </div>
              
              {searchResults.length > 0 && (
                <div className="mt-2 border border-border rounded-lg overflow-hidden">
                  {searchResults.map(product => (
                    <button
                      key={product.id}
                      onClick={() => {
                        setSelectedExistingProduct(product.id);
                        setSearchQuery(product.name);
                      }}
                      className={`w-full px-4 py-3 text-left hover:bg-secondary/50 transition-colors flex justify-between items-center ${
                        selectedExistingProduct === product.id ? 'bg-primary/10 border-l-2 border-primary' : ''
                      }`}
                    >
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {product.category} • Stock: {product.quantity}
                        </p>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {formatCurrency(product.costPrice)}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {selectedExistingProduct && (
              <div className="space-y-4 pt-4 border-t border-border">
                <div className="space-y-2">
                  <Label>Cantidad a agregar</Label>
                  <Input
                    type="number"
                    placeholder="Ej: 10"
                    value={addQuantity}
                    onChange={(e) => setAddQuantity(e.target.value)}
                    min="1"
                    className="input-search"
                  />
                </div>

                <Button 
                  onClick={handleAddStock} 
                  className="w-full btn-primary-glow"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Stock
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Add New Product */}
        <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center gap-2 mb-6">
            <Plus className="w-5 h-5 text-success" />
            <h2 className="text-xl font-semibold">Nuevo Producto</h2>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nombre del producto</Label>
              <Input
                placeholder="Ej: Faro LED Toyota Corolla"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-search"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Cantidad</Label>
                <Input
                  type="number"
                  placeholder="Ej: 5"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  min="1"
                  className="input-search"
                />
              </div>

              <div className="space-y-2">
                <Label>Precio de costo</Label>
                <Input
                  type="number"
                  placeholder="Ej: 150000"
                  value={costPrice}
                  onChange={(e) => setCostPrice(e.target.value)}
                  min="0"
                  className="input-search"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Categoría</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
                <SelectTrigger className="input-search">
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={handleAddNewProduct} 
              className="w-full btn-primary-glow mt-6"
            >
              <Package className="w-4 h-4 mr-2" />
              Registrar Producto
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold mb-4">Productos Recientes</h3>
        {products.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            No hay productos registrados aún
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {products.slice(-6).reverse().map(product => (
              <div 
                key={product.id}
                className="p-4 rounded-lg bg-secondary/30 border border-border/30"
              >
                <p className="font-medium truncate">{product.name}</p>
                <div className="flex justify-between items-center mt-2 text-sm">
                  <span className="text-muted-foreground">{product.category}</span>
                  <span className="font-semibold text-primary">{product.quantity} uds</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
