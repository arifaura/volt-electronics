import { createContext, useContext, useState } from 'react';
import { toast } from 'react-hot-toast';

const CouponContext = createContext();

export function CouponProvider({ children }) {
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  // Define available coupons
  const coupons = {
    'WELCOME10': { discount: 0.10, description: '10% off your first order' },
    'SUMMER20': { discount: 0.20, description: '20% off summer sale' },
    'FLASH50': { discount: 0.50, description: '50% off flash sale' }
  };

  const applyCoupon = (code) => {
    const coupon = coupons[code.toUpperCase()];
    if (coupon) {
      setAppliedCoupon({ code: code.toUpperCase(), ...coupon });
      toast.success(`Coupon applied: ${coupon.description}`, {
        style: {
          background: 'var(--background)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border)',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
        },
        iconTheme: {
          primary: '#2563eb',
          secondary: '#ffffff',
        },
      });
      return true;
    } else {
      toast.error('Invalid coupon code', {
        style: {
          background: 'var(--background)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border)',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
        },
      });
      return false;
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  return (
    <CouponContext.Provider value={{ appliedCoupon, applyCoupon, removeCoupon }}>
      {children}
    </CouponContext.Provider>
  );
}

export const useCoupon = () => useContext(CouponContext); 