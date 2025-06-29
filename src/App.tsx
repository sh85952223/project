import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ScheduleProvider } from './context/ScheduleContext';
import { Layout } from './components/Layout';
import { AuthForm } from './components/auth/AuthForm';
import { Dashboard } from './components/dashboard/Dashboard';
import { ClassManagement } from './components/dashboard/ClassManagement';
// 👈 [수정] StudentManagement 컴포넌트 import
import { StudentManagement } from './components/student/StudentManagement'; 

function AppContent() {
  const { teacher, isLoading } = useAuth();
  // 👈 [수정] 'students' 뷰 상태 추가
  const [currentView, setCurrentView] = useState<'dashboard' | 'classes' | 'students'>('dashboard');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!teacher) {
    return <AuthForm />;
  }

  // 👈 [수정] currentView에 따라 렌더링할 컴포넌트 결정
  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'classes':
        return <ClassManagement />;
      case 'students':
        return <StudentManagement />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <ScheduleProvider>
      <Layout currentView={currentView} onViewChange={setCurrentView}>
        {renderContent()}
      </Layout>
    </ScheduleProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;