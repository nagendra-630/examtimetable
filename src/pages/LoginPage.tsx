import React, { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  Brain,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Eye,
  EyeOff,
  GraduationCap,
  HelpCircle,
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
  Trophy,
  User,
  UserCheck,
  Users,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const { currentUser, login, register, resetPassword, switchUser, logout } = useAuth();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState(() => localStorage.getItem('exam_planner_remembered_email') || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [school, setSchool] = useState('');
  const [role, setRole] = useState<Role>('STUDENT');
  const [rememberMe, setRememberMe] = useState(true);

  // Registration specifics
  const [academicLevel, setAcademicLevel] = useState('Undergraduate (3rd Year)');
  const [targetStudyHours, setTargetStudyHours] = useState(4.5);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([
    'Deep Learning',
    'Cryptography & Network Security (CNS)',
    'Generative AI (Gen AI)',
    'Java Programming',
    'Python & Scientific Computing',
    'Natural Language Processing (NLP)',
    'Full Stack Development (FSD)',
  ]);
  const [agreedToHonorCode, setAgreedToHonorCode] = useState(true);

  // Security and UI helpers
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [capsLockActive, setCapsLockActive] = useState(false);
  const [ssoLoadingProvider, setSsoLoadingProvider] = useState<string | null>(null);
  const [copiedHint, setCopiedHint] = useState(false);

  // Forgot password flow
  const [forgotStep, setForgotStep] = useState<1 | 2 | 3>(1);
  const [resetPin, setResetPin] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [resendCooldown, setResendCooldown] = useState(45);
  const pinInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Status messages
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Quick domain suggestions
  const domainSuggestions = ['@stanford.edu', '@mit.edu', '@berkeley.edu', '@harvard.edu', '@cmu.edu', '@gmail.com'];

  // All 7 CS/AI subjects requested
  const allCoreSubjects = [
    'Deep Learning',
    'Cryptography & Network Security (CNS)',
    'Generative AI (Gen AI)',
    'Java Programming',
    'Python & Scientific Computing',
    'Natural Language Processing (NLP)',
    'Full Stack Development (FSD)',
  ];

  // OTP Countdown timer
  useEffect(() => {
    let timer: any;
    if (mode === 'forgot' && forgotStep === 2 && resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [mode, forgotStep, resendCooldown]);

  const handleDomainClick = (domain: string) => {
    const base = email.includes('@') ? email.split('@')[0] : email;
    setEmail(`${base}${domain}`);
  };

  const handleKeyModifierCheck = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.getModifierState && e.getModifierState('CapsLock')) {
      setCapsLockActive(true);
    } else {
      setCapsLockActive(false);
    }
  };

  // Live email format check
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Password strength checks
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const strengthScore = [hasMinLength, hasUppercase, hasNumber, hasSpecial].filter(Boolean).length;

  const strengthLabels = ['Enter password', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['bg-slate-200 dark:bg-slate-700', 'bg-rose-500', 'bg-amber-500', 'bg-blue-500', 'bg-emerald-500'];

  const passwordsMatch = password.length > 0 && confirmPassword.length > 0 && password === confirmPassword;
  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  // Fill form with persona credentials
  const handleAutofillPersona = (pEmail: string, pPass = 'password123') => {
    setEmail(pEmail);
    setPassword(pPass);
    setError(null);
    setSuccessMsg(`Auto-filled credentials for ${pEmail}. Click "Sign In" below or inspect credentials.`);
  };

  // Instant switch persona
  const handleQuickDemo = (userId: string) => {
    switchUser(userId);
    try {
      confetti({ particleCount: 55, spread: 65, origin: { y: 0.6 } });
    } catch (e) {}
    onLoginSuccess();
  };

  // Simulate Institutional SSO
  const handleSimulateSso = (providerName: string, demoUserId: string) => {
    setSsoLoadingProvider(providerName);
    setError(null);
    setSuccessMsg(`Authenticating via ${providerName} SSO security handshake...`);

    setTimeout(() => {
      switchUser(demoUserId);
      setSsoLoadingProvider(null);
      try {
        confetti({ particleCount: 60, spread: 70, origin: { y: 0.5 } });
      } catch (e) {}
      onLoginSuccess();
    }, 800);
  };

  // OTP PIN helpers
  const handlePinChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handles pasting or fast typing
      const digits = value.replace(/\D/g, '').slice(0, 6).split('');
      const newPin = [...resetPin];
      digits.forEach((d, i) => {
        if (index + i < 6) newPin[index + i] = d;
      });
      setResetPin(newPin);
      const nextIndex = Math.min(index + digits.length, 5);
      pinInputRefs.current[nextIndex]?.focus();
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

  const handlePinPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted) {
      const newPin = [...resetPin];
      for (let i = 0; i < 6; i++) {
        newPin[i] = pasted[i] || '';
      }
      setResetPin(newPin);
      pinInputRefs.current[Math.min(pasted.length, 5)]?.focus();
    }
  };

  const toggleSubject = (sub: string) => {
    if (selectedSubjects.includes(sub)) {
      setSelectedSubjects(selectedSubjects.filter((s) => s !== sub));
    } else {
      setSelectedSubjects([...selectedSubjects, sub]);
    }
  };

  const handleSelectAllSubjects = () => {
    if (selectedSubjects.length === allCoreSubjects.length) {
      setSelectedSubjects([]);
    } else {
      setSelectedSubjects([...allCoreSubjects]);
    }
  };

  // Main Form Submit
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
          setError('Please provide your full legal student name.');
          setIsLoading(false);
          return;
        }
        if (password.length < 6) {
          setError('Password must contain at least 6 characters.');
          setIsLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          setError('Passwords do not match. Please verify your password confirmation.');
          setIsLoading(false);
          return;
        }
        if (!agreedToHonorCode) {
          setError('Please agree to the Academic Honor Code & Terms to continue.');
          setIsLoading(false);
          return;
        }

        const res = await register(
          name.trim(),
          email.trim(),
          password,
          role,
          school.trim() || 'Stanford University (CS Department)',
          {
            dailyAvailableHours: targetStudyHours,
            sessionDurationMinutes: 50,
            breakDurationMinutes: 10,
          }
        );

        if (res.success) {
          try {
            confetti({ particleCount: 75, spread: 65, origin: { y: 0.6 } });
          } catch (err) {}
          onLoginSuccess();
        } else {
          setError(res.error || 'Failed to create student account.');
        }
      } else if (mode === 'forgot') {
        if (forgotStep === 1) {
          if (!email.trim()) {
            setError('Please enter your registered institutional email.');
            setIsLoading(false);
            return;
          }
          setTimeout(() => {
            setForgotStep(2);
            setResendCooldown(45);
            setSuccessMsg(`A 6-digit security PIN has been dispatched to ${email}. Enter code below!`);
            setIsLoading(false);
          }, 450);
          return;
        } else if (forgotStep === 2) {
          const pinCode = resetPin.join('');
          if (pinCode !== '482910' && pinCode.length < 6) {
            setError('Invalid PIN code. Click "Fill Demo PIN (482910)" for instant recovery testing.');
            setIsLoading(false);
            return;
          }
          setForgotStep(3);
          setSuccessMsg('Security PIN verified! Choose your new student password.');
          setIsLoading(false);
          return;
        } else if (forgotStep === 3) {
          if (newPassword.length < 6) {
            setError('Password must be at least 6 characters long.');
            setIsLoading(false);
            return;
          }
          const res = await resetPassword(email, newPassword);
          if (res.success) {
            setSuccessMsg('Password successfully updated! Logging you in...');
            setTimeout(async () => {
              await login(email, newPassword, rememberMe);
              onLoginSuccess();
            }, 800);
          } else {
            setError(res.error || 'Failed to update password.');
          }
        }
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected authentication error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-4 sm:py-8 animate-in fade-in duration-300">
      {/* Active Session Notice if already logged in */}
      {currentUser && (
        <div className="mb-6 p-4 rounded-2xl bg-indigo-50/90 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shrink-0 overflow-hidden">
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
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  Currently Active: {currentUser.name}
                </span>
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300">
                  {currentUser.role}
                </span>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {currentUser.email} · {currentUser.schoolOrUniversity || 'Computer Science & AI'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={onLoginSuccess}
              className="flex-1 sm:flex-none px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => logout()}
              className="flex-1 sm:flex-none px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}

      {/* Main Portal Container */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Left Column: Academic Brief & Exam Coverage */}
        <div className="lg:col-span-5 bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white p-7 sm:p-10 flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10 space-y-6">
            {/* Header Brand */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xl font-extrabold tracking-tight text-white block">
                  ExamPlanner
                </span>
                <span className="text-[11px] text-indigo-300 font-medium">
                  Smart Revision Scheduler
                </span>
              </div>
            </div>

            {/* Headline */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight mb-2">
                Automated Revision for Core CS & AI Exams
              </h2>
              <p className="text-xs sm:text-sm text-indigo-200 leading-relaxed">
                Personalized spaced revision timetable across 7 subjects with Day 1-3-7-14 spacing, Pomodoro study timers, and mastery tracking.
              </p>
            </div>

            {/* Included Modern Subjects Pill Grid */}
            <div className="space-y-2 pt-1">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Pre-Configured Subject Curriculum:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {allCoreSubjects.map((sub) => (
                  <span
                    key={sub}
                    className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-indigo-900/60 border border-indigo-700/50 text-indigo-200"
                  >
                    {sub}
                  </span>
                ))}
              </div>
            </div>

            {/* Key Scheduling Guarantees */}
            <div className="space-y-3 pt-2 text-xs text-indigo-100">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-semibold block text-white">Smart Spaced Revision</span>
                  <span className="text-indigo-300 text-[11px]">
                    Automatic Day 1, 3, 7, 14 intervals calibrated to topic difficulty.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-semibold block text-white">Strict Study Hours Cap</span>
                  <span className="text-indigo-300 text-[11px]">
                    Never schedules beyond your daily available time; inserts restorative breaks.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-semibold block text-white">Pre-Exam Mock Drills</span>
                  <span className="text-indigo-300 text-[11px]">
                    Reserves the final 24-48 hours before each exam exclusively for high-yield recall.
                  </span>
                </div>
              </div>
            </div>

            {/* Quote Card */}
            <div className="p-4 rounded-2xl bg-indigo-900/40 border border-indigo-800/60 backdrop-blur-xs text-xs space-y-2">
              <div className="flex items-center gap-1 text-amber-400">
                {'★'.repeat(5)}
              </div>
              <p className="text-indigo-200 italic leading-relaxed">
                "Balancing Deep Learning, CNS, and Gen AI in one term was seamless. ExamPlanner scheduled my daily revision blocks without any study overlap."
              </p>
              <div className="flex items-center gap-2 pt-1 text-[11px] text-white font-semibold">
                <span>Alex Rivers</span>
                <span className="text-indigo-400">·</span>
                <span className="text-indigo-300">Stanford University (CS & Bio)</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-5 mt-5 border-t border-indigo-900/60 flex items-center justify-between text-[11px] text-indigo-300">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>JWT & BCrypt Encrypted</span>
            </span>
            <span>Multi-Device Sync</span>
          </div>

          {/* Background Ambient Graphic */}
          <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none text-white">
            <Brain className="w-72 h-72" />
          </div>
        </div>

        {/* Right Column: Authentication Form, One-Click Personas & Social SSO */}
        <div className="lg:col-span-7 p-7 sm:p-10 flex flex-col justify-center space-y-6">
          {/* Top Segmented Mode Switcher */}
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError(null);
                  setSuccessMsg(null);
                }}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                  mode === 'login'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setError(null);
                  setSuccessMsg(null);
                }}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                  mode === 'register'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
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
                setSuccessMsg(null);
                setForgotStep(1);
              }}
              className="text-xs font-semibold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              Forgot Password?
            </button>
          </div>

          {/* Instant Student Profiles (Login Mode) */}
          {mode === 'login' && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  One-Click Student Demo Accounts:
                </span>
                <span className="text-[11px] text-slate-400">Click to log in or auto-fill</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* 1. Alex Rivers */}
                <div
                  className={`p-3 rounded-xl border transition-all text-left group ${
                    currentUser?.id === 'user-student-1'
                      ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-500 ring-1 ring-indigo-500'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-400'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80"
                      alt="Alex"
                      className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-slate-200 dark:ring-slate-700"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          Alex Rivers
                        </span>
                        <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400">
                          4.5h/d
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        Stanford · Deep Learning & Gen AI
                      </div>
                    </div>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => handleAutofillPersona('alex.rivers@university.edu')}
                      className="text-[11px] text-slate-600 dark:text-slate-300 hover:text-indigo-600 font-medium flex items-center gap-1 transition-colors"
                      title="Fill email and password into form below"
                    >
                      <Copy className="w-3 h-3" /> Auto-fill
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickDemo('user-student-1')}
                      className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5"
                    >
                      <span>Sign In</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* 2. Elena Chen */}
                <div
                  className={`p-3 rounded-xl border transition-all text-left group ${
                    currentUser?.id === 'user-student-2'
                      ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-500 ring-1 ring-indigo-500'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-400'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <img
                      src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80"
                      alt="Elena"
                      className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-slate-200 dark:ring-slate-700"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          Elena Chen
                        </span>
                        <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400">
                          5.0h/d
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        MIT · CNS, Python & FSD
                      </div>
                    </div>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => handleAutofillPersona('elena.chen@mit.edu')}
                      className="text-[11px] text-slate-600 dark:text-slate-300 hover:text-indigo-600 font-medium flex items-center gap-1 transition-colors"
                      title="Fill email and password into form below"
                    >
                      <Copy className="w-3 h-3" /> Auto-fill
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickDemo('user-student-2')}
                      className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5"
                    >
                      <span>Sign In</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* 3. Marcus Vance */}
                <div
                  className={`p-3 rounded-xl border transition-all text-left group ${
                    currentUser?.id === 'user-student-3'
                      ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-500 ring-1 ring-indigo-500'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-400'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <img
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80"
                      alt="Marcus"
                      className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-slate-200 dark:ring-slate-700"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          Marcus Vance
                        </span>
                        <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400">
                          4.0h/d
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        UC Berkeley · Java, NLP & Systems
                      </div>
                    </div>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => handleAutofillPersona('marcus.vance@berkeley.edu')}
                      className="text-[11px] text-slate-600 dark:text-slate-300 hover:text-indigo-600 font-medium flex items-center gap-1 transition-colors"
                      title="Fill email and password into form below"
                    >
                      <Copy className="w-3 h-3" /> Auto-fill
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickDemo('user-student-3')}
                      className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5"
                    >
                      <span>Sign In</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* 4. Dr. Sarah Vance (Admin) */}
                <div
                  className={`p-3 rounded-xl border transition-all text-left group ${
                    currentUser?.id === 'user-admin-1'
                      ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 ring-1 ring-amber-500'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-amber-400'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <img
                      src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80"
                      alt="Dr. Vance"
                      className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-slate-200 dark:ring-slate-700"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-900 dark:text-amber-200 truncate">
                          Dr. Sarah Vance
                        </span>
                        <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                          ADMIN
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        Academic Dean & Department Head
                      </div>
                    </div>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => handleAutofillPersona('sarah.vance@academic-dean.org')}
                      className="text-[11px] text-slate-600 dark:text-slate-300 hover:text-amber-600 font-medium flex items-center gap-1 transition-colors"
                      title="Fill email and password into form below"
                    >
                      <Copy className="w-3 h-3" /> Auto-fill
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickDemo('user-admin-1')}
                      className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-0.5"
                    >
                      <span>Sign In</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Institutional Single Sign-On (SSO) */}
          {mode === 'login' && (
            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Or Continue With Single Sign-On:
              </span>
              <div className="grid grid-cols-3 gap-2">
                {/* Google Classroom */}
                <button
                  type="button"
                  disabled={Boolean(ssoLoadingProvider)}
                  onClick={() => handleSimulateSso('Google Classroom', 'user-student-1')}
                  className="px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
                  <span className="truncate">{ssoLoadingProvider === 'Google Classroom' ? '...' : 'Classroom'}</span>
                </button>

                {/* GitHub Student */}
                <button
                  type="button"
                  disabled={Boolean(ssoLoadingProvider)}
                  onClick={() => handleSimulateSso('GitHub Student Pack', 'user-student-2')}
                  className="px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                  <span className="truncate">{ssoLoadingProvider === 'GitHub Student Pack' ? '...' : 'GitHub'}</span>
                </button>

                {/* Microsoft 365 */}
                <button
                  type="button"
                  disabled={Boolean(ssoLoadingProvider)}
                  onClick={() => handleSimulateSso('Microsoft 365 Edu', 'user-student-3')}
                  className="px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <div className="w-3.5 h-3.5 grid grid-cols-2 gap-0.5 shrink-0">
                    <span className="bg-[#f25022] rounded-2xs" />
                    <span className="bg-[#7fba00] rounded-2xs" />
                    <span className="bg-[#00a4ef] rounded-2xs" />
                    <span className="bg-[#ffb900] rounded-2xs" />
                  </div>
                  <span className="truncate">{ssoLoadingProvider === 'Microsoft 365 Edu' ? '...' : 'MS 365'}</span>
                </button>
              </div>

              <div className="relative my-3 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 dark:border-slate-800" />
                </div>
                <span className="relative px-3 bg-white dark:bg-slate-900 text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                  Or with email
                </span>
              </div>
            </div>
          )}

          {/* Error and Success Alerts */}
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{error}</div>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs flex items-start gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-500" />
              <div className="flex-1 leading-relaxed">{successMsg}</div>
            </div>
          )}

          {/* Forgot Password Step Indicator */}
          {mode === 'forgot' && (
            <div className="flex items-center justify-between px-2 text-xs font-semibold text-slate-500">
              <span className={forgotStep === 1 ? 'text-indigo-600 dark:text-indigo-400 font-bold' : ''}>
                1. Institutional Email
              </span>
              <span>&rarr;</span>
              <span className={forgotStep === 2 ? 'text-indigo-600 dark:text-indigo-400 font-bold' : ''}>
                2. 6-Digit PIN
              </span>
              <span>&rarr;</span>
              <span className={forgotStep === 3 ? 'text-indigo-600 dark:text-indigo-400 font-bold' : ''}>
                3. Reset Password
              </span>
            </div>
          )}

          {/* Main Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* REGISTER-SPECIFIC FIELDS */}
            {mode === 'register' && (
              <>
                {/* Account Role Selector */}
                <div>
                  <label className="block font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                    Account Role
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
                      <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 flex items-center justify-center shrink-0">
                        <GraduationCap className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">Student</div>
                        <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                          Spaced timetable, focus timers & syllabus mastery.
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
                      <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
                        <Shield className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">Administrator</div>
                        <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                          Curriculum oversight, student roster & analytics.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Name & University */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Full Legal Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3.5 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Jordan Rivers"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      School / University
                    </label>
                    <div className="relative">
                      <School className="w-4 h-4 absolute left-3.5 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        value={school}
                        onChange={(e) => setSchool(e.target.value)}
                        placeholder="e.g. Stanford University"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Academic Year & Study Hours Limit */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Academic Level
                    </label>
                    <select
                      value={academicLevel}
                      onChange={(e) => setAcademicLevel(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="Undergraduate (1st Year)">Undergraduate (1st Year / Freshman)</option>
                      <option value="Undergraduate (2nd Year)">Undergraduate (2nd Year / Sophomore)</option>
                      <option value="Undergraduate (3rd Year)">Undergraduate (3rd Year / Junior)</option>
                      <option value="Undergraduate (4th Year)">Undergraduate (4th Year / Senior)</option>
                      <option value="Graduate / Master’s">Graduate / Master’s Degree</option>
                      <option value="PhD Candidate">PhD Candidate / Researcher</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Target Daily Study Hours ({targetStudyHours}h/day)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="2"
                        max="8"
                        step="0.5"
                        value={targetStudyHours}
                        onChange={(e) => setTargetStudyHours(parseFloat(e.target.value))}
                        className="w-full accent-indigo-600"
                      />
                      <span className="font-mono font-bold text-indigo-600 text-xs shrink-0 w-12 text-right">
                        {targetStudyHours} hrs
                      </span>
                    </div>
                  </div>
                </div>

                {/* Pre-enrolled 7 Subjects Checklist */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">
                      Enroll Current Semester Subjects:
                    </label>
                    <button
                      type="button"
                      onClick={handleSelectAllSubjects}
                      className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      {selectedSubjects.length === allCoreSubjects.length ? 'Deselect All' : 'Select All 7'}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 max-h-40 overflow-y-auto">
                    {allCoreSubjects.map((sub) => {
                      const isChecked = selectedSubjects.includes(sub);
                      return (
                        <label
                          key={sub}
                          className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/60 cursor-pointer select-none text-[11px]"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleSubject(sub)}
                            className="w-3.5 h-3.5 rounded-sm text-indigo-600 border-slate-300 dark:border-slate-700 focus:ring-indigo-500"
                          />
                          <span className={isChecked ? 'font-semibold text-slate-900 dark:text-white' : 'text-slate-500'}>
                            {sub}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {/* EMAIL INPUT (Login & Register, and Forgot Step 1) */}
            {(mode !== 'forgot' || forgotStep === 1) && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Institutional Email Address
                  </label>
                  {isValidEmail && (
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <Check className="w-3 h-3" /> Valid Email
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-2.5 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@university.edu"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Domain quick suggestions */}
                {email && !email.includes('@') && (
                  <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                    <span className="text-[10px] text-slate-400">Quick add domain:</span>
                    {domainSuggestions.map((dom) => (
                      <button
                        key={dom}
                        type="button"
                        onClick={() => handleDomainClick(dom)}
                        className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950 hover:text-indigo-600 transition-colors"
                      >
                        {dom}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* PASSWORD INPUT (Login & Register) */}
            {mode !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Password
                  </label>
                  <div className="flex items-center gap-2">
                    {capsLockActive && (
                      <span className="text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1 font-semibold animate-pulse">
                        <AlertCircle className="w-3.5 h-3.5" /> Caps Lock is ON
                      </span>
                    )}
                    {mode === 'login' && (
                      <button
                        type="button"
                        onClick={() => {
                          setPassword('password123');
                          setCopiedHint(true);
                          setTimeout(() => setCopiedHint(false), 2000);
                        }}
                        className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                      >
                        <KeyRound className="w-3 h-3" />
                        {copiedHint ? 'Filled password123!' : 'Fill Demo Pass'}
                      </button>
                    )}
                  </div>
                </div>

                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-2.5 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onKeyDown={handleKeyModifierCheck}
                    onKeyUp={handleKeyModifierCheck}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Strength Checklist for Register */}
                {mode === 'register' && password.length > 0 && (
                  <div className="mt-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Security Score:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {strengthLabels[strengthScore]}
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-1.5 h-1.5 w-full">
                      {[1, 2, 3, 4].map((step) => (
                        <div
                          key={step}
                          className={`rounded-full transition-all ${
                            strengthScore >= step ? strengthColors[strengthScore] : 'bg-slate-200 dark:bg-slate-700'
                          }`}
                        />
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 pt-1 text-[10px]">
                      <div className={`flex items-center gap-1 ${hasMinLength ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-slate-400'}`}>
                        <Check className="w-3 h-3" /> 8+ Characters
                      </div>
                      <div className={`flex items-center gap-1 ${hasUppercase ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-slate-400'}`}>
                        <Check className="w-3 h-3" /> Uppercase Letter
                      </div>
                      <div className={`flex items-center gap-1 ${hasNumber ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-slate-400'}`}>
                        <Check className="w-3 h-3" /> Numeric Digit
                      </div>
                      <div className={`flex items-center gap-1 ${hasSpecial ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-slate-400'}`}>
                        <Check className="w-3 h-3" /> Special Symbol
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* CONFIRM PASSWORD INPUT (Register) */}
            {mode === 'register' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Confirm Password
                  </label>
                  {passwordsMatch && (
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <Check className="w-3 h-3" /> Passwords match
                    </span>
                  )}
                  {passwordsMismatch && (
                    <span className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> Does not match
                    </span>
                  )}
                </div>

                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-2.5 text-slate-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* REGISTER TERMS CHECKBOX */}
            {mode === 'register' && (
              <label className="flex items-start gap-2.5 cursor-pointer pt-1 select-none">
                <input
                  type="checkbox"
                  required
                  checked={agreedToHonorCode}
                  onChange={(e) => setAgreedToHonorCode(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded-sm text-indigo-600 border-slate-300 dark:border-slate-700 focus:ring-indigo-500"
                />
                <span className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                  I agree to the Academic Honor Code, syllabus tracking policies, and daily spaced repetition reminders.
                </span>
              </label>
            )}

            {/* FORGOT STEP 2: 6-DIGIT OTP PIN BOXES */}
            {mode === 'forgot' && forgotStep === 2 && (
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Enter 6-Digit Verification PIN
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setResetPin(['4', '8', '2', '9', '1', '0']);
                      setSuccessMsg('Demo PIN code 482910 applied.');
                    }}
                    className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> Fill Demo PIN (482910)
                  </button>
                </div>

                <div className="flex justify-between gap-2" onPaste={handlePinPaste}>
                  {resetPin.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => {
                        pinInputRefs.current[idx] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handlePinChange(idx, e.target.value)}
                      onKeyDown={(e) => handlePinKeyDown(idx, e)}
                      className="w-12 h-12 text-center font-mono text-xl font-extrabold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all shadow-2xs"
                    />
                  ))}
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Simulated OTP sent to {email}</span>
                  {resendCooldown > 0 ? (
                    <span>Resend PIN in {resendCooldown}s</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setResendCooldown(45);
                        setSuccessMsg('A fresh verification PIN was re-sent.');
                      }}
                      className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                    >
                      Resend PIN code
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* FORGOT STEP 3: SET NEW PASSWORD */}
            {mode === 'forgot' && forgotStep === 3 && (
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Create New Account Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-2.5 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-2.5 text-slate-400"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* REMEMBER ME TOGGLE (Login) */}
            {mode === 'login' && (
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded-sm border-slate-300 dark:border-slate-700 focus:ring-indigo-500"
                  />
                  <span className="text-slate-600 dark:text-slate-300 font-medium">
                    Remember my email on this device
                  </span>
                </label>

                <span className="text-[11px] text-slate-400">
                  Demo pass: <code className="font-mono text-indigo-600 dark:text-indigo-400">password123</code>
                </span>
              </div>
            )}

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-3 py-3 px-4 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-98 disabled:opacity-50 transition-all shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Validating Credentials...</span>
                </div>
              ) : mode === 'login' ? (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Sign In to Student Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : mode === 'register' ? (
                <>
                  <GraduationCap className="w-4 h-4" />
                  <span>Create Account & Setup Syllabus</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : forgotStep === 1 ? (
                <span>Send 6-Digit Recovery PIN</span>
              ) : forgotStep === 2 ? (
                <span>Verify Security PIN</span>
              ) : (
                <span>Set New Password & Enter</span>
              )}
            </button>
          </form>

          {/* Bottom Switch Links */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500">
            {mode === 'login' ? (
              <p>
                First time preparing for exams?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setError(null);
                    setSuccessMsg(null);
                  }}
                  className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Create your free student account
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
                    setSuccessMsg(null);
                  }}
                  className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Sign in here
                </button>
              </p>
            ) : (
              <p>
                Remembered your password?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError(null);
                    setSuccessMsg(null);
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
