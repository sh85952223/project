import { useState } from 'react'; // 👈 [수정] React를 제거하고 useState만 직접 가져옵니다.
import { AuthProvider, useAuth } from './context/AuthContext';
import { ScheduleProvider, useScheduleData } from './context/ScheduleContext';
import { Layout } from './components/Layout';
import { AuthForm } from './components/auth/AuthForm';
import { Dashboard } from './components/dashboard/Dashboard';
import { ClassManagement } from './components/class/ClassManagement'; 
import { StudentManagement } from './components/student/StudentManagement'; 
import { Settings } from './components/settings/Settings';
import { LessonDetail } from './components/dashboard/LessonDetail';

function AppContent() {
  const { teacher, isLoading } = useAuth();
  const [currentView, setCurrentView] = useState<'dashboard' | 'classes' | 'students' | 'settings'>('dashboard');
  
  const { viewingScheduleId } = useScheduleData();

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

  if (viewingScheduleId) {
    return (
      <Layout>
        <LessonDetail />
      </Layout>
    );
  }

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard />;
      case 'classes': return <ClassManagement />;
      case 'students': return <StudentManagement />;
      case 'settings': return <Settings />;
      default: return <Dashboard />;
    }
  };

  return (
    <Layout currentView={currentView} onViewChange={setCurrentView}>
      {renderContent()}
    </Layout>
  );
}

function App() {
  return (
    <AuthProvider>
      <ScheduleProvider>
        <AppContent />
      </ScheduleProvider>
    </AuthProvider>
  );
}

export default App;