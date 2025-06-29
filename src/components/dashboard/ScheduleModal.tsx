import React, { useState, useEffect, useMemo } from 'react';
import { useScheduleData } from '../../context/ScheduleContext';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { SearchableDropdown } from '../ui/SearchableDropdown';
import { Absence } from '../../types'; // 👈 [수정] 사용하지 않는 Schedule 타입 제거
import { format } from 'date-fns';
import { useLocalStorage } from '../../hooks/useLocalStorage';

export const ScheduleModal: React.FC = () => {
  const { classes, schedules, addSchedule, isScheduleModalOpen, closeScheduleModal, preselectedClassId } = useScheduleData();
  
  const [subjects] = useLocalStorage<string[]>('settings:subjects', ['기술', '가정']);
  const [periods] = useLocalStorage<string[]>('settings:periods', ['1교시', '2교시', '3교시', '4교시', '5교시', '6교시', '7교시']);

  const getInitialState = () => ({
    date: format(new Date(), 'yyyy-MM-dd'),
    time: '',
    classId: preselectedClassId || '',
    subject: '',
    progress: '',
    absences: [] as Absence[],
  });

  const [formData, setFormData] = useState(getInitialState());
  // 👇 [수정] 사용하지 않는 errors 상태 제거
  // const [errors, setErrors] = useState<Record<string, string>>({});

  const occupiedTimes = useMemo(() => {
    if (!formData.date) return [];
    return schedules
        .filter(schedule => schedule.date === formData.date)
        .map(schedule => schedule.time);
  }, [formData.date, schedules]);

  useEffect(() => {
    if (isScheduleModalOpen) {
      const initialState = getInitialState();
      if(preselectedClassId) {
          initialState.classId = preselectedClassId;
      }
      setFormData(initialState);
      // setErrors({}); // errors 상태가 없으므로 이 줄도 제거
    }
  }, [isScheduleModalOpen, preselectedClassId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 간단한 유효성 검사
    if (!formData.date || !formData.time || !formData.classId || !formData.subject) {
      alert('날짜, 교시, 반, 과목을 모두 선택해주세요.');
      return;
    }

    // 👇 [수정] addSchedule 호출 시 누락된 필드를 추가합니다.
    addSchedule({
        ...formData,
        praises: [],      // praises 필드 추가
        specialNotes: []  // specialNotes 필드 추가
    });
    closeScheduleModal();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value, absences: name === 'classId' ? [] : prev.absences }));

    if (name === 'date') {
        setFormData(prev => ({ ...prev, time: '' }));
    }
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
                    {periods.map(period => {
                        const isOccupied = occupiedTimes.includes(period);
                        return (
                            <option key={period} value={period} disabled={isOccupied}>
                                {period}{isOccupied ? ' (배정 완료)' : ''}
                            </option>
                        );
                    })}
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
                    {subjects.map(s => <option key={s} value={s}>{s}</option>)}
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