import { motion } from "framer-motion";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";

const TransportControls = ({
  isPlaying = false,
  isRecording = false,
  isPaused = false,
  onPlay,
  onPause,
  onStop,
  onRecord,
  position = "00:00",
  duration = "00:00",
  className = ""
}) => {
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className={`flex items-center justify-between p-4 bg-surface-800/50 backdrop-blur-sm rounded-xl border border-surface-600 ${className}`}>
      {/* Time Display */}
      <div className="text-sm font-mono text-surface-200 min-w-[100px]">
        <span className="text-primary-400">{position}</span>
        <span className="mx-2 text-surface-500">/</span>
        <span>{duration}</span>
      </div>

      {/* Transport Buttons */}
      <div className="flex items-center gap-3">
        {/* Record Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onRecord}
          className={`
            transport-btn p-3 rounded-full transition-all duration-200 
            ${isRecording 
              ? "bg-red-600 text-white recording-glow" 
              : "bg-surface-700 hover:bg-red-600 text-surface-200 hover:text-white"
            }
          `}
        >
          <ApperIcon 
            name={isRecording ? "Square" : "Mic"} 
            size={20} 
          />
        </motion.button>

        {/* Stop Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onStop}
          className="transport-btn p-3 rounded-full bg-surface-700 hover:bg-surface-600 text-surface-200"
        >
          <ApperIcon name="Square" size={20} />
        </motion.button>

        {/* Play/Pause Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={isPlaying ? onPause : onPlay}
          className={`
            transport-btn p-4 rounded-full text-white transition-all duration-200
            ${isPlaying 
              ? "bg-gradient-to-r from-secondary-500 to-accent-500" 
              : "bg-gradient-to-r from-primary-500 to-secondary-500 btn-glow"
            }
          `}
        >
          <ApperIcon 
            name={isPlaying ? "Pause" : "Play"} 
            size={24} 
          />
        </motion.button>
      </div>

      {/* Playback Speed */}
      <div className="text-sm text-surface-400 min-w-[60px] text-right">
        <span>1.0x</span>
      </div>
    </div>
  );
};

export default TransportControls;