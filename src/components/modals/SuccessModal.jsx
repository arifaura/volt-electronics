import { motion } from 'framer-motion';
import { PaperAirplaneIcon } from '@heroicons/react/solid';

export default function SuccessModal() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center"
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0,
        zIndex: 9999 
      }}
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.5, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="bg-card-bg rounded-2xl p-8 max-w-md w-full mx-4 text-center shadow-xl"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1, rotate: 360 }}
          transition={{ 
            type: "spring",
            stiffness: 260,
            damping: 20,
            duration: 1.5
          }}
          className="w-20 h-20 bg-accent/10 rounded-full mx-auto flex items-center justify-center"
        >
          <motion.div
            animate={{ 
              y: [0, -10, 0],
              rotate: [-10, 10, -10]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          >
            <PaperAirplaneIcon className="h-10 w-10 text-accent transform rotate-45" />
          </motion.div>
        </motion.div>

        <motion.h2
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-bold text-text-primary mt-6"
        >
          Order Placed Successfully!
        </motion.h2>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-2 text-text-secondary"
        >
          Thank you for your purchase. Your order is being processed.
        </motion.p>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-4 text-sm text-accent"
        >
          Redirecting to orders page...
        </motion.div>
      </motion.div>
    </motion.div>
  );
} 