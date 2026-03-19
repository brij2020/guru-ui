"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export type CartItem = {
  name: any;
  id?:number;
  title: string;
  createdBy?: string;
  price: number;
  duration?: number;
  description?: string;
  img?: string;
  href?: string;
};

type CartContextType = {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (index: number) => void;
  clearCart: () => void;
  cart: any[];
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cart, setCart] = useState<any[]>([]);

  // const addToCart = (item: CartItem) => {
  //   setCartItems((prev) => [...prev, item]);
  // };

  const addToCart = (course:CartItem) => {
  setCartItems((prev) => {
      if (prev.some((item:any) => item.id === course.id)) {
        return prev; // Do NOT add duplicates
      }
      return [...prev, course];
    });
  };

  // remove by index (safe even if items don't have ids)
  const removeFromCart = (index: number) => {
    setCartItems((prev) => prev.filter((_, i) => i !== index));
  };

  const clearCart = () => setCartItems([]);

  return (
    <CartContext.Provider value={{ cart, cartItems, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
