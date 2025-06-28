import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
}) => {
  // 모달이 열릴 때 body 스크롤 방지
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
    sm: 'max-w-md max-h-[70vh]',
    md: 'max-w-lg max-h-[75vh]',
    lg: 'max-w-2xl max-h-[85vh]',
    xl: 'max-w-4xl max-h-[90vh]',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* 배경 오버레이 */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity duration-300" 
          onClick={onClose} 
        />
        
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
        
        {/* 모달 컨테이너 - 높이 증가 */}
        <div className={cn(
          'inline-block align-middle bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all duration-300 sm:my-8 sm:p-6 w-full',
          'animate-in fade-in-0 zoom-in-95 duration-300',
          'min-h-[60vh]', // 최소 높이 추가
          sizes[size]
        )}>
          {/* 헤더 */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <button
              onClick={onClose}
              className="rounded-md bg-white text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          {/* 모달 내용 - 스크롤 가능하고 더 큰 높이 */}
          <div className="flex-1 overflow-y-auto" style={{ maxHeight: 'calc(85vh - 120px)' }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};