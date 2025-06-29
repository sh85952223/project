import { useState, useEffect, useCallback } from 'react';
import { db } from '../firebase';
import {
  collection,
  query,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  writeBatch,
  getDocs,
  where
} from 'firebase/firestore';
import { Schedule, ClassInfo, Student } from '../types';
import { useAuth } from '../context/AuthContext';

export const useSchedules = () => {
  const { teacher } = useAuth();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const sortClasses = (classesToSort: ClassInfo[]): ClassInfo[] => {
    return classesToSort.sort((a, b) => {
      if (a.grade !== b.grade) {
        return a.grade - b.grade;
      }
      return a.name.localeCompare(b.name, undefined, { numeric: true });
    });
  };

  useEffect(() => {
    if (!teacher) {
      setIsLoading(false);
      setSchedules([]);
      setClasses([]);
      return;
    }

    setIsLoading(true);

    const schedulesQuery = query(collection(db, 'teachers', teacher.id, 'schedules'));
    const unsubscribeSchedules = onSnapshot(schedulesQuery, (querySnapshot) => {
      const schedulesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Schedule));
      setSchedules(schedulesData);
    });

    const classesQuery = query(collection(db, 'teachers', teacher.id, 'classes'));
    const unsubscribeClasses = onSnapshot(classesQuery, async (querySnapshot) => {
      const classesData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          grade: data.grade,
          students: data.students || [],
        } as ClassInfo;
      });
      
      if (classesData.length === 0 && !querySnapshot.metadata.fromCache) {
        const newClasses = await initializeDefaultClasses(teacher.id);
        setClasses(sortClasses(newClasses));
      } else {
        setClasses(sortClasses(classesData));
      }
      setIsLoading(false);
    }, (error) => {
      console.error("반 정보 실시간 로딩 오류:", error);
      setIsLoading(false);
    });

    return () => {
      unsubscribeSchedules();
      unsubscribeClasses();
    };
  }, [teacher]);

  const initializeDefaultClasses = async (teacherId: string): Promise<ClassInfo[]> => {
    // ... 이 함수는 수정할 필요가 없습니다 ...
  };

  // 👇👇👇 [여기가 수정된 부분입니다] 👇👇👇
  const addSchedule = useCallback(async (schedule: Omit<Schedule, 'id' | 'teacherId' | 'createdAt' | 'updatedAt' | 'praises' | 'specialNotes'>) => {
    if (!teacher) throw new Error('로그인이 필요합니다.');
    const schedulesCollection = collection(db, 'teachers', teacher.id, 'schedules');
    await addDoc(schedulesCollection, {
      ...schedule,
      teacherId: teacher.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      // 칭찬과 특이사항 필드를 빈 배열로 초기화합니다.
      praises: [], 
      specialNotes: [] 
    });
  }, [teacher]);

  const updateSchedule = useCallback(async (id: string, updates: Partial<Schedule>) => {
    if (!teacher) throw new Error('로그인이 필요합니다.');
    const scheduleDoc = doc(db, 'teachers', teacher.id, 'schedules', id);
    await updateDoc(scheduleDoc, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  }, [teacher]);

  const deleteSchedule = useCallback(async (id: string) => {
    // ... 이 함수는 수정할 필요가 없습니다 ...
  }, [teacher]);
  
  const clearProgress = useCallback(async (id: string) => {
    // ... 이 함수는 수정할 필요가 없습니다 ...
  }, [teacher]);

  const addClass = useCallback(async (classInfo: Omit<ClassInfo, 'id'>) => {
    // ... 이 함수는 수정할 필요가 없습니다 ...
  }, [teacher]);

  const updateClass = useCallback(async (classInfo: ClassInfo) => {
    // ... 이 함수는 수정할 필요가 없습니다 ...
  }, [teacher]);
  
  const deleteClass = useCallback(async (classId: string) => {
    // ... 이 함수는 수정할 필요가 없습니다 ...
  }, [teacher]);

  return {
    schedules,
    classes,
    isLoading,
    addSchedule,
    updateSchedule,
    deleteSchedule,
    clearProgress,
    addClass,
    updateClass,
    deleteClass,
  };
};