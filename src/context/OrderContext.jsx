import { createContext, useContext, useState } from 'react';

const OrderContext = createContext({
  orders: [],
  addOrder: () => {},
  updateOrder: () => {},
});

export function OrderProvider({ children }) {
  const [orders, setOrders] = useState([
    {
      id: 1,
      customer: { name: 'John Doe', email: 'john@example.com' },
      date: new Date(),
      total: 299.99,
      status: 'pending'
    },
    {
      id: 2,
      customer: { name: 'Jane Smith', email: 'jane@example.com' },
      date: new Date(),
      total: 499.99,
      status: 'completed'
    }
  ]);

  const addOrder = (order) => {
    // In a real app, make an API call
    setOrders([...orders, { ...order, id: Date.now(), status: 'pending' }]);
  };

  const updateOrder = (orderId, updates) => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, ...updates } : order
    ));
  };

  return (
    <OrderContext.Provider value={{ orders, addOrder, updateOrder }}>
      {children}
    </OrderContext.Provider>
  );
}

export const useOrders = () => useContext(OrderContext); 