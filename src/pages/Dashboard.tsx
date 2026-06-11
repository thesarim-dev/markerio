import React from 'react';
import { Plus, ChevronRight, FileText, Calendar, LogOut } from 'lucide-react';
import { useAppContext } from '../AppContext';
import { useAuth } from '../context/AuthContext';
export function Dashboard() {
  const { exams, setView } = useAppContext();
  const { signOut, user } = useAuth();
  return (
    <div className="flex flex-col h-full bg-slate-50 pb-24">
      <header className="bg-white px-6 pt-12 pb-6 border-b border-slate-200 sticky top-0 z-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">My Exams</h1>
            <p className="text-slate-500 text-sm mt-1">
              Manage master keys and rubrics
            </p>
          </div>
          <button
            onClick={() => signOut()}
            aria-label="Sign out"
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors flex-shrink-0">
            
            <LogOut className="w-5 h-5" />
          </button>
        </div>
        {user?.email &&
        <p className="text-xs text-slate-400 mt-2 truncate">{user.email}</p>
        }
      </header>

      <main className="flex-1 p-6 overflow-y-auto">
        <button
          onClick={() =>
          setView({
            name: 'create_exam'
          })
          }
          className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl p-4 flex items-center justify-center gap-2 font-semibold shadow-sm transition-colors mb-8">
          
          <Plus className="w-5 h-5" />
          Create New Exam Master
        </button>

        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Recent Exams
          </h2>

          {exams.length === 0 ?
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200 border-dashed">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No exams created yet</p>
              <p className="text-slate-400 text-sm mt-1">
                Create your first master key to start grading.
              </p>
            </div> :

          exams.map((exam) =>
          <button
            key={exam.id}
            onClick={() =>
            setView({
              name: 'exam_detail',
              examId: exam.id
            })
            }
            className="w-full bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:border-blue-300 hover:shadow-md transition-all text-left flex items-center justify-between group">
            
                <div>
                  <h3 className="font-semibold text-slate-900 text-lg mb-1">
                    {exam.name}
                  </h3>
                  <div className="flex items-center gap-3 text-sm text-slate-500">
                    <span className="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md text-slate-700 font-medium">
                      {exam.gradeLevel}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(exam.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600" />
                </div>
              </button>
          )
          }
        </div>
      </main>
    </div>);

}