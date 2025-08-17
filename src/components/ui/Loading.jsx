import { motion } from "framer-motion";

const Loading = () => {
  return (
    <div className="min-h-screen bg-surface-900 flex items-center justify-center">
      <div className="text-center space-y-8">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="mx-auto w-16 h-16 border-4 border-surface-700 border-t-primary-500 rounded-full"
        />
        
        <div className="space-y-4">
          <h2 className="text-2xl font-display font-semibold gradient-text">
            Loading VocalForge
          </h2>
          
          {/* Waveform Skeleton */}
          <div className="w-96 h-24 bg-surface-800 rounded-lg p-4 mx-auto">
            <div className="flex items-end justify-between h-full space-x-1">
              {Array.from({ length: 32 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="bg-secondary-500 rounded-sm flex-1"
                  style={{ height: `${Math.random() * 100}%` }}
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ 
                    duration: 1.5, 
                    repeat: Infinity, 
                    delay: i * 0.1 
                  }}
                />
              ))}
            </div>
          </div>
          
          {/* Control Panel Skeleton */}
          <div className="w-80 bg-surface-800 rounded-lg p-4 mx-auto space-y-3">
            <div className="flex justify-between">
              <div className="w-16 h-16 bg-surface-700 rounded-full animate-pulse" />
              <div className="w-16 h-16 bg-surface-700 rounded-full animate-pulse" />
              <div className="w-16 h-16 bg-surface-700 rounded-full animate-pulse" />
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-surface-700 rounded animate-pulse" />
              <div className="h-4 bg-surface-700 rounded animate-pulse w-3/4" />
            </div>
          </div>
        </div>
        
        <p className="text-surface-200 font-body">
          Initializing audio engine...
        </p>
      </div>
    </div>
  );
};

export default Loading;