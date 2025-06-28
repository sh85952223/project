import React, { useState } from 'react';
import { useSchedules } from '../../hooks/useSchedules';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { ClassInfo, Student } from '../../types';
import { Plus, Users, Upload, Trash2, Edit3, Save, X, FileSpreadsheet, AlertCircle, CheckCircle, Hash } from 'lucide-react';
import * as XLSX from 'xlsx';

export const ClassManagement: React.FC = () => {
  const { classes, addClass, updateClass, deleteClass } = useSchedules();
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
    if (confirm('이 반을 삭제하시겠습니까? 관련된 모든 수업 기록도 함께 삭제됩니다.')) {
      try {
        await deleteClass(classId);
      } catch (error) {
        alert('삭제에 실패했습니다. 다시 시도해주세요.');
      }
    }
  };

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

      {/* Add Class Modal */}
      <AddClassModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={addClass}
      />

      {/* Edit Class Modal */}
      {editingClass && (
        <EditClassModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingClass(null);
          }}
          onSubmit={updateClass}
          classInfo={editingClass}
        />
      )}

      {/* Student Management Modal */}
      {selectedClass && (
        <StudentManagementModal
          isOpen={isStudentModalOpen}
          onClose={() => {
            setIsStudentModalOpen(false);
            setSelectedClass(null);
          }}
          onSubmit={updateClass}
          classInfo={selectedClass}
        />
      )}
    </div>
  );
};

// Add Class Modal Component
interface AddClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (classInfo: Omit<ClassInfo, 'id'>) => void;
}

const AddClassModal: React.FC<AddClassModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    grade: 1 as 1 | 2,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = '반 이름을 입력해주세요';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({
      name: formData.name,
      grade: formData.grade,
      students: [],
    });

    setFormData({ name: '', grade: 1 });
    setErrors({});
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
          error={errors.name}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            학년
          </label>
          <select
            value={formData.grade}
            onChange={(e) => setFormData(prev => ({ ...prev, grade: parseInt(e.target.value) as 1 | 2 }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value={1}>1학년</option>
            <option value={2}>2학년</option>
          </select>
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

// Edit Class Modal Component
interface EditClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (classInfo: ClassInfo) => void;
  classInfo: ClassInfo;
}

const EditClassModal: React.FC<EditClassModalProps> = ({ isOpen, onClose, onSubmit, classInfo }) => {
  const [formData, setFormData] = useState({
    name: classInfo.name,
    grade: classInfo.grade,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = '반 이름을 입력해주세요';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({
      ...classInfo,
      name: formData.name,
      grade: formData.grade,
    });

    setErrors({});
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
          placeholder="예: 1학년 1반"
          error={errors.name}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            학년
          </label>
          <select
            value={formData.grade}
            onChange={(e) => setFormData(prev => ({ ...prev, grade: parseInt(e.target.value) as 1 | 2 }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value={1}>1학년</option>
            <option value={2}>2학년</option>
          </select>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <Button type="button" variant="outline" onClick={onClose}>
            취소
          </Button>
          <Button type="submit">
            수정
          </Button>
        </div>
      </form>
    </Modal>
  );
};

// Student Management Modal Component
interface StudentManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (classInfo: ClassInfo) => void;
  classInfo: ClassInfo;
}

const StudentManagementModal: React.FC<StudentManagementModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  classInfo 
}) => {
  const [students, setStudents] = useState<Student[]>(classInfo.students);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentNumber, setNewStudentNumber] = useState('');
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [editingStudentName, setEditingStudentName] = useState('');
  const [editingStudentNumber, setEditingStudentNumber] = useState('');
  const [uploadStatus, setUploadStatus] = useState<{
    type: 'success' | 'error' | 'info' | null;
    message: string;
  }>({ type: null, message: '' });
  const [isUploading, setIsUploading] = useState(false);

  // 학생 번호 자동 할당
  const getNextStudentNumber = () => {
    const existingNumbers = students.map(s => s.number || 0);
    const maxNumber = Math.max(0, ...existingNumbers);
    return maxNumber + 1;
  };

  const handleAddStudent = () => {
    if (!newStudentName.trim()) return;

    const studentNumber = newStudentNumber ? parseInt(newStudentNumber) : getNextStudentNumber();

    // 번호 중복 체크
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

    // 번호 중복 체크 (자기 자신 제외)
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
    if (confirm('이 학생을 삭제하시겠습니까?')) {
      setStudents(prev => prev.filter(student => student.id !== studentId));
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadStatus({ type: null, message: '' });

    try {
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      const supportedFormats = ['xlsx', 'xls', 'csv', 'txt'];
      
      if (!supportedFormats.includes(fileExtension || '')) {
        throw new Error('지원하지 않는 파일 형식입니다. (.xlsx, .xls, .csv, .txt 파일만 지원)');
      }

      let newStudents: Student[] = [];

      if (fileExtension === 'txt' || fileExtension === 'csv') {
        const text = await file.text();
        const lines = text.split('\n').filter(line => line.trim());
        
        newStudents = lines.map((line, index) => {
          const trimmedLine = line.trim();
          let name = '';
          let number: number | undefined;

          if (fileExtension === 'csv') {
            const parts = trimmedLine.split(',').map(p => p.trim());
            if (parts.length >= 2) {
              // 첫 번째가 번호, 두 번째가 이름
              const firstPart = parts[0];
              const secondPart = parts[1];
              
              if (!isNaN(parseInt(firstPart))) {
                number = parseInt(firstPart);
                name = secondPart;
              } else {
                name = firstPart;
              }
            } else {
              name = parts[0] || '';
            }
          } else {
            name = trimmedLine;
          }
            
          return {
            id: `student_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`,
            name: name,
            classId: classInfo.id,
            number: number || getNextStudentNumber() + index,
          };
        }).filter(student => student.name);

      } else {
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
        
        if (jsonData.length === 0) {
          throw new Error('엑셀 파일이 비어있습니다.');
        }

        const extractedStudents: Student[] = [];
        const dataStartRow = jsonData[0] && typeof jsonData[0][0] === 'string' && 
                            (jsonData[0][0].includes('번호') || jsonData[0][0].includes('이름') || 
                             jsonData[0][1]?.includes('이름')) ? 1 : 0;

        for (let i = dataStartRow; i < jsonData.length; i++) {
          const row = jsonData[i];
          if (!row || row.length === 0) continue;

          let studentName = '';
          let studentNumber: number | undefined;
          
          if (row.length >= 2) {
            const firstCol = row[0];
            const secondCol = row[1];
            
            // 첫 번째 열이 숫자인 경우 번호로 간주
            if (firstCol && !isNaN(parseInt(firstCol.toString()))) {
              studentNumber = parseInt(firstCol.toString());
              if (secondCol && typeof secondCol === 'string' && secondCol.trim()) {
                studentName = secondCol.trim();
              }
            } else if (firstCol && typeof firstCol === 'string' && firstCol.trim()) {
              studentName = firstCol.trim();
            }
          } else if (row[0] && typeof row[0] === 'string' && row[0].trim()) {
            studentName = row[0].trim();
          }

          if (studentName && studentName.length >= 2 && studentName.length <= 10) {
            extractedStudents.push({
              id: `student_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 9)}`,
              name: studentName,
              classId: classInfo.id,
              number: studentNumber || getNextStudentNumber() + extractedStudents.length,
            });
          }
        }

        newStudents = extractedStudents;
      }

      if (newStudents.length === 0) {
        throw new Error('파일에서 유효한 학생 이름을 찾을 수 없습니다.');
      }

      // 중복 이름 및 번호 체크
      const existingNames = students.map(s => s.name.toLowerCase());
      const existingNumbers = students.map(s => s.number).filter(n => n !== undefined);
      
      const uniqueNewStudents = newStudents.filter(student => {
        const nameExists = existingNames.includes(student.name.toLowerCase());
        const numberExists = student.number && existingNumbers.includes(student.number);
        return !nameExists && !numberExists;
      });

      if (uniqueNewStudents.length === 0) {
        setUploadStatus({
          type: 'info',
          message: '모든 학생이 이미 명단에 있거나 번호가 중복됩니다.'
        });
      } else {
        setStudents(prev => [...prev, ...uniqueNewStudents].sort((a, b) => (a.number || 0) - (b.number || 0)));
        setUploadStatus({
          type: 'success',
          message: `${uniqueNewStudents.length}명의 학생을 성공적으로 추가했습니다.`
        });
      }

    } catch (error) {
      console.error('File upload error:', error);
      setUploadStatus({
        type: 'error',
        message: error instanceof Error ? error.message : '파일 업로드 중 오류가 발생했습니다.'
      });
    } finally {
      setIsUploading(false);
      if (e.target) {
        e.target.value = '';
      }
    }
  };

  const handleSubmit = () => {
    onSubmit({
      ...classInfo,
      students,
    });
    onClose();
  };

  // 모달이 열릴 때마다 상태 초기화
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
        {/* Add Student */}
        <div className="grid grid-cols-3 gap-2">
          <Input
            type="number"
            value={newStudentNumber}
            onChange={(e) => setNewStudentNumber(e.target.value)}
            placeholder="번호 (자동)"
            min="1"
          />
          <Input
            type="text"
            value={newStudentName}
            onChange={(e) => setNewStudentName(e.target.value)}
            placeholder="학생 이름 입력"
            className="col-span-1"
            onKeyPress={(e) => e.key === 'Enter' && handleAddStudent()}
          />
          <Button onClick={handleAddStudent} disabled={!newStudentName.trim()}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* File Upload */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
          <div className="text-center">
            <FileSpreadsheet className="h-12 w-12 text-blue-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              엑셀 파일에서 학생 명단 가져오기
            </h3>
            <div className="space-y-2 mb-4">
              <p className="text-sm text-gray-600">
                <strong>지원 형식:</strong> .xlsx, .xls, .csv, .txt
              </p>
              <p className="text-sm text-gray-600">
                <strong>엑셀 형식:</strong> A열(번호), B열(이름) 또는 A열(이름)만
              </p>
              <p className="text-xs text-gray-500">
                첫 번째 행이 헤더인 경우 자동으로 건너뜁니다
              </p>
            </div>
            
            <div className="relative">
              <input
                type="file"
                accept=".xlsx,.xls,.csv,.txt"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                id="file-upload"
              />
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center space-x-2 pointer-events-none"
                disabled={isUploading}
              >
                <Upload className="h-4 w-4" />
                <span>{isUploading ? '업로드 중...' : '파일 선택'}</span>
              </Button>
            </div>

            {uploadStatus.type && (
              <div className={`mt-4 p-3 rounded-lg flex items-center space-x-2 ${
                uploadStatus.type === 'success' ? 'bg-green-50 text-green-800' :
                uploadStatus.type === 'error' ? 'bg-red-50 text-red-800' :
                'bg-blue-50 text-blue-800'
              }`}>
                {uploadStatus.type === 'success' && <CheckCircle className="h-4 w-4" />}
                {uploadStatus.type === 'error' && <AlertCircle className="h-4 w-4" />}
                {uploadStatus.type === 'info' && <AlertCircle className="h-4 w-4" />}
                <span className="text-sm">{uploadStatus.message}</span>
              </div>
            )}
          </div>
        </div>

        {/* Student List */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            학생 목록 ({students.length}명)
          </h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {students.map(student => (
              <div
                key={student.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                {editingStudentId === student.id ? (
                  <div className="flex items-center space-x-2 flex-1">
                    <div className="flex items-center space-x-1">
                      <Hash className="h-4 w-4 text-gray-400" />
                      <Input
                        type="number"
                        value={editingStudentNumber}
                        onChange={(e) => setEditingStudentNumber(e.target.value)}
                        className="w-20"
                        min="1"
                      />
                    </div>
                    <Input
                      type="text"
                      value={editingStudentName}
                      onChange={(e) => setEditingStudentName(e.target.value)}
                      className="flex-1"
                      onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit()}
                    />
                    <Button
                      size="sm"
                      onClick={handleSaveEdit}
                      className="text-green-600 hover:text-green-800"
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setEditingStudentId(null);
                        setEditingStudentName('');
                        setEditingStudentNumber('');
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1 text-sm text-gray-500">
                        <Hash className="h-3 w-3" />
                        <span className="w-6 text-center font-mono">
                          {student.number || '-'}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {student.name}
                      </span>
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditStudent(student)}
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteStudent(student.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button type="button" variant="outline" onClick={onClose}>
            취소
          </Button>
          <Button onClick={handleSubmit}>
            저장
          </Button>
        </div>
      </div>
    </Modal>
  );
};