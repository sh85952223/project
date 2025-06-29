import React, { useState, useEffect } from 'react';
import { useScheduleData } from '../../context/ScheduleContext';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { SearchableDropdown } from '../ui/SearchableDropdown';
import { Absence } from '../../types';
import { UserX, BookOpen, Hash } from 'lucide-react';

// 이제 이 컴포넌트는 props를 받지 않고, Context에서 직접 상태를 가져옵니다.
export const ProgressInputModal: React.FC = () => {
  const { 
    isProgressModalOpen, 
    closeProgressModal, 
    editingScheduleId, 
    schedules, 
    classes, 
    updateSchedule 
  } = useScheduleData();

  const schedule = schedules.find(s => s.id === editingScheduleId);
  const classInfo = schedule ? classes.find(c => c.id === schedule.classId) : undefined;

  const [progress, setProgress] = useState('');
  const [absences, setAbsences] = useState<Absence[]>([]);

  useEffect(() => {
    if (isProgressModalOpen && schedule) {
      setProgress(schedule.progress || '');
      setAbsences(schedule.absences || []);
    }
  }, [isProgressModalOpen, schedule]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!progress.trim() || !editingScheduleId) return;
    await updateSchedule(editingScheduleId, { progress, absences });
    closeProgressModal();
  };
  
  const handleAbsenceToggle = (studentId: string, studentName: string, studentNumber?: number) => {
    const isSelected = absences.some(a => a.studentId === studentId);
    if (isSelected) {
      setAbsences(prev => prev.filter(a => a.studentId !== studentId));
    } else {
      setAbsences(prev => [...prev, { studentId, studentName, studentNumber, reason: '' }]);
    }
  };

   const handleAbsenceReasonChange = (studentId: string, reason: string) => {
    setAbsences(prev => prev.map(a =>
      a.studentId === studentId ? { ...a, reason } : a
    ));
  };

  if (!isProgressModalOpen || !schedule) return null;

  const studentOptions = classInfo?.students?.map(s => ({ id: s.id, name: s.name, number: s.number })) || [];

  return (
    <Modal isOpen={isProgressModalOpen} onClose={closeProgressModal} title="진도 및 결석생 입력" size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="font-medium">{schedule.time} {classInfo?.name} - {schedule.subject}</p>
        </div>
        <div>
          <label className="flex items-center space-x-2 mb-2">
            <BookOpen className="h-5 w-5 text-blue-600" />
            <span className="font-medium text-gray-800">진도 내용 *</span>
          </label>
          <Input value={progress} onChange={(e) => setProgress(e.target.value)} />
        </div>
        {classInfo && studentOptions.length > 0 && (
            <div>
                <label className="flex items-center space-x-2 mb-2">
                    <UserX className="h-5 w-5 text-red-600" />
                    <span className="font-medium text-gray-800">결석생</span>
                </label>
                <SearchableDropdown options={studentOptions} selectedIds={absences.map(a => a.studentId)} onToggle={handleAbsenceToggle} placeholder="결석생 선택"/>
                {absences.length > 0 && (
                    <div className="space-y-3 mt-4 pt-4 border-t">
                        <h4 className="text-sm font-medium text-gray-700">결석 사유</h4>
                        {absences.map(absence => (
                             <div key={absence.studentId} className="flex items-center space-x-3">
                                <div className="flex items-center space-x-2 w-24 flex-shrink-0">
                                <div className="flex items-center space-x-1 text-xs text-gray-500">
                                    <Hash className="h-3 w-3" />
                                    <span className="w-4 text-center font-mono">{absence.studentNumber || '-'}</span>
                                </div>
                                <span className="text-sm font-medium text-red-700">{absence.studentName}</span>
                                </div>
                                <Input type="text" value={absence.reason} onChange={(e) => handleAbsenceReasonChange(absence.studentId, e.target.value)} placeholder="결석 사유 (예: 감기)" className="flex-1" />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )}
        <div className="flex justify-end space-x-3 pt-6 border-t">
            <Button type="button" variant="outline" onClick={closeProgressModal}>취소</Button>
            <Button type="submit" disabled={!progress.trim()}>저장</Button>
        </div>
      </form>
    </Modal>
  );
};