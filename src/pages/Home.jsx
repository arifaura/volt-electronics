import { Link } from 'react-router-dom';
import Hero from '../components/home/Hero';
import { 
  LightningBoltIcon, 
  ShieldCheckIcon, 
  TruckIcon, 
  CurrencyDollarIcon 
} from '@heroicons/react/outline';

export default function Home() {
  const features = [
    {
      name: 'Fast Installation',
      description: 'Professional installation within 24-48 hours of purchase',
      icon: LightningBoltIcon,
    },
    {
      name: 'Quality Guaranteed',
      description: 'All products come with minimum 2-year warranty',
      icon: ShieldCheckIcon,
    },
    {
      name: 'Free Delivery',
      description: 'Free shipping on orders above $500',
      icon: TruckIcon,
    },
    {
      name: 'Best Price',
      description: 'Price match guarantee on all products',
      icon: CurrencyDollarIcon,
    },
  ];

  const topSelling = [
    {
      id: 1,
      name: 'Smart LED Bulb Pack',
      price: 49.99,
      image: '/images/products/smart-bulb.jpg',
      description: 'Pack of 4 WiFi-enabled LED bulbs',
      discount: '20% OFF',
    },
    {
      id: 2,
      name: 'Home Security Camera',
      price: 129.99,
      image: '/images/products/security-cam.jpg',
      description: '1080p HD Wireless Camera',
      discount: 'NEW',
    },
    {
      id: 3,
      name: 'Smart Thermostat',
      price: 199.99,
      image: '/images/products/thermostat.jpg',
      description: 'Energy-saving smart thermostat',
      badge: 'TRENDING',
    },
    {
      id: 4,
      name: 'Wireless Doorbell',
      price: 79.99,
      image: '/images/products/doorbell.jpg',
      description: 'HD Video Doorbell with Two-Way Audio',
      discount: '15% OFF',
    },
  ];

  const specialOffers = [
    {
      title: 'Smart Home Bundle',
      description: 'Get 30% off on our Smart Home Starter Kit',
      image: '/images/offers/smart-home-bundle.jpg',
      backgroundColor: 'bg-blue-100',
    },
    {
      title: 'Installation Special',
      description: 'Free installation on orders over $1000',
      image: '/images/offers/installation.jpg',
      backgroundColor: 'bg-yellow-100',
    },
  ];

  return (
    <div className="bg-white">
      <Hero />

      {/* Features Section */}
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div key={feature.name} className="relative">
              <div className="absolute h-12 w-12 text-blue-600">
                <feature.icon className="h-8 w-8" />
              </div>
              <div className="ml-16">
                <h3 className="text-lg font-medium text-gray-900">{feature.name}</h3>
                <p className="mt-2 text-base text-gray-500">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Selling Products */}
      <div className="bg-gray-50">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">Top Selling Products</h2>
            <p className="mt-4 text-lg text-gray-500">Check out our most popular electrical solutions</p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-4">
            {topSelling.map((product) => (
              <div key={product.id} className="group relative">
                <div className="w-full h-80 rounded-lg overflow-hidden bg-gray-100 aspect-w-1 aspect-h-1">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-center object-cover group-hover:opacity-75"
                  />
                  {product.discount && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-md text-sm font-medium">
                      {product.discount}
                    </div>
                  )}
                </div>
                <div className="mt-4 flex justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      <Link to={`/products/${product.id}`}>
                        <span aria-hidden="true" className="absolute inset-0" />
                        {product.name}
                      </Link>
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">{product.description}</p>
                  </div>
                  <p className="text-sm font-medium text-gray-900">${product.price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Special Offers */}
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">Special Offers</h2>
          <p className="mt-4 text-lg text-gray-500">Limited time deals you don't want to miss</p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {specialOffers.map((offer) => (
            <div
              key={offer.title}
              className={`${offer.backgroundColor} rounded-2xl overflow-hidden shadow-lg transition-transform hover:scale-105`}
            >
              <div className="p-8 sm:p-10">
                <div className="max-w-xl mx-auto flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{offer.title}</h3>
                    <p className="mt-4 text-lg text-gray-600">{offer.description}</p>
                    <button className="mt-8 bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors">
                      Learn More
                    </button>
                  </div>
                  <div className="hidden sm:block w-1/3">
                    <img
                      src={offer.image}
                      alt={offer.title}
                      className="w-full h-auto rounded-lg"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="bg-blue-700">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-white">Get the Latest Deals</h2>
            <p className="mt-4 text-xl text-blue-100">
              Subscribe to our newsletter and receive exclusive offers every week
            </p>
          </div>
          <form className="mt-8 sm:flex justify-center">
            <input
              type="email"
              required
              className="w-full sm:max-w-xs px-5 py-3 placeholder-gray-500 focus:ring-white focus:border-white sm:max-w-xs rounded-md"
              placeholder="Enter your email"
            />
            <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
              <button
                type="submit"
                className="w-full flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50"
              >
                Subscribe
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 