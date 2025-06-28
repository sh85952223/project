import { useState, useEffect, useCallback } from 'react';
import { Schedule, ClassInfo, Student } from '../types';
import { useAuth } from '../context/AuthContext';

export const useSchedules = () => {
  const { teacher } = useAuth();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 강제 리렌더링을 위한 상태
  const [updateTrigger, setUpdateTrigger] = useState(0);
  const [lastUpdateTime, setLastUpdateTime] = useState(Date.now());

  const forceUpdate = useCallback(() => {
    const newTime = Date.now();
    setUpdateTrigger(prev => prev + 1);
    setLastUpdateTime(newTime);
    console.log('Force update triggered:', newTime);
  }, []);

  // 안전한 데이터 로딩 함수
  const safeLoadData = useCallback((key: string, defaultValue: any = []) => {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        console.log(`Loaded ${key}:`, parsed.length, 'items');
        return Array.isArray(parsed) ? parsed : defaultValue;
      }
      console.log(`No data found for ${key}, using default`);
      return defaultValue;
    } catch (error) {
      console.error(`Error loading ${key}:`, error);
      return defaultValue;
    }
  }, []);

  // 안전한 데이터 저장 함수
  const safeSaveData = useCallback((key: string, data: any) => {
    try {
      // 데이터 유효성 검사
      if (!Array.isArray(data)) {
        console.error(`Invalid data type for ${key}:`, typeof data);
        return false;
      }

      // 백업 생성
      const backupKey = `${key}_backup`;
      const currentData = localStorage.getItem(key);
      if (currentData) {
        localStorage.setItem(backupKey, currentData);
      }

      // 새 데이터 저장
      const jsonString = JSON.stringify(data);
      localStorage.setItem(key, jsonString);
      
      // 저장 검증
      const verification = localStorage.getItem(key);
      if (verification === jsonString) {
        console.log(`Successfully saved ${key}:`, data.length, 'items');
        return true;
      } else {
        console.error(`Save verification failed for ${key}`);
        // 백업에서 복원
        if (currentData) {
          localStorage.setItem(key, currentData);
        }
        return false;
      }
    } catch (error) {
      console.error(`Error saving ${key}:`, error);
      return false;
    }
  }, []);

  // 실시간 동기화를 위한 이벤트 리스너
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (teacher && e.key === `schedules_${teacher.id}`) {
        console.log('Storage change detected, reloading schedules');
        loadSchedules();
      }
    };

    const handleCustomUpdate = (event: CustomEvent) => {
      console.log('Custom schedule update event received');
      loadSchedules();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('scheduleUpdate', handleCustomUpdate as EventListener);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('scheduleUpdate', handleCustomUpdate as EventListener);
    };
  }, [teacher]);

  useEffect(() => {
    if (teacher) {
      loadSchedules();
      loadClasses();
    }
  }, [teacher, updateTrigger]);

  const loadSchedules = useCallback(() => {
    if (!teacher) return;
    
    console.log('Loading schedules for teacher:', teacher.id);
    const key = `schedules_${teacher.id}`;
    const loadedSchedules = safeLoadData(key, []);
    
    // 데이터 무결성 검사
    const validSchedules = loadedSchedules.filter((schedule: any) => {
      return schedule && 
             typeof schedule.id === 'string' && 
             typeof schedule.date === 'string' && 
             typeof schedule.time === 'string' &&
             typeof schedule.classId === 'string' &&
             typeof schedule.subject === 'string';
    });

    if (validSchedules.length !== loadedSchedules.length) {
      console.warn(`Filtered out ${loadedSchedules.length - validSchedules.length} invalid schedules`);
      // 유효한 데이터만 다시 저장
      safeSaveData(key, validSchedules);
    }

    console.log('Final loaded schedules:', validSchedules.length);
    setSchedules(validSchedules);
  }, [teacher, safeLoadData, safeSaveData]);

  const loadClasses = useCallback(() => {
    if (!teacher) return;
    
    const key = `classes_${teacher.id}`;
    const loadedClasses = safeLoadData(key, []);
    
    if (loadedClasses.length === 0) {
      console.log('No classes found, initializing default classes');
      initializeDefaultClasses();
    } else {
      setClasses(loadedClasses);
    }
  }, [teacher, safeLoadData]);

  const initializeDefaultClasses = useCallback(() => {
    if (!teacher) return;
    
    const defaultClasses: ClassInfo[] = [
      {
        id: '1-1',
        name: '1학년 1반',
        grade: 1,
        students: [
          { id: '1', name: '김철수', classId: '1-1', number: 1 },
          { id: '2', name: '이영희', classId: '1-1', number: 2 },
          { id: '3', name: '박민수', classId: '1-1', number: 3 },
          { id: '4', name: '최지원', classId: '1-1', number: 4 },
          { id: '5', name: '정다현', classId: '1-1', number: 5 },
        ]
      },
      {
        id: '1-2',
        name: '1학년 2반',
        grade: 1,
        students: [
          { id: '6', name: '강동현', classId: '1-2', number: 1 },
          { id: '7', name: '윤서진', classId: '1-2', number: 2 },
          { id: '8', name: '조한별', classId: '1-2', number: 3 },
          { id: '9', name: '송예린', classId: '1-2', number: 4 },
          { id: '10', name: '임도훈', classId: '1-2', number: 5 },
        ]
      },
      {
        id: '2-1',
        name: '2학년 1반',
        grade: 2,
        students: [
          { id: '11', name: '배준혁', classId: '2-1', number: 1 },
          { id: '12', name: '신하늘', classId: '2-1', number: 2 },
          { id: '13', name: '홍시우', classId: '2-1', number: 3 },
          { id: '14', name: '장민정', classId: '2-1', number: 4 },
          { id: '15', name: '오성민', classId: '2-1', number: 5 },
        ]
      }
    ];
    
    setClasses(defaultClasses);
    const key = `classes_${teacher.id}`;
    safeSaveData(key, defaultClasses);
  }, [teacher, safeSaveData]);

  const saveSchedules = useCallback((newSchedules: Schedule[]) => {
    if (!teacher) return false;
    
    console.log('Attempting to save schedules:', newSchedules.length, 'items');
    
    // 데이터 유효성 재검사
    const validSchedules = newSchedules.filter(schedule => {
      const isValid = schedule && 
                     typeof schedule.id === 'string' && 
                     typeof schedule.date === 'string' && 
                     typeof schedule.time === 'string' &&
                     typeof schedule.classId === 'string' &&
                     typeof schedule.subject === 'string' &&
                     schedule.teacherId === teacher.id;
      
      if (!isValid) {
        console.warn('Invalid schedule detected:', schedule);
      }
      return isValid;
    });

    if (validSchedules.length !== newSchedules.length) {
      console.warn(`Filtered out ${newSchedules.length - validSchedules.length} invalid schedules before saving`);
    }

    const key = `schedules_${teacher.id}`;
    const saveSuccess = safeSaveData(key, validSchedules);
    
    if (saveSuccess) {
      // 상태 업데이트는 저장 성공 후에만
      setSchedules(validSchedules);
      
      // 다중 업데이트 트리거
      setTimeout(() => forceUpdate(), 10);
      setTimeout(() => forceUpdate(), 100);
      setTimeout(() => forceUpdate(), 300);
      
      // 커스텀 이벤트 발생
      window.dispatchEvent(new CustomEvent('scheduleUpdate', { 
        detail: { schedules: validSchedules, timestamp: Date.now() } 
      }));
      
      console.log('Schedules saved and updated successfully');
      return true;
    } else {
      console.error('Failed to save schedules');
      return false;
    }
  }, [teacher, safeSaveData, forceUpdate]);

  const saveClasses = useCallback((newClasses: ClassInfo[]) => {
    if (!teacher) return false;
    
    const key = `classes_${teacher.id}`;
    const saveSuccess = safeSaveData(key, newClasses);
    
    if (saveSuccess) {
      setClasses(newClasses);
      forceUpdate();
      return true;
    }
    return false;
  }, [teacher, safeSaveData, forceUpdate]);

  const addSchedule = useCallback((schedule: Omit<Schedule, 'id' | 'teacherId' | 'createdAt' | 'updatedAt'>) => {
    if (!teacher) return false;

    const newSchedule: Schedule = {
      ...schedule,
      id: `schedule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      teacherId: teacher.id,
      absences: schedule.absences || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    console.log('Adding new schedule:', newSchedule);
    const updatedSchedules = [...schedules, newSchedule];
    return saveSchedules(updatedSchedules);
  }, [teacher, schedules, saveSchedules]);

  const updateSchedule = useCallback(async (id: string, updates: Partial<Schedule>) => {
    if (!teacher) throw new Error('No teacher logged in');
    
    setIsLoading(true);
    try {
      console.log('Updating schedule:', id, 'with updates:', updates);
      
      // 현재 스케줄 찾기
      const currentSchedule = schedules.find(s => s.id === id);
      if (!currentSchedule) {
        throw new Error('Schedule not found');
      }

      // 업데이트된 스케줄 생성 - 기존 데이터 보존
      const updatedSchedule = {
        ...currentSchedule,
        ...updates,
        id: currentSchedule.id, // ID는 변경되지 않도록 보장
        teacherId: currentSchedule.teacherId, // teacherId 보존
        createdAt: currentSchedule.createdAt, // 생성일 보존
        updatedAt: new Date().toISOString()
      };

      // 전체 스케줄 배열 업데이트
      const updatedSchedules = schedules.map(schedule =>
        schedule.id === id ? updatedSchedule : schedule
      );

      console.log('Updated schedule:', updatedSchedule);
      console.log('Total schedules after update:', updatedSchedules.length);
      
      // 저장 및 상태 업데이트
      const saveSuccess = saveSchedules(updatedSchedules);
      
      if (!saveSuccess) {
        throw new Error('Failed to save updated schedule');
      }
      
      console.log('Schedule updated successfully');
      return true;
    } catch (error) {
      console.error('Failed to update schedule:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [teacher, schedules, saveSchedules]);

  const deleteSchedule = useCallback(async (id: string) => {
    if (!teacher) throw new Error('No teacher logged in');
    
    setIsLoading(true);
    try {
      console.log('Deleting schedule:', id);
      console.log('Current schedules before deletion:', schedules.length);
      
      const updatedSchedules = schedules.filter(schedule => schedule.id !== id);
      console.log('Schedules after deletion:', updatedSchedules.length);
      
      const saveSuccess = saveSchedules(updatedSchedules);
      
      if (!saveSuccess) {
        throw new Error('Failed to save after deletion');
      }
      
      console.log('Schedule deleted successfully');
      return true;
    } catch (error) {
      console.error('Failed to delete schedule:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [teacher, schedules, saveSchedules]);

  const clearProgress = useCallback(async (id: string) => {
    if (!teacher) throw new Error('No teacher logged in');
    
    setIsLoading(true);
    try {
      console.log('Clearing progress for schedule:', id);
      
      const scheduleToUpdate = schedules.find(s => s.id === id);
      if (!scheduleToUpdate) {
        throw new Error('Schedule not found');
      }

      // 진도만 삭제하고 나머지 데이터는 보존
      const updatedSchedules = schedules.map(schedule =>
        schedule.id === id
          ? { 
              ...schedule, 
              progress: '', 
              absences: [], 
              updatedAt: new Date().toISOString() 
            }
          : schedule
      );

      console.log('Clearing progress - updated schedules length:', updatedSchedules.length);
      console.log('Schedule after clearing:', updatedSchedules.find(s => s.id === id));
      
      const saveSuccess = saveSchedules(updatedSchedules);
      
      if (!saveSuccess) {
        throw new Error('Failed to save after clearing progress');
      }
      
      console.log('Progress cleared successfully');
      return true;
    } catch (error) {
      console.error('Failed to clear progress:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [teacher, schedules, saveSchedules]);

  const addClass = useCallback((classInfo: Omit<ClassInfo, 'id'>) => {
    const newClass: ClassInfo = {
      ...classInfo,
      id: `class_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    const updatedClasses = [...classes, newClass];
    return saveClasses(updatedClasses);
  }, [classes, saveClasses]);

  const updateClass = useCallback((classInfo: ClassInfo) => {
    const updatedClasses = classes.map(cls =>
      cls.id === classInfo.id ? classInfo : cls
    );
    return saveClasses(updatedClasses);
  }, [classes, saveClasses]);

  const deleteClass = useCallback(async (classId: string) => {
    setIsLoading(true);
    try {
      // Delete all schedules for this class
      const updatedSchedules = schedules.filter(schedule => schedule.classId !== classId);
      const schedulesSaveSuccess = saveSchedules(updatedSchedules);

      // Delete the class
      const updatedClasses = classes.filter(cls => cls.id !== classId);
      const classesSaveSuccess = saveClasses(updatedClasses);
      
      return schedulesSaveSuccess && classesSaveSuccess;
    } catch (error) {
      console.error('Failed to delete class:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [schedules, classes, saveSchedules, saveClasses]);

  // 실시간 스케줄 가져오기 함수 (항상 최신 상태)
  const getLatestSchedules = useCallback(() => {
    if (!teacher) return [];
    
    const key = `schedules_${teacher.id}`;
    const latestSchedules = safeLoadData(key, schedules);
    
    // 현재 메모리 상태와 비교
    if (JSON.stringify(latestSchedules) !== JSON.stringify(schedules)) {
      console.log('Latest schedules differ from current state, updating...');
      setSchedules(latestSchedules);
    }
    
    return latestSchedules;
  }, [teacher, schedules, safeLoadData]);

  // 데이터 복구 함수
  const recoverData = useCallback(() => {
    if (!teacher) return false;
    
    try {
      const backupKey = `schedules_${teacher.id}_backup`;
      const backupData = localStorage.getItem(backupKey);
      
      if (backupData) {
        const parsedBackup = JSON.parse(backupData);
        console.log('Recovering data from backup:', parsedBackup.length, 'items');
        
        const key = `schedules_${teacher.id}`;
        localStorage.setItem(key, backupData);
        setSchedules(parsedBackup);
        forceUpdate();
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to recover data:', error);
      return false;
    }
  }, [teacher, forceUpdate]);

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
    forceUpdate,
    getLatestSchedules,
    lastUpdateTime,
    recoverData, // 데이터 복구 함수 추가
  };
};