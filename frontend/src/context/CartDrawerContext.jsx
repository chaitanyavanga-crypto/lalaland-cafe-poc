import React, { createContext, useContext, useState } from 'react';

const CartDrawerContext = createContext(null);

/**
 * Controls the mini-cart Offcanvas open/closed state. This is transient UI
 * state (not app data), so it lives in Context next to ThemeContext rather
 * than in the Redux cart slice, which owns the actual cart contents.
 */
export function CartDrawerProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const openCartDrawer = () => setIsOpen(true);
  const closeCartDrawer = () => setIsOpen(false);

  return (
    <CartDrawerContext.Provider value={{ isOpen, openCartDrawer, closeCartDrawer }}>
      {children}
    </CartDrawerContext.Provider>
  );
}

export function useCartDrawer() {
  const ctx = useContext(CartDrawerContext);
  if (!ctx) throw new Error('useCartDrawer must be used within a CartDrawerProvider');
  return ctx;
}
