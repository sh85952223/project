import React, { useMemo, useState } from 'react';
import { Student, ClassInfo, Schedule } from '../../types';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { ArrowLeft, UserX, MessageSquare, Star, Filter } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';

// 필터링과 기록 객체를 위한 타입을 명확하게 정의
type RecordType = 'all' | 'praise' | 'note' | 'absence';
type StudentRecord = {
    type: 'absence' | 'praise' | 'note';
    date: string;
    time: string;
    subject: string;
    reason?: string;
    stars?: number;
    note?: string;
};

// 각 기록 아이템을 위한 새로운 컴포넌트
const RecordItem: React.FC<{ record: StudentRecord }> = ({ record }) => {
    const recordTypeInfo = {
        absence: { icon: UserX, color: 'text-red-500', tag: '결석', tagColor: 'bg-red-100 text-red-600' },
        praise: { icon: Star, color: 'text-yellow-500', tag: '칭찬', tagColor: 'bg-yellow-100 text-yellow-700' },
        note: { icon: MessageSquare, color: 'text-green-600', tag: '기록', tagColor: 'bg-green-100 text-green-700' },
    }[record.type];

    const Icon = recordTypeInfo.icon;

    return (
        <div className="flex items-start space-x-4">
            <div className={`mt-1 flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-white ${recordTypeInfo.color}`}>
                <Icon className="h-5 w-5"/>
            </div>
            <div className="flex-1">
                <Card className="bg-white">
                    <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                            <p className="text-sm font-semibold text-gray-800">
                                {format(parseISO(record.date), 'PPP', { locale: ko })} ({record.time}) - {record.subject}
                            </p>
                            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${recordTypeInfo.tagColor}`}>{recordTypeInfo.tag}</span>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {record.type === 'absence' && <p className="text-sm">{record.reason}</p>}
                        {record.type === 'praise' && <div className="flex items-center text-yellow-600 font-bold"><Star className="h-4 w-4 mr-1 fill-current"/><p>{record.stars}개</p></div>}
                        {record.type === 'note' && <p className="text-sm">{record.note}</p>}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export const StudentDetailView: React.FC<{ 
  student: Student; 
  classInfo: ClassInfo; 
  schedules: Schedule[]; 
  onBack: () => void; 
}> = ({ student, classInfo, schedules, onBack }) => {
  const [filter, setFilter] = useState<RecordType>('all');
  
  const studentRecords = useMemo(() => {
    const records: StudentRecord[] = [];

    schedules.forEach(schedule => {
        if(schedule.classId !== classInfo.id) return;
        const absence = schedule.absences?.find(a => a.studentId === student.id);
        if(absence) {
            records.push({ type: 'absence', date: schedule.date, time: schedule.time, subject: schedule.subject, reason: absence.reason || '사유 미입력' });
        }
        const praise = schedule.praises?.find(p => p.studentId === student.id);
        if(praise && praise.stars > 0) {
            records.push({ type: 'praise', date: schedule.date, time: schedule.time, subject: schedule.subject, stars: praise.stars });
        }
        const note = schedule.specialNotes?.find(n => n.studentId === student.id);
        if(note && note.note.trim()) {
            records.push({ type: 'note', date: schedule.date, time: schedule.time, subject: schedule.subject, note: note.note });
        }
    });
    
    const filteredRecords = records.filter(record => filter === 'all' || record.type === filter);

    return filteredRecords.sort((a, b) => b.date.localeCompare(a.date));
  }, [schedules, student, classInfo, filter]);

  let lastDisplayedMonth = '';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <Button variant="ghost" onClick={onBack} className="flex items-center space-x-2 px-0 text-blue-600 hover:bg-transparent">
            <ArrowLeft className="h-4 w-4" />
            <span>{classInfo.name} 목록으로 돌아가기</span>
          </Button>
          <h1 className="text-2xl font-bold mt-2">{student.name}</h1>
        </div>
      </div>
      <Card>
        <CardHeader>
            <div className="flex justify-between items-center">
                <h3 className="font-semibold">학생 종합 기록</h3>
                <div className="flex items-center space-x-2">
                    <Filter className="h-4 w-4 text-gray-500" />
                    <select value={filter} onChange={(e) => setFilter(e.target.value as RecordType)} className="form-input text-sm py-1">
                        <option value="all">전체 보기</option>
                        <option value="praise">칭찬만 보기</option>
                        <option value="note">기록만 보기</option>
                        <option value="absence">결석만 보기</option>
                    </select>
                </div>
            </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {studentRecords.length > 0 ? studentRecords.map((record, index) => {
              const recordDate = parseISO(record.date);
              const currentMonth = format(recordDate, 'yyyy-MM');
              const showSeparator = currentMonth !== lastDisplayedMonth;
              if (showSeparator) {
                  lastDisplayedMonth = currentMonth;
              }

              return (
                <React.Fragment key={index}>
                  {showSeparator && (
                    <div className="flex items-center">
                      <div className="flex-grow border-t border-gray-300"></div>
                      <span className="flex-shrink-0 mx-4 text-md font-semibold text-gray-600">
                        {format(recordDate, 'yyyy년 M월')}
                      </span>
                      <div className="flex-grow border-t border-gray-300"></div>
                    </div>
                  )}
                  <RecordItem record={record} />
                </React.Fragment>
              );
            }) : (
              <div className="text-center text-gray-500 py-16">선택된 종류의 기록이 없습니다.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};