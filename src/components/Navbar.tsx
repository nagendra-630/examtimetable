import React, { useState } from 'react';
import {
  Bell,
  Calendar,
  CheckSquare,
  GraduationCap,
  LayoutDashboard,
  Moon,
  Sparkles,
  Sun,
  User as UserIcon,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AppNotification } from '../types';

interface NavbarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  notifications: AppNotification[];
  onOpenNotifications: () => void;
  onOpenScheduleModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onNavigate,
  notifications,
  onOpenNotifications,
  onOpenScheduleModal,
}) => {
  const { currentUser, role, theme, toggleTheme, logout, switchUser, openAuthModal } = useAuth();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element brand wordmark */}
        <button
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-2.5 text-left group shrink-0"
        >
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
            <GraduationCap className="w-5 h-5" />
          </div>
          <span className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
            ExamPlanner
          </span>
        </button>

        {/* Zone 2: 4-5 concise single-line navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
          <button
            onClick={() => onNavigate('dashboard')}
            className={`whitespace-nowrap transition-colors flex items-center gap-1.5 py-1 ${
              currentTab === 'dashboard'
                ? 'text-indigo-600 dark:text-indigo-400 font-semibold border-b-2 border-indigo-600 dark:border-indigo-400'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </button>

          <button
            onClick={() => onNavigate('exams')}
            className={`whitespace-nowrap transition-colors flex items-center gap-1.5 py-1 ${
              currentTab === 'exams'
                ? 'text-indigo-600 dark:text-indigo-400 font-semibold border-b-2 border-indigo-600 dark:border-indigo-400'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            Exams
          </button>

          <button
            onClick={() => onNavigate('subjects')}
            className={`whitespace-nowrap transition-colors flex items-center gap-1.5 py-1 ${
              currentTab === 'subjects'
                ? 'text-indigo-600 dark:text-indigo-400 font-semibold border-b-2 border-indigo-600 dark:border-indigo-400'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            Subjects
          </button>

          <button
            onClick={() => onNavigate('planner')}
            className={`whitespace-nowrap transition-colors flex items-center gap-1.5 py-1 ${
              currentTab === 'planner'
                ? 'text-indigo-600 dark:text-indigo-400 font-semibold border-b-2 border-indigo-600 dark:border-indigo-400'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            Planner
          </button>

          <button
            onClick={() => onNavigate('calendar')}
            className={`whitespace-nowrap transition-colors flex items-center gap-1.5 py-1 ${
              currentTab === 'calendar'
                ? 'text-indigo-600 dark:text-indigo-400 font-semibold border-b-2 border-indigo-600 dark:border-indigo-400'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Calendar
          </button>

          <button
            onClick={() => onNavigate('analytics')}
            className={`whitespace-nowrap transition-colors flex items-center gap-1.5 py-1 ${
              currentTab === 'analytics'
                ? 'text-indigo-600 dark:text-indigo-400 font-semibold border-b-2 border-indigo-600 dark:border-indigo-400'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            Analytics
          </button>

          {role === 'ADMIN' && (
            <button
              onClick={() => onNavigate('admin')}
              className={`whitespace-nowrap transition-colors flex items-center gap-1.5 py-1 ${
                currentTab === 'admin'
                  ? 'text-indigo-600 dark:text-indigo-400 font-semibold border-b-2 border-indigo-600 dark:border-indigo-400'
                  : 'text-amber-600 dark:text-amber-400 hover:text-amber-700'
              }`}
            >
              Admin
            </button>
          )}
        </nav>

        {/* Zone 3: 1 primary action cluster */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Smart Generate Button */}
          <button
            onClick={onOpenScheduleModal}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors whitespace-nowrap shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Auto-Schedule
          </button>

          {/* Notification Bell */}
          <button
            onClick={onOpenNotifications}
            title="Notifications"
            className="relative p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500" />
            )}
          </button>

          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* User Profile / Quick Switch */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-2 p-1 pl-2 text-left rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="hidden lg:block text-right">
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate max-w-[120px]">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">
                    {currentUser.role}
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-xs ring-1 ring-slate-200 dark:ring-slate-700 overflow-hidden">
                  {currentUser.avatarUrl ? (
                    <img
                      src={currentUser.avatarUrl}
                      alt={currentUser.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    currentUser.name.charAt(0)
                  )}
                </div>
              </button>

              {/* Profile dropdown */}
              {isProfileMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-1.5 z-50 text-xs"
                  onClick={() => setIsProfileMenuOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                    <p className="font-semibold text-slate-900 dark:text-white truncate">
                      {currentUser.name}
                    </p>
                    <p className="text-slate-500 truncate">{currentUser.email}</p>
                  </div>

                  <button
                    onClick={() => onNavigate('profile')}
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-2"
                  >
                    <UserIcon className="w-4 h-4" /> Profile & Study Hours
                  </button>

                  <div className="border-t border-slate-100 dark:border-slate-800 my-1 pt-1">
                    <span className="px-4 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Quick Demo Switch
                    </span>
                    <button
                      onClick={() => switchUser('user-student-1')}
                      className="w-full text-left px-4 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                    >
                      Alex Rivers (Student)
                    </button>
                    <button
                      onClick={() => switchUser('user-student-2')}
                      className="w-full text-left px-4 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                    >
                      Elena Chen (Student · MIT)
                    </button>
                    <button
                      onClick={() => switchUser('user-student-3')}
                      className="w-full text-left px-4 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                    >
                      Marcus Vance (Student · Berkeley)
                    </button>
                    <button
                      onClick={() => switchUser('user-admin-1')}
                      className="w-full text-left px-4 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-amber-600 dark:text-amber-400 font-medium"
                    >
                      Dr. Sarah Vance (Admin · Dean)
                    </button>
                  </div>

                  <div className="border-t border-slate-100 dark:border-slate-800 my-1 pt-1">
                    <button
                      onClick={() => onNavigate('login')}
                      className="w-full text-left px-4 py-2 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-semibold flex items-center justify-between"
                    >
                      <span>Authentication Portal</span>
                      <span className="text-[10px] text-slate-400">&rarr;</span>
                    </button>
                    <button
                      onClick={() => {
                        logout();
                        onNavigate('login');
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 font-medium"
                    >
                      Log out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('login')}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors whitespace-nowrap"
              >
                Sign In
              </button>
              <button
                onClick={() => openAuthModal('register')}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-2xs transition-colors whitespace-nowrap"
              >
                Register
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
