import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { SearchableDropdown } from '../ui/SearchableDropdown';
import { ClassInfo, Schedule, Absence } from '../../types';
import { format } from 'date-fns';
import { BookOpen, UserX } from 'lucide-react';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (schedule: Omit<Schedule, 'id' | 'teacherId' | 'createdAt' | 'updatedAt'>) => void;
  classes: ClassInfo[];
  preselectedClassId?: string | null;
}

export const ScheduleModal: React.FC<ScheduleModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  classes,
  preselectedClassId,
}) => {
  const getInitialState = () => ({
    date: format(new Date(), 'yyyy-MM-dd'),
    time: '',
    classId: preselectedClassId || '',
    subject: '',
    progress: '',
    absences: [] as Absence[],
  });

  const [formData, setFormData] = useState(getInitialState());
  const [errors, setErrors] = useState<Record<string, string>>({});

  const subjects = ['기술', '가정'];
  const timeSlots = ['1교시', '2교시', '3교시', '4교시', '5교시', '6교시', '7교시'];

  useEffect(() => {
    if (isOpen) {
      setFormData(getInitialState());
      setErrors({});
    }
  }, [isOpen, preselectedClassId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.date) newErrors.date = '날짜를 선택해주세요';
    if (!formData.time) newErrors.time = '교시를 선택해주세요';
    if (!formData.classId) newErrors.classId = '반을 선택해주세요';
    if (!formData.subject) newErrors.subject = '과목을 선택해주세요';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    onSubmit(formData);
    onClose();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value, absences: name === 'classId' ? [] : prev.absences })); // 반이 바뀌면 결석생 초기화
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  const handleAbsenceToggle = (studentId: string, studentName: string, studentNumber?: number) => {
    setFormData(prev => {
      const existingIndex = prev.absences.findIndex(a => a.studentId === studentId);
      if (existingIndex >= 0) {
        return {
          ...prev,
          absences: prev.absences.filter(a => a.studentId !== studentId),
        };
      } else {
        return {
          ...prev,
          absences: [...prev.absences, { studentId, studentName, studentNumber, reason: '' }],
        };
      }
    });
  };

  const selectedClass = classes.find(c => c.id === formData.classId);
  const studentOptions = selectedClass?.students?.map(student => ({
    id: student.id,
    name: student.name,
    number: student.number,
  })) || [];
  const selectedStudentIds = formData.absences.map(a => a.studentId);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="새 수업 추가" size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input type="date" name="date" label="날짜" value={formData.date} onChange={handleInputChange} error={errors.date} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">교시</label>
            <select name="time" value={formData.time} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">교시 선택</option>
              {timeSlots.map(time => <option key={time} value={time}>{time}</option>)}
            </select>
            {errors.time && <p className="mt-1 text-sm text-red-600">{errors.time}</p>}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">반</label>
            <select name="classId" value={formData.classId} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">반 선택</option>
              {classes.map(classInfo => <option key={classInfo.id} value={classInfo.id}>{classInfo.name}</option>)}
            </select>
            {errors.classId && <p className="mt-1 text-sm text-red-600">{errors.classId}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">과목</label>
            <select name="subject" value={formData.subject} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">과목 선택</option>
              {subjects.map(subject => <option key={subject} value={subject}>{subject}</option>)}
            </select>
            {errors.subject && <p className="mt-1 text-sm text-red-600">{errors.subject}</p>}
          </div>
        </div>
        
        <div className="border-t border-gray-200 pt-6 space-y-6">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <BookOpen className="h-5 w-5 text-gray-500" />
              <label className="text-sm font-medium text-gray-700">진도 내용 (선택 사항)</label>
            </div>
            <Input
              type="text"
              name="progress"
              value={formData.progress}
              onChange={handleInputChange}
              placeholder="진도 내용을 입력하면 바로 저장됩니다."
            />
          </div>
          
          {/* === 여기를 수정했습니다 === */}
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <UserX className="h-5 w-5 text-gray-500" />
              <label className="text-sm font-medium text-gray-700">결석생 선택 (선택 사항)</label>
            </div>
            {!formData.classId ? (
              // 1. 반을 선택하지 않았을 때
              <div className="bg-gray-100 text-gray-600 text-sm p-3 rounded-lg border border-gray-200">
                결석생을 입력하려면 먼저 반을 선택해주세요.
              </div>
            ) : studentOptions.length > 0 ? (
              // 2. 반을 선택했고, 학생이 있을 때
              <SearchableDropdown
                options={studentOptions}
                selectedIds={selectedStudentIds}
                onToggle={handleAbsenceToggle}
                placeholder="결석생을 선택하세요"
              />
            ) : (
              // 3. 반을 선택했지만, 학생이 없을 때
              <div className="bg-yellow-50 text-yellow-800 text-sm p-3 rounded-lg border border-yellow-200">
                선택한 반에 등록된 학생이 없습니다. '반 관리' 메뉴에서 학생을 먼저 추가해주세요.
              </div>
            )}
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <Button type="button" variant="outline" onClick={onClose}>취소</Button>
          <Button type="submit">추가</Button>
        </div>
      </form>
    </Modal>
  );
};
