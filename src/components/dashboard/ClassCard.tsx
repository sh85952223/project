import React from 'react';
import { ClassInfo } from '../../types';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Users, BookOpen, UserX, TrendingUp, Plus, Calendar } from 'lucide-react';

interface ClassStats {
  totalSessions: number;
  completedSessions: number;
  totalAbsences: number;
  progressRate: number;
}

interface ClassCardProps {
  classInfo: ClassInfo;
  stats: ClassStats;
  onClick: () => void;
  onAddSchedule?: (classId: string) => void;
}

export const ClassCard: React.FC<ClassCardProps> = ({
  classInfo,
  stats,
  onClick,
  onAddSchedule,
}) => {
  const progressColor = stats.progressRate >= 80 
    ? 'text-green-600 bg-green-100' 
    : stats.progressRate >= 60 
    ? 'text-yellow-600 bg-yellow-100'
    : 'text-red-600 bg-red-100';

  const handleAddScheduleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // 카드 클릭 이벤트 방지
    if (onAddSchedule) {
      onAddSchedule(classInfo.id);
    }
  };

  const handleCardClick = () => {
    onClick();
  };

  return (
    <Card hover>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="cursor-pointer flex-1" onClick={handleCardClick}>
            <h3 className="text-lg font-semibold text-gray-900">{classInfo.name}</h3>
            <p className="text-sm text-gray-600">{classInfo.grade}학년</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${progressColor}`}>
              {Math.round(stats.progressRate)}%
            </div>
          </div>
        </div>

        <div className="space-y-3 cursor-pointer" onClick={handleCardClick}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">학생 수</span>
            </div>
            <span className="text-sm font-medium text-gray-900">
              {classInfo.students.length}명
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">총 수업</span>
            </div>
            <span className="text-sm font-medium text-gray-900">
              {stats.totalSessions}회
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">완료 수업</span>
            </div>
            <span className="text-sm font-medium text-gray-900">
              {stats.completedSessions}회
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <UserX className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">총 결석</span>
            </div>
            <span className="text-sm font-medium text-gray-900">
              {stats.totalAbsences}건
            </span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="w-full bg-gray-200 rounded-full h-2 cursor-pointer" onClick={handleCardClick}>
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(stats.progressRate, 100)}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-gray-500">
              진도율 {Math.round(stats.progressRate)}%
            </p>
            
            {/* 수업 추가 버튼 */}
            {onAddSchedule && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleAddScheduleClick}
                className="flex items-center space-x-1 text-xs px-2 py-1 h-6 border-blue-300 text-blue-600 hover:bg-blue-50"
                title={`${classInfo.name}에 수업 추가`}
              >
                <Plus className="h-3 w-3" />
                <span>수업 추가</span>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};