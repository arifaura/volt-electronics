import { useState } from 'react';
import PropTypes from 'prop-types';

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
    // Basic card type detection
    if (number.startsWith('4')) return 'visa';
    if (number.startsWith('5')) return 'mastercard';
    if (number.startsWith('34') || number.startsWith('37')) return 'amex';
    return 'unknown';
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Card Number</label>
        <input
          type="text"
          maxLength="16"
          value={cardData.cardNumber}
          onChange={(e) => setCardData(prev => ({
            ...prev,
            cardNumber: e.target.value.replace(/\D/g, '')
          }))}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Card Holder Name</label>
        <input
          type="text"
          value={cardData.cardHolder}
          onChange={(e) => setCardData(prev => ({
            ...prev,
            cardHolder: e.target.value
          }))}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
          required
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Month</label>
          <input
            type="text"
            maxLength="2"
            value={cardData.expMonth}
            onChange={(e) => setCardData(prev => ({
              ...prev,
              expMonth: e.target.value.replace(/\D/g, '')
            }))}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Year</label>
          <input
            type="text"
            maxLength="2"
            value={cardData.expYear}
            onChange={(e) => setCardData(prev => ({
              ...prev,
              expYear: e.target.value.replace(/\D/g, '')
            }))}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">CVV</label>
          <input
            type="text"
            maxLength="4"
            value={cardData.cvv}
            onChange={(e) => setCardData(prev => ({
              ...prev,
              cvv: e.target.value.replace(/\D/g, '')
            }))}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
            required
          />
        </div>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="default-card"
          checked={cardData.isDefault}
          onChange={(e) => setCardData(prev => ({
            ...prev,
            isDefault: e.target.checked
          }))}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="default-card" className="ml-2 text-sm text-gray-700">
          Set as default payment method
        </label>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Add Card
        </button>
      </div>
    </form>
  );
}

AddPaymentForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired
}; 