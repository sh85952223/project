import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
// 👈 [수정] 경로를 '../firebase'로 변경해주세요.
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
    // Firestore에서 가져온 데이터와 User 객체의 기본 정보를 합칩니다.
    const dbData = docSnap.data();
    return {
      id: user.uid,
      name: user.displayName || dbData.name || '이름 없음',
      email: user.email || dbData.email || '',
      password: '', // 비밀번호는 저장하지 않습니다.
      createdAt: user.metadata.creationTime || dbData.createdAt || new Date().toISOString(),
      ...dbData // Firestore에 저장된 추가 필드가 있다면 여기에 포함됩니다.
    } as Teacher;
  }
  // Firestore에 사용자 문서가 없는 경우 (예: 인증만 생성된 경우)
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
      try {
        if (user) {
          const teacherData = await mapFirebaseUserToTeacher(user);
          setTeacher(teacherData);
        } else {
          setTeacher(null);
        }
      } catch (error) {
        console.error("Firebase 인증 상태 확인 중 오류 발생:", error);
        setTeacher(null);
      } finally {
        setIsLoading(false);
      }
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