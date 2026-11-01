import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
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
  User,
  UserCheck,
  X,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    authModalMode,
    closeAuthModal,
    login,
    register,
    resetPassword,
    switchUser,
  } = useAuth();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(authModalMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [school, setSchool] = useState('');
  const [role, setRole] = useState<Role>('STUDENT');
  const [rememberMe, setRememberMe] = useState(true);

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Forgot password steps: 1 = email, 2 = pin, 3 = new password
  const [forgotStep, setForgotStep] = useState<1 | 2 | 3>(1);
  const [resetPin, setResetPin] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Status feedback
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setMode(authModalMode);
    setError(null);
    setSuccessMsg(null);
    setForgotStep(1);

    // Pre-fill remembered email if available
    const remembered = localStorage.getItem('exam_planner_remembered_email');
    if (remembered && !email) {
      setEmail(remembered);
    }
  }, [authModalMode, isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score; // 0 to 4
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
            confetti({ particleCount: 40, spread: 50 });
          } catch (err) {}
          closeAuthModal();
        } else {
          setError(res.error || 'Invalid email or password.');
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
          closeAuthModal();
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
          // Simulate OTP dispatch
          setTimeout(() => {
            setForgotStep(2);
            setSuccessMsg(`A 6-digit verification code has been dispatched to ${email}. Check your inbox!`);
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
              closeAuthModal();
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
    closeAuthModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6 transition-all">
        {/* Top Header Bar */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                Exam Timetable Planner
              </h2>
              <p className="text-xs text-slate-500">
                {mode === 'login'
                  ? 'Sign in to access your revision timetable'
                  : mode === 'register'
                  ? 'Create student account & initialize syllabus'
                  : 'Account Recovery & Verification'}
              </p>
            </div>
          </div>
          <button
            onClick={closeAuthModal}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 pt-4 pb-2 bg-slate-50/50 dark:bg-slate-950/30 border-b border-slate-100 dark:border-slate-800 flex gap-2">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
              mode === 'login'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
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
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
              mode === 'register'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Create Account
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('forgot');
              setError(null);
              setForgotStep(1);
            }}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
              mode === 'forgot'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Reset Password
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* 1-Click Demo Profiles Showcase */}
          {mode === 'login' && (
            <div className="p-3.5 rounded-2xl bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-100/80 dark:border-indigo-900/40 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  Instant One-Click Demo Sign-in:
                </span>
                <span className="text-[11px] text-slate-400">Click any profile below</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {/* Demo Alex */}
                <button
                  type="button"
                  onClick={() => handleQuickDemo('user-student-1')}
                  className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-500 text-left transition-all hover:shadow-xs group"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0 overflow-hidden">
                      <img
                        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                        alt="Alex"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600">
                        Alex Rivers
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">Student · Stanford</div>
                    </div>
                  </div>
                </button>

                {/* Demo Elena */}
                <button
                  type="button"
                  onClick={() => handleQuickDemo('user-student-2')}
                  className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-500 text-left transition-all hover:shadow-xs group"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-purple-100 text-purple-700 font-bold text-xs flex items-center justify-center shrink-0 overflow-hidden">
                      <img
                        src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80"
                        alt="Elena"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600">
                        Elena Chen
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">Student · MIT</div>
                    </div>
                  </div>
                </button>

                {/* Demo Admin */}
                <button
                  type="button"
                  onClick={() => handleQuickDemo('user-admin-1')}
                  className="p-2.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50 hover:border-amber-500 text-left transition-all hover:shadow-xs group"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-amber-200 text-amber-800 font-bold text-xs flex items-center justify-center shrink-0 overflow-hidden">
                      <img
                        src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80"
                        alt="Dr. Vance"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-amber-900 dark:text-amber-200 truncate group-hover:text-amber-700">
                        Dr. Vance
                      </div>
                      <div className="text-[10px] text-amber-700/80 dark:text-amber-400 truncate">Academic Dean</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Feedback Banners */}
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1">{error}</div>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs flex items-start gap-2.5 animate-in fade-in">
              <Check className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1">{successMsg}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* REGISTER FIELDS */}
            {mode === 'register' && (
              <>
                {/* Role Selector Cards */}
                <div>
                  <label className="block font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                    Select Your Academic Role
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <div
                      onClick={() => setRole('STUDENT')}
                      className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                        role === 'STUDENT'
                          ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 shadow-xs'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                        <GraduationCap className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">Student</div>
                        <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                          Exam calendars, spaced revision timetable & study timer.
                        </div>
                      </div>
                    </div>

                    <div
                      onClick={() => setRole('ADMIN')}
                      className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                        role === 'ADMIN'
                          ? 'border-amber-600 bg-amber-50/50 dark:bg-amber-950/40 shadow-xs'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                        <Shield className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">Administrator</div>
                        <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                          Student audit, classroom schedules & department analytics.
                        </div>
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
                        placeholder="e.g. Columbia University"
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* EMAIL (Shown for login, register, forgot step 1) */}
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

            {/* PASSWORD (Login & Register) */}
            {mode !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Password
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => {
                        setMode('forgot');
                        setForgotStep(1);
                        setError(null);
                      }}
                      className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
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

                {/* Password Strength Meter in Register mode */}
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

            {/* CONFIRM PASSWORD (Register only) */}
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

            {/* FORGOT PASSWORD STEP 2: PIN VERIFICATION */}
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
                      Fill Demo Code (482910)
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
                <p className="text-[11px] text-slate-400">
                  A verification code was simulated for {email}. Enter code 482910 to proceed.
                </p>
              </div>
            )}

            {/* FORGOT PASSWORD STEP 3: SET NEW PASSWORD */}
            {mode === 'forgot' && forgotStep === 3 && (
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Set New Account Password
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

            {/* REMEMBER ME (Login only) */}
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
                    Remember my email on this device
                  </span>
                </label>
              </div>
            )}

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-3 py-3 px-4 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-98 disabled:opacity-50 transition-all shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span>Authenticating...</span>
              ) : mode === 'login' ? (
                <>
                  <span>Sign In to Student Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : mode === 'register' ? (
                <>
                  <span>Create Account & Start Revising</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : forgotStep === 1 ? (
                <span>Send Verification Code</span>
              ) : forgotStep === 2 ? (
                <span>Verify Security Code</span>
              ) : (
                <span>Set New Password & Sign In</span>
              )}
            </button>
          </form>

          {/* Switch mode links */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500">
            {mode === 'login' ? (
              <p>
                New student preparing for exams?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setError(null);
                  }}
                  className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Create an account
                </button>
              </p>
            ) : mode === 'register' ? (
              <p>
                Already have an academic profile?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError(null);
                  }}
                  className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Sign in here
                </button>
              </p>
            ) : (
              <p>
                Remember your credentials?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError(null);
                  }}
                  className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Return to sign in
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
