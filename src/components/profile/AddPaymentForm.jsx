import { useState } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

const formVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

const inputVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  }
};

const buttonVariants = {
  hover: {
    scale: 1.02,
    transition: {
      duration: 0.2
    }
  },
  tap: {
    scale: 0.98
  }
};

export default function AddPaymentForm({ onSubmit, onCancel }) {
  const [cardData, setCardData] = useState({
    cardNumber: '',
    cardHolder: '',
    expMonth: '',
    expYear: '',
    cvv: '',
    isDefault: false
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...cardData,
      last4: cardData.cardNumber.slice(-4),
      brand: detectCardType(cardData.cardNumber)
    });
  };

  const detectCardType = (number) => {
    if (number.startsWith('4')) return 'visa';
    if (number.startsWith('5')) return 'mastercard';
    if (number.startsWith('34') || number.startsWith('37')) return 'amex';
    return 'unknown';
  };

  return (
    <motion.form 
      onSubmit={handleSubmit} 
      className="space-y-4"
      initial="hidden"
      animate="visible"
      variants={formVariants}
    >
      <motion.div variants={inputVariants}>
        <label className="block text-sm font-medium text-gray-700">Card Number</label>
        <motion.input
          type="text"
          maxLength="16"
          value={cardData.cardNumber}
          onChange={(e) => setCardData(prev => ({
            ...prev,
            cardNumber: e.target.value.replace(/\D/g, '')
          }))}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
          required
          whileFocus={{ scale: 1.01, boxShadow: "0 0 0 2px rgba(59, 130, 246, 0.2)" }}
        />
      </motion.div>

      <motion.div variants={inputVariants}>
        <label className="block text-sm font-medium text-gray-700">Card Holder Name</label>
        <motion.input
          type="text"
          value={cardData.cardHolder}
          onChange={(e) => setCardData(prev => ({
            ...prev,
            cardHolder: e.target.value
          }))}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
          required
          whileFocus={{ scale: 1.01, boxShadow: "0 0 0 2px rgba(59, 130, 246, 0.2)" }}
        />
      </motion.div>

      <motion.div 
        className="grid grid-cols-3 gap-4"
        variants={inputVariants}
      >
        <div>
          <label className="block text-sm font-medium text-gray-700">Month</label>
          <motion.input
            type="text"
            maxLength="2"
            value={cardData.expMonth}
            onChange={(e) => setCardData(prev => ({
              ...prev,
              expMonth: e.target.value.replace(/\D/g, '')
            }))}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
            required
            whileFocus={{ scale: 1.01, boxShadow: "0 0 0 2px rgba(59, 130, 246, 0.2)" }}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Year</label>
          <motion.input
            type="text"
            maxLength="2"
            value={cardData.expYear}
            onChange={(e) => setCardData(prev => ({
              ...prev,
              expYear: e.target.value.replace(/\D/g, '')
            }))}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
            required
            whileFocus={{ scale: 1.01, boxShadow: "0 0 0 2px rgba(59, 130, 246, 0.2)" }}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">CVV</label>
          <motion.input
            type="text"
            maxLength="4"
            value={cardData.cvv}
            onChange={(e) => setCardData(prev => ({
              ...prev,
              cvv: e.target.value.replace(/\D/g, '')
            }))}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
            required
            whileFocus={{ scale: 1.01, boxShadow: "0 0 0 2px rgba(59, 130, 246, 0.2)" }}
          />
        </div>
      </motion.div>

      <motion.div 
        className="flex items-center"
        variants={inputVariants}
      >
        <motion.input
          type="checkbox"
          id="default-card"
          checked={cardData.isDefault}
          onChange={(e) => setCardData(prev => ({
            ...prev,
            isDefault: e.target.checked
          }))}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        />
        <motion.label 
          htmlFor="default-card" 
          className="ml-2 text-sm text-gray-700"
          whileHover={{ color: "#2563EB" }}
        >
          Set as default payment method
        </motion.label>
      </motion.div>

      <motion.div 
        className="flex justify-end space-x-3"
        variants={inputVariants}
      >
        <motion.button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
        >
          Cancel
        </motion.button>
        <motion.button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
        >
          Add Card
        </motion.button>
      </motion.div>
    </motion.form>
  );
}

AddPaymentForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired
}; 