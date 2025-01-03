import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { 
  ShoppingCartIcon, 
  StarIcon 
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
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

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
                  className="bg-card-bg rounded-2xl shadow-lg p-6 animate-pulse"
                  variants={cardVariants}
                >
                  <div className="relative h-[300px] bg-background rounded-lg mb-4"></div>
                  <div className="space-y-3">
                    <div className="h-6 bg-background rounded w-3/4"></div>
                    <div className="flex space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-5 w-5 bg-background rounded"></div>
                      ))}
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 bg-background rounded"></div>
                      <div className="h-4 bg-background rounded w-5/6"></div>
                    </div>
                    <div className="flex justify-between items-center pt-4">
                      <div className="h-8 w-24 bg-background rounded"></div>
                      <div className="h-10 w-32 bg-background rounded"></div>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              // Actual Products
              products.map((product, index) => (
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
                      <motion.button
                        onClick={() => handleAddToCart(product)}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-full shadow-sm text-white bg-accent hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <ShoppingCartIcon className="h-5 w-5 mr-2" />
                        Add to Cart
                      </motion.button>
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
    </motion.div>
  );
} 