import React, { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { tokenUtils } from '../utils/tokenUtils';
import api from '../services/api';
import { toast } from 'react-hot-toast';

const CartContext = createContext();

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => tokenUtils.getCart());

  useEffect(() => {
    tokenUtils.setCart(items);
  }, [items]);

  useEffect(() => {
    const token = tokenUtils.getToken();
    if (token && items.length > 0) {
      api.post('/cart/sync', { items })
        .catch(error => console.error('Cart sync failed:', error));
    }
  }, [items]);

  const addToCart = async (product) => {
    try {
      const newItems = [...items, product];
      setItems(newItems);
      tokenUtils.setCart(newItems);

      const token = tokenUtils.getToken();
      if (token) {
        await api.post('/cart/add', { productId: product.id });
      }
    } catch (error) {
      console.error('Add to cart failed:', error);
      toast.error('Failed to add item to cart');
    }
  };

  const removeFromCart = (itemId) => {
    setItems(prevItems => prevItems.filter(item => item.id !== itemId));
  };

  const value = {
    items,
    addToCart,
    removeFromCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

CartProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export default CartContext; 