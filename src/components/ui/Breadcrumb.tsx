import React from 'react';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && <ChevronRight className="h-4 w-4 text-gray-400" />}
          {item.onClick ? (
            <button
              onClick={item.onClick}
              className="hover:text-blue-600 transition-colors"
            >
              {item.label}
            </button>
          ) : (
            <span className={index === items.length - 1 ? 'text-gray-900 font-medium' : ''}>
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

// BackButton 컴포넌트도 함께 제공
interface BackButtonProps {
  onClick: () => void;
  children: React.ReactNode;
}

export const BackButton: React.FC<BackButtonProps> = ({ onClick, children }) => {
  return (
    <button
      onClick={onClick}
      className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 text-sm font-medium mb-3 transition-colors"
    >
      {children}
    </button>
  );
};