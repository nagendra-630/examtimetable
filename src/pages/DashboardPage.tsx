import React, { useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  GraduationCap,
  Play,
  Plus,
  RefreshCw,
  Sparkles,
  Trophy,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Chapter, Exam, RevisionTask, Subject } from '../types';
import { formatDate, getDaysDiff } from '../utils/scheduler';
import { StorageService } from '../services/storage';
import { useAuth } from '../context/AuthContext';

interface DashboardPageProps {
  exams: Exam[];
  subjects: Subject[];
  chapters: Chapter[];
  tasks: RevisionTask[];
  onNavigate: (tab: string) => void;
  onOpenTimer: (task: RevisionTask) => void;
  onOpenScheduleModal: () => void;
  onAddExamClick: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  exams,
  subjects,
  chapters,
  tasks,
  onNavigate,
  onOpenTimer,
  onOpenScheduleModal,
  onAddExamClick,
}) => {
  const { currentUser } = useAuth();
  const todayStr = formatDate(new Date());

  // Calculations
  const upcomingExams = [...exams]
    .filter((e) => e.examDate >= todayStr)
    .sort((a, b) => a.examDate.localeCompare(b.examDate));

  const nextExam = upcomingExams[0] || null;
  const daysUntilNextExam = nextExam ? getDaysDiff(todayStr, nextExam.examDate) : null;

  // Today's tasks
  const todayTasks = tasks.filter((t) => t.scheduledDate === todayStr);
  const todayCompletedCount = todayTasks.filter((t) => t.isCompleted).length;
  const todayTotalCount = todayTasks.length;
  const todayProgressPercent = todayTotalCount > 0 ? Math.round((todayCompletedCount / todayTotalCount) * 100) : 0;

  // Total completed sessions & overall prep
  const totalTasks = tasks.length;
  const totalCompletedTasks = tasks.filter((t) => t.isCompleted).length;
  const completedChapters = chapters.filter((c) => c.preparationStatus === 'Completed').length;
  const totalChaptersCount = chapters.length;
  const overallPrepPercentage = totalChaptersCount > 0 ? Math.round((completedChapters / totalChaptersCount) * 100) : 0;

  // Weak chapters (understanding <= 2 or Needs Revision)
  const weakChapters = chapters.filter(
    (c) => c.understandingLevel <= 2 || c.preparationStatus === 'Needs Revision'
  );

  // Weekly study data generation for Recharts
  const weeklyChartData = React.useMemo(() => {
    const days: { day: string; plannedHours: number; actualHours: number }[] = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = -3; i <= 3; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const dStr = formatDate(d);
      const dayName = i === 0 ? 'Today' : dayNames[d.getDay()];

      const dayTasks = tasks.filter((t) => t.scheduledDate === dStr);
      const plannedMin = dayTasks.reduce((sum, t) => sum + (t.durationMinutes || 45), 0);
      const actualMin = dayTasks
        .filter((t) => t.isCompleted)
        .reduce((sum, t) => sum + (t.actualDurationMinutes || t.durationMinutes || 45), 0);

      days.push({
        day: dayName,
        plannedHours: parseFloat((plannedMin / 60).toFixed(1)),
        actualHours: parseFloat((actualMin / 60).toFixed(1)),
      });
    }
    return days;
  }, [tasks]);

  const handleToggleTask = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    StorageService.toggleTaskCompletion(taskId);
  };

  const handleReschedule = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    StorageService.rescheduleTask(taskId);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner & Motivation */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg">
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 text-indigo-300 text-xs font-semibold mb-2">
            <span>Welcome back, {currentUser?.name || 'Student'}</span>
            <span aria-hidden="true">·</span>
            <span>Target: {currentUser?.studyPreferences.dailyAvailableHours || 4}h / day</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
            {nextExam
              ? `${nextExam.subjectName} is in ${daysUntilNextExam} day${daysUntilNextExam === 1 ? '' : 's'}`
              : 'Exam Timetable & Spaced Revision Hub'}
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-6">
            {nextExam
              ? `Scheduled on ${nextExam.examDate} at ${nextExam.startTime}. Follow today's spaced review intervals to guarantee long-term retention before exam day.`
              : 'All your exams and subject chapters are synchronized. Generate a customized revision plan to distribute your study load evenly.'}
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenScheduleModal}
              className="px-4 py-2 text-xs font-bold bg-white text-indigo-900 hover:bg-slate-100 rounded-xl transition-all shadow-sm flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-indigo-600" />
              Auto-Generate Revision Timetable
            </button>
            <button
              onClick={onAddExamClick}
              className="px-4 py-2 text-xs font-medium bg-indigo-700/60 hover:bg-indigo-700 text-white rounded-xl transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add Exam
            </button>
          </div>
        </div>

        {/* Ambient graphic icon */}
        <div className="absolute right-6 -bottom-6 opacity-10 pointer-events-none text-white hidden sm:block">
          <GraduationCap className="w-64 h-64" />
        </div>
      </div>

      {/* 4 Primary KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Next Exam Countdown */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium">Nearest Exam</span>
            <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
              {daysUntilNextExam !== null ? `${daysUntilNextExam}d` : 'None'}
            </span>
            <span className="text-xs text-slate-500">countdown</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 truncate">
            {nextExam ? nextExam.examName : 'No upcoming exams'}
          </p>
        </div>

        {/* Today's Tasks */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium">Today's Revision</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
              {todayCompletedCount}/{todayTotalCount}
            </span>
            <span className="text-xs text-slate-500">sessions completed</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-amber-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${todayProgressPercent}%` }}
            />
          </div>
        </div>

        {/* Overall Chapter Preparation */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium">Syllabus Mastery</span>
            <Trophy className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
              {overallPrepPercentage}%
            </span>
            <span className="text-xs text-slate-500">
              ({completedChapters}/{totalChaptersCount} chapters)
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${overallPrepPercentage}%` }}
            />
          </div>
        </div>

        {/* Subjects & Exams */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium">Active Subjects</span>
            <BookOpen className="w-4 h-4 text-purple-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
              {subjects.length}
            </span>
            <span className="text-xs text-slate-500">
              courses ({upcomingExams.length} upcoming exams)
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            {totalCompletedTasks} total revision logs stored
          </p>
        </div>
      </div>

      {/* Middle Grid: Today's Revision Queue & Weekly Study Progress Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Today's Revision Sessions */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Today's Revision Schedule
              </h2>
              <p className="text-xs text-slate-500">
                {todayTasks.length === 0
                  ? 'No revision tasks scheduled for today.'
                  : `${todayCompletedCount} of ${todayTotalCount} focus blocks accomplished.`}
              </p>
            </div>
            <button
              onClick={() => onNavigate('planner')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              Open Daily Planner &rarr;
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-3 shadow-xs">
            {todayTasks.length === 0 ? (
              <div className="text-center py-10 px-4">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  You're all clear for today!
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                  No pending revision sessions remaining on today's calendar. You can review weak topics or generate the next spaced repetition phase.
                </p>
                <button
                  onClick={onOpenScheduleModal}
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl"
                >
                  Generate or Refresh Schedule
                </button>
              </div>
            ) : (
              todayTasks.map((task) => (
                <div
                  key={task.id}
                  className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                    task.isCompleted
                      ? 'bg-slate-50/70 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 opacity-70'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-800'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      type="button"
                      onClick={(e) => handleToggleTask(task.id, e)}
                      title={task.isCompleted ? 'Mark incomplete' : 'Mark completed'}
                      className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-colors shrink-0 ${
                        task.isCompleted
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'border-slate-300 dark:border-slate-700 hover:border-indigo-500'
                      }`}
                    >
                      {task.isCompleted && <CheckCircle2 className="w-4 h-4" />}
                    </button>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-bold text-slate-900 dark:text-slate-100 truncate">
                          {task.subjectName}
                        </span>
                        <span aria-hidden="true" className="text-slate-400">·</span>
                        <span className="text-[11px] font-mono text-slate-500">
                          {task.startTime} – {task.endTime} ({task.durationMinutes}m)
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 truncate mt-0.5">
                        {task.chapterName}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1">
                        <span>{task.revisionType}</span>
                        <span aria-hidden="true">·</span>
                        <span className={task.priority === 'High' ? 'text-rose-500 font-semibold' : ''}>
                          {task.priority} Priority
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {!task.isCompleted && (
                      <button
                        onClick={() => onOpenTimer(task)}
                        className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center gap-1.5 shadow-xs"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        Focus
                      </button>
                    )}
                    <button
                      onClick={(e) => handleReschedule(task.id, e)}
                      title="Reschedule to next available slot"
                      className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Weekly Study Hours Chart */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Weekly Study Progress
              </h2>
              <p className="text-xs text-slate-500">
                Planned vs. actual completed revision hours
              </p>
            </div>
            <button
              onClick={() => onNavigate('analytics')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              All Analytics &rarr;
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} unit="h" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderColor: '#1E293B',
                      borderRadius: '8px',
                      color: '#F8FAFC',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Bar dataKey="plannedHours" name="Planned (hrs)" fill="#94A3B8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="actualHours" name="Completed (hrs)" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Upcoming Exams Timeline & Weak Topic Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Upcoming Exams Strip */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Upcoming Examination Schedule
              </h2>
              <p className="text-xs text-slate-500">
                Chronological timeline with priority indicators
              </p>
            </div>
            <button
              onClick={() => onNavigate('exams')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Manage Exams &rarr;
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 shadow-xs overflow-hidden">
            {upcomingExams.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                No exams scheduled. Click "Add Exam" to register your timetable.
              </div>
            ) : (
              upcomingExams.slice(0, 3).map((exam) => {
                const diff = getDaysDiff(todayStr, exam.examDate);
                return (
                  <div key={exam.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {exam.subjectName}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {exam.examType}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                        {exam.examName}
                      </p>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                        <span>{exam.examDate} at {exam.startTime}</span>
                        {exam.venueOrRoom && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span>{exam.venueOrRoom}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-base font-bold font-mono text-indigo-600 dark:text-indigo-400 block">
                        {diff === 0 ? 'Today!' : `${diff} days`}
                      </span>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                        {exam.difficulty} Difficulty
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Weak Topic & Needs Revision Watchlist */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Reinforcement Watchlist</span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">
                  {weakChapters.length}
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Low-understanding topics flagged for spaced repetition
              </p>
            </div>
            <button
              onClick={() => onNavigate('subjects')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              All Chapters &rarr;
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-3 shadow-xs">
            {weakChapters.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400">
                No weak chapters flagged! All topics have &gt; 3/5 understanding.
              </div>
            ) : (
              weakChapters.slice(0, 3).map((ch) => {
                const subj = subjects.find((s) => s.id === ch.subjectId);
                return (
                  <div
                    key={ch.id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 text-xs flex items-center justify-between"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {subj?.name || 'Subject'}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>Diff: {ch.difficulty}</span>
                      </div>
                      <h4 className="font-semibold text-slate-900 dark:text-white truncate mt-0.5">
                        {ch.chapterName}
                      </h4>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-amber-600 dark:text-amber-400">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Understanding: {ch.understandingLevel}/5</span>
                      </div>
                    </div>

                    <button
                      onClick={() => onNavigate('subjects')}
                      className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-lg shrink-0"
                      title="Inspect chapter"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
