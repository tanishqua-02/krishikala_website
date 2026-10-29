import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { api } from "../lib/api";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";

interface CartItem {
  id: string;
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  image_url: string;
  stock: number;
}

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  shipping: number;
  total: number;
  isLoading: boolean;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  updateItem: (id: string, quantity: number) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { isLoggedIn } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [shipping, setShipping] = useState(50);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isLoggedIn) refreshCart();
    else { setItems([]); setSubtotal(0); }
  }, [isLoggedIn]);

  async function refreshCart() {
    try {
      const data: any = await api.getCart();
      setItems(data.items);
      setSubtotal(data.subtotal);
      setShipping(data.shipping);
    } catch {}
  }

  async function addToCart(productId: string, quantity = 1) {
    if (!isLoggedIn) { toast.error("Please login to add items to cart"); return; }
    try {
      const data: any = await api.addToCart(productId, quantity);
      toast.success(data.message);
      await refreshCart();
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  async function updateItem(id: string, quantity: number) {
    try {
      await api.updateCartItem(id, quantity);
      await refreshCart();
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  async function removeItem(id: string) {
    try {
      await api.removeFromCart(id);
      toast.error("Item removed from cart");
      await refreshCart();
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  async function clearCart() {
    try {
      await api.clearCart();
      setItems([]);
      setSubtotal(0);
    } catch {}
  }

  return (
    <CartContext.Provider value={{
      items, itemCount: items.reduce((s, i) => s + i.quantity, 0),
      subtotal, shipping, total: subtotal + shipping,
      isLoading, addToCart, updateItem, removeItem, clearCart, refreshCart,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
