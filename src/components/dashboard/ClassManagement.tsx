import React, { useState, useEffect } from 'react';
import { useScheduleData } from '../../context/ScheduleContext';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { ClassInfo, Student } from '../../types';
import { Plus, Users, Upload, Trash2, Edit3, Save, X, FileSpreadsheet, AlertCircle, CheckCircle } from 'lucide-react';
import * as XLSX from 'xlsx';

export const ClassManagement: React.FC = () => {
  const { classes, addClass, deleteClass, updateClass } = useScheduleData();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassInfo | null>(null);
  const [editingClass, setEditingClass] = useState<ClassInfo | null>(null);

  const handleAddClass = () => {
    setEditingClass(null);
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
      await deleteClass(classId);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">반 관리</h1>
        <Button onClick={handleAddClass} className="flex items-center space-x-2">
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
              <Button variant="outline" size="sm" onClick={() => handleManageStudents(classInfo)} className="w-full flex items-center justify-center space-x-2">
                <Users className="h-4 w-4"/>
                <span>학생 관리</span>
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


const AddClassModal: React.FC<{ isOpen: boolean; onClose: () => void; }> = ({ isOpen, onClose }) => {
    const { addClass } = useScheduleData();
    const [name, setName] = useState('');
    const [grade, setGrade] = useState<1 | 2>(1);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;
        addClass({ name, grade, students: [] });
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
                    <select value={grade} onChange={(e) => setGrade(Number(e.target.value) as 1 | 2)} className="form-input">
                        <option value={1}>1학년</option>
                        <option value={2}>2학년</option>
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

const EditClassModal: React.FC<{ isOpen: boolean; onClose: () => void; classInfo: ClassInfo; }> = ({ isOpen, onClose, classInfo }) => {
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
                    <select value={grade} onChange={(e) => setGrade(Number(e.target.value) as 1 | 2)} className="form-input">
                        <option value={1}>1학년</option>
                        <option value={2}>2학년</option>
                    </select>
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="outline" onClick={onClose}>취소</Button>
                    <Button type="submit">저장</Button>
                </div>
            </form>
        </Modal>
    );
};

const StudentManagementModal: React.FC<{ isOpen: boolean; onClose: () => void; classInfo: ClassInfo; }> = ({ isOpen, onClose, classInfo }) => {
    const { updateClass } = useScheduleData();
    const [students, setStudents] = useState<Student[]>([]);
    const [newStudentName, setNewStudentName] = useState('');
    const [newStudentNumber, setNewStudentNumber] = useState<number | ''>('');
    const [uploadStatus, setUploadStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    useEffect(() => {
        if (isOpen) {
            setStudents(classInfo.students.sort((a,b) => (a.number || 999) - (b.number || 999)));
            setUploadStatus(null);
            setNewStudentName('');
            setNewStudentNumber('');
        }
    }, [classInfo.students, isOpen]);

    const handleAddStudent = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newStudentName.trim()) return;
        const newStudent: Student = {
            id: `student_${Date.now()}`,
            name: newStudentName.trim(),
            classId: classInfo.id,
            number: newStudentNumber === '' ? undefined : Number(newStudentNumber)
        };
        setStudents(prev => [...prev, newStudent].sort((a,b) => (a.number || 999) - (b.number || 999)));
        setNewStudentName('');
        setNewStudentNumber('');
    };

    const handleDeleteStudent = (studentId: string) => {
        setStudents(prev => prev.filter(s => s.id !== studentId));
    };

    // 👈 [수정] 엑셀 파일 처리 로직 개선
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = new Uint8Array(event.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                
                const rows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                if (rows.length === 0) {
                     setUploadStatus({ type: 'error', message: '엑셀 파일이 비어있습니다.' });
                     return;
                }

                let dataRows = rows;
                const firstCell = rows[0][0];
                if (typeof firstCell === 'string' && isNaN(parseInt(firstCell, 10))) {
                     dataRows = rows.slice(1);
                }

                const newStudents: Student[] = dataRows.map((row, index) => {
                    const number = row[0];
                    const name = row[1];
                    
                    return {
                        id: `student_import_${Date.now()}_${index}`,
                        name: String(name || '').trim(),
                        number: number ? Number(number) : undefined,
                        classId: classInfo.id,
                    };
                }).filter(s => s.name);

                if (newStudents.length === 0) {
                    setUploadStatus({ type: 'error', message: '파일에서 학생 정보를 찾을 수 없습니다. A열에 번호, B열에 이름이 있는지 확인해주세요.' });
                    return;
                }
                
                setStudents(prev => [...prev, ...newStudents]
                    .filter((student, index, self) => index === self.findIndex(s => s.number === student.number && s.name === student.name))
                    .sort((a, b) => (a.number || 999) - (b.number || 999)));
                setUploadStatus({ type: 'success', message: `${newStudents.length}명의 학생을 성공적으로 불러왔습니다.` });
            } catch (err) {
                console.error(err);
                setUploadStatus({ type: 'error', message: '파일을 처리하는 중 오류가 발생했습니다. 파일 형식이 올바른지 확인해주세요.' });
            }
        };
        reader.readAsArrayBuffer(file);
        e.target.value = '';
    };

    const handleSubmit = () => {
        updateClass({ ...classInfo, students });
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`${classInfo.name} 학생 관리`} size="lg">
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
                    <div className="border rounded-lg p-4 flex flex-col">
                        <p className="font-medium text-sm text-gray-700 mb-2">학생 직접 추가</p>
                        <form onSubmit={handleAddStudent} className="flex items-end space-x-2 mt-auto">
                            <div className="flex-grow flex items-end space-x-2">
                                <Input type="number" value={newStudentNumber} onChange={(e) => setNewStudentNumber(e.target.value === '' ? '' : Number(e.target.value))} placeholder="번호" className="w-20"/>
                                <Input value={newStudentName} onChange={(e) => setNewStudentName(e.target.value)} placeholder="이름" className="flex-1" required/>
                            </div>
                            <Button type="submit" variant="secondary" className="w-20 justify-center flex-shrink-0">추가</Button>
                        </form>
                    </div>
                    <div className="border rounded-lg p-4 flex flex-col">
                         <p className="font-medium text-sm text-gray-700 mb-2">엑셀로 명단 가져오기</p>
                         <div className="mt-auto space-y-2">
                            <Button as="label" variant="outline" className="w-full cursor-pointer justify-center">
                                <Upload className="h-4 w-4 mr-2"/>
                                엑셀 파일 선택
                                <input type="file" className="hidden" accept=".xlsx, .xls" onChange={handleFileChange} />
                            </Button>
                            {uploadStatus && (
                                <div className={`text-xs p-2 rounded flex items-center justify-center space-x-1 ${uploadStatus.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                    {uploadStatus.type === 'success' ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                                    <span>{uploadStatus.message}</span>
                                </div>
                            )}
                         </div>
                    </div>
                </div>

                <div className="border rounded-lg overflow-hidden">
                    <div className="max-h-72 overflow-y-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 border-b sticky top-0">
                                <tr>
                                    <th className="px-4 py-2 w-16">번호</th>
                                    <th className="px-4 py-2">이름</th>
                                    <th className="px-4 py-2 text-right">관리</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {students.length > 0 ? students.map(student => (
                                    <tr key={student.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-2 font-mono text-gray-500">{student.number || '-'}</td>
                                        <td className="px-4 py-2 font-medium">{student.name}</td>
                                        <td className="px-4 py-2 text-right">
                                            <Button size="sm" variant="ghost" className="text-red-500" onClick={() => handleDeleteStudent(student.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={3} className="text-center py-8 text-gray-500">등록된 학생이 없습니다.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4 border-t">
                    <Button type="button" variant="outline" onClick={onClose}>취소</Button>
                    <Button onClick={handleSubmit}>변경사항 저장</Button>
                </div>
            </div>
        </Modal>
    );
};