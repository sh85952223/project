import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ScheduleProvider } from './context/ScheduleContext'; // 1. ScheduleProvider를 import 합니다.
import { Layout } from './components/Layout';
import { AuthForm } from './components/auth/AuthForm';
import { Dashboard } from './components/dashboard/Dashboard';
import { ClassManagement } from './components/dashboard/ClassManagement';

function AppContent() {
  const { teacher, isLoading } = useAuth();
  const [currentView, setCurrentView] = useState<'dashboard' | 'classes'>('dashboard');

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

  return (
    // 2. 로그인 후에 보여지는 모든 컴포넌트를 ScheduleProvider로 감싸줍니다.
    <ScheduleProvider>
      <Layout currentView={currentView} onViewChange={setCurrentView}>
        {currentView === 'dashboard' ? <Dashboard /> : <ClassManagement />}
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
