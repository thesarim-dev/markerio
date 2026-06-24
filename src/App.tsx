import React from 'react';
import { AppProvider, useAppContext } from './AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppShell } from './components/AppShell';
import { Auth } from './pages/Auth';
import { Dashboard } from './pages/Dashboard';
import { CreateExam } from './pages/CreateExam';
import { ExamDetail } from './pages/ExamDetail';
import { Capture } from './pages/Capture';
import { Report } from './pages/Report';
import { ReportsList } from './pages/ReportsList';
import { Loader2 } from 'lucide-react';

function AppContent() {
  const { view, loading } = useAppContext();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-white lg:bg-slate-50">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  const renderView = () => {
    switch (view.name) {
      case 'dashboard':
        return <Dashboard />;
      case 'create_exam':
        return <CreateExam />;
      case 'edit_exam':
        return <CreateExam examId={view.examId} />;
      case 'exam_detail':
        return <ExamDetail examId={view.examId} />;
      case 'capture':
        return <Capture initialExamId={view.examId} />;
      case 'report':
        return <Report reportId={view.reportId} />;
      case 'reports_list':
        return <ReportsList />;
      default:
        return <Dashboard />;
    }
  };

  const showNav = view.name !== 'capture';

  return <AppShell showNav={showNav}>{renderView()}</AppShell>;
}

function AuthCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full max-w-md lg:max-w-lg bg-white lg:rounded-2xl lg:shadow-xl lg:border lg:border-slate-200 overflow-hidden min-h-[100dvh] lg:min-h-0 lg:my-8">
      {children}
    </div>
  );
}

function AppGate() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center p-4 lg:p-8">
        <AuthCard>
          <div className="flex items-center justify-center h-[60vh] lg:h-96">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        </AuthCard>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center p-0 lg:p-8">
        <AuthCard>
          <Auth />
        </AuthCard>
      </div>
    );
  }

  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export function App() {
  return (
    <AuthProvider>
      <AppGate />
    </AuthProvider>
  );
}
