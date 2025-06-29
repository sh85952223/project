    import React from 'react';
    import { cn } from '../../utils/cn';

    interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
      label?: string;
      error?: string;
    }

    export const Input: React.FC<InputProps> = ({
      className,
      label,
      error,
      id,
      ...props
    }) => {
      const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

      return (
        <div className="w-full">
          {label && (
            <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
              {label}
            </label>
          )}
          {/* Tailwind 클래스 대신 중앙에서 관리하는 .form-input 클래스를 사용합니다. */}
          <input
            id={inputId}
            className={cn(
              'form-input', // 공통 스타일 적용
              error && 'border-red-500 focus:ring-red-500', // 에러 스타일은 덮어쓰기
              className
            )}
            {...props}
          />
          {error && (
            <p className="mt-1 text-sm text-red-600">{error}</p>
          )}
        </div>
      );
    };
    