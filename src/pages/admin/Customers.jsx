import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, where, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import {
  UserIcon,
  SearchIcon,
  BanIcon,
  CheckCircleIcon
} from '@heroicons/react/outline';
import { data } from 'autoprefixer';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [customerOrders, setCustomerOrders] = useState([]);
  const [indexError, setIndexError] = useState(false);
  const [customerMetrics, setCustomerMetrics] = useState({
    totalSpent: 0,
    orderCount: 0,
    averageOrderValue: 0,
    lastOrderDate: 'N/A',
  });

  // Fetch customers
  useEffect(() => {
    let unsubscribe;
    const fetchCustomers = async () => {
      try {
        const basicQuery = query(
          collection(db, 'users'),
          where('role', '==', 'customer')
        );

        const basicSnapshot = await getDocs(basicQuery);
        // console.log('Raw customer data:', basicSnapshot.docs.map(doc => doc.data())); // Log raw data

        const initialCustomerData = basicSnapshot.docs.map(doc => {
          const data = doc.data();
          // console.log(`Document ID: ${doc.id}, Data:`, data); // Log each document's data
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt ? (data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt)) : null, // Handle Firestore Timestamp
          };
        });

        // console.log('Fetched customers:', initialCustomerData); // Log the processed customer data
        setCustomers(initialCustomerData);
        setLoading(false);

        // Optionally, you can set the first customer as selected if needed
        // if (initialCustomerData.length > 0) {
        //   setSelectedCustomer(initialCustomerData[0]); // Set the first customer as selected
        // }
      } catch (error) {
        console.error('Error fetching customers:', error);
        setLoading(false);
      }
    };

    fetchCustomers();
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  // Fetch customer orders when a customer is selected
  useEffect(() => {
    if (!selectedCustomer) return;
    const fetchCustomerOrders = async () => {
      try {
        const q = query(
          collection(db, 'orders'),
          where('customerInfo.email', '==', selectedCustomer.email) // Match by email or userId
        );

        const snapshot = await getDocs(q);
        const orders = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate() || null // Convert Firestore timestamp to Date
          };
        }).sort((a, b) => {
          if (!a.createdAt || !b.createdAt) return 0;
          return b.createdAt - a.createdAt; // Sort by createdAt
        });
        setCustomerOrders(orders); // Update the state with fetched orders

        // Calculate customer metrics
        const totalSpent = orders.reduce((sum, order) => sum + (order.orderSummary.total || 0), 0);
        const lastOrder = orders[0];

        setCustomerMetrics({
          totalSpent,
          orderCount: orders.length,
          averageOrderValue: orders.length ? totalSpent / orders.length : 0,
          lastOrderDate: lastOrder?.createdAt ? format(new Date(lastOrder.createdAt), 'MMMM dd, yyyy') : 'N/A', // Check for valid date
        });
      } catch (error) {
        console.error('Error fetching customer orders:', error);
        toast.error('Error loading customer orders');
      }
    };

    fetchCustomerOrders();
  }, [selectedCustomer]);

  const updateCustomerStatus = async (customerId, isActive) => {
    try {
      await updateDoc(doc(db, 'users', customerId), {
        isActive,
        updatedAt: new Date()
      });
      toast.success(`Customer ${isActive ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      console.error('Error updating customer status:', error);
      toast.error('Failed to update customer status');
    }
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = searchQuery === '' ||
      customer.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone?.includes(searchQuery);

    const matchesFilter = filter === 'all' ||
      (filter === 'active' && customer.isActive) ||
      (filter === 'inactive' && !customer.isActive);

    return matchesSearch && matchesFilter;
  });

  useEffect(() => {
    // console.log('Selected Customer:', selectedCustomer);
  }, [selectedCustomer]);

  const memberSince = selectedCustomer?.createdAt
    ? format(new Date(selectedCustomer.createdAt), 'MMMM dd, yyyy')
    : 'No Member Since';

  // Function to handle customer selection
  const handleCustomerSelect = (customer) => {
    // console.log('Selected Customer Data:', customer);
    setSelectedCustomer({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      createdAt: customer.createdAt,
    });
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

  if (indexError) {
    return (
      <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Index Required</h2>
          <p className="text-gray-600 mb-4">
            A database index needs to be created for this page to work properly. Please check the console for the link to create the index.
          </p>
          <p className="text-gray-600 mb-4">
            After creating the index, it may take a few minutes to complete. The page will automatically update once the index is ready.
          </p>
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
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
              <h1 className="text-2xl font-semibold text-gray-900">Customers</h1>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {customers.length} total
              </span>
            </div>
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
                placeholder="Search customers..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('active')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${filter === 'active' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
              >
                Active
              </button>
              <button
                onClick={() => setFilter('inactive')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${filter === 'inactive' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
              >
                Inactive
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Customer List */}
          <div className="lg:col-span-1 bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="divide-y divide-gray-200">
              {filteredCustomers.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No customers found
                </div>
              ) : (
                filteredCustomers.map((customer) => (
                  <div
                    key={customer.id}
                    className={`p-4 cursor-pointer hover:bg-gray-50 ${selectedCustomer?.id === customer.id ? 'bg-gray-50' : ''
                      }`}
                    onClick={() => handleCustomerSelect(customer)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <UserIcon className="h-6 w-6 text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {customer.name}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {customer.email}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${customer.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                          {customer.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Customer Details */}
          <div className="lg:col-span-2 space-y-4">
            {selectedCustomer ? (
              <>
                {/* Customer Info */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden p-4">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                      <h2 className="text-lg font-medium text-gray-900">
                        Customer Details
                      </h2>
                      <button
                        onClick={() => updateCustomerStatus(selectedCustomer.id, !selectedCustomer.isActive)}
                        className={`inline-flex items-center px-3 py-2 border shadow-sm text-sm leading-4 font-medium rounded-md ${selectedCustomer.isActive
                          ? 'border-red-300 text-red-700 bg-white hover:bg-red-50'
                          : 'border-green-300 text-green-700 bg-white hover:bg-green-50'
                          }`}
                      >
                        {selectedCustomer.isActive ? (
                          <>
                            <BanIcon className="h-4 w-4 mr-1" />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <CheckCircleIcon className="h-4 w-4 mr-1" />
                            Activate
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="px-6 py-4">
                    <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">Full Name</dt>
                        <dd className="mt-1 text-sm text-gray-900">{selectedCustomer.name}</dd>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">Email</dt>
                        <dd className="mt-1 text-sm text-gray-900">{selectedCustomer.email}</dd>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">Phone</dt>
                        <dd className="mt-1 text-sm text-gray-900">{selectedCustomer?.phone || 'N/A'}</dd>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">Member Since</dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {memberSince}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>

                {/* Customer Metrics */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden p-4">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Customer Activity</h3>
                  </div>
                  <div className="px-6 py-4">
                    <dl className="grid grid-cols-1 gap-5 sm:grid-cols-4">
                      <div className="px-4 py-5 bg-gray-50 shadow-sm rounded-lg overflow-hidden sm:p-6">
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Orders</dt>
                        <dd className="mt-1 text-3xl font-semibold text-gray-900">{customerMetrics.orderCount}</dd>
                      </div>
                      <div className="px-4 py-5 bg-gray-50 shadow-sm rounded-lg overflow-hidden sm:p-6">
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Spent</dt>
                        <dd className="mt-1 text-3xl font-semibold text-gray-900">${customerMetrics.totalSpent.toFixed(2)}</dd>
                      </div>
                      <div className="px-4 py-5 bg-gray-50 shadow-sm rounded-lg overflow-hidden sm:p-6">
                        <dt className="text-sm font-medium text-gray-500 truncate">Average Order</dt>
                        <dd className="mt-1 text-3xl font-semibold text-gray-900">${customerMetrics.averageOrderValue.toFixed(2)}</dd>
                      </div>
                      <div className="px-4 py-5 bg-gray-50 shadow-sm rounded-lg overflow-hidden sm:p-6">
                        <dt className="text-sm font-medium text-gray-500 truncate">Last Order</dt>
                        <dd className="mt-1 text-3xl font-semibold text-gray-900">
                          {customerMetrics.lastOrderDate}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>

                {/* Order History */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Order History</h3>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {customerOrders.length === 0 ? (
                      <div className="px-4 py-3 text-center text-gray-500">
                        No orders found
                      </div>
                    ) : (
                      customerOrders.map((order) => (
                        <div
                          key={order.id}
                          className={`px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors duration-150`}
                          onClick={() => setSelectedOrder(order)}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                Order #{order.id.slice(-6).toUpperCase()}
                              </p>
                              <p className="text-sm text-gray-500">
                                {order.createdAt ? order.createdAt.toLocaleString() : 'N/A'}
                              </p>
                            </div>
                            <div className="flex items-center space-x-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${order.status === 'delivered' ? 'bg-green-100 text-green-800' : order.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              </span>
                              <span className="text-sm font-medium text-gray-900">
                                ${order.orderSummary.total.toFixed(2)}
                              </span>
                            </div>
                          </div>
                          {selectedOrder?.id === order.id && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <div className="space-y-2">
                                <h4 className="text-sm font-medium text-gray-900">Order Items</h4>
                                {order.items.map((item, index) => (
                                  <div key={index} className="flex justify-between text-sm">
                                    <span className="text-gray-600">{item.title} x{item.quantity}</span>
                                    <span className="text-gray-900">${(item.price * item.quantity).toFixed(2)}</span>
                                  </div>
                                ))}
                                <div className="flex justify-between text-sm font-medium pt-2">
                                  <span className="text-gray-900">Total</span>
                                  <span className="text-gray-900">${order.orderSummary.total.toFixed(2)}</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-4 text-center text-gray-500">
                Select a customer to view details
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 