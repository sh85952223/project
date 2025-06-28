import React, { useState } from 'react';
import { Schedule, ClassInfo, Absence } from '../../types';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { SearchableDropdown } from '../ui/SearchableDropdown';
import { useSchedules } from '../../hooks/useSchedules';
import { Calendar, Clock, BookOpen, Users, UserX, Edit3, Save, X, Trash2, Eraser, Hash } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';

interface ScheduleListProps {
  schedules: Schedule[];
  classInfo?: ClassInfo;
}

export const ScheduleList: React.FC<ScheduleListProps> = ({
  schedules: propSchedules,
  classInfo,
}) => {
  const { updateSchedule, deleteSchedule, clearProgress, schedules: allSchedules, isLoading: globalLoading } = useSchedules();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<{
    progress: string;
    absences: Absence[];
  }>({ progress: '', absences: [] });
  const [localLoading, setLocalLoading] = useState<string | null>(null);

  // 항상 최신 상태의 스케줄을 사용
  const currentSchedules = classInfo 
    ? allSchedules.filter(s => s.classId === classInfo.id)
    : allSchedules;

  const sortedSchedules = [...currentSchedules].sort((a, b) => 
    new Date(b.date + ' ' + b.time).getTime() - new Date(a.date + ' ' + a.time).getTime()
  );

  const handleEdit = (schedule: Schedule) => {
    setEditingId(schedule.id);
    setEditData({
      progress: schedule.progress || '',
      absences: schedule.absences || [],
    });
  };

  const handleSave = async (scheduleId: string) => {
    if (!editData.progress.trim()) {
      alert('진도 내용을 입력해주세요.');
      return;
    }

    setLocalLoading(scheduleId);
    try {
      console.log('ScheduleList: Saving progress for:', scheduleId);
      await updateSchedule(scheduleId, {
        progress: editData.progress.trim(),
        absences: editData.absences,
      });
      console.log('ScheduleList: Progress saved successfully');

      setEditingId(null);
      setEditData({ progress: '', absences: [] });
    } catch (error) {
      console.error('Failed to save progress:', error);
      alert('저장에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLocalLoading(null);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditData({ progress: '', absences: [] });
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    if (confirm('이 수업을 완전히 삭제하시겠습니까?')) {
      setLocalLoading(scheduleId);
      try {
        console.log('ScheduleList: Deleting schedule:', scheduleId);
        await deleteSchedule(scheduleId);
        console.log('ScheduleList: Schedule deleted successfully');
      } catch (error) {
        console.error('Failed to delete schedule:', error);
        alert('삭제에 실패했습니다. 다시 시도해주세요.');
      } finally {
        setLocalLoading(null);
      }
    }
  };

  const handleDeleteProgress = async (scheduleId: string) => {
    if (confirm('진도 내용을 삭제하시겠습니까?')) {
      setLocalLoading(scheduleId);
      try {
        console.log('ScheduleList: Attempting to clear progress for:', scheduleId);
        const result = await clearProgress(scheduleId);
        console.log('ScheduleList: Clear progress result:', result);
        
        if (result) {
          console.log('ScheduleList: Progress cleared successfully');
          // 편집 모드였다면 종료
          if (editingId === scheduleId) {
            setEditingId(null);
            setEditData({ progress: '', absences: [] });
          }
        } else {
          throw new Error('Clear progress returned false');
        }
      } catch (error) {
        console.error('ScheduleList: Failed to clear progress:', error);
        alert('삭제에 실패했습니다. 다시 시도해주세요.');
      } finally {
        setLocalLoading(null);
      }
    }
  };

  const handleAbsenceToggle = (studentId: string, studentName: string, studentNumber?: number) => {
    const existingIndex = editData.absences.findIndex(a => a.studentId === studentId);
    
    if (existingIndex >= 0) {
      setEditData(prev => ({
        ...prev,
        absences: prev.absences.filter(a => a.studentId !== studentId),
      }));
    } else {
      setEditData(prev => ({
        ...prev,
        absences: [...prev.absences, { 
          studentId, 
          studentName, 
          studentNumber,
          reason: '' 
        }],
      }));
    }
  };

  const handleAbsenceReasonChange = (studentId: string, reason: string) => {
    setEditData(prev => ({
      ...prev,
      absences: prev.absences.map(a =>
        a.studentId === studentId ? { ...a, reason } : a
      ),
    }));
  };

  if (sortedSchedules.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">수업이 없습니다</h3>
          <p className="text-gray-600">아직 등록된 수업이 없습니다.</p>
        </CardContent>
      </Card>
    );
  }

  // 학생을 번호순으로 정렬
  const sortedStudents = classInfo?.students.sort((a, b) => (a.number || 0) - (b.number || 0)) || [];

  // 드롭다운용 옵션 변환
  const studentOptions = sortedStudents.map(student => ({
    id: student.id,
    name: student.name,
    number: student.number,
  }));

  return (
    <div className="space-y-4">
      {sortedSchedules.map(schedule => {
        const isEditing = editingId === schedule.id;
        const isScheduleLoading = localLoading === schedule.id || globalLoading;
        const scheduleDate = parseISO(schedule.date);
        const selectedStudentIds = isEditing ? editData.absences.map(a => a.studentId) : [];

        return (
          <Card key={schedule.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>{format(scheduleDate, 'PPP', { locale: ko })}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>{schedule.time}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <BookOpen className="h-4 w-4" />
                    <span>{schedule.subject}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {schedule.progress ? (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                      완료
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">
                      진행 전
                    </span>
                  )}
                  
                  {!isEditing ? (
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(schedule)}
                        title="수정"
                        disabled={isScheduleLoading}
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      {schedule.progress && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteProgress(schedule.id)}
                          className="text-orange-600 hover:text-orange-800 hover:bg-orange-50"
                          title="진도 내용만 삭제"
                          disabled={isScheduleLoading}
                        >
                          <Eraser className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteSchedule(schedule.id)}
                        className="text-red-600 hover:text-red-800 hover:bg-red-50"
                        title="수업 완전 삭제"
                        disabled={isScheduleLoading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSave(schedule.id)}
                        className="text-green-600 hover:text-green-800 hover:bg-green-50"
                        title="저장"
                        disabled={isScheduleLoading || !editData.progress.trim()}
                      >
                        <Save className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCancel}
                        className="text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                        title="취소"
                        disabled={isScheduleLoading}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                {/* Progress Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    진도 내용
                  </label>
                  {isEditing ? (
                    <Input
                      type="text"
                      value={editData.progress}
                      onChange={(e) => setEditData(prev => ({ ...prev, progress: e.target.value }))}
                      placeholder="진도 내용을 입력하세요 (예: 1단원 집합의 기본 개념)"
                      className="w-full"
                      disabled={isScheduleLoading}
                    />
                  ) : (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      {schedule.progress ? (
                        <p className="text-gray-900">{schedule.progress}</p>
                      ) : (
                        <div className="flex items-center justify-between">
                          <p className="text-gray-500 italic">진도 내용이 입력되지 않았습니다.</p>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(schedule)}
                            className="ml-3"
                            disabled={isScheduleLoading}
                          >
                            입력하기
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Absence Section */}
                {classInfo && (
                  <div>
                    <div className="flex items-center space-x-2 mb-3">
                      <UserX className="h-4 w-4 text-gray-500" />
                      <label className="text-sm font-medium text-gray-700">
                        결석생 관리
                      </label>
                      {isEditing && (
                        <span className="text-xs text-gray-500">
                          ({sortedStudents.length}명 중 {editData.absences.length}명 결석)
                        </span>
                      )}
                    </div>
                    
                    {isEditing ? (
                      <div className="space-y-3">
                        {/* 검색 가능한 드롭다운 */}
                        <SearchableDropdown
                          options={studentOptions}
                          selectedIds={selectedStudentIds}
                          onToggle={handleAbsenceToggle}
                          placeholder="결석생을 선택하세요"
                          disabled={isScheduleLoading}
                        />
                        
                        {/* 결석 사유 입력 */}
                        {editData.absences.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="text-sm font-medium text-gray-700">결석 사유</h4>
                            {editData.absences.map(absence => (
                              <div key={absence.studentId} className="flex items-center space-x-3">
                                <div className="flex items-center space-x-2 w-24 flex-shrink-0">
                                  <div className="flex items-center space-x-1 text-xs text-gray-500">
                                    <Hash className="h-3 w-3" />
                                    <span className="w-4 text-center font-mono">
                                      {absence.studentNumber || '-'}
                                    </span>
                                  </div>
                                  <span className="text-sm text-gray-600">
                                    {absence.studentName}
                                  </span>
                                </div>
                                <Input
                                  type="text"
                                  value={absence.reason}
                                  onChange={(e) => handleAbsenceReasonChange(absence.studentId, e.target.value)}
                                  placeholder="결석 사유"
                                  className="flex-1"
                                  disabled={isScheduleLoading}
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div>
                        {schedule.absences.length > 0 ? (
                          <div className="space-y-2">
                            {schedule.absences.map(absence => (
                              <div
                                key={absence.studentId}
                                className="flex items-center justify-between p-2 bg-red-50 rounded-lg"
                              >
                                <div className="flex items-center space-x-2">
                                  <div className="flex items-center space-x-1 text-xs text-gray-500">
                                    <Hash className="h-3 w-3" />
                                    <span className="w-4 text-center font-mono">
                                      {absence.studentNumber || '-'}
                                    </span>
                                  </div>
                                  <span className="text-sm font-medium text-red-800">
                                    {absence.studentName}
                                  </span>
                                </div>
                                <span className="text-sm text-red-600">
                                  {absence.reason || '사유 없음'}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-600 bg-green-50 p-3 rounded-lg">
                            결석생이 없습니다.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};