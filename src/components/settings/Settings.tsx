import React, { useState, useEffect } from 'react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { Card, CardContent, CardHeader, CardFooter } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { X, Plus, Save } from 'lucide-react';
import { ColorPicker } from '../ui/ColorPicker';

// 👇 [수정] 레이아웃을 Flexbox 기반으로 변경하여 높이를 통일합니다.
const EditableListSection: React.FC<{
  title: string;
  storageKey: string;
  defaultItems: string[];
}> = ({ title, storageKey, defaultItems }) => {
  const [persistedItems, setPersistedItems] = useLocalStorage<string[]>(storageKey, defaultItems);
  const [localItems, setLocalItems] = useState(persistedItems);
  const [newItem, setNewItem] = useState('');

  useEffect(() => {
    setLocalItems(persistedItems);
  }, [persistedItems]);

  const handleAddItem = () => {
    if (newItem && !localItems.includes(newItem)) {
      setLocalItems([...localItems, newItem].sort());
      setNewItem('');
    }
  };

  const handleRemoveItem = (itemToRemove: string) => {
    setLocalItems(localItems.filter(item => item !== itemToRemove));
  };
  
  const handleSave = () => {
    setPersistedItems(localItems);
    if(window.confirm("저장되었습니다. 변경사항을 적용하기 위해 페이지를 새로고침하시겠습니까?")) {
        window.location.reload();
    }
  };

  return (
    // Card 자체에 flex와 column 방향을 지정하여 내부 요소들이 수직으로 쌓이게 합니다.
    <Card className="flex flex-col">
      <CardHeader>
        <h3 className="text-lg font-semibold">{title}</h3>
      </CardHeader>
      {/* CardContent가 남는 공간을 모두 차지하도록 flex-grow를 적용합니다. */}
      <CardContent className="space-y-4 flex-grow">
        <div className="flex space-x-2">
          <Input value={newItem} onChange={(e) => setNewItem(e.target.value)} placeholder="추가할 항목 입력..." onKeyDown={(e) => e.key === 'Enter' && handleAddItem()} />
          <Button onClick={handleAddItem} className="flex-shrink-0"><Plus className="h-4 w-4 mr-1" />추가</Button>
        </div>
        {/* 태그 영역에 최소 높이를 지정하여 두 줄까지의 공간을 미리 확보합니다. */}
        <div className="flex flex-wrap gap-2 min-h-[72px]">
          {localItems.map(item => (
            <span key={item} className="flex items-center bg-gray-100 text-gray-800 text-sm font-medium px-3 py-1 rounded-full h-8">
              {item}
              <button onClick={() => handleRemoveItem(item)} className="ml-2 text-gray-500 hover:text-gray-800"><X className="h-3 w-3" /></button>
            </span>
          ))}
        </div>
      </CardContent>
      {/* CardFooter는 항상 맨 아래에 위치하게 됩니다. */}
      <CardFooter>
        <Button size="sm" onClick={handleSave} className="ml-auto"><Save className="h-4 w-4 mr-2" />저장</Button>
      </CardFooter>
    </Card>
  );
};

export const Settings: React.FC = () => {
  const [maxStars, setMaxStars] = useLocalStorage<number>('settings:maxStarsPerStudent', 5);
  const [localMaxStars, setLocalMaxStars] = useState(maxStars);

  const [grade1Color, setGrade1Color] = useLocalStorage<string>('settings:grade1Color', '#f8fafc');
  const [localGrade1Color, setLocalGrade1Color] = useState(grade1Color);
  
  const [grade2Color, setGrade2Color] = useLocalStorage<string>('settings:grade2Color', '#f8fafc');
  const [localGrade2Color, setLocalGrade2Color] = useState(grade2Color);

  const [grade3Color, setGrade3Color] = useLocalStorage<string>('settings:grade3Color', '#f8fafc');
  const [localGrade3Color, setLocalGrade3Color] = useState(grade3Color);
  
  const handleSaveMaxStars = () => {
      setMaxStars(localMaxStars);
      if(window.confirm("저장되었습니다. 변경사항은 다음 상세 기록 페이지부터 적용됩니다.")) {}
  };

  const handleSaveColors = () => {
      setGrade1Color(localGrade1Color);
      setGrade2Color(localGrade2Color);
      setGrade3Color(localGrade3Color);
      if(window.confirm("저장되었습니다. 변경사항을 적용하기 위해 페이지를 새로고침하시겠습니까?")) {
          window.location.reload();
      }
  };


  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">환경설정</h1>
        <p className="text-gray-500 mt-1">이곳에서 수정한 내용은 앱 전체에 적용됩니다.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <EditableListSection title="과목 관리" storageKey="settings:subjects" defaultItems={['기술', '가정']} />
        <EditableListSection title="교시 관리" storageKey="settings:periods" defaultItems={['1교시', '2교시', '3교시', '4교시', '5교시', '6교시', '7교시']} />
      </div>
      
      <Card>
        <CardHeader><h3 className="text-lg font-semibold">학생별 최대 칭찬 별 개수</h3></CardHeader>
        <CardContent>
            <p className="text-sm text-gray-600 mb-2">한 수업에서 한 학생에게 부여할 수 있는 별의 최대 개수를 설정합니다.</p>
            <Input type="number" min="1" max="10" value={localMaxStars} onChange={(e) => setLocalMaxStars(Number(e.target.value))} className="w-24"/>
        </CardContent>
        <CardFooter>
            <Button size="sm" onClick={handleSaveMaxStars} className="ml-auto"><Save className="h-4 w-4 mr-2" />저장</Button>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader><h3 className="text-lg font-semibold">학년별 배경색 설정</h3></CardHeader>
        <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <h4 className="font-medium mb-2">1학년 배경색</h4>
                    <ColorPicker value={localGrade1Color} onChange={setLocalGrade1Color} />
                </div>
                <div>
                    <h4 className="font-medium mb-2">2학년 배경색</h4>
                    <ColorPicker value={localGrade2Color} onChange={setLocalGrade2Color} />
                </div>
                <div>
                    <h4 className="font-medium mb-2">3학년 배경색</h4>
                    <ColorPicker value={localGrade3Color} onChange={setLocalGrade3Color} />
                </div>
            </div>
        </CardContent>
        <CardFooter>
            <Button size="sm" onClick={handleSaveColors} className="ml-auto"><Save className="h-4 w-4 mr-2" />저장</Button>
        </CardFooter>
      </Card>
    </div>
  );
};