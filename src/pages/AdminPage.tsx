import React, { useState } from 'react';
import {
  Activity,
  Award,
  CheckCircle2,
  Database,
  GraduationCap,
  RefreshCw,
  Search,
  ShieldCheck,
  UserCheck,
  Users,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { StorageService } from '../services/storage';

export const AdminPage: React.FC = () => {
  const { switchUser } = useAuth();
  const [search, setSearch] = useState('');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const users = StorageService.getUsers();
  const exams = StorageService.getExams();
  const tasks = StorageService.getTasks();
  const sessions = StorageService.getStudySessions();

  const studentUsers = users.filter((u) => u.role === 'STUDENT');
  const filteredStudents = studentUsers.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      (s.schoolOrUniversity && s.schoolOrUniversity.toLowerCase().includes(search.toLowerCase()))
  );

  const handleResetData = () => {
    if (window.confirm('Reset all demo exams, chapters, and tasks back to initial seed data?')) {
      StorageService.resetToDefaults();
      setActionNotice('Database restored to default demo state.');
      try {
        confetti({ particleCount: 50, spread: 60 });
      } catch (e) {}
      setTimeout(() => setActionNotice(null), 3500);
    }
  };

  const handleSwitchToStudent = (userId: string) => {
    switchUser(userId);
    setActionNotice(`Switched active view to student ID: ${userId}`);
    setTimeout(() => setActionNotice(null), 3000);
  };

  const handleSimulateResetPassword = (email: string) => {
    setActionNotice(`Password reset instructions with temporary JWT token dispatched to ${email}`);
    setTimeout(() => setActionNotice(null), 4000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-600 dark:text-amber-400">
            <ShieldCheck className="w-4 h-4" />
            <span>Academic Administrator Portal</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1">
            System Administration & Student Directory
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Monitor registered students, global revision completion rates, and platform database state.
          </p>
        </div>

        <button
          onClick={handleResetData}
          className="px-4 py-2 text-xs font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/40 rounded-xl transition-colors flex items-center gap-1.5 shrink-0"
        >
          <Database className="w-4 h-4" /> Reset Demo Database
        </button>
      </div>

      {actionNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* 4 Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Registered Students</span>
            <Users className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
            {studentUsers.length}
          </div>
          <span className="text-xs text-slate-500">active student accounts</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Examinations Tracked</span>
            <GraduationCap className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
            {exams.length}
          </div>
          <span className="text-xs text-slate-500">across all registered courses</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Scheduled Revision Blocks</span>
            <Activity className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
            {tasks.length}
          </div>
          <span className="text-xs text-slate-500">spaced repetition sessions</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Recorded Focus Sessions</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
            {sessions.length}
          </div>
          <span className="text-xs text-slate-500">completed focus blocks</span>
        </div>
      </div>

      {/* Student Management Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Student Directory & Performance Overview
            </h3>
            <p className="text-xs text-slate-500">
              Select any student to audit their revision schedule or trigger administrative operations.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search student or school..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/60 dark:bg-slate-950/40 text-slate-500 border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="px-5 py-3 font-semibold">Student Name</th>
                <th className="px-5 py-3 font-semibold">Institution</th>
                <th className="px-5 py-3 font-semibold">Daily Availability</th>
                <th className="px-5 py-3 font-semibold">Registered Exams</th>
                <th className="px-5 py-3 font-semibold">Scheduled Sessions</th>
                <th className="px-5 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredStudents.map((st) => {
                const stExamsCount = exams.filter((e) => e.userId === st.id).length;
                const stTasksCount = tasks.filter((t) => t.userId === st.id).length;

                return (
                  <tr key={st.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
                          {st.avatarUrl ? (
                            <img src={st.avatarUrl} alt={st.name} className="w-full h-full object-cover" />
                          ) : (
                            st.name.charAt(0)
                          )}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white block">
                            {st.name}
                          </span>
                          <span className="text-[11px] text-slate-400">{st.email}</span>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300">
                      {st.schoolOrUniversity || 'Independent Learner'}
                    </td>

                    <td className="px-5 py-3.5 font-mono text-slate-700 dark:text-slate-300">
                      {st.studyPreferences.dailyAvailableHours} hrs / day
                    </td>

                    <td className="px-5 py-3.5 font-mono text-slate-700 dark:text-slate-300">
                      {stExamsCount}
                    </td>

                    <td className="px-5 py-3.5 font-mono text-slate-700 dark:text-slate-300">
                      {stTasksCount}
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleSwitchToStudent(st.id)}
                          className="px-2.5 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 rounded-md transition-colors"
                        >
                          View Timetable
                        </button>
                        <button
                          onClick={() => handleSimulateResetPassword(st.email)}
                          className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 rounded-md"
                        >
                          Reset Password
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
