import React from 'react';
import { Button } from '../ui/Button';
import { ArrowUpDown } from 'lucide-react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { getSubjectColor } from '../../utils/colorUtils';
import { Period } from '../../hooks/useStudentStats';

type SortKey = 'default' | 'absences' | 'stars' | 'notes';

interface StudentListFiltersProps {
  period: Period;
  selectedSubjects: string[];
  sortKey: SortKey;
  onFilterChange: (newFilters: { period?: Period; subjects?: string[]; sortKey?: SortKey }) => void;
}

export const StudentListFilters: React.FC<StudentListFiltersProps> = ({
  period,
  selectedSubjects,
  sortKey,
  onFilterChange,
}) => {
  const [subjects] = useLocalStorage<string[]>('settings:subjects', ['기술', '가정']);

  const handleSubjectToggle = (subject: string) => {
    const newSubjects = selectedSubjects.includes(subject)
      ? selectedSubjects.filter(s => s !== subject)
      : [...selectedSubjects, subject];
    onFilterChange({ subjects: newSubjects });
  };

  return (
    <div className="space-y-4">
        <div className="space-y-4 rounded-lg border bg-white/50 p-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium">과목 필터:</span>
                    {/* 👇 [수정] '전체' 버튼을 완전히 제거했습니다. */}
                    {subjects.map(subject => (
                        <button 
                            key={subject}
                            onClick={() => handleSubjectToggle(subject)}
                            className={`px-3 py-1 text-sm font-semibold rounded-full border-2 ${
                                selectedSubjects.includes(subject)
                                ? 'border-blue-500 opacity-100' 
                                : 'border-transparent opacity-50 hover:opacity-100'
                            }`}
                            style={{ backgroundColor: getSubjectColor(subject), color: '#1f2937' }}
                        >
                            {subject}
                        </button>
                    ))}
                </div>
                <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium">기간 필터:</span>
                    <select value={period} onChange={(e) => onFilterChange({ period: e.target.value as Period })} className="form-input text-sm py-1.5">
                        <option value="today">오늘</option>
                        <option value="week">이번 주</option>
                        <option value="month">이번 달</option>
                        <option value="semester1">1학기</option>
                        <option value="semester2">2학기</option>
                        <option value="total">총 합계</option>
                    </select>
                </div>
            </div>
        </div>
        <div className="flex items-center space-x-2 border-t pt-4">
            <span className="text-sm font-medium mr-2">정렬:</span>
            <Button size="sm" variant={sortKey === 'default' ? 'primary' : 'outline'} onClick={() => onFilterChange({ sortKey: 'default' })}>
              <ArrowUpDown className="h-4 w-4 mr-1"/>기본 (번호순)
            </Button>
            <Button size="sm" variant={sortKey === 'absences' ? 'primary' : 'outline'} onClick={() => onFilterChange({ sortKey: 'absences' })}>결석 많은 순</Button>
            <Button size="sm" variant={sortKey === 'stars' ? 'primary' : 'outline'} onClick={() => onFilterChange({ sortKey: 'stars' })}>칭찬 많은 순</Button>
            <Button size="sm" variant={sortKey === 'notes' ? 'primary' : 'outline'} onClick={() => onFilterChange({ sortKey: 'notes' })}>기록 많은 순</Button>
        </div>
    </div>
  );
};