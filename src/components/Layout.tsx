import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/Button';
import { BookOpen, LogOut, User, Users, BarChart3, UserCheck, Settings } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentView?: 'dashboard' | 'classes' | 'students' | 'settings';
  onViewChange?: (view: 'dashboard' | 'classes' | 'students' | 'settings') => void;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  currentView = 'dashboard',
  onViewChange 
}) => {
  const { teacher, logout } = useAuth();

  const handleLogoClick = () => {
    if (onViewChange) {
      onViewChange('dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* 클릭 가능한 로고 영역 */}
            <div 
              className="flex items-center space-x-3 cursor-pointer group transition-all duration-200 hover:scale-105"
              onClick={handleLogoClick}
            >
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg shadow-md group-hover:shadow-lg transition-all duration-200">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                  진도관리
                </h1>
                <p className="text-sm text-gray-600">중학교 수업 진도 관리 시스템</p>
              </div>
            </div>

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
                <Button 
                  variant={currentView === 'students' ? 'primary' : 'ghost'} 
                  size="sm" 
                  onClick={() => onViewChange('students')} 
                  className="flex items-center space-x-2"
                >
                  <UserCheck className="h-4 w-4" /> 
                  <span>학생 관리</span>
                </Button>
                <Button 
                  variant={currentView === 'settings' ? 'primary' : 'ghost'} 
                  size="sm" 
                  onClick={() => onViewChange('settings')} 
                  className="flex items-center space-x-2"
                >
                  <Settings className="h-4 w-4" /> 
                  <span>설정</span>
                </Button>
              </nav>
            )}
            
            {teacher && (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-gray-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{teacher.name} 선생님</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={logout} 
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
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