import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  X,
  Camera,
  Check,
  Loader2,
  ImagePlus,
  ArrowLeft,
} from 'lucide-react';
import { useAppContext } from '../AppContext';
import { useCamera } from '../hooks/useCamera';
import { uploadAndGradeExam, CapturedPage } from '../lib/grading';
import { MAX_PAGES_PER_GRADE } from '../lib/images';

type CaptureMode = 'choose' | 'camera' | 'attach';

export function Capture({ initialExamId }: { initialExamId?: string }) {
  const { exams, setView, addReport } = useAppContext();
  const {
    videoRef,
    ready,
    error: cameraError,
    captureFrame,
    start: startCamera,
    stop: stopCamera,
  } = useCamera();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pagesRef = useRef<CapturedPage[]>([]);

  const [selectedExamId, setSelectedExamId] = useState<string>(
    initialExamId || (exams.length > 0 ? exams[0].id : ''),
  );
  const [mode, setMode] = useState<CaptureMode>('choose');
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
    if (mode !== 'camera') {
      stopCamera();
      return;
    }

    void startCamera();
    return () => stopCamera();
  }, [mode, startCamera, stopCamera]);

  useEffect(() => {
    return () => {
      pagesRef.current.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    };
  }, []);

  const addPage = useCallback((blob: Blob) => {
    setPages((prev) => {
      if (prev.length >= MAX_PAGES_PER_GRADE) {
        setError(
          `Maximum ${MAX_PAGES_PER_GRADE} pages per grade. Process this batch, then grade remaining pages separately.`,
        );
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
    if (blob) addPage(blob);
  };

  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/')) addPage(file);
    });
    e.target.value = '';
  };

  const handleAttachPhotos = () => {
    setMode('attach');
    setError(null);
    fileInputRef.current?.click();
  };

  const handleTakePictures = () => {
    setMode('camera');
    setError(null);
  };

  const handleBackToChoose = () => {
    if (pages.length > 0) return;
    setMode('choose');
    setError(null);
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
      setMode('choose');
      setView({ name: 'report', reportId: report.id });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Grading failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const examSelector = (
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
  );

  const pageStrip = pages.length > 0 && (
    <div className="flex items-center gap-3 overflow-x-auto pb-4 hide-scrollbar">
      <p className="text-white/50 text-xs flex-shrink-0 pr-1">
        {pages.length}/{MAX_PAGES_PER_GRADE} pages
      </p>
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
  );

  const errorBanner = error && (
    <p className="text-sm text-red-400 bg-red-950/50 border border-red-900 rounded-xl px-4 py-3 mb-3">
      {error}
    </p>
  );

  const processButton = pages.length > 0 && (
    <button
      onClick={handleProcess}
      disabled={isProcessing}
      className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-2xl py-4 font-bold text-lg shadow-lg shadow-blue-900/50 flex items-center justify-center gap-2 transition-all disabled:opacity-80">
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
  );

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

  if (mode === 'choose') {
    return (
      <div className="flex flex-col h-full bg-slate-900 text-white">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFilePick}
        />

        <header className="p-4 pt-12 flex items-center justify-between">
          <button
            onClick={() => setView({ name: 'dashboard' })}
            className="p-2 text-white/80 hover:text-white bg-white/10 rounded-full">
            <X className="w-6 h-6" />
          </button>
          {examSelector}
          <div className="w-10" />
        </header>

        <main className="flex-1 flex flex-col items-center justify-center px-6 pb-8">
          <Camera className="w-14 h-14 text-white/20 mb-4" />
          <h1 className="text-xl font-bold mb-2">Grade a student</h1>
          <p className="text-white/50 text-sm text-center mb-8 max-w-xs">
            Add exam pages by camera or from your photo library.
          </p>

          <div className="w-full max-w-sm space-y-3">
            <button
              onClick={handleAttachPhotos}
              className="w-full flex items-center gap-4 bg-white/10 hover:bg-white/15 border border-white/10 rounded-2xl px-5 py-4 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-blue-600/20 flex items-center justify-center">
                <ImagePlus className="w-6 h-6 text-blue-400" />
              </div>
              <div className="text-left">
                <p className="font-semibold">Attach photos</p>
                <p className="text-sm text-white/50">From gallery or files</p>
              </div>
            </button>

            <button
              onClick={handleTakePictures}
              className="w-full flex items-center gap-4 bg-white/10 hover:bg-white/15 border border-white/10 rounded-2xl px-5 py-4 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center">
                <Camera className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <p className="font-semibold">Take pictures now</p>
                <p className="text-sm text-white/50">Open camera to scan pages</p>
              </div>
            </button>
          </div>
        </main>

        {pages.length > 0 && (
          <div className="p-4 border-t border-white/10 bg-black/40">
            {errorBanner}
            {pageStrip}
            {processButton}
          </div>
        )}
      </div>
    );
  }

  if (mode === 'attach') {
    return (
      <div className="flex flex-col h-full bg-slate-900 text-white">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFilePick}
        />

        <header className="p-4 pt-12 flex items-center justify-between">
          {pages.length === 0 ? (
            <button
              onClick={handleBackToChoose}
              className="p-2 text-white/80 hover:text-white bg-white/10 rounded-full">
              <ArrowLeft className="w-6 h-6" />
            </button>
          ) : (
            <div className="w-10" />
          )}
          {examSelector}
          <button
            onClick={() => setView({ name: 'dashboard' })}
            className="p-2 text-white/80 hover:text-white bg-white/10 rounded-full">
            <X className="w-6 h-6" />
          </button>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center px-6">
          {pages.length === 0 ? (
            <>
              <ImagePlus className="w-14 h-14 text-white/20 mb-4" />
              <p className="text-white/50 text-sm text-center mb-6">
                Select one or more photos of the exam pages.
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl font-semibold">
                Choose photos
              </button>
            </>
          ) : (
            <div className="w-full max-w-sm">
              <p className="text-center text-white/50 text-sm mb-4">
                {pages.length} page{pages.length === 1 ? '' : 's'} ready
              </p>
              <div className="grid grid-cols-2 gap-3">
                {pages.map((page, idx) => (
                  <div
                    key={page.id}
                    className="relative aspect-[3/4] bg-slate-800 rounded-xl border border-white/20 overflow-hidden">
                    <img
                      src={page.previewUrl}
                      alt={`Page ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                      {idx + 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>

        <div className="p-4 border-t border-white/10 bg-black/40 space-y-3">
          {errorBanner}
          {pages.length > 0 && (
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing || pages.length >= MAX_PAGES_PER_GRADE}
              className="w-full bg-white/10 hover:bg-white/15 border border-white/10 text-white rounded-2xl py-3.5 font-semibold flex items-center justify-center gap-2 disabled:opacity-50">
              <ImagePlus className="w-5 h-5" />
              Add more photos
            </button>
          )}
          {processButton}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-black relative overflow-hidden">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFilePick}
      />

      {showFlash && (
        <div className="absolute inset-0 bg-white z-50 opacity-80 transition-opacity duration-150" />
      )}

      <div className="absolute top-0 left-0 right-0 p-4 pt-12 bg-gradient-to-b from-black/80 to-transparent z-10 flex items-center justify-between">
        {pages.length === 0 ? (
          <button
            onClick={handleBackToChoose}
            className="p-2 text-white/80 hover:text-white bg-black/20 rounded-full backdrop-blur-sm">
            <ArrowLeft className="w-6 h-6" />
          </button>
        ) : (
          <button
            onClick={() => setView({ name: 'dashboard' })}
            className="p-2 text-white/80 hover:text-white bg-black/20 rounded-full backdrop-blur-sm">
            <X className="w-6 h-6" />
          </button>
        )}
        {examSelector}
        <div className="w-10" />
      </div>

      <div className="flex-1 relative flex items-center justify-center overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover"
        />

        {!ready && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 px-6 text-center bg-black/80">
            <Camera className="w-12 h-12 text-white/30 animate-pulse" />
            <p className="text-white/50 text-sm">
              {cameraError ?? 'Starting camera...'}
            </p>
          </div>
        )}
      </div>

      <div className="bg-black/90 pb-safe pt-4 px-4 rounded-t-3xl border-t border-white/10 z-20">
        {errorBanner}
        {pageStrip}

        <div className="flex items-center gap-4 py-4">
          {pages.length === 0 ? (
            <button
              onClick={handleCapture}
              disabled={!ready}
              className="mx-auto w-20 h-20 rounded-full border-4 border-white/20 flex items-center justify-center p-1 disabled:opacity-40">
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
                disabled={isProcessing || !ready}
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
