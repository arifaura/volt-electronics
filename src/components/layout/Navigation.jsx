import { 
  ShoppingCartIcon, 
  UserIcon,
  HeartIcon 
} from '@heroicons/react/outline';

// Inside your navigation items
const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Products', href: '/products' },
  { name: 'About', href: '/about' },
  { name: 'Services', href: '/services' },
  { name: 'Contact', href: '/contact' },
];

// Add this near your cart icon
const WishlistButton = () => {
  const { wishlist } = useWishlist();
  return (
    <Link
      to="/wishlist"
      className="relative p-2 text-text-primary hover:text-accent transition-colors"
    >
      <HeartIcon className="h-6 w-6" />
      {wishlist.length > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
          {wishlist.length}
        </span>
      )}
    </Link>
  );
};

// Add the WishlistButton to your navigation bar
return (
  <nav>
    <div className="flex items-center space-x-4">
      <CartButton />
      <WishlistButton />
      <ProfileButton />
    </div>
  </nav>
); 