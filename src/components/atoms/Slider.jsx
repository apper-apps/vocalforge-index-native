import React from "react";
import { cn } from "@/utils/cn";

const Slider = React.forwardRef(({ 
  value = 0, 
  min = 0, 
  max = 100, 
  step = 1,
  onChange,
  className,
  label,
  showValue = false,
  color = "primary",
  ...props 
}, ref) => {
  const colorClasses = {
    primary: "accent-primary-500",
    secondary: "accent-secondary-500",
    accent: "accent-accent-500"
  };

  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium text-surface-200">
            {label}
          </label>
          {showValue && (
            <span className="text-sm text-surface-400">
              {value}
            </span>
          )}
        </div>
      )}
      
      <div className="relative">
        <input
          ref={ref}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange && onChange(Number(e.target.value))}
          className={cn(
            "w-full h-2 bg-surface-700 rounded-lg appearance-none cursor-pointer slider",
            colorClasses[color]
          )}
          style={{
            background: `linear-gradient(to right, 
              rgba(124, 58, 237, 0.8) 0%, 
              rgba(236, 72, 153, 0.8) ${percentage}%, 
              rgba(55, 65, 81, 1) ${percentage}%, 
              rgba(55, 65, 81, 1) 100%)`
          }}
          {...props}
        />
        
        {/* Custom thumb indicator */}
        <div 
          className="absolute top-0 w-4 h-4 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full shadow-lg pointer-events-none transform -translate-y-1"
          style={{ 
            left: `calc(${percentage}% - 8px)`,
            boxShadow: "0 0 10px rgba(124, 58, 237, 0.5)"
          }}
        />
      </div>
    </div>
  );
});

Slider.displayName = "Slider";

export default Slider;