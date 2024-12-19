import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { ShoppingBagIcon, XIcon, PlusIcon, MinusIcon } from '@heroicons/react/outline';
import { toast } from 'react-hot-toast';

export default function Cart() {
  const { items = [], removeFromCart, updateQuantity, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Calculate subtotal with error handling
  const calculateSubtotal = () => {
    try {
      return items.reduce((total, item) => {
        const price = Number(item?.price) || 0;
        const quantity = Number(item?.quantity) || 0;
        return total + (price * quantity);
      }, 0);
    } catch (error) {
      console.error('Error calculating subtotal:', error);
      return 0;
    }
  };

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    if (newQuantity > 10) {
      toast.error('Maximum quantity is 10');
      return;
    }
    updateQuantity(itemId, newQuantity);
  };

  const handleRemoveItem = (itemId) => {
    removeFromCart(itemId);
    toast.success('Item removed from cart');
  };

  const handleCheckout = async () => {
    setLoading(true);
    try {
      // Save order to Firestore with enhanced data
      const orderData = {
        items: items.map(item => ({
          id: item.id,
          title: item.title,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
          total: item.price * item.quantity // Add item total
        })),
        customerInfo: {
          name: user.displayName || user.name || '', // Add name from user
          email: user.email,
          userId: user.uid
        },
        orderSummary: {
          subtotal,
          shipping,
          total,
          itemCount: items.reduce((sum, item) => sum + item.quantity, 0)
        },
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const ordersRef = collection(db, 'orders');
      await addDoc(ordersRef, orderData);

      // Clear cart
      clearCart();

      // Show success message
      toast.success('Order placed successfully!');

      // Navigate to profile orders page
      navigate('/profile', { state: { activeTab: 'orders' } });
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Failed to process checkout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const subtotal = calculateSubtotal();
  const shipping = subtotal > 500 ? 0 : 150;
  const total = subtotal + shipping;

  if (!items || items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <ShoppingBagIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h2 className="mt-2 text-lg font-medium text-gray-900">Your cart is empty</h2>
          <p className="mt-1 text-sm text-gray-500">Start shopping to add items to your cart.</p>
          <div className="mt-6">
            <Link
              to="/products"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-8">
            <div className="bg-white shadow-sm rounded-lg">
              <ul className="divide-y divide-gray-200">
                {items.map((item) => (
                  <li key={item?.id} className="p-6 flex items-center">
                    <div className="flex-shrink-0 w-24 h-24 border border-gray-200 rounded-md overflow-hidden">
                      <img
                        src={item?.image}
                        alt={item?.title}
                        className="w-full h-full object-contain"
                      />
                    </div>

                    <div className="ml-6 flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-base font-medium text-gray-900">
                            {item?.title}
                          </h3>
                          <p className="mt-1 text-sm text-gray-500">
                            ${(item?.price || 0).toFixed(2)}
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemoveItem(item?.id)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <XIcon className="h-5 w-5" />
                        </button>
                      </div>

                      <div className="mt-4 flex items-center">
                        <button
                          onClick={() => handleQuantityChange(item?.id, (item?.quantity || 0) - 1)}
                          className="text-gray-500 hover:text-blue-600"
                        >
                          <MinusIcon className="h-5 w-5" />
                        </button>
                        <span className="mx-4 text-gray-900">{item?.quantity || 0}</span>
                        <button
                          onClick={() => handleQuantityChange(item?.id, (item?.quantity || 0) + 1)}
                          className="text-gray-500 hover:text-blue-600"
                        >
                          <PlusIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-4">
            <div className="bg-white shadow-sm rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">Order Summary</h2>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <p className="text-gray-600">Subtotal</p>
                  <p className="text-gray-900">${subtotal.toFixed(2)}</p>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-gray-600">Shipping</p>
                    {subtotal > 500 && (
                      <p className="text-xs text-green-600">Free shipping on orders over $500!</p>
                    )}
                  </div>
                  <p className="text-gray-900">
                    {shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}
                  </p>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between">
                    <p className="text-lg font-medium text-gray-900">Total</p>
                    <p className="text-lg font-medium text-gray-900">
                      ${total.toFixed(2)}
                    </p>
                  </div>
                </div>

                {subtotal < 500 && (
                  <div className="mt-2 text-sm text-gray-500 bg-gray-50 p-3 rounded-md">
                    Add ${(500 - subtotal).toFixed(2)} more to get free shipping!
                  </div>
                )}

                <button
                  onClick={handleCheckout}
                  disabled={loading || items.length === 0}
                  className={`w-full mt-6 bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 ${
                    loading || items.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2" />
                      Processing...
                    </div>
                  ) : (
                    'Proceed to Checkout'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 