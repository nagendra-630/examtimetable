import React, { createContext, useContext, useEffect, useState } from 'react';
import { Role, StudyPreferences, User } from '../types';
import { StorageService } from '../services/storage';

interface AuthContextType {
  currentUser: User | null;
  role: Role;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, pass: string, role: Role) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  switchUser: (userId: string) => void;
  updateProfile: (data: Partial<User>) => void;
  updatePreferences: (prefs: Partial<StudyPreferences>) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'register' | 'forgot';
  openAuthModal: (mode?: 'login' | 'register' | 'forgot') => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | 'forgot'>('login');

  useEffect(() => {
    StorageService.init();
    const user = StorageService.getCurrentUser();
    setCurrentUser(user);

    // Initial theme
    const savedTheme = localStorage.getItem('exam_planner_theme') as 'light' | 'dark' | null;
    const initialTheme = savedTheme || 'light';
    setTheme(initialTheme);
    if (initialTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    const unsubscribe = StorageService.subscribe(() => {
      setCurrentUser(StorageService.getCurrentUser());
    });

    return () => unsubscribe();
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('exam_planner_theme', nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const login = async (email: string): Promise<{ success: boolean; error?: string }> => {
    const users = StorageService.getUsers();
    const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (found) {
      StorageService.setCurrentUser(found);
      setCurrentUser(found);
      return { success: true };
    }
    // If not found in seed, create student on the fly for ease of testing
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: email.split('@')[0],
      email,
      role: 'STUDENT',
      schoolOrUniversity: 'General University',
      createdAt: new Date().toISOString(),
      studyPreferences: {
        dailyAvailableHours: 4,
        preferredStartTime: '09:00',
        preferredEndTime: '21:00',
        sessionDurationMinutes: 50,
        breakDurationMinutes: 10,
        reservePreExamDays: 1,
        enableSpacedRepetition: true,
        focusWeakSubjects: true,
        emailNotifications: true,
        dailyReminderTime: '08:00',
      },
    };
    StorageService.saveUser(newUser);
    StorageService.setCurrentUser(newUser);
    setCurrentUser(newUser);
    return { success: true };
  };

  const register = async (name: string, email: string, _pass: string, role: Role) => {
    const users = StorageService.getUsers();
    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, error: 'An account with this email already exists.' };
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      name,
      email,
      role,
      schoolOrUniversity: 'Undergraduate Program',
      createdAt: new Date().toISOString(),
      studyPreferences: {
        dailyAvailableHours: 4,
        preferredStartTime: '09:00',
        preferredEndTime: '21:00',
        sessionDurationMinutes: 50,
        breakDurationMinutes: 10,
        reservePreExamDays: 1,
        enableSpacedRepetition: true,
        focusWeakSubjects: true,
        emailNotifications: true,
        dailyReminderTime: '08:00',
      },
    };

    StorageService.saveUser(newUser);
    StorageService.setCurrentUser(newUser);
    setCurrentUser(newUser);
    return { success: true };
  };

  const logout = () => {
    StorageService.setCurrentUser(null);
    setCurrentUser(null);
  };

  const switchUser = (userId: string) => {
    const switched = StorageService.switchUser(userId);
    if (switched) {
      setCurrentUser(switched);
    }
  };

  const updateProfile = (data: Partial<User>) => {
    if (!currentUser) return;
    const updated: User = { ...currentUser, ...data };
    StorageService.saveUser(updated);
    setCurrentUser(updated);
  };

  const updatePreferences = (prefs: Partial<StudyPreferences>) => {
    if (!currentUser) return;
    const updated: User = {
      ...currentUser,
      studyPreferences: { ...currentUser.studyPreferences, ...prefs },
    };
    StorageService.saveUser(updated);
    setCurrentUser(updated);
  };

  const openAuthModal = (mode: 'login' | 'register' | 'forgot' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        role: currentUser?.role || 'STUDENT',
        login,
        register,
        logout,
        switchUser,
        updateProfile,
        updatePreferences,
        theme,
        toggleTheme,
        isAuthModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
