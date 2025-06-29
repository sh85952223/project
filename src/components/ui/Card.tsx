import React from 'react';
import { cn } from '../../utils/cn';

// 👇 [수정] style 속성을 받을 수 있도록 React.CSSProperties를 추가합니다.
interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
  style?: React.CSSProperties;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  onClick,
  hover = false,
  style, // style 속성을 props로 받습니다.
}) => {
  return (
    <div
      className={cn(
        'bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden',
        hover && 'hover:shadow-md transition-shadow duration-200',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
      style={style} // 받은 style 속성을 div에 적용합니다.
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <div className={cn('px-6 py-4 border-b border-gray-200', className)}>
    {children}
  </div>
);

export const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <div className={cn('px-6 py-4', className)}>
    {children}
  </div>
);

export const CardFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <div className={cn('px-6 py-3 border-t border-gray-200 bg-gray-50', className)}>
    {children}
  </div>
);