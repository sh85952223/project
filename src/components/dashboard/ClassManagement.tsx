import React, { useState } from 'react';
import { useScheduleData } from '../../context/ScheduleContext'; // 1. 새로 만든 훅을 가져옵니다.
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { ClassInfo, Student } from '../../types';
import { Plus, Users, Upload, Trash2, Edit3, Save, X, FileSpreadsheet, AlertCircle, CheckCircle, Hash } from 'lucide-react';
import * as XLSX from 'xlsx';

export const ClassManagement: React.FC = () => {
  // 2. useSchedules 대신 useScheduleData 훅을 사용합니다.
  const { classes, addClass, updateClass, deleteClass } = useScheduleData();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassInfo | null>(null);
  const [editingClass, setEditingClass] = useState<ClassInfo | null>(null);

  const handleAddClass = () => {
    setIsAddModalOpen(true);
  };

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
      try {
        await deleteClass(classId);
      } catch (error) {
        alert('삭제에 실패했습니다. 다시 시도해주세요.');
      }
    }
  };

  // 나머지 코드는 이전과 동일합니다.
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">반 관리</h1>
          <p className="text-gray-600">반을 추가하고 학생 명단을 관리하세요</p>
        </div>
        <Button
          onClick={handleAddClass}
          className="flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>반 추가</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map(classInfo => (
          <Card key={classInfo.id} hover>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{classInfo.name}</h3>
                  <p className="text-sm text-gray-600">{classInfo.grade}학년</p>
                </div>
                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditClass(classInfo)}
                    title="반 정보 수정"
                  >
                    <Edit3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteClass(classInfo.id)}
                    className="text-red-600 hover:text-red-800 hover:bg-red-50"
                    title="반 삭제"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">학생 수</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {classInfo.students.length}명
                  </span>
                </div>

                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleManageStudents(classInfo)}
                    className="w-full flex items-center justify-center space-x-2"
                  >
                    <Users className="h-4 w-4" />
                    <span>학생 관리</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AddClassModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      {editingClass && (
        <EditClassModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingClass(null);
          }}
          classInfo={editingClass}
        />
      )}

      {selectedClass && (
        <StudentManagementModal
          isOpen={isStudentModalOpen}
          onClose={() => {
            setIsStudentModalOpen(false);
            setSelectedClass(null);
          }}
          classInfo={selectedClass}
        />
      )}
    </div>
  );
};

// --- 하위 모달 컴포넌트들도 수정합니다. ---

interface AddClassModalProps {
  isOpen: boolean;
  onClose: () => void;
}
const AddClassModal: React.FC<AddClassModalProps> = ({ isOpen, onClose }) => {
  const { addClass } = useScheduleData(); // onSubmit 대신 직접 훅 사용
  const [formData, setFormData] = useState({ name: '', grade: 1 as 1 | 2 });
  // ... (이하 동일, onSubmit 호출 부분만 addClass로 변경)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    addClass({ ...formData, students: [] });
    setFormData({ name: '', grade: 1 });
    onClose();
  };
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="새 반 추가">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="text"
          label="반 이름"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="예: 1학년 1반"
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">학년</label>
          <select
            value={formData.grade}
            onChange={(e) => setFormData(prev => ({ ...prev, grade: parseInt(e.target.value) as 1 | 2 }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm"
          >
            <option value={1}>1학년</option>
            <option value={2}>2학년</option>
          </select>
        </div>
        <div className="flex justify-end space-x-3 mt-6">
          <Button type="button" variant="outline" onClick={onClose}>취소</Button>
          <Button type="submit">추가</Button>
        </div>
      </form>
    </Modal>
  );
};


interface EditClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  classInfo: ClassInfo;
}
const EditClassModal: React.FC<EditClassModalProps> = ({ isOpen, onClose, classInfo }) => {
  const { updateClass } = useScheduleData();
  const [formData, setFormData] = useState({ name: classInfo.name, grade: classInfo.grade });
  // ... (이하 동일, onSubmit 호출 부분만 updateClass로 변경)
   const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    updateClass({ ...classInfo, name: formData.name, grade: formData.grade });
    onClose();
  };
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="반 정보 수정">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="text"
          label="반 이름"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">학년</label>
          <select
            value={formData.grade}
            onChange={(e) => setFormData(prev => ({ ...prev, grade: parseInt(e.target.value) as 1 | 2 }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm"
          >
            <option value={1}>1학년</option>
            <option value={2}>2학년</option>
          </select>
        </div>
        <div className="flex justify-end space-x-3 mt-6">
          <Button type="button" variant="outline" onClick={onClose}>취소</Button>
          <Button type="submit">수정</Button>
        </div>
      </form>
    </Modal>
  );
};


interface StudentManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  classInfo: ClassInfo;
}
const StudentManagementModal: React.FC<StudentManagementModalProps> = ({ isOpen, onClose, classInfo }) => {
    const { updateClass } = useScheduleData();
    const [students, setStudents] = useState<Student[]>(classInfo.students);
    // ... (이하 동일, onSubmit 호출 부분만 updateClass로 변경)
    const handleSubmit = () => {
        updateClass({ ...classInfo, students });
        onClose();
    };

    // --- 나머지 학생 관리 로직은 변경 없이 유지됩니다 ---
    const [newStudentName, setNewStudentName] = useState('');
    const [newStudentNumber, setNewStudentNumber] = useState('');
    const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
    const [editingStudentName, setEditingStudentName] = useState('');
    const [editingStudentNumber, setEditingStudentNumber] = useState('');
    const [uploadStatus, setUploadStatus] = useState<{ type: 'success' | 'error' | 'info' | null; message: string; }>({ type: null, message: '' });
    const [isUploading, setIsUploading] = useState(false);

    const getNextStudentNumber = () => {
        const existingNumbers = students.map(s => s.number || 0);
        const maxNumber = Math.max(0, ...existingNumbers);
        return maxNumber + 1;
    };

    const handleAddStudent = () => {
        if (!newStudentName.trim()) return;
        const studentNumber = newStudentNumber ? parseInt(newStudentNumber) : getNextStudentNumber();
        if (students.some(s => s.number === studentNumber)) {
        alert('이미 사용 중인 번호입니다.');
        return;
        }
        const newStudent: Student = {
        id: `student_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: newStudentName.trim(),
        classId: classInfo.id,
        number: studentNumber,
        };
        setStudents(prev => [...prev, newStudent].sort((a, b) => (a.number || 0) - (b.number || 0)));
        setNewStudentName('');
        setNewStudentNumber('');
    };

    const handleEditStudent = (student: Student) => {
        setEditingStudentId(student.id);
        setEditingStudentName(student.name);
        setEditingStudentNumber(student.number?.toString() || '');
    };

    const handleSaveEdit = () => {
        if (!editingStudentName.trim()) return;
        const studentNumber = editingStudentNumber ? parseInt(editingStudentNumber) : undefined;
        if (studentNumber && students.some(s => s.id !== editingStudentId && s.number === studentNumber)) {
        alert('이미 사용 중인 번호입니다.');
        return;
        }
        setStudents(prev => prev.map(student =>
        student.id === editingStudentId
            ? { ...student, name: editingStudentName.trim(), number: studentNumber }
            : student
        ).sort((a, b) => (a.number || 0) - (b.number || 0)));
        setEditingStudentId(null);
        setEditingStudentName('');
        setEditingStudentNumber('');
    };

    const handleDeleteStudent = (studentId: string) => {
        if (window.confirm('이 학생을 삭제하시겠습니까?')) {
        setStudents(prev => prev.filter(student => student.id !== studentId));
        }
    };
    
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        setUploadStatus({ type: null, message: '' });

        try {
            const data = await file.arrayBuffer();
            const workbook = XLSX.read(data);
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const json: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            
            const newStudents: Student[] = [];
            json.forEach((row, index) => {
                if (row && row.length > 0) {
                    const number = typeof row[0] === 'number' ? row[0] : undefined;
                    const name = typeof row[0] === 'number' ? String(row[1] || '') : String(row[0] || '');
                    
                    if (name.trim()) {
                         newStudents.push({
                            id: `student_${Date.now()}_${index}`,
                            name: name.trim(),
                            classId: classInfo.id,
                            number: number || getNextStudentNumber() + newStudents.length,
                        });
                    }
                }
            });
            
            setStudents(prev => [...prev, ...newStudents].sort((a, b) => (a.number || 0) - (b.number || 0)));
            setUploadStatus({ type: 'success', message: `${newStudents.length}명의 학생을 추가했습니다.` });

        } catch (error) {
            console.error("File upload error:", error);
            setUploadStatus({ type: 'error', message: '파일 처리 중 오류가 발생했습니다.' });
        } finally {
            setIsUploading(false);
            e.target.value = ''; // Reset file input
        }
    };


    React.useEffect(() => {
        if (isOpen) {
        setStudents(classInfo.students.sort((a, b) => (a.number || 0) - (b.number || 0)));
        setUploadStatus({ type: null, message: '' });
        setIsUploading(false);
        }
    }, [isOpen, classInfo.students]);


    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`${classInfo.name} 학생 관리`} size="lg">
        <div className="space-y-6">
            <div className="grid grid-cols-3 gap-2">
            <Input type="number" value={newStudentNumber} onChange={(e) => setNewStudentNumber(e.target.value)} placeholder="번호 (자동)" />
            <Input type="text" value={newStudentName} onChange={(e) => setNewStudentName(e.target.value)} placeholder="학생 이름 입력" className="col-span-1" onKeyPress={(e) => e.key === 'Enter' && handleAddStudent()} />
            <Button onClick={handleAddStudent} disabled={!newStudentName.trim()}> <Plus className="h-4 w-4" /></Button>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <FileSpreadsheet className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">엑셀 파일에서 명단 가져오기</h3>
                <p className="text-sm text-gray-600 mb-4">A열(번호), B열(이름) 또는 A열(이름) 형식</p>
                <input type="file" id="file-upload" accept=".xlsx, .xls" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
                <Button variant="outline" size="sm" onClick={() => document.getElementById('file-upload')?.click()} disabled={isUploading}>
                    <Upload className="h-4 w-4 mr-2" />
                    {isUploading ? '업로드 중...' : '파일 선택'}
                </Button>
                {uploadStatus.type && (
                <div className={`mt-4 p-2 rounded-lg text-sm ${
                    uploadStatus.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                }`}>
                    {uploadStatus.message}
                </div>
                )}
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
            {students.map(student => (
                <div key={student.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                {editingStudentId === student.id ? (
                    <div className="flex items-center space-x-2 flex-1">
                    <Input type="number" value={editingStudentNumber} onChange={(e) => setEditingStudentNumber(e.target.value)} className="w-20" />
                    <Input type="text" value={editingStudentName} onChange={(e) => setEditingStudentName(e.target.value)} className="flex-1" onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit()}/>
                    <Button size="sm" onClick={handleSaveEdit}><Save className="h-4 w-4" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingStudentId(null)}><X className="h-4 w-4" /></Button>
                    </div>
                ) : (
                    <>
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500 w-8 text-center">{student.number || '-'}</span>
                        <span className="text-sm font-medium">{student.name}</span>
                    </div>
                    <div className="flex space-x-1">
                        <Button size="sm" variant="ghost" onClick={() => handleEditStudent(student)}><Edit3 className="h-4 w-4" /></Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDeleteStudent(student.id)} className="text-red-600"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                    </>
                )}
                </div>
            ))}
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>취소</Button>
            <Button onClick={handleSubmit}>저장</Button>
            </div>
        </div>
        </Modal>
    );
};

