import { useState } from 'react';
import { motion } from 'framer-motion';
import { useCoupon } from '../context/CouponContext';
import { XCircleIcon } from '@heroicons/react/solid';

export default function CouponInput() {
  const [code, setCode] = useState('');
  const { appliedCoupon, applyCoupon, removeCoupon } = useCoupon();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (code.trim()) {
      applyCoupon(code);
      setCode('');
    }
  };

  return (
    <div className="mt-4">
      {appliedCoupon ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between p-3 bg-gray-100/80 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm backdrop-blur-sm"
        >
          <div>
            <span className="text-sm font-medium text-gray-800 dark:text-gray-100">
              Coupon applied: {appliedCoupon.code}
            </span>
            <p className="text-xs text-gray-600 dark:text-gray-300">
              {appliedCoupon.description}
            </p>
          </div>
          <button
            onClick={removeCoupon}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            <XCircleIcon className="h-5 w-5" />
          </button>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter coupon code"
            className="flex-1 px-4 py-2 border border-border rounded-lg bg-input-bg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-hover"
          >
            Apply
          </motion.button>
        </form>
      )}
    </div>
  );
} 