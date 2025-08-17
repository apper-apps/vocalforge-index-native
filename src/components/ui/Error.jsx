import { motion } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";

const Error = ({ message = "Something went wrong", onRetry, showRetry = true }) => {
  // Enhanced error message handling for audio permissions
  const isPermissionError = message?.toLowerCase().includes('permission') || 
                           message?.toLowerCase().includes('denied') ||
                           message?.toLowerCase().includes('access');

  const displayMessage = isPermissionError 
    ? "Microphone access is required to use VocalForge's recording features."
    : message;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-surface-900 flex items-center justify-center p-6"
    >
      <div className="text-center space-y-6 max-w-md">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="mx-auto w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center"
        >
          <ApperIcon 
            name="AlertTriangle" 
            size={48} 
            className="text-red-400"
          />
        </motion.div>
        
        <div className="space-y-3">
          <h2 className="text-2xl font-display font-semibold text-red-400">
            Audio Engine Error
          </h2>
          <p className="text-surface-200 font-body leading-relaxed">
            {message}
          </p>
          <p className="text-sm text-surface-400 font-body">
            This might be due to browser permissions or audio device issues.
          </p>
        </div>
        
        {showRetry && (
          <div className="space-y-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onRetry}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-medium rounded-lg hover:shadow-lg transition-all duration-200 btn-glow"
            >
              <ApperIcon name="RotateCcw" size={18} />
              Try Again
            </motion.button>
            
            <div className="space-y-2 text-sm text-surface-400">
              <p>Troubleshooting tips:</p>
              <ul className="list-disc list-inside space-y-1 text-left">
                <li>Check microphone permissions</li>
                <li>Ensure audio device is connected</li>
                <li>Try refreshing the page</li>
                <li>Use a supported browser (Chrome, Firefox, Safari)</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Error;