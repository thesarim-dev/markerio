import React, { useState } from 'react';
import { ArrowLeft, UploadCloud, FileText, CheckCircle2 } from 'lucide-react';
import { useAppContext } from '../AppContext';
export function CreateExam() {
  const { setView, addExam } = useAppContext();
  const [name, setName] = useState('');
  const [gradeLevel, setGradeLevel] = useState('10th Grade');
  const [answerKey, setAnswerKey] = useState('');
  const [rubric, setRubric] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setUploadedFile(file.name);
    if (
      file.type.startsWith('text/') ||
      file.name.endsWith('.txt') ||
      file.name.endsWith('.md')
    ) {
      const text = await file.text();
      setAnswerKey(text);
    }
  };

  const handleSave = async () => {
    if (!name.trim() || !answerKey.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const newExamId = await addExam({
        name,
        gradeLevel,
        answerKey: answerKey.trim(),
        rubric: rubric.trim()
      });
      setView({ name: 'exam_detail', examId: newExamId });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save exam');
    } finally {
      setSaving(false);
    }
  };
  return (
    <div className="flex flex-col h-full bg-slate-50 pb-24">
      <header className="bg-white px-4 pt-12 pb-4 border-b border-slate-200 sticky top-0 z-10 flex items-center gap-3">
        <button
          onClick={() =>
          setView({
            name: 'dashboard'
          })
          }
          className="p-2 -ml-2 text-slate-500 hover:text-slate-900 transition-colors">
          
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold text-slate-900">
          Create New Exam Master
        </h1>
      </header>

      <main className="flex-1 p-6 overflow-y-auto">
        <div className="space-y-6 max-w-md mx-auto">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Exam Name
              </label>
              <input
                type="text"
                placeholder="e.g., Module G - Winter 2026"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-white text-slate-900 placeholder:text-slate-400" />
              
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Grade Level
              </label>
              <select
                value={gradeLevel}
                onChange={(e) => setGradeLevel(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-white text-slate-900 appearance-none">
                
                <option>10th Grade</option>
                <option>11th Grade</option>
                <option>12th Grade</option>
              </select>
            </div>
          </div>

          <hr className="border-slate-200" />

          {/* Answer Key */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Official Answer Key
            </label>
            <p className="text-xs text-slate-500 mb-3">
              Paste the answer key below, or upload a text file.
            </p>

            {uploadedFile ?
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {uploadedFile}
                    </p>
                    <p className="text-xs text-slate-500">Ready for grading</p>
                  </div>
                </div>
                <CheckCircle2 className="w-5 h-5 text-blue-600" />
              </div> :

            <div
              className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors mb-3 ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-white hover:border-slate-400'}`}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                if (e.dataTransfer.files?.[0]) {
                  handleFile(e.dataTransfer.files[0]);
                }
              }}
            >
              <input
                type="file"
                accept=".txt,.md,text/plain"
                className="hidden"
                id="answer-key-file"
                onChange={(e) => {
                  if (e.target.files?.[0]) handleFile(e.target.files[0]);
                }}
              />
              <label htmlFor="answer-key-file" className="cursor-pointer block">
                <UploadCloud
                className={`w-8 h-8 mx-auto mb-2 ${isDragging ? 'text-blue-500' : 'text-slate-400'}`} />
              
                <p className="text-sm font-medium text-slate-700">
                  Tap to upload or drag & drop
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  TXT or MD (paste below for PDFs/images)
                </p>
              </label>
            </div>
            }

            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="flex-shrink-0 mx-4 text-xs font-medium text-slate-400 uppercase">
                or text
              </span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>

            <textarea
              placeholder="Paste answer key text here..."
              value={answerKey}
              onChange={(e) => setAnswerKey(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-white text-slate-900 placeholder:text-slate-400 resize-none" />
            
          </div>

          <hr className="border-slate-200" />

          {/* Rubric */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Nuanced Grading Rubric{' '}
              <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <p className="text-xs text-slate-500 mb-3">
              e.g., Bagrut grammar deductions for correct content answers.
            </p>
            <textarea
              placeholder="Specify deduction rules, partial credit guidelines, etc."
              value={rubric}
              onChange={(e) => setRubric(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-white text-slate-900 placeholder:text-slate-400 resize-none" />
            
          </div>
        </div>
      </main>

      <div className="fixed bottom-[72px] left-0 right-0 p-4 bg-white border-t border-slate-200 z-20">
        {error &&
        <p className="text-sm text-red-600 mb-3 text-center">{error}</p>
        }
        <button
          onClick={handleSave}
          disabled={!name.trim() || !answerKey.trim() || saving}
          className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl py-4 font-semibold shadow-md transition-colors text-lg">
          {saving ? 'Saving...' : 'Save Exam Master'}
        </button>
      </div>
    </div>);

}