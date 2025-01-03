import { motion } from 'framer-motion';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { ShoppingCartIcon, TrashIcon } from '@heroicons/react/solid';
import { toast } from 'react-hot-toast';

export default function Wishlist() {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleAddToCart = (product) => {
    addToCart({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.image,
      quantity: 1
    });
    removeFromWishlist(product.id);
    toast.success('Moved to cart!');
  };

  return (
    <motion.div
      className="min-h-screen py-12 px-4 sm:px-6 lg:px-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">My Wishlist</h1>
        {wishlist.length === 0 ? (
          <p className="text-text-secondary">Your wishlist is empty</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlist.map(product => (
              <motion.div
                key={product.id}
                className="bg-card-bg rounded-lg shadow p-4"
                layout
              >
                <img
                  src={product.image}
                  alt={product.title}
                  className="h-48 object-contain mx-auto"
                />
                <h3 className="mt-4 font-medium">{product.title}</h3>
                <p className="text-accent font-bold mt-2">
                  ${product.price.toFixed(2)}
                </p>
                <div className="flex justify-between mt-4">
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="flex items-center px-4 py-2 bg-accent text-white rounded-full"
                  >
                    <ShoppingCartIcon className="h-5 w-5 mr-2" />
                    Move to Cart
                  </button>
                  <button
                    onClick={() => removeFromWishlist(product.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-full"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
} 