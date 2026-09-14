"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { trackMetaAddToCart } from "@/lib/analytics/meta";
import { cartItemKey } from "@/lib/cart-key";
import type { CartItem } from "@/types";

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  hydrated: boolean;
  addItem: (item: Omit<CartItem, "quantity">, qty?: number) => void;
  removeItem: (key: string) => void;
  setQuantity: (key: string, quantity: number) => void;
  replaceItems: (items: CartItem[]) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  isOpen: boolean;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "iseul-cart-v2";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setItems(JSON.parse(raw) as CartItem[]);
      } else {
        const legacy = localStorage.getItem("iseul-cart-v1");
        if (legacy) setItems(JSON.parse(legacy) as CartItem[]);
      }
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const addItem = useCallback((item: Omit<CartItem, "quantity">, qty = 1) => {
    const key = cartItemKey(item);
    setItems((prev) => {
      const cleaned = item.variantId
        ? prev.filter(
            (i) => !(i.productId === item.productId && !i.variantId)
          )
        : prev;

      const existing = cleaned.find((i) => cartItemKey(i) === key);
      if (existing) {
        return cleaned.map((i) =>
          cartItemKey(i) === key ? { ...i, quantity: i.quantity + qty } : i
        );
      }
      return [...cleaned, { ...item, quantity: qty }];
    });
    trackMetaAddToCart({
      contentIds: [item.productId],
      contentName: item.name,
      value: item.price * qty,
      numItems: qty,
    });
  }, []);

  const removeItem = useCallback((key: string) => {
    setItems((prev) => prev.filter((i) => cartItemKey(i) !== key));
  }, []);

  const setQuantity = useCallback((key: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => cartItemKey(i) !== key));
      return;
    }
    setItems((prev) =>
      prev.map((i) => (cartItemKey(i) === key ? { ...i, quantity } : i))
    );
  }, []);

  const replaceItems = useCallback((next: CartItem[]) => setItems(next), []);

  const clearCart = useCallback(() => setItems([]), []);

  const count = useMemo(() => items.reduce((s, i) => s + i.quantity, 0), [items]);
  const subtotal = useMemo(
    () => items.reduce((s, i) => s + i.price * i.quantity, 0),
    [items]
  );

  const value = useMemo(
    () => ({
      items,
      count,
      subtotal,
      hydrated,
      addItem,
      removeItem,
      setQuantity,
      replaceItems,
      clearCart,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      isOpen,
    }),
    [items, count, subtotal, hydrated, addItem, removeItem, setQuantity, replaceItems, clearCart, isOpen]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

export { cartItemKey };
