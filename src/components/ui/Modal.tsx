import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  // 👇 [수정] 'fit' 옵션을 추가하여 내용에 맞는 크기를 지원합니다.
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'fit';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    // 👇 [수정] 'fit' 사이즈는 최대 너비를 지정하지 않아 내용물 크기에 맞춰집니다.
    fit: 'max-w-sm', // 기본적인 최대 너비는 유지하되, 내용물에 따라 줄어들 수 있음
  };

  const containerClasses = {
      default: 'max-h-[85vh] min-h-[60vh]',
      fit: 'max-h-[90vh]' // fit 사이즈는 최소 높이를 강제하지 않음
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4 text-center">
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
          onClick={onClose} 
        />
        
        <div className={cn(
          'relative bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:p-6 w-full flex flex-col',
          'animate-in fade-in-0 zoom-in-95 duration-300',
          sizes[size],
          size !== 'fit' && containerClasses.default, // fit이 아닐 때만 고정 높이 적용
          size === 'fit' && containerClasses.fit
        )}>
          <div className="flex items-center justify-between mb-4 pb-4 border-b">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <button onClick={onClose} className="rounded-md text-gray-400 hover:text-gray-600">
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};