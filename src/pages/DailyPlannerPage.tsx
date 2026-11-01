import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Edit3,
  Flame,
  Play,
  Plus,
  RefreshCw,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import { Chapter, RevisionTask, RevisionType, Subject } from '../types';
import { addDays, formatDate, getDaysDiff } from '../utils/scheduler';
import { StorageService } from '../services/storage';

interface DailyPlannerPageProps {
  tasks: RevisionTask[];
  subjects: Subject[];
  chapters: Chapter[];
  onOpenTimer: (task: RevisionTask) => void;
  onOpenScheduleModal: () => void;
}

export const DailyPlannerPage: React.FC<DailyPlannerPageProps> = ({
  tasks,
  subjects,
  chapters,
  onOpenTimer,
  onOpenScheduleModal,
}) => {
  const todayStr = formatDate(new Date());
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  // New/Edit task modal
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<RevisionTask | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState(subjects[0]?.id || '');
  const [selectedChapterId, setSelectedChapterId] = useState('');
  const [startTime, setStartTime] = useState('10:00');
  const [durationMinutes, setDurationMinutes] = useState(50);
  const [revisionType, setRevisionType] = useState<RevisionType>('Initial Study');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('High');

  // Filter tasks for selected date
  const dateTasks = tasks
    .filter((t) => t.scheduledDate === selectedDate)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  // Missed tasks from past dates that are incomplete
  const missedTasks = tasks.filter((t) => t.scheduledDate < todayStr && !t.isCompleted);

  const completedCount = dateTasks.filter((t) => t.isCompleted).length;
  const totalCount = dateTasks.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const totalStudyMinutesPlanned = dateTasks.reduce((sum, t) => sum + (t.durationMinutes || 45), 0);
  const totalStudyMinutesDone = dateTasks
    .filter((t) => t.isCompleted)
    .reduce((sum, t) => sum + (t.actualDurationMinutes || t.durationMinutes || 45), 0);

  const handlePrevDay = () => setSelectedDate(addDays(selectedDate, -1));
  const handleNextDay = () => setSelectedDate(addDays(selectedDate, 1));
  const handleToday = () => setSelectedDate(todayStr);

  const handleToggleComplete = (taskId: string) => {
    StorageService.toggleTaskCompletion(taskId);
  };

  const handleReschedule = (taskId: string) => {
    StorageService.rescheduleTask(taskId);
  };

  const openAddTask = () => {
    setEditingTask(null);
    const initialSubj = subjects[0]?.id || '';
    setSelectedSubjectId(initialSubj);
    const firstChap = chapters.find((c) => c.subjectId === initialSubj)?.id || '';
    setSelectedChapterId(firstChap);
    setStartTime('14:00');
    setDurationMinutes(50);
    setRevisionType('Initial Study');
    setPriority('High');
    setIsTaskModalOpen(true);
  };

  const openEditTask = (t: RevisionTask) => {
    setEditingTask(t);
    setSelectedSubjectId(t.subjectId);
    setSelectedChapterId(t.chapterId);
    setStartTime(t.startTime);
    setDurationMinutes(t.durationMinutes);
    setRevisionType(t.revisionType);
    setPriority(t.priority);
    setIsTaskModalOpen(true);
  };

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    const subj = subjects.find((s) => s.id === selectedSubjectId);
    const chap = chapters.find((c) => c.id === selectedChapterId);
    if (!subj || !chap) return;

    const [hh, mm] = startTime.split(':').map(Number);
    const endMinutes = hh * 60 + mm + durationMinutes;
    const endHH = Math.floor(endMinutes / 60) % 24;
    const endMM = endMinutes % 60;
    const endTime = `${String(endHH).padStart(2, '0')}:${String(endMM).padStart(2, '0')}`;

    const taskObj: RevisionTask = {
      id: editingTask ? editingTask.id : `task-${Date.now()}`,
      userId: subj.userId,
      subjectId: subj.id,
      subjectName: subj.name,
      subjectColor: subj.color,
      chapterId: chap.id,
      chapterName: chap.chapterName,
      scheduledDate: selectedDate,
      startTime,
      endTime,
      durationMinutes,
      revisionType,
      priority,
      isCompleted: editingTask ? editingTask.isCompleted : false,
    };

    StorageService.saveTask(taskObj);
    setIsTaskModalOpen(false);
  };

  const handleDeleteTask = (taskId: string) => {
    if (window.confirm('Remove this session from your planner?')) {
      const allTasks = StorageService.getTasks().filter((t) => t.id !== taskId);
      localStorage.setItem('exam_planner_tasks', JSON.stringify(allTasks));
      StorageService.init();
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Daily Revision Timetable
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Focus sessions mapped with spaced intervals. Track active study time and reschedule missed blocks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenScheduleModal}
            className="px-4 py-2 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 rounded-xl transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" /> Re-balance Schedule
          </button>
          <button
            onClick={openAddTask}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-xs flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add Focus Block
          </button>
        </div>
      </div>

      {/* Missed Tasks Alert Banner if any exist */}
      {missedTasks.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <RefreshCw className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-amber-900 dark:text-amber-200">
                {missedTasks.length} Missed Revision Session{missedTasks.length > 1 ? 's' : ''} Detected
              </span>
              <p className="text-amber-800/80 dark:text-amber-300/80 mt-0.5">
                Past sessions were not marked as finished. Use 1-click reschedule to automatically place them into the next open slots.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                missedTasks.forEach((mt) => StorageService.rescheduleTask(mt.id));
              }}
              className="px-3.5 py-1.5 font-semibold text-amber-900 dark:text-amber-100 bg-amber-200/80 dark:bg-amber-900/60 hover:bg-amber-300 rounded-lg transition-colors"
            >
              Reschedule All Missed Tasks
            </button>
          </div>
        </div>
      )}

      {/* Date Navigation & Stats Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Date Selector */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevDay}
            className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Previous Day"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="text-xs font-bold font-mono px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
            />
            {selectedDate !== todayStr && (
              <button
                onClick={handleToday}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline px-2 py-0.5"
              >
                Go to Today
              </button>
            )}
          </div>

          <button
            onClick={handleNextDay}
            className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Next Day"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Daily Summary Metrics */}
        <div className="flex flex-wrap items-center gap-6 text-xs text-slate-600 dark:text-slate-400">
          <div>
            <span className="text-slate-400">Target Time:</span>{' '}
            <span className="font-mono font-bold text-slate-900 dark:text-white">
              {(totalStudyMinutesPlanned / 60).toFixed(1)} hrs
            </span>
          </div>

          <div>
            <span className="text-slate-400">Logged:</span>{' '}
            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
              {(totalStudyMinutesDone / 60).toFixed(1)} hrs
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400">Completion:</span>
            <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
              {progressPercent}%
            </span>
            <div className="w-20 bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Timetable Schedule Cards */}
      <div className="space-y-3">
        {dateTasks.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center shadow-xs">
            <CheckCircle2 className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              No revision sessions scheduled for {selectedDate}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">
              Enjoy your scheduled rest or auto-generate a comprehensive revision timetable for upcoming exams.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={openAddTask}
                className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl"
              >
                Add Manual Study Task
              </button>
              <button
                onClick={onOpenScheduleModal}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl"
              >
                Auto-Schedule Revision
              </button>
            </div>
          </div>
        ) : (
          dateTasks.map((task) => (
            <div
              key={task.id}
              className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                task.isCompleted
                  ? 'bg-slate-50/80 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800/80 opacity-75'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:shadow-xs'
              }`}
            >
              {/* Left check & info */}
              <div className="flex items-start gap-4 min-w-0 flex-1">
                <button
                  type="button"
                  onClick={() => handleToggleComplete(task.id)}
                  title={task.isCompleted ? 'Mark incomplete' : 'Mark completed'}
                  className={`w-7 h-7 rounded-xl border flex items-center justify-center transition-colors shrink-0 mt-0.5 ${
                    task.isCompleted
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : 'border-slate-300 dark:border-slate-700 hover:border-indigo-500'
                  }`}
                >
                  {task.isCompleted && <CheckCircle2 className="w-4 h-4" />}
                </button>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: task.subjectColor || '#4F46E5' }}
                    />
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {task.subjectName}
                    </h3>
                    <span aria-hidden="true" className="text-slate-400">·</span>
                    <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                      {task.revisionType}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300 font-medium mt-1">
                    {task.chapterName}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 mt-2">
                    <span className="flex items-center gap-1 font-mono">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {task.startTime} – {task.endTime} ({task.durationMinutes} min)
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className={task.priority === 'High' ? 'text-rose-500 font-semibold' : ''}>
                      {task.priority} Priority
                    </span>
                    {task.actualDurationMinutes && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-mono">
                          Logged: {task.actualDurationMinutes}m
                        </span>
                      </>
                    )}
                    {task.notes && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="italic text-slate-400 truncate max-w-xs">{task.notes}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Action buttons */}
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                {!task.isCompleted && (
                  <button
                    onClick={() => onOpenTimer(task)}
                    className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    Start Session
                  </button>
                )}

                <button
                  onClick={() => handleReschedule(task.id)}
                  title="Reschedule to next available slot"
                  className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>

                <button
                  onClick={() => openEditTask(task)}
                  title="Edit task slot"
                  className="p-2 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <Edit3 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleDeleteTask(task.id)}
                  title="Delete task"
                  className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Task Modal */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingTask ? 'Edit Focus Session' : 'Add Study Session'}
              </h3>
              <button
                onClick={() => setIsTaskModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTask} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Subject
                </label>
                <select
                  value={selectedSubjectId}
                  onChange={(e) => {
                    setSelectedSubjectId(e.target.value);
                    const firstChap = chapters.find((c) => c.subjectId === e.target.value)?.id || '';
                    setSelectedChapterId(firstChap);
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Chapter Topic
                </label>
                <select
                  value={selectedChapterId}
                  onChange={(e) => setSelectedChapterId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  {chapters
                    .filter((c) => c.subjectId === selectedSubjectId)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.chapterNumber}. {c.chapterName}
                      </option>
                    ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    min="15"
                    max="180"
                    step="5"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(parseInt(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Revision Type
                  </label>
                  <select
                    value={revisionType}
                    onChange={(e) => setRevisionType(e.target.value as RevisionType)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="Initial Study">Initial Study</option>
                    <option value="1st Spaced Review (Day 1)">1st Spaced Review (Day 1)</option>
                    <option value="2nd Spaced Review (Day 3)">2nd Spaced Review (Day 3)</option>
                    <option value="3rd Spaced Review (Day 7)">3rd Spaced Review (Day 7)</option>
                    <option value="4th Spaced Review (Day 14)">4th Spaced Review (Day 14)</option>
                    <option value="High-Yield Recap">High-Yield Recap</option>
                    <option value="Mock / Past Paper Drill">Mock / Past Paper Drill</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Task Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsTaskModalOpen(false)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
