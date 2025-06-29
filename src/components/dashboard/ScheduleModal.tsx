import React, { useState, useEffect } from 'react';
import { useScheduleData } from '../../context/ScheduleContext';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { SearchableDropdown } from '../ui/SearchableDropdown';
import { Schedule, Absence } from '../../types';
import { format } from 'date-fns';
import { BookOpen, UserX } from 'lucide-react';

// Props 인터페이스를 비웁니다.
interface ScheduleModalProps {}

export const ScheduleModal: React.FC<ScheduleModalProps> = () => {
  // 모든 상태와 함수를 Context로부터 가져옵니다.
  const { classes, addSchedule, isScheduleModalOpen, closeScheduleModal, preselectedClassId } = useScheduleData();
  
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

  useEffect(() => {
    if (isScheduleModalOpen) {
      setFormData(getInitialState());
      setErrors({});
    }
  }, [isScheduleModalOpen, preselectedClassId]);

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
    addSchedule(formData);
    closeScheduleModal();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value, absences: name === 'classId' ? [] : prev.absences }));
  };
  
  const handleAbsenceToggle = (studentId: string, studentName: string, studentNumber?: number) => {
    setFormData(prev => {
      const isSelected = prev.absences.some(a => a.studentId === studentId);
      if (isSelected) {
        return { ...prev, absences: prev.absences.filter(a => a.studentId !== studentId) };
      } else {
        return { ...prev, absences: [...prev.absences, { studentId, studentName, studentNumber, reason: '' }] };
      }
    });
  };

  const selectedClass = classes.find(c => c.id === formData.classId);
  const studentOptions = selectedClass?.students?.map(s => ({ id: s.id, name: s.name, number: s.number })) || [];

  return (
    <Modal isOpen={isScheduleModalOpen} onClose={closeScheduleModal} title="새 수업 추가" size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input type="date" name="date" label="날짜" value={formData.date} onChange={handleInputChange} />
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">교시</label>
                <select name="time" value={formData.time} onChange={handleInputChange} className="form-input">
                    <option value="">교시 선택</option>
                    {['1교시', '2교시', '3교시', '4교시', '5교시', '6교시', '7교시'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
            </div>
        </div>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">반</label>
                <select name="classId" value={formData.classId} onChange={handleInputChange} className="form-input">
                    <option value="">반 선택</option>
                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">과목</label>
                <select name="subject" value={formData.subject} onChange={handleInputChange} className="form-input">
                    <option value="">과목 선택</option>
                    {['기술', '가정'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>
        </div>
         <div className="border-t pt-6 space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">진도 내용 (선택)</label>
                <Input name="progress" value={formData.progress} onChange={handleInputChange} />
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">결석생 (선택)</label>
                {!formData.classId ? (
                    <p className="text-sm text-gray-500 p-3 bg-gray-100 rounded">반을 먼저 선택해주세요.</p>
                ) : studentOptions.length > 0 ? (
                    <SearchableDropdown options={studentOptions} selectedIds={formData.absences.map(a => a.studentId)} onToggle={handleAbsenceToggle} placeholder="결석생 선택" />
                ) : (
                    <p className="text-sm text-yellow-700 p-3 bg-yellow-50 rounded">선택한 반에 학생이 없습니다.</p>
                )}
            </div>
        </div>
        <div className="flex justify-end space-x-2 pt-6 border-t">
            <Button type="button" variant="outline" onClick={closeScheduleModal}>취소</Button>
            <Button type="submit">추가</Button>
        </div>
      </form>
    </Modal>
  );
};
