import React, { useState } from 'react';
import { AlertCircle, Calendar, Check, Clock, ShieldCheck, Sparkles, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { ScheduleGeneratorOptions } from '../types';
import { formatDate } from '../utils/scheduler';
import { StorageService } from '../services/storage';
import { useAuth } from '../context/AuthContext';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScheduleGenerated: (count: number) => void;
}

export const ScheduleModal: React.FC<ScheduleModalProps> = ({
  isOpen,
  onClose,
  onScheduleGenerated,
}) => {
  const { currentUser } = useAuth();
  const prefs = currentUser?.studyPreferences;

  const [startDate, setStartDate] = useState(formatDate(new Date()));
  const [dailyAvailableHours, setDailyAvailableHours] = useState(prefs?.dailyAvailableHours || 4.5);
  const [sessionDurationMinutes, setSessionDurationMinutes] = useState(prefs?.sessionDurationMinutes || 50);
  const [breakDurationMinutes, setBreakDurationMinutes] = useState(prefs?.breakDurationMinutes || 10);
  const [reservePreExamDays, setReservePreExamDays] = useState(prefs?.reservePreExamDays || 1);
  const [preserveCompletedSessions, setPreserveCompletedSessions] = useState(true);
  const [boostWeakChapters, setBoostWeakChapters] = useState(true);
  const [preferredDailyStartTime, setPreferredDailyStartTime] = useState(prefs?.preferredStartTime || '09:00');
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const options: ScheduleGeneratorOptions = {
        startDate,
        dailyAvailableHours,
        sessionDurationMinutes,
        breakDurationMinutes,
        reservePreExamDays,
        preserveCompletedSessions,
        boostWeakChapters,
        preferredDailyStartTime,
      };

      const result = StorageService.regenerateSchedule(options);
      setIsGenerating(false);

      try {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.5 } });
      } catch (e) {}

      onScheduleGenerated(result.totalGenerated);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Smart Revision Schedule Generator
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Spaced repetition, exam proximity weighting, and daily workload balancing
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs text-slate-700 dark:text-slate-300">
          {/* Algorithm Strategy Banner */}
          <div className="p-3.5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 space-y-1.5">
            <div className="flex items-center gap-2 font-semibold text-indigo-950 dark:text-indigo-200">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>Spaced Repetition Engine Active</span>
            </div>
            <p className="text-indigo-900/80 dark:text-indigo-300/80 leading-relaxed text-[11px]">
              Distributes chapters across Day 1, 3, 7, and 14 review milestones. Automatically allocates more revision blocks to Hard chapters and low-understanding topics while reserving pre-exam days for high-yield recap drills.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Start Date */}
            <div>
              <label className="block font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                Schedule Starting From
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Preferred Start Time */}
            <div>
              <label className="block font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                Preferred Daily Start Time
              </label>
              <input
                type="time"
                value={preferredDailyStartTime}
                onChange={(e) => setPreferredDailyStartTime(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Daily Available Hours */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-semibold text-slate-800 dark:text-slate-200">
                Daily Study Availability Limit
              </label>
              <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                {dailyAvailableHours} hours / day
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              step="0.5"
              value={dailyAvailableHours}
              onChange={(e) => setDailyAvailableHours(parseFloat(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>1 hr (Light)</span>
              <span>4.5 hrs (Recommended)</span>
              <span>10 hrs (Intensive)</span>
            </div>
          </div>

          {/* Session Duration & Breaks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                Study Block Length
              </label>
              <select
                value={sessionDurationMinutes}
                onChange={(e) => setSessionDurationMinutes(parseInt(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value={30}>30 minutes (Micro-sprints)</option>
                <option value={45}>45 minutes (Standard focus)</option>
                <option value={50}>50 minutes (Pomodoro 50/10)</option>
                <option value={60}>60 minutes (Deep work)</option>
                <option value={90}>90 minutes (Advanced topics)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                Rest Break Between Blocks
              </label>
              <select
                value={breakDurationMinutes}
                onChange={(e) => setBreakDurationMinutes(parseInt(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value={5}>5 minutes</option>
                <option value={10}>10 minutes</option>
                <option value={15}>15 minutes (Cognitive reset)</option>
                <option value={20}>20 minutes</option>
              </select>
            </div>
          </div>

          {/* Pre-Exam Buffer */}
          <div>
            <label className="block font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
              Pre-Exam High-Yield Buffer
            </label>
            <select
              value={reservePreExamDays}
              onChange={(e) => setReservePreExamDays(parseInt(e.target.value))}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value={1}>1 Day Before Exam (Formula sheets, flashcards & final recap)</option>
              <option value={2}>2 Days Before Exam (Full mock exam drills + resting)</option>
            </select>
          </div>

          {/* Toggles */}
          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={preserveCompletedSessions}
                onChange={(e) => setPreserveCompletedSessions(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded-sm border-slate-300 dark:border-slate-700"
              />
              <div>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  Preserve Completed Revision Sessions
                </span>
                <p className="text-[11px] text-slate-500">
                  Maintains all your finished tasks intact and regenerates only remaining pending and future sessions.
                </p>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={boostWeakChapters}
                onChange={(e) => setBoostWeakChapters(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded-sm border-slate-300 dark:border-slate-700"
              />
              <div>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  Weak Topics Priority Boost
                </span>
                <p className="text-[11px] text-slate-500">
                  Allocate +40% more review cycles to chapters marked "Needs Revision" or understanding &le; 2/5.
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isGenerating}
            onClick={handleGenerate}
            className="px-6 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl shadow-xs flex items-center gap-2 transition-all"
          >
            {isGenerating ? (
              <>Calculating optimal timetable...</>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate Optimized Timetable
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
