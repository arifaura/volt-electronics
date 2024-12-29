import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { collection, getDocs, addDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { toast } from 'react-hot-toast';
import {
  LocationMarkerIcon,
  PlusCircleIcon,
  CheckCircleIcon,
  HomeIcon
} from '@heroicons/react/outline';

export default function AddressSection({ onAddressSelect }) {
  const { user } = useAuth();
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newAddress, setNewAddress] = useState({
    fullName: '',
    streetAddress: '',
    city: '',
    state: '',
    postalCode: '',
    phone: '',
    isDefault: false
  });

  // Fetch saved addresses
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const addressesRef = collection(db, `users/${user.uid}/addresses`);
        const snapshot = await getDocs(addressesRef);
        const addressList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setSavedAddresses(addressList);
        // Auto-select default address if exists
        const defaultAddress = addressList.find(addr => addr.isDefault);
        if (defaultAddress) {
          setSelectedAddress(defaultAddress);
          onAddressSelect(defaultAddress);
        }
      } catch (error) {
        console.error('Error fetching addresses:', error);
        toast.error('Failed to load delivery addresses');
      }
    };

    fetchAddresses();
  }, [user.uid, onAddressSelect]);

  const validateAddress = () => {
    const required = ['fullName', 'streetAddress', 'city', 'state', 'postalCode', 'phone'];
    for (const field of required) {
      if (!newAddress[field]) {
        toast.error(`Please enter ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return false;
      }
    }
    return true;
  };

  const handleAddressSelect = (address) => {
    setSelectedAddress(address);
    onAddressSelect(address);
  };

  const handleNewAddressSubmit = async (e) => {
    e.preventDefault();
    if (!validateAddress()) return;

    setLoading(true);
    try {
      const addressesRef = collection(db, `users/${user.uid}/addresses`);
      
      // If this is the first address or marked as default, update other addresses
      if (newAddress.isDefault || savedAddresses.length === 0) {
        const batch = db.batch();
        const snapshot = await getDocs(addressesRef);
        snapshot.docs.forEach((doc) => {
          batch.update(doc.ref, { isDefault: false });
        });
        await batch.commit();
      }

      // Add the new address
      const addressData = {
        ...newAddress,
        isDefault: newAddress.isDefault || savedAddresses.length === 0,
        createdAt: new Date().toISOString()
      };

      const docRef = await addDoc(addressesRef, addressData);
      const newAddressWithId = { id: docRef.id, ...addressData };
      
      setSavedAddresses(prev => [...prev, newAddressWithId]);
      setSelectedAddress(newAddressWithId);
      onAddressSelect(newAddressWithId);
      setShowNewAddressForm(false);
      toast.success('Address added successfully');
    } catch (error) {
      console.error('Error adding address:', error);
      toast.error('Failed to add address');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Delivery Address</h3>
          <p className="mt-1 text-sm text-gray-500">Select a delivery address</p>
        </div>

        <div className="px-6 py-4">
          {/* Saved Addresses Section */}
          {savedAddresses.length > 0 && !showNewAddressForm && (
            <div className="space-y-4">
              {savedAddresses.map((address) => (
                <div
                  key={address.id}
                  onClick={() => handleAddressSelect(address)}
                  className={`relative flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedAddress?.id === address.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-200'
                  }`}
                >
                  <input
                    type="radio"
                    checked={selectedAddress?.id === address.id}
                    onChange={() => handleAddressSelect(address)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <div className="ml-4 flex-1">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-900">
                        {address.fullName}
                      </span>
                      {address.isDefault && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      {address.streetAddress}
                    </p>
                    <p className="text-sm text-gray-500">
                      {address.city}, {address.state} {address.postalCode}
                    </p>
                    <p className="text-sm text-gray-500">
                      Phone: {address.phone}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add New Address Button */}
          {!showNewAddressForm && (
            <button
              onClick={() => setShowNewAddressForm(true)}
              className="mt-4 flex items-center text-blue-600 hover:text-blue-700"
            >
              <PlusCircleIcon className="h-5 w-5 mr-2" />
              {savedAddresses.length > 0 ? 'Use a different address' : 'Add an address'}
            </button>
          )}

          {/* New Address Form */}
          {showNewAddressForm && (
            <form onSubmit={handleNewAddressSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input
                  type="text"
                  value={newAddress.fullName}
                  onChange={(e) => setNewAddress(prev => ({
                    ...prev,
                    fullName: e.target.value
                  }))}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Street Address</label>
                <input
                  type="text"
                  value={newAddress.streetAddress}
                  onChange={(e) => setNewAddress(prev => ({
                    ...prev,
                    streetAddress: e.target.value
                  }))}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="123 Main St"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">City</label>
                  <input
                    type="text"
                    value={newAddress.city}
                    onChange={(e) => setNewAddress(prev => ({
                      ...prev,
                      city: e.target.value
                    }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="City"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">State</label>
                  <input
                    type="text"
                    value={newAddress.state}
                    onChange={(e) => setNewAddress(prev => ({
                      ...prev,
                      state: e.target.value
                    }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="State"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Postal Code</label>
                  <input
                    type="text"
                    value={newAddress.postalCode}
                    onChange={(e) => setNewAddress(prev => ({
                      ...prev,
                      postalCode: e.target.value.replace(/\D/g, '').slice(0, 6)
                    }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Postal Code"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                  <input
                    type="tel"
                    value={newAddress.phone}
                    onChange={(e) => setNewAddress(prev => ({
                      ...prev,
                      phone: e.target.value.replace(/\D/g, '').slice(0, 10)
                    }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Phone Number"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={newAddress.isDefault}
                  onChange={(e) => setNewAddress(prev => ({
                    ...prev,
                    isDefault: e.target.checked
                  }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isDefault" className="ml-2 text-sm text-gray-700">
                  Set as default address
                </label>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowNewAddressForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    loading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {loading ? 'Adding...' : 'Add Address'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
} 