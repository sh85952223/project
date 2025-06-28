import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, X, Hash } from 'lucide-react';
import { cn } from '../../utils/cn';

interface Option {
  id: string;
  name: string;
  number?: number;
}

interface SearchableDropdownProps {
  options: Option[];
  selectedIds: string[];
  onToggle: (id: string, name: string, number?: number) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export const SearchableDropdown: React.FC<SearchableDropdownProps> = ({
  options,
  selectedIds,
  onToggle,
  placeholder = "선택하세요",
  disabled = false,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // 검색어에 따른 필터링
  const filteredOptions = options.filter(option => {
    const searchLower = searchTerm.toLowerCase();
    const nameMatch = option.name.toLowerCase().includes(searchLower);
    const numberMatch = option.number?.toString().includes(searchTerm);
    return nameMatch || numberMatch;
  });

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // 모달이 열려있을 때 body 스크롤 방지
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // 드롭다운이 열릴 때 검색 입력창에 포커스
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  const handleToggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      if (!isOpen) {
        setSearchTerm('');
      }
    }
  };

  const handleOptionClick = (option: Option) => {
    onToggle(option.id, option.name, option.number);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm('');
    searchInputRef.current?.focus();
  };

  const selectedCount = selectedIds.length;
  const displayText = selectedCount > 0 
    ? `${selectedCount}명 선택됨` 
    : placeholder;

  return (
    <>
      {/* 배경 오버레이 - 드롭다운이 열렸을 때만 표시 */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-25"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div ref={dropdownRef} className={cn("relative", className)}>
        {/* 드롭다운 버튼 */}
        <button
          type="button"
          onClick={handleToggleDropdown}
          disabled={disabled}
          className={cn(
            "w-full flex items-center justify-between p-3 border border-gray-300 rounded-lg bg-white transition-all duration-200",
            "hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
            disabled && "opacity-50 cursor-not-allowed",
            isOpen && "ring-2 ring-blue-500 border-transparent shadow-lg z-50 relative"
          )}
        >
          <span className={cn(
            "text-sm transition-colors duration-200",
            selectedCount > 0 ? "text-gray-900 font-medium" : "text-gray-500"
          )}>
            {displayText}
          </span>
          <ChevronDown className={cn(
            "h-4 w-4 text-gray-500 transition-all duration-300",
            isOpen && "rotate-180 text-blue-500"
          )} />
        </button>

        {/* 드롭다운 메뉴 - 완전히 새로운 구조 */}
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-2xl border border-gray-300 w-full max-w-md max-h-[80vh] flex flex-col">
              {/* 헤더 */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
                <h3 className="text-lg font-medium text-gray-900">결석생 선택</h3>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* 검색 입력창 */}
              <div className="p-4 border-b border-gray-200">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    placeholder="이름 또는 번호로 검색..."
                    className="w-full pl-10 pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={clearSearch}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* 옵션 리스트 - 스크롤 영역 */}
              <div className="flex-1 overflow-y-auto min-h-0">
                {filteredOptions.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {filteredOptions.map((option) => {
                      const isSelected = selectedIds.includes(option.id);
                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => handleOptionClick(option)}
                          className={cn(
                            "w-full flex items-center justify-between p-4 text-left transition-all duration-150",
                            "hover:bg-gray-50 focus:outline-none focus:bg-gray-50 active:bg-gray-100",
                            isSelected && "bg-red-50 text-red-800 hover:bg-red-100"
                          )}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-1 text-xs text-gray-500">
                              <Hash className="h-3 w-3" />
                              <span className="w-6 text-center font-mono">
                                {option.number || '-'}
                              </span>
                            </div>
                            <span className="text-sm font-medium">{option.name}</span>
                          </div>
                          {isSelected && (
                            <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-8 text-center text-sm text-gray-500">
                    <div className="flex flex-col items-center space-y-3">
                      <Search className="h-12 w-12 text-gray-300" />
                      <p className="text-base font-medium">
                        {searchTerm ? '검색 결과가 없습니다' : '학생이 없습니다'}
                      </p>
                      {searchTerm && (
                        <p className="text-xs text-gray-400">
                          다른 검색어를 시도해보세요
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* 하단 요약 */}
              <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    전체 {options.length}명 중 <span className="font-medium text-red-600">{selectedCount}명 선택</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    완료
                  </button>
                </div>
                
                {/* 선택된 학생 미리보기 */}
                {selectedCount > 0 && (
                  <div className="mt-3">
                    <div className="text-xs text-gray-500 mb-2">선택된 학생:</div>
                    <div className="flex flex-wrap gap-1">
                      {selectedIds.slice(0, 4).map((id) => {
                        const option = options.find(opt => opt.id === id);
                        return option ? (
                          <span
                            key={id}
                            className="inline-flex items-center px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full"
                          >
                            {option.number && (
                              <span className="mr-1 font-mono">#{option.number}</span>
                            )}
                            {option.name}
                          </span>
                        ) : null;
                      })}
                      {selectedCount > 4 && (
                        <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          +{selectedCount - 4}명 더
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};