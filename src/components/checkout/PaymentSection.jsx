import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { collection, getDocs, addDoc, writeBatch, doc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { toast } from 'react-hot-toast';
import {
  CreditCardIcon,
  PlusCircleIcon,
  LockClosedIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  UserCircleIcon
} from '@heroicons/react/outline';

export default function PaymentSection({ onPaymentComplete, total }) {
  const { user } = useAuth();
  const [savedCards, setSavedCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [showNewCardForm, setShowNewCardForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [newCard, setNewCard] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    saveCard: true
  });

  // Fetch saved cards
  useEffect(() => {
    const fetchCards = async () => {
      try {
        const cardsRef = collection(db, `users/${user.uid}/paymentMethods`);
        const snapshot = await getDocs(cardsRef);
        const cardsList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setSavedCards(cardsList);
        // Auto-select default card if exists
        const defaultCard = cardsList.find(card => card.isDefault);
        if (defaultCard) setSelectedCard(defaultCard);
      } catch (error) {
        console.error('Error fetching payment methods:', error);
        toast.error('Failed to load payment methods');
      }
    };

    fetchCards();
  }, [user.uid]);

  const validateCard = () => {
    if (!newCard.cardNumber || newCard.cardNumber.length < 15) {
      setPaymentError('Invalid card number');
      return false;
    }
    if (!newCard.cardHolder) {
      setPaymentError('Please enter cardholder name');
      return false;
    }
    if (!newCard.expiryMonth || !newCard.expiryYear) {
      setPaymentError('Invalid expiry date');
      return false;
    }
    if (!newCard.cvv || newCard.cvv.length < 3) {
      setPaymentError('Invalid CVV');
      return false;
    }
    return true;
  };

  const handlePayment = async () => {
    setLoading(true);
    setPaymentError(null);

    try {
      if (!selectedCard && !showNewCardForm) {
        throw new Error('Please select a payment method');
      }

      if (showNewCardForm && !validateCard()) {
        setLoading(false);
        return;
      }

      // If using new card and save card is checked, save it
      if (showNewCardForm && newCard.saveCard) {
        const cardsRef = collection(db, `users/${user.uid}/paymentMethods`);
        const cardData = {
          last4: newCard.cardNumber.slice(-4),
          cardHolder: newCard.cardHolder,
          expMonth: newCard.expiryMonth,
          expYear: newCard.expiryYear,
          brand: getCardBrand(newCard.cardNumber),
          isDefault: savedCards.length === 0, // Make default if it's the first card
          createdAt: new Date().toISOString()
        };

        await addDoc(cardsRef, cardData);
      }

      // Payment successful - call the completion handler
      await onPaymentComplete({
        paymentMethod: showNewCardForm ? 'new_card' : 'saved_card',
        card: showNewCardForm ? {
          last4: newCard.cardNumber.slice(-4),
          brand: getCardBrand(newCard.cardNumber)
        } : selectedCard
      });

      // Don't show success toast here as it will be shown by the Cart component
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentError(error.message || 'Payment failed. Please try again.');
      toast.error(error.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  const getCardBrand = (number) => {
    if (number.startsWith('4')) return 'visa';
    if (['51', '52', '53', '54', '55'].includes(number.substring(0, 2))) return 'mastercard';
    if (['34', '37'].includes(number.substring(0, 2))) return 'amex';
    return 'unknown';
  };

  return (
    <div className="mt-8">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Payment Method</h3>
          <p className="mt-1 text-sm text-gray-500">Secure payment processing</p>
        </div>

        <div className="px-6 py-4">
          {/* Saved Cards Section */}
          {savedCards.length > 0 && !showNewCardForm && (
            <div className="space-y-4">
              {savedCards.map((card) => (
                <div
                  key={card.id}
                  onClick={() => setSelectedCard(card)}
                  className={`relative flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedCard?.id === card.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-200'
                  }`}
                >
                  <input
                    type="radio"
                    checked={selectedCard?.id === card.id}
                    onChange={() => setSelectedCard(card)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <div className="ml-4 flex-1">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-900">
                        •••• {card.last4}
                      </span>
                      {card.isDefault && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      Expires {card.expMonth}/{card.expYear}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add New Card Button */}
          {!showNewCardForm && (
            <button
              onClick={() => setShowNewCardForm(true)}
              className="mt-4 flex items-center text-blue-600 hover:text-blue-700"
            >
              <PlusCircleIcon className="h-5 w-5 mr-2" />
              {savedCards.length > 0 ? 'Use a different card' : 'Add a card'}
            </button>
          )}

          {/* New Card Form */}
          {showNewCardForm && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Card Number</label>
                <div className="mt-1 relative">
                  <input
                    type="text"
                    maxLength="16"
                    value={newCard.cardNumber}
                    onChange={(e) => setNewCard(prev => ({
                      ...prev,
                      cardNumber: e.target.value.replace(/\D/g, '').slice(0, 16)
                    }))}
                    className="pl-10 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="1234 5678 9012 3456"
                  />
                  <CreditCardIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Cardholder Name</label>
                <div className="mt-1 relative">
                  <input
                    type="text"
                    value={newCard.cardHolder}
                    onChange={(e) => setNewCard(prev => ({
                      ...prev,
                      cardHolder: e.target.value
                    }))}
                    className="pl-10 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="John Doe"
                  />
                  <UserCircleIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Month</label>
                  <select
                    value={newCard.expiryMonth}
                    onChange={(e) => setNewCard(prev => ({
                      ...prev,
                      expiryMonth: e.target.value
                    }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">MM</option>
                    {Array.from({ length: 12 }, (_, i) => {
                      const month = (i + 1).toString().padStart(2, '0');
                      return (
                        <option key={month} value={month}>
                          {month}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Year</label>
                  <select
                    value={newCard.expiryYear}
                    onChange={(e) => setNewCard(prev => ({
                      ...prev,
                      expiryYear: e.target.value
                    }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">YYYY</option>
                    {Array.from({ length: 10 }, (_, i) => {
                      const year = (new Date().getFullYear() + i).toString();
                      return (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">CVV</label>
                  <div className="mt-1 relative">
                    <input
                      type="text"
                      maxLength="4"
                      value={newCard.cvv}
                      onChange={(e) => setNewCard(prev => ({
                        ...prev,
                        cvv: e.target.value.replace(/\D/g, '').slice(0, 4)
                      }))}
                      className="pl-10 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="123"
                    />
                    <LockClosedIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="save-card"
                  checked={newCard.saveCard}
                  onChange={(e) => setNewCard(prev => ({
                    ...prev,
                    saveCard: e.target.checked
                  }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="save-card" className="ml-2 text-sm text-gray-700">
                  Save this card for future purchases
                </label>
              </div>

              <button
                type="button"
                onClick={() => setShowNewCardForm(false)}
                className="mt-2 text-sm text-gray-600 hover:text-gray-800"
              >
                ← Back to saved cards
              </button>
            </div>
          )}

          {/* Error Message */}
          {paymentError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center">
                <ExclamationCircleIcon className="h-5 w-5 text-red-400 mr-2" />
                <span className="text-sm text-red-700">{paymentError}</span>
              </div>
            </div>
          )}

          {/* Payment Button */}
          <div className="mt-6">
            <button
              onClick={handlePayment}
              disabled={loading}
              className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <LockClosedIcon className="h-5 w-5 mr-2" />
                  Pay ${total.toFixed(2)}
                </>
              )}
            </button>
          </div>

          {/* Security Notice */}
          <div className="mt-4 flex items-center justify-center text-sm text-gray-500">
            <LockClosedIcon className="h-4 w-4 mr-1" />
            <span>Payments are secure and encrypted</span>
          </div>
        </div>
      </div>
    </div>
  );
} 