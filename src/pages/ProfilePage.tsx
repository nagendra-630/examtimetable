import React, { useState } from 'react';
import {
  Bell,
  Check,
  Clock,
  GraduationCap,
  Save,
  ShieldCheck,
  User as UserIcon,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { StudyPreferences } from '../types';

export const ProfilePage: React.FC = () => {
  const { currentUser, updateProfile, updatePreferences } = useAuth();

  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [schoolOrUniversity, setSchoolOrUniversity] = useState(currentUser?.schoolOrUniversity || '');
  const [targetGpaOrGoal, setTargetGpaOrGoal] = useState(currentUser?.targetGpaOrGoal || '');

  // Preferences
  const prefs = currentUser?.studyPreferences;
  const [dailyAvailableHours, setDailyAvailableHours] = useState(prefs?.dailyAvailableHours || 4.5);
  const [preferredStartTime, setPreferredStartTime] = useState(prefs?.preferredStartTime || '09:00');
  const [preferredEndTime, setPreferredEndTime] = useState(prefs?.preferredEndTime || '21:00');
  const [sessionDurationMinutes, setSessionDurationMinutes] = useState(prefs?.sessionDurationMinutes || 50);
  const [breakDurationMinutes, setBreakDurationMinutes] = useState(prefs?.breakDurationMinutes || 10);
  const [reservePreExamDays, setReservePreExamDays] = useState(prefs?.reservePreExamDays || 1);
  const [enableSpacedRepetition, setEnableSpacedRepetition] = useState(prefs?.enableSpacedRepetition ?? true);
  const [focusWeakSubjects, setFocusWeakSubjects] = useState(prefs?.focusWeakSubjects ?? true);
  const [emailNotifications, setEmailNotifications] = useState(prefs?.emailNotifications ?? true);
  const [dailyReminderTime, setDailyReminderTime] = useState(prefs?.dailyReminderTime || '08:00');

  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    updateProfile({
      name,
      email,
      schoolOrUniversity,
      targetGpaOrGoal,
    });

    const updatedPrefs: StudyPreferences = {
      dailyAvailableHours,
      preferredStartTime,
      preferredEndTime,
      sessionDurationMinutes,
      breakDurationMinutes,
      reservePreExamDays,
      enableSpacedRepetition,
      focusWeakSubjects,
      emailNotifications,
      dailyReminderTime,
    };

    updatePreferences(updatedPrefs);

    setIsSaved(true);
    try {
      confetti({ particleCount: 50, spread: 60 });
    } catch (e) {}

    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Student Profile & Study Constraints
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Customize your daily study hour budget, break rhythms, and spaced repetition preferences.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <UserIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Personal & Academic Details
              </h2>
              <p className="text-xs text-slate-500">Account identity and university affiliation</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                School or University
              </label>
              <input
                type="text"
                value={schoolOrUniversity}
                onChange={(e) => setSchoolOrUniversity(e.target.value)}
                placeholder="e.g. Stanford University"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Target GPA / Academic Goal
              </label>
              <input
                type="text"
                value={targetGpaOrGoal}
                onChange={(e) => setTargetGpaOrGoal(e.target.value)}
                placeholder="e.g. 3.9+ GPA, First Class Honours"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Study Availability & Capacity Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Study Availability & Session Constraints
              </h2>
              <p className="text-xs text-slate-500">
                The smart scheduler guarantees daily study sessions never exceed your chosen capacity.
              </p>
            </div>
          </div>

          <div className="space-y-5 text-xs">
            {/* Slider */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="font-semibold text-slate-800 dark:text-slate-200">
                  Maximum Daily Available Study Hours
                </label>
                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 text-sm">
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
                <span>4.5 hrs (Standard)</span>
                <span>10 hrs (Intensive)</span>
              </div>
            </div>

            {/* Timings */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Earliest Daily Study Start
                </label>
                <input
                  type="time"
                  value={preferredStartTime}
                  onChange={(e) => setPreferredStartTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Latest Daily Study End
                </label>
                <input
                  type="time"
                  value={preferredEndTime}
                  onChange={(e) => setPreferredEndTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Block & Breaks */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Block Duration
                </label>
                <select
                  value={sessionDurationMinutes}
                  onChange={(e) => setSessionDurationMinutes(parseInt(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value={30}>30 mins</option>
                  <option value={45}>45 mins</option>
                  <option value={50}>50 mins (Pomodoro)</option>
                  <option value={60}>60 mins</option>
                  <option value={90}>90 mins</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Rest Break Between Blocks
                </label>
                <select
                  value={breakDurationMinutes}
                  onChange={(e) => setBreakDurationMinutes(parseInt(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value={5}>5 mins</option>
                  <option value={10}>10 mins</option>
                  <option value={15}>15 mins</option>
                  <option value={20}>20 mins</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Pre-Exam High-Yield Buffer
                </label>
                <select
                  value={reservePreExamDays}
                  onChange={(e) => setReservePreExamDays(parseInt(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value={1}>1 Day Before Exam</option>
                  <option value={2}>2 Days Before Exam</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Algorithm Strategy & Reminders Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Intelligent Scheduling Rules & Notifications
              </h2>
              <p className="text-xs text-slate-500">Spaced repetition and automated reminders</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={enableSpacedRepetition}
                onChange={(e) => setEnableSpacedRepetition(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded-sm border-slate-300 dark:border-slate-700"
              />
              <div>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  Enable Spaced Repetition (Day 1, 3, 7, 14 curve)
                </span>
                <p className="text-[11px] text-slate-500">
                  Reinforces difficult concepts across expanding time intervals to combat the forgetting curve.
                </p>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={focusWeakSubjects}
                onChange={(e) => setFocusWeakSubjects(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded-sm border-slate-300 dark:border-slate-700"
              />
              <div>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  Priority Weighting for Weak Chapters
                </span>
                <p className="text-[11px] text-slate-500">
                  Dynamically shifts more revision sessions to topics where your self-assessed understanding is low.
                </p>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={emailNotifications}
                onChange={(e) => setEmailNotifications(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded-sm border-slate-300 dark:border-slate-700"
              />
              <div>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  Daily Morning Digest & Exam Reminders
                </span>
                <p className="text-[11px] text-slate-500">
                  Dispatch daily study schedule summary and countdown notices at your preferred time.
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {isSaved && (
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <Check className="w-4 h-4" /> Preferences updated successfully!
            </span>
          )}

          <button
            type="submit"
            className="px-6 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-xs flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> Save Profile & Preferences
          </button>
        </div>
      </form>
    </div>
  );
};
