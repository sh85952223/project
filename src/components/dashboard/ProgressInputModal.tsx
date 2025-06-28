import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { SearchableDropdown } from '../ui/SearchableDropdown';
import { Schedule, ClassInfo, Absence } from '../../types';
import { UserX, BookOpen, Hash } from 'lucide-react';

interface ProgressInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (progress: string, absences: Absence[]) => Promise<void>;
  schedule: Schedule;
  classInfo?: ClassInfo;
}

export const ProgressInputModal: React.FC<ProgressInputModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  schedule,
  classInfo,
}) => {
  const [progress, setProgress] = useState(schedule.progress || '');
  const [absences, setAbsences] = useState<Absence[]>(schedule.absences || []);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!progress.trim()) {
      newErrors.progress = '진도 내용을 입력해주세요';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(progress.trim(), absences);
      onClose();
    } catch (error) {
      console.error('Failed to save progress:', error);
      setErrors({ general: '저장에 실패했습니다. 다시 시도해주세요.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAbsenceToggle = (studentId: string, studentName: string, studentNumber?: number) => {
    const existingIndex = absences.findIndex(a => a.studentId === studentId);
    
    if (existingIndex >= 0) {
      setAbsences(prev => prev.filter(a => a.studentId !== studentId));
    } else {
      setAbsences(prev => [...prev, { 
        studentId, 
        studentName, 
        studentNumber,
        reason: '' 
      }]);
    }
  };

  const handleAbsenceReasonChange = (studentId: string, reason: string) => {
    setAbsences(prev => prev.map(a =>
      a.studentId === studentId ? { ...a, reason } : a
    ));
  };

  // 모달이 열릴 때마다 상태 초기화
  React.useEffect(() => {
    if (isOpen) {
      setProgress(schedule.progress || '');
      setAbsences(schedule.absences || []);
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen, schedule.progress, schedule.absences]);

  // 학생을 번호순으로 정렬
  const sortedStudents = classInfo?.students.sort((a, b) => (a.number || 0) - (b.number || 0)) || [];

  // 드롭다운용 옵션 변환
  const studentOptions = sortedStudents.map(student => ({
    id: student.id,
    name: student.name,
    number: student.number,
  }));

  const selectedStudentIds = absences.map(a => a.studentId);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="진도 및 결석생 입력" size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Schedule Info */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center space-x-4 text-sm">
            <span className="font-medium text-blue-800">{schedule.time}</span>
            <span className="text-gray-600">•</span>
            <span className="font-medium text-gray-900">{classInfo?.name}</span>
            <span className="text-gray-600">•</span>
            <span className="text-gray-700">{schedule.subject}</span>
          </div>
        </div>

        {/* Progress Input */}
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <BookOpen className="h-5 w-5 text-blue-600" />
            <label className="text-sm font-medium text-gray-700">
              진도 내용 *
            </label>
          </div>
          <Input
            type="text"
            value={progress}
            onChange={(e) => {
              setProgress(e.target.value);
              if (errors.progress) {
                setErrors(prev => ({ ...prev, progress: '' }));
              }
            }}
            placeholder="예: 1단원 집합의 기본 개념, 연산의 성질"
            error={errors.progress}
            disabled={isSubmitting}
          />
        </div>

        {/* Absence Management */}
        {classInfo && (
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <UserX className="h-5 w-5 text-red-600" />
              <label className="text-sm font-medium text-gray-700">
                결석생 선택
              </label>
              <span className="text-xs text-gray-500">
                ({sortedStudents.length}명 중 {absences.length}명 결석)
              </span>
            </div>
            
            <div className="space-y-4">
              {/* 검색 가능한 드롭다운 */}
              <SearchableDropdown
                options={studentOptions}
                selectedIds={selectedStudentIds}
                onToggle={handleAbsenceToggle}
                placeholder="결석생을 선택하세요"
                disabled={isSubmitting}
              />
              
              {/* 결석 사유 입력 */}
              {absences.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700">결석 사유 입력</h4>
                  {absences.map(absence => (
                    <div key={absence.studentId} className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2 w-24 flex-shrink-0">
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          <Hash className="h-3 w-3" />
                          <span className="w-4 text-center font-mono">
                            {absence.studentNumber || '-'}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-red-700">
                          {absence.studentName}
                        </span>
                      </div>
                      <Input
                        type="text"
                        value={absence.reason}
                        onChange={(e) => handleAbsenceReasonChange(absence.studentId, e.target.value)}
                        placeholder="결석 사유 (예: 감기, 병원 방문)"
                        className="flex-1"
                        disabled={isSubmitting}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Error Message */}
        {errors.general && (
          <div className="text-sm text-red-600 text-center bg-red-50 p-3 rounded-lg">
            {errors.general}
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
            disabled={isSubmitting}
          >
            취소
          </Button>
          <Button 
            type="submit"
            disabled={isSubmitting || !progress.trim()}
          >
            {isSubmitting ? '저장 중...' : '저장'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};