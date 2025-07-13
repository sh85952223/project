import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Calendar, UserX, MessageSquare, Star, Filter, ChevronDown, ChevronUp } from 'lucide-react';

export type PeriodFilter = 'today' | 'week' | 'month' | 'all';

export interface ContentFilters {
  hasAbsences: boolean;
  hasPraises: boolean;
  hasNotes: boolean;
}

interface LessonDetailFiltersProps {
  periodFilter: PeriodFilter;
  onPeriodFilterChange: (period: PeriodFilter) => void;
  contentFilters: ContentFilters;
  onContentFilterChange: (filters: ContentFilters) => void;
  totalCount: number;
  filteredCount: number;
}

export const LessonDetailFilters: React.FC<LessonDetailFiltersProps> = ({
  periodFilter,
  onPeriodFilterChange,
  contentFilters,
  onContentFilterChange,
  totalCount,
  filteredCount
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const periodOptions: { value: PeriodFilter; label: string }[] = [
    { value: 'all', label: '전체' },
    { value: 'today', label: '오늘' },
    { value: 'week', label: '이번 주' },
    { value: 'month', label: '이번 달' }
  ];

  const handleContentFilterToggle = (filterKey: keyof ContentFilters) => {
    onContentFilterChange({
      ...contentFilters,
      [filterKey]: !contentFilters[filterKey]
    });
  };

  const activeFiltersCount = (
    (periodFilter !== 'all' ? 1 : 0) +
    (contentFilters.hasAbsences ? 1 : 0) +
    (contentFilters.hasPraises ? 1 : 0) +
    (contentFilters.hasNotes ? 1 : 0)
  );

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      {/* 필터 헤더 - 항상 표시 */}
      <div 
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 text-sm font-medium text-gray-700">
            <Filter className="h-4 w-4" />
            <span>필터</span>
          </div>
          <span className="text-gray-400">|</span>
          <span className="text-sm text-gray-500">
            {filteredCount}개 수업 (전체 {totalCount}개)
          </span>
          {activeFiltersCount > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {/* 활성 필터 미리보기 */}
          {!isExpanded && activeFiltersCount > 0 && (
            <div className="flex items-center space-x-1">
              {periodFilter !== 'all' && (
                <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                  <Calendar className="h-3 w-3 mr-1" />
                  {periodOptions.find(p => p.value === periodFilter)?.label}
                </span>
              )}
              {contentFilters.hasAbsences && (
                <span className="inline-flex items-center px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                  <UserX className="h-3 w-3 mr-1" />
                  결석
                </span>
              )}
              {contentFilters.hasPraises && (
                <span className="inline-flex items-center px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                  <Star className="h-3 w-3 mr-1" />
                  칭찬
                </span>
              )}
              {contentFilters.hasNotes && (
                <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                  <MessageSquare className="h-3 w-3 mr-1" />
                  특이사항
                </span>
              )}
            </div>
          )}
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-gray-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-400" />
          )}
        </div>
      </div>

      {/* 필터 옵션 - 토글 시에만 표시 */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-100 bg-gray-50">
          <div className="flex flex-wrap items-center gap-4 pt-3">
            {/* 기간 필터 */}
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700 whitespace-nowrap">기간:</span>
              {periodOptions.map(option => (
                <Button
                  key={option.value}
                  size="sm"
                  variant={periodFilter === option.value ? 'primary' : 'outline'}
                  onClick={() => onPeriodFilterChange(option.value)}
                  className="transition-none whitespace-nowrap"
                >
                  <Calendar className="h-3 w-3 mr-1" />
                  {option.label}
                </Button>
              ))}
            </div>

            <span className="text-gray-300">|</span>

            {/* 내용 필터 */}
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700 whitespace-nowrap">내용:</span>
              <Button
                size="sm"
                variant={contentFilters.hasAbsences ? 'danger' : 'outline'}
                onClick={() => handleContentFilterToggle('hasAbsences')}
                className="transition-none whitespace-nowrap"
              >
                <UserX className="h-3 w-3 mr-1" />
                결석 있음
              </Button>
              <Button
                size="sm"
                variant={contentFilters.hasPraises ? 'secondary' : 'outline'}
                onClick={() => handleContentFilterToggle('hasPraises')}
                className="transition-none whitespace-nowrap"
                style={contentFilters.hasPraises ? { backgroundColor: '#FCD34D', color: '#92400E', borderColor: '#FCD34D' } : {}}
              >
                <Star className="h-3 w-3 mr-1" />
                칭찬 있음
              </Button>
              <Button
                size="sm"
                variant={contentFilters.hasNotes ? 'secondary' : 'outline'}
                onClick={() => handleContentFilterToggle('hasNotes')}
                className="transition-none whitespace-nowrap"
                style={contentFilters.hasNotes ? { backgroundColor: '#A7F3D0', color: '#065F46', borderColor: '#A7F3D0' } : {}}
              >
                <MessageSquare className="h-3 w-3 mr-1" />
                특이사항 있음
              </Button>
            </div>

            {/* 초기화 버튼 */}
            {activeFiltersCount > 0 && (
              <>
                <span className="text-gray-300">|</span>
                <button
                  onClick={() => {
                    onPeriodFilterChange('all');
                    onContentFilterChange({ hasAbsences: false, hasPraises: false, hasNotes: false });
                  }}
                  className="text-sm text-gray-500 hover:text-gray-700 whitespace-nowrap"
                >
                  모든 필터 해제
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};