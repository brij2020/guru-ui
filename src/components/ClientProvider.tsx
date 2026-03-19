'use client';
import React, { ReactNode } from 'react';
import { CartProvider } from './cartContext';

interface ClientProviderProps {
  children: ReactNode;
}

export const ClientProvider: React.FC<ClientProviderProps> = ({ children }) => {
  return (
    <CartProvider>
      {children}
    </CartProvider>
  );
};