import React, { useState } from 'react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { X, Plus } from 'lucide-react';
import { ColorPicker } from '../ui/ColorPicker';

const SettingSection: React.FC<{ title: string; items: string[]; setItems: (items: string[]) => void; }> = ({ title, items, setItems }) => {
  const [newItem, setNewItem] = useState('');

  const handleAddItem = () => {
    if (newItem && !items.includes(newItem)) {
      setItems([...items, newItem].sort());
      setNewItem('');
    }
  };

  const handleRemoveItem = (itemToRemove: string) => {
    setItems(items.filter(item => item !== itemToRemove));
  };

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold">{title}</h3>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex space-x-2">
          <Input
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            placeholder="추가할 항목 입력..."
            onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
          />
          <Button onClick={handleAddItem} className="flex-shrink-0">
            <Plus className="h-4 w-4 mr-1" />
            추가
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {items.map(item => (
            <span key={item} className="flex items-center bg-gray-100 text-gray-800 text-sm font-medium px-3 py-1 rounded-full">
              {item}
              <button onClick={() => handleRemoveItem(item)} className="ml-2 text-gray-500 hover:text-gray-800">
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export const Settings: React.FC = () => {
  const [subjects, setSubjects] = useLocalStorage<string[]>('settings:subjects', ['기술', '가정']);
  const [periods, setPeriods] = useLocalStorage<string[]>('settings:periods', ['1교시', '2교시', '3교시', '4교시', '5교시', '6교시', '7교시']);
  const [maxStarsPerStudent, setMaxStarsPerStudent] = useLocalStorage<number>('settings:maxStarsPerStudent', 5);
  const [grade1Color, setGrade1Color] = useLocalStorage<string>('settings:grade1Color', '#f8fafc');
  const [grade2Color, setGrade2Color] = useLocalStorage<string>('settings:grade2Color', '#f8fafc');
  // 👇 [추가] 3학년 배경색 상태를 추가합니다.
  const [grade3Color, setGrade3Color] = useLocalStorage<string>('settings:grade3Color', '#f8fafc');

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">환경설정</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SettingSection title="과목 관리" items={subjects} setItems={setSubjects} />
        <SettingSection title="교시 관리" items={periods} setItems={setPeriods} />
      </div>
      <Card>
        <CardHeader><h3 className="text-lg font-semibold">학생별 최대 칭찬 별 개수</h3></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
              <Input type="range" min="1" max="10" value={maxStarsPerStudent} onChange={(e) => setMaxStarsPerStudent(Number(e.target.value))} className="w-full" />
              <span className="font-bold text-blue-600 text-lg w-20 text-center">{maxStarsPerStudent}개</span>
          </div>
        </CardContent>
      </Card>
      <div>
        <h2 className="text-xl font-semibold mb-3">대시보드 카드 배경색 설정</h2>
        {/* 👇 [수정] grid-cols-3으로 변경하여 3학년까지 표시합니다. */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
                <CardHeader><h3 className="font-semibold">1학년 배경색</h3></CardHeader>
                <CardContent>
                    <ColorPicker value={grade1Color} onChange={setGrade1Color} />
                </CardContent>
            </Card>
            <Card>
                <CardHeader><h3 className="font-semibold">2학년 배경색</h3></CardHeader>
                <CardContent>
                    <ColorPicker value={grade2Color} onChange={setGrade2Color} />
                </CardContent>
            </Card>
            {/* 👇 [추가] 3학년 색상 설정 카드를 추가합니다. */}
            <Card>
                <CardHeader><h3 className="font-semibold">3학년 배경색</h3></CardHeader>
                <CardContent>
                    <ColorPicker value={grade3Color} onChange={setGrade3Color} />
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
};