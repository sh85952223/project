import React, { useState } from 'react';
import { useScheduleData } from '../../context/ScheduleContext'; // 1. 새로 만든 훅을 가져옵니다.
import { Schedule, Absence } from '../../types';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { SearchableDropdown } from '../ui/SearchableDropdown';
import { Calendar, Clock, BookOpen, UserX, Edit3, Save, X, Trash2, Hash } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';

// 2. props 타입을 수정합니다. classId만 받습니다.
interface ScheduleListProps {
  classId: string;
}

export const ScheduleList: React.FC<ScheduleListProps> = ({ classId }) => {
  // 3. Context로부터 필요한 데이터와 함수들을 모두 가져옵니다.
  const { schedules, classes, updateSchedule, deleteSchedule, isLoading } = useScheduleData();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<{ progress: string; absences: Absence[] }>({ progress: '', absences: [] });

  // 4. 전달받은 classId를 기준으로 현재 반의 정보와 수업 목록을 필터링합니다.
  const classInfo = classes.find(c => c.id === classId);
  const classSchedules = schedules
    .filter(s => s.classId === classId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleEdit = (schedule: Schedule) => {
    setEditingId(schedule.id);
    setEditData({
      progress: schedule.progress || '',
      absences: schedule.absences || [],
    });
  };

  const handleSave = async (scheduleId: string) => {
    if (!editData.progress.trim()) return;
    await updateSchedule(scheduleId, {
      progress: editData.progress.trim(),
      absences: editData.absences,
    });
    setEditingId(null);
  };
  
  // 나머지 핸들러 함수와 JSX는 이전과 거의 동일합니다.
  const handleCancel = () => {
    setEditingId(null);
  };

  const handleAbsenceToggle = (studentId: string, studentName: string, studentNumber?: number) => {
    setEditData(prev => {
      const isSelected = prev.absences.some(a => a.studentId === studentId);
      if (isSelected) {
        return { ...prev, absences: prev.absences.filter(a => a.studentId !== studentId) };
      } else {
        return { ...prev, absences: [...prev.absences, { studentId, studentName, studentNumber, reason: '' }] };
      }
    });
  };

  const handleAbsenceReasonChange = (studentId: string, reason: string) => {
    setEditData(prev => ({
      ...prev,
      absences: prev.absences.map(a =>
        a.studentId === studentId ? { ...a, reason } : a
      ),
    }));
  };

  if (classSchedules.length === 0) {
    return (
      <Card><CardContent className="text-center py-12">수업이 없습니다.</CardContent></Card>
    );
  }

  return (
    <div className="space-y-4">
      {classSchedules.map(schedule => {
        const isEditing = editingId === schedule.id;
        const studentOptions = classInfo?.students.map(s => ({ id: s.id, name: s.name, number: s.number })) || [];

        return (
          <Card key={schedule.id}>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-2"><Calendar className="h-4 w-4" /><span>{format(parseISO(schedule.date), 'PPP', { locale: ko })}</span></div>
                        <div className="flex items-center space-x-2"><Clock className="h-4 w-4" /><span>{schedule.time}</span></div>
                        <div className="flex items-center space-x-2"><BookOpen className="h-4 w-4" /><span>{schedule.subject}</span></div>
                    </div>
                    <div className="flex items-center space-x-2">
                        {schedule.progress && <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">완료</span>}
                        {isEditing ? (
                            <>
                                <Button size="sm" variant="ghost" onClick={() => handleSave(schedule.id)} disabled={isLoading}><Save className="h-4 w-4" /></Button>
                                <Button size="sm" variant="ghost" onClick={handleCancel} disabled={isLoading}><X className="h-4 w-4" /></Button>
                            </>
                        ) : (
                            <Button size="sm" variant="ghost" onClick={() => handleEdit(schedule)} disabled={isLoading}><Edit3 className="h-4 w-4" /></Button>
                        )}
                        <Button size="sm" variant="ghost" onClick={() => deleteSchedule(schedule.id)} className="text-red-600" disabled={isLoading}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">진도 내용</label>
                    {isEditing ? (
                        <Input value={editData.progress} onChange={(e) => setEditData(prev => ({ ...prev, progress: e.target.value }))} />
                    ) : (
                        <p className="p-3 bg-gray-50 rounded-lg">{schedule.progress || '진도 내용이 없습니다.'}</p>
                    )}
                </div>
                {classInfo && (
                     <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">결석생</label>
                        {isEditing ? (
                            <SearchableDropdown options={studentOptions} selectedIds={editData.absences.map(a => a.studentId)} onToggle={handleAbsenceToggle} />
                        ) : (
                            schedule.absences.length > 0 ? (
                                <ul className="space-y-1">
                                    {schedule.absences.map(a => <li key={a.studentId} className="text-sm">{a.studentName} {a.reason && `(${a.reason})`}</li>)}
                                </ul>
                            ) : <p className="text-sm text-gray-500">결석생이 없습니다.</p>
                        )}
                    </div>
                )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
