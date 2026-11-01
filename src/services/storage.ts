import {
  AppNotification,
  Chapter,
  Exam,
  RevisionTask,
  Role,
  ScheduleGeneratorOptions,
  StudyPreferences,
  StudySessionLog,
  Subject,
  User,
} from '../types';
import { addDays, formatDate, generateSmartSchedule, rescheduleMissedTask } from '../utils/scheduler';

const STORAGE_KEYS = {
  CURRENT_USER: 'exam_planner_current_user',
  USERS: 'exam_planner_users',
  EXAMS: 'exam_planner_exams',
  SUBJECTS: 'exam_planner_subjects',
  CHAPTERS: 'exam_planner_chapters',
  TASKS: 'exam_planner_tasks',
  SESSIONS: 'exam_planner_sessions',
  NOTIFICATIONS: 'exam_planner_notifications',
  PREFERENCES: 'exam_planner_preferences',
  THEME: 'exam_planner_theme',
};

// Default seed users
const SEED_USERS: User[] = [
  {
    id: 'user-student-1',
    name: 'Alex Rivers',
    email: 'alex.rivers@university.edu',
    role: 'STUDENT',
    schoolOrUniversity: 'Stanford University (CS & Bio)',
    targetGpaOrGoal: 'Summa Cum Laude / GPA 3.9+',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-09-01T08:00:00Z',
    studyPreferences: {
      dailyAvailableHours: 4.5,
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
  },
  {
    id: 'user-student-2',
    name: 'Elena Chen',
    email: 'elena.chen@mit.edu',
    role: 'STUDENT',
    schoolOrUniversity: 'MIT (Electrical Engineering)',
    targetGpaOrGoal: 'Dean’s Honors List',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-09-10T10:00:00Z',
    studyPreferences: {
      dailyAvailableHours: 5,
      preferredStartTime: '08:30',
      preferredEndTime: '20:30',
      sessionDurationMinutes: 60,
      breakDurationMinutes: 15,
      reservePreExamDays: 2,
      enableSpacedRepetition: true,
      focusWeakSubjects: true,
      emailNotifications: false,
      dailyReminderTime: '07:30',
    },
  },
  {
    id: 'user-admin-1',
    name: 'Dr. Sarah Vance',
    email: 'sarah.vance@academic-dean.org',
    role: 'ADMIN',
    schoolOrUniversity: 'Academic Planning Department',
    targetGpaOrGoal: 'Institutional Academic Success',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-08-15T09:00:00Z',
    studyPreferences: {
      dailyAvailableHours: 3,
      preferredStartTime: '09:00',
      preferredEndTime: '18:00',
      sessionDurationMinutes: 45,
      breakDurationMinutes: 15,
      reservePreExamDays: 1,
      enableSpacedRepetition: true,
      focusWeakSubjects: true,
      emailNotifications: true,
      dailyReminderTime: '08:00',
    },
  },
];

export class StorageService {
  private static listeners: (() => void)[] = [];

  static subscribe(fn: () => void) {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== fn);
    };
  }

  private static notify() {
    this.listeners.forEach((fn) => fn());
  }

  // Initialize seed data if not present
  static init() {
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(SEED_USERS));
    }

    if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(SEED_USERS[0]));
    }

    const currentUserId = this.getCurrentUser()?.id || 'user-student-1';

    if (!localStorage.getItem(STORAGE_KEYS.SUBJECTS)) {
      const initialSubjects: Subject[] = [
        {
          id: 'sub-1',
          userId: currentUserId,
          name: 'Data Structures & Algorithms',
          code: 'CS 301',
          color: '#3B82F6', // Blue
          instructor: 'Prof. David Karger',
          creditHours: 4,
          totalChaptersCount: 5,
          completedChaptersCount: 3,
        },
        {
          id: 'sub-2',
          userId: currentUserId,
          name: 'Human Anatomy & Physiology',
          code: 'BIO 210',
          color: '#10B981', // Emerald
          instructor: 'Dr. Rebecca Sterling',
          creditHours: 4,
          totalChaptersCount: 4,
          completedChaptersCount: 1,
        },
        {
          id: 'sub-3',
          userId: currentUserId,
          name: 'Organic Chemistry II',
          code: 'CHEM 222',
          color: '#F59E0B', // Amber
          instructor: 'Prof. Marcus Vance',
          creditHours: 4,
          totalChaptersCount: 4,
          completedChaptersCount: 2,
        },
        {
          id: 'sub-4',
          userId: currentUserId,
          name: 'Engineering Calculus & Linear Algebra',
          code: 'MATH 250',
          color: '#8B5CF6', // Purple
          instructor: 'Dr. Kenneth Lin',
          creditHours: 3,
          totalChaptersCount: 4,
          completedChaptersCount: 2,
        },
      ];
      localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(initialSubjects));
    }

    if (!localStorage.getItem(STORAGE_KEYS.EXAMS)) {
      const today = new Date();
      const initialExams: Exam[] = [
        {
          id: 'exam-1',
          userId: currentUserId,
          examName: 'Data Structures Midterm Examination',
          subjectId: 'sub-1',
          subjectName: 'Data Structures & Algorithms',
          examDate: addDays(formatDate(today), 5),
          startTime: '09:30',
          durationMinutes: 120,
          examType: 'Midterm',
          difficulty: 'Hard',
          priority: 'High',
          targetScore: 92,
          venueOrRoom: 'Turing Hall, Room 402',
          notes: 'Focus heavily on Graph Traversal, Dynamic Programming, and Red-Black Trees.',
        },
        {
          id: 'exam-2',
          userId: currentUserId,
          examName: 'Organic Chemistry Reaction Mechanisms Midterm',
          subjectId: 'sub-3',
          subjectName: 'Organic Chemistry II',
          examDate: addDays(formatDate(today), 9),
          startTime: '13:00',
          durationMinutes: 90,
          examType: 'Midterm',
          difficulty: 'Hard',
          priority: 'High',
          targetScore: 88,
          venueOrRoom: 'Science Center 104',
          notes: 'Memorize nucleophilic additions and aldol condensation pathways.',
        },
        {
          id: 'exam-3',
          userId: currentUserId,
          examName: 'Anatomy Endocrine & Neuro Exam',
          subjectId: 'sub-2',
          subjectName: 'Human Anatomy & Physiology',
          examDate: addDays(formatDate(today), 14),
          startTime: '10:00',
          durationMinutes: 100,
          examType: 'Unit Test',
          difficulty: 'Medium',
          priority: 'Medium',
          targetScore: 95,
          venueOrRoom: 'Biomedical Wing B-12',
          notes: 'Diagram labelling of pituitary gland and neuron action potentials.',
        },
        {
          id: 'exam-4',
          userId: currentUserId,
          examName: 'Multivariate Calculus Comprehensive Final',
          subjectId: 'sub-4',
          subjectName: 'Engineering Calculus & Linear Algebra',
          examDate: addDays(formatDate(today), 20),
          startTime: '14:30',
          durationMinutes: 180,
          examType: 'Final Exam',
          difficulty: 'Medium',
          priority: 'High',
          targetScore: 90,
          venueOrRoom: 'Main Gymnasium Fieldhouse',
          notes: 'Stokes theorem, Eigenvectors, and Double integrals.',
        },
      ];
      localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(initialExams));
    }

    if (!localStorage.getItem(STORAGE_KEYS.CHAPTERS)) {
      const initialChapters: Chapter[] = [
        // Sub 1: CS 301
        {
          id: 'chap-1-1',
          subjectId: 'sub-1',
          userId: currentUserId,
          chapterNumber: 1,
          chapterName: 'Asymptotic Analysis & Recurrences',
          topicDescription: 'Big-O, Master Theorem, Akra-Bazzi method, amortized bounds',
          difficulty: 'Medium',
          importance: 'High',
          preparationStatus: 'Completed',
          estimatedStudyHours: 3.5,
          understandingLevel: 5,
          lastRevisedDate: addDays(formatDate(new Date()), -4),
          revisionCount: 3,
        },
        {
          id: 'chap-1-2',
          subjectId: 'sub-1',
          userId: currentUserId,
          chapterNumber: 2,
          chapterName: 'Balanced Search Trees & Heaps',
          topicDescription: 'AVL Trees, Red-Black Trees rotations, Binomial Heaps',
          difficulty: 'Hard',
          importance: 'High',
          preparationStatus: 'Completed',
          estimatedStudyHours: 4.0,
          understandingLevel: 4,
          lastRevisedDate: addDays(formatDate(new Date()), -2),
          revisionCount: 2,
        },
        {
          id: 'chap-1-3',
          subjectId: 'sub-1',
          userId: currentUserId,
          chapterNumber: 3,
          chapterName: 'Graph Algorithms (Dijkstra, Bellman-Ford, MST)',
          topicDescription: 'Shortest paths, Kruskal & Prim algorithms, topological sorting',
          difficulty: 'Hard',
          importance: 'High',
          preparationStatus: 'Needs Revision',
          estimatedStudyHours: 5.0,
          understandingLevel: 2,
          revisionCount: 1,
        },
        {
          id: 'chap-1-4',
          subjectId: 'sub-1',
          userId: currentUserId,
          chapterNumber: 4,
          chapterName: 'Dynamic Programming & Memoization',
          topicDescription: 'Knapsack, LCS, Matrix Chain Multiplication, state transitions',
          difficulty: 'Hard',
          importance: 'High',
          preparationStatus: 'In Progress',
          estimatedStudyHours: 6.0,
          understandingLevel: 2,
          revisionCount: 1,
        },
        {
          id: 'chap-1-5',
          subjectId: 'sub-1',
          userId: currentUserId,
          chapterNumber: 5,
          chapterName: 'Network Flow & NP-Completeness',
          topicDescription: 'Ford-Fulkerson, Edmonds-Karp, reductions (3-SAT to CLIQUE)',
          difficulty: 'Medium',
          importance: 'Medium',
          preparationStatus: 'Not Started',
          estimatedStudyHours: 4.0,
          understandingLevel: 1,
          revisionCount: 0,
        },

        // Sub 2: BIO 210
        {
          id: 'chap-2-1',
          subjectId: 'sub-2',
          userId: currentUserId,
          chapterNumber: 1,
          chapterName: 'Cellular Membrane Potential & Action Potentials',
          topicDescription: 'Voltage-gated Na+/K+ channels, refractory periods, synaptic transmission',
          difficulty: 'Medium',
          importance: 'High',
          preparationStatus: 'Completed',
          estimatedStudyHours: 3.0,
          understandingLevel: 4,
          revisionCount: 2,
        },
        {
          id: 'chap-2-2',
          subjectId: 'sub-2',
          userId: currentUserId,
          chapterNumber: 2,
          chapterName: 'Central Nervous System Architecture',
          topicDescription: 'Cortex lobes, limbic system, cranial nerves pathway, spinal cord tracts',
          difficulty: 'Hard',
          importance: 'High',
          preparationStatus: 'In Progress',
          estimatedStudyHours: 4.5,
          understandingLevel: 3,
          revisionCount: 1,
        },
        {
          id: 'chap-2-3',
          subjectId: 'sub-2',
          userId: currentUserId,
          chapterNumber: 3,
          chapterName: 'Endocrine System Hormonal Cascades',
          topicDescription: 'Hypothalamic-pituitary axis, thyroid hormones, calcium homeostasis',
          difficulty: 'Medium',
          importance: 'High',
          preparationStatus: 'Needs Revision',
          estimatedStudyHours: 4.0,
          understandingLevel: 2,
          revisionCount: 1,
        },
        {
          id: 'chap-2-4',
          subjectId: 'sub-2',
          userId: currentUserId,
          chapterNumber: 4,
          chapterName: 'Cardiovascular Hemodynamics & ECG',
          topicDescription: 'Cardiac cycle, Starling curve, baroreceptor reflex, lead II tracing',
          difficulty: 'Medium',
          importance: 'Medium',
          preparationStatus: 'Not Started',
          estimatedStudyHours: 3.5,
          understandingLevel: 1,
          revisionCount: 0,
        },

        // Sub 3: CHEM 222
        {
          id: 'chap-3-1',
          subjectId: 'sub-3',
          userId: currentUserId,
          chapterNumber: 1,
          chapterName: 'Electrophilic Aromatic Substitution (EAS)',
          topicDescription: 'Activating vs deactivating directors, nitration, Friedel-Crafts',
          difficulty: 'Medium',
          importance: 'High',
          preparationStatus: 'Completed',
          estimatedStudyHours: 3.0,
          understandingLevel: 4,
          revisionCount: 2,
        },
        {
          id: 'chap-3-2',
          subjectId: 'sub-3',
          userId: currentUserId,
          chapterNumber: 2,
          chapterName: 'Carbonyl Chemistry: Aldehydes & Ketones',
          topicDescription: 'Hydration, acetal protection, Wittig reaction, Grignard additions',
          difficulty: 'Hard',
          importance: 'High',
          preparationStatus: 'Completed',
          estimatedStudyHours: 4.5,
          understandingLevel: 4,
          revisionCount: 2,
        },
        {
          id: 'chap-3-3',
          subjectId: 'sub-3',
          userId: currentUserId,
          chapterNumber: 3,
          chapterName: 'Carboxylic Acid Derivatives & Enolates',
          topicDescription: 'Nucleophilic acyl substitution, Claisen, Aldol condensation, Michael addition',
          difficulty: 'Hard',
          importance: 'High',
          preparationStatus: 'In Progress',
          estimatedStudyHours: 5.0,
          understandingLevel: 2,
          revisionCount: 1,
        },
        {
          id: 'chap-3-4',
          subjectId: 'sub-3',
          userId: currentUserId,
          chapterNumber: 4,
          chapterName: 'Spectroscopy (1H-NMR, 13C-NMR, IR & MS)',
          topicDescription: 'Chemical shifts, splitting patterns, functional group IR absorption',
          difficulty: 'Medium',
          importance: 'High',
          preparationStatus: 'Needs Revision',
          estimatedStudyHours: 4.0,
          understandingLevel: 3,
          revisionCount: 1,
        },

        // Sub 4: MATH 250
        {
          id: 'chap-4-1',
          subjectId: 'sub-4',
          userId: currentUserId,
          chapterNumber: 1,
          chapterName: 'Vector Spaces & Subspaces',
          topicDescription: 'Span, linear independence, basis, dimension, Rank-Nullity theorem',
          difficulty: 'Easy',
          importance: 'Medium',
          preparationStatus: 'Completed',
          estimatedStudyHours: 2.5,
          understandingLevel: 5,
          revisionCount: 2,
        },
        {
          id: 'chap-4-2',
          subjectId: 'sub-4',
          userId: currentUserId,
          chapterNumber: 2,
          chapterName: 'Eigenvalues, Eigenvectors & Diagonalization',
          topicDescription: 'Characteristic polynomial, algebraic vs geometric multiplicity, symmetric matrices',
          difficulty: 'Medium',
          importance: 'High',
          preparationStatus: 'Completed',
          estimatedStudyHours: 3.5,
          understandingLevel: 4,
          revisionCount: 2,
        },
        {
          id: 'chap-4-3',
          subjectId: 'sub-4',
          userId: currentUserId,
          chapterNumber: 3,
          chapterName: 'Multiple Integrals & Coordinate Transformations',
          topicDescription: 'Double/triple integrals, Jacobian determinant, cylindrical & spherical coords',
          difficulty: 'Hard',
          importance: 'High',
          preparationStatus: 'In Progress',
          estimatedStudyHours: 4.5,
          understandingLevel: 3,
          revisionCount: 1,
        },
        {
          id: 'chap-4-4',
          subjectId: 'sub-4',
          userId: currentUserId,
          chapterNumber: 4,
          chapterName: 'Vector Calculus: Green’s, Stokes’ & Divergence Theorems',
          topicDescription: 'Line integrals, surface integrals, flux, conservative vector fields',
          difficulty: 'Hard',
          importance: 'High',
          preparationStatus: 'Not Started',
          estimatedStudyHours: 5.0,
          understandingLevel: 1,
          revisionCount: 0,
        },
      ];
      localStorage.setItem(STORAGE_KEYS.CHAPTERS, JSON.stringify(initialChapters));
    }

    // Initialize Tasks using scheduler
    if (!localStorage.getItem(STORAGE_KEYS.TASKS)) {
      const exams = this.getExams();
      const subjects = this.getSubjects();
      const chapters = this.getChapters();
      const currentUser = this.getCurrentUser();
      const options: ScheduleGeneratorOptions = {
        startDate: formatDate(new Date()),
        dailyAvailableHours: currentUser?.studyPreferences.dailyAvailableHours || 4,
        sessionDurationMinutes: currentUser?.studyPreferences.sessionDurationMinutes || 50,
        breakDurationMinutes: currentUser?.studyPreferences.breakDurationMinutes || 10,
        reservePreExamDays: currentUser?.studyPreferences.reservePreExamDays || 1,
        preserveCompletedSessions: true,
        boostWeakChapters: true,
        preferredDailyStartTime: currentUser?.studyPreferences.preferredStartTime || '09:00',
      };

      const { newTasks } = generateSmartSchedule(exams, subjects, chapters, [], options);

      // Mark a couple of early tasks as completed for rich historical display
      const todayStr = formatDate(new Date());
      if (newTasks.length > 0) {
        newTasks[0].isCompleted = true;
        newTasks[0].completedAt = `${todayStr}T10:15:00Z`;
        newTasks[0].actualDurationMinutes = 48;
      }

      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(newTasks));
    }

    // Initialize Sessions logs
    if (!localStorage.getItem(STORAGE_KEYS.SESSIONS)) {
      const today = new Date();
      const initialSessions: StudySessionLog[] = [
        {
          id: 'sess-1',
          userId: currentUserId,
          subjectId: 'sub-1',
          subjectName: 'Data Structures & Algorithms',
          chapterName: 'Asymptotic Analysis & Recurrences',
          date: addDays(formatDate(today), -3),
          durationMinutes: 50,
          focusRating: 5,
          notes: 'Master theorem proof completed and practiced 6 divide-and-conquer problems.',
          timestamp: new Date(Date.now() - 3 * 86400000).toISOString(),
        },
        {
          id: 'sess-2',
          userId: currentUserId,
          subjectId: 'sub-1',
          subjectName: 'Data Structures & Algorithms',
          chapterName: 'Balanced Search Trees & Heaps',
          date: addDays(formatDate(today), -2),
          durationMinutes: 55,
          focusRating: 4,
          notes: 'Red-black tree insertion rotations case 1, 2, 3 mapped out on whiteboard.',
          timestamp: new Date(Date.now() - 2 * 86400000).toISOString(),
        },
        {
          id: 'sess-3',
          userId: currentUserId,
          subjectId: 'sub-3',
          subjectName: 'Organic Chemistry II',
          chapterName: 'Electrophilic Aromatic Substitution',
          date: addDays(formatDate(today), -1),
          durationMinutes: 60,
          focusRating: 5,
          notes: 'Synthesized ortho/para directing group mechanisms.',
          timestamp: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: 'sess-4',
          userId: currentUserId,
          subjectId: 'sub-4',
          subjectName: 'Engineering Calculus & Linear Algebra',
          chapterName: 'Vector Spaces & Subspaces',
          date: formatDate(today),
          durationMinutes: 45,
          focusRating: 4,
          notes: 'Basis and dimension verification questions from Chapter 4.',
          timestamp: new Date().toISOString(),
        },
      ];
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(initialSessions));
    }

    // Initialize Notifications
    if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
      const today = new Date();
      const initialNotifications: AppNotification[] = [
        {
          id: 'notif-1',
          userId: currentUserId,
          title: 'Upcoming Exam: Data Structures Midterm',
          message: 'Your midterm is in 5 days! Recommended: finish Graph Algorithms & DP reviews today.',
          type: 'EXAM_COUNTDOWN',
          date: formatDate(today),
          read: false,
          actionUrl: '/exams',
          actionLabel: 'View Exam Details',
          examId: 'exam-1',
        },
        {
          id: 'notif-2',
          userId: currentUserId,
          title: 'Spaced Repetition Review Due',
          message: 'Review session for "Balanced Search Trees & Heaps" is scheduled today.',
          type: 'TODAY_TASK',
          date: formatDate(today),
          read: false,
          actionUrl: '/planner',
          actionLabel: 'Go to Daily Planner',
        },
        {
          id: 'notif-3',
          userId: currentUserId,
          title: 'Weak Topic Flagged',
          message: '"Graph Algorithms (Dijkstra, Bellman-Ford)" currently has low understanding (2/5). Smart scheduler allocated additional reinforcement.',
          type: 'WEAK_TOPIC',
          date: addDays(formatDate(today), -1),
          read: false,
          actionUrl: '/subjects',
          actionLabel: 'Inspect Chapter',
        },
      ];
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(initialNotifications));
    }
  }

  // --- Users & Auth ---
  static getCurrentUser(): User | null {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return raw ? JSON.parse(raw) : null;
  }

  static setCurrentUser(user: User | null) {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
    this.notify();
  }

  static getUsers(): User[] {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    return raw ? JSON.parse(raw) : SEED_USERS;
  }

  static saveUser(user: User) {
    const users = this.getUsers();
    const idx = users.findIndex((u) => u.id === user.id);
    if (idx >= 0) {
      users[idx] = user;
    } else {
      users.push(user);
    }
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

    const current = this.getCurrentUser();
    if (current?.id === user.id) {
      this.setCurrentUser(user);
    }
    this.notify();
  }

  static switchUser(userId: string): User | null {
    const users = this.getUsers();
    const user = users.find((u) => u.id === userId);
    if (user) {
      this.setCurrentUser(user);
      return user;
    }
    return null;
  }

  // --- Exams ---
  static getExams(): Exam[] {
    const raw = localStorage.getItem(STORAGE_KEYS.EXAMS);
    const currentUser = this.getCurrentUser();
    const exams: Exam[] = raw ? JSON.parse(raw) : [];
    if (!currentUser) return exams;
    // Admin sees all, student sees own
    if (currentUser.role === 'ADMIN') return exams;
    return exams.filter((e) => e.userId === currentUser.id);
  }

  static saveExam(exam: Exam) {
    const raw = localStorage.getItem(STORAGE_KEYS.EXAMS);
    const exams: Exam[] = raw ? JSON.parse(raw) : [];
    const idx = exams.findIndex((e) => e.id === exam.id);
    if (idx >= 0) {
      exams[idx] = exam;
    } else {
      exams.push(exam);
    }
    localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(exams));
    this.notify();
  }

  static deleteExam(examId: string) {
    const exams = this.getExams().filter((e) => e.id !== examId);
    localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(exams));

    // Also remove tasks linked to this exam
    const tasks = this.getTasks().filter((t) => t.examId !== examId);
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));

    this.notify();
  }

  // --- Subjects ---
  static getSubjects(): Subject[] {
    const raw = localStorage.getItem(STORAGE_KEYS.SUBJECTS);
    const currentUser = this.getCurrentUser();
    const subjects: Subject[] = raw ? JSON.parse(raw) : [];
    if (!currentUser) return subjects;
    if (currentUser.role === 'ADMIN') return subjects;
    return subjects.filter((s) => s.userId === currentUser.id);
  }

  static saveSubject(subject: Subject) {
    const raw = localStorage.getItem(STORAGE_KEYS.SUBJECTS);
    const subjects: Subject[] = raw ? JSON.parse(raw) : [];
    const idx = subjects.findIndex((s) => s.id === subject.id);
    if (idx >= 0) {
      subjects[idx] = subject;
    } else {
      subjects.push(subject);
    }
    localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(subjects));
    this.notify();
  }

  static deleteSubject(subjectId: string) {
    const subjects = this.getSubjects().filter((s) => s.id !== subjectId);
    localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(subjects));

    // Delete chapters of this subject
    const chapters = this.getChapters().filter((c) => c.subjectId !== subjectId);
    localStorage.setItem(STORAGE_KEYS.CHAPTERS, JSON.stringify(chapters));

    // Delete exams of this subject
    const exams = this.getExams().filter((e) => e.subjectId !== subjectId);
    localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(exams));

    // Delete tasks of this subject
    const tasks = this.getTasks().filter((t) => t.subjectId !== subjectId);
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));

    this.notify();
  }

  // --- Chapters ---
  static getChapters(): Chapter[] {
    const raw = localStorage.getItem(STORAGE_KEYS.CHAPTERS);
    const currentUser = this.getCurrentUser();
    const chapters: Chapter[] = raw ? JSON.parse(raw) : [];
    if (!currentUser) return chapters;
    if (currentUser.role === 'ADMIN') return chapters;
    return chapters.filter((c) => c.userId === currentUser.id);
  }

  static saveChapter(chapter: Chapter) {
    const raw = localStorage.getItem(STORAGE_KEYS.CHAPTERS);
    const chapters: Chapter[] = raw ? JSON.parse(raw) : [];
    const idx = chapters.findIndex((c) => c.id === chapter.id);
    if (idx >= 0) {
      chapters[idx] = chapter;
    } else {
      chapters.push(chapter);
    }
    localStorage.setItem(STORAGE_KEYS.CHAPTERS, JSON.stringify(chapters));

    // Update subject chapter counts
    this.updateSubjectChapterCounts(chapter.subjectId);
    this.notify();
  }

  static deleteChapter(chapterId: string) {
    const chapter = this.getChapters().find((c) => c.id === chapterId);
    const chapters = this.getChapters().filter((c) => c.id !== chapterId);
    localStorage.setItem(STORAGE_KEYS.CHAPTERS, JSON.stringify(chapters));

    if (chapter) {
      this.updateSubjectChapterCounts(chapter.subjectId);
    }

    // Delete tasks for this chapter
    const tasks = this.getTasks().filter((t) => t.chapterId !== chapterId);
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));

    this.notify();
  }

  private static updateSubjectChapterCounts(subjectId: string) {
    const chapters = this.getChapters().filter((c) => c.subjectId === subjectId);
    const completed = chapters.filter((c) => c.preparationStatus === 'Completed').length;
    const subjects = this.getSubjects();
    const subj = subjects.find((s) => s.id === subjectId);
    if (subj) {
      subj.totalChaptersCount = chapters.length;
      subj.completedChaptersCount = completed;
      this.saveSubject(subj);
    }
  }

  // --- Revision Tasks ---
  static getTasks(): RevisionTask[] {
    const raw = localStorage.getItem(STORAGE_KEYS.TASKS);
    const currentUser = this.getCurrentUser();
    const tasks: RevisionTask[] = raw ? JSON.parse(raw) : [];
    if (!currentUser) return tasks;
    if (currentUser.role === 'ADMIN') return tasks;
    return tasks.filter((t) => t.userId === currentUser.id);
  }

  static saveTask(task: RevisionTask) {
    const raw = localStorage.getItem(STORAGE_KEYS.TASKS);
    const tasks: RevisionTask[] = raw ? JSON.parse(raw) : [];
    const idx = tasks.findIndex((t) => t.id === task.id);
    if (idx >= 0) {
      tasks[idx] = task;
    } else {
      tasks.push(task);
    }
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    this.notify();
  }

  static toggleTaskCompletion(taskId: string): RevisionTask | null {
    const tasks = this.getTasks();
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return null;

    task.isCompleted = !task.isCompleted;
    if (task.isCompleted) {
      task.completedAt = new Date().toISOString();
      task.actualDurationMinutes = task.durationMinutes;

      // Also record in study sessions
      this.recordStudySession({
        id: `sess-${Date.now()}`,
        userId: task.userId,
        taskId: task.id,
        subjectId: task.subjectId,
        subjectName: task.subjectName,
        chapterName: task.chapterName,
        date: task.scheduledDate,
        durationMinutes: task.durationMinutes,
        focusRating: 5,
        notes: `Completed planned ${task.revisionType} session.`,
        timestamp: new Date().toISOString(),
      });

      // Update chapter revision count
      const chapter = this.getChapters().find((c) => c.id === task.chapterId);
      if (chapter) {
        chapter.revisionCount = (chapter.revisionCount || 0) + 1;
        chapter.lastRevisedDate = task.scheduledDate;
        if (chapter.preparationStatus === 'Not Started') {
          chapter.preparationStatus = 'In Progress';
        }
        this.saveChapter(chapter);
      }
    } else {
      task.completedAt = undefined;
      task.actualDurationMinutes = undefined;
    }

    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    this.notify();
    return task;
  }

  static rescheduleTask(taskId: string): RevisionTask | null {
    const tasks = this.getTasks();
    const task = tasks.find((t) => t.id === taskId);
    const currentUser = this.getCurrentUser();
    if (!task || !currentUser) return null;

    const options: ScheduleGeneratorOptions = {
      startDate: formatDate(new Date()),
      dailyAvailableHours: currentUser.studyPreferences.dailyAvailableHours,
      sessionDurationMinutes: currentUser.studyPreferences.sessionDurationMinutes,
      breakDurationMinutes: currentUser.studyPreferences.breakDurationMinutes,
      reservePreExamDays: currentUser.studyPreferences.reservePreExamDays,
      preserveCompletedSessions: true,
      boostWeakChapters: true,
      preferredDailyStartTime: currentUser.studyPreferences.preferredStartTime,
    };

    const { updatedTasks, rescheduledTask } = rescheduleMissedTask(task, tasks, options);
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(updatedTasks));
    this.notify();
    return rescheduledTask;
  }

  static regenerateSchedule(options: ScheduleGeneratorOptions): { totalGenerated: number } {
    const exams = this.getExams();
    const subjects = this.getSubjects();
    const chapters = this.getChapters();
    const existingTasks = this.getTasks();

    const { newTasks, totalGenerated } = generateSmartSchedule(
      exams,
      subjects,
      chapters,
      existingTasks,
      options
    );

    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(newTasks));

    // Post notification
    this.addNotification({
      id: `notif-${Date.now()}`,
      userId: options.startDate,
      title: 'New Smart Schedule Generated',
      message: `Successfully scheduled ${totalGenerated} revision sessions balanced with spaced repetition.`,
      type: 'SYSTEM',
      date: formatDate(new Date()),
      read: false,
      actionUrl: '/planner',
      actionLabel: 'View Schedule',
    });

    this.notify();
    return { totalGenerated };
  }

  // --- Study Sessions ---
  static getStudySessions(): StudySessionLog[] {
    const raw = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    const currentUser = this.getCurrentUser();
    const sessions: StudySessionLog[] = raw ? JSON.parse(raw) : [];
    if (!currentUser) return sessions;
    if (currentUser.role === 'ADMIN') return sessions;
    return sessions.filter((s) => s.userId === currentUser.id);
  }

  static recordStudySession(session: StudySessionLog) {
    const sessions = this.getStudySessions();
    sessions.unshift(session);
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
    this.notify();
  }

  // --- Notifications ---
  static getNotifications(): AppNotification[] {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    const currentUser = this.getCurrentUser();
    const notifs: AppNotification[] = raw ? JSON.parse(raw) : [];
    if (!currentUser) return notifs;
    if (currentUser.role === 'ADMIN') return notifs;
    return notifs.filter((n) => n.userId === currentUser.id || n.userId === 'all');
  }

  static addNotification(notif: AppNotification) {
    const notifs = this.getNotifications();
    notifs.unshift(notif);
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
    this.notify();
  }

  static markNotificationAsRead(id: string) {
    const notifs = this.getNotifications();
    const n = notifs.find((item) => item.id === id);
    if (n) {
      n.read = true;
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
      this.notify();
    }
  }

  static markAllNotificationsRead() {
    const notifs = this.getNotifications().map((n) => ({ ...n, read: true }));
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
    this.notify();
  }

  // Reset demo data
  static resetToDefaults() {
    localStorage.removeItem(STORAGE_KEYS.EXAMS);
    localStorage.removeItem(STORAGE_KEYS.SUBJECTS);
    localStorage.removeItem(STORAGE_KEYS.CHAPTERS);
    localStorage.removeItem(STORAGE_KEYS.TASKS);
    localStorage.removeItem(STORAGE_KEYS.SESSIONS);
    localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
    this.init();
    this.notify();
  }
}
