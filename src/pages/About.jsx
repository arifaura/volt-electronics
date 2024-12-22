import { LightBulbIcon, ShieldCheckIcon, UserGroupIcon, SparklesIcon } from '@heroicons/react/outline';
import { motion } from 'framer-motion';

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

const featureVariants = {
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

export default function About() {
  const features = [
    {
      name: 'Quality Products',
      description: 'We offer only the highest quality electrical products from trusted manufacturers.',
      icon: LightBulbIcon,
    },
    {
      name: 'Expert Team',
      description: 'Our team of experienced professionals ensures you get the best service and support.',
      icon: UserGroupIcon,
    },
    {
      name: 'Safety First',
      description: 'All our products meet or exceed safety standards and regulations.',
      icon: ShieldCheckIcon,
    },
    {
      name: 'Innovation',
      description: 'We stay ahead with the latest electrical technology and smart home solutions.',
      icon: SparklesIcon,
    },
  ];

  return (
    <motion.div 
      className="bg-white"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center"
          variants={itemVariants}
        >
          <motion.h2 
            className="text-3xl font-extrabold text-gray-900 sm:text-4xl"
            variants={itemVariants}
          >
            About Volt Electricals
          </motion.h2>
          <motion.p 
            className="mt-4 text-lg text-gray-500"
            variants={itemVariants}
          >
            Leading the way in electrical solutions since 2010
          </motion.p>
        </motion.div>

        <motion.div 
          className="mt-10"
          variants={containerVariants}
        >
          <motion.div 
            className="max-w-3xl mx-auto text-center text-gray-500"
            variants={itemVariants}
          >
            <motion.p 
              className="text-lg leading-relaxed"
              variants={itemVariants}
            >
              At Volt Electricals, we're passionate about providing high-quality electrical products
              and solutions for homes and businesses. With over a decade of experience, we've
              established ourselves as a trusted name in the electrical industry.
            </motion.p>
            <motion.p 
              className="mt-4 text-lg leading-relaxed"
              variants={itemVariants}
            >
              Our commitment to excellence, innovation, and customer satisfaction drives everything
              we do. We believe in offering not just products, but complete electrical solutions
              that make your life easier and safer.
            </motion.p>
          </motion.div>
        </motion.div>

        <motion.div 
          className="mt-16"
          variants={containerVariants}
        >
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <motion.div 
                key={feature.name} 
                className="pt-6"
                variants={featureVariants}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div 
                  className="flow-root rounded-lg bg-gray-50 px-6 pb-8"
                  whileHover={{ boxShadow: "0 4px 15px rgba(0,0,0,0.1)" }}
                >
                  <div className="-mt-6">
                    <span className="inline-flex items-center justify-center rounded-md bg-blue-500 p-3 shadow-lg">
                      <feature.icon className="h-6 w-6 text-white" aria-hidden="true" />
                    </span>
                    <motion.h3 
                      className="mt-8 text-lg font-medium tracking-tight text-gray-900"
                      variants={itemVariants}
                    >
                      {feature.name}
                    </motion.h3>
                    <motion.p 
                      className="mt-5 text-base text-gray-500"
                      variants={itemVariants}
                    >
                      {feature.description}
                    </motion.p>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
} 