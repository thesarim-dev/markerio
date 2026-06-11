import React, {
  useState,
  createContext,
  useContext,
  ReactNode,
  useEffect,
  useCallback
} from 'react';
import { Exam, StudentReport, ViewState } from './types';
import { useScreenInit } from './useScreenInit.js';
import { createExam, fetchExams, fetchReports } from './lib/exams';

interface AppContextType {
  view: ViewState;
  setView: (view: ViewState) => void;
  exams: Exam[];
  reports: StudentReport[];
  loading: boolean;
  addExam: (exam: Omit<Exam, 'id' | 'createdAt'>) => Promise<string>;
  addReport: (report: StudentReport) => void;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const screenInit = useScreenInit() as { view?: ViewState };
  const [view, setView] = useState<ViewState>(
    screenInit?.view ?? { name: 'dashboard' }
  );
  const [exams, setExams] = useState<Exam[]>([]);
  const [reports, setReports] = useState<StudentReport[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshData = useCallback(async () => {
    const [examData, reportData] = await Promise.all([
      fetchExams(),
      fetchReports()
    ]);
    setExams(examData);
    setReports(reportData);
  }, []);

  useEffect(() => {
    refreshData()
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [refreshData]);

  const addExam = async (examData: Omit<Exam, 'id' | 'createdAt'>) => {
    const exam = await createExam(examData);
    setExams((prev) => [exam, ...prev]);
    return exam.id;
  };

  const addReport = (report: StudentReport) => {
    setReports((prev) => [report, ...prev]);
  };

  return (
    <AppContext.Provider
      value={{
        view,
        setView,
        exams,
        reports,
        loading,
        addExam,
        addReport,
        refreshData
      }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
