import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { ShoppingBagIcon, XIcon, PlusIcon, MinusIcon } from '@heroicons/react/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import PaymentSection from '../components/checkout/PaymentSection';
import AddressSection from '../components/checkout/AddressSection';
import { useCoupon } from '../context/CouponContext';
import CouponInput from '../components/CouponInput';
import SuccessModal from '../components/modals/SuccessModal';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  },
  exit: { opacity: 0 }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 }
  },
  exit: {
    opacity: 0,
    x: -100,
    transition: { duration: 0.2 }
  }
};

export default function Cart() {
  const { items = [], removeFromCart, updateQuantity, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentProcessed, setPaymentProcessed] = useState(false);
  const { appliedCoupon, removeCoupon } = useCoupon();
  const [showSuccessModal, setShowSuccessModal] = useState(false);

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

      setLoading(true);
      const now = serverTimestamp();

      // Create the order with payment details and address
      const orderData = {
        items: items,
        userId: user.uid,
        customerInfo: {
          name: user.name || user.displayName,
          email: user.email
        },
        name: user.name || user.displayName,
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
        createdAt: now,
        processingAt: null,
        packagedAt: null,
        shippedAt: null,
        deliveredAt: null
      };

      // Create the order in Firestore
      const ordersRef = collection(db, 'orders');
      const orderRef = await addDoc(ordersRef, orderData);

      // Show success modal first
      setShowSuccessModal(true);
      
      // Wait for a moment before clearing cart and navigating
      setTimeout(() => {
        // Clear cart and local storage
        clearCart();
        localStorage.removeItem('cartItems');
        removeCoupon();
        setPaymentProcessed(true);
        
        navigate('/profile', { state: { activeTab: 'orders' } });
      }, 3000);

    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
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
  const discount = appliedCoupon ? subtotal * appliedCoupon.discount : 0;
  const total = subtotal - discount + shipping;

  if (!items || items.length === 0) {
    return (
      <motion.div 
        className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-card-bg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="text-center p-8 rounded-2xl bg-card-bg shadow-xl max-w-md mx-auto">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <ShoppingBagIcon className="mx-auto h-16 w-16 text-accent opacity-80" />
          </motion.div>
          <motion.h2 
            className="mt-4 text-2xl font-bold text-text-primary"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Your cart is empty
          </motion.h2>
          <motion.p 
            className="mt-2 text-text-secondary"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Start adding some awesome products!
          </motion.p>
          <motion.div 
            className="mt-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Link
              to="/products"
              className="inline-flex items-center px-6 py-3 rounded-full bg-accent text-white hover:bg-accent-hover transform hover:scale-105 transition-all duration-300"
            >
              Continue Shopping
            </Link>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  return (
    <>
      <AnimatePresence mode="wait">
        {showSuccessModal && <SuccessModal />}
      </AnimatePresence>

      <motion.div 
        className="min-h-screen bg-gradient-to-br from-background to-card-bg py-12 px-4 sm:px-6 lg:px-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <div className="max-w-7xl mx-auto">
          <motion.h1 
            className="text-4xl font-bold text-text-primary mb-12 text-center"
            variants={itemVariants}
          >
            Your Shopping Cart
          </motion.h1>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Cart Items Section */}
            <motion.div 
              className="lg:col-span-8 space-y-6"
              variants={itemVariants}
            >
              <AnimatePresence>
                {items.map((item) => (
                  <motion.div
                    key={item?.id}
                    variants={itemVariants}
                    layout
                    className="bg-card-bg rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                  >
                    <div className="p-6 flex items-center space-x-6">
                      <motion.div 
                        className="relative w-24 h-24 flex-shrink-0"
                        whileHover={{ scale: 1.05 }}
                      >
                        <img
                          src={item?.image}
                          alt={item?.title}
                          className="w-full h-full object-contain rounded-lg"
                        />
                      </motion.div>

                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-medium text-text-primary truncate">
                          {item?.title}
                        </h3>
                        <p className="mt-1 text-accent font-semibold">
                          ${(item?.price || 0).toFixed(2)}
                        </p>

                        <div className="mt-4 flex items-center space-x-4">
                          <div className="flex items-center bg-background rounded-full">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleQuantityChange(item?.id, (item?.quantity || 0) - 1)}
                              className="p-2 text-text-secondary hover:text-accent"
                            >
                              <MinusIcon className="h-5 w-5" />
                            </motion.button>
                            <span className="mx-4 text-text-primary font-medium">
                              {item?.quantity || 0}
                            </span>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleQuantityChange(item?.id, (item?.quantity || 0) + 1)}
                              className="p-2 text-text-secondary hover:text-accent"
                            >
                              <PlusIcon className="h-5 w-5" />
                            </motion.button>
                          </div>

                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleRemoveItem(item?.id)}
                            className="p-2 text-red-500 hover:text-red-600 rounded-full hover:bg-red-50"
                          >
                            <XIcon className="h-5 w-5" />
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {!isCheckingOut && (
                <motion.div variants={itemVariants}>
                  <AddressSection onAddressSelect={handleAddressSelect} />
                </motion.div>
              )}

              {isCheckingOut && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <PaymentSection
                    onPaymentComplete={handlePaymentComplete}
                    total={total}
                  />
                </motion.div>
              )}
            </motion.div>

            {/* Order Summary Section */}
            <motion.div 
              className="lg:col-span-4"
              variants={itemVariants}
            >
              <div className="bg-card-bg rounded-xl shadow-lg p-6 sticky top-24">
                <h2 className="text-2xl font-bold text-text-primary mb-6">
                  Order Summary
                </h2>
                
                <div className="space-y-4">
                  <div className="flex justify-between text-text-secondary">
                    <span>Subtotal</span>
                    <span className="font-medium text-text-primary">
                      ${subtotal.toFixed(2)}
                    </span>
                  </div>

                  <CouponInput />

                  {appliedCoupon && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-between text-gray-700 dark:text-gray-300 font-medium"
                    >
                      <span>Discount ({appliedCoupon.code})</span>
                      <span>-${discount.toFixed(2)}</span>
                    </motion.div>
                  )}

                  <div className="flex justify-between text-text-secondary">
                    <div>
                      <span>Shipping</span>
                      {subtotal > 500 && (
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Free shipping on orders over $500!
                        </p>
                      )}
                    </div>
                    <span className="font-medium text-text-primary">
                      {shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}
                    </span>
                  </div>

                  <div className="border-t border-border pt-4 mt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-text-primary">
                        Total
                      </span>
                      <span className="text-xl font-bold text-accent">
                        ${(subtotal - discount + shipping).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {subtotal < 500 && (
                    <motion.div
                      className="text-sm text-text-secondary bg-background p-4 rounded-lg"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      Add ${(500 - subtotal).toFixed(2)} more for free shipping!
                    </motion.div>
                  )}

                  <motion.div
                    className="mt-6"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {!isCheckingOut ? (
                      <button
                        onClick={handleProceedToPayment}
                        className="w-full py-4 bg-accent text-white rounded-xl font-medium hover:bg-accent-hover transform transition-all duration-300"
                      >
                        Proceed to Payment
                      </button>
                    ) : (
                      <button
                        onClick={() => setIsCheckingOut(false)}
                        disabled={loading}
                        className="w-full py-4 border border-border text-text-primary rounded-xl font-medium hover:bg-background transform transition-all duration-300"
                      >
                        {loading ? 'Processing...' : 'Back to Cart'}
                      </button>
                    )}
                  </motion.div>

                  <div className="mt-4 bg-background rounded-lg p-4">
                    <p className="font-medium text-text-primary mb-2">
                      Available Coupons:
                    </p>
                    <ul className="space-y-2 text-sm text-text-secondary">
                      <li className="flex items-center">
                        <span className="font-mono bg-card-bg px-2 py-1 rounded mr-2">
                          WELCOME10
                        </span>
                        10% off your first order
                      </li>
                      <li className="flex items-center">
                        <span className="font-mono bg-card-bg px-2 py-1 rounded mr-2">
                          SUMMER20
                        </span>
                        20% off summer sale
                      </li>
                      <li className="flex items-center">
                        <span className="font-mono bg-card-bg px-2 py-1 rounded mr-2">
                          FLASH50
                        </span>
                        50% off flash sale
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </>
  );
} 