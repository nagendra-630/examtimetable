import React from 'react';
import {
  AlertTriangle,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Flame,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Chapter, Exam, RevisionTask, StudySessionLog, Subject } from '../types';
import { formatDate } from '../utils/scheduler';
import { StorageService } from '../services/storage';

interface AnalyticsPageProps {
  exams: Exam[];
  subjects: Subject[];
  chapters: Chapter[];
  tasks: RevisionTask[];
  onOpenScheduleModal: () => void;
  onNavigate: (tab: string) => void;
}

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({
  exams,
  subjects,
  chapters,
  tasks,
  onOpenScheduleModal,
  onNavigate,
}) => {
  const sessions = StorageService.getStudySessions();

  // Metrics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.isCompleted).length;
  const revisionCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const totalStudyMinutes = sessions.reduce((sum, s) => sum + s.durationMinutes, 0);
  const totalStudyHours = (totalStudyMinutes / 60).toFixed(1);

  // Status breakdown of chapters
  const statusCounts = {
    Completed: chapters.filter((c) => c.preparationStatus === 'Completed').length,
    'In Progress': chapters.filter((c) => c.preparationStatus === 'In Progress').length,
    'Needs Revision': chapters.filter((c) => c.preparationStatus === 'Needs Revision').length,
    'Not Started': chapters.filter((c) => c.preparationStatus === 'Not Started').length,
  };

  const statusPieData = [
    { name: 'Completed', value: statusCounts.Completed, color: '#10B981' },
    { name: 'In Progress', value: statusCounts['In Progress'], color: '#3B82F6' },
    { name: 'Needs Revision', value: statusCounts['Needs Revision'], color: '#F59E0B' },
    { name: 'Not Started', value: statusCounts['Not Started'], color: '#94A3B8' },
  ];

  // Subject-wise preparation data
  const subjectChartData = subjects.map((subj) => {
    const subjChapters = chapters.filter((c) => c.subjectId === subj.id);
    const completed = subjChapters.filter((c) => c.preparationStatus === 'Completed').length;
    const total = subjChapters.length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      name: subj.code || subj.name.substring(0, 10),
      fullName: subj.name,
      mastery: percent,
      completed,
      total,
      color: subj.color,
    };
  });

  // Daily study hours history over the past 7 days
  const dailyHoursData = React.useMemo(() => {
    const list: { date: string; dayName: string; hours: number }[] = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dStr = formatDate(d);

      const daySessions = sessions.filter((s) => s.date === dStr);
      const min = daySessions.reduce((sum, s) => sum + s.durationMinutes, 0);

      list.push({
        date: dStr,
        dayName: i === 0 ? 'Today' : dayNames[d.getDay()],
        hours: parseFloat((min / 60).toFixed(1)),
      });
    }
    return list;
  }, [sessions]);

  // Weak chapters list
  const weakChapters = chapters.filter(
    (c) => c.understandingLevel <= 2 || c.preparationStatus === 'Needs Revision'
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Revision Progress & Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time tracking of spaced repetition intervals, mastery curves, and time allocation.
          </p>
        </div>

        <button
          onClick={onOpenScheduleModal}
          className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-xs flex items-center gap-1.5 shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5" /> Re-balance Schedule
        </button>
      </div>

      {/* 4 Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Revision Completion</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
            {revisionCompletionRate}%
          </div>
          <span className="text-xs text-slate-500">
            {completedTasks} of {totalTasks} scheduled sessions
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Total Study Time Logged</span>
            <Clock className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
            {totalStudyHours} hrs
          </div>
          <span className="text-xs text-slate-500">
            across {sessions.length} recorded focus blocks
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Syllabus Covered</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
            {statusCounts.Completed}/{chapters.length}
          </div>
          <span className="text-xs text-slate-500">
            chapters marked completely mastered
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Needs Attention</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400">
            {weakChapters.length}
          </div>
          <span className="text-xs text-slate-500">
            topics flagged with &le; 2/5 understanding
          </span>
        </div>
      </div>

      {/* Main Charts: Subject Mastery & Daily Hours Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Subject-Wise Mastery Bar Chart */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Subject-Wise Preparation Level (%)
              </h3>
              <p className="text-xs text-slate-500">
                Percentage of chapters completed per course
              </p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjectChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} unit="%" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#1E293B',
                    borderRadius: '8px',
                    color: '#F8FAFC',
                    fontSize: '12px',
                  }}
                  formatter={(val: any, _name: any, item: any) => [
                    `${val}% (${item.payload.completed}/${item.payload.total} chapters)`,
                    item.payload.fullName,
                  ]}
                />
                <Bar dataKey="mastery" name="Mastery" radius={[4, 4, 0, 0]} fill="#4F46E5" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chapter Status Breakdown Pie Chart */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Syllabus Status Distribution
            </h3>
            <p className="text-xs text-slate-500">
              Breakdown across all registered chapters
            </p>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {statusPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#1E293B',
                    borderRadius: '8px',
                    color: '#F8FAFC',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Daily Study Time Area Chart & Weak Topics Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Past 7 Days Study Hours Area Chart */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Daily Study Hours History
            </h3>
            <p className="text-xs text-slate-500">
              Actual study hours logged over the last 7 days
            </p>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyHoursData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                <XAxis dataKey="dayName" tick={{ fontSize: 11 }} />
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
                <Area
                  type="monotone"
                  dataKey="hours"
                  name="Study Hours"
                  stroke="#4F46E5"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorHours)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Focus & Weak Topics */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Priority Reinforcement Focus</span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300">
                  {weakChapters.length} Weak Topics
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Topics requiring additional spaced reviews before exam day
              </p>
            </div>
            <button
              onClick={() => onNavigate('subjects')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Update Chapters &rarr;
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-60 overflow-y-auto">
            {weakChapters.length === 0 ? (
              <div className="text-center py-10 text-xs text-slate-400">
                Outstanding! No weak chapters currently detected.
              </div>
            ) : (
              weakChapters.map((ch) => {
                const s = subjects.find((sub) => sub.id === ch.subjectId);
                return (
                  <div key={ch.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900 dark:text-white truncate">
                          {ch.chapterName}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500">
                        {s?.name || 'Subject'} · Diff: {ch.difficulty} · Imp: {ch.importance}
                      </span>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold text-amber-600 dark:text-amber-400 font-mono">
                        {ch.understandingLevel}/5
                      </span>
                      <span className="text-[10px] text-slate-400 block">understanding</span>
                    </div>
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
