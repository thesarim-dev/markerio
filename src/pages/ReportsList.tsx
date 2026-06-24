import React from 'react';
import { FileText, ChevronRight } from 'lucide-react';
import { useAppContext } from '../AppContext';
import { Page, PageHeader, PageMain } from '../components/AppShell';

export function ReportsList() {
  const { reports, exams, setView } = useAppContext();

  return (
    <Page>
      <PageHeader>
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">All Reports</h1>
        <p className="text-slate-500 text-sm mt-1">Recent grading diagnostics</p>
      </PageHeader>

      <PageMain>
        <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
          {reports.length === 0 ? (
            <div className="col-span-full text-center py-12 lg:py-16 bg-white rounded-xl border border-slate-200 border-dashed">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No reports yet</p>
              <p className="text-slate-400 text-sm mt-1">
                Grade an exam to see reports here.
              </p>
            </div>
          ) : (
            reports.map((report) => {
              const exam = exams.find((e) => e.id === report.examId);
              return (
                <button
                  key={report.id}
                  onClick={() =>
                    setView({ name: 'report', reportId: report.id })
                  }
                  className="w-full bg-white rounded-xl p-4 border border-slate-200 shadow-sm hover:border-blue-300 transition-all text-left flex items-center justify-between">
                  <div className="flex items-center gap-4 min-w-0">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shrink-0 ${report.score >= 90 ? 'bg-green-100 text-green-700' : report.score >= 70 ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                      {report.score}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-slate-900 truncate">
                        {report.studentName}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5 truncate">
                        {exam?.name || 'Unknown Exam'}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0 ml-2">
                    <span className="text-[10px] text-slate-400">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </span>
                    <ChevronRight className="w-5 h-5 text-slate-300" />
                  </div>
                </button>
              );
            })
          )}
        </div>
      </PageMain>
    </Page>
  );
}
