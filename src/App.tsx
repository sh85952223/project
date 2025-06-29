import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ScheduleProvider } from './context/ScheduleContext';
import { Layout } from './components/Layout';
import { AuthForm } from './components/auth/AuthForm';
import { Dashboard } from './components/dashboard/Dashboard';
import { ClassManagement } from './components/dashboard/ClassManagement';
import { StudentManagement } from './components/student/StudentManagement'; 
import { Settings } from './components/settings/Settings'; // 👈 Settings 컴포넌트 import

function AppContent() {
  const { teacher, isLoading } = useAuth();
  // 👈 'settings' 뷰 상태 추가
  const [currentView, setCurrentView] = useState<'dashboard' | 'classes' | 'students' | 'settings'>('dashboard');

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

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard />;
      case 'classes': return <ClassManagement />;
      case 'students': return <StudentManagement />;
      // 👈 Settings 컴포넌트 렌더링 추가
      case 'settings': return <Settings />;
      default: return <Dashboard />;
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