// components/ui/badge.tsx
import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  animated?: boolean;
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  (
    {
      className = '',
      variant = 'default',
      size = 'md',
      icon,
      animated = false,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles = 'inline-flex items-center gap-2 rounded-full font-medium transition-all duration-200';

    const variantStyles = {
      default: 'bg-white/10 backdrop-blur-md text-white border border-white/20',
      primary: 'bg-banana/20 backdrop-blur-md text-banana border border-banana/30',
      secondary: 'bg-purple-500/20 backdrop-blur-md text-purple-300 border border-purple-500/30',
      success: 'bg-green-500/20 backdrop-blur-md text-green-300 border border-green-500/30',
      warning: 'bg-yellow-500/20 backdrop-blur-md text-yellow-300 border border-yellow-500/30',
      error: 'bg-red-500/20 backdrop-blur-md text-red-300 border border-red-500/30',
    };

    const sizeStyles = {
      sm: 'px-2.5 py-1 text-xs',
      md: 'px-3 py-1.5 text-sm',
      lg: 'px-4 py-2 text-base',
    };

    const animatedStyles = animated ? 'animate-pulse' : '';

    const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${animatedStyles} ${className}`;

    return (
      <div ref={ref} className={combinedClassName} {...props}>
        {icon && <span className="flex-shrink-0">{icon}</span>}
        {children}
      </div>
    );
  }
);

Badge.displayName = 'Badge';

export default Badge;
