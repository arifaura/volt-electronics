import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { toast } from 'react-hot-toast';
import OrderTimeline from '../components/orders/OrderTimeline';
import { 
  ArrowLeftIcon,
  LocationMarkerIcon,
  CreditCardIcon,
  UserIcon,
  PhoneIcon,
  MailIcon
} from '@heroicons/react/outline';

export default function OrderDetails() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const orderRef = doc(db, 'orders', orderId);
        const orderDoc = await getDoc(orderRef);
        
        if (orderDoc.exists()) {
          const orderData = orderDoc.data();
          // Map status timestamps
          const timestamps = {
            pending: orderData.createdAt,
            processing: orderData.processingAt || null,
            packaged: orderData.packagedAt || null,
            shipped: orderData.shippedAt || null,
            delivered: orderData.deliveredAt || null
          };

          setOrder({
            id: orderDoc.id,
            ...orderData,
            createdAt: orderData.createdAt?.toDate().toLocaleString(),
            statusTimestamps: timestamps
          });
        } else {
          toast.error('Order not found');
        }
      } catch (error) {
        console.error('Error fetching order:', error);
        toast.error('Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  const getCardIcon = (brand) => {
    switch (brand?.toLowerCase()) {
      case 'visa':
        return '💳 Visa';
      case 'mastercard':
        return '💳 Mastercard';
      case 'amex':
        return '💳 Amex';
      default:
        return '💳';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-gray-900">Order Not Found</h2>
        <Link
          to="/profile"
          className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to Profile
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <Link
            to="/profile"
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Profile
          </Link>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Order Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                Order #{order.id.slice(-8)}
              </h2>
              <p className="text-sm text-gray-500">
                Placed on {order.createdAt}
              </p>
            </div>
          </div>

          {/* Order Timeline */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Order Status</h3>
            <OrderTimeline 
              currentStatus={order.status} 
              statusTimestamps={order.statusTimestamps}
            />
          </div>

          {/* Customer Information */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Customer Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center">
                <UserIcon className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-gray-900">{order.customerInfo.name}</span>
              </div>
              <div className="flex items-center">
                <MailIcon className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-gray-900">{order.customerInfo.email}</span>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Shipping Address</h3>
            <div className="flex items-start">
              <LocationMarkerIcon className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
              <div>
                <p className="text-gray-900">{order.shippingAddress.street}</p>
                <p className="text-gray-900">
                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}
                </p>
                <div className="mt-2 flex items-center">
                  <PhoneIcon className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-gray-600">{order.shippingAddress.phone}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Information</h3>
            <div className="flex items-center">
              <CreditCardIcon className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-gray-900">
                {getCardIcon(order.paymentDetails.card.brand)} ending in {order.paymentDetails.card.last4}
              </span>
            </div>
          </div>

          {/* Order Items */}
          <div className="px-6 py-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Order Items</h3>
            <ul className="divide-y divide-gray-200">
              {order.items.map((item) => (
                <li key={item.id} className="py-4 flex">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-20 w-20 object-contain bg-gray-100 rounded-lg"
                  />
                  <div className="ml-4 flex-1">
                    <div className="flex justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">{item.title}</h4>
                        <p className="mt-1 text-sm text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-medium text-gray-900">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            {/* Order Summary */}
            <div className="mt-6 border-t border-gray-200 pt-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-900">${order.orderSummary.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm mt-2">
                <span className="text-gray-600">Shipping</span>
                <span className="text-gray-900">${order.orderSummary.shipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-medium mt-4 pt-4 border-t border-gray-200">
                <span className="text-gray-900">Total</span>
                <span className="text-gray-900">${order.orderSummary.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 