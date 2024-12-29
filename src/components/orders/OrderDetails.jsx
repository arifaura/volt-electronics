import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { toast } from 'react-hot-toast';
import {
  CreditCardIcon,
  TruckIcon,
  UserIcon,
  MailIcon,
  PhoneIcon,
  LocationMarkerIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationIcon,
  ArrowLeftIcon,
  ShoppingBagIcon,
  PlusCircleIcon
} from '@heroicons/react/outline';

export default function OrderDetails() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [shippingAddress, setShippingAddress] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        // Fetch order details
        const orderRef = doc(db, 'orders', orderId);
        const orderSnap = await getDoc(orderRef);
        
        if (!orderSnap.exists()) {
          setError('Order not found');
          return;
        }

        const orderData = orderSnap.data();

        // Fetch user's shipping address
        const addressesRef = collection(db, `users/${orderData.customerInfo.userId}/addresses`);
        const addressesSnap = await getDocs(addressesRef);
        const addresses = addressesSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Get default or first address
        const defaultAddress = addresses.find(addr => addr.isDefault) || addresses[0];
        setShippingAddress(defaultAddress);

        setOrder({ id: orderSnap.id, ...orderData });
      } catch (error) {
        console.error('Error fetching order details:', error);
        setError('Failed to load order details');
        toast.error('Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  const getStatusSteps = () => {
    const steps = [
      { status: 'pending', label: 'Order Placed', icon: ShoppingBagIcon },
      { status: 'processing', label: 'Processing', icon: ClockIcon },
      { status: 'packed', label: 'Packed', icon: CheckCircleIcon },
      { status: 'shipped', label: 'Shipped', icon: TruckIcon },
      { status: 'delivered', label: 'Delivered', icon: CheckCircleIcon }
    ];

    const currentStepIndex = steps.findIndex(step => step.status === order.status?.toLowerCase());
    return steps.map((step, index) => ({
      ...step,
      isCompleted: index <= currentStepIndex,
      isCurrent: index === currentStepIndex
    }));
  };

  const handleAddAddress = () => {
    navigate('/profile?tab=addresses&action=add');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <ExclamationIcon className="mx-auto h-12 w-12 text-red-500" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">{error}</h3>
          <Link to="/profile" className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800">
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          to="/profile"
          className="inline-flex items-center text-gray-600 hover:text-gray-800 mb-6"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to Orders
        </Link>

        {/* Order Header */}
        <div className="bg-white shadow-lg rounded-xl overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="text-white">
                <p className="text-sm font-medium opacity-80">Order ID</p>
                <h1 className="text-xl font-bold">#{order.id}</h1>
                <p className="text-sm mt-1 opacity-80">
                  Placed on {formatDate(order.createdAt?.toDate())}
                </p>
              </div>
              <span className={`px-4 py-2 rounded-full text-sm font-medium bg-white ${
                order.status?.toLowerCase() === 'delivered' ? 'text-green-600' :
                order.status?.toLowerCase() === 'cancelled' ? 'text-red-600' :
                'text-blue-600'
              }`}>
                {order.status}
              </span>
            </div>
          </div>

          {/* Order Progress */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              {getStatusSteps().map((step, index) => (
                <div key={step.status} className="flex flex-col items-center relative">
                  {/* Connector Line */}
                  {index < getStatusSteps().length - 1 && (
                    <div className={`absolute left-1/2 top-5 w-full h-0.5 ${
                      step.isCompleted ? 'bg-blue-600' : 'bg-gray-200'
                    }`} />
                  )}
                  
                  {/* Status Icon */}
                  <div className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full ${
                    step.isCompleted ? 'bg-blue-600' :
                    step.isCurrent ? 'bg-blue-100 border-2 border-blue-600' :
                    'bg-gray-100'
                  }`}>
                    <step.icon className={`w-5 h-5 ${
                      step.isCompleted ? 'text-white' :
                      step.isCurrent ? 'text-blue-600' :
                      'text-gray-400'
                    }`} />
                  </div>
                  
                  {/* Status Label */}
                  <p className={`mt-2 text-xs font-medium ${
                    step.isCurrent ? 'text-blue-600' :
                    step.isCompleted ? 'text-gray-900' :
                    'text-gray-500'
                  }`}>
                    {step.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
          {/* Customer Information */}
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900">Customer Details</h2>
                <span className={`px-3 py-1 text-xs rounded-full ${
                  order.customerInfo?.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {order.customerInfo?.isVerified ? 'Verified Customer' : 'New Customer'}
                </span>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center mb-2">
                  <UserIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-gray-900 font-medium">{order.customerInfo?.name}</span>
                  </div>
                  <div className="ml-8 space-y-1">
                    <p className="text-sm text-gray-600">Customer ID: #{order.customerInfo?.userId?.slice(-6)}</p>
                    <p className="text-sm text-gray-600">Member since {formatDate(order.customerInfo?.createdAt?.toDate())}</p>
                  </div>
              </div>

                <div>
                  <div className="flex items-center mb-2">
                  <MailIcon className="h-5 w-5 text-gray-400 mr-3" />
                <span className="text-gray-900">{order.customerInfo?.email}</span>
              </div>
                  <div className="ml-8">
                    <p className="text-sm text-gray-600">
                      Email {order.customerInfo?.emailVerified ? 'Verified' : 'Not Verified'}
                    </p>
                  </div>
                </div>

              {order.customerInfo?.phone && (
                  <div>
                    <div className="flex items-center mb-2">
                    <PhoneIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-gray-900">{order.customerInfo.phone}</span>
                    </div>
                    <div className="ml-8">
                      <p className="text-sm text-gray-600">
                        Mobile {order.customerInfo?.phoneVerified ? 'Verified' : 'Not Verified'}
                      </p>
                    </div>
                  </div>
                )}

                <div className="pt-3 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Order History</h3>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Total Orders</span>
                    <span className="font-medium">{order.customerInfo?.totalOrders || 1}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Total Spent</span>
                    <span className="font-medium">${order.customerInfo?.totalSpent?.toFixed(2) || order.orderSummary?.total?.toFixed(2)}</span>
                  </div>
                </div>

                {order.customerInfo?.notes && (
                  <div className="pt-3 border-t border-gray-200">
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Customer Notes</h3>
                    <p className="text-sm text-gray-600">{order.customerInfo.notes}</p>
                </div>
              )}
            </div>
          </div>

            {/* Payment Information */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Payment Details</h2>
              <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <CreditCardIcon className="h-6 w-6 text-gray-600" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {order.paymentDetails?.card?.brand?.toUpperCase()} •••• {order.paymentDetails?.card?.last4}
                  </p>
                    <p className="text-sm text-gray-500">
                      Expires {order.paymentDetails?.card?.expMonth}/{order.paymentDetails?.card?.expYear}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Billing Address</h3>
                  <div className="text-sm text-gray-600">
                    <p>{order.paymentDetails?.billingAddress?.name}</p>
                    <p>{order.paymentDetails?.billingAddress?.address}</p>
                    <p>{order.paymentDetails?.billingAddress?.city}, {order.paymentDetails?.billingAddress?.state} {order.paymentDetails?.billingAddress?.zipCode}</p>
                    <p>{order.paymentDetails?.billingAddress?.country}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Payment Status</h3>
                  <div className="flex items-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      order.paymentDetails?.status === 'paid' ? 'bg-green-100 text-green-800' :
                      order.paymentDetails?.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {order.paymentDetails?.status === 'paid' ? 'Payment Successful' :
                       order.paymentDetails?.status === 'pending' ? 'Payment Pending' :
                       'Payment Failed'}
                    </span>
                    <span className="ml-2 text-sm text-gray-500">
                      {formatDate(order.paymentDetails?.processedAt?.toDate())}
                    </span>
                  </div>
                  {order.paymentDetails?.transactionId && (
                    <p className="mt-1 text-sm text-gray-500">
                      Transaction ID: {order.paymentDetails.transactionId}
                    </p>
                  )}
                </div>
              </div>
            </div>

          {/* Addresses */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Billing Address */}
            <div>
              <p className="text-sm font-medium text-gray-500 mb-2">Billing Address</p>
              {order.paymentDetails?.billingAddress ? (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-gray-900">{order.paymentDetails.billingAddress.name}</p>
                  <p className="text-gray-600 mt-1">{order.paymentDetails.billingAddress.address}</p>
                  <p className="text-gray-600">
                    {order.paymentDetails.billingAddress.city}, {order.paymentDetails.billingAddress.state} {order.paymentDetails.billingAddress.zipCode}
                  </p>
                  <p className="text-gray-600">{order.paymentDetails.billingAddress.country}</p>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-4 flex flex-col items-center justify-center">
                  <p className="text-gray-500 text-sm mb-3">No billing address found</p>
                  <button
                    onClick={handleAddAddress}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <PlusCircleIcon className="h-5 w-5 mr-2" />
                    Add Billing Address
                  </button>
                </div>
              )}
            </div>

            {/* Shipping Address */}
            <div>
              <p className="text-sm font-medium text-gray-500 mb-2">Shipping Address</p>
              {shippingAddress ? (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-gray-900">{shippingAddress.name}</p>
                  <p className="text-gray-600 mt-1">{shippingAddress.address}</p>
                  <p className="text-gray-600">
                    {shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}
                  </p>
                  {shippingAddress.phone && (
                    <p className="text-gray-600 mt-1">Phone: {shippingAddress.phone}</p>
                  )}
                  {shippingAddress.instructions && (
                    <p className="text-sm text-yellow-600 mt-2">
                      Note: {shippingAddress.instructions}
                    </p>
                  )}
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-4 flex flex-col items-center justify-center">
                  <p className="text-gray-500 text-sm mb-3">No shipping address found</p>
                  <button
                    onClick={handleAddAddress}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <PlusCircleIcon className="h-5 w-5 mr-2" />
                    Add Shipping Address
                  </button>
                </div>
              )}
            </div>
          </div>
          </div>

          {/* Order Items */}
          <div className="border-t border-gray-200">
            <div className="px-6 py-4">
              <h2 className="text-lg font-medium text-gray-900">Order Items</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {order.items?.map((item) => (
                <div key={item.id} className="px-6 py-4 flex items-center">
                  <div className="flex-shrink-0 w-20 h-20">
                  <img
                    src={item.image}
                    alt={item.title}
                      className="w-full h-full object-cover rounded-lg"
                  />
                  </div>
                  <div className="ml-6 flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">{item.title}</h4>
                        <p className="mt-1 text-sm text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-medium text-gray-900">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-gray-50 px-6 py-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-900 font-medium">${order.orderSummary?.subtotal?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping</span>
                <span className="text-gray-900 font-medium">
                  {order.orderSummary?.shipping === 0 ? 'Free' : `$${order.orderSummary?.shipping?.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-base font-medium pt-4 border-t border-gray-200">
                <span className="text-gray-900">Total</span>
                <span className="text-blue-600">${order.orderSummary?.total?.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 