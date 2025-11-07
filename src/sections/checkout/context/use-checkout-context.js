'use client';

import { useContext } from 'react';

import { CheckoutContext } from './checkout-context';

export function useCheckoutContext() {
  const context = useContext(CheckoutContext);
  if (context === undefined) {
    throw new Error('useCheckoutContext must be used inside <CheckoutProvider>');
  }
  return context;
}
