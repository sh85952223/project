import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { AlertTriangle } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    // 👇 [수정] size를 'fit'으로 변경하여 내용에 맞는 작은 크기로 표시되게 합니다.
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="fit">
      <div className="text-center py-4">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
          <AlertTriangle className="h-6 w-6 text-red-600" />
        </div>
        <p className="mt-4 text-gray-600">{message}</p>
      </div>
      <div className="mt-6 flex justify-center space-x-3">
        <Button variant="outline" onClick={onClose}>
          취소
        </Button>
        <Button variant="danger" onClick={() => {
          onConfirm();
          onClose();
        }}>
          삭제 확인
        </Button>
      </div>
    </Modal>
  );
};