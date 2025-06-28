import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { ClassInfo, Schedule } from '../../types';
import { format } from 'date-fns';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (schedule: Omit<Schedule, 'id' | 'teacherId' | 'createdAt' | 'updatedAt'>) => void;
  classes: ClassInfo[];
  preselectedClassId?: string | null; // 미리 선택된 반 ID
}

export const ScheduleModal: React.FC<ScheduleModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  classes,
  preselectedClassId,
}) => {
  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    time: '',
    classId: '',
    subject: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const subjects = ['기술', '가정'];

  const timeSlots = [
    '1교시', '2교시', '3교시', '4교시', 
    '5교시', '6교시', '7교시'
  ];

  // 미리 선택된 반이 있을 때 자동으로 설정
  useEffect(() => {
    if (preselectedClassId && isOpen) {
      setFormData(prev => ({
        ...prev,
        classId: preselectedClassId,
      }));
    }
  }, [preselectedClassId, isOpen]);

  // 모달이 열릴 때마다 폼 초기화 (미리 선택된 반 제외)
  useEffect(() => {
    if (isOpen) {
      setFormData({
        date: format(new Date(), 'yyyy-MM-dd'),
        time: '',
        classId: preselectedClassId || '',
        subject: '',
      });
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

    onSubmit({
      date: formData.date,
      time: formData.time,
      classId: formData.classId,
      subject: formData.subject,
      absences: [],
    });

    setFormData({
      date: format(new Date(), 'yyyy-MM-dd'),
      time: '',
      classId: '',
      subject: '',
    });
    setErrors({});
    onClose();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // 선택된 반 정보 가져오기
  const selectedClass = classes.find(c => c.id === formData.classId);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="새 수업 추가">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 미리 선택된 반이 있을 때 안내 메시지 */}
        {preselectedClassId && selectedClass && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm font-medium text-blue-800">
                {selectedClass.name}에 수업을 추가합니다
              </span>
            </div>
            <p className="text-xs text-blue-600 mt-1">
              다른 반을 선택하려면 아래 드롭다운에서 변경하세요
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            type="date"
            name="date"
            label="날짜"
            value={formData.date}
            onChange={handleInputChange}
            error={errors.date}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              교시
            </label>
            <select
              name="time"
              value={formData.time}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">교시 선택</option>
              {timeSlots.map(time => (
                <option key={time} value={time}>{time}</option>
              ))}
            </select>
            {errors.time && <p className="mt-1 text-sm text-red-600">{errors.time}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              반
            </label>
            <select
              name="classId"
              value={formData.classId}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                preselectedClassId ? 'bg-blue-50 border-blue-300' : ''
              }`}
            >
              <option value="">반 선택</option>
              {classes.map(classInfo => (
                <option key={classInfo.id} value={classInfo.id}>
                  {classInfo.name}
                </option>
              ))}
            </select>
            {errors.classId && <p className="mt-1 text-sm text-red-600">{errors.classId}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              과목
            </label>
            <select
              name="subject"
              value={formData.subject}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">과목 선택</option>
              {subjects.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
            {errors.subject && <p className="mt-1 text-sm text-red-600">{errors.subject}</p>}
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <Button type="button" variant="outline" onClick={onClose}>
            취소
          </Button>
          <Button type="submit">
            추가
          </Button>
        </div>
      </form>
    </Modal>
  );
};