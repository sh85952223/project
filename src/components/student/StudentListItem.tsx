import React from 'react';
import { Student } from '../../types';
import { UserX, MessageSquare, Star } from 'lucide-react';

interface StudentListItemProps {
  student: Student;
  stats: {
    stars: number;
    notes: number;
    absences: number;
  };
  periodLabel: string;
  onClick: () => void;
}

export const StudentListItem: React.FC<StudentListItemProps> = ({ student, stats, periodLabel, onClick }) => {
  return (
    <li onClick={onClick} className="p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer">
      <div className="flex items-center">
        <span className="w-8 text-center text-gray-500 font-mono text-sm">{student.number || '-'}</span>
        <span className="font-medium text-gray-800">{student.name}</span>
      </div>
      <div className="flex items-center space-x-4 text-sm">
        <div className={`flex items-center ${stats.stars > 0 ? 'text-yellow-600' : 'text-gray-400'}`}>
          <Star className="h-4 w-4 mr-1"/>
          <span>{periodLabel} 별 {stats.stars}개</span>
        </div>
        <div className={`flex items-center ${stats.notes > 0 ? 'text-green-600' : 'text-gray-400'}`}>
          <MessageSquare className="h-4 w-4 mr-1"/>
          <span>{periodLabel} 기록 {stats.notes}건</span>
        </div>
        <div className={`flex items-center ${stats.absences > 0 ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>
          <UserX className="h-4 w-4 mr-1"/>
          <span>{periodLabel} 결석 {stats.absences}회</span>
        </div>
      </div>
    </li>
  );
};