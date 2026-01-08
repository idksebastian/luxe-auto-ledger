import { useState, useMemo } from 'react';
import { useInventory } from '@/hooks/useInventory';
import { CartItem, ExternalProduct, MechanicLabor } from '@/types/inventory';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { 
  ShoppingCart, 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  Wrench,
  Package,
  Receipt
} from 'lucide-react';

export default function Sales() {
  const { products, searchProducts, addSale } = useInventory();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [externalProducts, setExternalProducts] = useState<ExternalProduct[]>([]);
  
  // Mechanic labor
  const [mechanicEnabled, setMechanicEnabled] = useState(false);
  const [mechanicName, setMechanicName] = useState('');
  const [mechanicAmount, setMechanicAmount] = useState('');
  
  // External product form
  const [showExternalForm, setShowExternalForm] = useState(false);
  const [extName, setExtName] = useState('');
  const [extCostPrice, setExtCostPrice] = useState('');
  const [extSalePrice, setExtSalePrice] = useState('');

  const searchResults = useMemo(() => {
    if (searchQuery.length < 2) return [];
    return searchProducts(searchQuery).filter(p => p.quantity > 0).slice(0, 5);
  }, [searchQuery, searchProducts]);

  const addToCart = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existingItem = cart.find(item => item.product.id === productId);
    
    if (existingItem) {
      if (existingItem.quantity >= product.quantity) {
        toast.error('No hay suficiente stock');
        return;
      }
      setCart(cart.map(item => 
        item.product.id === productId 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      const salePrice = product.costPrice * 1.3; // Default 30% margin
      setCart([...cart, { product, quantity: 1, salePrice }]);
    }
    
    setSearchQuery('');
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(cart.map(item => {
      if (item.product.id !== productId) return item;
      
      const newQty = item.quantity + delta;
      if (newQty <= 0) return item;
      if (newQty > item.product.quantity) {
        toast.error('No hay suficiente stock');
        return item;
      }
      return { ...item, quantity: newQty };
    }));
  };

  const updateSalePrice = (productId: string, price: number) => {
    setCart(cart.map(item => 
      item.product.id === productId 
        ? { ...item, salePrice: price }
        : item
    ));
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product.id !== productId));
  };

  const addExternalProduct = () => {
    if (!extName.trim() || !extCostPrice || !extSalePrice) {
      toast.error('Completa todos los campos del producto externo');
      return;
    }

    setExternalProducts([...externalProducts, {
      name: extName.trim(),
      costPrice: parseFloat(extCostPrice),
      salePrice: parseFloat(extSalePrice),
    }]);

    setExtName('');
    setExtCostPrice('');
    setExtSalePrice('');
    setShowExternalForm(false);
  };

  const removeExternalProduct = (index: number) => {
    setExternalProducts(externalProducts.filter((_, i) => i !== index));
  };

  const calculateTotals = () => {
    const cartTotal = cart.reduce((sum, item) => sum + (item.salePrice * item.quantity), 0);
    const cartCost = cart.reduce((sum, item) => sum + (item.product.costPrice * item.quantity), 0);
    
    const extTotal = externalProducts.reduce((sum, p) => sum + p.salePrice, 0);
    const extCost = externalProducts.reduce((sum, p) => sum + p.costPrice, 0);
    
    const mechanicPayment = mechanicEnabled ? parseFloat(mechanicAmount) || 0 : 0;
    
    const totalAmount = cartTotal + extTotal;
    const totalCost = cartCost + extCost;
    const profit = totalAmount - totalCost - mechanicPayment;

    return { totalAmount, totalCost, profit, mechanicPayment };
  };

  const { totalAmount, totalCost, profit, mechanicPayment } = calculateTotals();

  const handleCompleteSale = () => {
    if (cart.length === 0 && externalProducts.length === 0) {
      toast.error('Agrega al menos un producto');
      return;
    }

    if (mechanicEnabled && (!mechanicName.trim() || !mechanicAmount)) {
      toast.error('Completa los datos del mecánico');
      return;
    }

    const mechanicLabor: MechanicLabor | null = mechanicEnabled ? {
      enabled: true,
      mechanicName: mechanicName.trim(),
      amount: parseFloat(mechanicAmount),
    } : null;

    addSale({
      items: cart,
      externalProducts,
      mechanicLabor,
      totalAmount,
      totalCost,
      profit,
    });

    toast.success('Venta registrada exitosamente');
    
    // Reset form
    setCart([]);
    setExternalProducts([]);
    setMechanicEnabled(false);
    setMechanicName('');
    setMechanicAmount('');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <ShoppingCart className="w-8 h-8 text-primary" />
          Nueva Venta
        </h1>
        <p className="text-muted-foreground mt-1">
          Registra una nueva venta de productos
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Product Search & Options */}
        <div className="lg:col-span-2 space-y-6">
          {/* Product Search */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold mb-4">Buscar Productos</h2>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar producto del inventario..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 input-search"
              />
            </div>

            {searchResults.length > 0 && (
              <div className="mt-3 border border-border rounded-lg overflow-hidden">
                {searchResults.map(product => (
                  <button
                    key={product.id}
                    onClick={() => addToCart(product.id)}
                    className="w-full px-4 py-3 text-left hover:bg-secondary/50 transition-colors flex justify-between items-center"
                  >
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {product.category} • Stock: {product.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Costo: {formatCurrency(product.costPrice)}</p>
                      <Plus className="w-5 h-5 text-primary ml-auto mt-1" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Cart */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold mb-4">Carrito de Venta</h2>
            
            {cart.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No hay productos en el carrito
              </p>
            ) : (
              <div className="space-y-3">
                {cart.map(item => (
                  <div 
                    key={item.product.id}
                    className="flex items-center gap-4 p-4 rounded-lg bg-secondary/30 border border-border/30"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{item.product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Costo: {formatCurrency(item.product.costPrice)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Label className="text-sm">Precio venta:</Label>
                      <Input
                        type="number"
                        value={item.salePrice}
                        onChange={(e) => updateSalePrice(item.product.id, parseFloat(e.target.value) || 0)}
                        className="w-28 input-search"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateQuantity(item.product.id, -1)}
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="w-8 text-center font-semibold">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateQuantity(item.product.id, 1)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>

                    <p className="font-bold text-primary w-28 text-right">
                      {formatCurrency(item.salePrice * item.quantity)}
                    </p>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* External Products */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={showExternalForm}
                  onCheckedChange={(checked) => setShowExternalForm(checked as boolean)}
                />
                <Label className="font-semibold flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Producto Externo
                </Label>
              </div>
            </div>

            {showExternalForm && (
              <div className="space-y-4 pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  Para productos NO registrados en inventario. Solo se registra como venta.
                </p>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Nombre</Label>
                    <Input
                      placeholder="Nombre del producto"
                      value={extName}
                      onChange={(e) => setExtName(e.target.value)}
                      className="input-search"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Precio compra</Label>
                    <Input
                      type="number"
                      placeholder="Costo"
                      value={extCostPrice}
                      onChange={(e) => setExtCostPrice(e.target.value)}
                      className="input-search"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Precio venta</Label>
                    <Input
                      type="number"
                      placeholder="Venta"
                      value={extSalePrice}
                      onChange={(e) => setExtSalePrice(e.target.value)}
                      className="input-search"
                    />
                  </div>
                </div>

                <Button onClick={addExternalProduct} variant="outline" className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Producto Externo
                </Button>

                {externalProducts.length > 0 && (
                  <div className="space-y-2 mt-4">
                    {externalProducts.map((product, index) => (
                      <div 
                        key={index}
                        className="flex items-center justify-between p-3 rounded-lg bg-warning/10 border border-warning/30"
                      >
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Costo: {formatCurrency(product.costPrice)}
                          </p>
                        </div>
                        <p className="font-bold text-primary">{formatCurrency(product.salePrice)}</p>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeExternalProduct(index)}
                          className="text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mechanic Labor */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Checkbox
                checked={mechanicEnabled}
                onCheckedChange={(checked) => setMechanicEnabled(checked as boolean)}
              />
              <Label className="font-semibold flex items-center gap-2">
                <Wrench className="w-4 h-4" />
                Mano de Obra (Mecánico)
              </Label>
            </div>

            {mechanicEnabled && (
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                <div className="space-y-2">
                  <Label>Nombre del mecánico</Label>
                  <Input
                    placeholder="Ej: Juan Pérez"
                    value={mechanicName}
                    onChange={(e) => setMechanicName(e.target.value)}
                    className="input-search"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Monto a pagar</Label>
                  <Input
                    type="number"
                    placeholder="Ej: 50000"
                    value={mechanicAmount}
                    onChange={(e) => setMechanicAmount(e.target.value)}
                    className="input-search"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Summary */}
        <div className="space-y-6">
          <div className="glass-card-elevated p-6 sticky top-6">
            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Receipt className="w-5 h-5" />
              Resumen de Venta
            </h2>

            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Productos ({cart.length + externalProducts.length})</span>
                <span>{formatCurrency(totalAmount)}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Costo mercancía</span>
                <span className="text-destructive">-{formatCurrency(totalCost)}</span>
              </div>

              {mechanicEnabled && mechanicPayment > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Pago mecánico</span>
                  <span className="text-destructive">-{formatCurrency(mechanicPayment)}</span>
                </div>
              )}

              <div className="border-t border-border pt-4">
                <div className="flex justify-between">
                  <span className="font-semibold">Total Venta</span>
                  <span className="font-bold text-xl text-primary">{formatCurrency(totalAmount)}</span>
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-muted-foreground">Ganancia</span>
                  <span className={`font-bold ${profit >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {formatCurrency(profit)}
                  </span>
                </div>
              </div>

              <Button 
                onClick={handleCompleteSale}
                className="w-full btn-primary-glow mt-6"
                size="lg"
                disabled={cart.length === 0 && externalProducts.length === 0}
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Completar Venta
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
