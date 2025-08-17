import { motion } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";

const Empty = ({ 
  title = "No Recording Yet", 
  message = "Start by recording your voice to begin creating amazing vocals",
  actionText = "Start Recording",
  onAction,
  icon = "Mic"
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex-1 flex items-center justify-center p-8"
    >
      <div className="text-center space-y-6 max-w-md">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="mx-auto w-32 h-32 bg-gradient-to-br from-primary-500/20 to-secondary-500/20 rounded-full flex items-center justify-center relative"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="w-20 h-20 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center"
          >
            <ApperIcon 
              name={icon} 
              size={40} 
              className="text-white"
            />
          </motion.div>
          
          {/* Floating particles */}
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-accent-500 rounded-full"
              animate={{
                y: [-10, -30, -10],
                x: [0, Math.sin(i) * 20, 0],
                opacity: [0.3, 1, 0.3]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.5
              }}
              style={{
                left: `${50 + Math.cos(i * 2) * 30}%`,
                top: `${50 + Math.sin(i * 2) * 30}%`
              }}
            />
          ))}
        </motion.div>
        
        <div className="space-y-3">
          <h2 className="text-2xl font-display font-semibold gradient-text">
            {title}
          </h2>
          <p className="text-surface-200 font-body leading-relaxed">
            {message}
          </p>
        </div>
        
        {onAction && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onAction}
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-display font-medium rounded-lg hover:shadow-lg transition-all duration-200 btn-glow text-lg"
          >
            <ApperIcon name={icon} size={20} />
            {actionText}
          </motion.button>
        )}
        
        <div className="flex justify-center space-x-8 text-sm text-surface-400">
          <div className="flex items-center gap-2">
            <ApperIcon name="Mic" size={16} />
            <span>Record</span>
          </div>
          <div className="flex items-center gap-2">
            <ApperIcon name="Music" size={16} />
            <span>Autotune</span>
          </div>
          <div className="flex items-center gap-2">
            <ApperIcon name="Sliders" size={16} />
            <span>Master</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Empty;