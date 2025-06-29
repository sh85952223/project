import React from 'react';
import { Card, CardContent } from '../ui/Card';
import { ClassCard } from './ClassCard';
import { ClassInfo } from '../../types';

interface ClassStatusProps {
  groupedClasses: Record<number, ClassInfo[]>;
  onClassClick: (classId: string) => void;
}

export const ClassStatus: React.FC<ClassStatusProps> = ({ groupedClasses, onClassClick }) => {
  return (
    <div className="space-y-8">
      <h2 className="text-lg font-semibold text-gray-900">반별 현황</h2>
      {Object.keys(groupedClasses).length > 0 ? Object.keys(groupedClasses).sort().map(grade => (
        <div key={grade}>
          <h3 className="text-xl font-semibold mb-3">{grade}학년</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groupedClasses[Number(grade)].map(classInfo => (
              <ClassCard key={classInfo.id} classInfo={classInfo} onClick={() => onClassClick(classInfo.id)} />
            ))}
          </div>
        </div>
      )) : (
        <Card><CardContent className="text-center py-12"><p>아직 등록된 반이 없습니다.</p></CardContent></Card>
      )}
    </div>
  );
};