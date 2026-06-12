import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  UploadCloud,
  FileText,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { useAppContext } from '../AppContext';
import { parseAnswerKeyFile } from '../lib/answerKeyFile';

export function CreateExam({ examId }: { examId?: string }) {
  const { exams, setView, addExam, updateExam } = useAppContext();
  const isEditing = Boolean(examId);
  const existingExam = examId ? exams.find((e) => e.id === examId) : undefined;

  const [name, setName] = useState('');
  const [gradeLevel, setGradeLevel] = useState('10th Grade');
  const [answerKey, setAnswerKey] = useState('');
  const [rubric, setRubric] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [parsingFile, setParsingFile] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(!isEditing);
  const [showTextEditor, setShowTextEditor] = useState(false);
  const uploadedFileRef = useRef<File | null>(null);

  const hasAnswerKey =
    Boolean(answerKey.trim()) ||
    Boolean(uploadedFile) ||
    Boolean(isEditing && existingExam?.answerKey.trim());

  useEffect(() => {
    if (!isEditing || !existingExam) return;
    setName(existingExam.name);
    setGradeLevel(existingExam.gradeLevel);
    setAnswerKey(existingExam.answerKey);
    setRubric(existingExam.rubric);
    setLoaded(true);
  }, [isEditing, existingExam]);

  const handleFile = async (file: File) => {
    setParsingFile(true);
    setError(null);
    try {
      const text = await parseAnswerKeyFile(file);
      uploadedFileRef.current = file;
      setUploadedFile(file.name);
      setAnswerKey(text);
      setShowTextEditor(false);
    } catch (err) {
      uploadedFileRef.current = null;
      setUploadedFile(null);
      setError(err instanceof Error ? err.message : 'Failed to read file');
    } finally {
      setParsingFile(false);
    }
  };

  const handleBack = () => {
    if (isEditing && examId) {
      setView({ name: 'exam_detail', examId });
    } else {
      setView({ name: 'dashboard' });
    }
  };

  const handleSave = async () => {
    if (!name.trim() || !hasAnswerKey) return;
    setSaving(true);
    setError(null);
    try {
      let resolvedKey = answerKey.trim();
      if (!resolvedKey && uploadedFileRef.current) {
        resolvedKey = await parseAnswerKeyFile(uploadedFileRef.current);
      }
      if (!resolvedKey && isEditing && existingExam?.answerKey) {
        resolvedKey = existingExam.answerKey.trim();
      }
      if (!resolvedKey) {
        setError('Upload an answer key file or paste text.');
        return;
      }

      const payload = {
        name: name.trim(),
        gradeLevel,
        answerKey: resolvedKey,
        rubric: rubric.trim(),
      };

      if (isEditing && examId) {
        await updateExam(examId, payload);
        setView({ name: 'exam_detail', examId });
      } else {
        const newExamId = await addExam(payload);
        setView({ name: 'exam_detail', examId: newExamId });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save exam');
    } finally {
      setSaving(false);
    }
  };

  if (isEditing && !existingExam && loaded) {
    return (
      <div className="flex flex-col h-full bg-slate-50 items-center justify-center p-6 text-center">
        <p className="text-slate-600 mb-4">Exam not found.</p>
        <button
          onClick={() => setView({ name: 'dashboard' })}
          className="text-blue-600 font-semibold">
          Back to dashboard
        </button>
      </div>
    );
  }

  if (isEditing && !loaded) {
    return (
      <div className="flex flex-col h-full bg-slate-50 items-center justify-center">
        <p className="text-slate-500">Loading exam...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 pb-24">
      <header className="bg-white px-4 pt-12 pb-4 border-b border-slate-200 sticky top-0 z-10 flex items-center gap-3">
        <button
          onClick={handleBack}
          className="p-2 -ml-2 text-slate-500 hover:text-slate-900 transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold text-slate-900">
          {isEditing ? 'Edit Exam Master' : 'Create New Exam Master'}
        </h1>
      </header>

      <main className="flex-1 p-6 overflow-y-auto">
        <div className="space-y-6 max-w-md mx-auto">
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
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-white text-slate-900 placeholder:text-slate-400"
              />
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

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Official Answer Key
            </label>
            <p className="text-xs text-slate-500 mb-3">
              Upload a PDF or text file to use as your answer key. Pasting text
              below is optional.
            </p>

            <input
              type="file"
              accept=".pdf,.txt,.md,application/pdf,text/plain"
              className="hidden"
              id="answer-key-file"
              onChange={(e) => {
                if (e.target.files?.[0]) handleFile(e.target.files[0]);
                e.target.value = '';
              }}
            />

            {parsingFile ? (
              <div className="border border-slate-200 rounded-xl p-6 text-center mb-3 bg-white">
                <Loader2 className="w-8 h-8 mx-auto mb-2 text-blue-600 animate-spin" />
                <p className="text-sm font-medium text-slate-700">
                  Reading file...
                </p>
              </div>
            ) : uploadedFile ? (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between mb-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="bg-blue-100 p-2 rounded-lg flex-shrink-0">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {uploadedFile}
                    </p>
                    <p className="text-xs text-slate-500">
                      Ready to save — no need to paste text
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                  <label
                    htmlFor="answer-key-file"
                    className="text-xs font-semibold text-blue-600 cursor-pointer">
                    Replace
                  </label>
                  <CheckCircle2 className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            ) : (
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
                }}>
                <label htmlFor="answer-key-file" className="cursor-pointer block">
                  <UploadCloud
                    className={`w-8 h-8 mx-auto mb-2 ${isDragging ? 'text-blue-500' : 'text-slate-400'}`}
                  />
                  <p className="text-sm font-medium text-slate-700">
                    Tap to upload or drag & drop
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    PDF, TXT, or MD
                  </p>
                </label>
              </div>
            )}

            {!uploadedFile && (
              <>
                <div className="relative flex items-center py-2">
                  <div className="flex-grow border-t border-slate-200"></div>
                  <span className="flex-shrink-0 mx-4 text-xs font-medium text-slate-400 uppercase">
                    or paste text
                  </span>
                  <div className="flex-grow border-t border-slate-200"></div>
                </div>

                <textarea
                  placeholder={
                    'Q1 (5 pts): correct answer\nQ2 (10 pts): correct answer\nQ3 (15 pts): correct answer'
                  }
                  value={answerKey}
                  onChange={(e) => setAnswerKey(e.target.value)}
                  rows={8}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-white text-slate-900 placeholder:text-slate-400 resize-none"
                />
              </>
            )}

            {uploadedFile && (
              <button
                type="button"
                onClick={() => setShowTextEditor((v) => !v)}
                className="text-sm font-medium text-blue-600 hover:text-blue-700 mt-1">
                {showTextEditor
                  ? 'Hide text editor'
                  : 'Review or edit extracted text (optional)'}
              </button>
            )}

            {uploadedFile && showTextEditor && (
              <textarea
                placeholder="Extracted answer key text..."
                value={answerKey}
                onChange={(e) => setAnswerKey(e.target.value)}
                rows={8}
                className="w-full mt-3 px-4 py-3 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-white text-slate-900 placeholder:text-slate-400 resize-none"
              />
            )}
          </div>

          <hr className="border-slate-200" />

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
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-white text-slate-900 placeholder:text-slate-400 resize-none"
            />
          </div>
        </div>
      </main>

      <div className="fixed bottom-[72px] left-0 right-0 p-4 bg-white border-t border-slate-200 z-20">
        {error && (
          <p className="text-sm text-red-600 mb-3 text-center">{error}</p>
        )}
        <button
          onClick={handleSave}
          disabled={!name.trim() || !hasAnswerKey || saving || parsingFile}
          className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl py-4 font-semibold shadow-md transition-colors text-lg">
          {saving
            ? 'Saving...'
            : isEditing
              ? 'Save Changes'
              : 'Save Exam Master'}
        </button>
      </div>
    </div>
  );
}
