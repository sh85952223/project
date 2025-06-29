import React from 'react';
import { useScheduleData } from '../../context/ScheduleContext'; // 1. 새로 만든 훅을 가져옵니다.
import { ClassInfo } from '../../types';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Users, BookOpen, UserX, TrendingUp, Plus } from 'lucide-react';

interface ClassCardProps {
  classInfo: ClassInfo;
  onClick: () => void;
  // 2. onAddSchedule props를 제거합니다. 모달 열기 로직은 Dashboard에서 담당합니다.
}

export const ClassCard: React.FC<ClassCardProps> = ({
  classInfo,
  onClick,
}) => {
  // 3. props 대신 context로부터 전체 스케줄 데이터를 가져옵니다.
  const { schedules } = useScheduleData();

  // 4. 컴포넌트 내에서 필요한 통계 데이터를 직접 계산합니다.
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

  return (
    <Card hover onClick={onClick}>
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
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Users className="h-4 w-4" /> <span>학생 수</span>
                </div>
                <span className="font-medium">{classInfo.students.length}명</span>
            </div>
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <BookOpen className="h-4 w-4" /> <span>총 수업</span>
                </div>
                <span className="font-medium">{stats.totalSessions}회</span>
            </div>
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <TrendingUp className="h-4 w-4" /> <span>완료 수업</span>
                </div>
                <span className="font-medium">{stats.completedSessions}회</span>
            </div>
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <UserX className="h-4 w-4" /> <span>총 결석</span>
                </div>
                <span className="font-medium">{stats.totalAbsences}건</span>
            </div>
        </div>

        <div className="mt-4 pt-4 border-t">
            <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${stats.progressRate}%` }} />
            </div>
            <p className="text-xs text-gray-500 mt-2">진도율 {Math.round(stats.progressRate)}%</p>
        </div>
      </CardContent>
    </Card>
  );
};
