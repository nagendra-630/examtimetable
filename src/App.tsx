import React, { useEffect, useState } from 'react';
import {
  Calendar,
  CheckSquare,
  GraduationCap,
  LayoutDashboard,
  Moon,
  Plus,
  Sparkles,
  Sun,
  User,
} from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { TimerModal } from './components/TimerModal';
import { ScheduleModal } from './components/ScheduleModal';
import { AuthModal } from './components/AuthModal';
import { NotificationDrawer } from './components/NotificationDrawer';

import { DashboardPage } from './pages/DashboardPage';
import { ExamsPage } from './pages/ExamsPage';
import { SubjectsPage } from './pages/SubjectsPage';
import { DailyPlannerPage } from './pages/DailyPlannerPage';
import { CalendarPage } from './pages/CalendarPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminPage } from './pages/AdminPage';
import { LandingPage } from './pages/LandingPage';
import { SpringBootDocsPage } from './pages/SpringBootDocsPage';

import { StorageService } from './services/storage';
import { AppNotification, Chapter, Exam, RevisionTask, Subject } from './types';

function AppContent() {
  const { currentUser, role } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('dashboard');

  // App data states
  const [exams, setExams] = useState<Exam[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [tasks, setTasks] = useState<RevisionTask[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // Modal states
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [activeTimerTask, setActiveTimerTask] = useState<RevisionTask | null>(null);

  // Sync data from StorageService
  const refreshData = () => {
    setExams(StorageService.getExams());
    setSubjects(StorageService.getSubjects());
    setChapters(StorageService.getChapters());
    setTasks(StorageService.getTasks());
    setNotifications(StorageService.getNotifications());
  };

  useEffect(() => {
    StorageService.init();
    refreshData();

    const unsubscribe = StorageService.subscribe(() => {
      refreshData();
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleOpenTimer = (task: RevisionTask) => {
    setActiveTimerTask(task);
  };

  const handleCloseTimer = () => {
    setActiveTimerTask(null);
  };

  const handleOpenScheduleModal = () => {
    setIsScheduleModalOpen(true);
  };

  const handleScheduleGenerated = (_count: number) => {
    refreshData();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onNavigate={setCurrentTab}
        notifications={notifications}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenScheduleModal={handleOpenScheduleModal}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-12">
        {currentTab === 'dashboard' && (
          <DashboardPage
            exams={exams}
            subjects={subjects}
            chapters={chapters}
            tasks={tasks}
            onNavigate={setCurrentTab}
            onOpenTimer={handleOpenTimer}
            onOpenScheduleModal={handleOpenScheduleModal}
            onAddExamClick={() => setCurrentTab('exams')}
          />
        )}

        {currentTab === 'exams' && (
          <ExamsPage
            exams={exams}
            subjects={subjects}
            onOpenScheduleModal={handleOpenScheduleModal}
          />
        )}

        {currentTab === 'subjects' && (
          <SubjectsPage
            subjects={subjects}
            chapters={chapters}
            onOpenScheduleModal={handleOpenScheduleModal}
          />
        )}

        {currentTab === 'planner' && (
          <DailyPlannerPage
            tasks={tasks}
            subjects={subjects}
            chapters={chapters}
            onOpenTimer={handleOpenTimer}
            onOpenScheduleModal={handleOpenScheduleModal}
          />
        )}

        {currentTab === 'calendar' && (
          <CalendarPage
            exams={exams}
            tasks={tasks}
            subjects={subjects}
            onOpenTimer={handleOpenTimer}
            onOpenScheduleModal={handleOpenScheduleModal}
          />
        )}

        {currentTab === 'analytics' && (
          <AnalyticsPage
            exams={exams}
            subjects={subjects}
            chapters={chapters}
            tasks={tasks}
            onOpenScheduleModal={handleOpenScheduleModal}
            onNavigate={setCurrentTab}
          />
        )}

        {currentTab === 'profile' && <ProfilePage />}

        {currentTab === 'admin' && <AdminPage />}

        {currentTab === 'landing' && (
          <LandingPage
            onGetStarted={() => setCurrentTab('dashboard')}
            onExploreDemo={(userId) => {
              StorageService.switchUser(userId);
              setCurrentTab('dashboard');
            }}
          />
        )}

        {currentTab === 'springdocs' && <SpringBootDocsPage />}
      </main>

      {/* Mobile Floating Action / Bottom Nav for high accessibility */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 py-2 px-4 z-40 flex items-center justify-around text-[10px] font-semibold text-slate-500 dark:text-slate-400">
        <button
          onClick={() => setCurrentTab('dashboard')}
          className={`flex flex-col items-center gap-1 ${
            currentTab === 'dashboard' ? 'text-indigo-600 dark:text-indigo-400' : ''
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>Home</span>
        </button>

        <button
          onClick={() => setCurrentTab('exams')}
          className={`flex flex-col items-center gap-1 ${
            currentTab === 'exams' ? 'text-indigo-600 dark:text-indigo-400' : ''
          }`}
        >
          <GraduationCap className="w-5 h-5" />
          <span>Exams</span>
        </button>

        <button
          onClick={handleOpenScheduleModal}
          className="flex flex-col items-center gap-1 -mt-5"
        >
          <div className="w-11 h-11 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="text-indigo-600 dark:text-indigo-400 font-bold">Auto</span>
        </button>

        <button
          onClick={() => setCurrentTab('planner')}
          className={`flex flex-col items-center gap-1 ${
            currentTab === 'planner' ? 'text-indigo-600 dark:text-indigo-400' : ''
          }`}
        >
          <CheckSquare className="w-5 h-5" />
          <span>Planner</span>
        </button>

        <button
          onClick={() => setCurrentTab('calendar')}
          className={`flex flex-col items-center gap-1 ${
            currentTab === 'calendar' ? 'text-indigo-600 dark:text-indigo-400' : ''
          }`}
        >
          <Calendar className="w-5 h-5" />
          <span>Calendar</span>
        </button>
      </nav>

      {/* Active Focus Session Timer Modal */}
      <TimerModal
        task={activeTimerTask}
        isOpen={Boolean(activeTimerTask)}
        onClose={handleCloseTimer}
        onSessionCompleted={() => {
          refreshData();
          handleCloseTimer();
        }}
      />

      {/* Spaced Repetition Revision Schedule Generator Modal */}
      <ScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        onScheduleGenerated={handleScheduleGenerated}
      />

      {/* Auth Modal for Student / Admin sign in & registration */}
      <AuthModal />

      {/* In-App Notifications Drawer */}
      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onNavigate={setCurrentTab}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
