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
  // 1. Context에서 모달을 여는 함수와 스케줄 데이터를 가져옵니다.
  const { schedules, openScheduleModal } = useScheduleData();

  // 컴포넌트 내에서 필요한 통계를 직접 계산합니다.
  const classSchedules = schedules.filter(s => s.classId === classInfo.id);
  const completedSessions = classSchedules.filter(s => s.progress).length;
  const totalAbsences = classSchedules.reduce((acc, s) => acc + (s.absences?.length || 0), 0);
  const progressRate = classSchedules.length > 0 ? (completedSessions / classSchedules.length) * 100 : 0;

  const stats = {
    totalSessions: classSchedules.length,
    completedSessions,
    totalAbsences,
    progressRate,
  };

  const progressColor = stats.progressRate >= 80 
    ? 'text-green-600 bg-green-100' 
    : stats.progressRate >= 60 
    ? 'text-yellow-600 bg-yellow-100'
    : 'text-red-600 bg-red-100';

  // 2. 버튼 클릭 시 모달 열기 함수를 호출하는 핸들러를 만듭니다.
  const handleAddScheduleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // 카드 전체가 클릭되는 것을 방지합니다.
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
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${progressColor}`}>
                {Math.round(stats.progressRate)}%
            </div>
            </div>

            <div className="space-y-3">
                <div className="flex items-center justify-between"><div className="flex items-center space-x-2 text-sm text-gray-600"><Users className="h-4 w-4" /> <span>학생 수</span></div><span className="font-medium">{classInfo.students.length}명</span></div>
                <div className="flex items-center justify-between"><div className="flex items-center space-x-2 text-sm text-gray-600"><BookOpen className="h-4 w-4" /> <span>총 수업</span></div><span className="font-medium">{stats.totalSessions}회</span></div>
                <div className="flex items-center justify-between"><div className="flex items-center space-x-2 text-sm text-gray-600"><TrendingUp className="h-4 w-4" /> <span>완료 수업</span></div><span className="font-medium">{stats.completedSessions}회</span></div>
                <div className="flex items-center justify-between"><div className="flex items-center space-x-2 text-sm text-gray-600"><UserX className="h-4 w-4" /> <span>총 결석</span></div><span className="font-medium">{stats.totalAbsences}건</span></div>
            </div>
        </CardContent>
      </div>
      <div className="px-6 pb-4">
        <div className="pt-4 border-t border-gray-200">
            <div className="w-full bg-gray-200 rounded-full h-2 cursor-pointer" onClick={onClick}>
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${stats.progressRate}%` }} />
            </div>
            <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-gray-500">진도율 {Math.round(stats.progressRate)}%</p>
                {/* 3. 사라졌던 '수업 추가' 버튼을 다시 추가하고, 핸들러를 연결합니다. */}
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
