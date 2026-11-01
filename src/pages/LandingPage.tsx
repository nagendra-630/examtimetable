import React from 'react';
import {
  ArrowRight,
  Brain,
  Calendar,
  CheckCircle2,
  Clock,
  GraduationCap,
  Layers,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LandingPageProps {
  onGetStarted: () => void;
  onExploreDemo: (userId: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onGetStarted,
  onExploreDemo,
}) => {
  const { openAuthModal } = useAuth();

  return (
    <div className="space-y-16 py-6 animate-in fade-in duration-300">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-indigo-950 via-slate-900 to-slate-950 text-white p-8 sm:p-14 border border-indigo-900/50 shadow-2xl">
        <div className="max-w-3xl space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-400/30 text-indigo-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Scientifically Backed Spaced Repetition Engine</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Stop Cramming. Start Retaining. Personalized Revision Schedules for Peak Exam Performance.
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
            Input your examination dates, subject chapters, and available daily hours. Our algorithm calculates optimal spaced repetition intervals (Day 1, 3, 7, 14), weights difficult topics, and guarantees conflict-free daily time blocks.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4">
            <button
              onClick={onGetStarted}
              className="px-6 py-3 text-xs sm:text-sm font-bold text-slate-900 bg-white hover:bg-slate-100 rounded-xl transition-all shadow-md flex items-center gap-2 group"
            >
              <span>Open Student Planner</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => openAuthModal('login')}
              className="px-5 py-3 text-xs sm:text-sm font-semibold text-white bg-indigo-600/80 hover:bg-indigo-600 rounded-xl transition-all border border-indigo-500/40"
            >
              Sign In to Your Account
            </button>
          </div>

          {/* Adjacency proof */}
          <div className="pt-6 border-t border-indigo-900/40 flex flex-wrap items-center gap-6 text-xs text-indigo-200">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Conflict-Free Scheduling</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Daily Study Hour Caps</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Pre-Exam Mock Drills</span>
            </div>
          </div>
        </div>

        {/* Ambient background decoration */}
        <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none text-indigo-400 hidden lg:block">
          <Brain className="w-96 h-96" />
        </div>
      </section>

      {/* The 4 Core Algorithmic Pillars */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Engineered for Effective Long-Term Retention
          </h2>
          <p className="text-xs text-slate-500">
            How our intelligent scheduling engine eliminates last-minute stress and guarantees balanced coverage.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Pillar 1 */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Brain className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Spaced Repetition Curve
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Intervals set at Day 1, Day 3, Day 7, and Day 14 prevent memory decay and reinforce synaptic pathways right before forgetting sets in.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Adaptive Difficulty Weighting
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Hard concepts and low-understanding chapters receive up to 1.6x more revision blocks than easy topics you have already mastered.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Cognitive Workload Caps
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Never experience burnout. If you have 4 hours available daily, the system balances time slots and inserts cognitive rest breaks automatically.
            </p>
          </div>

          {/* Pillar 4 */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Pre-Exam High-Yield Reserve
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              The final 24-48 hours before an exam are reserved strictly for formula sheets, flashcard drills, and mock tests—no new learning is scheduled.
            </p>
          </div>
        </div>
      </section>

      {/* Mechanism-to-Outcome Demonstration */}
      <section className="bg-slate-50 dark:bg-slate-900/60 rounded-3xl p-8 sm:p-10 border border-slate-200 dark:border-slate-800 space-y-8">
        <div className="max-w-xl space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            How It Works
          </span>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            From Exam Dates to a Conflict-Free Timetable in 3 Steps
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2 shadow-xs">
            <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
              STEP 01
            </span>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Log Exams & Course Syllabus
            </h3>
            <p className="text-xs text-slate-500">
              Add your upcoming test dates, syllabus chapters, estimated hours, and current understanding (1 to 5 stars).
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2 shadow-xs">
            <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
              STEP 02
            </span>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Configure Available Hours
            </h3>
            <p className="text-xs text-slate-500">
              Set your daily maximum study capacity (e.g. 4.5 hours), session block duration (50m), and break interval.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2 shadow-xs">
            <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
              STEP 03
            </span>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Execute Revision & Track Mastery
            </h3>
            <p className="text-xs text-slate-500">
              Use the built-in study timer, log actual session times, and let the algorithm automatically reschedule any missed sessions.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Box */}
      <section className="text-center p-8 sm:p-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Ready to Ace Your Upcoming Examinations?
        </h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Join thousands of students optimizing their preparation with spaced repetition timetables.
        </p>
        <div className="pt-2 flex items-center justify-center gap-3">
          <button
            onClick={onGetStarted}
            className="px-6 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-xs"
          >
            Launch Revision Scheduler
          </button>
        </div>
      </section>
    </div>
  );
};
