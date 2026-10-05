import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { CartItem, Product, Variante } from '@/types';

const STORAGE_KEY = 'cabezaperro_carrito';

interface CartContextValue {
  items: CartItem[];
  addItem: (product: Product, cantidad?: number, variante?: Variante) => void;
  removeItem: (productId: string, varianteFormato?: string) => void;
  updateQuantity: (productId: string, cantidad: number, varianteFormato?: string) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  lastAdded: Product | null;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

function itemKey(productId: string, varianteFormato?: string): string {
  return varianteFormato ? `${productId}__${varianteFormato}` : productId;
}

function readStoredCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartItem[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => readStoredCart());
  const [lastAdded, setLastAdded] = useState<Product | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    if (!lastAdded) return;
    const timeout = setTimeout(() => setLastAdded(null), 2200);
    return () => clearTimeout(timeout);
  }, [lastAdded]);

  const addItem = (product: Product, cantidad = 1, variante?: Variante) => {
    const vFormato = variante?.formato;
    setItems((prev) => {
      const existing = prev.find((item) => itemKey(item.product.id, item.variante?.formato) === itemKey(product.id, vFormato));
      if (existing) {
        return prev.map((item) =>
          itemKey(item.product.id, item.variante?.formato) === itemKey(product.id, vFormato) ? { ...item, cantidad: item.cantidad + cantidad } : item
        );
      }
      return [...prev, { product, cantidad, variante }];
    });
    setLastAdded(product);
  };

  const removeItem = (productId: string, varianteFormato?: string) => {
    const key = itemKey(productId, varianteFormato);
    setItems((prev) => prev.filter((item) => itemKey(item.product.id, item.variante?.formato) !== key));
  };

  const updateQuantity = (productId: string, cantidad: number, varianteFormato?: string) => {
    if (cantidad <= 0) {
      removeItem(productId, varianteFormato);
      return;
    }
    const key = itemKey(productId, varianteFormato);
    setItems((prev) => prev.map((item) => (itemKey(item.product.id, item.variante?.formato) === key ? { ...item, cantidad } : item)));
  };

  const clearCart = () => setItems([]);

  const totalItems = useMemo(() => items.reduce((sum, item) => sum + item.cantidad, 0), [items]);
  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + (item.variante?.precio ?? item.product.precio) * item.cantidad, 0),
    [items]
  );

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, subtotal, lastAdded }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart debe usarse dentro de CartProvider');
  return ctx;
}
