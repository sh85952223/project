import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const savedTeacher = localStorage.getItem('currentTeacher');
    if (savedTeacher) {
      setTeacher(JSON.parse(savedTeacher));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const teachers = JSON.parse(localStorage.getItem('teachers') || '[]');
      const foundTeacher = teachers.find((t: Teacher) => 
        t.email === email && t.password === password
      );

      if (foundTeacher) {
        setTeacher(foundTeacher);
        localStorage.setItem('currentTeacher', JSON.stringify(foundTeacher));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const teachers = JSON.parse(localStorage.getItem('teachers') || '[]');
      
      // Check if email already exists
      if (teachers.some((t: Teacher) => t.email === email)) {
        return false;
      }

      const newTeacher: Teacher = {
        id: Date.now().toString(),
        name,
        email,
        password,
        createdAt: new Date().toISOString(),
      };

      teachers.push(newTeacher);
      localStorage.setItem('teachers', JSON.stringify(teachers));
      
      setTeacher(newTeacher);
      localStorage.setItem('currentTeacher', JSON.stringify(newTeacher));
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const logout = () => {
    setTeacher(null);
    localStorage.removeItem('currentTeacher');
  };

  return (
    <AuthContext.Provider value={{ teacher, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};