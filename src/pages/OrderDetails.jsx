import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { toast } from 'react-hot-toast';
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
          setOrder({
            id: orderDoc.id,
            ...orderDoc.data(),
            createdAt: orderDoc.data().createdAt?.toDate().toLocaleString()
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
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                order.status === 'shipped' ? 'bg-green-100 text-green-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-500">Placed on {order.createdAt}</p>
          </div>

          {/* Order Items */}
          <div className="px-6 py-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Order Items</h3>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center space-x-4">
                  <div className="flex-shrink-0 w-16 h-16">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {item.title}
                    </p>
                    <p className="text-sm text-gray-500">
                      Quantity: {item.quantity} × ${item.price.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    ${(item.quantity * item.price).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="px-6 py-4 bg-gray-50">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-900">${order.orderSummary.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping</span>
                <span className="text-gray-900">
                  {order.orderSummary.shipping === 0 ? 'Free' : `$${order.orderSummary.shipping.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-base font-medium pt-2 border-t border-gray-200">
                <span className="text-gray-900">Total</span>
                <span className="text-gray-900">${order.orderSummary.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="px-6 py-4 border-t border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Customer Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center mb-2">
                  <UserIcon className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-500">Name</span>
                </div>
                <p className="text-gray-900">{order.customerInfo.name}</p>
              </div>
              <div>
                <div className="flex items-center mb-2">
                  <MailIcon className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-500">Email</span>
                </div>
                <p className="text-gray-900">{order.customerInfo.email}</p>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          {order.shippingAddress && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center mb-4">
                <LocationMarkerIcon className="h-5 w-5 text-gray-400 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">Shipping Address</h3>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="space-y-3">
                  <div>
                    <p className="text-base font-medium text-gray-900">{order.shippingAddress.name}</p>
                    <div className="flex items-center mt-2">
                      <PhoneIcon className="h-4 w-4 text-gray-400 mr-2" />
                      <p className="text-sm text-gray-600">{order.shippingAddress.phone}</p>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                      {order.shippingAddress.address}
                    </p>
                    {order.shippingAddress.address2 && (
                      <p className="text-sm text-gray-600">
                        {order.shippingAddress.address2}
                      </p>
                    )}
                    <p className="text-sm text-gray-600">
                      {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                    </p>
                    {order.shippingAddress.country && (
                      <p className="text-sm text-gray-600">
                        {order.shippingAddress.country}
                      </p>
                    )}
                  </div>
                  <div className="pt-2 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Delivery Instructions:</span><br />
                      {order.shippingAddress.instructions || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Payment Information */}
          {order.paymentDetails && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center mb-4">
                <CreditCardIcon className="h-5 w-5 text-gray-400 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">Payment Information</h3>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center">
                  <span className="text-lg mr-2">
                    {getCardIcon(order.paymentDetails.card.brand)}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {order.paymentDetails.card.brand.charAt(0).toUpperCase() + order.paymentDetails.card.brand.slice(1)} ending in {order.paymentDetails.card.last4}
                    </p>
                    <p className="text-sm text-gray-600">
                      Payment Method: {order.paymentDetails.method}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 