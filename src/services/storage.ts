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
    schoolOrUniversity: 'MIT (Electrical & Computer Eng)',
    targetGpaOrGoal: 'Dean’s Honors List / 4.0 GPA',
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
    id: 'user-student-3',
    name: 'Marcus Vance',
    email: 'marcus.vance@berkeley.edu',
    role: 'STUDENT',
    schoolOrUniversity: 'UC Berkeley (Software Systems & AI)',
    targetGpaOrGoal: 'High Honors / 3.85+ GPA',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-09-15T11:00:00Z',
    studyPreferences: {
      dailyAvailableHours: 4,
      preferredStartTime: '10:00',
      preferredEndTime: '22:00',
      sessionDurationMinutes: 45,
      breakDurationMinutes: 10,
      reservePreExamDays: 1,
      enableSpacedRepetition: true,
      focusWeakSubjects: true,
      emailNotifications: true,
      dailyReminderTime: '08:30',
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
    const existingRawSubjects = localStorage.getItem(STORAGE_KEYS.SUBJECTS);
    const hasAll7 =
      Boolean(existingRawSubjects) &&
      existingRawSubjects!.includes('Deep Learning') &&
      existingRawSubjects!.includes('CNS') &&
      existingRawSubjects!.includes('Gen AI') &&
      existingRawSubjects!.includes('Java') &&
      existingRawSubjects!.includes('Python') &&
      existingRawSubjects!.includes('NLP') &&
      existingRawSubjects!.includes('FSD');
    const needsCurriculumUpdate = !hasAll7;

    if (needsCurriculumUpdate) {
      const initialSubjects: Subject[] = [
        {
          id: 'sub-dl',
          userId: currentUserId,
          name: 'Deep Learning',
          code: 'CS 420',
          color: '#6366F1', // Indigo
          instructor: 'Prof. Yoshua Bengio',
          creditHours: 4,
          totalChaptersCount: 5,
          completedChaptersCount: 2,
        },
        {
          id: 'sub-cns',
          userId: currentUserId,
          name: 'Cryptography & Network Security (CNS)',
          code: 'CS 450',
          color: '#0284C7', // Sky Blue
          instructor: 'Dr. Bruce Schneier',
          creditHours: 4,
          totalChaptersCount: 5,
          completedChaptersCount: 2,
        },
        {
          id: 'sub-genai',
          userId: currentUserId,
          name: 'Generative AI (Gen AI)',
          code: 'AI 480',
          color: '#EC4899', // Pink
          instructor: 'Dr. Fei-Fei Li',
          creditHours: 4,
          totalChaptersCount: 5,
          completedChaptersCount: 2,
        },
        {
          id: 'sub-java',
          userId: currentUserId,
          name: 'Java Programming & Enterprise Apps',
          code: 'CS 210',
          color: '#D97706', // Amber
          instructor: 'Prof. James Gosling',
          creditHours: 4,
          totalChaptersCount: 5,
          completedChaptersCount: 3,
        },
        {
          id: 'sub-python',
          userId: currentUserId,
          name: 'Python & Scientific Computing',
          code: 'CS 105',
          color: '#059669', // Emerald
          instructor: 'Dr. Guido van Rossum',
          creditHours: 3,
          totalChaptersCount: 5,
          completedChaptersCount: 3,
        },
        {
          id: 'sub-nlp',
          userId: currentUserId,
          name: 'Natural Language Processing (NLP)',
          code: 'CS 460',
          color: '#7C3AED', // Purple
          instructor: 'Dr. Christopher Manning',
          creditHours: 4,
          totalChaptersCount: 5,
          completedChaptersCount: 2,
        },
        {
          id: 'sub-fsd',
          userId: currentUserId,
          name: 'Full Stack Development (FSD)',
          code: 'CS 350',
          color: '#2563EB', // Royal Blue
          instructor: 'Prof. Dan Abramov',
          creditHours: 4,
          totalChaptersCount: 5,
          completedChaptersCount: 2,
        },
      ];
      localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(initialSubjects));

      const today = new Date();
      const initialExams: Exam[] = [
        {
          id: 'exam-dl',
          userId: currentUserId,
          examName: 'Deep Learning Midterm Examination',
          subjectId: 'sub-dl',
          subjectName: 'Deep Learning',
          examDate: addDays(formatDate(today), 4),
          startTime: '09:30',
          durationMinutes: 120,
          examType: 'Midterm',
          difficulty: 'Hard',
          priority: 'High',
          targetScore: 92,
          venueOrRoom: 'Turing Neural Hall 301',
          notes: 'Focus on Backpropagation calculus, CNN convolutions, and Transformer self-attention matrices.',
        },
        {
          id: 'exam-cns',
          userId: currentUserId,
          examName: 'CNS End-Term Security Examination',
          subjectId: 'sub-cns',
          subjectName: 'Cryptography & Network Security (CNS)',
          examDate: addDays(formatDate(today), 8),
          startTime: '13:30',
          durationMinutes: 100,
          examType: 'Midterm',
          difficulty: 'Hard',
          priority: 'High',
          targetScore: 90,
          venueOrRoom: 'Cybersecurity Wing B-4',
          notes: 'RSA modular arithmetic, AES key expansion, and TLS 1.3 handshake packet inspection.',
        },
        {
          id: 'exam-genai',
          userId: currentUserId,
          examName: 'Generative AI Capstone & Model Evaluation',
          subjectId: 'sub-genai',
          subjectName: 'Generative AI (Gen AI)',
          examDate: addDays(formatDate(today), 12),
          startTime: '10:00',
          durationMinutes: 90,
          examType: 'Final Exam',
          difficulty: 'Hard',
          priority: 'High',
          targetScore: 95,
          venueOrRoom: 'AI Innovation Center Room 102',
          notes: 'RAG chunking strategies, vector embeddings cosine distance, and LoRA rank adaptation.',
        },
        {
          id: 'exam-java',
          userId: currentUserId,
          examName: 'Java Enterprise Architecture & Concurrency Final',
          subjectId: 'sub-java',
          subjectName: 'Java Programming & Enterprise Apps',
          examDate: addDays(formatDate(today), 16),
          startTime: '14:00',
          durationMinutes: 120,
          examType: 'Final Exam',
          difficulty: 'Medium',
          priority: 'High',
          targetScore: 88,
          venueOrRoom: 'Software Engineering Complex 204',
          notes: 'Virtual threads, Spring Boot dependency injection, and JVM memory tuning.',
        },
        {
          id: 'exam-nlp',
          userId: currentUserId,
          examName: 'Natural Language Processing Comprehensive Final',
          subjectId: 'sub-nlp',
          subjectName: 'Natural Language Processing (NLP)',
          examDate: addDays(formatDate(today), 20),
          startTime: '09:00',
          durationMinutes: 120,
          examType: 'Final Exam',
          difficulty: 'Hard',
          priority: 'High',
          targetScore: 92,
          venueOrRoom: 'Linguistics & Informatics Hall 105',
          notes: 'Word2Vec negative sampling, BERT masked language modeling, and BLEU evaluation metrics.',
        },
        {
          id: 'exam-fsd',
          userId: currentUserId,
          examName: 'Full Stack Development Practical Lab Exam',
          subjectId: 'sub-fsd',
          subjectName: 'Full Stack Development (FSD)',
          examDate: addDays(formatDate(today), 24),
          startTime: '11:00',
          durationMinutes: 180,
          examType: 'Practical / Lab',
          difficulty: 'Medium',
          priority: 'High',
          targetScore: 94,
          venueOrRoom: 'Full Stack Development Lab Desk 18',
          notes: 'Build and deploy a full-stack REST API with React frontend and JWT authentication.',
        },
        {
          id: 'exam-py',
          userId: currentUserId,
          examName: 'Python Systems & Scientific Computing Exam',
          subjectId: 'sub-python',
          subjectName: 'Python & Scientific Computing',
          examDate: addDays(formatDate(today), 28),
          startTime: '15:00',
          durationMinutes: 90,
          examType: 'Unit Test',
          difficulty: 'Easy',
          priority: 'Medium',
          targetScore: 96,
          venueOrRoom: 'Data Science Lab 4',
          notes: 'NumPy broadcasting, Pandas aggregation queries, and Asyncio event loops.',
        },
      ];
      localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(initialExams));

      const initialChapters: Chapter[] = [
        // 1. Deep Learning
        {
          id: 'chap-dl-1',
          subjectId: 'sub-dl',
          userId: currentUserId,
          chapterNumber: 1,
          chapterName: 'Neural Network Foundations & Backpropagation',
          topicDescription: 'Perceptron, activation functions, loss functions, chain rule gradient computation',
          difficulty: 'Medium',
          importance: 'High',
          preparationStatus: 'Completed',
          estimatedStudyHours: 3.5,
          understandingLevel: 5,
          lastRevisedDate: addDays(formatDate(new Date()), -3),
          revisionCount: 3,
        },
        {
          id: 'chap-dl-2',
          subjectId: 'sub-dl',
          userId: currentUserId,
          chapterNumber: 2,
          chapterName: 'Convolutional Neural Networks (CNNs) & Visual Features',
          topicDescription: 'Kernel convolutions, pooling, feature maps, ResNet residual skip connections',
          difficulty: 'Hard',
          importance: 'High',
          preparationStatus: 'Completed',
          estimatedStudyHours: 4.0,
          understandingLevel: 4,
          lastRevisedDate: addDays(formatDate(new Date()), -1),
          revisionCount: 2,
        },
        {
          id: 'chap-dl-3',
          subjectId: 'sub-dl',
          userId: currentUserId,
          chapterNumber: 3,
          chapterName: 'Recurrent Architectures, LSTMs & GRUs',
          topicDescription: 'Sequence modeling, vanishing gradients, forget and candidate gates in LSTM',
          difficulty: 'Hard',
          importance: 'High',
          preparationStatus: 'In Progress',
          estimatedStudyHours: 4.5,
          understandingLevel: 3,
          revisionCount: 1,
        },
        {
          id: 'chap-dl-4',
          subjectId: 'sub-dl',
          userId: currentUserId,
          chapterNumber: 4,
          chapterName: 'Multi-Head Attention & Transformer Architectures',
          topicDescription: 'Scaled dot-product attention, query-key-value projections, positional encoding',
          difficulty: 'Hard',
          importance: 'High',
          preparationStatus: 'Needs Revision',
          estimatedStudyHours: 5.0,
          understandingLevel: 2,
          revisionCount: 1,
        },
        {
          id: 'chap-dl-5',
          subjectId: 'sub-dl',
          userId: currentUserId,
          chapterNumber: 5,
          chapterName: 'Optimization: Adam, RMSProp, Dropout & Batch Normalization',
          topicDescription: 'Momentum, adaptive learning rates, weight decay, internal covariate shift mitigation',
          difficulty: 'Medium',
          importance: 'Medium',
          preparationStatus: 'Not Started',
          estimatedStudyHours: 3.0,
          understandingLevel: 1,
          revisionCount: 0,
        },

        // 2. Cryptography & Network Security (CNS)
        {
          id: 'chap-cns-1',
          subjectId: 'sub-cns',
          userId: currentUserId,
          chapterNumber: 1,
          chapterName: 'Classical Ciphers & Symmetric Encryption (DES, AES)',
          topicDescription: 'Substitution/Transposition, Feistel network, AES substitution-permutation rounds',
          difficulty: 'Medium',
          importance: 'High',
          preparationStatus: 'Completed',
          estimatedStudyHours: 3.0,
          understandingLevel: 5,
          revisionCount: 2,
        },
        {
          id: 'chap-cns-2',
          subjectId: 'sub-cns',
          userId: currentUserId,
          chapterNumber: 2,
          chapterName: 'Asymmetric Cryptography: RSA & Diffie-Hellman Key Exchange',
          topicDescription: 'Euler totient, prime factor trapdoor, discrete log problem, man-in-the-middle prevention',
          difficulty: 'Hard',
          importance: 'High',
          preparationStatus: 'Completed',
          estimatedStudyHours: 4.0,
          understandingLevel: 4,
          revisionCount: 2,
        },
        {
          id: 'chap-cns-3',
          subjectId: 'sub-cns',
          userId: currentUserId,
          chapterNumber: 3,
          chapterName: 'Cryptographic Hash Functions, HMAC & Digital Signatures',
          topicDescription: 'Collision resistance, SHA-256 Merkle-Damgard, DSA, PKI and X.509 certificates',
          difficulty: 'Medium',
          importance: 'High',
          preparationStatus: 'In Progress',
          estimatedStudyHours: 3.5,
          understandingLevel: 3,
          revisionCount: 1,
        },
        {
          id: 'chap-cns-4',
          subjectId: 'sub-cns',
          userId: currentUserId,
          chapterNumber: 4,
          chapterName: 'Network Security Protocols: SSL/TLS, IPSec & HTTPS',
          topicDescription: 'TLS 1.3 handshake, cipher suite negotiation, ESP and AH modes in IPSec',
          difficulty: 'Hard',
          importance: 'High',
          preparationStatus: 'Needs Revision',
          estimatedStudyHours: 4.5,
          understandingLevel: 2,
          revisionCount: 1,
        },
        {
          id: 'chap-cns-5',
          subjectId: 'sub-cns',
          userId: currentUserId,
          chapterNumber: 5,
          chapterName: 'Firewalls, Intrusion Prevention & Zero-Trust Architecture',
          topicDescription: 'Packet filtering, stateful inspection, DMZ, signature vs anomaly IDS, microsegmentation',
          difficulty: 'Medium',
          importance: 'Medium',
          preparationStatus: 'Not Started',
          estimatedStudyHours: 3.0,
          understandingLevel: 1,
          revisionCount: 0,
        },

        // 3. Generative AI (Gen AI)
        {
          id: 'chap-genai-1',
          subjectId: 'sub-genai',
          userId: currentUserId,
          chapterNumber: 1,
          chapterName: 'Foundation LLM Architecture, Pretraining & Scaling Laws',
          topicDescription: 'Decoder-only transformers, causal masking, Chinchilla scaling laws, tokenizers',
          difficulty: 'Hard',
          importance: 'High',
          preparationStatus: 'Completed',
          estimatedStudyHours: 4.0,
          understandingLevel: 4,
          revisionCount: 2,
        },
        {
          id: 'chap-genai-2',
          subjectId: 'sub-genai',
          userId: currentUserId,
          chapterNumber: 2,
          chapterName: 'Advanced Prompt Engineering & In-Context Learning',
          topicDescription: 'Chain-of-thought, ReAct prompting, few-shot conditioning, structured JSON outputs',
          difficulty: 'Easy',
          importance: 'High',
          preparationStatus: 'Completed',
          estimatedStudyHours: 2.5,
          understandingLevel: 5,
          revisionCount: 2,
        },
        {
          id: 'chap-genai-3',
          subjectId: 'sub-genai',
          userId: currentUserId,
          chapterNumber: 3,
          chapterName: 'Retrieval-Augmented Generation (RAG) & Vector Databases',
          topicDescription: 'Document chunking, dense vector retrieval (HNSW), semantic reranking, hybrid search',
          difficulty: 'Hard',
          importance: 'High',
          preparationStatus: 'In Progress',
          estimatedStudyHours: 4.5,
          understandingLevel: 3,
          revisionCount: 1,
        },
        {
          id: 'chap-genai-4',
          subjectId: 'sub-genai',
          userId: currentUserId,
          chapterNumber: 4,
          chapterName: 'Parameter-Efficient Fine-Tuning: LoRA, QLoRA & Alignment',
          topicDescription: 'Low-rank matrix adaptation, 4-bit quantization, RLHF reward models, DPO loss',
          difficulty: 'Hard',
          importance: 'High',
          preparationStatus: 'Needs Revision',
          estimatedStudyHours: 5.0,
          understandingLevel: 2,
          revisionCount: 1,
        },
        {
          id: 'chap-genai-5',
          subjectId: 'sub-genai',
          userId: currentUserId,
          chapterNumber: 5,
          chapterName: 'Diffusion Models, Latent Space Sampling & Multimodal AI',
          topicDescription: 'Forward noise addition, reverse denoising U-Net, CLIP text-image cross attention',
          difficulty: 'Hard',
          importance: 'Medium',
          preparationStatus: 'Not Started',
          estimatedStudyHours: 4.0,
          understandingLevel: 1,
          revisionCount: 0,
        },

        // 4. Java Programming
        {
          id: 'chap-java-1',
          subjectId: 'sub-java',
          userId: currentUserId,
          chapterNumber: 1,
          chapterName: 'OOP Principles: Polymorphism, Inheritance & Interfaces',
          topicDescription: 'Encapsulation, abstract classes, default interface methods, composition over inheritance',
          difficulty: 'Easy',
          importance: 'High',
          preparationStatus: 'Completed',
          estimatedStudyHours: 3.0,
          understandingLevel: 5,
          revisionCount: 3,
        },
        {
          id: 'chap-java-2',
          subjectId: 'sub-java',
          userId: currentUserId,
          chapterNumber: 2,
          chapterName: 'Java Collections Framework & Generics Deep-Dive',
          topicDescription: 'ArrayList vs LinkedList, HashMap internal bucket hashing, TreeMap, wildcard generics',
          difficulty: 'Medium',
          importance: 'High',
          preparationStatus: 'Completed',
          estimatedStudyHours: 3.5,
          understandingLevel: 4,
          revisionCount: 2,
        },
        {
          id: 'chap-java-3',
          subjectId: 'sub-java',
          userId: currentUserId,
          chapterNumber: 3,
          chapterName: 'Multithreading, Concurrency & Java 21 Virtual Threads',
          topicDescription: 'Synchronized blocks, locks, ExecutorService, Project Loom virtual thread lightweight scheduling',
          difficulty: 'Hard',
          importance: 'High',
          preparationStatus: 'Completed',
          estimatedStudyHours: 4.5,
          understandingLevel: 4,
          revisionCount: 2,
        },
        {
          id: 'chap-java-4',
          subjectId: 'sub-java',
          userId: currentUserId,
          chapterNumber: 4,
          chapterName: 'Spring Boot REST Architecture, DI & Spring Data JPA',
          topicDescription: 'Inversion of control, annotations (@Autowired, @RestController), repository queries',
          difficulty: 'Medium',
          importance: 'High',
          preparationStatus: 'In Progress',
          estimatedStudyHours: 4.0,
          understandingLevel: 3,
          revisionCount: 1,
        },
        {
          id: 'chap-java-5',
          subjectId: 'sub-java',
          userId: currentUserId,
          chapterNumber: 5,
          chapterName: 'JVM Memory Model, ClassLoading & Garbage Collection',
          topicDescription: 'Heap generations (Eden, Survivor, Tenured), Metaspace, GC algorithms (G1, ZGC)',
          difficulty: 'Hard',
          importance: 'Medium',
          preparationStatus: 'Needs Revision',
          estimatedStudyHours: 3.5,
          understandingLevel: 2,
          revisionCount: 1,
        },

        // 5. Python & Scientific Computing
        {
          id: 'chap-py-1',
          subjectId: 'sub-python',
          userId: currentUserId,
          chapterNumber: 1,
          chapterName: 'Python Data Structures, Comprehensions & Iterators',
          topicDescription: 'Dict/set lookups, generator expressions, yield statements, itertools operations',
          difficulty: 'Easy',
          importance: 'High',
          preparationStatus: 'Completed',
          estimatedStudyHours: 2.5,
          understandingLevel: 5,
          revisionCount: 2,
        },
        {
          id: 'chap-py-2',
          subjectId: 'sub-python',
          userId: currentUserId,
          chapterNumber: 2,
          chapterName: 'Object-Oriented Python, Dunder Methods & Decorators',
          topicDescription: '__repr__, __call__, __enter__/__exit__ context managers, function/class decorators',
          difficulty: 'Medium',
          importance: 'High',
          preparationStatus: 'Completed',
          estimatedStudyHours: 3.5,
          understandingLevel: 4,
          revisionCount: 2,
        },
        {
          id: 'chap-py-3',
          subjectId: 'sub-python',
          userId: currentUserId,
          chapterNumber: 3,
          chapterName: 'Numerical Computing with NumPy & Vectorization',
          topicDescription: 'Ndarray slicing, broadcasting rules, linear algebra dot products, memory layouts (C/F)',
          difficulty: 'Medium',
          importance: 'High',
          preparationStatus: 'Completed',
          estimatedStudyHours: 3.5,
          understandingLevel: 4,
          revisionCount: 2,
        },
        {
          id: 'chap-py-4',
          subjectId: 'sub-python',
          userId: currentUserId,
          chapterNumber: 4,
          chapterName: 'Data Analysis & Manipulation with Pandas',
          topicDescription: 'Series, DataFrames, indexing, group-by aggregations, merge/join, handling missing data',
          difficulty: 'Medium',
          importance: 'High',
          preparationStatus: 'In Progress',
          estimatedStudyHours: 4.0,
          understandingLevel: 3,
          revisionCount: 1,
        },
        {
          id: 'chap-py-5',
          subjectId: 'sub-python',
          userId: currentUserId,
          chapterNumber: 5,
          chapterName: 'Asynchronous Programming with Asyncio & Multi-Tasking',
          topicDescription: 'Event loop, async/await coroutines, asyncio.gather, task cancellation and thread pools',
          difficulty: 'Hard',
          importance: 'High',
          preparationStatus: 'Needs Revision',
          estimatedStudyHours: 4.0,
          understandingLevel: 2,
          revisionCount: 1,
        },

        // 6. Natural Language Processing (NLP)
        {
          id: 'chap-nlp-1',
          subjectId: 'sub-nlp',
          userId: currentUserId,
          chapterNumber: 1,
          chapterName: 'Text Preprocessing, Tokenization & Morphological Analysis',
          topicDescription: 'Byte-Pair Encoding (BPE), WordPiece, stemming, lemmatization, stop-word filtering',
          difficulty: 'Easy',
          importance: 'High',
          preparationStatus: 'Completed',
          estimatedStudyHours: 2.5,
          understandingLevel: 5,
          revisionCount: 2,
        },
        {
          id: 'chap-nlp-2',
          subjectId: 'sub-nlp',
          userId: currentUserId,
          chapterNumber: 2,
          chapterName: 'Distributed Word Embeddings (Word2Vec, GloVe, FastText)',
          topicDescription: 'Continuous Bag-of-Words (CBOW), Skip-Gram with negative sampling, subword n-grams',
          difficulty: 'Medium',
          importance: 'High',
          preparationStatus: 'Completed',
          estimatedStudyHours: 3.5,
          understandingLevel: 4,
          revisionCount: 2,
        },
        {
          id: 'chap-nlp-3',
          subjectId: 'sub-nlp',
          userId: currentUserId,
          chapterNumber: 3,
          chapterName: 'Contextual Embeddings & Bidirectional Encoders (BERT)',
          topicDescription: 'Masked Language Modeling (MLM), Next Sentence Prediction, downstream fine-tuning',
          difficulty: 'Hard',
          importance: 'High',
          preparationStatus: 'In Progress',
          estimatedStudyHours: 4.5,
          understandingLevel: 3,
          revisionCount: 1,
        },
        {
          id: 'chap-nlp-4',
          subjectId: 'sub-nlp',
          userId: currentUserId,
          chapterNumber: 4,
          chapterName: 'Seq2Seq Neural Machine Translation & Evaluation',
          topicDescription: 'Encoder-decoder attention, beam search decoding, BLEU score, ROUGE metrics',
          difficulty: 'Hard',
          importance: 'High',
          preparationStatus: 'Needs Revision',
          estimatedStudyHours: 4.5,
          understandingLevel: 2,
          revisionCount: 1,
        },
        {
          id: 'chap-nlp-5',
          subjectId: 'sub-nlp',
          userId: currentUserId,
          chapterNumber: 5,
          chapterName: 'Information Extraction: NER, Relation Extraction & Sentiment',
          topicDescription: 'BIO tagging, CRF layers on top of BERT, dependency parsing, aspect-based sentiment',
          difficulty: 'Hard',
          importance: 'Medium',
          preparationStatus: 'Not Started',
          estimatedStudyHours: 4.0,
          understandingLevel: 1,
          revisionCount: 0,
        },

        // 7. Full Stack Development (FSD)
        {
          id: 'chap-fsd-1',
          subjectId: 'sub-fsd',
          userId: currentUserId,
          chapterNumber: 1,
          chapterName: 'Modern Frontend Architecture: React 19, Hooks & State',
          topicDescription: 'Functional components, useState, useEffect, custom hooks, context, reconciliation',
          difficulty: 'Medium',
          importance: 'High',
          preparationStatus: 'Completed',
          estimatedStudyHours: 3.5,
          understandingLevel: 5,
          revisionCount: 2,
        },
        {
          id: 'chap-fsd-2',
          subjectId: 'sub-fsd',
          userId: currentUserId,
          chapterNumber: 2,
          chapterName: 'Backend RESTful API Engineering with Express & Node.js',
          topicDescription: 'Middleware pipelines, asynchronous request routing, error handling, validation schemas',
          difficulty: 'Medium',
          importance: 'High',
          preparationStatus: 'Completed',
          estimatedStudyHours: 3.5,
          understandingLevel: 4,
          revisionCount: 2,
        },
        {
          id: 'chap-fsd-3',
          subjectId: 'sub-fsd',
          userId: currentUserId,
          chapterNumber: 3,
          chapterName: 'Relational & NoSQL Database Modeling, ORMs & Indexing',
          topicDescription: 'Schema normalization (3NF), B-tree indexes, foreign keys, aggregations, Prisma/Drizzle',
          difficulty: 'Hard',
          importance: 'High',
          preparationStatus: 'In Progress',
          estimatedStudyHours: 4.0,
          understandingLevel: 3,
          revisionCount: 1,
        },
        {
          id: 'chap-fsd-4',
          subjectId: 'sub-fsd',
          userId: currentUserId,
          chapterNumber: 4,
          chapterName: 'Authentication, Authorization & Web Security (JWT, OAuth2)',
          topicDescription: 'Bearer tokens, refresh token rotation, CORS headers, CSRF & XSS prevention, RBAC',
          difficulty: 'Hard',
          importance: 'High',
          preparationStatus: 'Needs Revision',
          estimatedStudyHours: 4.5,
          understandingLevel: 2,
          revisionCount: 1,
        },
        {
          id: 'chap-fsd-5',
          subjectId: 'sub-fsd',
          userId: currentUserId,
          chapterNumber: 5,
          chapterName: 'Cloud Deployment, Containerization with Docker & CI/CD',
          topicDescription: 'Multi-stage Docker builds, environment configuration, automated testing pipelines',
          difficulty: 'Medium',
          importance: 'Medium',
          preparationStatus: 'Not Started',
          estimatedStudyHours: 3.5,
          understandingLevel: 1,
          revisionCount: 0,
        },
      ];
      localStorage.setItem(STORAGE_KEYS.CHAPTERS, JSON.stringify(initialChapters));

      // Generate initial revision schedule for these subjects
      const currentUser = this.getCurrentUser();
      const options: ScheduleGeneratorOptions = {
        startDate: formatDate(today),
        dailyAvailableHours: currentUser?.studyPreferences.dailyAvailableHours || 4.5,
        sessionDurationMinutes: currentUser?.studyPreferences.sessionDurationMinutes || 50,
        breakDurationMinutes: currentUser?.studyPreferences.breakDurationMinutes || 10,
        reservePreExamDays: currentUser?.studyPreferences.reservePreExamDays || 1,
        preserveCompletedSessions: false,
        boostWeakChapters: true,
        preferredDailyStartTime: currentUser?.studyPreferences.preferredStartTime || '09:00',
      };

      const { newTasks } = generateSmartSchedule(initialExams, initialSubjects, initialChapters, [], options);

      // Mark a couple tasks completed for immediate rich stats
      const todayStr = formatDate(today);
      if (newTasks.length > 0) {
        newTasks[0].isCompleted = true;
        newTasks[0].completedAt = `${todayStr}T10:15:00Z`;
        newTasks[0].actualDurationMinutes = 48;
      }
      if (newTasks.length > 1) {
        newTasks[1].isCompleted = true;
        newTasks[1].completedAt = `${todayStr}T11:20:00Z`;
        newTasks[1].actualDurationMinutes = 50;
      }

      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(newTasks));

      const initialSessions: StudySessionLog[] = [
        {
          id: 'sess-1',
          userId: currentUserId,
          subjectId: 'sub-dl',
          subjectName: 'Deep Learning',
          chapterName: 'Neural Network Foundations & Backpropagation',
          date: addDays(formatDate(today), -3),
          durationMinutes: 50,
          focusRating: 5,
          notes: 'Derived chain rule matrix backprop equations and verified SGD convergence.',
          timestamp: new Date(Date.now() - 3 * 86400000).toISOString(),
        },
        {
          id: 'sess-2',
          userId: currentUserId,
          subjectId: 'sub-cns',
          subjectName: 'Cryptography & Network Security (CNS)',
          chapterName: 'Classical Ciphers & Symmetric Encryption (DES, AES)',
          date: addDays(formatDate(today), -2),
          durationMinutes: 55,
          focusRating: 4,
          notes: 'Explored AES SubBytes S-Box lookup table and Galois field multiplication.',
          timestamp: new Date(Date.now() - 2 * 86400000).toISOString(),
        },
        {
          id: 'sess-3',
          userId: currentUserId,
          subjectId: 'sub-genai',
          subjectName: 'Generative AI (Gen AI)',
          chapterName: 'LLM Foundations: Architecture & Pretraining',
          date: addDays(formatDate(today), -1),
          durationMinutes: 60,
          focusRating: 5,
          notes: 'Analyzed causal self-attention scaling laws and KV-cache latency optimizations.',
          timestamp: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: 'sess-4',
          userId: currentUserId,
          subjectId: 'sub-java',
          subjectName: 'Java Programming & Enterprise Apps',
          chapterName: 'OOP Principles: Polymorphism, Inheritance & Interfaces',
          date: formatDate(today),
          durationMinutes: 48,
          focusRating: 5,
          notes: 'Implemented strategy design pattern and Java 21 sealed interfaces.',
          timestamp: new Date().toISOString(),
        },
      ];
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(initialSessions));

      const initialNotifications: AppNotification[] = [
        {
          id: 'notif-1',
          userId: currentUserId,
          title: 'Upcoming Exam: Deep Learning Midterm',
          message: 'Your Deep Learning midterm is in 4 days! Focus on Multi-Head Attention and Transformers.',
          type: 'EXAM_COUNTDOWN',
          date: formatDate(today),
          read: false,
          actionUrl: '/exams',
          actionLabel: 'View Exam Details',
          examId: 'exam-dl',
        },
        {
          id: 'notif-2',
          userId: currentUserId,
          title: 'Upcoming Exam: CNS Security Midterm',
          message: 'Cryptography & Network Security midterm exam is scheduled in 8 days.',
          type: 'EXAM_COUNTDOWN',
          date: formatDate(today),
          read: false,
          actionUrl: '/exams',
          actionLabel: 'Check Exam Schedule',
          examId: 'exam-cns',
        },
        {
          id: 'notif-3',
          userId: currentUserId,
          title: 'Spaced Review Due: Generative AI RAG',
          message: 'Review session for "Retrieval-Augmented Generation (RAG)" is due today.',
          type: 'TODAY_TASK',
          date: formatDate(today),
          read: false,
          actionUrl: '/planner',
          actionLabel: 'Go to Daily Planner',
        },
        {
          id: 'notif-4',
          userId: currentUserId,
          title: 'Weak Topic Flagged: TLS/SSL Handshake',
          message: '"Network Security Protocols: SSL/TLS & HTTPS" currently has understanding level 2/5. Smart scheduler allocated extra review time.',
          type: 'WEAK_TOPIC',
          date: addDays(formatDate(today), -1),
          read: false,
          actionUrl: '/subjects',
          actionLabel: 'Inspect Syllabus',
        },
      ];
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(initialNotifications));
    }

    // Ensure all seed students have their 7 CS/AI subjects & schedules
    this.ensureUserCurriculum('user-student-2');
    this.ensureUserCurriculum('user-student-3');
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

  static ensureUserCurriculum(userId: string) {
    if (!userId) return;
    const rawSubjects = localStorage.getItem(STORAGE_KEYS.SUBJECTS);
    const subjects: Subject[] = rawSubjects ? JSON.parse(rawSubjects) : [];
    const hasSubjects = subjects.some((s) => s.userId === userId);

    if (!hasSubjects) {
      const baseSubjects = subjects.filter((s) => s.userId === 'user-student-1');
      if (baseSubjects.length > 0) {
        const clonedSubjects = baseSubjects.map((s) => ({
          ...s,
          id: `${s.id}-${userId}`,
          userId,
        }));
        subjects.push(...clonedSubjects);
        localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(subjects));

        const rawExams = localStorage.getItem(STORAGE_KEYS.EXAMS);
        const exams: Exam[] = rawExams ? JSON.parse(rawExams) : [];
        const baseExams = exams.filter((e) => e.userId === 'user-student-1');
        const clonedExams = baseExams.map((e) => ({
          ...e,
          id: `${e.id}-${userId}`,
          userId,
          subjectId: `${e.subjectId}-${userId}`,
        }));
        exams.push(...clonedExams);
        localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(exams));

        const rawChapters = localStorage.getItem(STORAGE_KEYS.CHAPTERS);
        const chapters: Chapter[] = rawChapters ? JSON.parse(rawChapters) : [];
        const baseChapters = chapters.filter((c) => c.userId === 'user-student-1');
        const clonedChapters = baseChapters.map((c) => ({
          ...c,
          id: `${c.id}-${userId}`,
          userId,
          subjectId: `${c.subjectId}-${userId}`,
        }));
        chapters.push(...clonedChapters);
        localStorage.setItem(STORAGE_KEYS.CHAPTERS, JSON.stringify(chapters));

        const scheduleResult = generateSmartSchedule(
          clonedExams,
          clonedSubjects,
          clonedChapters,
          [],
          {
            startDate: formatDate(new Date()),
            dailyAvailableHours: 4,
            sessionDurationMinutes: 50,
            breakDurationMinutes: 10,
            reservePreExamDays: 1,
            preserveCompletedSessions: true,
            boostWeakChapters: true,
            preferredDailyStartTime: '09:00',
          }
        );
        const rawTasks = localStorage.getItem(STORAGE_KEYS.TASKS);
        const allTasks: RevisionTask[] = rawTasks ? JSON.parse(rawTasks) : [];
        allTasks.push(...scheduleResult.newTasks);
        localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(allTasks));
      }
    }
  }

  static switchUser(userId: string): User | null {
    const users = this.getUsers();
    const user = users.find((u) => u.id === userId);
    if (user) {
      this.ensureUserCurriculum(userId);
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

  // --- 7 Core CS/AI Subjects Helpers ---
  static loadCore7Subjects(targetUserId?: string): Subject[] {
    const userId = targetUserId || this.getCurrentUser()?.id || 'user-student-1';
    this.ensureUserCurriculum(userId);

    // If still missing any of the 7, run full init curriculum
    const userSubjects = this.getSubjects().filter((s) => s.userId === userId);
    const requiredKeys = ['Deep Learning', 'CNS', 'Gen AI', 'Java', 'Python', 'NLP', 'FSD'];
    const missing = requiredKeys.filter((key) => !userSubjects.some((s) => s.name.includes(key)));

    if (missing.length > 0) {
      // Re-provision seed subjects for this user
      const rawSubjects = localStorage.getItem(STORAGE_KEYS.SUBJECTS);
      const allSubjects: Subject[] = rawSubjects ? JSON.parse(rawSubjects) : [];
      const baseSubjects = allSubjects.filter((s) => s.userId === 'user-student-1');

      if (baseSubjects.length > 0 && userId !== 'user-student-1') {
        const clonedSubjects = baseSubjects.map((s) => ({
          ...s,
          id: `${s.id}-${userId}`,
          userId,
        }));
        // Remove existing for this user and replace with full 7
        const filteredSubjects = allSubjects.filter((s) => s.userId !== userId);
        filteredSubjects.push(...clonedSubjects);
        localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(filteredSubjects));

        // Clone exams
        const rawExams = localStorage.getItem(STORAGE_KEYS.EXAMS);
        const allExams: Exam[] = rawExams ? JSON.parse(rawExams) : [];
        const baseExams = allExams.filter((e) => e.userId === 'user-student-1');
        const clonedExams = baseExams.map((e) => ({
          ...e,
          id: `${e.id}-${userId}`,
          userId,
          subjectId: `${e.subjectId}-${userId}`,
        }));
        const filteredExams = allExams.filter((e) => e.userId !== userId);
        filteredExams.push(...clonedExams);
        localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(filteredExams));

        // Clone chapters
        const rawChapters = localStorage.getItem(STORAGE_KEYS.CHAPTERS);
        const allChapters: Chapter[] = rawChapters ? JSON.parse(rawChapters) : [];
        const baseChapters = allChapters.filter((c) => c.userId === 'user-student-1');
        const clonedChapters = baseChapters.map((c) => ({
          ...c,
          id: `${c.id}-${userId}`,
          userId,
          subjectId: `${c.subjectId}-${userId}`,
        }));
        const filteredChapters = allChapters.filter((c) => c.userId !== userId);
        filteredChapters.push(...clonedChapters);
        localStorage.setItem(STORAGE_KEYS.CHAPTERS, JSON.stringify(filteredChapters));
      }
    }

    this.notify();
    return this.getSubjects().filter((s) => s.userId === userId);
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
