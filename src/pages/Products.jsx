import { useState, useEffect } from 'react';
import { debounce } from 'lodash';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { 
  ShoppingCartIcon, 
  StarIcon,
  SearchIcon,
  FilterIcon,
  HeartIcon,
  ScaleIcon
} from '@heroicons/react/solid';
import { motion, AnimatePresence } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
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

const cardVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

// Skeleton Loading Component
const ProductSkeleton = () => (
  <motion.div 
    className="bg-white rounded-2xl shadow-lg p-6 animate-pulse"
    variants={cardVariants}
  >
    <div className="relative h-[300px] bg-gray-200 rounded-lg mb-4"></div>
    <div className="space-y-3">
      <div className="h-6 bg-gray-200 rounded w-3/4"></div>
      <div className="flex space-x-1">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-5 w-5 bg-gray-200 rounded"></div>
        ))}
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      </div>
      <div className="flex justify-between items-center pt-4">
        <div className="h-8 w-24 bg-gray-200 rounded"></div>
        <div className="h-10 w-32 bg-gray-200 rounded"></div>
      </div>
    </div>
  </motion.div>
);

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    priceRange: [0, 1000],
    rating: 0,
    category: 'all'
  });
  const [sortBy, setSortBy] = useState('default');
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { wishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const navigate = useNavigate();
  const [compareList, setCompareList] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('https://fakestoreapi.com/products/category/electronics');
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product) => {
    if (!user) {
      toast.error('Please login to add items to cart');
      navigate('/login', { state: { from: '/products' } });
      return;
    }

    addToCart({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.image,
      quantity: 1
    });
    toast.success('Added to cart!');
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <motion.div
        key={index}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: index * 0.1 }}
      >
        <StarIcon
          className={`h-5 w-5 ${
            index < Math.round(rating)
              ? 'text-yellow-400'
              : 'text-gray-200'
          }`}
        />
      </motion.div>
    ));
  };

  const filteredProducts = products
    .filter(product => {
      const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           product.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPrice = product.price >= filters.priceRange[0] && 
                         product.price <= filters.priceRange[1];
      const matchesRating = product.rating.rate >= filters.rating;
      const matchesCategory = filters.category === 'all' || 
                            product.category === filters.category;
      
      return matchesSearch && matchesPrice && matchesRating && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'rating':
          return b.rating.rate - a.rating.rate;
        default:
          return 0;
      }
    });

  const debouncedSearch = debounce((value) => {
    setSearchQuery(value);
  }, 300);

  const handleCompare = (product) => {
    if (compareList.find(item => item.id === product.id)) {
      setCompareList(compareList.filter(item => item.id !== product.id));
    } else if (compareList.length < 3) {
      setCompareList([...compareList, product]);
    } else {
      toast.error('Can only compare up to 3 products');
    }
  };

  return (
    <motion.div 
      className="bg-background min-h-screen py-12 px-4 sm:px-6 lg:px-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="max-w-7xl mx-auto">
        <motion.div 
          className="text-center mb-16"
          variants={itemVariants}
        >
          <motion.h2 
            className="text-4xl font-extrabold text-text-primary sm:text-5xl"
            variants={itemVariants}
          >
            Our Products
          </motion.h2>
          <motion.p 
            className="mt-4 text-xl text-text-secondary max-w-2xl mx-auto"
            variants={itemVariants}
          >
            Browse our collection of high-quality electronics
          </motion.p>
        </motion.div>

        <div className="mb-8 space-y-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <SearchIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg"
                  onChange={(e) => debouncedSearch(e.target.value)}
                />
              </div>
            </div>
            <select
              className="border rounded-lg px-4 py-2"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="default">Sort by</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Rating</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span>Price Range:</span>
              <input
                type="range"
                min="0"
                max="1000"
                value={filters.priceRange[1]}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  priceRange: [prev.priceRange[0], parseInt(e.target.value)]
                }))}
              />
              <span>${filters.priceRange[1]}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <span>Min Rating:</span>
              <select
                value={filters.rating}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  rating: parseFloat(e.target.value)
                }))}
              >
                <option value="0">All</option>
                <option value="4">4+ Stars</option>
                <option value="3">3+ Stars</option>
                <option value="2">2+ Stars</option>
              </select>
            </div>
          </div>
        </div>

        <motion.div 
          className="mt-12 grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8"
          variants={containerVariants}
        >
          <AnimatePresence mode="wait">
            {loading ? (
              // Skeleton Loading
              [...Array(6)].map((_, index) => (
                <motion.div 
                  key={index}
                  className="bg-card-bg rounded-2xl shadow-lg p-6 animate-pulse relative"
                  variants={cardVariants}
                >
                  <div className="relative h-[300px] bg-gray-200 dark:bg-gray-700 rounded-lg mb-4"></div>
                  <div className="space-y-3">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    <div className="flex space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      ))}
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                    </div>
                    <div className="flex justify-between items-center pt-4">
                      <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              // Actual Products
              filteredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  className="group bg-card-bg rounded-2xl shadow-lg p-6"
                  variants={cardVariants}
                  whileHover={{ 
                    y: -8,
                    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                  }}
                  custom={index}
                  layout
                >
                  {/* Image Container with fixed aspect ratio */}
                  <motion.div 
                    className="relative h-[300px] mb-6"
                    whileHover={{ scale: 1.05 }}
                  >
                    <motion.img
                      src={product.image}
                      alt={product.title}
                      className="absolute inset-0 w-full h-full object-contain"
                      loading="lazy"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  </motion.div>

                  {/* Product Details */}
                  <motion.div 
                    className="space-y-4"
                    variants={itemVariants}
                  >
                    <motion.h3 
                      className="text-lg font-medium text-text-primary line-clamp-1 group-hover:text-accent transition-colors"
                      variants={itemVariants}
                    >
                      {product.title}
                    </motion.h3>

                    <motion.div 
                      className="flex items-center space-x-2"
                      variants={itemVariants}
                    >
                      <div className="flex items-center">
                        {renderStars(product.rating.rate)}
                      </div>
                      <span className="text-sm text-text-secondary">
                        ({product.rating.count})
                      </span>
                    </motion.div>

                    <motion.p 
                      className="text-sm text-text-secondary line-clamp-2 min-h-[40px]"
                      variants={itemVariants}
                    >
                      {product.description}
                    </motion.p>

                    <motion.div 
                      className="pt-4 flex items-center justify-between border-t border-border"
                      variants={itemVariants}
                    >
                      <motion.p 
                        className="text-2xl font-bold text-text-primary"
                        whileHover={{ scale: 1.05 }}
                      >
                        ${product.price.toFixed(2)}
                      </motion.p>
                      <div className="flex space-x-2">
                        <motion.button
                          onClick={() => handleCompare(product)}
                          className={`p-2 rounded-full ${
                            compareList.find(item => item.id === product.id)
                            ? 'bg-accent text-white'
                            : 'bg-gray-100 text-gray-600'
                          }`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <ScaleIcon className="h-5 w-5" />
                        </motion.button>
                        <motion.button
                          onClick={() => 
                            wishlist.find(item => item.id === product.id)
                            ? removeFromWishlist(product.id)
                            : addToWishlist(product)
                          }
                          className={`p-2 rounded-full ${
                            wishlist.find(item => item.id === product.id)
                            ? 'bg-red-500 text-white'
                            : 'bg-gray-100 text-gray-600'
                          }`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <HeartIcon className="h-5 w-5" />
                        </motion.button>
                        <motion.button
                          onClick={() => handleAddToCart(product)}
                          className="inline-flex items-center px-4 py-2 rounded-full bg-accent text-white"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <ShoppingCartIcon className="h-5 w-5 mr-2" />
                          Add to Cart
                        </motion.button>
                      </div>
                    </motion.div>
                  </motion.div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </motion.div>

        {!loading && products.length === 0 && (
          <motion.div 
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.p 
              className="text-text-secondary text-lg"
              variants={itemVariants}
            >
              No products found. Please try again later.
            </motion.p>
          </motion.div>
        )}
      </div>

      {/* Comparison Panel */}
      {compareList.length > 0 && (
        <motion.div
          className="fixed bottom-0 left-0 right-0 bg-card-bg shadow-lg p-4"
          initial={{ y: 100 }}
          animate={{ y: 0 }}
        >
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Compare Products</h3>
              <button
                onClick={() => setCompareList([])}
                className="text-text-secondary hover:text-text-primary"
              >
                Clear All
              </button>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {compareList.map(product => (
                <div key={product.id} className="bg-background p-4 rounded-lg">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="h-20 object-contain mx-auto"
                  />
                  <h4 className="mt-2 font-medium text-sm">{product.title}</h4>
                  <p className="text-accent font-bold">${product.price}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
} 