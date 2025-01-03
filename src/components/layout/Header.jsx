import { Link, useLocation } from 'react-router-dom';
import { Disclosure, Menu } from '@headlessui/react';
import { 
  ShoppingCartIcon,
  MenuIcon,
  XIcon,
  UserCircleIcon,
  LogoutIcon,
  ChartBarIcon,
  SunIcon,
  MoonIcon
} from '@heroicons/react/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import logo from '../../assets/images/logo1.svg';

const navItemVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.2,
      ease: "easeOut"
    }
  }
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const logoVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

export default function Header() {
  const { items = [] } = useCart();
  const { user, logout, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const isAdminRoute = location.pathname.startsWith('/admin');
  
  // Different navigation items for admin and customer
  const customerNavigation = [
    { name: 'Home', href: '/', current: false },
    { name: 'Products', href: '/products', current: false },
    { name: 'About Us', href: '/about', current: false },
    { name: 'Services', href: '/services', current: false },
    { name: 'Contact', href: '/contact', current: false },
  ];

  const adminNavigation = [
    { name: 'Dashboard', href: '/admin/dashboard', current: false },
    { name: 'Messages', href: '/admin/messages', current: false },
    { name: 'Orders', href: '/admin/orders', current: false },
    { name: 'Customers', href: '/admin/customers', current: false },
    { name: 'Analytics', href: '/admin/analytics', current: false },
    { name: 'Settings', href: '/admin/settings', current: false },
  ];

  const navigation = isAdminRoute ? adminNavigation : customerNavigation;

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Don't render anything while checking auth state
  if (loading) return null;

  // Don't show header on auth pages
  if (
    location.pathname === '/login' ||
    location.pathname === '/signup' ||
    location.pathname === '/forgot-password' ||
    location.pathname === '/admin/login' ||
    location.pathname === '/admin/signup' ||
    location.pathname === '/admin/forgot-password'
  ) {
    return null;
  }

  return (
    <>
      <Disclosure as="nav" className="bg-card-bg border-b border-border shadow-lg fixed w-full top-0 left-0 right-0 z-[50]">
      {({ open }) => (
        <>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              {/* Logo and Navigation */}
              <div className="flex items-center">
                <motion.div 
                  className="flex-shrink-0"
                  initial="hidden"
                  animate="visible"
                  variants={logoVariants}
                >
                  <Link to={user?.role === 'admin' ? '/admin/dashboard' : '/'}>
                    <img
                      className="h-8 w-auto"
                      src={logo}
                      alt="Volt Electricals"
                    />
                  </Link>
                </motion.div>
                <motion.div 
                  className="hidden sm:ml-6 sm:flex sm:space-x-8"
                  initial="hidden"
                  animate="visible"
                  variants={containerVariants}
                >
                  {!isAdminRoute && customerNavigation.map((item) => (
                    <motion.div
                      key={item.name}
                      variants={navItemVariants}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Link
                        to={item.href}
                        className="text-text-primary hover:text-accent px-3 py-2 rounded-md text-sm font-medium"
                      >
                        {item.name}
                      </Link>
                    </motion.div>
                  ))}
                  {user && isAdminRoute && adminNavigation.map((item) => (
                    <motion.div
                      key={item.name}
                      variants={navItemVariants}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Link
                        to={item.href}
                        className="text-text-primary hover:text-accent px-3 py-2 rounded-md text-sm font-medium"
                      >
                        {item.name}
                      </Link>
                    </motion.div>
                  ))}
                </motion.div>
              </div>

              {/* Desktop Right Section */}
              <motion.div 
                className="hidden sm:flex sm:items-center sm:space-x-4"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
              >
                {/* Theme Toggle Button */}
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-md text-text-primary hover:text-accent focus:outline-none"
                >
                  {theme === 'dark' ? (
                    <SunIcon className="h-6 w-6" aria-hidden="true" />
                  ) : (
                    <MoonIcon className="h-6 w-6" aria-hidden="true" />
                  )}
                </button>

                {user ? (
                  <div className="flex items-center space-x-4">
                    {user.role === 'admin' && (
                      <Link
                        to="/admin/dashboard"
                        className="flex items-center text-text-primary hover:text-accent"
                      >
                        <ChartBarIcon className="h-6 w-6" />
                      </Link>
                    )}
                    <Menu as="div" className="relative">
                      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        <Menu.Button className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent">
                          <span className="sr-only">Open user menu</span>
                          <UserCircleIcon className="h-8 w-8 text-text-primary" />
                        </Menu.Button>
                      </motion.div>
                      <AnimatePresence>
                        <Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-card-bg ring-1 ring-black ring-opacity-5 focus:outline-none z-[100]">
                          <motion.div 
                            className="py-1"
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Menu.Item>
                              {({ active }) => (
                                <motion.div whileHover={{ x: 5 }}>
                                  <Link
                                    to={user.role === 'admin' ? '/admin/settings' : '/profile'}
                                    className={`${
                                      active ? 'bg-background' : ''
                                    } flex px-4 py-2 text-sm text-text-primary`}
                                  >
                                    <UserCircleIcon className="h-5 w-5 mr-2" />
                                    {user.role === 'admin' ? 'Settings' : 'Profile'}
                                  </Link>
                                </motion.div>
                              )}
                            </Menu.Item>
                            <Menu.Item>
                              {({ active }) => (
                                <motion.div whileHover={{ x: 5 }}>
                                  <button
                                    onClick={handleLogout}
                                    className={`${
                                      active ? 'bg-background' : ''
                                    } flex w-full px-4 py-2 text-sm text-text-primary`}
                                  >
                                    <LogoutIcon className="h-5 w-5 mr-2" />
                                    Sign out
                                  </button>
                                </motion.div>
                              )}
                            </Menu.Item>
                          </motion.div>
                        </Menu.Items>
                      </AnimatePresence>
                    </Menu>
                    {user.role !== 'admin' && (
                      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        <Link
                          to="/cart"
                          className="p-2 text-text-primary hover:text-accent relative inline-flex items-center justify-center"
                        >
                          <ShoppingCartIcon className="h-6 w-6" />
                          {items && items.length > 0 && (
                            <motion.span 
                              className="absolute -top-2 -right-2 bg-accent text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            >
                              {items.length}
                            </motion.span>
                          )}
                        </Link>
                      </motion.div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center space-x-4">
                    <Link
                      to="/login"
                      className="text-text-primary hover:text-accent px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Login
                    </Link>
                    <Link
                      to="/signup"
                      className="bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded-md text-sm font-medium"
                    >
                      Sign up
                    </Link>
                  </div>
                )}
              </motion.div>

              {/* Mobile menu button */}
              <motion.div 
                className="flex items-center sm:hidden"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Disclosure.Button className="inline-flex items-center justify-center p-2 rounded-md text-text-primary hover:text-accent hover:bg-background">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <MenuIcon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </motion.div>
            </div>
          </div>

          {/* Mobile menu */}
          <AnimatePresence>
            {open && (
              <Disclosure.Panel static className="sm:hidden">
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="bg-card-bg"
                >
                  <div className="px-2 pt-2 pb-3 space-y-1">
                    {/* Theme toggle in mobile menu */}
                    <button
                      onClick={toggleTheme}
                      className="w-full flex items-center px-3 py-2 rounded-md text-text-primary hover:text-accent hover:bg-background"
                    >
                      {theme === 'dark' ? (
                        <>
                          <SunIcon className="h-6 w-6 mr-2" />
                          Light Mode
                        </>
                      ) : (
                        <>
                          <MoonIcon className="h-6 w-6 mr-2" />
                          Dark Mode
                        </>
                      )}
                    </button>

                    {!isAdminRoute && customerNavigation.map((item) => (
                      <motion.div
                        key={item.name}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Disclosure.Button
                          as={Link}
                          to={item.href}
                          className="text-text-primary hover:text-accent hover:bg-background block px-3 py-2 rounded-md text-base font-medium"
                        >
                          {item.name}
                        </Disclosure.Button>
                      </motion.div>
                    ))}
                    {user && isAdminRoute && adminNavigation.map((item) => (
                      <motion.div
                        key={item.name}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Disclosure.Button
                          as={Link}
                          to={item.href}
                          className="text-text-primary hover:text-accent hover:bg-background block px-3 py-2 rounded-md text-base font-medium"
                        >
                          {item.name}
                        </Disclosure.Button>
                      </motion.div>
                    ))}
                  </div>
                  {/* Mobile menu authentication */}
                  <div className="pt-4 pb-3 border-t border-border">
                    <motion.div 
                      className="px-2 space-y-1"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      {user ? (
                        <>
                          <Disclosure.Button
                            as={Link}
                            to={user.role === 'admin' ? '/admin/settings' : '/profile'}
                            className="block px-3 py-2 rounded-md text-base font-medium text-text-primary hover:text-accent hover:bg-background"
                          >
                            {user.role === 'admin' ? 'Settings' : 'Profile'}
                          </Disclosure.Button>
                          {user.role !== 'admin' && (
                            <Disclosure.Button
                              as={Link}
                              to="/cart"
                              className="block px-3 py-2 rounded-md text-base font-medium text-text-primary hover:text-accent hover:bg-background"
                            >
                              Cart {items.length > 0 && `(${items.length})`}
                            </Disclosure.Button>
                          )}
                          <Disclosure.Button
                            as="button"
                            onClick={handleLogout}
                            className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-text-primary hover:text-accent hover:bg-background"
                          >
                            Sign out
                          </Disclosure.Button>
                        </>
                      ) : (
                        <>
                          <Disclosure.Button
                            as={Link}
                            to="/login"
                            className="block px-3 py-2 rounded-md text-base font-medium text-text-primary hover:text-accent hover:bg-background"
                          >
                            Login
                          </Disclosure.Button>
                          <Disclosure.Button
                            as={Link}
                            to="/signup"
                            className="block px-3 py-2 rounded-md text-base font-medium text-text-primary hover:text-accent hover:bg-background"
                          >
                            Sign up
                          </Disclosure.Button>
                        </>
                      )}
                    </motion.div>
                  </div>
                </motion.div>
              </Disclosure.Panel>
            )}
          </AnimatePresence>
        </>
      )}
    </Disclosure>
      {/* Add padding to prevent content from hiding behind fixed header */}
      <div className="h-16"></div>
    </>
  );
} 