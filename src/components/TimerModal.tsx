import React, { useEffect, useState } from 'react';
import { CheckCircle2, Pause, Play, RotateCcw, Star, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { RevisionTask } from '../types';
import { StorageService } from '../services/storage';

interface TimerModalProps {
  task: RevisionTask | null;
  isOpen: boolean;
  onClose: () => void;
  onSessionCompleted?: () => void;
}

export const TimerModal: React.FC<TimerModalProps> = ({
  task,
  isOpen,
  onClose,
  onSessionCompleted,
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);
  const [initialSeconds, setInitialSeconds] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [focusRating, setFocusRating] = useState<number>(5);
  const [sessionNotes, setSessionNotes] = useState<string>('');

  useEffect(() => {
    if (task) {
      const totalSec = (task.durationMinutes || 45) * 60;
      setSecondsRemaining(totalSec);
      setInitialSeconds(totalSec);
      setIsActive(false);
      setIsFinished(false);
      setFocusRating(5);
      setSessionNotes('');
    }
  }, [task]);

  useEffect(() => {
    let interval: any = null;
    if (isActive && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsActive(false);
            setIsFinished(true);
            try {
              confetti({ particleCount: 70, spread: 60 });
            } catch (e) {
              // Ignore confetti error
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, secondsRemaining]);

  if (!isOpen || !task) return null;

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const progressPercent = initialSeconds > 0
    ? Math.round(((initialSeconds - secondsRemaining) / initialSeconds) * 100)
    : 0;

  const handleStartPause = () => {
    setIsActive(!isActive);
  };

  const handleReset = () => {
    setIsActive(false);
    setSecondsRemaining(initialSeconds);
    setIsFinished(false);
  };

  const handleCompleteEarly = () => {
    setIsActive(false);
    setIsFinished(true);
    try {
      confetti({ particleCount: 60, spread: 50 });
    } catch (e) {
      // Ignore
    }
  };

  const handleSaveAndLog = () => {
    const elapsedMinutes = Math.max(1, Math.round((initialSeconds - secondsRemaining) / 60));

    // Mark task completed
    StorageService.toggleTaskCompletion(task.id);

    // Save detailed session log
    StorageService.recordStudySession({
      id: `session-${Date.now()}`,
      userId: task.userId,
      taskId: task.id,
      subjectId: task.subjectId,
      subjectName: task.subjectName,
      chapterName: task.chapterName,
      date: task.scheduledDate,
      durationMinutes: elapsedMinutes,
      focusRating,
      notes: sessionNotes.trim() || `Completed ${task.revisionType} focus block.`,
      timestamp: new Date().toISOString(),
    });

    try {
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
    } catch (e) {}

    onSessionCompleted?.();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Active Focus Session
            </span>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 truncate max-w-xs">
              {task.subjectName}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 text-center">
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {task.chapterName}
            </h4>
            <div className="flex items-center justify-center gap-2 mt-1 text-xs text-slate-500 dark:text-slate-400">
              <span>{task.revisionType}</span>
              <span aria-hidden="true">·</span>
              <span>Target: {task.durationMinutes} min</span>
            </div>
          </div>

          {!isFinished ? (
            <>
              {/* Timer Display */}
              <div className="relative my-6 flex flex-col items-center justify-center">
                <div className="w-48 h-48 rounded-full border-4 border-slate-100 dark:border-slate-800 flex items-center justify-center relative shadow-inner">
                  <div
                    className="absolute inset-0 rounded-full border-4 border-indigo-600 transition-all duration-1000"
                    style={{
                      clipPath: `polygon(50% 50%, -50% -50%, ${progressPercent}% -50%, ${progressPercent}% 150%, -50% 150%)`,
                    }}
                  />
                  <div className="text-center z-10">
                    <span className="text-4xl font-extrabold font-mono tabular-nums text-slate-900 dark:text-white">
                      {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                    </span>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {isActive ? 'Session in progress' : 'Ready to start'}
                    </p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-6 overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={handleReset}
                  title="Reset Timer"
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>

                <button
                  onClick={handleStartPause}
                  className={`px-8 py-3 rounded-xl font-semibold flex items-center gap-2 text-white shadow-sm transition-transform active:scale-95 ${
                    isActive
                      ? 'bg-amber-600 hover:bg-amber-700'
                      : 'bg-indigo-600 hover:bg-indigo-700'
                  }`}
                >
                  {isActive ? (
                    <>
                      <Pause className="w-5 h-5" /> Pause
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 fill-current" /> {secondsRemaining < initialSeconds ? 'Resume' : 'Start Focus'}
                    </>
                  )}
                </button>

                <button
                  onClick={handleCompleteEarly}
                  title="Finish & Log Early"
                  className="p-3 rounded-xl border border-emerald-200 dark:border-emerald-800/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors"
                >
                  <CheckCircle2 className="w-5 h-5" />
                </button>
              </div>
            </>
          ) : (
            /* Session Completed Screen */
            <div className="py-2 text-left space-y-4">
              <div className="text-center pb-2">
                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-2">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                  Revision Session Complete!
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Logged {Math.round((initialSeconds - secondsRemaining) / 60)} minutes of active revision.
                </p>
              </div>

              {/* Rating */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  How was your focus during this block?
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFocusRating(star)}
                      className="p-1 text-slate-300 dark:text-slate-600 hover:text-amber-400 transition-colors"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= focusRating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-300 dark:text-slate-700'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-medium text-slate-500 ml-2">
                    {focusRating === 5 ? 'High Focus' : focusRating >= 3 ? 'Good' : 'Challenging'}
                  </span>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Revision Notes or Key Formulas Mastered (optional)
                </label>
                <textarea
                  rows={2}
                  value={sessionNotes}
                  onChange={(e) => setSessionNotes(e.target.value)}
                  placeholder="E.g., solved 4 DP problems, memorized dijkstra relaxation step..."
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  Discard
                </button>
                <button
                  type="button"
                  onClick={handleSaveAndLog}
                  className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs"
                >
                  Save & Complete Task
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
