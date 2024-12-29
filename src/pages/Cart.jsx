import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { ShoppingBagIcon, XIcon, PlusIcon, MinusIcon } from '@heroicons/react/outline';
import { toast } from 'react-hot-toast';
import PaymentSection from '../components/checkout/PaymentSection';
import AddressSection from '../components/checkout/AddressSection';

export default function Cart() {
  const { items = [], removeFromCart, updateQuantity, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentProcessed, setPaymentProcessed] = useState(false);

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

  const handleAddressSelect = (address) => {
    setSelectedAddress(address);
  };

  const handlePaymentComplete = async (paymentDetails) => {
    try {
      if (!selectedAddress) {
        toast.error('Please select a delivery address');
        return;
      }

      // Create the order with payment details and address
      const orderData = {
        items: items,
        customerInfo: {
          userId: user.uid,
          name: user.name || user.displayName,
          email: user.email
        },
        shippingAddress: selectedAddress,
        orderSummary: {
          subtotal: calculateSubtotal(),
          shipping: shipping,
          total: total,
          itemCount: items.length
        },
        paymentDetails: {
          method: paymentDetails.paymentMethod,
          card: {
            last4: paymentDetails.card.last4,
            brand: paymentDetails.card.brand
          }
        },
        status: 'pending',
        createdAt: serverTimestamp()
      };

      // Create the order in Firestore
      const ordersRef = collection(db, 'orders');
      await addDoc(ordersRef, orderData);

      // Clear cart and local storage
      clearCart();
      localStorage.removeItem('cartItems');
      
      setPaymentProcessed(true);
      toast.success('Order placed successfully!');

      // Navigate to profile orders page
      navigate('/profile', { state: { activeTab: 'orders' } });
    } catch (error) {
      console.error('Error placing order:', error);
      // Re-throw the error to be handled by the PaymentSection
      throw new Error('Failed to place order. Please try again.');
    }
  };

  const handleProceedToPayment = () => {
    if (!selectedAddress) {
      toast.error('Please select a delivery address');
      return;
    }
    setIsCheckingOut(true);
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
          {/* Cart Items and Address Section */}
          <div className="lg:col-span-8 space-y-6">
            {/* Cart Items */}
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

            {/* Address Section */}
            {!isCheckingOut && (
              <AddressSection onAddressSelect={handleAddressSelect} />
            )}

            {/* Payment Section */}
            {isCheckingOut && (
              <PaymentSection
                onPaymentComplete={handlePaymentComplete}
                total={total}
              />
            )}
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

                {items.length > 0 && (
                  <div className="mt-6">
                    {!isCheckingOut ? (
                      <button
                        onClick={handleProceedToPayment}
                        className="w-full flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700"
                      >
                        Proceed to Payment
                      </button>
                    ) : (
                      <button
                        onClick={() => setIsCheckingOut(false)}
                        className="w-full flex justify-center items-center px-6 py-3 border border-gray-300 rounded-md shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        Back to Cart
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 