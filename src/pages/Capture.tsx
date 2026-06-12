import React, { useRef, useState, useEffect, useCallback } from 'react';
import { X, Camera, Check, Loader2, ImagePlus } from 'lucide-react';
import { useAppContext } from '../AppContext';
import { useCamera } from '../hooks/useCamera';
import { uploadAndGradeExam, CapturedPage } from '../lib/grading';
import { MAX_PAGES_PER_GRADE } from '../lib/images';

export function Capture({ initialExamId }: { initialExamId?: string }) {
  const { exams, setView, addReport } = useAppContext();
  const { videoRef, ready, error: cameraError, captureFrame } = useCamera();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pagesRef = useRef<CapturedPage[]>([]);

  const [selectedExamId, setSelectedExamId] = useState<string>(
    initialExamId || (exams.length > 0 ? exams[0].id : '')
  );
  const [pages, setPages] = useState<CapturedPage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showFlash, setShowFlash] = useState(false);
  const [error, setError] = useState<string | null>(null);

  pagesRef.current = pages;

  useEffect(() => {
    if (initialExamId) setSelectedExamId(initialExamId);
    else if (!selectedExamId && exams.length > 0) {
      setSelectedExamId(exams[0].id);
    }
  }, [initialExamId, exams, selectedExamId]);

  useEffect(() => {
    return () => {
      pagesRef.current.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    };
  }, []);

  const addPage = useCallback((blob: Blob) => {
    setPages((prev) => {
      if (prev.length >= MAX_PAGES_PER_GRADE) {
        setError(`Maximum ${MAX_PAGES_PER_GRADE} pages per grade. Process this batch, then grade remaining pages separately.`);
        return prev;
      }
      setError(null);
      const previewUrl = URL.createObjectURL(blob);
      return [...prev, { id: crypto.randomUUID(), blob, previewUrl }];
    });
  }, []);

  const handleCapture = () => {
    setShowFlash(true);
    setTimeout(() => setShowFlash(false), 150);

    const blob = captureFrame();
    if (blob) {
      addPage(blob);
      return;
    }
    fileInputRef.current?.click();
  };

  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/')) addPage(file);
    });
    e.target.value = '';
  };

  const handleProcess = async () => {
    if (!selectedExamId || pages.length === 0) return;
    setIsProcessing(true);
    setError(null);

    try {
      const report = await uploadAndGradeExam(selectedExamId, pages);
      addReport(report);
      pages.forEach((p) => URL.revokeObjectURL(p.previewUrl));
      setPages([]);
      setView({ name: 'report', reportId: report.id });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Grading failed');
    } finally {
      setIsProcessing(false);
    }
  };

  if (exams.length === 0) {
    return (
      <div className="flex flex-col h-full bg-slate-900 text-white items-center justify-center p-6 text-center">
        <p className="text-xl font-semibold mb-2">No Exams Found</p>
        <p className="text-slate-400 mb-6">
          You need to create an exam master before capturing student pages.
        </p>
        <button
          onClick={() => setView({ name: 'create_exam' })}
          className="bg-blue-600 px-6 py-3 rounded-xl font-semibold">
          Create Exam Master
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-black relative overflow-hidden">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        className="hidden"
        onChange={handleFilePick}
      />

      {showFlash && (
        <div className="absolute inset-0 bg-white z-50 opacity-80 transition-opacity duration-150" />
      )}

      <div className="absolute top-0 left-0 right-0 p-4 pt-12 bg-gradient-to-b from-black/80 to-transparent z-10 flex items-center justify-between">
        <button
          onClick={() => setView({ name: 'dashboard' })}
          className="p-2 text-white/80 hover:text-white bg-black/20 rounded-full backdrop-blur-sm">
          <X className="w-6 h-6" />
        </button>
        <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg px-3 py-1.5 max-w-[200px]">
          <select
            value={selectedExamId}
            onChange={(e) => setSelectedExamId(e.target.value)}
            className="bg-transparent text-white text-sm font-medium outline-none w-full appearance-none text-center truncate">
            {exams.map((e) => (
              <option key={e.id} value={e.id} className="text-black">
                {e.name}
              </option>
            ))}
          </select>
        </div>
        <div className="w-10" />
      </div>

      <div className="flex-1 relative flex items-center justify-center overflow-hidden">
        {ready ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center gap-3 px-6 text-center">
            <ImagePlus className="w-12 h-12 text-white/30" />
            <p className="text-white/50 text-sm">
              {cameraError ?? 'Starting camera...'}
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-blue-400 text-sm font-medium">
              Upload photos instead
            </button>
          </div>
        )}

        <div className="absolute inset-8 border-2 border-white/30 rounded-2xl pointer-events-none z-10">
          <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-500 rounded-tl-xl -mt-0.5 -ml-0.5" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-500 rounded-tr-xl -mt-0.5 -mr-0.5" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-500 rounded-bl-xl -mb-0.5 -ml-0.5" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-500 rounded-br-xl -mb-0.5 -mr-0.5" />
        </div>

        {ready && (
          <p className="absolute bottom-12 text-white/40 text-sm font-medium tracking-widest uppercase z-10">
            Align Page Here
          </p>
        )}
      </div>

      <div className="bg-black/90 pb-safe pt-4 px-4 rounded-t-3xl border-t border-white/10 z-20">
        {error && (
          <p className="text-sm text-red-400 bg-red-950/50 border border-red-900 rounded-xl px-4 py-3 mb-3">
            {error}
          </p>
        )}

        <div className="flex items-center gap-3 overflow-x-auto pb-4 hide-scrollbar">
          {pages.length > 0 && (
            <p className="text-white/50 text-xs flex-shrink-0 pr-1">
              {pages.length}/{MAX_PAGES_PER_GRADE} pages
            </p>
          )}
          {pages.map((page, idx) => (
            <div
              key={page.id}
              className="relative w-16 h-20 bg-slate-800 rounded-lg border border-white/20 flex-shrink-0 overflow-hidden">
              <img
                src={page.previewUrl}
                alt={`Page ${idx + 1}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-1 right-1 bg-blue-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {idx + 1}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-4 py-4">
          {pages.length === 0 ? (
            <button
              onClick={handleCapture}
              className="mx-auto w-20 h-20 rounded-full border-4 border-white/20 flex items-center justify-center p-1">
              <div className="w-full h-full bg-white rounded-full active:scale-95 transition-transform flex items-center justify-center">
                <Camera className="w-8 h-8 text-black" />
              </div>
            </button>
          ) : (
            <>
              <button
                onClick={handleProcess}
                disabled={isProcessing}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl py-4 font-bold text-lg shadow-lg shadow-blue-900/50 flex items-center justify-center gap-2 transition-all disabled:opacity-80">
                {isProcessing ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Grading with AI...
                  </>
                ) : (
                  <>
                    <Check className="w-6 h-6" />
                    Process & Grade
                  </>
                )}
              </button>
              <button
                onClick={handleCapture}
                disabled={isProcessing}
                aria-label="Take picture"
                className="w-20 h-20 flex-shrink-0 rounded-full border-4 border-white/20 flex items-center justify-center p-1 disabled:opacity-50">
                <div className="w-full h-full bg-white rounded-full active:scale-95 transition-transform flex items-center justify-center">
                  <Camera className="w-8 h-8 text-black" />
                </div>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
