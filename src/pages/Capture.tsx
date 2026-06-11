import React, { useEffect, useState } from 'react';
import { X, Camera, Check, Loader2, FileText } from 'lucide-react';
import { useAppContext } from '../AppContext';
export function Capture({ initialExamId }: {initialExamId?: string;}) {
  const { exams, setView, addReport } = useAppContext();
  const [selectedExamId, setSelectedExamId] = useState<string>(
    initialExamId || (exams.length > 0 ? exams[0].id : '')
  );
  const [pages, setPages] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showFlash, setShowFlash] = useState(false);
  // Mock camera capture
  const handleCapture = () => {
    setShowFlash(true);
    setTimeout(() => setShowFlash(false), 150);
    // Add a mock page thumbnail
    setPages([...pages, `page-${Date.now()}`]);
  };
  const handleProcess = () => {
    setIsProcessing(true);
    // Simulate AI processing time
    setTimeout(() => {
      const reportId = addReport({
        examId: selectedExamId,
        studentName: `Student ${Math.floor(Math.random() * 1000)}`,
        score: Math.floor(Math.random() * 30) + 70,
        pages: pages,
        feedback: [
        {
          question: 'Question 1 (Reading Comprehension - 20 pts)',
          points: '18 / 20',
          content: 'Good understanding of the main text.',
          deduction: '-2 points for missing secondary detail.',
          reasoning:
          'The student missed the detail about the timeline mentioned in paragraph 2.'
        },
        {
          question: 'Question 2 (Grammar - 10 pts)',
          points: '7 / 10',
          content: 'Correct verb tenses used mostly.',
          deduction: '-3 points for subject-verb agreement errors.',
          reasoning: 'Used "The group of students are" instead of "is".'
        }]

      });
      setView({
        name: 'report',
        reportId
      });
    }, 2500);
  };
  if (exams.length === 0) {
    return (
      <div className="flex flex-col h-full bg-slate-900 text-white items-center justify-center p-6 text-center">
        <p className="text-xl font-semibold mb-2">No Exams Found</p>
        <p className="text-slate-400 mb-6">
          You need to create an exam master before capturing student pages.
        </p>
        <button
          onClick={() =>
          setView({
            name: 'create_exam'
          })
          }
          className="bg-blue-600 px-6 py-3 rounded-xl font-semibold">
          
          Create Exam Master
        </button>
      </div>);

  }
  return (
    <div className="flex flex-col h-full bg-black relative overflow-hidden">
      {/* Flash overlay */}
      {showFlash &&
      <div className="absolute inset-0 bg-white z-50 opacity-80 transition-opacity duration-150"></div>
      }

      {/* Header overlay */}
      <div className="absolute top-0 left-0 right-0 p-4 pt-12 bg-gradient-to-b from-black/80 to-transparent z-10 flex items-center justify-between">
        <button
          onClick={() =>
          setView({
            name: 'dashboard'
          })
          }
          className="p-2 text-white/80 hover:text-white bg-black/20 rounded-full backdrop-blur-sm">
          
          <X className="w-6 h-6" />
        </button>
        <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg px-3 py-1.5 max-w-[200px]">
          <select
            value={selectedExamId}
            onChange={(e) => setSelectedExamId(e.target.value)}
            className="bg-transparent text-white text-sm font-medium outline-none w-full appearance-none text-center truncate">
            
            {exams.map((e) =>
            <option key={e.id} value={e.id} className="text-black">
                {e.name}
              </option>
            )}
          </select>
        </div>
        <div className="w-10"></div> {/* Spacer for centering */}
      </div>

      {/* Camera Viewport (Mock) */}
      <div className="flex-1 relative flex items-center justify-center">
        {/* Viewfinder guides */}
        <div className="absolute inset-8 border-2 border-white/30 rounded-2xl pointer-events-none">
          <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-500 rounded-tl-xl -mt-0.5 -ml-0.5"></div>
          <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-500 rounded-tr-xl -mt-0.5 -mr-0.5"></div>
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-500 rounded-bl-xl -mb-0.5 -ml-0.5"></div>
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-500 rounded-br-xl -mb-0.5 -mr-0.5"></div>
        </div>

        <p className="text-white/40 text-sm font-medium tracking-widest uppercase">
          Align Page Here
        </p>
      </div>

      {/* Bottom Controls */}
      <div className="bg-black/90 pb-safe pt-4 px-4 rounded-t-3xl border-t border-white/10 z-20">
        {/* Batch Strip */}
        <div className="flex items-center gap-3 overflow-x-auto pb-4 hide-scrollbar">
          {pages.map((page, idx) =>
          <div
            key={page}
            className="relative w-16 h-20 bg-slate-800 rounded-lg border border-white/20 flex-shrink-0 flex items-center justify-center overflow-hidden">
            
              <FileText className="w-6 h-6 text-slate-500" />
              <div className="absolute bottom-1 right-1 bg-blue-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {idx + 1}
              </div>
            </div>
          )}

        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4 py-4">
          {pages.length === 0 ?
          <button
            onClick={handleCapture}
            className="mx-auto w-20 h-20 rounded-full border-4 border-white/20 flex items-center justify-center p-1">
            
              <div className="w-full h-full bg-white rounded-full active:scale-95 transition-transform flex items-center justify-center">
                <Camera className="w-8 h-8 text-black" />
              </div>
            </button> :

          <>
              <button
                onClick={handleProcess}
                disabled={isProcessing}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl py-4 font-bold text-lg shadow-lg shadow-blue-900/50 flex items-center justify-center gap-2 transition-all disabled:opacity-80">
                
                {isProcessing ?
              <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Grading with AI...
                  </> :

              <>
                    <Check className="w-6 h-6" />
                    Process & Grade
                  </>
              }
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
          }
        </div>
      </div>
    </div>);

}