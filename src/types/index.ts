export type Role = 'STUDENT' | 'ADMIN';

export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type Priority = 'Low' | 'Medium' | 'High';
export type PreparationStatus = 'Not Started' | 'In Progress' | 'Needs Revision' | 'Completed';
export type ExamType = 'Final Exam' | 'Midterm' | 'Unit Test' | 'Practical / Lab' | 'Board Exam' | 'Certification';

export type RevisionType = 
  | 'Initial Study'
  | '1st Spaced Review (Day 1)'
  | '2nd Spaced Review (Day 3)'
  | '3rd Spaced Review (Day 7)'
  | '4th Spaced Review (Day 14)'
  | 'High-Yield Recap'
  | 'Mock / Past Paper Drill';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  schoolOrUniversity?: string;
  targetGpaOrGoal?: string;
  avatarUrl?: string;
  createdAt: string;
  studyPreferences: StudyPreferences;
}

export interface StudyPreferences {
  dailyAvailableHours: number; // e.g. 4
  preferredStartTime: string; // e.g. "09:00"
  preferredEndTime: string; // e.g. "21:00"
  sessionDurationMinutes: number; // e.g. 45
  breakDurationMinutes: number; // e.g. 15
  reservePreExamDays: number; // e.g. 1
  enableSpacedRepetition: boolean;
  focusWeakSubjects: boolean;
  emailNotifications: boolean;
  dailyReminderTime: string; // e.g. "08:00"
}

export interface Exam {
  id: string;
  userId: string;
  examName: string;
  subjectId: string;
  subjectName: string;
  examDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  durationMinutes: number; // e.g. 120
  examType: ExamType;
  difficulty: Difficulty;
  priority: Priority;
  targetScore?: number; // e.g. 90
  venueOrRoom?: string;
  notes?: string;
}

export interface Subject {
  id: string;
  userId: string;
  name: string;
  code: string; // e.g. "CS301"
  color: string; // hex or tailwind class
  instructor?: string;
  creditHours?: number;
  totalChaptersCount?: number;
  completedChaptersCount?: number;
}

export interface Chapter {
  id: string;
  subjectId: string;
  userId: string;
  chapterNumber: number;
  chapterName: string;
  topicDescription: string;
  difficulty: Difficulty;
  importance: Priority;
  preparationStatus: PreparationStatus;
  estimatedStudyHours: number;
  understandingLevel: number; // 1 to 5
  lastRevisedDate?: string; // YYYY-MM-DD
  revisionCount: number;
}

export interface RevisionTask {
  id: string;
  userId: string;
  examId?: string;
  subjectId: string;
  subjectName: string;
  subjectColor: string;
  chapterId: string;
  chapterName: string;
  scheduledDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  durationMinutes: number;
  revisionType: RevisionType;
  priority: Priority;
  isCompleted: boolean;
  completedAt?: string;
  actualDurationMinutes?: number;
  notes?: string;
  spacedIntervalDay?: number; // 1, 3, 7, 14
}

export interface StudySessionLog {
  id: string;
  userId: string;
  taskId?: string;
  subjectId: string;
  subjectName: string;
  chapterName: string;
  date: string; // YYYY-MM-DD
  durationMinutes: number;
  focusRating: number; // 1 to 5
  notes?: string;
  timestamp: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'EXAM_COUNTDOWN' | 'TODAY_TASK' | 'MISSED_SESSION' | 'WEAK_TOPIC' | 'SYSTEM';
  date: string;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
  taskId?: string;
  examId?: string;
}

export interface ScheduleGeneratorOptions {
  startDate: string; // YYYY-MM-DD
  dailyAvailableHours: number;
  sessionDurationMinutes: number;
  breakDurationMinutes: number;
  reservePreExamDays: number;
  preserveCompletedSessions: boolean;
  boostWeakChapters: boolean;
  preferredDailyStartTime: string;
}
