import React, { useState } from 'react';
import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Edit2,
  FolderPlus,
  Plus,
  Star,
  Trash2,
  X,
} from 'lucide-react';
import { Chapter, Difficulty, PreparationStatus, Priority, Subject } from '../types';
import { StorageService } from '../services/storage';

interface SubjectsPageProps {
  subjects: Subject[];
  chapters: Chapter[];
  onOpenScheduleModal: () => void;
}

export const SubjectsPage: React.FC<SubjectsPageProps> = ({
  subjects,
  chapters,
  onOpenScheduleModal,
}) => {
  const [expandedSubjectId, setExpandedSubjectId] = useState<string | null>(subjects[0]?.id || null);

  // Subject Modal states
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [subjectName, setSubjectName] = useState('');
  const [subjectCode, setSubjectCode] = useState('');
  const [subjectColor, setSubjectColor] = useState('#3B82F6');
  const [subjectInstructor, setSubjectInstructor] = useState('');
  const [subjectCreditHours, setSubjectCreditHours] = useState(4);

  // Chapter Modal states
  const [isChapterModalOpen, setIsChapterModalOpen] = useState(false);
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const [targetSubjectId, setTargetSubjectId] = useState<string>('');
  const [chapterName, setChapterName] = useState('');
  const [topicDescription, setTopicDescription] = useState('');
  const [chapterDifficulty, setChapterDifficulty] = useState<Difficulty>('Medium');
  const [chapterImportance, setChapterImportance] = useState<Priority>('High');
  const [chapterStatus, setChapterStatus] = useState<PreparationStatus>('Not Started');
  const [estimatedHours, setEstimatedHours] = useState(3.5);
  const [understandingLevel, setUnderstandingLevel] = useState(3);

  // --- Subject Actions ---
  const openAddSubject = () => {
    setEditingSubject(null);
    setSubjectName('');
    setSubjectCode('');
    setSubjectColor('#3B82F6');
    setSubjectInstructor('');
    setSubjectCreditHours(4);
    setIsSubjectModalOpen(true);
  };

  const openEditSubject = (subj: Subject, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSubject(subj);
    setSubjectName(subj.name);
    setSubjectCode(subj.code);
    setSubjectColor(subj.color);
    setSubjectInstructor(subj.instructor || '');
    setSubjectCreditHours(subj.creditHours || 3);
    setIsSubjectModalOpen(true);
  };

  const handleSaveSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectName.trim()) return;

    const currentUser = StorageService.getCurrentUser();
    const userId = currentUser ? currentUser.id : 'user-student-1';

    const newSubject: Subject = {
      id: editingSubject ? editingSubject.id : `sub-${Date.now()}`,
      userId,
      name: subjectName.trim(),
      code: subjectCode.trim() || 'CRS',
      color: subjectColor,
      instructor: subjectInstructor.trim(),
      creditHours: subjectCreditHours,
    };

    StorageService.saveSubject(newSubject);
    setIsSubjectModalOpen(false);
    if (!expandedSubjectId) setExpandedSubjectId(newSubject.id);
  };

  const handleDeleteSubject = (subjId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Delete this subject and all of its associated chapters, exams, and revision tasks?')) {
      StorageService.deleteSubject(subjId);
      if (expandedSubjectId === subjId) {
        setExpandedSubjectId(null);
      }
    }
  };

  // --- Chapter Actions ---
  const openAddChapter = (subjId: string) => {
    setEditingChapter(null);
    setTargetSubjectId(subjId);
    setChapterName('');
    setTopicDescription('');
    setChapterDifficulty('Medium');
    setChapterImportance('High');
    setChapterStatus('Not Started');
    setEstimatedHours(3.0);
    setUnderstandingLevel(3);
    setIsChapterModalOpen(true);
  };

  const openEditChapter = (ch: Chapter) => {
    setEditingChapter(ch);
    setTargetSubjectId(ch.subjectId);
    setChapterName(ch.chapterName);
    setTopicDescription(ch.topicDescription);
    setChapterDifficulty(ch.difficulty);
    setChapterImportance(ch.importance);
    setChapterStatus(ch.preparationStatus);
    setEstimatedHours(ch.estimatedStudyHours);
    setUnderstandingLevel(ch.understandingLevel);
    setIsChapterModalOpen(true);
  };

  const handleSaveChapter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chapterName.trim() || !targetSubjectId) return;

    const currentUser = StorageService.getCurrentUser();
    const userId = currentUser ? currentUser.id : 'user-student-1';
    const existingChapters = chapters.filter((c) => c.subjectId === targetSubjectId);

    const chapterData: Chapter = {
      id: editingChapter ? editingChapter.id : `chap-${Date.now()}`,
      subjectId: targetSubjectId,
      userId,
      chapterNumber: editingChapter ? editingChapter.chapterNumber : existingChapters.length + 1,
      chapterName: chapterName.trim(),
      topicDescription: topicDescription.trim(),
      difficulty: chapterDifficulty,
      importance: chapterImportance,
      preparationStatus: chapterStatus,
      estimatedStudyHours: estimatedHours,
      understandingLevel,
      revisionCount: editingChapter ? editingChapter.revisionCount : 0,
      lastRevisedDate: editingChapter?.lastRevisedDate,
    };

    StorageService.saveChapter(chapterData);
    setIsChapterModalOpen(false);
  };

  const handleDeleteChapter = (chId: string) => {
    if (window.confirm('Remove this chapter from the syllabus?')) {
      StorageService.deleteChapter(chId);
    }
  };

  const handleQuickStatusChange = (ch: Chapter, newStatus: PreparationStatus) => {
    const updated: Chapter = { ...ch, preparationStatus: newStatus };
    if (newStatus === 'Completed' && updated.understandingLevel < 4) {
      updated.understandingLevel = 4;
    }
    StorageService.saveChapter(updated);
  };

  const handleQuickUnderstandingChange = (ch: Chapter, rating: number) => {
    const updated: Chapter = { ...ch, understandingLevel: rating };
    if (rating <= 2 && updated.preparationStatus === 'Completed') {
      updated.preparationStatus = 'Needs Revision';
    }
    StorageService.saveChapter(updated);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Subjects & Chapter Syllabus
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Organize chapters by importance, difficulty, and understanding level to guide personalized spaced intervals.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={openAddSubject}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-xs flex items-center gap-1.5"
          >
            <FolderPlus className="w-4 h-4" /> Add Subject
          </button>
        </div>
      </div>

      {/* Subjects Accordion List */}
      <div className="space-y-4">
        {subjects.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center">
            <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              No subjects registered
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
              Create your subjects to break down your course materials into manageable chapters.
            </p>
            <button
              onClick={openAddSubject}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl"
            >
              Add First Subject
            </button>
          </div>
        ) : (
          subjects.map((subj) => {
            const subjChapters = chapters.filter((c) => c.subjectId === subj.id);
            const isExpanded = expandedSubjectId === subj.id;
            const completedCount = subjChapters.filter((c) => c.preparationStatus === 'Completed').length;
            const totalCount = subjChapters.length;
            const prepPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

            return (
              <div
                key={subj.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden transition-all"
              >
                {/* Subject Header Bar */}
                <div
                  onClick={() => setExpandedSubjectId(isExpanded ? null : subj.id)}
                  className="p-5 flex items-center justify-between cursor-pointer select-none hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className="w-3.5 h-10 rounded-full shrink-0"
                      style={{ backgroundColor: subj.color || '#4F46E5' }}
                    />

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-500">
                          {subj.code}
                        </span>
                        <span aria-hidden="true" className="text-slate-400">·</span>
                        <h2 className="text-base font-bold text-slate-900 dark:text-white">
                          {subj.name}
                        </h2>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                        {subj.instructor && <span>Instructor: {subj.instructor}</span>}
                        {subj.creditHours && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span>{subj.creditHours} Credits</span>
                          </>
                        )}
                        <span aria-hidden="true">·</span>
                        <span>{totalCount} Chapter{totalCount === 1 ? '' : 's'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    {/* Completion bar */}
                    <div className="hidden sm:block text-right w-36">
                      <div className="flex justify-between text-xs font-mono mb-1">
                        <span className="text-slate-400">Mastery</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {prepPercent}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${prepPercent}%`,
                            backgroundColor: subj.color || '#4F46E5',
                          }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => openEditSubject(subj, e)}
                        className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
                        title="Edit Subject"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteSubject(subj.id, e)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                        title="Delete Subject"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="p-1 text-slate-400">
                        {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Chapters Table */}
                {isExpanded && (
                  <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/40 p-5 space-y-3">
                    <div className="flex items-center justify-between pb-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Course Syllabus & Topics ({subjChapters.length})
                      </h4>
                      <button
                        onClick={() => openAddChapter(subj.id)}
                        className="px-3 py-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:border-indigo-500 flex items-center gap-1 shadow-2xs"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Chapter
                      </button>
                    </div>

                    {subjChapters.length === 0 ? (
                      <div className="text-center py-6 text-xs text-slate-400">
                        No chapters added to this subject yet. Click "Add Chapter" above.
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs">
                        {subjChapters.map((ch) => (
                          <div
                            key={ch.id}
                            className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-900 dark:text-white">
                                  {ch.chapterNumber}. {ch.chapterName}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                                {ch.topicDescription}
                              </p>

                              {/* Metadata line */}
                              <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px] text-slate-500">
                                <span>Diff: {ch.difficulty}</span>
                                <span aria-hidden="true">·</span>
                                <span>Importance: {ch.importance}</span>
                                <span aria-hidden="true">·</span>
                                <span>Est: {ch.estimatedStudyHours} hrs</span>
                                <span aria-hidden="true">·</span>
                                <span>Revised {ch.revisionCount || 0}x</span>
                              </div>
                            </div>

                            {/* Status, Understanding Rating, and Actions */}
                            <div className="flex flex-wrap items-center gap-4 shrink-0">
                              {/* Understanding Rating */}
                              <div className="flex flex-col items-start md:items-end">
                                <span className="text-[10px] text-slate-400 font-medium">
                                  Understanding
                                </span>
                                <div className="flex items-center gap-1 mt-0.5">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                      key={star}
                                      type="button"
                                      onClick={() => handleQuickUnderstandingChange(ch, star)}
                                      className="p-0.5 hover:scale-110 transition-transform"
                                      title={`Set understanding to ${star}/5`}
                                    >
                                      <Star
                                        className={`w-3.5 h-3.5 ${
                                          star <= ch.understandingLevel
                                            ? 'text-amber-400 fill-amber-400'
                                            : 'text-slate-300 dark:text-slate-700'
                                        }`}
                                      />
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* Status Select */}
                              <div>
                                <span className="text-[10px] text-slate-400 font-medium block mb-0.5">
                                  Status
                                </span>
                                <select
                                  value={ch.preparationStatus}
                                  onChange={(e) => handleQuickStatusChange(ch, e.target.value as PreparationStatus)}
                                  className={`text-xs font-semibold px-2.5 py-1 rounded-lg border ${
                                    ch.preparationStatus === 'Completed'
                                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                                      : ch.preparationStatus === 'Needs Revision'
                                      ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300'
                                      : ch.preparationStatus === 'In Progress'
                                      ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300'
                                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                                  }`}
                                >
                                  <option value="Not Started">Not Started</option>
                                  <option value="In Progress">In Progress</option>
                                  <option value="Needs Revision">Needs Revision</option>
                                  <option value="Completed">Completed</option>
                                </select>
                              </div>

                              {/* Chapter Edit / Delete buttons */}
                              <div className="flex items-center gap-1 pt-3 md:pt-0">
                                <button
                                  onClick={() => openEditChapter(ch)}
                                  className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                                  title="Edit Chapter"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteChapter(ch.id)}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40"
                                  title="Delete Chapter"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Subject Modal */}
      {isSubjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingSubject ? 'Edit Subject' : 'Add New Subject'}
              </h3>
              <button
                onClick={() => setIsSubjectModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSubject} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Subject / Course Name
                </label>
                <input
                  type="text"
                  required
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  placeholder="e.g. Molecular Biology & Genetics"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Course Code
                  </label>
                  <input
                    type="text"
                    value={subjectCode}
                    onChange={(e) => setSubjectCode(e.target.value)}
                    placeholder="e.g. BIO 320"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Credit Hours
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={subjectCreditHours}
                    onChange={(e) => setSubjectCreditHours(parseInt(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Instructor / Professor Name
                </label>
                <input
                  type="text"
                  value={subjectInstructor}
                  onChange={(e) => setSubjectInstructor(e.target.value)}
                  placeholder="e.g. Dr. Jennifer Doudna"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Color Accent
                </label>
                <div className="flex items-center gap-2">
                  {['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#E11D48'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setSubjectColor(c)}
                      className={`w-7 h-7 rounded-full transition-transform ${
                        subjectColor === c ? 'scale-125 ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-900' : ''
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsSubjectModalOpen(false)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
                >
                  Save Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Chapter Modal */}
      {isChapterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingChapter ? 'Edit Chapter Topic' : 'Add Chapter to Syllabus'}
              </h3>
              <button
                onClick={() => setIsChapterModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveChapter} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Chapter / Topic Name
                </label>
                <input
                  type="text"
                  required
                  value={chapterName}
                  onChange={(e) => setChapterName(e.target.value)}
                  placeholder="e.g. CRISPR-Cas9 & Gene Editing Mechanisms"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Key Concepts / Topic Summary
                </label>
                <textarea
                  rows={2}
                  value={topicDescription}
                  onChange={(e) => setTopicDescription(e.target.value)}
                  placeholder="Guide RNA design, double strand break repair pathways, off-target assays..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Difficulty Level
                  </label>
                  <select
                    value={chapterDifficulty}
                    onChange={(e) => setChapterDifficulty(e.target.value as Difficulty)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Exam Importance
                  </label>
                  <select
                    value={chapterImportance}
                    onChange={(e) => setChapterImportance(e.target.value as Priority)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Est. Study Hours
                  </label>
                  <input
                    type="number"
                    min="0.5"
                    max="30"
                    step="0.5"
                    value={estimatedHours}
                    onChange={(e) => setEstimatedHours(parseFloat(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Initial Preparation Status
                  </label>
                  <select
                    value={chapterStatus}
                    onChange={(e) => setChapterStatus(e.target.value as PreparationStatus)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="Not Started">Not Started</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Needs Revision">Needs Revision</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Current Understanding ({understandingLevel}/5)
                  </label>
                  <div className="flex items-center gap-2 pt-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setUnderstandingLevel(s)}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            s <= understandingLevel
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-300 dark:text-slate-700'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsChapterModalOpen(false)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
                >
                  Save Chapter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
