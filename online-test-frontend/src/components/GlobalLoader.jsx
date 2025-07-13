import { useLoading } from '../context/LoadingContext';
import { PuffLoader } from 'react-spinners';
import { motion, AnimatePresence } from 'framer-motion';

const GlobalLoader = () => {
  const { loading } = useLoading();

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 flex justify-center items-center bg-black/50 z-[9999] backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 10 }}
          >
            <PuffLoader 
              color="#a1724e" 
              size={80}
              aria-label="Loading application..."
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GlobalLoader;