import React, { useState } from 'react';
import {
  AlertTriangle,
  Calendar,
  Clock,
  Edit2,
  Filter,
  MapPin,
  Plus,
  Search,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import { Difficulty, Exam, ExamType, Priority, Subject } from '../types';
import { formatDate, getDaysDiff } from '../utils/scheduler';
import { StorageService } from '../services/storage';

interface ExamsPageProps {
  exams: Exam[];
  subjects: Subject[];
  onOpenScheduleModal: () => void;
}

export const ExamsPage: React.FC<ExamsPageProps> = ({
  exams,
  subjects,
  onOpenScheduleModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date_asc' | 'date_desc' | 'priority'>('date_asc');
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [examName, setExamName] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [examDate, setExamDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [durationMinutes, setDurationMinutes] = useState(120);
  const [examType, setExamType] = useState<ExamType>('Midterm');
  const [difficulty, setDifficulty] = useState<Difficulty>('Medium');
  const [priority, setPriority] = useState<Priority>('High');
  const [targetScore, setTargetScore] = useState<number>(90);
  const [venueOrRoom, setVenueOrRoom] = useState('');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const todayStr = formatDate(new Date());

  const openAddModal = () => {
    setEditingExam(null);
    setExamName('');
    setSubjectId(subjects[0]?.id || '');
    setExamDate(formatDate(new Date(Date.now() + 7 * 86400000)));
    setStartTime('09:30');
    setDurationMinutes(120);
    setExamType('Midterm');
    setDifficulty('Medium');
    setPriority('High');
    setTargetScore(90);
    setVenueOrRoom('');
    setNotes('');
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (exam: Exam) => {
    setEditingExam(exam);
    setExamName(exam.examName);
    setSubjectId(exam.subjectId);
    setExamDate(exam.examDate);
    setStartTime(exam.startTime);
    setDurationMinutes(exam.durationMinutes);
    setExamType(exam.examType);
    setDifficulty(exam.difficulty);
    setPriority(exam.priority);
    setTargetScore(exam.targetScore || 90);
    setVenueOrRoom(exam.venueOrRoom || '');
    setNotes(exam.notes || '');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSaveExam = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!examName.trim()) {
      setFormError('Please enter an exam title.');
      return;
    }
    if (!subjectId) {
      setFormError('Please select or create a subject first.');
      return;
    }
    if (!examDate) {
      setFormError('Please select an exam date.');
      return;
    }

    const selectedSubject = subjects.find((s) => s.id === subjectId);
    const subjectName = selectedSubject ? selectedSubject.name : 'Unknown Subject';

    const currentUser = StorageService.getCurrentUser();
    const userId = currentUser ? currentUser.id : 'user-student-1';

    const examData: Exam = {
      id: editingExam ? editingExam.id : `exam-${Date.now()}`,
      userId,
      examName: examName.trim(),
      subjectId,
      subjectName,
      examDate,
      startTime,
      durationMinutes,
      examType,
      difficulty,
      priority,
      targetScore,
      venueOrRoom: venueOrRoom.trim(),
      notes: notes.trim(),
    };

    StorageService.saveExam(examData);
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this exam? Associated revision tasks will also be removed.')) {
      StorageService.deleteExam(id);
    }
  };

  // Filter & Sort
  const filteredExams = exams
    .filter((e) => {
      const matchSearch =
        e.examName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.subjectName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchDiff = filterDifficulty === 'all' || e.difficulty === filterDifficulty;
      return matchSearch && matchDiff;
    })
    .sort((a, b) => {
      if (sortBy === 'date_asc') return a.examDate.localeCompare(b.examDate);
      if (sortBy === 'date_desc') return b.examDate.localeCompare(a.examDate);
      if (sortBy === 'priority') {
        const order = { High: 3, Medium: 2, Low: 1 };
        return order[b.priority] - order[a.priority];
      }
      return 0;
    });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Examination Schedule & Deadlines
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Maintain your exam dates, test venues, and difficulty priorities to drive the revision algorithm.
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
            onClick={openAddModal}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-xs flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add Examination
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-3 items-center justify-between shadow-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search exam or subject name..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <span>Difficulty:</span>
          </div>
          <select
            value={filterDifficulty}
            onChange={(e) => setFilterDifficulty(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300"
          >
            <option value="all">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300"
          >
            <option value="date_asc">Earliest Exam Date</option>
            <option value="date_desc">Latest Exam Date</option>
            <option value="priority">Highest Priority</option>
          </select>
        </div>
      </div>

      {/* Exams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredExams.length === 0 ? (
          <div className="col-span-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center">
            <Calendar className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              No examinations found
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
              {searchQuery ? 'Try adjusting your search criteria.' : 'Create your first exam to begin scheduling smart spaced revisions.'}
            </p>
            <button
              onClick={openAddModal}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl"
            >
              Add Examination
            </button>
          </div>
        ) : (
          filteredExams.map((exam) => {
            const diffDays = getDaysDiff(todayStr, exam.examDate);
            const isPast = diffDays < 0;
            const isImminent = diffDays >= 0 && diffDays <= 5;

            return (
              <div
                key={exam.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-all"
              >
                <div>
                  {/* Top tags */}
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                      {exam.subjectName}
                    </span>
                    <span className="text-slate-500 font-mono text-[11px]">
                      {exam.examType}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                    {exam.examName}
                  </h3>

                  {/* Date & Time */}
                  <div className="mt-3 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-medium">{exam.examDate}</span>
                      <span aria-hidden="true" className="text-slate-400">·</span>
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{exam.startTime} ({exam.durationMinutes} min)</span>
                    </div>

                    {exam.venueOrRoom && (
                      <div className="flex items-center gap-2 text-slate-500">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span className="truncate">{exam.venueOrRoom}</span>
                      </div>
                    )}
                  </div>

                  {exam.notes && (
                    <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 bg-slate-50 dark:bg-slate-950 p-2 rounded-lg">
                      {exam.notes}
                    </p>
                  )}

                  {/* Metadata line without pills */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                    <div>
                      <span>Diff: {exam.difficulty}</span>
                      <span aria-hidden="true" className="mx-1.5">·</span>
                      <span className={exam.priority === 'High' ? 'text-rose-500 font-medium' : ''}>
                        {exam.priority} Priority
                      </span>
                    </div>
                    {exam.targetScore && (
                      <span className="font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                        Target: {exam.targetScore}%
                      </span>
                    )}
                  </div>
                </div>

                {/* Bottom Row */}
                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    {isPast ? (
                      <span className="text-xs font-medium text-slate-400">
                        Exam Concluded
                      </span>
                    ) : diffDays === 0 ? (
                      <span className="text-xs font-bold text-rose-600 animate-pulse">
                        Exam is Today!
                      </span>
                    ) : (
                      <span
                        className={`text-xs font-bold font-mono ${
                          isImminent ? 'text-amber-600 dark:text-amber-400' : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {diffDays} days left
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(exam)}
                      className="p-1.5 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Edit Exam"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(exam.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="Delete Exam"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Exam Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingExam ? 'Edit Examination' : 'Register New Examination'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveExam} className="p-6 space-y-4 text-xs">
              {formError && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 rounded-lg flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Exam Title / Description
                </label>
                <input
                  type="text"
                  required
                  value={examName}
                  onChange={(e) => setExamName(e.target.value)}
                  placeholder="e.g. Algorithms & Data Structures Final"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Subject / Course
                  </label>
                  <select
                    value={subjectId}
                    onChange={(e) => setSubjectId(e.target.value)}
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
                    Exam Type
                  </label>
                  <select
                    value={examType}
                    onChange={(e) => setExamType(e.target.value as ExamType)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="Final Exam">Final Exam</option>
                    <option value="Midterm">Midterm</option>
                    <option value="Unit Test">Unit Test</option>
                    <option value="Practical / Lab">Practical / Lab</option>
                    <option value="Board Exam">Board Exam</option>
                    <option value="Certification">Certification</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Exam Date
                  </label>
                  <input
                    type="date"
                    required
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

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
                    min="30"
                    max="360"
                    step="15"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(parseInt(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Subject Difficulty
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="Easy">Easy (1.0x)</option>
                    <option value="Medium">Medium (1.25x)</option>
                    <option value="Hard">Hard (1.6x)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Exam Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as Priority)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Target Score (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={targetScore}
                    onChange={(e) => setTargetScore(parseInt(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Venue / Examination Hall
                </label>
                <input
                  type="text"
                  value={venueOrRoom}
                  onChange={(e) => setVenueOrRoom(e.target.value)}
                  placeholder="e.g. Science Complex Hall 2B, Desk 42"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Exam Focus & Notes
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Topics emphasized by professor, formula sheets allowed, etc."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
                >
                  {editingExam ? 'Save Changes' : 'Register Exam'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
