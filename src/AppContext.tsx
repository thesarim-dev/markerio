import React, { useState, createContext, useContext, ReactNode } from 'react';
import { Exam, StudentReport, ViewState } from './types';
import { useScreenInit } from './useScreenInit.js';
interface AppContextType {
  view: ViewState;
  setView: (view: ViewState) => void;
  exams: Exam[];
  addExam: (exam: Omit<Exam, 'id' | 'createdAt'>) => string;
  reports: StudentReport[];
  addReport: (report: Omit<StudentReport, 'id' | 'createdAt'>) => string;
}
const AppContext = createContext<AppContextType | undefined>(undefined);
// Mock initial data for a better first experience
const initialExams: Exam[] = [
{
  id: 'exam-1',
  name: 'Module G - Winter 2026',
  gradeLevel: '12th Grade',
  answerKey: 'Official Ministry Key attached.',
  rubric: 'Standard Bagrut grammar deductions apply.',
  createdAt: Date.now() - 86400000
}];

const initialReports: StudentReport[] = [
{
  id: 'rep-1',
  examId: 'exam-1',
  studentName: 'Maya Cohen',
  score: 88.5,
  pages: ['page1', 'page2'],
  createdAt: Date.now() - 3600000,
  feedback: [
  {
    question: 'Question 3 (Open Ended - 10 points total)',
    points: '8.5 / 10',
    content:
    'Correct. The student accurately identified the main argument in paragraph 3.',
    deduction: '-1.5 points for language mechanics.',
    reasoning:
    'The student used a double negative ("did not have no choice") and misspelled "independent". Content points are preserved, but grammar nuances applied per the rubric.'
  },
  {
    question: 'Question 4 (Vocabulary - 5 points total)',
    points: '5 / 5',
    content: 'Perfect match with the answer key.',
    deduction: 'None.',
    reasoning: 'All vocabulary words correctly placed in context.'
  }]

}];

export function AppProvider({ children }: {children: ReactNode;}) {
  const screenInit = useScreenInit() as {view?: ViewState;};
  const [view, setView] = useState<ViewState>(
    screenInit?.view ?? {
      name: 'dashboard'
    }
  );
  const [exams, setExams] = useState<Exam[]>(initialExams);
  const [reports, setReports] = useState<StudentReport[]>(initialReports);
  const addExam = (examData: Omit<Exam, 'id' | 'createdAt'>) => {
    const newExam: Exam = {
      ...examData,
      id: `exam-${Date.now()}`,
      createdAt: Date.now()
    };
    setExams([newExam, ...exams]);
    return newExam.id;
  };
  const addReport = (reportData: Omit<StudentReport, 'id' | 'createdAt'>) => {
    const newReport: StudentReport = {
      ...reportData,
      id: `rep-${Date.now()}`,
      createdAt: Date.now()
    };
    setReports([newReport, ...reports]);
    return newReport.id;
  };
  return (
    <AppContext.Provider
      value={{
        view,
        setView,
        exams,
        addExam,
        reports,
        addReport
      }}>
      
      {children}
    </AppContext.Provider>);

}
export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}