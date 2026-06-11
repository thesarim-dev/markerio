import React from 'react';
import {
  ArrowLeft,
  RefreshCw,
  UserPlus,
  FileText,
  CheckCircle2,
  AlertTriangle } from
'lucide-react';
import { useAppContext } from '../AppContext';
export function Report({ reportId }: {reportId: string;}) {
  const { reports, exams, setView } = useAppContext();
  const report = reports.find((r) => r.id === reportId);
  if (!report) return null;
  const exam = exams.find((e) => e.id === report.examId);
  return (
    <div className="flex flex-col h-full bg-slate-50 pb-24">
      <header className="bg-white px-4 pt-12 pb-4 border-b border-slate-200 sticky top-0 z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() =>
            setView({
              name: 'exam_detail',
              examId: report.examId
            })
            }
            className="p-2 -ml-2 text-slate-500 hover:text-slate-900 transition-colors">
            
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-bold text-slate-900 truncate max-w-[200px]">
            {report.studentName}
          </h1>
        </div>
        <div className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
          {exam?.name || 'Exam'}
        </div>
      </header>

      <main className="flex-1 p-4 overflow-y-auto">
        {/* Score Summary Badge */}
        <div className="bg-slate-900 rounded-2xl p-6 text-white mb-6 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-slate-400 font-medium mb-1">Final Score</p>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold tracking-tight">
                  {report.score}
                </span>
                <span className="text-slate-400 text-lg">/ 100</span>
              </div>
            </div>
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center border-4 ${report.score >= 90 ? 'border-green-400 text-green-400' : report.score >= 70 ? 'border-blue-400 text-blue-400' : 'border-orange-400 text-orange-400'}`}>
              
              {report.score >= 90 ?
              <CheckCircle2 className="w-8 h-8" /> :
              report.score >= 70 ?
              <CheckCircle2 className="w-8 h-8" /> :

              <AlertTriangle className="w-8 h-8" />
              }
            </div>
          </div>
        </div>

        {/* AI Report Panel */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-xs">AI</span>
            </div>
            <h2 className="font-semibold text-slate-900">
              Diagnostic Breakdown
            </h2>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-8">
            {report.feedback.map((item, idx) =>
            <div key={idx} className="relative">
                {idx !== 0 &&
              <hr className="absolute -top-4 left-0 right-0 border-slate-100" />
              }

                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-slate-900 text-base pr-4">
                    {item.question}
                  </h3>
                  <span className="whitespace-nowrap font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md text-sm">
                    {item.points}
                  </span>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex gap-2">
                    <span className="font-semibold text-slate-700 min-w-[80px]">
                      Content:
                    </span>
                    <span className="text-slate-600">{item.content}</span>
                  </div>

                  {item.deduction !== 'None.' &&
                <div className="flex gap-2">
                      <span className="font-semibold text-red-600 min-w-[80px]">
                        Deduction:
                      </span>
                      <span className="text-red-700 bg-red-50 px-2 py-0.5 rounded font-medium">
                        {item.deduction}
                      </span>
                    </div>
                }

                  <div className="flex gap-2 bg-slate-50 p-3 rounded-lg border border-slate-100 mt-2">
                    <span className="font-semibold text-slate-700 min-w-[80px]">
                      Reasoning:
                    </span>
                    <span className="text-slate-600 italic leading-relaxed">
                      {item.reasoning}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Sticky Footer Navigation */}
      <div className="fixed bottom-[72px] left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-slate-200 z-20 flex gap-3">
        <button
          onClick={() =>
          setView({
            name: 'capture',
            examId: report.examId
          })
          }
          className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl py-3.5 font-semibold transition-colors flex items-center justify-center gap-2">
          
          <RefreshCw className="w-5 h-5" />
          Re-shoot
        </button>
        <button
          onClick={() =>
          setView({
            name: 'capture',
            examId: report.examId
          })
          }
          className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3.5 font-semibold shadow-md transition-colors flex items-center justify-center gap-2">
          
          <UserPlus className="w-5 h-5" />
          Next Student
        </button>
      </div>
    </div>);

}