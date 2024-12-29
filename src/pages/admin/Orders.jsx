import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, getDoc, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import { useLocation } from 'react-router-dom';
import { 
  ShoppingCartIcon,
  CheckCircleIcon,
  XCircleIcon,
  TruckIcon,
  SearchIcon,
  FilterIcon,
  BellIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ClockIcon,
  ChartBarIcon,
  TrendingUpIcon,
  ExclamationIcon,
  UserCircleIcon,
  MailIcon,
  LocationMarkerIcon,
  CreditCardIcon
} from '@heroicons/react/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { playNotificationSound } from '../../utils/notificationSound';

const ORDER_STATUS = {
  pending: { label: 'Pending', color: 'text-yellow-600 bg-yellow-100', icon: ClockIcon },
  processing: { label: 'Processing', color: 'text-blue-600 bg-blue-100', icon: CurrencyDollarIcon },
  packed: { label: 'Packed', color: 'text-indigo-600 bg-indigo-100', icon: ShoppingCartIcon },
  shipped: { label: 'Shipped', color: 'text-green-600 bg-green-100', icon: TruckIcon },
  delivered: { label: 'Delivered', color: 'text-gray-600 bg-gray-100', icon: CheckCircleIcon },
  cancelled: { label: 'Cancelled', color: 'text-red-600 bg-red-100', icon: XCircleIcon },
  refunded: { label: 'Refunded', color: 'text-orange-600 bg-orange-100', icon: ExclamationIcon }
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const location = useLocation();
  const [customerAddress, setCustomerAddress] = useState(null);
  const [lastOrderCount, setLastOrderCount] = useState(0);

  useEffect(() => {
    const q = query(
      collection(db, 'orders'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newOrders = snapshot.docs.map(doc => {
        const data = doc.data();
        // Add detailed logging for all orders
        console.log('Order data:', {
          id: doc.id,
          customerInfo: data.customerInfo,
          orderSummary: data.orderSummary,
          items: data.items,
          status: data.status,
          createdAt: data.createdAt
        });
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate()
        };
      });
      
      setOrders(newOrders);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const fetchCustomerAddress = async (userId) => {
    try {
      const addressesRef = collection(db, `users/${userId}/addresses`);
      const q = query(addressesRef);
      const snapshot = await getDocs(q);
      const addresses = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      // Find the default address or use the first one
      const defaultAddress = addresses.find(addr => addr.isDefault) || addresses[0];
      setCustomerAddress(defaultAddress);
    } catch (error) {
      console.error('Error fetching customer address:', error);
    }
  };

  useEffect(() => {
    if (selectedOrder?.customerInfo?.userId) {
      fetchCustomerAddress(selectedOrder.customerInfo.userId);
    } else {
      setCustomerAddress(null);
    }
  }, [selectedOrder]);

  const filteredOrders = orders.filter(order => {
    const matchesFilter = filter === 'all' || order.status === filter;
    const matchesSearch = searchQuery === '' || 
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.customerInfo?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.customerInfo?.email || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getOrderDetails = (order) => {
    // Get customer name
    const customerName = order.customerInfo?.name || 
      order.customerInfo?.displayName || 
      order.customerName || 
      order.customer?.name ||
      'N/A';

    // Get customer email
    const customerEmail = order.customerInfo?.email || 
      order.customer?.email ||
      order.email || 
      'N/A';

    // Get shipping address
    const shippingAddress = order.customerInfo?.address || 
      (order.customerInfo?.shippingAddress && `${order.customerInfo.shippingAddress.address}, ${order.customerInfo.shippingAddress.city}, ${order.customerInfo.shippingAddress.state} ${order.customerInfo.shippingAddress.zipCode}`) ||
      order.shippingAddress?.address ||
      order.address ||
      'N/A';

    // Calculate total
    const total = order.orderSummary?.total || 
      order.total || 
      (order.items?.reduce((sum, item) => {
        const price = Number(item.price) || Number(item.productPrice) || 0;
        const quantity = Number(item.quantity) || 0;
        return sum + (price * quantity);
      }, 0)) || 
      0;

    return {
      customer: customerName,
      email: customerEmail,
      address: shippingAddress,
      total: total
    };
  };

  const updateOrderStatus = async (orderId, newStatus, e) => {
    if (e) e.stopPropagation();
    try {
      const orderRef = doc(db, 'orders', orderId);
      
      // First get the current order to access existing history
      const orderDoc = await getDoc(orderRef);
      const currentOrder = orderDoc.data();
      
      // Prepare the new history entry
      const newHistoryEntry = {
        status: newStatus,
        timestamp: new Date(),
        note: `Order marked as ${newStatus}`
      };

      const updates = {
        status: newStatus,
        updatedAt: new Date(),
        // Merge existing history with new entry
        statusHistory: [...(currentOrder.statusHistory || []), newHistoryEntry]
      };
      
      // Add tracking number for shipped status
      if (newStatus === 'shipped') {
        const trackingNumber = prompt('Please enter the tracking number:');
        if (!trackingNumber) return;
        updates.trackingNumber = trackingNumber;
        updates.shippedAt = new Date();
        newHistoryEntry.note += ` (Tracking: ${trackingNumber})`;
      }
      
      // Add delivery confirmation for delivered status
      if (newStatus === 'delivered') {
        updates.deliveredAt = new Date();
      }
      
      // Add refund reason for refunded status
      if (newStatus === 'refunded') {
        const refundReason = prompt('Please enter the refund reason:');
        if (!refundReason) return;
        updates.refundReason = refundReason;
        updates.refundedAt = new Date();
        newHistoryEntry.note += ` (Reason: ${refundReason})`;
      }

      await updateDoc(orderRef, updates);
      toast.success(`Order status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  const exportOrders = () => {
    try {
      const ordersToExport = filteredOrders.map(order => {
        const details = getOrderDetails(order);
        return {
          'Order ID': order.id,
          'Date': order.createdAt ? format(order.createdAt, 'MMM d, yyyy h:mm a') : 'N/A',
          'Status': ORDER_STATUS[order.status].label,
          'Customer': details.customer,
          'Email': details.email,
          'Address': details.address,
          'Items': order.items?.length || 0,
          'Total': details.total.toFixed(2)
        };
      });

      const csvContent = "data:text/csv;charset=utf-8," + 
        Object.keys(ordersToExport[0]).join(",") + "\n" +
        ordersToExport.map(row => Object.values(row).join(",")).join("\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `orders_${format(new Date(), 'yyyy-MM-dd')}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Orders exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export orders');
    }
  };

  const cancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    
    try {
      await updateOrderStatus(orderId, 'cancelled');
      toast.success('Order cancelled successfully');
    } catch (error) {
      console.error('Cancel error:', error);
      toast.error('Failed to cancel order');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-white rounded w-1/4"></div>
          <div className="h-64 bg-white rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-semibold text-gray-900">Orders</h1>
              <button
                onClick={exportOrders}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                title="Export orders to CSV"
              >
                Export
              </button>
            </div>
            <button
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              className={`p-2 rounded-md ${
                notificationsEnabled ? 'text-blue-600' : 'text-gray-400'
              }`}
              title={notificationsEnabled ? 'Disable notifications' : 'Enable notifications'}
            >
              <BellIcon className="h-6 w-6" />
        </button>
      </div>

          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="relative flex-1 max-w-xs">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search orders..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
            </div>

            <div className="flex flex-wrap gap-2">
              {Object.entries(ORDER_STATUS).map(([status, { label }]) => (
                <button
                  key={status}
                  onClick={() => setFilter(status === filter ? 'all' : status)}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    filter === status
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-4">
          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-4 text-center text-gray-500">
              No orders found
            </div>
          ) : (
            filteredOrders.map((order) => {
              const details = getOrderDetails(order);
              return (
                <div
                  key={order.id}
                  onClick={() => setSelectedOrder(order.id === selectedOrder?.id ? null : order)}
                  className={`bg-white rounded-lg shadow-sm p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
                    order.id === selectedOrder?.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
                  <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900">
                          Order #{order.id.slice(-6).toUpperCase()}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          ORDER_STATUS[order.status].color
                        }`}>
                          {ORDER_STATUS[order.status].label}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        {order.createdAt ? format(order.createdAt, 'MMM d, yyyy h:mm a') : 'N/A'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">${details.total.toFixed(2)}</p>
                      <p className="text-sm text-gray-500">{order.items?.length || 0} items</p>
                    </div>
                  </div>

                  {selectedOrder?.id === order.id && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Customer Details</h4>
                          <div className="space-y-2">
                            <p className="text-sm text-gray-600">{details.customer}</p>
                            <p className="text-sm text-gray-600">{details.email}</p>
                            <p className="text-sm text-gray-600">{details.address}</p>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Order Items</h4>
                          <div className="space-y-2">
                            {order.items?.map((item, index) => (
                              <div key={index} className="flex items-center space-x-3">
                                <img 
                                  src={item.image} 
                                  alt={item.name} 
                                  className="w-12 h-12 object-cover rounded-md"
                                />
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-gray-900">{item.name || item.title}</p>
                                  <p className="text-xs text-gray-600">Qty: {item.quantity} × ${(item.price || 0).toFixed(2)}</p>
                                </div>
                                <span className="text-sm text-gray-900">
                                  ${((item.price || 0) * (item.quantity || 0)).toFixed(2)}
                                </span>
                              </div>
                            ))}
                            <div className="pt-2 border-t border-gray-200 flex justify-between font-medium">
                              <span>Total</span>
                              <span>${details.total.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="sm:col-span-2">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <h4 className="text-sm font-medium text-gray-900">Order Actions</h4>
                            <div className="flex flex-wrap gap-2">
                              {order.status !== 'cancelled' && order.status !== 'delivered' && order.status !== 'refunded' && (
                                <button
                                  onClick={(e) => cancelOrder(order.id, e)}
                                  className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
                                >
                                  <XCircleIcon className="h-4 w-4 mr-1" />
                                  Cancel Order
                                </button>
                              )}
                              
                              {/* Status progression buttons */}
                              {order.status === 'pending' && (
                                <button
                                  onClick={(e) => updateOrderStatus(order.id, 'processing', e)}
                                  className="inline-flex items-center px-3 py-2 border border-blue-300 shadow-sm text-sm leading-4 font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50"
                                >
                                  <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                                  Process Order
                                </button>
                              )}
                              
                              {order.status === 'processing' && (
                                <button
                                  onClick={(e) => updateOrderStatus(order.id, 'packed', e)}
                                  className="inline-flex items-center px-3 py-2 border border-indigo-300 shadow-sm text-sm leading-4 font-medium rounded-md text-indigo-700 bg-white hover:bg-indigo-50"
                                >
                                  <ShoppingCartIcon className="h-4 w-4 mr-1" />
                                  Mark as Packed
                                </button>
                              )}
                              
                              {order.status === 'packed' && (
                                <button
                                  onClick={(e) => updateOrderStatus(order.id, 'shipped', e)}
                                  className="inline-flex items-center px-3 py-2 border border-green-300 shadow-sm text-sm leading-4 font-medium rounded-md text-green-700 bg-white hover:bg-green-50"
                                >
                                  <TruckIcon className="h-4 w-4 mr-1" />
                                  Mark as Shipped
                                </button>
                              )}
                              
                              {order.status === 'shipped' && (
                                <button
                                  onClick={(e) => updateOrderStatus(order.id, 'delivered', e)}
                                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                >
                                  <CheckCircleIcon className="h-4 w-4 mr-1" />
                                  Mark as Delivered
                                </button>
                              )}
                              
                              {(order.status === 'delivered' || order.status === 'cancelled') && (
                                <button
                                  onClick={(e) => updateOrderStatus(order.id, 'refunded', e)}
                                  className="inline-flex items-center px-3 py-2 border border-orange-300 shadow-sm text-sm leading-4 font-medium rounded-md text-orange-700 bg-white hover:bg-orange-50"
                                >
                                  <ExclamationIcon className="h-4 w-4 mr-1" />
                                  Process Refund
                                </button>
                              )}
                            </div>
                          </div>
                          
                          {/* Order Timeline */}
                          {order.statusHistory?.length > 0 && (
                            <div className="mt-4">
                              <h4 className="text-sm font-medium text-gray-900 mb-2">Order Timeline</h4>
                              <div className="space-y-2">
                                {order.statusHistory.map((history, index) => (
                                  <div key={index} className="flex items-center text-sm">
                                    <div className="w-24 text-gray-500">
                                      {format(history.timestamp.toDate(), 'MMM d, HH:mm')}
                                    </div>
                                    <div className="flex-1 text-gray-600">
                                      {history.note}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* Shipping Address */}
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <h4 className="text-sm font-medium text-gray-900 mb-2">Shipping Address</h4>
                            <div className="bg-gray-50 rounded-lg p-3">
                              {order.shippingAddress ? (
                                <>
                                  <p className="text-sm text-gray-900">{order.shippingAddress.name}</p>
                                  <p className="text-sm text-gray-600 mt-1">{order.shippingAddress.address}</p>
                                  <p className="text-sm text-gray-600">
                                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                                  </p>
                                  {order.shippingAddress.phone && (
                                    <p className="text-sm text-gray-600 mt-1">Phone: {order.shippingAddress.phone}</p>
                                  )}
                                </>
                              ) : (
                                <p className="text-sm text-gray-500">No shipping address available</p>
                              )}
                            </div>
                          </div>

                          {/* Payment Information */}
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <h4 className="text-sm font-medium text-gray-900 mb-2">Payment Information</h4>
                            <div className="bg-gray-50 rounded-lg p-3">
                              {order.paymentDetails ? (
                                <>
                                  <div className="flex items-center space-x-3">
                                    <CreditCardIcon className="h-5 w-5 text-gray-400" />
                                    <div>
                                      <p className="text-sm text-gray-900">
                                        {order.paymentDetails.card?.brand?.toUpperCase()} •••• {order.paymentDetails.card?.last4}
                                      </p>
                                      <p className="text-xs text-gray-600">
                                        Expires {order.paymentDetails.card?.expMonth}/{order.paymentDetails.card?.expYear}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="mt-2 pt-2 border-t border-gray-200">
                                    <p className="text-sm text-gray-600">
                                      Status: <span className={`font-medium ${
                                        order.paymentDetails.status === 'paid' ? 'text-green-600' :
                                        order.paymentDetails.status === 'pending' ? 'text-yellow-600' :
                                        'text-red-600'
                                      }`}>
                                        {order.paymentDetails.status?.charAt(0).toUpperCase() + order.paymentDetails.status?.slice(1)}
                                      </span>
                                    </p>
                                    {order.paymentDetails.transactionId && (
                                      <p className="text-xs text-gray-500 mt-1">
                                        Transaction ID: {order.paymentDetails.transactionId}
                                      </p>
                                    )}
                                  </div>
                                </>
                              ) : (
                                <p className="text-sm text-gray-500">No payment information available</p>
                              )}
                            </div>
                          </div>

                          {/* Tracking Information */}
                          {order.trackingNumber && (
                            <div className="mt-4">
                              <h4 className="text-sm font-medium text-gray-900 mb-2">Tracking Information</h4>
                              <p className="text-sm text-gray-600">
                                Tracking Number: {order.trackingNumber}
                              </p>
                              {order.shippedAt && (
                                <p className="text-sm text-gray-600">
                                  Shipped on: {format(order.shippedAt.toDate(), 'MMM d, yyyy h:mm a')}
                                </p>
                              )}
                            </div>
                          )}
                          
                          {/* Refund Information */}
                          {order.refundReason && (
                            <div className="mt-4">
                              <h4 className="text-sm font-medium text-gray-900 mb-2">Refund Information</h4>
                              <p className="text-sm text-gray-600">
                                Reason: {order.refundReason}
                              </p>
                              {order.refundedAt && (
                                <p className="text-sm text-gray-600">
                                  Refunded on: {format(order.refundedAt.toDate(), 'MMM d, yyyy h:mm a')}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
} 