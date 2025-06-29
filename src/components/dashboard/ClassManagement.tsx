import React, { useState } from 'react';
import { useScheduleData } from '../../context/ScheduleContext';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { ClassInfo, Student } from '../../types';
import { Plus, Users, Upload, Trash2, Edit3, Save, X, FileSpreadsheet, AlertCircle, CheckCircle, Hash } from 'lucide-react';
import * as XLSX from 'xlsx';

export const ClassManagement: React.FC = () => {
  const { classes, deleteClass } = useScheduleData();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassInfo | null>(null);
  const [editingClass, setEditingClass] = useState<ClassInfo | null>(null);

  const handleEditClass = (classInfo: ClassInfo) => {
    setEditingClass(classInfo);
    setIsEditModalOpen(true);
  };

  const handleManageStudents = (classInfo: ClassInfo) => {
    setSelectedClass(classInfo);
    setIsStudentModalOpen(true);
  };

  const handleDeleteClass = async (classId: string) => {
    if (window.confirm('이 반을 삭제하시겠습니까? 관련된 모든 수업 기록도 함께 삭제됩니다.')) {
      await deleteClass(classId);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">반 관리</h1>
        <Button onClick={() => setIsAddModalOpen(true)} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" /> <span>반 추가</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map(classInfo => (
          <Card key={classInfo.id} hover>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{classInfo.name}</h3>
                <div className="flex items-center space-x-1">
                  <Button variant="ghost" size="sm" onClick={() => handleEditClass(classInfo)}><Edit3 className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteClass(classInfo.id)} className="text-red-600"><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">학생 수: {classInfo.students.length}명</p>
              <Button variant="outline" size="sm" onClick={() => handleManageStudents(classInfo)} className="w-full">
                학생 관리
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <AddClassModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />

      {editingClass && <EditClassModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} classInfo={editingClass} />}
      {selectedClass && <StudentManagementModal isOpen={isStudentModalOpen} onClose={() => setIsStudentModalOpen(false)} classInfo={selectedClass} />}
    </div>
  );
};

// --- 하위 모달 컴포넌트들도 Context를 사용하도록 수정 ---

const AddClassModal: React.FC<{ isOpen: boolean; onClose: () => void; }> = ({ isOpen, onClose }) => {
  const { addClass } = useScheduleData();
  const [formData, setFormData] = useState({ name: '', grade: 1 as 1 | 2 });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    addClass({ ...formData, students: [] });
    onClose();
  };

  return ( <Modal isOpen={isOpen} onClose={onClose} title="새 반 추가"><form onSubmit={handleSubmit}>...</form></Modal> );
};

const EditClassModal: React.FC<{ isOpen: boolean; onClose: () => void; classInfo: ClassInfo; }> = ({ isOpen, onClose, classInfo }) => {
    const { updateClass } = useScheduleData();
    const [formData, setFormData] = useState({ name: classInfo.name, grade: classInfo.grade });
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim()) return;
        updateClass({ ...classInfo, name: formData.name, grade: formData.grade });
        onClose();
    };

    return ( <Modal isOpen={isOpen} onClose={onClose} title="반 정보 수정"><form onSubmit={handleSubmit}>...</form></Modal> );
};

const StudentManagementModal: React.FC<{ isOpen: boolean; onClose: () => void; classInfo: ClassInfo; }> = ({ isOpen, onClose, classInfo }) => {
    const { updateClass } = useScheduleData();
    const [students, setStudents] = useState<Student[]>(classInfo.students);

    useEffect(() => {
        setStudents(classInfo.students);
    }, [classInfo.students, isOpen]);

    const handleSubmit = () => {
        updateClass({ ...classInfo, students });
        onClose();
    };

    // 학생 추가, 수정, 삭제, 파일 업로드 핸들러들은 이전과 동일하게 유지...

    return ( <Modal isOpen={isOpen} onClose={onClose} title={`${classInfo.name} 학생 관리`} size="lg"><div className="space-y-6">...</div></Modal> );
};
