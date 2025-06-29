import React from 'react';
import { useScheduleData } from '../../context/ScheduleContext';
import { ClassInfo } from '../../types';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Users, BookOpen, UserX, TrendingUp, Plus } from 'lucide-react';

interface ClassCardProps {
  classInfo: ClassInfo;
  onClick: () => void;
}

export const ClassCard: React.FC<ClassCardProps> = ({
  classInfo,
  onClick,
}) => {
  const { schedules, openScheduleModal } = useScheduleData();

  const classSchedules = schedules.filter(s => s.classId === classInfo.id);
  const completedSessions = classSchedules.filter(s => s.progress).length;
  const totalAbsences = classSchedules.reduce((acc, s) => acc + (s.absences?.length || 0), 0);
  const progressRate = classSchedules.length > 0 ? (completedSessions / classSchedules.length) * 100 : 0;

  const handleAddScheduleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    openScheduleModal(classInfo.id);
  };

  return (
    <Card hover>
      <div onClick={onClick} className="cursor-pointer">
        <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
            <div>
                <h3 className="text-lg font-semibold text-gray-900">{classInfo.name}</h3>
                <p className="text-sm text-gray-600">{classInfo.grade}학년</p>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${progressRate >= 80 ? 'bg-green-100 text-green-800' : progressRate >= 40 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                {Math.round(progressRate)}%
            </div>
            </div>

            <div className="space-y-3">
                <div className="flex items-center justify-between"><div className="flex items-center space-x-2 text-sm text-gray-600"><Users className="h-4 w-4" /> <span>학생 수</span></div><span className="font-medium">{classInfo.students.length}명</span></div>
                <div className="flex items-center justify-between"><div className="flex items-center space-x-2 text-sm text-gray-600"><BookOpen className="h-4 w-4" /> <span>총 수업</span></div><span className="font-medium">{classSchedules.length}회</span></div>
                <div className="flex items-center justify-between"><div className="flex items-center space-x-2 text-sm text-gray-600"><TrendingUp className="h-4 w-4" /> <span>완료 수업</span></div><span className="font-medium">{completedSessions}회</span></div>
                {/* 👈 [수정] 총 결석 부분 UI 개선 */}
                <div className="flex items-center justify-between">
                    <div className={`flex items-center space-x-2 text-sm ${totalAbsences > 0 ? 'text-red-500' : 'text-gray-600'}`}>
                        <UserX className="h-4 w-4" /> 
                        <span>총 결석</span>
                    </div>
                    <span className={`font-medium ${totalAbsences > 0 ? 'text-red-600 font-medium' : 'text-gray-800'}`}>
                        {totalAbsences}건
                    </span>
                </div>
            </div>
        </CardContent>
      </div>
      <div className="px-6 pb-4">
        <div className="pt-4 border-t border-gray-200">
            <div className="w-full bg-gray-200 rounded-full h-2 cursor-pointer" onClick={onClick}>
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${progressRate}%` }} />
            </div>
            <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-gray-500">진도율 {Math.round(progressRate)}%</p>
                <Button
                    size="sm"
                    variant="outline"
                    onClick={handleAddScheduleClick}
                    className="flex items-center space-x-1 text-xs px-2 py-1 h-auto"
                >
                    <Plus className="h-3 w-3" />
                    <span>수업 추가</span>
                </Button>
            </div>
        </div>
      </div>
    </Card>
  );
};