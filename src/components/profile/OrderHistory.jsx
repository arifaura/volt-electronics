import { useState } from 'react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import CancelOrderModal from '../modals/CancelOrderModal';

export default function OrderHistory({ orders }) {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-500 bg-yellow-50 border-yellow-200';
      case 'processing': return 'text-blue-500 bg-blue-50 border-blue-200';
      case 'shipped': return 'text-purple-500 bg-purple-50 border-purple-200';
      case 'delivered': return 'text-green-500 bg-green-50 border-green-200';
      case 'cancelled': return 'text-red-500 bg-red-50 border-red-200';
      default: return 'text-gray-500 bg-gray-50 border-gray-200';
    }
  };

  const handleCancelClick = (order) => {
    setSelectedOrder(order);
    setShowCancelModal(true);
  };

  if (!orders || orders.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-text-secondary">No orders found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {showCancelModal && (
          <CancelOrderModal
            order={selectedOrder}
            isOpen={showCancelModal}
            onClose={() => setShowCancelModal(false)}
            onCancelled={() => {
              window.location.reload();
            }}
          />
        )}
      </AnimatePresence>

      {orders.map((order) => (
        <motion.div
          key={order.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card-bg rounded-lg shadow-sm p-6"
        >
          <div className="flex flex-col md:flex-row justify-between">
            <div>
              <div className="flex items-center space-x-4">
                <h3 className="text-lg font-medium text-text-primary">
                  Order #{order.id.slice(-6)}
                </h3>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                    order.status
                  )}`}
                >
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>
              
              <p className="text-sm text-text-secondary mt-1">
                Placed on {format(order.createdAt.toDate(), 'MMM dd, yyyy')}
              </p>
            </div>

            <div className="mt-4 md:mt-0 text-right">
              <p className="text-lg font-medium text-text-primary">
                ${order.orderSummary.total.toFixed(2)}
              </p>
              <p className="text-sm text-text-secondary">
                {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
              </p>
            </div>
          </div>

          {/* Order Items */}
          <div className="mt-6 space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center space-x-4">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-16 h-16 object-cover rounded-md"
                />
                <div className="flex-1">
                  <h4 className="text-text-primary font-medium">{item.title}</h4>
                  <p className="text-text-secondary text-sm">
                    Qty: {item.quantity} × ${item.price}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Shipping Address */}
          <div className="mt-6 pt-6 border-t border-border">
            <h4 className="text-sm font-medium text-text-primary mb-2">
              Shipping Address
            </h4>
            <p className="text-sm text-text-secondary">
              {order.shippingAddress.street}, {order.shippingAddress.city},{' '}
              {order.shippingAddress.state} {order.shippingAddress.zipCode}
            </p>
          </div>

          {/* Cancel Button */}
          {(order.status === 'pending' || order.status === 'processing') && (
            <div className="mt-4 pt-4 border-t border-border">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleCancelClick(order)}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm font-medium transition-colors"
              >
                Cancel Order
              </motion.button>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
} 