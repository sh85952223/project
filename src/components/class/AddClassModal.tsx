import React, { useState } from 'react';
import { useScheduleData } from '../../context/ScheduleContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';

interface AddClassModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddClassModal: React.FC<AddClassModalProps> = ({ isOpen, onClose }) => {
    const { addClass } = useScheduleData();
    const [name, setName] = useState('');
    const [grade, setGrade] = useState<1 | 2 | 3>(1);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;
        // 👇 [수정] students 속성을 제거하여 타입 오류를 해결합니다.
        addClass({ name, grade });
        setName('');
        setGrade(1);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="새 반 추가">
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input label="반 이름" value={name} onChange={(e) => setName(e.target.value)} placeholder="예: 1학년 1반" required />
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
                    <Button type="submit">추가</Button>
                </div>
            </form>
        </Modal>
    );
};