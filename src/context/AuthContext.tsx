import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth, db } from '../firebase';
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { Teacher } from '../types';

interface AuthContextType {
  teacher: Teacher | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

const mapFirebaseUserToTeacher = async (user: User): Promise<Teacher | null> => {
  const docRef = doc(db, "teachers", user.uid);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data() as Teacher;
  }
  return {
    id: user.uid,
    name: user.displayName || '이름 없음',
    email: user.email || '',
    password: '',
    createdAt: user.metadata.creationTime || new Date().toISOString(),
  };
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      // === 여기부터가 중요합니다! ===
      try {
        // 1. Firebase와 통신을 시도합니다.
        if (user) {
          const teacherData = await mapFirebaseUserToTeacher(user);
          setTeacher(teacherData);
        } else {
          setTeacher(null);
        }
      } catch (error) {
        // 2. 만약 통신 중 오류가 발생하면, 콘솔에 에러를 기록하고 안전하게 로그아웃 처리합니다.
        console.error("Firebase 인증 상태 확인 중 오류 발생:", error);
        setTeacher(null);
      } finally {
        // 3. 성공하든, 오류가 발생하든, 무조건 로딩 상태를 해제하여 다음 화면으로 넘어가게 합니다.
        setIsLoading(false);
      }
      // === 여기까지가 중요합니다! ===
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await updateProfile(user, { displayName: name });

      const newTeacher: Omit<Teacher, 'password'> = {
        id: user.uid,
        name,
        email,
        createdAt: new Date().toISOString(),
      };
      await setDoc(doc(db, "teachers", user.uid), newTeacher);

      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ teacher, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
