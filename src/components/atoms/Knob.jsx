import React, { useState, useCallback } from "react";
import { cn } from "@/utils/cn";

const Knob = React.forwardRef(({ 
  value = 0, 
  min = 0, 
  max = 100, 
  step = 1,
  onChange,
  className,
  label,
  size = "md",
  color = "primary",
  showValue = true,
  ...props 
}, ref) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);
  const [dragStartValue, setDragStartValue] = useState(0);

  const sizes = {
    sm: "w-12 h-12",
    md: "w-16 h-16",
    lg: "w-20 h-20"
  };

  const colors = {
    primary: "from-primary-500 to-secondary-500",
    secondary: "from-secondary-500 to-accent-500",
    accent: "from-accent-500 to-primary-500"
  };

  const percentage = ((value - min) / (max - min)) * 100;
  const rotation = (percentage / 100) * 270 - 135; // -135° to +135°

  const handleMouseDown = useCallback((e) => {
    setIsDragging(true);
    setDragStartY(e.clientY);
    setDragStartValue(value);
    e.preventDefault();
  }, [value]);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging || !onChange) return;
    
    const deltaY = dragStartY - e.clientY;
    const sensitivity = 0.5;
    const deltaValue = deltaY * sensitivity;
    const newValue = Math.max(min, Math.min(max, dragStartValue + deltaValue));
    
    onChange(Math.round(newValue / step) * step);
  }, [isDragging, dragStartY, dragStartValue, onChange, min, max, step]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div className={cn("flex flex-col items-center space-y-2", className)}>
      {label && (
        <label className="text-sm font-medium text-surface-200 text-center">
          {label}
        </label>
      )}
      
      <div
        ref={ref}
        className={cn(
          "knob relative rounded-full bg-surface-800 border-2 border-surface-600 flex items-center justify-center cursor-pointer select-none transition-all duration-200",
          sizes[size],
          isDragging && "scale-105"
        )}
        onMouseDown={handleMouseDown}
        {...props}
      >
        {/* Background circle */}
        <div className="absolute inset-1 rounded-full bg-surface-700" />
        
        {/* Progress arc */}
        <svg 
          className="absolute inset-0 w-full h-full" 
          style={{ transform: "rotate(-135deg)" }}
        >
          <circle
            cx="50%"
            cy="50%"
            r="45%"
            fill="none"
            stroke="rgba(55, 65, 81, 0.5)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="212"
            strokeDashoffset="0"
          />
          <circle
            cx="50%"
            cy="50%"
            r="45%"
            fill="none"
            stroke="url(#knobGradient)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="212"
            strokeDashoffset={212 - (212 * percentage) / 100}
            className="transition-all duration-150"
          />
          <defs>
            <linearGradient id="knobGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(124, 58, 237, 1)" />
              <stop offset="100%" stopColor="rgba(236, 72, 153, 1)" />
            </linearGradient>
          </defs>
        </svg>
        
        {/* Indicator dot */}
        <div
          className="absolute w-1.5 h-1.5 bg-white rounded-full shadow-lg"
          style={{
            transform: `rotate(${rotation}deg) translateY(-${size === "sm" ? "18px" : size === "lg" ? "30px" : "24px"})`
          }}
        />
        
        {/* Center dot */}
        <div className="relative w-2 h-2 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full shadow-lg" />
      </div>
      
      {showValue && (
        <span className="text-xs text-surface-300 font-mono">
          {Math.round(value)}
        </span>
      )}
    </div>
  );
});

Knob.displayName = "Knob";

export default Knob;