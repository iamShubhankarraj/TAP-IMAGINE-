// components/ui/card.tsx
import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'gradient' | 'bordered';
  hoverable?: boolean;
  animated?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className = '',
      variant = 'default',
      hoverable = false,
      animated = false,
      padding = 'md',
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles = 'rounded-2xl transition-all duration-300';

    const variantStyles = {
      default: 'bg-gray-900/80 border border-white/10',
      glass: 'bg-white/5 backdrop-blur-md border border-white/10',
      gradient: 'bg-gradient-to-br from-purple-900/50 to-violet-900/50 border border-white/10',
      bordered: 'bg-transparent border-2 border-white/20',
    };

    const hoverStyles = hoverable ? 'hover:bg-white/10 hover:border-white/20 hover:shadow-2xl cursor-pointer' : '';
    const animatedStyles = animated ? 'transform hover:scale-[1.02] hover:-translate-y-1' : '';

    const paddingStyles = {
      none: '',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
      xl: 'p-10',
    };

    const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${hoverStyles} ${animatedStyles} ${paddingStyles[padding]} ${className}`;

    return (
      <div ref={ref} className={combinedClassName} {...props}>
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export default Card;
