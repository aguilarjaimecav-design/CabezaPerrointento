import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { CartItem, Product } from '@/types';

const STORAGE_KEY = 'cabezaperro_carrito';

interface CartContextValue {
  items: CartItem[];
  addItem: (product: Product, cantidad?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, cantidad: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  lastAdded: Product | null;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

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

  const addItem = (product: Product, cantidad = 1) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, cantidad: item.cantidad + cantidad } : item
        );
      }
      return [...prev, { product, cantidad }];
    });
    setLastAdded(product);
  };

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, cantidad: number) => {
    if (cantidad <= 0) {
      removeItem(productId);
      return;
    }
    setItems((prev) => prev.map((item) => (item.product.id === productId ? { ...item, cantidad } : item)));
  };

  const clearCart = () => setItems([]);

  const totalItems = useMemo(() => items.reduce((sum, item) => sum + item.cantidad, 0), [items]);
  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.product.precio * item.cantidad, 0),
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
