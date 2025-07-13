import React from 'react';
import { Button } from '../ui/Button';
import { Calendar, UserX, MessageSquare, Star, Filter } from 'lucide-react';

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
  const periodOptions: { value: PeriodFilter; label: string }[] = [
    { value: 'today', label: '오늘' },
    { value: 'week', label: '이번 주' },
    { value: 'month', label: '이번 달' },
    { value: 'all', label: '전체' }
  ];

  const handleContentFilterToggle = (filterKey: keyof ContentFilters) => {
    onContentFilterChange({
      ...contentFilters,
      [filterKey]: !contentFilters[filterKey]
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
      <div className="flex items-center space-x-2 text-sm font-medium text-gray-700">
        <Filter className="h-4 w-4" />
        <span>필터</span>
        <span className="text-gray-400">|</span>
        <span className="text-gray-500">
          {filteredCount}개 수업 (전체 {totalCount}개)
        </span>
      </div>

      {/* 기간 필터 */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-700">기간</h4>
        <div className="flex items-center space-x-2">
          {periodOptions.map(option => (
            <Button
              key={option.value}
              size="sm"
              variant={periodFilter === option.value ? 'primary' : 'outline'}
              onClick={() => onPeriodFilterChange(option.value)}
              className="transition-none"
            >
              <Calendar className="h-3 w-3 mr-1" />
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      {/* 내용 필터 */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-700">내용</h4>
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant={contentFilters.hasAbsences ? 'danger' : 'outline'}
            onClick={() => handleContentFilterToggle('hasAbsences')}
            className="transition-none"
          >
            <UserX className="h-3 w-3 mr-1" />
            결석 있음
          </Button>
          <Button
            size="sm"
            variant={contentFilters.hasPraises ? 'secondary' : 'outline'}
            onClick={() => handleContentFilterToggle('hasPraises')}
            className="transition-none"
            style={contentFilters.hasPraises ? { backgroundColor: '#FCD34D', color: '#92400E', borderColor: '#FCD34D' } : {}}
          >
            <Star className="h-3 w-3 mr-1" />
            칭찬 있음
          </Button>
          <Button
            size="sm"
            variant={contentFilters.hasNotes ? 'secondary' : 'outline'}
            onClick={() => handleContentFilterToggle('hasNotes')}
            className="transition-none"
            style={contentFilters.hasNotes ? { backgroundColor: '#A7F3D0', color: '#065F46', borderColor: '#A7F3D0' } : {}}
          >
            <MessageSquare className="h-3 w-3 mr-1" />
            특이사항 있음
          </Button>
        </div>
      </div>

      {/* 활성 필터 표시 */}
      {(contentFilters.hasAbsences || contentFilters.hasPraises || contentFilters.hasNotes) && (
        <div className="pt-2 border-t border-gray-100">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500">활성 필터:</span>
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
            <button
              onClick={() => onContentFilterChange({ hasAbsences: false, hasPraises: false, hasNotes: false })}
              className="text-xs text-gray-400 hover:text-gray-600 ml-2"
            >
              모두 해제
            </button>
          </div>
        </div>
      )}
    </div>
  );
};