import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
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

const imageVariants = {
  hidden: { opacity: 0, x: 100 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.8,
      ease: "easeOut"
    }
  }
};

export default function Hero() {
  return (
    <div className="relative bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="relative z-[1] pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
          <motion.main 
            className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <motion.div 
              className="sm:text-center lg:text-left"
              variants={containerVariants}
            >
              <motion.h1 
                className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl"
                variants={itemVariants}
              >
                <motion.span 
                  className="block"
                  variants={itemVariants}
                >
                  Power Your Home with
                </motion.span>
                <motion.span 
                  className="block text-blue-600"
                  variants={itemVariants}
                >
                  Smart Electrical Solutions
                </motion.span>
              </motion.h1>
              <motion.p 
                className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0"
                variants={itemVariants}
              >
                Discover our range of modern electrical products designed to
                make your home smarter, safer, and more energy-efficient.
              </motion.p>
              <motion.div 
                className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start"
                variants={itemVariants}
              >
                <motion.div 
                  className="rounded-md shadow"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to="/products"
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
                  >
                    Shop Now
                  </Link>
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.main>
        </div>
      </div>
      <motion.div 
        className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2"
        initial="hidden"
        animate="visible"
        variants={imageVariants}
      >
        <motion.img
          src="https://img.freepik.com/free-vector/smart-home-internet-things-devices-appliances-isometric-infographic-advertising-composition-with-fridge-tv-cooker-illustration_1284-28695.jpg"
          alt="Home Electronics"
          className="h-full w-full object-cover"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.3 }}
        />
      </motion.div>
    </div>
  );
}
