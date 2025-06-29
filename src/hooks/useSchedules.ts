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
import { Schedule, ClassInfo } from '../types';
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
    const batch = writeBatch(db);
    const classesCollection = collection(db, 'teachers', teacherId, 'classes');
    const newClasses: ClassInfo[] = [];

    const class1Ref = doc(classesCollection);
    const class1Data: ClassInfo = { 
      id: class1Ref.id,
      name: '1학년 1반', 
      grade: 1, 
      students: [
        { id: `student_${Date.now()}_1`, name: '김민준', classId: class1Ref.id, number: 1 },
        { id: `student_${Date.now()}_2`, name: '이서아', classId: class1Ref.id, number: 2 }
      ]
    };
    batch.set(class1Ref, { name: class1Data.name, grade: class1Data.grade, students: class1Data.students });
    newClasses.push(class1Data);

    const class2Ref = doc(classesCollection);
    const class2Data: ClassInfo = {
      id: '2학년 1반',
      name: '2학년 1반',
      grade: 2,
      students: [
        { id: `student_${Date.now()}_3`, name: '박도윤', classId: class2Ref.id, number: 1 },
        { id: `student_${Date.now()}_4`, name: '최지우', classId: class2Ref.id, number: 2 }
      ]
    };
    batch.set(class2Ref, { name: class2Data.name, grade: class2Data.grade, students: class2Data.students });
    newClasses.push(class2Data);

    await batch.commit();
    return newClasses;
  };

  const addSchedule = useCallback(async (schedule: Omit<Schedule, 'id' | 'teacherId' | 'createdAt' | 'updatedAt' | 'praises' | 'specialNotes'>) => {
    if (!teacher) throw new Error('로그인이 필요합니다.');
    const schedulesCollection = collection(db, 'teachers', teacher.id, 'schedules');
    await addDoc(schedulesCollection, {
      ...schedule,
      teacherId: teacher.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
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

  const deleteSchedule = useCallback(async (id: string): Promise<boolean> => {
    if (!teacher) {
        console.error('오류: 로그인 정보가 없습니다.');
        return false;
    }
    try {
        const scheduleDoc = doc(db, 'teachers', teacher.id, 'schedules', id);
        await deleteDoc(scheduleDoc);
        return true;
    } catch (error) {
        console.error("수업 삭제 중 오류 발생:", error);
        alert('수업 기록 삭제에 실패했습니다. 잠시 후 다시 시도해주세요.');
        return false;
    }
  }, [teacher]);
  
  const clearProgress = useCallback(async (id: string) => {
    if (!teacher) throw new Error('로그인이 필요합니다.');
    const scheduleDoc = doc(db, 'teachers', teacher.id, 'schedules', id);
    await updateDoc(scheduleDoc, {
      progress: '',
      absences: [],
      updatedAt: new Date().toISOString()
    });
  }, [teacher]);

  const addClass = useCallback(async (classInfo: Omit<ClassInfo, 'id' | 'students'>) => {
    if (!teacher) throw new Error('로그인이 필요합니다.');
    const classesCollection = collection(db, 'teachers', teacher.id, 'classes');
    await addDoc(classesCollection, {
      ...classInfo,
      students: [] 
    });
  }, [teacher]);

  const updateClass = useCallback(async (classInfo: ClassInfo) => {
    if (!teacher) throw new Error('로그인이 필요합니다.');
    const classDoc = doc(db, 'teachers', teacher.id, 'classes', classInfo.id);
    const plainClassInfo = JSON.parse(JSON.stringify(classInfo));
    delete plainClassInfo.id; 
    await updateDoc(classDoc, plainClassInfo);
  }, [teacher]);
  
  const deleteClass = useCallback(async (classId: string) => {
    if (!teacher) throw new Error('로그인이 필요합니다.');
    const schedulesCollection = collection(db, 'teachers', teacher.id, 'schedules');
    const q = query(schedulesCollection, where("classId", "==", classId));
    const schedulesSnapshot = await getDocs(q);
    const batch = writeBatch(db);
    schedulesSnapshot.forEach(doc => {
      batch.delete(doc.ref);
    });
    const classDoc = doc(db, 'teachers', teacher.id, 'classes', classId);
    batch.delete(classDoc);
    await batch.commit();
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