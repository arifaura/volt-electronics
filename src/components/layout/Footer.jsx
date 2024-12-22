import { Link } from "react-router-dom";
import { 
  FaFacebook, 
  FaTwitter, 
  FaInstagram 
} from "react-icons/fa";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3
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

const linkVariants = {
  hover: {
    x: 10,
    transition: {
      duration: 0.2
    }
  }
};

const socialVariants = {
  hover: {
    scale: 1.1,
    transition: {
      duration: 0.2
    }
  }
};

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
    <motion.footer 
      className="bg-gray-800 text-white"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={containerVariants}
    >
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <motion.div variants={itemVariants}>
            <motion.h3 
              className="text-lg font-semibold mb-4"
              variants={itemVariants}
            >
              Contact Us
            </motion.h3>
            <motion.p 
              className="text-gray-300"
              variants={itemVariants}
            >
              Email: info@voltelectricals.com
              <br />
              Phone: (555) 123-4567
              <br />
              Address: 123 Electric Ave,
              <br />
              Circuit City, EC 12345
            </motion.p>
          </motion.div>

          <motion.div variants={itemVariants}>
            <motion.h3 
              className="text-lg font-semibold mb-4"
              variants={itemVariants}
            >
              Quick Links
            </motion.h3>
            <ul className="space-y-2">
              {[
                { to: "/products", text: "Products" },
                { to: "/services", text: "Services" },
                { to: "/about", text: "About Us" },
                { to: "/contact", text: "Contact" }
              ].map((link) => (
                <motion.li 
                  key={link.to}
                  variants={itemVariants}
                >
                  <motion.div
                    variants={linkVariants}
                    whileHover="hover"
                  >
                    <Link 
                      to={link.to} 
                      className="text-gray-300 hover:text-white"
                    >
                      {link.text}
                    </Link>
                  </motion.div>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          <motion.div 
            className="flex flex-col"
            variants={itemVariants}
          >
            <motion.h3 
              className="text-lg font-semibold mb-4"
              variants={itemVariants}
            >
              Follow Us
            </motion.h3>
            <div className="flex flex-col space-y-3">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white flex items-center space-x-2"
                  variants={itemVariants}
                  whileHover={socialVariants.hover}
                >
                  <social.icon className="h-5 w-5" />
                  <span>{social.name}</span>
                </motion.a>
              ))}
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <motion.h3 
              className="text-lg font-semibold mb-4"
              variants={itemVariants}
            >
              Newsletter
            </motion.h3>
            <motion.form 
              className="mt-4"
              variants={itemVariants}
            >
              <motion.input
                type="email"
                placeholder="Enter your email"
                className="w-full px-3 py-2 text-gray-900 rounded"
                whileFocus={{ scale: 1.02 }}
              />
              <motion.button
                type="submit"
                className="mt-2 w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Subscribe
              </motion.button>
            </motion.form>
          </motion.div>
        </div>

        <motion.div 
          className="mt-8 border-t border-gray-700 pt-8 text-center"
          variants={itemVariants}
        >
          <motion.p 
            className="text-gray-300"
            variants={itemVariants}
          >
            © 2024 Volt Electricals. All rights reserved.
          </motion.p>
        </motion.div>
      </div>
    </motion.footer>
  );
}
