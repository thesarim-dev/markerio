import React from 'react';
import { ArrowLeft, Camera, Users, FileText, ChevronRight, Pencil } from 'lucide-react';
import { useAppContext } from '../AppContext';
export function ExamDetail({ examId }: {examId: string;}) {
  const { exams, reports, setView } = useAppContext();
  const exam = exams.find((e) => e.id === examId);
  const examReports = reports.filter((r) => r.examId === examId);
  if (!exam) return null;
  return (
    <div className="flex flex-col h-full bg-slate-50 pb-24">
      <header className="bg-white px-4 pt-12 pb-6 border-b border-slate-200 sticky top-0 z-10">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() =>
            setView({
              name: 'dashboard'
            })
            }
            className="p-2 -ml-2 text-slate-500 hover:text-slate-900 transition-colors">
            
            <ArrowLeft className="w-6 h-6" />
          </button>
          <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">
            Exam Master
          </span>
        </div>
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-2xl font-bold text-slate-900 leading-tight flex-1">
            {exam.name}
          </h1>
          <button
            onClick={() =>
              setView({
                name: 'edit_exam',
                examId: exam.id,
              })
            }
            className="flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-lg transition-colors flex-shrink-0">
            <Pencil className="w-4 h-4" />
            Edit
          </button>
        </div>
        <div className="flex items-center gap-4 mt-3">
          {exam.gradeLevel && (
            <span className="inline-flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-md text-slate-700 text-sm font-medium">
              {exam.gradeLevel}
            </span>
          )}
          <span className="flex items-center gap-1.5 text-sm text-slate-500">
            <Users className="w-4 h-4" />
            {examReports.length} Graded
          </span>
        </div>
      </header>

      <main className="flex-1 p-6 overflow-y-auto">
        <button
          onClick={() =>
          setView({
            name: 'capture',
            examId: exam.id
          })
          }
          className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl p-5 flex flex-col items-center justify-center gap-3 shadow-md transition-all mb-8 group">
          
          <div className="bg-white/20 p-3 rounded-full group-hover:scale-110 transition-transform">
            <Camera className="w-8 h-8" />
          </div>
          <div className="text-center">
            <span className="block font-bold text-lg">Add Student Exam</span>
            <span className="block text-blue-100 text-sm mt-0.5">
              Snap pages to grade instantly
            </span>
          </div>
        </button>

        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Graded Students
          </h2>

          {examReports.length === 0 ?
          <div className="text-center py-10 bg-white rounded-xl border border-slate-200">
              <p className="text-slate-500 font-medium">
                No students graded yet
              </p>
              <p className="text-slate-400 text-sm mt-1">
                Tap the button above to start.
              </p>
            </div> :

          examReports.map((report) =>
          <button
            key={report.id}
            onClick={() =>
            setView({
              name: 'report',
              reportId: report.id
            })
            }
            className="w-full bg-white rounded-xl p-4 border border-slate-200 shadow-sm hover:border-blue-300 transition-all text-left flex items-center justify-between">
            
                <div className="flex items-center gap-4">
                  <div
                className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${report.score >= 90 ? 'bg-green-100 text-green-700' : report.score >= 70 ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                
                    {report.score}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      {report.studentName}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                      <FileText className="w-3 h-3" /> {report.pageCount}{' '}
                      pages
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300" />
              </button>
          )
          }
        </div>
      </main>
    </div>);

}