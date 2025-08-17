import React from "react";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";

const Button = React.forwardRef(({ 
  children, 
  variant = "primary", 
  size = "md", 
  className,
  icon,
  iconPosition = "left",
  isLoading = false,
  disabled = false,
  ...props 
}, ref) => {
  const variants = {
    primary: "bg-gradient-to-r from-primary-500 to-secondary-500 text-white hover:shadow-lg btn-glow",
    secondary: "bg-surface-700 text-surface-100 hover:bg-surface-600 border border-surface-600",
    outline: "bg-transparent border-2 border-primary-500 text-primary-500 hover:bg-primary-500 hover:text-white",
    ghost: "bg-transparent text-surface-200 hover:bg-surface-700",
    danger: "bg-red-600 text-white hover:bg-red-700 hover:shadow-lg",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
    xl: "px-10 py-5 text-xl",
    icon: "p-3"
  };

  const baseClasses = "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none";

  return (
    <button
      ref={ref}
      className={cn(
        baseClasses,
        variants[variant],
        sizes[size],
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <ApperIcon 
          name="Loader2" 
          size={size === "sm" ? 16 : size === "lg" ? 24 : 20} 
          className="animate-spin mr-2" 
        />
      )}
      
      {icon && iconPosition === "left" && !isLoading && (
        <ApperIcon 
          name={icon} 
          size={size === "sm" ? 16 : size === "lg" ? 24 : 20} 
          className="mr-2" 
        />
      )}
      
      {children}
      
      {icon && iconPosition === "right" && !isLoading && (
        <ApperIcon 
          name={icon} 
          size={size === "sm" ? 16 : size === "lg" ? 24 : 20} 
          className="ml-2" 
        />
      )}
    </button>
  );
});

Button.displayName = "Button";

export default Button;