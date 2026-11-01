import React, { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Eye,
  EyeOff,
  GraduationCap,
  KeyRound,
  Lock,
  LogIn,
  Mail,
  RefreshCw,
  School,
  Shield,
  ShieldAlert,
  ShieldCheck,
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
  const [capsLockActive, setCapsLockActive] = useState(false);

  // Forgot password steps: 1 = email, 2 = pin, 3 = new password
  const [forgotStep, setForgotStep] = useState<1 | 2 | 3>(1);
  const [resetPin, setResetPin] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [resendCooldown, setResendCooldown] = useState(45);
  const pinInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Status feedback
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [ssoLoading, setSsoLoading] = useState<string | null>(null);

  // Quick domain chips
  const domainSuggestions = ['@stanford.edu', '@mit.edu', '@berkeley.edu', '@gmail.com'];

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

  useEffect(() => {
    let timer: any;
    if (mode === 'forgot' && forgotStep === 2 && resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [mode, forgotStep, resendCooldown]);

  if (!isAuthModalOpen) return null;

  const handleKeyModifierCheck = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.getModifierState && e.getModifierState('CapsLock')) {
      setCapsLockActive(true);
    } else {
      setCapsLockActive(false);
    }
  };

  const handleDomainClick = (domain: string) => {
    const base = email.includes('@') ? email.split('@')[0] : email;
    setEmail(`${base}${domain}`);
  };

  const handleAutofillPersona = (pEmail: string, pPass = 'password123') => {
    setEmail(pEmail);
    setPassword(pPass);
    setError(null);
    setSuccessMsg(`Auto-filled credentials for ${pEmail}.`);
  };

  const handleQuickDemo = (userId: string) => {
    switchUser(userId);
    try {
      confetti({ particleCount: 50, spread: 60 });
    } catch (e) {}
    closeAuthModal();
  };

  const handleSimulateSso = (provider: string, userId: string) => {
    setSsoLoading(provider);
    setError(null);
    setTimeout(() => {
      switchUser(userId);
      setSsoLoading(null);
      try {
        confetti({ particleCount: 55, spread: 65 });
      } catch (e) {}
      closeAuthModal();
    }, 700);
  };

  // Password strength calculation
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const strengthScore = [hasMinLength, hasUppercase, hasNumber, hasSpecial].filter(Boolean).length;
  const strengthLabels = ['Too weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['bg-slate-200 dark:bg-slate-700', 'bg-rose-500', 'bg-amber-500', 'bg-blue-500', 'bg-emerald-500'];

  const passwordsMatch = password.length > 0 && confirmPassword.length > 0 && password === confirmPassword;
  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  // PIN manipulation
  const handlePinChange = (index: number, value: string) => {
    if (value.length > 1) {
      const digits = value.replace(/\D/g, '').slice(0, 6).split('');
      const newPin = [...resetPin];
      digits.forEach((d, i) => {
        if (index + i < 6) newPin[index + i] = d;
      });
      setResetPin(newPin);
      pinInputRefs.current[Math.min(index + digits.length, 5)]?.focus();
      return;
    }
    const newPin = [...resetPin];
    newPin[index] = value.replace(/\D/g, '');
    setResetPin(newPin);
    if (value && index < 5) {
      pinInputRefs.current[index + 1]?.focus();
    }
  };

  const handlePinKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !resetPin[index] && index > 0) {
      pinInputRefs.current[index - 1]?.focus();
    }
  };

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
          setError('Please provide your full legal name.');
          setIsLoading(false);
          return;
        }
        if (password.length < 6) {
          setError('Password must contain at least 6 characters.');
          setIsLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          setError('Passwords do not match. Please verify your confirmation.');
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
          setTimeout(() => {
            setForgotStep(2);
            setResendCooldown(45);
            setSuccessMsg(`A 6-digit verification code has been dispatched to ${email}.`);
            setIsLoading(false);
          }, 450);
          return;
        } else if (forgotStep === 2) {
          const pinCode = resetPin.join('');
          if (pinCode !== '482910' && pinCode.length < 6) {
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
            setSuccessMsg('Password updated! Signing in...');
            setTimeout(async () => {
              await login(email, newPassword, rememberMe);
              closeAuthModal();
            }, 800);
          } else {
            setError(res.error || 'Failed to update password.');
          }
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-slate-900 dark:text-slate-100 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white leading-tight">
                {mode === 'login' && 'Student & Faculty Portal'}
                {mode === 'register' && 'Create Academic Account'}
                {mode === 'forgot' && 'Reset Account Password'}
              </h3>
              <p className="text-[11px] text-slate-500">
                Exam Timetable Planner · Smart Spaced Revision
              </p>
            </div>
          </div>

          <button
            onClick={closeAuthModal}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Tab Switcher */}
        <div className="px-6 pt-3 flex items-center gap-1 bg-slate-50 dark:bg-slate-950/40 border-b border-slate-100 dark:border-slate-800">
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
            Register
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
        <div className="p-6 space-y-4 overflow-y-auto">
          {/* Quick Demo Personas (Login Mode) */}
          {mode === 'login' && (
            <div className="p-3.5 rounded-2xl bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-100/80 dark:border-indigo-900/40 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  Instant One-Click Demo Sign-in:
                </span>
                <span className="text-[11px] text-slate-400">Click to enter or auto-fill</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {/* Alex Rivers */}
                <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 text-left transition-all">
                  <div className="flex items-center gap-2">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                      alt="Alex"
                      className="w-7 h-7 rounded-full object-cover shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold truncate">Alex Rivers</div>
                      <div className="text-[10px] text-slate-500 truncate">Stanford · DL, Gen AI</div>
                    </div>
                  </div>
                  <div className="mt-1.5 pt-1.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => handleAutofillPersona('alex.rivers@university.edu')}
                      className="text-[10px] text-slate-500 hover:text-indigo-600 flex items-center gap-0.5"
                    >
                      <Copy className="w-2.5 h-2.5" /> Fill
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickDemo('user-student-1')}
                      className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      Sign In &rarr;
                    </button>
                  </div>
                </div>

                {/* Elena Chen */}
                <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 text-left transition-all">
                  <div className="flex items-center gap-2">
                    <img
                      src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80"
                      alt="Elena"
                      className="w-7 h-7 rounded-full object-cover shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold truncate">Elena Chen</div>
                      <div className="text-[10px] text-slate-500 truncate">MIT · CNS, Python</div>
                    </div>
                  </div>
                  <div className="mt-1.5 pt-1.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => handleAutofillPersona('elena.chen@mit.edu')}
                      className="text-[10px] text-slate-500 hover:text-indigo-600 flex items-center gap-0.5"
                    >
                      <Copy className="w-2.5 h-2.5" /> Fill
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickDemo('user-student-2')}
                      className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      Sign In &rarr;
                    </button>
                  </div>
                </div>

                {/* Marcus Vance */}
                <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 text-left transition-all">
                  <div className="flex items-center gap-2">
                    <img
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
                      alt="Marcus"
                      className="w-7 h-7 rounded-full object-cover shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold truncate">Marcus Vance</div>
                      <div className="text-[10px] text-slate-500 truncate">Berkeley · Java, FSD</div>
                    </div>
                  </div>
                  <div className="mt-1.5 pt-1.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => handleAutofillPersona('marcus.vance@berkeley.edu')}
                      className="text-[10px] text-slate-500 hover:text-indigo-600 flex items-center gap-0.5"
                    >
                      <Copy className="w-2.5 h-2.5" /> Fill
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickDemo('user-student-3')}
                      className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      Sign In &rarr;
                    </button>
                  </div>
                </div>

                {/* Dr. Sarah Vance (Admin) */}
                <div className="p-2 rounded-xl bg-amber-50/50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 hover:border-amber-500 text-left transition-all">
                  <div className="flex items-center gap-2">
                    <img
                      src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80"
                      alt="Dr. Vance"
                      className="w-7 h-7 rounded-full object-cover shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-amber-900 dark:text-amber-200 truncate">Dr. Vance</div>
                      <div className="text-[10px] text-amber-700/80 dark:text-amber-400 truncate">Dean · ADMIN</div>
                    </div>
                  </div>
                  <div className="mt-1.5 pt-1.5 border-t border-amber-200/60 dark:border-amber-900/40 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => handleAutofillPersona('sarah.vance@academic-dean.org')}
                      className="text-[10px] text-amber-700 hover:text-amber-900 flex items-center gap-0.5"
                    >
                      <Copy className="w-2.5 h-2.5" /> Fill
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickDemo('user-admin-1')}
                      className="text-[10px] font-bold text-amber-600 dark:text-amber-400 hover:underline"
                    >
                      Sign In &rarr;
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Social SSO Quick Row */}
          {mode === 'login' && (
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={Boolean(ssoLoading)}
                onClick={() => handleSimulateSso('Google', 'user-student-1')}
                className="py-1.5 px-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Google Classroom</span>
              </button>

              <button
                type="button"
                disabled={Boolean(ssoLoading)}
                onClick={() => handleSimulateSso('GitHub', 'user-student-2')}
                className="py-1.5 px-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                <span>GitHub Student</span>
              </button>
            </div>
          )}

          {/* Feedback Alerts */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs flex items-start gap-2">
              <Check className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            {/* Register: Role & Name */}
            {mode === 'register' && (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('STUDENT')}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      role === 'STUDENT'
                        ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300'
                        : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="font-bold flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4" /> Student
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Study planner & spaced drills</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('ADMIN')}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      role === 'ADMIN'
                        ? 'border-amber-600 bg-amber-50/50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300'
                        : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="font-bold flex items-center gap-1.5">
                      <Shield className="w-4 h-4" /> Faculty / Admin
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Student analytics & audit</div>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold mb-1">Full Legal Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Jordan Rivers"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">University / Institute</label>
                    <input
                      type="text"
                      value={school}
                      onChange={(e) => setSchool(e.target.value)}
                      placeholder="e.g. Stanford University"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Email Input */}
            {(mode !== 'forgot' || forgotStep === 1) && (
              <div>
                <label className="block font-semibold mb-1">Institutional Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@university.edu"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {email && !email.includes('@') && (
                  <div className="flex items-center gap-1 mt-1 flex-wrap">
                    {domainSuggestions.map((dom) => (
                      <button
                        key={dom}
                        type="button"
                        onClick={() => handleDomainClick(dom)}
                        className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                      >
                        {dom}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Password Input */}
            {mode !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold">Password</label>
                  {capsLockActive && (
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
                      Caps Lock is ON
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onKeyDown={handleKeyModifierCheck}
                    onKeyUp={handleKeyModifierCheck}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-10 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Strength Checklist */}
                {mode === 'register' && password.length > 0 && (
                  <div className="mt-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between text-[10px]">
                      <span>Password Strength:</span>
                      <span className="font-bold">{strengthLabels[strengthScore]}</span>
                    </div>
                    <div className="grid grid-cols-4 gap-1 h-1">
                      {[1, 2, 3, 4].map((step) => (
                        <div
                          key={step}
                          className={`rounded-full ${
                            strengthScore >= step ? strengthColors[strengthScore] : 'bg-slate-200 dark:bg-slate-700'
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
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold">Confirm Password</label>
                  {passwordsMatch && (
                    <span className="text-[10px] text-emerald-600 font-semibold">Match ✓</span>
                  )}
                  {passwordsMismatch && (
                    <span className="text-[10px] text-rose-600 font-semibold">Mismatch</span>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-10 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Forgot Password Step 2: 6-Digit PIN */}
            {mode === 'forgot' && forgotStep === 2 && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="font-semibold">Enter 6-Digit PIN</label>
                  <button
                    type="button"
                    onClick={() => setResetPin(['4', '8', '2', '9', '1', '0'])}
                    className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" /> Fill Demo PIN (482910)
                  </button>
                </div>

                <div className="flex justify-between gap-1.5">
                  {resetPin.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => {
                        pinInputRefs.current[idx] = el;
                      }}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handlePinChange(idx, e.target.value)}
                      onKeyDown={(e) => handlePinKeyDown(idx, e)}
                      className="w-10 h-10 text-center font-mono text-base font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Forgot Password Step 3: New Password */}
            {mode === 'forgot' && forgotStep === 3 && (
              <div>
                <label className="block font-semibold mb-1">New Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500"
                />
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
                    className="w-3.5 h-3.5 text-indigo-600 rounded-sm"
                  />
                  <span className="text-slate-600 dark:text-slate-300 text-[11px]">Remember email</span>
                </label>
                <span className="text-[10px] text-slate-400 font-mono">Pass: password123</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-2.5 px-4 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span>Validating...</span>
              ) : mode === 'login' ? (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : mode === 'register' ? (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : forgotStep === 1 ? (
                <span>Send PIN</span>
              ) : forgotStep === 2 ? (
                <span>Verify Code</span>
              ) : (
                <span>Update Password</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
