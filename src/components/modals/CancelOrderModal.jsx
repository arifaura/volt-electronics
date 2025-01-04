import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XIcon } from '@heroicons/react/outline';
import { toast } from 'react-hot-toast';
import { db } from '../../config/firebase';
import { doc, updateDoc } from 'firebase/firestore';

const cancellationReasons = [
  'Changed my mind',
  'Ordered wrong item',
  'Delivery time too long',
  'Found better price elsewhere',
  'Other reason'
];

export default function CancelOrderModal({ order, isOpen, onClose, onCancelled }) {
  const [selectedReason, setSelectedReason] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const canCancel = () => {
    if (!order) return false;

    const orderDate = order.createdAt?.toDate();
    if (!orderDate) return false;

    const hoursSinceOrder = (Date.now() - orderDate.getTime()) / (1000 * 60 * 60);

    // Cancellation rules based on order status
    switch (order.status) {
      case 'pending':
        return hoursSinceOrder <= 24; // Can cancel within 24 hours
      case 'processing':
        return hoursSinceOrder <= 12; // Can cancel within 12 hours if processing
      case 'shipped':
      case 'delivered':
      case 'cancelled':
        return false; // Cannot cancel if shipped, delivered, or already cancelled
      default:
        return false;
    }
  };

  const handleCancel = async () => {
    if (!selectedReason) {
      toast.error('Please select a reason for cancellation');
      return;
    }

    try {
      setLoading(true);

      const orderRef = doc(db, 'orders', order.id);
      await updateDoc(orderRef, {
        status: 'cancelled',
        cancellation: {
          reason: selectedReason,
          notes: additionalNotes,
          cancelledAt: new Date(),
        }
      });

      toast.success('Order cancelled successfully');
      onCancelled();
      onClose();
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast.error('Failed to cancel order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-card-bg rounded-xl shadow-xl p-6 w-full max-w-md mx-4"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-text-primary">Cancel Order</h2>
          <button
            onClick={onClose}
            className="p-2 text-text-secondary hover:text-text-primary rounded-full"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        {!canCancel() ? (
          <div className="text-center py-4">
            <p className="text-text-secondary">
              This order cannot be cancelled. Orders can only be cancelled:
              <ul className="mt-2 text-sm">
                <li>• Within 24 hours of placing the order</li>
                <li>• Within 12 hours if the order is being processed</li>
                <li>• Before the order is shipped</li>
              </ul>
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Reason for Cancellation
                </label>
                <select
                  value={selectedReason}
                  onChange={(e) => setSelectedReason(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-input-bg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="">Select a reason</option>
                  {cancellationReasons.map((reason) => (
                    <option key={reason} value={reason}>
                      {reason}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  rows="3"
                  className="w-full px-4 py-2 rounded-lg border border-border bg-input-bg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="Any additional details..."
                />
              </div>
            </div>

            <div className="mt-6 flex space-x-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-border rounded-lg text-text-primary hover:bg-background"
              >
                Keep Order
              </button>
              <button
                onClick={handleCancel}
                disabled={loading || !selectedReason}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Cancelling...' : 'Cancel Order'}
              </button>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
} 