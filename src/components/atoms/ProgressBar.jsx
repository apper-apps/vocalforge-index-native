import React from "react";
import { cn } from "@/utils/cn";

const ProgressBar = React.forwardRef(({ 
  value = 0, 
  max = 100, 
  className,
  color = "primary",
  size = "md",
  showLabel = false,
  label,
  animated = false,
  ...props 
}, ref) => {
  const colors = {
    primary: "bg-gradient-to-r from-primary-500 to-secondary-500",
    secondary: "bg-secondary-500",
    accent: "bg-accent-500",
    danger: "bg-red-500",
    warning: "bg-yellow-500",
    success: "bg-green-500"
  };

  const sizes = {
    sm: "h-1",
    md: "h-2",
    lg: "h-3"
  };

  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div ref={ref} className={cn("space-y-1", className)} {...props}>
      {(showLabel || label) && (
        <div className="flex justify-between items-center text-sm">
          <span className="text-surface-200">
            {label || "Progress"}
          </span>
          <span className="text-surface-400">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
      
      <div className={cn(
        "w-full bg-surface-700 rounded-full overflow-hidden",
        sizes[size]
      )}>
        <div
          className={cn(
            "rounded-full transition-all duration-300 ease-out",
            colors[color],
            animated && "animate-pulse"
          )}
          style={{ 
            width: `${percentage}%`,
            transition: animated ? "width 0.3s ease-out" : "width 0.15s ease-out"
          }}
        />
      </div>
    </div>
  );
});

ProgressBar.displayName = "ProgressBar";

export default ProgressBar;