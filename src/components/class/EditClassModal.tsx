import React, { useState, useEffect } from 'react';
import { useScheduleData } from '../../context/ScheduleContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { ClassInfo } from '../../types';

interface EditClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  classInfo: ClassInfo;
}

export const EditClassModal: React.FC<EditClassModalProps> = ({ isOpen, onClose, classInfo }) => {
    const { updateClass } = useScheduleData();
    const [name, setName] = useState(classInfo.name);
    const [grade, setGrade] = useState(classInfo.grade);

    useEffect(() => {
        setName(classInfo.name);
        setGrade(classInfo.grade);
    }, [classInfo, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;
        updateClass({ ...classInfo, name, grade });
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="반 정보 수정">
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input label="반 이름" value={name} onChange={(e) => setName(e.target.value)} required />
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">학년</label>
                    <select value={grade} onChange={(e) => setGrade(Number(e.target.value) as 1 | 2 | 3)} className="form-input">
                        <option value={1}>1학년</option>
                        <option value={2}>2학년</option>
                        <option value={3}>3학년</option>
                    </select>
                </div>
                <div className="flex justify-end space-x-2 pt-4 border-t">
                    <Button type="button" variant="outline" onClick={onClose}>취소</Button>
                    <Button type="submit">저장</Button>
                </div>
            </form>
        </Modal>
    );
};