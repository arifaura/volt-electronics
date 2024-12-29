import { useState } from 'react';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { toast } from 'react-hot-toast';

const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'packed', label: 'Packed' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' }
];

export default function OrderStatusManager({ orderId, currentStatus, onStatusUpdate }) {
  const [updating, setUpdating] = useState(false);

  const handleStatusChange = async (newStatus) => {
    if (newStatus === currentStatus) return;
    
    setUpdating(true);
    try {
      const orderRef = doc(db, 'orders', orderId);
      
      // Prepare the update data with the appropriate timestamp
      const updateData = {
        status: newStatus,
      };

      // Add the corresponding timestamp based on the new status
      switch (newStatus) {
        case 'processing':
          updateData.processingAt = serverTimestamp();
          break;
        case 'packed':
          updateData.packedAt = serverTimestamp();
          break;
        case 'shipped':
          updateData.shippedAt = serverTimestamp();
          break;
        case 'delivered':
          updateData.deliveredAt = serverTimestamp();
          break;
        // No timestamp for cancelled status
      }

      await updateDoc(orderRef, updateData);
      toast.success(`Order status updated to ${newStatus}`);
      if (onStatusUpdate) onStatusUpdate(newStatus);
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="flex items-center space-x-4">
      <label htmlFor="status" className="text-sm font-medium text-gray-700">
        Status
      </label>
      <select
        id="status"
        value={currentStatus}
        onChange={(e) => handleStatusChange(e.target.value)}
        disabled={updating}
        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
      >
        {statusOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {updating && (
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-sm text-gray-500">Updating...</span>
        </div>
      )}
    </div>
  );
} 