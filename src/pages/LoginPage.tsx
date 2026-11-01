import React, { useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Brain,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  GraduationCap,
  KeyRound,
  Lock,
  Mail,
  School,
  Shield,
  ShieldAlert,
  Sparkles,
  Trophy,
  User,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const { login, register, resetPassword, switchUser } = useAuth();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState(() => localStorage.getItem('exam_planner_remembered_email') || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [school, setSchool] = useState('');
  const [role, setRole] = useState<Role>('STUDENT');
  const [rememberMe, setRememberMe] = useState(true);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Forgot password steps
  const [forgotStep, setForgotStep] = useState<1 | 2 | 3>(1);
  const [resetPin, setResetPin] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const passStrength = getPasswordStrength(password);
  const strengthLabels = ['Too weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['bg-slate-200', 'bg-rose-500', 'bg-amber-500', 'bg-blue-500', 'bg-emerald-500'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setIsLoading(true);

    try {
      if (mode === 'login') {
        const res = await login(email, password, rememberMe);
        if (res.success) {
          try {
            confetti({ particleCount: 50, spread: 60 });
          } catch (err) {}
          onLoginSuccess();
        } else {
          setError(res.error || 'Invalid credentials. Please verify your email and password.');
        }
      } else if (mode === 'register') {
        if (!name.trim()) {
          setError('Please provide your full name.');
          setIsLoading(false);
          return;
        }
        if (password.length < 6) {
          setError('Password must contain at least 6 characters.');
          setIsLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          setError('Passwords do not match. Please re-enter.');
          setIsLoading(false);
          return;
        }

        const res = await register(name.trim(), email.trim(), password, role, school.trim());
        if (res.success) {
          try {
            confetti({ particleCount: 70, spread: 65, origin: { y: 0.6 } });
          } catch (err) {}
          onLoginSuccess();
        } else {
          setError(res.error || 'Failed to create student account.');
        }
      } else if (mode === 'forgot') {
        if (forgotStep === 1) {
          if (!email.trim()) {
            setError('Please enter your registered email address.');
            setIsLoading(false);
            return;
          }
          setTimeout(() => {
            setForgotStep(2);
            setSuccessMsg(`A 6-digit verification code has been dispatched to ${email}.`);
            setIsLoading(false);
          }, 600);
          return;
        } else if (forgotStep === 2) {
          if (resetPin.trim() !== '482910' && resetPin.length < 6) {
            setError('Invalid verification PIN. Use code 482910 for instant demo verification.');
            setIsLoading(false);
            return;
          }
          setForgotStep(3);
          setSuccessMsg('Security code confirmed. Set your new password.');
          setIsLoading(false);
          return;
        } else if (forgotStep === 3) {
          if (newPassword.length < 6) {
            setError('New password must be at least 6 characters.');
            setIsLoading(false);
            return;
          }
          const res = await resetPassword(email, newPassword);
          if (res.success) {
            setSuccessMsg('Password updated successfully! Signing you in...');
            setTimeout(async () => {
              await login(email, newPassword, rememberMe);
              onLoginSuccess();
            }, 900);
          } else {
            setError(res.error || 'Failed to update password.');
          }
        }
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemo = (userId: string) => {
    switchUser(userId);
    try {
      confetti({ particleCount: 50, spread: 60 });
    } catch (e) {}
    onLoginSuccess();
  };

  return (
    <div className="max-w-5xl mx-auto py-8 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Left Column: Brand & Value Narrative */}
        <div className="lg:col-span-5 bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="text-lg font-extrabold tracking-tight text-white">
                ExamPlanner
              </span>
            </div>

            <div>
              <h2 className="text-2xl font-extrabold text-white leading-tight mb-2">
                Intelligent Spaced Revision for High-Stakes Exams
              </h2>
              <p className="text-xs text-indigo-200 leading-relaxed">
                Log in to access your automatically generated revision calendar, Pomodoro study timers, and subject mastery curves.
              </p>
            </div>

            {/* Value bullets */}
            <div className="space-y-3 pt-2 text-xs text-indigo-100">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Day 1, 3, 7, 14 spaced repetition retention</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Automatic cognitive rest buffers & daily hour limits</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Pre-exam high-yield review protection</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-8 mt-8 border-t border-indigo-900/60 text-[11px] text-indigo-300">
            <span>Encrypted Session · Role-Based Access · Multi-Device Sync</span>
          </div>

          {/* Background Ambient Icon */}
          <div className="absolute -right-6 -bottom-6 opacity-10 pointer-events-none text-white">
            <Brain className="w-64 h-64" />
          </div>
        </div>

        {/* Right Column: Authentication Form & One-Click Demo */}
        <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-center space-y-6">
          {/* Top Tabs */}
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError(null);
                }}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                  mode === 'login'
                    ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setError(null);
                }}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                  mode === 'register'
                    ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Create Account
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setMode('forgot');
                setError(null);
                setForgotStep(1);
              }}
              className="text-xs font-semibold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              Reset Password
            </button>
          </div>

          {/* 1-Click Demo Profiles Preset */}
          {mode === 'login' && (
            <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  Instant Demo Sign-in:
                </span>
                <span className="text-[11px] text-slate-400">Pre-seeded timetables</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickDemo('user-student-1')}
                  className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 text-left transition-all hover:shadow-xs group"
                >
                  <div className="flex items-center gap-2">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                      alt="Alex"
                      className="w-7 h-7 rounded-full object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600">
                        Alex Rivers
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">Stanford · CS</div>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemo('user-student-2')}
                  className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 text-left transition-all hover:shadow-xs group"
                >
                  <div className="flex items-center gap-2">
                    <img
                      src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80"
                      alt="Elena"
                      className="w-7 h-7 rounded-full object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600">
                        Elena Chen
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">MIT · EE</div>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemo('user-admin-1')}
                  className="p-2.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50 hover:border-amber-500 text-left transition-all hover:shadow-xs group"
                >
                  <div className="flex items-center gap-2">
                    <img
                      src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80"
                      alt="Dr. Vance"
                      className="w-7 h-7 rounded-full object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-amber-900 dark:text-amber-200 truncate group-hover:text-amber-700">
                        Dr. Vance
                      </div>
                      <div className="text-[10px] text-amber-700/80 dark:text-amber-400 truncate">Dean · Admin</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Feedback Alerts */}
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs flex items-start gap-2.5">
              <Check className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Main Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {mode === 'register' && (
              <>
                <div>
                  <label className="block font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                    Account Role
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <div
                      onClick={() => setRole('STUDENT')}
                      className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                        role === 'STUDENT'
                          ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40'
                          : 'border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                        <GraduationCap className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">Student</div>
                        <div className="text-[11px] text-slate-500">Exam preparation</div>
                      </div>
                    </div>

                    <div
                      onClick={() => setRole('ADMIN')}
                      className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                        role === 'ADMIN'
                          ? 'border-amber-600 bg-amber-50/50 dark:bg-amber-950/40'
                          : 'border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                        <Shield className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">Administrator</div>
                        <div className="text-[11px] text-slate-500">Student rosters & audit</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Full Legal Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Jordan Rivers"
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      School / University
                    </label>
                    <div className="relative">
                      <School className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        value={school}
                        onChange={(e) => setSchool(e.target.value)}
                        placeholder="e.g. Stanford University"
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Email Field */}
            {(mode !== 'forgot' || forgotStep === 1) && (
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@university.edu"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            )}

            {/* Password Field */}
            {mode !== 'forgot' && (
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-10 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {mode === 'register' && password.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-500">Security strength:</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {strengthLabels[passStrength]}
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-1 h-1.5 w-full">
                      {[1, 2, 3, 4].map((step) => (
                        <div
                          key={step}
                          className={`rounded-full transition-all ${
                            passStrength >= step ? strengthColors[passStrength] : 'bg-slate-200 dark:bg-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Confirm Password (Register) */}
            {mode === 'register' && (
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-10 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Forgot Step 2: PIN Verification */}
            {mode === 'forgot' && forgotStep === 2 && (
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">
                      Enter 6-Digit Security Code
                    </label>
                    <button
                      type="button"
                      onClick={() => setResetPin('482910')}
                      className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      Fill Demo PIN (482910)
                    </button>
                  </div>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      maxLength={6}
                      value={resetPin}
                      onChange={(e) => setResetPin(e.target.value)}
                      placeholder="482910"
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono tracking-widest text-center text-sm font-bold"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Forgot Step 3: New Password */}
            {mode === 'forgot' && forgotStep === 3 && (
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="New password (min 6 characters)"
                    className="w-full pl-9 pr-10 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Remember Me Toggle */}
            {mode === 'login' && (
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded-sm border-slate-300 dark:border-slate-700"
                  />
                  <span className="text-slate-600 dark:text-slate-300 font-medium">
                    Remember my email on this computer
                  </span>
                </label>
              </div>
            )}

            {/* Submit Action Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-3 py-3 px-4 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-98 disabled:opacity-50 transition-all shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span>Validating...</span>
              ) : mode === 'login' ? (
                <>
                  <span>Sign In to Student Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : mode === 'register' ? (
                <>
                  <span>Create Account & Setup Syllabus</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : forgotStep === 1 ? (
                <span>Send Verification Code</span>
              ) : forgotStep === 2 ? (
                <span>Verify Security PIN</span>
              ) : (
                <span>Set New Password & Enter</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
