import { motion } from "framer-motion";
import { cn } from "@/utils/cn";

const LevelMeter = ({ 
  level = 0, 
  peak = 0, 
  label = "Level",
  orientation = "vertical",
  size = "md",
  showPeak = true,
  showLabel = true,
  className = ""
}) => {
  const sizes = {
    sm: orientation === "vertical" ? "w-3 h-20" : "h-3 w-20",
    md: orientation === "vertical" ? "w-4 h-32" : "h-4 w-32",
    lg: orientation === "vertical" ? "w-6 h-40" : "h-6 w-40"
  };

  // Convert level to percentage (assuming level is 0-1)
  const levelPercent = Math.min(100, Math.max(0, level * 100));
  const peakPercent = Math.min(100, Math.max(0, peak * 100));

  // Color based on level
  const getLevelColor = (percent) => {
    if (percent > 85) return "bg-red-500";
    if (percent > 70) return "bg-yellow-500";
    return "bg-accent-500";
  };

  return (
    <div className={cn("flex flex-col items-center space-y-2", className)}>
      {showLabel && (
        <span className="text-xs font-medium text-surface-300 uppercase tracking-wide">
          {label}
        </span>
      )}
      
      <div className="relative">
        {/* Meter Background */}
        <div className={cn(
          "bg-surface-800 rounded-full border border-surface-600 relative overflow-hidden",
          sizes[size]
        )}>
          {/* Background gradient segments */}
          <div className="level-meter absolute inset-0 opacity-20" />
          
          {/* Active level */}
          <motion.div
            className={cn(
              "absolute rounded-full transition-all duration-75 ease-out",
              getLevelColor(levelPercent),
              orientation === "vertical" 
                ? "bottom-0 left-0 right-0" 
                : "left-0 top-0 bottom-0"
            )}
            style={{
              [orientation === "vertical" ? "height" : "width"]: `${levelPercent}%`
            }}
            animate={{
              boxShadow: levelPercent > 70 
                ? `0 0 10px ${levelPercent > 85 ? "#EF4444" : "#F59E0B"}`
                : "0 0 5px #10B981"
            }}
          />
          
          {/* Peak indicator */}
          {showPeak && peakPercent > 0 && (
            <motion.div
              className="absolute bg-white rounded-full"
              style={{
                [orientation === "vertical" ? "bottom" : "left"]: `${peakPercent}%`,
                [orientation === "vertical" ? "height" : "width"]: "2px",
                [orientation === "vertical" ? "left" : "top"]: "0",
                [orientation === "vertical" ? "right" : "bottom"]: "0"
              }}
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            />
          )}
        </div>
        
        {/* dB markers */}
        <div className={cn(
          "absolute text-xs text-surface-500 font-mono",
          orientation === "vertical" ? "left-6 top-0 space-y-6" : "top-6 left-0 flex space-x-6"
        )}>
          <span>0</span>
          <span>-12</span>
          <span>-24</span>
        </div>
      </div>
      
      {/* Numeric readout */}
      <div className="text-xs font-mono text-center space-y-1">
        <div className="text-surface-200">
          {Math.round(level * 100)}%
        </div>
        {showPeak && (
          <div className="text-surface-400">
            Peak: {Math.round(peak * 100)}%
          </div>
        )}
      </div>
    </div>
  );
};

export default LevelMeter;