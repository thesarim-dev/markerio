import React from 'react';
import {
  ArrowLeft,
  RefreshCw,
  UserPlus,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { useAppContext } from '../AppContext';
import { Page, PageHeader, PageMain } from '../components/AppShell';
import { filterDeductionFeedback } from '../lib/feedback';
import { formatTokenUsage } from '../lib/tokens';

export function Report({ reportId }: { reportId: string }) {
  const { reports, exams, setView } = useAppContext();
  const report = reports.find((r) => r.id === reportId);
  if (!report) return null;
  const exam = exams.find((e) => e.id === report.examId);
  const deductions = filterDeductionFeedback(report.feedback);

  return (
    <Page>
      <PageHeader className="flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() =>
              setView({ name: 'exam_detail', examId: report.examId })
            }
            className="p-2 -ml-2 text-slate-500 hover:text-slate-900 transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg lg:text-xl font-bold text-slate-900 truncate">
            {report.studentName}
          </h1>
        </div>
        <div className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full shrink-0 ml-2">
          {exam?.name || 'Exam'}
        </div>
      </PageHeader>

      <PageMain>
        <div className="lg:grid lg:grid-cols-[minmax(280px,360px)_1fr] lg:gap-8 lg:items-start">
          <div className="mb-6 lg:mb-0 lg:sticky lg:top-6 space-y-6">
            <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl -mr-10 -mt-10" />
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <p className="text-slate-400 font-medium">Final Score</p>
                    {report.tokenUsage && (
                      <span className="text-slate-500 text-xs">
                        {formatTokenUsage(report.tokenUsage)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-5xl font-bold tracking-tight">
                      {report.score}
                    </span>
                    <span className="text-slate-400 text-lg">/ 100</span>
                  </div>
                </div>
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center border-4 ${report.score >= 90 ? 'border-green-400 text-green-400' : report.score >= 70 ? 'border-blue-400 text-blue-400' : 'border-orange-400 text-orange-400'}`}>
                  {report.score >= 70 ? (
                    <CheckCircle2 className="w-8 h-8" />
                  ) : (
                    <AlertTriangle className="w-8 h-8" />
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-3">
              <button
                onClick={() =>
                  setView({ name: 'capture', examId: report.examId })
                }
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl py-3.5 font-semibold transition-colors flex items-center justify-center gap-2">
                <RefreshCw className="w-5 h-5" />
                Re-shoot
              </button>
              <button
                onClick={() =>
                  setView({ name: 'capture', examId: report.examId })
                }
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3.5 font-semibold shadow-md transition-colors flex items-center justify-center gap-2">
                <UserPlus className="w-5 h-5" />
                Next Student
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h2 className="font-semibold text-slate-900 text-lg">Deductions</h2>
              <span className="text-xs text-slate-500">
                {deductions.length === 0
                  ? 'Nothing to review'
                  : `${deductions.length} item${deductions.length === 1 ? '' : 's'}`}
              </span>
            </div>

            {deductions.length === 0 ? (
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm text-center">
                <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-2" />
                <p className="font-medium text-slate-900">No deductions</p>
                <p className="text-sm text-slate-500 mt-1">
                  Full credit on all graded questions.
                </p>
              </div>
            ) : (
              <div className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0 xl:grid-cols-1 xl:space-y-3">
                {deductions.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-start gap-3 mb-2">
                      <h3 className="font-semibold text-slate-900 text-sm">
                        {item.question}
                      </h3>
                      <div className="flex flex-col items-end shrink-0">
                        <span className="text-xs font-medium text-slate-500">
                          {item.points}
                        </span>
                        {item.deduction && (
                          <span className="text-sm font-bold text-red-600">
                            {item.deduction}
                          </span>
                        )}
                      </div>
                    </div>

                    {(item.studentAnswer || item.correctAnswer) && (
                      <p className="text-xs text-slate-500 mb-2 leading-relaxed">
                        {item.studentAnswer && (
                          <span>
                            <span className="text-slate-600">Got:</span>{' '}
                            {item.studentAnswer}
                          </span>
                        )}
                        {item.studentAnswer && item.correctAnswer && (
                          <span className="mx-1.5 text-slate-300">→</span>
                        )}
                        {item.correctAnswer && (
                          <span>
                            <span className="text-green-700">Key:</span>{' '}
                            {item.correctAnswer}
                          </span>
                        )}
                      </p>
                    )}

                    <p className="text-sm text-slate-700">{item.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </PageMain>
    </Page>
  );
}
