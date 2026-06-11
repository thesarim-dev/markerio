import React from 'react';
import { FileText, ChevronRight } from 'lucide-react';
import { useAppContext } from '../AppContext';
export function ReportsList() {
  const { reports, exams, setView } = useAppContext();
  return (
    <div className="flex flex-col h-full bg-slate-50 pb-24">
      <header className="bg-white px-6 pt-12 pb-6 border-b border-slate-200 sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-slate-900">All Reports</h1>
        <p className="text-slate-500 text-sm mt-1">
          Recent grading diagnostics
        </p>
      </header>

      <main className="flex-1 p-6 overflow-y-auto">
        <div className="space-y-3">
          {reports.length === 0 ?
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200 border-dashed">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No reports yet</p>
              <p className="text-slate-400 text-sm mt-1">
                Grade an exam to see reports here.
              </p>
            </div> :

          reports.map((report) => {
            const exam = exams.find((e) => e.id === report.examId);
            return (
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
                      <p className="text-xs text-slate-500 mt-0.5 truncate max-w-[200px]">
                        {exam?.name || 'Unknown Exam'}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] text-slate-400">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </span>
                    <ChevronRight className="w-5 h-5 text-slate-300" />
                  </div>
                </button>);

          })
          }
        </div>
      </main>
    </div>);

}