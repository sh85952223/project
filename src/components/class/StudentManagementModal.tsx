import React, { useState, useEffect } from 'react';
import { useScheduleData } from '../../context/ScheduleContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { ClassInfo, Student } from '../../types';
import { Upload, Trash2, AlertCircle, CheckCircle } from 'lucide-react';
import * as XLSX from 'xlsx';

interface StudentManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  classInfo: ClassInfo;
}

export const StudentManagementModal: React.FC<StudentManagementModalProps> = ({ isOpen, onClose, classInfo }) => {
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
                const newStudents: Student[] = dataRows.map((row, index) => ({
                    id: `student_import_${Date.now()}_${index}`,
                    name: String(row[1] || '').trim(),
                    number: row[0] ? Number(row[0]) : undefined,
                    classId: classInfo.id,
                })).filter(s => s.name);

                if (newStudents.length === 0) {
                    setUploadStatus({ type: 'error', message: '파일에서 학생 정보를 찾을 수 없습니다. A열: 번호, B열: 이름' });
                    return;
                }
                
                setStudents(prev => [...prev, ...newStudents].filter((student, index, self) => index === self.findIndex(s => s.number === student.number && s.name === student.name)).sort((a, b) => (a.number || 999) - (b.number || 999)));
                setUploadStatus({ type: 'success', message: `${newStudents.length}명의 학생을 불러왔습니다.` });
            } catch (err) {
                console.error(err);
                setUploadStatus({ type: 'error', message: '파일 처리 중 오류가 발생했습니다.' });
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
                                <Upload className="h-4 w-4 mr-2"/>엑셀 파일 선택<input type="file" className="hidden" accept=".xlsx, .xls" onChange={handleFileChange} />
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
                                    <th className="px-4 py-2 w-16">번호</th><th className="px-4 py-2">이름</th><th className="px-4 py-2 text-right">관리</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {students.length > 0 ? students.map(student => (
                                    <tr key={student.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-2 font-mono text-gray-500">{student.number || '-'}</td>
                                        <td className="px-4 py-2 font-medium">{student.name}</td>
                                        <td className="px-4 py-2 text-right">
                                            <Button size="sm" variant="ghost" className="text-red-500" onClick={() => handleDeleteStudent(student.id)}><Trash2 className="h-4 w-4" /></Button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan={3} className="text-center py-8 text-gray-500">등록된 학생이 없습니다.</td></tr>
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