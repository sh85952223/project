import React from 'react';
import { cn } from '../../utils/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  as?: React.ElementType;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  className,
  as: Component = 'button',
  variant = 'primary',
  size = 'md',
  children,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  // 👇 [수정] primary와 secondary 스타일에 투명한 테두리를 추가하여, outline과 크기를 동일하게 맞춥니다.
  const variants = {
    primary: 'bg-blue-600 text-white border-2 border-transparent hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-green-600 text-white border-2 border-transparent hover:bg-green-700 focus:ring-green-500',
    outline: 'border-2 border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-blue-500',
    ghost: 'border-2 border-transparent text-gray-700 hover:bg-gray-100 focus:ring-blue-500',
    danger: 'bg-red-600 text-white border-2 border-transparent hover:bg-red-700 focus:ring-red-500',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <Component
      className={cn(baseClasses, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </Component>
  );
};