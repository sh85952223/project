import { useState, useEffect, useCallback } from 'react';
import { db } from '../firebase'; // Firestore 데이터베이스 인스턴스
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
  where // **수정: 'where' 함수를 import 목록에 추가했습니다.**
} from 'firebase/firestore';
import { Schedule, ClassInfo } from '../types';
import { useAuth } from '../context/AuthContext';

// useSchedules 훅을 정의합니다.
export const useSchedules = () => {
  const { teacher } = useAuth(); // 현재 로그인한 교사 정보를 가져옵니다.
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 실시간 데이터 로딩
  useEffect(() => {
    // 로그인한 교사가 있을 때만 데이터를 가져옵니다.
    if (!teacher) {
      setIsLoading(false);
      setSchedules([]); // 로그아웃 시 데이터 초기화
      setClasses([]);   // 로그아웃 시 데이터 초기화
      return;
    }

    setIsLoading(true);

    // 1. 수업(Schedules) 데이터 실시간 감시
    const schedulesQuery = query(collection(db, 'teachers', teacher.id, 'schedules'));
    const unsubscribeSchedules = onSnapshot(schedulesQuery, (querySnapshot) => {
      const schedulesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Schedule));
      setSchedules(schedulesData);
    }, (error) => {
      console.error("수업 정보 실시간 로딩 오류:", error);
    });

    // 2. 반(Classes) 데이터 실시간 감시
    const classesQuery = query(collection(db, 'teachers', teacher.id, 'classes'));
    const unsubscribeClasses = onSnapshot(classesQuery, async (querySnapshot) => {
      const classesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ClassInfo));
      
      // 반 정보가 하나도 없으면 기본 데이터를 생성합니다.
      if (classesData.length === 0 && querySnapshot.metadata.fromCache === false) {
        await initializeDefaultClasses(teacher.id);
      } else {
        setClasses(classesData);
      }
      setIsLoading(false);
    }, (error) => {
      console.error("반 정보 실시간 로딩 오류:", error);
      setIsLoading(false);
    });

    // 컴포넌트가 언마운트되면 실시간 감시를 중단합니다.
    return () => {
      unsubscribeSchedules();
      unsubscribeClasses();
    };
  }, [teacher]); // teacher 정보가 바뀔 때마다(로그인/로그아웃) 다시 실행됩니다.

  // 기본 반/학생 데이터 생성 함수
  const initializeDefaultClasses = async (teacherId: string) => {
    const defaultClasses: Omit<ClassInfo, 'id'>[] = [
      { name: '1학년 1반', grade: 1, students: [] },
      { name: '1학년 2반', grade: 1, students: [] },
    ];
    
    // 여러 문서를 한 번에 쓰는 'batch' 작업을 사용합니다.
    const batch = writeBatch(db);
    const classesCollection = collection(db, 'teachers', teacherId, 'classes');
    
    defaultClasses.forEach(classData => {
      const docRef = doc(classesCollection); // 새 문서 참조 생성
      batch.set(docRef, classData);
    });

    await batch.commit();
  };

  // 수업 추가
  const addSchedule = useCallback(async (schedule: Omit<Schedule, 'id' | 'teacherId' | 'createdAt' | 'updatedAt'>) => {
    if (!teacher) throw new Error('로그인이 필요합니다.');
    const schedulesCollection = collection(db, 'teachers', teacher.id, 'schedules');
    await addDoc(schedulesCollection, {
      ...schedule,
      teacherId: teacher.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }, [teacher]);

  // 수업 정보 업데이트
  const updateSchedule = useCallback(async (id: string, updates: Partial<Schedule>) => {
    if (!teacher) throw new Error('로그인이 필요합니다.');
    const scheduleDoc = doc(db, 'teachers', teacher.id, 'schedules', id);
    await updateDoc(scheduleDoc, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  }, [teacher]);

  // 수업 삭제
  const deleteSchedule = useCallback(async (id: string) => {
    if (!teacher) throw new Error('로그인이 필요합니다.');
    const scheduleDoc = doc(db, 'teachers', teacher.id, 'schedules', id);
    await deleteDoc(scheduleDoc);
  }, [teacher]);
  
  // 진도 내용만 삭제
  const clearProgress = useCallback(async (id: string) => {
    if (!teacher) throw new Error('로그인이 필요합니다.');
    const scheduleDoc = doc(db, 'teachers', teacher.id, 'schedules', id);
    await updateDoc(scheduleDoc, {
      progress: '',
      absences: [],
      updatedAt: new Date().toISOString()
    });
  }, [teacher]);


  // 반 추가
  const addClass = useCallback(async (classInfo: Omit<ClassInfo, 'id'>) => {
    if (!teacher) throw new Error('로그인이 필요합니다.');
    const classesCollection = collection(db, 'teachers', teacher.id, 'classes');
    await addDoc(classesCollection, classInfo);
  }, [teacher]);

  // 반 정보 업데이트 (학생 명단 포함)
  const updateClass = useCallback(async (classInfo: ClassInfo) => {
    if (!teacher) throw new Error('로그인이 필요합니다.');
    const classDoc = doc(db, 'teachers', teacher.id, 'classes', classInfo.id);
    await updateDoc(classDoc, { ...classInfo }); // **수정: 객체를 복사해서 전달**
  }, [teacher]);
  
  // 반 삭제 (관련된 모든 수업 기록 포함)
  const deleteClass = useCallback(async (classId: string) => {
    if (!teacher) throw new Error('로그인이 필요합니다.');
    
    const schedulesCollection = collection(db, 'teachers', teacher.id, 'schedules');
    // **수정: 잘못된 쿼리 문법을 수정했습니다.**
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


  // 이 훅이 반환하는 값들
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
