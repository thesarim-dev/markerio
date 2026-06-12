import React from 'react';
import { AppProvider, useAppContext } from './AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { BottomNav } from './components/BottomNav';
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
      <div className="flex items-center justify-center h-full">
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
  // Hide bottom nav on capture screen for full immersion
  const showBottomNav = view.name !== 'capture';
  return (
    <div className="w-full h-screen max-w-md mx-auto bg-white relative overflow-hidden shadow-2xl sm:rounded-[2.5rem] sm:h-[850px] sm:my-8 sm:border-8 border-slate-900">
      {renderView()}
      {showBottomNav && <BottomNav />}
    </div>);

}
export function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 sm:p-8">
        <AppGate />
      </div>
    </AuthProvider>);

}

function AppGate() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="w-full h-screen max-w-md mx-auto bg-white flex items-center justify-center shadow-2xl sm:rounded-[2.5rem] sm:h-[850px] sm:my-8 sm:border-8 border-slate-900">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>);

  }

  if (!user) {
    return (
      <div className="w-full h-screen max-w-md mx-auto bg-white relative overflow-hidden shadow-2xl sm:rounded-[2.5rem] sm:h-[850px] sm:my-8 sm:border-8 border-slate-900">
        <Auth />
      </div>);

  }

  return (
    <AppProvider>
      <AppContent />
    </AppProvider>);

}