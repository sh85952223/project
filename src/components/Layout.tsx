import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/Button';
import { BookOpen, LogOut, User, Users, BarChart3 } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentView?: 'dashboard' | 'classes';
  onViewChange?: (view: 'dashboard' | 'classes') => void;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  currentView = 'dashboard',
  onViewChange 
}) => {
  const { teacher, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">진도관리</h1>
                <p className="text-sm text-gray-600">중학교 수업 진도 관리 시스템</p>
              </div>
            </div>

            {/* Navigation */}
            {onViewChange && (
              <nav className="flex items-center space-x-1">
                <Button
                  variant={currentView === 'dashboard' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => onViewChange('dashboard')}
                  className="flex items-center space-x-2"
                >
                  <BarChart3 className="h-4 w-4" />
                  <span>대시보드</span>
                </Button>
                <Button
                  variant={currentView === 'classes' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => onViewChange('classes')}
                  className="flex items-center space-x-2"
                >
                  <Users className="h-4 w-4" />
                  <span>반 관리</span>
                </Button>
              </nav>
            )}
            
            {teacher && (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">
                    {teacher.name} 선생님
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="flex items-center space-x-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span>로그아웃</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};