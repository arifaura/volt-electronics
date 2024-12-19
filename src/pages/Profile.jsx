import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { doc, updateDoc, collection, getDocs, addDoc, query, where, orderBy, writeBatch, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { toast } from 'react-hot-toast';
import { 
  UserCircleIcon, 
  ShoppingBagIcon, 
  KeyIcon,
  LocationMarkerIcon,
  BellIcon,
  CreditCardIcon,
  DeviceMobileIcon
} from '@heroicons/react/outline';
import { Link, useLocation } from 'react-router-dom';

export default function Profile() {
  const { user, updatePassword } = useAuth();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(() => {
    return location.state?.activeTab || 'profile';
  });
  const [loading, setLoading] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [savedCards, setSavedCards] = useState([]);
  const [showAddPayment, setShowAddPayment] = useState(false);

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    preferences: {
      notifications: {
        email: true,
        sms: false,
        orderUpdates: true,
        promotions: false,
        newsletter: true
      },
      language: 'English',
      currency: 'USD'
    }
  });

  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [newAddress, setNewAddress] = useState({
    type: 'home', // home, work, other
    name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    isDefault: false,
    instructions: '' // Delivery instructions
  });

  const fetchAddresses = async () => {
    try {
      const addressesRef = collection(db, `users/${user.uid}/addresses`);
      const snapshot = await getDocs(addressesRef);
      const addressList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAddresses(addressList);
    } catch (error) {
      console.error('Error fetching addresses:', error);
      toast.error('Failed to load addresses');
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, [user.uid]);

  const fetchOrders = async () => {
    if (activeTab === 'orders') {
      setOrdersLoading(true);
      try {
        const ordersRef = collection(db, 'orders');
        try {
          // Try with the indexed query first
          const q = query(
            ordersRef,
            where('customerInfo.userId', '==', user.uid),
            orderBy('createdAt', 'desc')
          );
          const snapshot = await getDocs(q);
          const ordersList = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate().toLocaleString()
          }));
          setOrders(ordersList);
        } catch (indexError) {
          if (indexError.code === 'failed-precondition') {
            // Fallback to a simple query while index is building
            console.warn('Index not ready, using fallback query');
            const simpleQuery = query(
              ordersRef,
              where('customerInfo.userId', '==', user.uid)
            );
            const snapshot = await getDocs(simpleQuery);
            const ordersList = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
              createdAt: doc.data().createdAt?.toDate().toLocaleString()
            }))
            .sort((a, b) => {
              const dateA = new Date(a.createdAt);
              const dateB = new Date(b.createdAt);
              return dateB - dateA;
            });
            setOrders(ordersList);
          } else {
            throw indexError;
          }
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
        toast.error('Failed to load orders');
        setOrders([]);
      } finally {
        setOrdersLoading(false);
      }
    }
  };

  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.state]);

  useEffect(() => {
    fetchOrders();
  }, [user.uid, activeTab]);

  useEffect(() => {
    const fetchCards = async () => {
      if (activeTab === 'payments') {
        try {
          const cardsRef = collection(db, `users/${user.uid}/paymentMethods`);
          const snapshot = await getDocs(cardsRef);
          const cardsList = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setSavedCards(cardsList);
        } catch (error) {
          console.error('Error fetching payment methods:', error);
          toast.error('Failed to load payment methods');
        }
      }
    };

    fetchCards();
  }, [user.uid, activeTab]);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (securityData.newPassword !== securityData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (securityData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      await updatePassword(securityData.currentPassword, securityData.newPassword);
      toast.success('Password updated successfully');
      setSecurityData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Password update error:', error);
      toast.error(error.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const addressesRef = collection(db, `users/${user.uid}/addresses`);
      
      if (newAddress.isDefault) {
        const snapshot = await getDocs(addressesRef);
        const batch = writeBatch(db);
        snapshot.docs.forEach((doc) => {
          batch.update(doc.ref, { isDefault: false });
        });
        await batch.commit();
      }

      await addDoc(addressesRef, {
        ...newAddress,
        createdAt: new Date().toISOString()
      });

      await fetchAddresses();
      toast.success('Address added successfully');
      setShowAddAddress(false);
      setNewAddress({
        type: 'home',
        name: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        isDefault: false,
        instructions: ''
      });
    } catch (error) {
      console.error('Error adding address:', error);
      toast.error('Failed to add address');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      try {
        const addressRef = doc(db, `users/${user.uid}/addresses/${addressId}`);
        await deleteDoc(addressRef);
        await fetchAddresses();
        toast.success('Address deleted successfully');
      } catch (error) {
        console.error('Error deleting address:', error);
        toast.error('Failed to delete address');
      }
    }
  };

  const [editingAddress, setEditingAddress] = useState(null);

  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setNewAddress(address);
    setShowAddAddress(true);
  };

  const handleUpdateAddress = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const addressRef = doc(db, `users/${user.uid}/addresses/${editingAddress.id}`);
      
      if (newAddress.isDefault) {
        const addressesRef = collection(db, `users/${user.uid}/addresses`);
        const snapshot = await getDocs(addressesRef);
        const batch = writeBatch(db);
        snapshot.docs.forEach((doc) => {
          if (doc.id !== editingAddress.id) {
            batch.update(doc.ref, { isDefault: false });
          }
        });
        await batch.commit();
      }

      await updateDoc(addressRef, {
        ...newAddress,
        updatedAt: new Date().toISOString()
      });

      await fetchAddresses();
      toast.success('Address updated successfully');
      setShowAddAddress(false);
      setEditingAddress(null);
      setNewAddress({
        type: 'home',
        name: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        isDefault: false,
        instructions: ''
      });
    } catch (error) {
      console.error('Error updating address:', error);
      toast.error('Failed to update address');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        name: profileData.name,
        phone: profileData.phone,
        preferences: profileData.preferences,
        updatedAt: new Date().toISOString()
      });

      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationChange = (key) => {
    setProfileData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        notifications: {
          ...prev.preferences.notifications,
          [key]: !prev.preferences.notifications[key]
        }
      }
    }));
  };

  const handlePreferenceChange = (key, value) => {
    setProfileData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [key]: value
      }
    }));
  };

  const getNotificationDescription = (key) => {
    const descriptions = {
      email: 'Receive order updates and notifications via email',
      sms: 'Get instant updates via text message',
      orderUpdates: 'Updates about your order status and delivery',
      promotions: 'Special offers and promotional messages',
      newsletter: 'Weekly newsletter with deals and new products'
    };
    return descriptions[key] || '';
  };

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

  const handleDeleteCard = async (cardId) => {
    if (window.confirm('Are you sure you want to remove this card?')) {
      try {
        const cardRef = doc(db, `users/${user.uid}/paymentMethods/${cardId}`);
        await deleteDoc(cardRef);
        setSavedCards(prev => prev.filter(card => card.id !== cardId));
        toast.success('Payment method removed successfully');
      } catch (error) {
        console.error('Error removing card:', error);
        toast.error('Failed to remove payment method');
      }
    }
  };

  const handleAddPayment = async (paymentDetails) => {
    try {
      const cardsRef = collection(db, `users/${user.uid}/paymentMethods`);
      
      if (paymentDetails.isDefault) {
        const snapshot = await getDocs(cardsRef);
        const batch = writeBatch(db);
        snapshot.docs.forEach((doc) => {
          batch.update(doc.ref, { isDefault: false });
        });
        await batch.commit();
      }

      await addDoc(cardsRef, {
        ...paymentDetails,
        createdAt: new Date().toISOString()
      });

      // Refresh the cards list
      const newSnapshot = await getDocs(cardsRef);
      const cardsList = newSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSavedCards(cardsList);
      
      setShowAddPayment(false);
      toast.success('Payment method added successfully');
    } catch (error) {
      console.error('Error adding payment method:', error);
      toast.error('Failed to add payment method');
    }
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: UserCircleIcon },
    { id: 'orders', name: 'Orders', icon: ShoppingBagIcon },
    { id: 'security', name: 'Security', icon: KeyIcon },
    { id: 'addresses', name: 'Addresses', icon: LocationMarkerIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'payments', name: 'Payment Methods', icon: CreditCardIcon }
  ];

  const getOrderStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-green-100 text-green-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status?.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="lg:grid lg:grid-cols-12 lg:gap-x-5">
        {/* Sidebar */}
        <aside className="py-6 px-2 sm:px-6 lg:col-span-3">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? 'bg-gray-50 text-blue-600'
                    : 'text-gray-900 hover:bg-gray-50'
                } group rounded-md px-3 py-2 flex items-center text-sm font-medium w-full`}
              >
                <tab.icon
                  className={`${
                    activeTab === tab.id ? 'text-blue-600' : 'text-gray-400'
                  } flex-shrink-0 -ml-1 mr-3 h-6 w-6`}
                />
                <span className="truncate">{tab.name}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <div className="space-y-6 sm:px-6 lg:col-span-9">
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileUpdate}>
              <div className="shadow sm:rounded-md sm:overflow-hidden">
                <div className="bg-white py-6 px-4 space-y-6 sm:p-6">
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Profile Information
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Update your personal information and contact details.
                    </p>
                  </div>

                  <div className="grid grid-cols-6 gap-6">
                    <div className="col-span-6 sm:col-span-3">
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        id="name"
                        value={profileData.name}
                        onChange={(e) => setProfileData(prev => ({
                          ...prev,
                          name: e.target.value
                        }))}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div className="col-span-6 sm:col-span-3">
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        id="email"
                        value={profileData.email}
                        disabled
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-50"
                      />
                    </div>

                    <div className="col-span-6 sm:col-span-3">
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        id="phone"
                        value={profileData.phone}
                        onChange={(e) => setProfileData(prev => ({
                          ...prev,
                          phone: e.target.value
                        }))}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div className="col-span-6">
                      <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                        Address
                      </label>
                      <input
                        type="text"
                        name="address"
                        id="address"
                        value={profileData.address}
                        onChange={(e) => setProfileData(prev => ({
                          ...prev,
                          address: e.target.value
                        }))}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div className="col-span-6 sm:col-span-2">
                      <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                        City
                      </label>
                      <input
                        type="text"
                        name="city"
                        id="city"
                        value={profileData.city}
                        onChange={(e) => setProfileData(prev => ({
                          ...prev,
                          city: e.target.value
                        }))}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div className="col-span-6 sm:col-span-2">
                      <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                        State
                      </label>
                      <input
                        type="text"
                        name="state"
                        id="state"
                        value={profileData.state}
                        onChange={(e) => setProfileData(prev => ({
                          ...prev,
                          state: e.target.value
                        }))}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div className="col-span-6 sm:col-span-2">
                      <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">
                        ZIP Code
                      </label>
                      <input
                        type="text"
                        name="zipCode"
                        id="zipCode"
                        value={profileData.zipCode}
                        onChange={(e) => setProfileData(prev => ({
                          ...prev,
                          zipCode: e.target.value
                        }))}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
                <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                      loading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </form>
          )}

          {activeTab === 'orders' && (
            <div className="bg-white shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Order History
                </h3>
                
                {ordersLoading ? (
                  <div className="py-10 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
                    <p className="mt-2 text-gray-600">Loading orders...</p>
                  </div>
                ) : orders.length > 0 ? (
                  <div className="mt-6 space-y-4">
                        {orders.map((order) => (
                      <div key={order.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              Order #{order.id.slice(-8)}
                            </p>
                            <p className="text-sm text-gray-500">{order.createdAt}</p>
                            <p className="text-sm text-gray-600 mt-1">
                              Ordered by: {order.customerInfo?.name || 'N/A'}
                            </p>
                          </div>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            getOrderStatusColor(order.status)
                          }`}>
                            {order.status}
                          </span>
                        </div>
                        <div className="mt-4">
                          <p className="text-sm text-gray-600">
                            {order.orderSummary?.itemCount || 0} items • 
                            Subtotal: ${order.orderSummary?.subtotal?.toFixed(2) || '0.00'} • 
                            Shipping: ${order.orderSummary?.shipping?.toFixed(2) || '0.00'}
                          </p>
                          <p className="text-sm font-medium text-gray-900 mt-1">
                            Total: ${order.orderSummary?.total?.toFixed(2) || '0.00'}
                          </p>
                        </div>
                        <div className="mt-4">
                          <Link
                            to={`/orders/${order.id}`}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            View Details →
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-10 text-center">
                    <p className="text-gray-500">No orders found</p>
                    <Link
                      to="/products"
                      className="mt-4 inline-block text-blue-600 hover:text-blue-800"
                    >
                      Start Shopping →
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="bg-white shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Security Settings
                </h3>
                
                {/* Password Change Form */}
                <div className="mt-6 max-w-xl">
                  <form onSubmit={handlePasswordChange} className="space-y-6">
                    <div>
                      <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                        Current Password
                      </label>
                      <input
                        type="password"
                        id="currentPassword"
                        name="currentPassword"
                        value={securityData.currentPassword}
                        onChange={(e) => setSecurityData(prev => ({
                          ...prev,
                          currentPassword: e.target.value
                        }))}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                        New Password
                      </label>
                      <input
                        type="password"
                        id="newPassword"
                        name="newPassword"
                        value={securityData.newPassword}
                        onChange={(e) => setSecurityData(prev => ({
                          ...prev,
                          newPassword: e.target.value
                        }))}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={securityData.confirmPassword}
                        onChange={(e) => setSecurityData(prev => ({
                          ...prev,
                          confirmPassword: e.target.value
                        }))}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    {/* Password Requirements */}
                    <div className="rounded-md bg-gray-50 p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <KeyIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-gray-800">Password requirements:</h3>
                          <div className="mt-2 text-sm text-gray-600">
                            <ul className="list-disc space-y-1 pl-5">
                              <li>Minimum 6 characters long</li>
                              <li>Include at least one number</li>
                              <li>Include at least one letter</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={loading}
                        className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                          loading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        {loading ? 'Updating...' : 'Update Password'}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Recent Activity */}
                <div className="mt-10">
                  <h4 className="text-lg font-medium text-gray-900">Recent Security Activity</h4>
                  <div className="mt-4 bg-gray-50 rounded-lg p-4">
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-gray-900">Last password change</p>
                          <p className="text-sm text-gray-500">
                            {user?.lastPasswordChange 
                              ? new Date(user.lastPasswordChange).toLocaleDateString()
                              : 'Never'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-gray-900">Last login</p>
                          <p className="text-sm text-gray-500">
                            {user?.lastLogin 
                              ? new Date(user.lastLogin).toLocaleDateString()
                              : 'Never'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'addresses' && (
            <div className="bg-white shadow sm:rounded-md">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Saved Addresses</h3>
                  <button
                    onClick={() => setShowAddAddress(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    Add New Address
                  </button>
                </div>

                {/* Address List */}
                <div className="space-y-4">
                  {addresses.map(address => (
                    <div key={address.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center">
                            <span className="text-sm font-medium text-gray-900">
                              {address.type.charAt(0).toUpperCase() + address.type.slice(1)}
                            </span>
                            {address.isDefault && (
                              <span className="ml-2 px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{address.name}</p>
                          <p className="text-sm text-gray-600">{address.phone}</p>
                          <p className="text-sm text-gray-600 mt-2">
                            {address.address}, {address.city}, {address.state} {address.zipCode}
                          </p>
                          {address.instructions && (
                            <p className="text-sm text-gray-500 mt-2">
                              Instructions: {address.instructions}
                            </p>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleEditAddress(address)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteAddress(address.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add New Address Modal */}
                {showAddAddress && (
                  <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                      <h4 className="text-lg font-medium text-gray-900 mb-4">Add New Address</h4>
                      <form onSubmit={handleAddAddress} className="space-y-4">
                        {/* Address Type */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Address Type</label>
                          <select
                            value={newAddress.type}
                            onChange={(e) => setNewAddress(prev => ({
                              ...prev,
                              type: e.target.value
                            }))}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                          >
                            <option value="home">Home</option>
                            <option value="work">Work</option>
                            <option value="other">Other</option>
                          </select>
                        </div>

                        {/* Contact Information */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Full Name</label>
                            <input
                              type="text"
                              value={newAddress.name}
                              onChange={(e) => setNewAddress(prev => ({
                                ...prev,
                                name: e.target.value
                              }))}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                            <input
                              type="tel"
                              value={newAddress.phone}
                              onChange={(e) => setNewAddress(prev => ({
                                ...prev,
                                phone: e.target.value
                              }))}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                            />
                          </div>
                        </div>

                        {/* Address Details */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Street Address</label>
                          <input
                            type="text"
                            value={newAddress.address}
                            onChange={(e) => setNewAddress(prev => ({
                              ...prev,
                              address: e.target.value
                            }))}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">City</label>
                            <input
                              type="text"
                              value={newAddress.city}
                              onChange={(e) => setNewAddress(prev => ({
                                ...prev,
                                city: e.target.value
                              }))}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
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
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">ZIP Code</label>
                            <input
                              type="text"
                              value={newAddress.zipCode}
                              onChange={(e) => setNewAddress(prev => ({
                                ...prev,
                                zipCode: e.target.value
                              }))}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                            />
                          </div>
                        </div>

                        {/* Delivery Instructions */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Delivery Instructions (Optional)
                          </label>
                          <textarea
                            value={newAddress.instructions}
                            onChange={(e) => setNewAddress(prev => ({
                              ...prev,
                              instructions: e.target.value
                            }))}
                            rows={3}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                            placeholder="E.g., Ring doorbell, leave at back door, etc."
                          />
                        </div>

                        {/* Set as Default */}
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="default-address"
                            checked={newAddress.isDefault}
                            onChange={(e) => setNewAddress(prev => ({
                              ...prev,
                              isDefault: e.target.checked
                            }))}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor="default-address" className="ml-2 text-sm text-gray-700">
                            Set as default address
                          </label>
                        </div>

                        <div className="flex justify-end space-x-3 mt-6">
                          <button
                            type="button"
                            onClick={() => setShowAddAddress(false)}
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                          >
                            {loading ? 'Adding...' : 'Add Address'}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="bg-white shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Notification Preferences
                </h3>
                <div className="mt-6 space-y-6">
                  <div className="space-y-4">
                    {Object.entries(profileData.preferences.notifications).map(([key, value]) => (
                      <div key={key} className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id={key}
                            name={key}
                            type="checkbox"
                            checked={value}
                            onChange={() => handleNotificationChange(key)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor={key} className="font-medium text-gray-700">
                            {key.split(/(?=[A-Z])/).join(' ')}
                          </label>
                          <p className="text-gray-500">
                            {getNotificationDescription(key)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6">
                    <button
                      onClick={handleProfileUpdate}
                      disabled={loading}
                      className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                        loading ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {loading ? 'Saving...' : 'Save Preferences'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="bg-white shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Payment Methods
                  </h3>
                  <button
                    onClick={() => setShowAddPayment(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Add Payment Method
                  </button>
        </div>

                <div className="mt-6 space-y-4">
                  {savedCards.map((card) => (
                    <div
                      key={card.id}
                      className="border rounded-lg p-4 flex justify-between items-center"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="text-2xl">
                          {getCardIcon(card.brand)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            •••• •••• •••• {card.last4}
                          </p>
                          <p className="text-sm text-gray-500">
                            Expires {card.expMonth}/{card.expYear}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        {card.isDefault && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Default
                          </span>
                        )}
                        <button
                          onClick={() => handleDeleteCard(card.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}

                  {savedCards.length === 0 && (
                    <div className="text-center py-6">
                      <p className="text-sm text-gray-500">No payment methods added yet</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 