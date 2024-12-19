import { Link } from "react-router-dom";
import { 
  FaFacebook, 
  FaTwitter, 
  FaInstagram 
} from "react-icons/fa";

export default function Footer() {
  const socialLinks = [
    {
      name: 'Facebook',
      url: 'https://facebook.com/voltelectricals',
      icon: FaFacebook,
    },
    {
      name: 'Twitter',
      url: 'https://twitter.com/voltelectricals',
      icon: FaTwitter,
    },
    {
      name: 'Instagram',
      url: 'https://instagram.com/voltelectricals',
      icon: FaInstagram,
    },
  ];

  return (
    <footer className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <p className="text-gray-300">
              Email: info@voltelectricals.com
              <br />
              Phone: (555) 123-4567
              <br />
              Address: 123 Electric Ave,
              <br />
              Circuit City, EC 12345
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/products" className="text-gray-300 hover:text-white">
                  Products
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-gray-300 hover:text-white">
                  Services
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-300 hover:text-white">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-white">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div className="flex flex-col">
            <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
            <div className="flex flex-col space-y-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white flex items-center space-x-2"
                >
                  <social.icon className="h-5 w-5" />
                  <span>{social.name}</span>
                </a>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Newsletter</h3>
            <form className="mt-4">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-3 py-2 text-gray-900 rounded"
              />
              <button
                type="submit"
                className="mt-2 w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-700 pt-8 text-center">
          <p className="text-gray-300">
            © 2024 Volt Electricals. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
