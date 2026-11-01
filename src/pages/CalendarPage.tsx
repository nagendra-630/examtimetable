import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { Exam, RevisionTask, Subject } from '../types';
import { addDays, formatDate, getDaysDiff } from '../utils/scheduler';

interface CalendarPageProps {
  exams: Exam[];
  tasks: RevisionTask[];
  subjects: Subject[];
  onOpenTimer: (task: RevisionTask) => void;
  onOpenScheduleModal: () => void;
}

export const CalendarPage: React.FC<CalendarPageProps> = ({
  exams,
  tasks,
  subjects,
  onOpenTimer,
  onOpenScheduleModal,
}) => {
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDayTasksModalDate, setSelectedDayTasksModalDate] = useState<string | null>(null);

  const todayStr = formatDate(new Date());

  // Month navigation helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrev = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(year, month - 1, 1));
    } else if (viewMode === 'week') {
      const d = new Date(currentDate);
      d.setDate(d.getDate() - 7);
      setCurrentDate(d);
    } else {
      const d = new Date(currentDate);
      d.setDate(d.getDate() - 1);
      setCurrentDate(d);
    }
  };

  const handleNext = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(year, month + 1, 1));
    } else if (viewMode === 'week') {
      const d = new Date(currentDate);
      d.setDate(d.getDate() + 7);
      setCurrentDate(d);
    } else {
      const d = new Date(currentDate);
      d.setDate(d.getDate() + 1);
      setCurrentDate(d);
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Month grid calculations
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Week view calculations
  const startOfWeek = new Date(currentDate);
  startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return d;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Interactive Academic Calendar
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Comprehensive view of examination milestones and distributed spaced revision blocks.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View mode segmented buttons */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            {(['month', 'week', 'day'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-colors ${
                  viewMode === mode
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          <button
            onClick={onOpenScheduleModal}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-xs flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" /> Re-Schedule
          </button>
        </div>
      </div>

      {/* Calendar Navigation Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrev}
            className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            {viewMode === 'month' && `${monthNames[month]} ${year}`}
            {viewMode === 'week' && `Week of ${formatDate(weekDays[0])} – ${formatDate(weekDays[6])}`}
            {viewMode === 'day' && formatDate(currentDate)}
          </h2>

          <button
            onClick={handleNext}
            className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <button
          onClick={handleToday}
          className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          Jump to Today
        </button>
      </div>

      {/* MONTH VIEW */}
      {viewMode === 'month' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          {/* Day Headers */}
          <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 text-center text-xs font-bold text-slate-500 py-2.5">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          {/* Grid Cells */}
          <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 dark:divide-slate-800 border-b border-slate-100 dark:border-slate-800">
            {/* Prev month fill */}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => {
              const dayNum = daysInPrevMonth - firstDayOfMonth + i + 1;
              return (
                <div key={`prev-${i}`} className="min-h-[105px] p-2 bg-slate-50/30 dark:bg-slate-950/20 text-slate-300 dark:text-slate-700 text-xs">
                  {dayNum}
                </div>
              );
            })}

            {/* Current month days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const isToday = dStr === todayStr;

              const dayExams = exams.filter((e) => e.examDate === dStr);
              const dayTasks = tasks.filter((t) => t.scheduledDate === dStr);

              return (
                <div
                  key={`day-${dayNum}`}
                  onClick={() => setSelectedDayTasksModalDate(dStr)}
                  className={`min-h-[110px] p-2 cursor-pointer transition-colors relative hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20 ${
                    isToday ? 'bg-indigo-50/50 dark:bg-indigo-950/30' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`text-xs font-mono font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                        isToday
                          ? 'bg-indigo-600 text-white'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {dayNum}
                    </span>

                    {dayExams.length > 0 && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-rose-600 dark:text-rose-400">
                        <GraduationCap className="w-3 h-3" />
                        {dayExams.length}
                      </span>
                    )}
                  </div>

                  {/* Badges / Task Preview */}
                  <div className="space-y-1 overflow-hidden">
                    {/* Exam tags */}
                    {dayExams.map((e) => (
                      <div
                        key={e.id}
                        className="text-[10px] font-bold px-1.5 py-0.5 rounded-sm bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-200 truncate flex items-center gap-1"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-600 shrink-0" />
                        <span className="truncate">{e.subjectName} Exam</span>
                      </div>
                    ))}

                    {/* Revision sessions */}
                    {dayTasks.slice(0, 2).map((t) => (
                      <div
                        key={t.id}
                        className={`text-[10px] font-medium px-1.5 py-0.5 rounded-sm truncate flex items-center gap-1 ${
                          t.isCompleted
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 line-through opacity-70'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ backgroundColor: t.subjectColor || '#6366F1' }}
                        />
                        <span className="truncate">{t.chapterName}</span>
                      </div>
                    ))}

                    {dayTasks.length > 2 && (
                      <div className="text-[9px] text-slate-400 font-semibold pl-1">
                        +{dayTasks.length - 2} more sessions
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* WEEK VIEW */}
      {viewMode === 'week' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="grid grid-cols-7 divide-x divide-slate-100 dark:divide-slate-800">
            {weekDays.map((d, idx) => {
              const dStr = formatDate(d);
              const isToday = dStr === todayStr;
              const dayExams = exams.filter((e) => e.examDate === dStr);
              const dayTasks = tasks
                .filter((t) => t.scheduledDate === dStr)
                .sort((a, b) => a.startTime.localeCompare(b.startTime));

              return (
                <div key={idx} className="min-h-[420px] flex flex-col">
                  {/* Day header */}
                  <div
                    className={`p-3 text-center border-b border-slate-200 dark:border-slate-800 ${
                      isToday ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300' : 'bg-slate-50/50 dark:bg-slate-950/30'
                    }`}
                  >
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      {d.toLocaleDateString('en-US', { weekday: 'short' })}
                    </div>
                    <div className="text-sm font-bold font-mono mt-0.5">
                      {d.getDate()}
                    </div>
                  </div>

                  {/* Sessions column */}
                  <div className="p-2 space-y-2 flex-1 overflow-y-auto">
                    {dayExams.map((e) => (
                      <div
                        key={e.id}
                        className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-xs"
                      >
                        <div className="flex items-center gap-1 font-bold text-rose-700 dark:text-rose-300">
                          <GraduationCap className="w-3.5 h-3.5" />
                          <span>EXAM</span>
                        </div>
                        <p className="font-semibold text-slate-900 dark:text-white mt-1 leading-tight">
                          {e.subjectName}
                        </p>
                        <span className="text-[10px] text-slate-500 font-mono mt-1 block">
                          {e.startTime} ({e.durationMinutes}m)
                        </span>
                      </div>
                    ))}

                    {dayTasks.map((t) => (
                      <div
                        key={t.id}
                        onClick={() => !t.isCompleted && onOpenTimer(t)}
                        className={`p-2 rounded-lg border text-xs cursor-pointer transition-all ${
                          t.isCompleted
                            ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40 opacity-70'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-400'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                          <span>{t.startTime}</span>
                          <span>{t.durationMinutes}m</span>
                        </div>
                        <h4 className="font-semibold text-slate-900 dark:text-white truncate mt-1">
                          {t.chapterName}
                        </h4>
                        <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium block mt-0.5 truncate">
                          {t.subjectName}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* DAY VIEW */}
      {viewMode === 'day' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <span className="text-xs uppercase font-semibold text-slate-400 tracking-wider">
                Daily Focus View
              </span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {currentDate.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </h3>
            </div>
          </div>

          {/* Items for current day */}
          {(() => {
            const dStr = formatDate(currentDate);
            const dayExams = exams.filter((e) => e.examDate === dStr);
            const dayTasks = tasks
              .filter((t) => t.scheduledDate === dStr)
              .sort((a, b) => a.startTime.localeCompare(b.startTime));

            if (dayExams.length === 0 && dayTasks.length === 0) {
              return (
                <div className="text-center py-12 text-xs text-slate-400">
                  No examinations or revision blocks scheduled for this day.
                </div>
              );
            }

            return (
              <div className="space-y-3">
                {dayExams.map((e) => (
                  <div
                    key={e.id}
                    className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-rose-700 dark:text-rose-300 uppercase tracking-wider text-[10px]">
                        Examination Milestone
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                        {e.examName} ({e.subjectName})
                      </h4>
                      <p className="text-slate-500 mt-1">
                        Time: {e.startTime} · Venue: {e.venueOrRoom || 'Main Campus'}
                      </p>
                    </div>
                  </div>
                ))}

                {dayTasks.map((t) => (
                  <div
                    key={t.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="w-3 h-10 rounded-full shrink-0"
                        style={{ backgroundColor: t.subjectColor || '#6366F1' }}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-slate-500">
                            {t.startTime} – {t.endTime} ({t.durationMinutes}m)
                          </span>
                          <span aria-hidden="true" className="text-slate-400">·</span>
                          <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                            {t.revisionType}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                          {t.chapterName}
                        </h4>
                        <span className="text-slate-500">{t.subjectName}</span>
                      </div>
                    </div>

                    {!t.isCompleted && (
                      <button
                        onClick={() => onOpenTimer(t)}
                        className="px-3.5 py-1.5 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
                      >
                        Start Session
                      </button>
                    )}
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      )}

      {/* Modal for Day Click in Month View */}
      {selectedDayTasksModalDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Events for {selectedDayTasksModalDate}
              </h3>
              <button
                onClick={() => setSelectedDayTasksModalDate(null)}
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                Close
              </button>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto">
              {/* Exams for date */}
              {exams
                .filter((e) => e.examDate === selectedDayTasksModalDate)
                .map((e) => (
                  <div key={e.id} className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-xs text-rose-700 dark:text-rose-300 font-medium">
                    <span className="font-bold">EXAM:</span> {e.examName} ({e.subjectName}) at {e.startTime}
                  </div>
                ))}

              {/* Tasks for date */}
              {tasks
                .filter((t) => t.scheduledDate === selectedDayTasksModalDate)
                .map((t) => (
                  <div
                    key={t.id}
                    className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 text-xs flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white block">
                        {t.chapterName}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {t.subjectName} · {t.startTime} ({t.durationMinutes}m)
                      </span>
                    </div>

                    {!t.isCompleted && (
                      <button
                        onClick={() => {
                          setSelectedDayTasksModalDate(null);
                          onOpenTimer(t);
                        }}
                        className="px-2.5 py-1 text-[11px] font-semibold text-white bg-indigo-600 rounded-md"
                      >
                        Focus
                      </button>
                    )}
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
