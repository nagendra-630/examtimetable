import React, { useState } from 'react';
import {
  AlertCircle,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Code,
  Edit2,
  FolderPlus,
  Layers,
  Plus,
  RefreshCw,
  Sparkles,
  Star,
  Trash2,
  X,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Chapter, Difficulty, PreparationStatus, Priority, Subject } from '../types';
import { StorageService } from '../services/storage';

interface SubjectsPageProps {
  subjects: Subject[];
  chapters: Chapter[];
  onOpenScheduleModal: () => void;
}

// Complete predefined curricula for the 7 requested CS & AI subjects
const PREDEFINED_7_SUBJECTS = [
  {
    key: 'dl',
    name: 'Deep Learning',
    code: 'CS 420',
    color: '#6366F1', // Indigo
    instructor: 'Prof. Yoshua Bengio',
    creditHours: 4,
    exam: {
      examName: 'Deep Learning Midterm Examination',
      daysFromNow: 4,
      startTime: '09:30',
      durationMinutes: 120,
      examType: 'Midterm',
      difficulty: 'Hard' as Difficulty,
      priority: 'High' as Priority,
      targetScore: 92,
      venueOrRoom: 'Turing Neural Hall 301',
      notes: 'Focus on Backpropagation calculus, CNN convolutions, and Transformer self-attention matrices.',
    },
    chapters: [
      {
        name: 'Neural Network Foundations & Backpropagation',
        desc: 'Perceptron, activation functions, loss functions, chain rule gradient computation',
        diff: 'Medium' as Difficulty,
        imp: 'High' as Priority,
        status: 'Completed' as PreparationStatus,
        hours: 3.5,
        rating: 5,
      },
      {
        name: 'Convolutional Neural Networks (CNNs) & Visual Features',
        desc: 'Kernel convolutions, pooling, feature maps, ResNet residual skip connections',
        diff: 'Hard' as Difficulty,
        imp: 'High' as Priority,
        status: 'Completed' as PreparationStatus,
        hours: 4.0,
        rating: 4,
      },
      {
        name: 'Recurrent Architectures, LSTMs & GRUs',
        desc: 'Sequence modeling, vanishing gradients, forget and candidate gates in LSTM',
        diff: 'Hard' as Difficulty,
        imp: 'High' as Priority,
        status: 'In Progress' as PreparationStatus,
        hours: 4.5,
        rating: 3,
      },
      {
        name: 'Multi-Head Attention & Transformer Architectures',
        desc: 'Scaled dot-product attention, query-key-value projections, positional encoding',
        diff: 'Hard' as Difficulty,
        imp: 'High' as Priority,
        status: 'Needs Revision' as PreparationStatus,
        hours: 5.0,
        rating: 2,
      },
      {
        name: 'Optimization: Adam, RMSProp, Dropout & Batch Normalization',
        desc: 'Momentum, adaptive learning rates, weight decay, internal covariate shift mitigation',
        diff: 'Medium' as Difficulty,
        imp: 'Medium' as Priority,
        status: 'Not Started' as PreparationStatus,
        hours: 3.0,
        rating: 1,
      },
    ],
  },
  {
    key: 'cns',
    name: 'Cryptography & Network Security (CNS)',
    code: 'CS 450',
    color: '#0284C7', // Sky Blue
    instructor: 'Dr. Bruce Schneier',
    creditHours: 4,
    exam: {
      examName: 'CNS End-Term Security Examination',
      daysFromNow: 8,
      startTime: '13:30',
      durationMinutes: 100,
      examType: 'Midterm',
      difficulty: 'Hard' as Difficulty,
      priority: 'High' as Priority,
      targetScore: 90,
      venueOrRoom: 'Cybersecurity Wing B-4',
      notes: 'RSA modular arithmetic, AES key expansion, and TLS 1.3 handshake packet inspection.',
    },
    chapters: [
      {
        name: 'Classical Ciphers & Symmetric Encryption (DES, AES)',
        desc: 'Substitution/Transposition, Feistel network, AES substitution-permutation rounds',
        diff: 'Medium' as Difficulty,
        imp: 'High' as Priority,
        status: 'Completed' as PreparationStatus,
        hours: 3.0,
        rating: 5,
      },
      {
        name: 'Asymmetric Cryptography: RSA & Diffie-Hellman Key Exchange',
        desc: 'Euler totient, prime factor trapdoor, discrete log problem, man-in-the-middle prevention',
        diff: 'Hard' as Difficulty,
        imp: 'High' as Priority,
        status: 'Completed' as PreparationStatus,
        hours: 4.0,
        rating: 4,
      },
      {
        name: 'Cryptographic Hash Functions, HMAC & Digital Signatures',
        desc: 'Collision resistance, SHA-256 Merkle-Damgard, DSA, PKI and X.509 certificates',
        diff: 'Medium' as Difficulty,
        imp: 'High' as Priority,
        status: 'In Progress' as PreparationStatus,
        hours: 3.5,
        rating: 3,
      },
      {
        name: 'Network Security Protocols: SSL/TLS, IPSec & HTTPS',
        desc: 'TLS 1.3 handshake, cipher suite negotiation, ESP and AH modes in IPSec',
        diff: 'Hard' as Difficulty,
        imp: 'High' as Priority,
        status: 'Needs Revision' as PreparationStatus,
        hours: 4.5,
        rating: 2,
      },
      {
        name: 'Firewalls, Intrusion Prevention & Zero-Trust Architecture',
        desc: 'Packet filtering, stateful inspection, DMZ, signature vs anomaly IDS, microsegmentation',
        diff: 'Medium' as Difficulty,
        imp: 'Medium' as Priority,
        status: 'Not Started' as PreparationStatus,
        hours: 3.0,
        rating: 1,
      },
    ],
  },
  {
    key: 'genai',
    name: 'Generative AI (Gen AI)',
    code: 'AI 480',
    color: '#EC4899', // Pink
    instructor: 'Dr. Fei-Fei Li',
    creditHours: 4,
    exam: {
      examName: 'Generative AI Capstone & Model Evaluation',
      daysFromNow: 12,
      startTime: '10:00',
      durationMinutes: 90,
      examType: 'Final Exam',
      difficulty: 'Hard' as Difficulty,
      priority: 'High' as Priority,
      targetScore: 95,
      venueOrRoom: 'AI Innovation Center Room 102',
      notes: 'RAG chunking strategies, vector embeddings cosine distance, and LoRA rank adaptation.',
    },
    chapters: [
      {
        name: 'Foundation LLM Architecture, Pretraining & Scaling Laws',
        desc: 'Decoder-only transformers, causal masking, Chinchilla scaling laws, tokenizers',
        diff: 'Hard' as Difficulty,
        imp: 'High' as Priority,
        status: 'Completed' as PreparationStatus,
        hours: 4.0,
        rating: 4,
      },
      {
        name: 'Advanced Prompt Engineering & In-Context Learning',
        desc: 'Chain-of-thought, ReAct prompting, few-shot conditioning, structured JSON outputs',
        diff: 'Easy' as Difficulty,
        imp: 'High' as Priority,
        status: 'Completed' as PreparationStatus,
        hours: 2.5,
        rating: 5,
      },
      {
        name: 'Retrieval-Augmented Generation (RAG) & Vector Databases',
        desc: 'Document chunking, dense vector retrieval (HNSW), semantic reranking, hybrid search',
        diff: 'Hard' as Difficulty,
        imp: 'High' as Priority,
        status: 'In Progress' as PreparationStatus,
        hours: 4.5,
        rating: 3,
      },
      {
        name: 'Parameter-Efficient Fine-Tuning: LoRA, QLoRA & Alignment',
        desc: 'Low-rank matrix adaptation, 4-bit quantization, RLHF reward models, DPO loss',
        diff: 'Hard' as Difficulty,
        imp: 'High' as Priority,
        status: 'Needs Revision' as PreparationStatus,
        hours: 5.0,
        rating: 2,
      },
      {
        name: 'Diffusion Models, Latent Space Sampling & Multimodal AI',
        desc: 'Forward noise addition, reverse denoising U-Net, CLIP text-image cross attention',
        diff: 'Hard' as Difficulty,
        imp: 'Medium' as Priority,
        status: 'Not Started' as PreparationStatus,
        hours: 4.0,
        rating: 1,
      },
    ],
  },
  {
    key: 'java',
    name: 'Java Programming & Enterprise Apps',
    code: 'CS 210',
    color: '#D97706', // Amber
    instructor: 'Prof. James Gosling',
    creditHours: 4,
    exam: {
      examName: 'Java Enterprise Architecture & Concurrency Final',
      daysFromNow: 16,
      startTime: '14:00',
      durationMinutes: 120,
      examType: 'Final Exam',
      difficulty: 'Medium' as Difficulty,
      priority: 'High' as Priority,
      targetScore: 88,
      venueOrRoom: 'Software Engineering Complex 204',
      notes: 'Virtual threads, Spring Boot dependency injection, and JVM memory tuning.',
    },
    chapters: [
      {
        name: 'OOP Principles: Polymorphism, Inheritance & Interfaces',
        desc: 'Encapsulation, abstract classes, default interface methods, composition over inheritance',
        diff: 'Easy' as Difficulty,
        imp: 'High' as Priority,
        status: 'Completed' as PreparationStatus,
        hours: 3.0,
        rating: 5,
      },
      {
        name: 'Java Collections Framework & Generics Deep-Dive',
        desc: 'ArrayList vs LinkedList, HashMap internal bucket hashing, TreeMap, wildcard generics',
        diff: 'Medium' as Difficulty,
        imp: 'High' as Priority,
        status: 'Completed' as PreparationStatus,
        hours: 3.5,
        rating: 4,
      },
      {
        name: 'Multithreading, Concurrency & Java 21 Virtual Threads',
        desc: 'Synchronized blocks, locks, ExecutorService, Project Loom virtual thread lightweight scheduling',
        diff: 'Hard' as Difficulty,
        imp: 'High' as Priority,
        status: 'Completed' as PreparationStatus,
        hours: 4.5,
        rating: 4,
      },
      {
        name: 'Spring Boot REST Architecture, DI & Spring Data JPA',
        desc: 'Inversion of control, annotations (@Autowired, @RestController), repository queries',
        diff: 'Medium' as Difficulty,
        imp: 'High' as Priority,
        status: 'In Progress' as PreparationStatus,
        hours: 4.0,
        rating: 3,
      },
      {
        name: 'JVM Memory Model, ClassLoading & Garbage Collection',
        desc: 'Heap generations (Eden, Survivor, Tenured), Metaspace, GC algorithms (G1, ZGC)',
        diff: 'Hard' as Difficulty,
        imp: 'Medium' as Priority,
        status: 'Needs Revision' as PreparationStatus,
        hours: 3.5,
        rating: 2,
      },
    ],
  },
  {
    key: 'python',
    name: 'Python & Scientific Computing',
    code: 'CS 105',
    color: '#059669', // Emerald
    instructor: 'Dr. Guido van Rossum',
    creditHours: 3,
    exam: {
      examName: 'Python Systems & Scientific Computing Exam',
      daysFromNow: 28,
      startTime: '15:00',
      durationMinutes: 90,
      examType: 'Unit Test',
      difficulty: 'Easy' as Difficulty,
      priority: 'Medium' as Priority,
      targetScore: 96,
      venueOrRoom: 'Data Science Lab 4',
      notes: 'NumPy broadcasting, Pandas aggregation queries, and Asyncio event loops.',
    },
    chapters: [
      {
        name: 'Python Data Structures, Comprehensions & Iterators',
        desc: 'Dict/set lookups, generator expressions, yield statements, itertools operations',
        diff: 'Easy' as Difficulty,
        imp: 'High' as Priority,
        status: 'Completed' as PreparationStatus,
        hours: 2.5,
        rating: 5,
      },
      {
        name: 'Object-Oriented Python, Dunder Methods & Decorators',
        desc: '__repr__, __call__, __enter__/__exit__ context managers, function/class decorators',
        diff: 'Medium' as Difficulty,
        imp: 'High' as Priority,
        status: 'Completed' as PreparationStatus,
        hours: 3.5,
        rating: 4,
      },
      {
        name: 'Numerical Computing with NumPy & Vectorization',
        desc: 'Ndarray slicing, broadcasting rules, linear algebra dot products, memory layouts (C/F)',
        diff: 'Medium' as Difficulty,
        imp: 'High' as Priority,
        status: 'Completed' as PreparationStatus,
        hours: 3.5,
        rating: 4,
      },
      {
        name: 'Data Analysis & Manipulation with Pandas',
        desc: 'Series, DataFrames, indexing, group-by aggregations, merge/join, handling missing data',
        diff: 'Medium' as Difficulty,
        imp: 'High' as Priority,
        status: 'In Progress' as PreparationStatus,
        hours: 4.0,
        rating: 3,
      },
      {
        name: 'Asynchronous Programming with Asyncio & Multi-Tasking',
        desc: 'Event loop, async/await coroutines, asyncio.gather, task cancellation and thread pools',
        diff: 'Hard' as Difficulty,
        imp: 'High' as Priority,
        status: 'Needs Revision' as PreparationStatus,
        hours: 4.0,
        rating: 2,
      },
    ],
  },
  {
    key: 'nlp',
    name: 'Natural Language Processing (NLP)',
    code: 'CS 460',
    color: '#7C3AED', // Purple
    instructor: 'Dr. Christopher Manning',
    creditHours: 4,
    exam: {
      examName: 'Natural Language Processing Comprehensive Final',
      daysFromNow: 20,
      startTime: '09:00',
      durationMinutes: 120,
      examType: 'Final Exam',
      difficulty: 'Hard' as Difficulty,
      priority: 'High' as Priority,
      targetScore: 92,
      venueOrRoom: 'Linguistics & Informatics Hall 105',
      notes: 'Word2Vec negative sampling, BERT masked language modeling, and BLEU evaluation metrics.',
    },
    chapters: [
      {
        name: 'Text Preprocessing, Tokenization & Morphological Analysis',
        desc: 'Byte-Pair Encoding (BPE), WordPiece, stemming, lemmatization, stop-word filtering',
        diff: 'Easy' as Difficulty,
        imp: 'High' as Priority,
        status: 'Completed' as PreparationStatus,
        hours: 2.5,
        rating: 5,
      },
      {
        name: 'Distributed Word Embeddings (Word2Vec, GloVe, FastText)',
        desc: 'Continuous Bag-of-Words (CBOW), Skip-Gram with negative sampling, subword n-grams',
        diff: 'Medium' as Difficulty,
        imp: 'High' as Priority,
        status: 'Completed' as PreparationStatus,
        hours: 3.5,
        rating: 4,
      },
      {
        name: 'Contextual Embeddings & Bidirectional Encoders (BERT)',
        desc: 'Masked Language Modeling (MLM), Next Sentence Prediction, downstream fine-tuning',
        diff: 'Hard' as Difficulty,
        imp: 'High' as Priority,
        status: 'In Progress' as PreparationStatus,
        hours: 4.5,
        rating: 3,
      },
      {
        name: 'Sequence-to-Sequence Models & Neural Machine Translation',
        desc: 'Encoder-decoder attention, Bahdanau alignment, beam search decoding strategies',
        diff: 'Hard' as Difficulty,
        imp: 'High' as Priority,
        status: 'Needs Revision' as PreparationStatus,
        hours: 4.5,
        rating: 2,
      },
      {
        name: 'Text Generation Evaluation Metrics (BLEU, ROUGE, Perplexity)',
        desc: 'N-gram precision, recall overlaps, cross-entropy loss, hallucination mitigation',
        diff: 'Medium' as Difficulty,
        imp: 'Medium' as Priority,
        status: 'Not Started' as PreparationStatus,
        hours: 3.0,
        rating: 1,
      },
    ],
  },
  {
    key: 'fsd',
    name: 'Full Stack Development (FSD)',
    code: 'CS 350',
    color: '#2563EB', // Royal Blue
    instructor: 'Prof. Dan Abramov',
    creditHours: 4,
    exam: {
      examName: 'Full Stack Development Practical Lab Exam',
      daysFromNow: 24,
      startTime: '11:00',
      durationMinutes: 180,
      examType: 'Practical / Lab',
      difficulty: 'Medium' as Difficulty,
      priority: 'High' as Priority,
      targetScore: 94,
      venueOrRoom: 'Full Stack Development Lab Desk 18',
      notes: 'Build and deploy a full-stack REST API with React frontend and JWT authentication.',
    },
    chapters: [
      {
        name: 'Frontend Architecture with React 19, TypeScript & Vite',
        desc: 'Component design patterns, server vs client state, TypeScript type safety, bundle optimization',
        diff: 'Medium' as Difficulty,
        imp: 'High' as Priority,
        status: 'Completed' as PreparationStatus,
        hours: 3.5,
        rating: 5,
      },
      {
        name: 'State Management, Custom Hooks & Tailwind UI Systems',
        desc: 'Context API, compound component pattern, Tailwind v4 design token workflows',
        diff: 'Easy' as Difficulty,
        imp: 'High' as Priority,
        status: 'Completed' as PreparationStatus,
        hours: 3.0,
        rating: 4,
      },
      {
        name: 'RESTful API Design with Express, Spring Boot & Middleware',
        desc: 'Routing controllers, request validation, error handler middleware, rate limiting',
        diff: 'Medium' as Difficulty,
        imp: 'High' as Priority,
        status: 'In Progress' as PreparationStatus,
        hours: 4.0,
        rating: 3,
      },
      {
        name: 'Database Integration, Schema Design & ORM Modeling',
        desc: 'Normalization, foreign keys, index optimization, Drizzle/Prisma/JPA entity relationships',
        diff: 'Hard' as Difficulty,
        imp: 'High' as Priority,
        status: 'Needs Revision' as PreparationStatus,
        hours: 4.5,
        rating: 2,
      },
      {
        name: 'Production Authentication (JWT/OAuth), Security & Deployment',
        desc: 'BCrypt hashing, access & refresh token rotation, CORS policies, Docker containers',
        diff: 'Hard' as Difficulty,
        imp: 'High' as Priority,
        status: 'Not Started' as PreparationStatus,
        hours: 4.0,
        rating: 1,
      },
    ],
  },
];

export const SubjectsPage: React.FC<SubjectsPageProps> = ({
  subjects,
  chapters,
  onOpenScheduleModal,
}) => {
  const [expandedSubjectId, setExpandedSubjectId] = useState<string | null>(subjects[0]?.id || null);
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  // Subject Modal states
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [selectedPresetKey, setSelectedPresetKey] = useState<string>('');
  const [subjectName, setSubjectName] = useState('');
  const [subjectCode, setSubjectCode] = useState('');
  const [subjectColor, setSubjectColor] = useState('#3B82F6');
  const [subjectInstructor, setSubjectInstructor] = useState('');
  const [subjectCreditHours, setSubjectCreditHours] = useState(4);

  // Chapter Modal states
  const [isChapterModalOpen, setIsChapterModalOpen] = useState(false);
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const [targetSubjectId, setTargetSubjectId] = useState<string>('');
  const [chapterName, setChapterName] = useState('');
  const [topicDescription, setTopicDescription] = useState('');
  const [chapterDifficulty, setChapterDifficulty] = useState<Difficulty>('Medium');
  const [chapterImportance, setChapterImportance] = useState<Priority>('High');
  const [chapterStatus, setChapterStatus] = useState<PreparationStatus>('Not Started');
  const [estimatedHours, setEstimatedHours] = useState(3.5);
  const [understandingLevel, setUnderstandingLevel] = useState(3);

  // Helper to check if a predefined subject is already enrolled
  const isPresetEnrolled = (name: string, code: string) => {
    return subjects.some(
      (s) =>
        s.name.toLowerCase().includes(name.toLowerCase()) ||
        name.toLowerCase().includes(s.name.toLowerCase()) ||
        s.code.toUpperCase() === code.toUpperCase()
    );
  };

  // Find enrolled subject ID by preset
  const getEnrolledSubjectId = (name: string, code: string) => {
    const found = subjects.find(
      (s) =>
        s.name.toLowerCase().includes(name.toLowerCase()) ||
        name.toLowerCase().includes(s.name.toLowerCase()) ||
        s.code.toUpperCase() === code.toUpperCase()
    );
    return found?.id;
  };

  // Quick action: click a subject chip
  const handlePresetChipClick = (preset: typeof PREDEFINED_7_SUBJECTS[0]) => {
    const enrolledId = getEnrolledSubjectId(preset.name, preset.code);
    if (enrolledId) {
      setExpandedSubjectId(enrolledId);
      setNotificationMsg(`Focused on ${preset.name} syllabus.`);
      setTimeout(() => setNotificationMsg(null), 2500);
      return;
    }

    // Add this subject with all 5 chapters!
    const currentUser = StorageService.getCurrentUser();
    const userId = currentUser ? currentUser.id : 'user-student-1';
    const subId = `sub-${preset.key}-${Date.now()}`;

    const newSubject: Subject = {
      id: subId,
      userId,
      name: preset.name,
      code: preset.code,
      color: preset.color,
      instructor: preset.instructor,
      creditHours: preset.creditHours,
    };
    StorageService.saveSubject(newSubject);

    // Save its 5 chapters
    preset.chapters.forEach((ch, idx) => {
      const chapterData: Chapter = {
        id: `chap-${preset.key}-${idx + 1}-${Date.now()}`,
        subjectId: subId,
        userId,
        chapterNumber: idx + 1,
        chapterName: ch.name,
        topicDescription: ch.desc,
        difficulty: ch.diff,
        importance: ch.imp,
        preparationStatus: ch.status,
        estimatedStudyHours: ch.hours,
        understandingLevel: ch.rating,
        revisionCount: ch.status === 'Completed' ? 2 : 0,
      };
      StorageService.saveChapter(chapterData);
    });

    setExpandedSubjectId(subId);
    try {
      confetti({ particleCount: 45, spread: 55 });
    } catch (e) {}
    setNotificationMsg(`Added ${preset.name} with all 5 curated syllabus chapters!`);
    setTimeout(() => setNotificationMsg(null), 3000);
  };

  // Quick action: Load all 7 subjects in one go
  const handleLoadAll7Subjects = () => {
    StorageService.loadCore7Subjects();
    try {
      confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
    } catch (e) {}
    setNotificationMsg('Enrolled all 7 core subjects (Deep Learning, CNS, Gen AI, Java, Python, NLP, FSD) with 35 chapters!');
    setTimeout(() => setNotificationMsg(null), 4000);
  };

  // --- Subject Actions ---
  const openAddSubject = () => {
    setEditingSubject(null);
    setSelectedPresetKey('');
    setSubjectName('');
    setSubjectCode('');
    setSubjectColor('#6366F1');
    setSubjectInstructor('');
    setSubjectCreditHours(4);
    setIsSubjectModalOpen(true);
  };

  const handleSelectPresetTemplate = (key: string) => {
    setSelectedPresetKey(key);
    const found = PREDEFINED_7_SUBJECTS.find((p) => p.key === key);
    if (found) {
      setSubjectName(found.name);
      setSubjectCode(found.code);
      setSubjectColor(found.color);
      setSubjectInstructor(found.instructor);
      setSubjectCreditHours(found.creditHours);
    }
  };

  const openEditSubject = (subj: Subject, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSubject(subj);
    setSelectedPresetKey('');
    setSubjectName(subj.name);
    setSubjectCode(subj.code);
    setSubjectColor(subj.color);
    setSubjectInstructor(subj.instructor || '');
    setSubjectCreditHours(subj.creditHours || 3);
    setIsSubjectModalOpen(true);
  };

  const handleSaveSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectName.trim()) return;

    const currentUser = StorageService.getCurrentUser();
    const userId = currentUser ? currentUser.id : 'user-student-1';
    const subId = editingSubject ? editingSubject.id : `sub-${Date.now()}`;

    const newSubject: Subject = {
      id: subId,
      userId,
      name: subjectName.trim(),
      code: subjectCode.trim() || 'CS',
      color: subjectColor,
      instructor: subjectInstructor.trim(),
      creditHours: subjectCreditHours,
    };

    StorageService.saveSubject(newSubject);

    // If preset template was picked and creating fresh subject, populate its 5 chapters!
    if (!editingSubject && selectedPresetKey) {
      const preset = PREDEFINED_7_SUBJECTS.find((p) => p.key === selectedPresetKey);
      if (preset) {
        preset.chapters.forEach((ch, idx) => {
          const chapterData: Chapter = {
            id: `chap-${preset.key}-${idx + 1}-${Date.now()}`,
            subjectId: subId,
            userId,
            chapterNumber: idx + 1,
            chapterName: ch.name,
            topicDescription: ch.desc,
            difficulty: ch.diff,
            importance: ch.imp,
            preparationStatus: ch.status,
            estimatedStudyHours: ch.hours,
            understandingLevel: ch.rating,
            revisionCount: ch.status === 'Completed' ? 2 : 0,
          };
          StorageService.saveChapter(chapterData);
        });
      }
    }

    setIsSubjectModalOpen(false);
    setExpandedSubjectId(subId);
    try {
      confetti({ particleCount: 40, spread: 50 });
    } catch (e) {}
  };

  const handleDeleteSubject = (subjId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Delete this subject and all associated chapters, exams, and revision tasks?')) {
      StorageService.deleteSubject(subjId);
      if (expandedSubjectId === subjId) {
        setExpandedSubjectId(null);
      }
    }
  };

  // --- Chapter Actions ---
  const openAddChapter = (subjId: string) => {
    setEditingChapter(null);
    setTargetSubjectId(subjId);
    setChapterName('');
    setTopicDescription('');
    setChapterDifficulty('Medium');
    setChapterImportance('High');
    setChapterStatus('Not Started');
    setEstimatedHours(3.0);
    setUnderstandingLevel(3);
    setIsChapterModalOpen(true);
  };

  const openEditChapter = (ch: Chapter) => {
    setEditingChapter(ch);
    setTargetSubjectId(ch.subjectId);
    setChapterName(ch.chapterName);
    setTopicDescription(ch.topicDescription);
    setChapterDifficulty(ch.difficulty);
    setChapterImportance(ch.importance);
    setChapterStatus(ch.preparationStatus);
    setEstimatedHours(ch.estimatedStudyHours);
    setUnderstandingLevel(ch.understandingLevel);
    setIsChapterModalOpen(true);
  };

  const handleSaveChapter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chapterName.trim() || !targetSubjectId) return;

    const currentUser = StorageService.getCurrentUser();
    const userId = currentUser ? currentUser.id : 'user-student-1';
    const existingChapters = chapters.filter((c) => c.subjectId === targetSubjectId);

    const chapterData: Chapter = {
      id: editingChapter ? editingChapter.id : `chap-${Date.now()}`,
      subjectId: targetSubjectId,
      userId,
      chapterNumber: editingChapter ? editingChapter.chapterNumber : existingChapters.length + 1,
      chapterName: chapterName.trim(),
      topicDescription: topicDescription.trim(),
      difficulty: chapterDifficulty,
      importance: chapterImportance,
      preparationStatus: chapterStatus,
      estimatedStudyHours: estimatedHours,
      understandingLevel,
      revisionCount: editingChapter ? editingChapter.revisionCount : 0,
      lastRevisedDate: editingChapter?.lastRevisedDate,
    };

    StorageService.saveChapter(chapterData);
    setIsChapterModalOpen(false);
  };

  const handleDeleteChapter = (chId: string) => {
    if (window.confirm('Remove this chapter from the syllabus?')) {
      StorageService.deleteChapter(chId);
    }
  };

  const handleQuickStatusChange = (ch: Chapter, newStatus: PreparationStatus) => {
    const updated: Chapter = { ...ch, preparationStatus: newStatus };
    if (newStatus === 'Completed' && updated.understandingLevel < 4) {
      updated.understandingLevel = 4;
    }
    StorageService.saveChapter(updated);
  };

  const handleQuickUnderstandingChange = (ch: Chapter, rating: number) => {
    const updated: Chapter = { ...ch, understandingLevel: rating };
    if (rating <= 2 && updated.preparationStatus === 'Completed') {
      updated.preparationStatus = 'Needs Revision';
    }
    StorageService.saveChapter(updated);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Subjects & Chapter Syllabus
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Organize chapters by importance, difficulty, and understanding level to guide personalized spaced intervals.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={openAddSubject}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-xs flex items-center gap-1.5"
          >
            <FolderPlus className="w-4 h-4" /> Add Custom Subject
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {notificationMsg && (
        <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <span className="font-semibold">{notificationMsg}</span>
        </div>
      )}

      {/* 7 Core CS/AI Subjects Quick-Add Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span className="text-xs font-extrabold text-slate-900 dark:text-white">
              Core CS & AI Subjects:
            </span>
            <span className="text-[11px] text-slate-500">
              Deep Learning, CNS, Gen AI, Java, Python, NLP, FSD
            </span>
          </div>

          <button
            type="button"
            onClick={handleLoadAll7Subjects}
            className="px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-all self-start sm:self-auto"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Load All 7 Subjects (35 Chapters)</span>
          </button>
        </div>

        {/* Quick subject chip buttons */}
        <div className="flex flex-wrap gap-2 pt-1">
          {PREDEFINED_7_SUBJECTS.map((p) => {
            const enrolled = isPresetEnrolled(p.name, p.code);
            return (
              <button
                key={p.key}
                type="button"
                onClick={() => handlePresetChipClick(p)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-all ${
                  enrolled
                    ? 'bg-slate-100 dark:bg-slate-800/80 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-indigo-400'
                    : 'bg-indigo-50/70 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50'
                }`}
                title={enrolled ? 'Already in syllabus - click to inspect chapters' : 'Click to add subject with all 5 chapters'}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: p.color }}
                />
                <span>{p.name}</span>
                <span className="text-[10px] font-mono text-slate-400 font-normal">
                  ({p.code})
                </span>
                {enrolled ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 ml-0.5" />
                ) : (
                  <Plus className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 ml-0.5" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Subjects Accordion List */}
      <div className="space-y-4">
        {subjects.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center">
            <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              No subjects registered yet
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
              Add your CS & AI subjects to organize chapters and generate your spaced repetition schedule.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={handleLoadAll7Subjects}
                className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl flex items-center gap-1.5 shadow-xs"
              >
                <Sparkles className="w-4 h-4" /> Load 7 Core CS/AI Subjects
              </button>
              <button
                onClick={openAddSubject}
                className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl"
              >
                Add Custom Subject
              </button>
            </div>
          </div>
        ) : (
          subjects.map((subj) => {
            const subjChapters = chapters.filter((c) => c.subjectId === subj.id);
            const isExpanded = expandedSubjectId === subj.id;
            const completedCount = subjChapters.filter((c) => c.preparationStatus === 'Completed').length;
            const totalCount = subjChapters.length;
            const prepPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

            return (
              <div
                key={subj.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden transition-all"
              >
                {/* Subject Header Bar */}
                <div
                  onClick={() => setExpandedSubjectId(isExpanded ? null : subj.id)}
                  className="p-5 flex items-center justify-between cursor-pointer select-none hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className="w-3.5 h-10 rounded-full shrink-0"
                      style={{ backgroundColor: subj.color || '#4F46E5' }}
                    />

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-500">
                          {subj.code}
                        </span>
                        <span aria-hidden="true" className="text-slate-400">·</span>
                        <h2 className="text-base font-bold text-slate-900 dark:text-white">
                          {subj.name}
                        </h2>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                        {subj.instructor && <span>Instructor: {subj.instructor}</span>}
                        {subj.creditHours && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span>{subj.creditHours} Credits</span>
                          </>
                        )}
                        <span aria-hidden="true">·</span>
                        <span>{totalCount} Chapter{totalCount === 1 ? '' : 's'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    {/* Completion bar */}
                    <div className="hidden sm:block text-right w-36">
                      <div className="flex justify-between text-xs font-mono mb-1">
                        <span className="text-slate-400">Mastery</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {prepPercent}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${prepPercent}%`,
                            backgroundColor: subj.color || '#4F46E5',
                          }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => openEditSubject(subj, e)}
                        className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors"
                        title="Edit Subject"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteSubject(subj.id, e)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                        title="Delete Subject"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="p-1.5 text-slate-400">
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Subject Chapters Accordion Content */}
                {isExpanded && (
                  <div className="border-t border-slate-100 dark:border-slate-800 p-5 bg-slate-50/40 dark:bg-slate-950/20 space-y-3">
                    <div className="flex items-center justify-between pb-1">
                      <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Chapters & Topics ({subjChapters.length})
                      </div>
                      <button
                        onClick={() => openAddChapter(subj.id)}
                        className="px-3 py-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-lg transition-colors flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Chapter
                      </button>
                    </div>

                    {subjChapters.length === 0 ? (
                      <div className="text-center py-6 text-xs text-slate-400">
                        No chapters added yet. Click "+ Add Chapter" above to start building the syllabus.
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {subjChapters
                          .sort((a, b) => a.chapterNumber - b.chapterNumber)
                          .map((ch) => (
                            <div
                              key={ch.id}
                              className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                            >
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-mono font-bold text-slate-400">
                                    Ch. {ch.chapterNumber}
                                  </span>
                                  <span className="font-bold text-slate-900 dark:text-white">
                                    {ch.chapterName}
                                  </span>
                                  <span className="text-slate-400">·</span>
                                  <span className="font-mono text-slate-500">
                                    {ch.estimatedStudyHours}h est.
                                  </span>
                                  <span className="text-slate-400">·</span>
                                  <span
                                    className={`px-2 py-0.5 rounded-md font-semibold text-[10px] ${
                                      ch.difficulty === 'Hard'
                                        ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400'
                                        : ch.difficulty === 'Medium'
                                        ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400'
                                        : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                                    }`}
                                  >
                                    {ch.difficulty}
                                  </span>
                                  <span className="text-slate-400">·</span>
                                  <span
                                    className={`px-2 py-0.5 rounded-md font-semibold text-[10px] ${
                                      ch.importance === 'High'
                                        ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                    }`}
                                  >
                                    {ch.importance} Imp.
                                  </span>
                                </div>

                                {ch.topicDescription && (
                                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                                    {ch.topicDescription}
                                  </p>
                                )}
                              </div>

                              {/* Right interactive status controls */}
                              <div className="flex items-center gap-3 shrink-0 self-end md:self-auto">
                                {/* Understanding Star Rating */}
                                <div className="flex items-center gap-0.5" title="Current Understanding (1 to 5)">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                      key={star}
                                      type="button"
                                      onClick={() => handleQuickUnderstandingChange(ch, star)}
                                      className={`p-0.5 hover:scale-125 transition-transform ${
                                        star <= ch.understandingLevel ? 'text-amber-400 fill-amber-400' : 'text-slate-300 dark:text-slate-700'
                                      }`}
                                    >
                                      <Star className="w-3.5 h-3.5" />
                                    </button>
                                  ))}
                                </div>

                                {/* Status Toggle Dropdown */}
                                <select
                                  value={ch.preparationStatus}
                                  onChange={(e) => handleQuickStatusChange(ch, e.target.value as PreparationStatus)}
                                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors ${
                                    ch.preparationStatus === 'Completed'
                                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                                      : ch.preparationStatus === 'Needs Revision'
                                      ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300'
                                      : ch.preparationStatus === 'In Progress'
                                      ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300'
                                      : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                                  }`}
                                >
                                  <option value="Not Started">Not Started</option>
                                  <option value="In Progress">In Progress</option>
                                  <option value="Needs Revision">Needs Revision</option>
                                  <option value="Completed">Completed</option>
                                </select>

                                {/* Action Buttons */}
                                <button
                                  onClick={() => openEditChapter(ch)}
                                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
                                  title="Edit Chapter"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteChapter(ch.id)}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                                  title="Remove Chapter"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Subject Modal */}
      {isSubjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingSubject ? 'Edit Subject Details' : 'Add Subject to Curriculum'}
              </h3>
              <button
                onClick={() => setIsSubjectModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSubject} className="p-6 space-y-4 text-xs">
              {/* Preset Template Picker when adding fresh subject */}
              {!editingSubject && (
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Predefined Core Subject Template (Optional)
                  </label>
                  <select
                    value={selectedPresetKey}
                    onChange={(e) => handleSelectPresetTemplate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 font-medium"
                  >
                    <option value="">Custom subject from scratch...</option>
                    {PREDEFINED_7_SUBJECTS.map((p) => (
                      <option key={p.key} value={p.key}>
                        {p.name} ({p.code} · {p.instructor})
                      </option>
                    ))}
                  </select>
                  {selectedPresetKey && (
                    <p className="text-[11px] text-indigo-600 dark:text-indigo-400 mt-1">
                      Includes all 5 curated syllabus chapters and topics!
                    </p>
                  )}
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Subject Name
                </label>
                <input
                  type="text"
                  required
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  placeholder="e.g. Deep Learning"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Course Code
                  </label>
                  <input
                    type="text"
                    value={subjectCode}
                    onChange={(e) => setSubjectCode(e.target.value)}
                    placeholder="e.g. CS 420"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Credit Hours
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={subjectCreditHours}
                    onChange={(e) => setSubjectCreditHours(parseInt(e.target.value) || 3)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Instructor / Professor Name
                </label>
                <input
                  type="text"
                  value={subjectInstructor}
                  onChange={(e) => setSubjectInstructor(e.target.value)}
                  placeholder="e.g. Prof. Yoshua Bengio"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Color Accent
                </label>
                <div className="flex items-center gap-2">
                  {['#6366F1', '#0284C7', '#EC4899', '#D97706', '#059669', '#7C3AED', '#2563EB'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setSubjectColor(c)}
                      className={`w-7 h-7 rounded-full transition-transform ${
                        subjectColor === c ? 'scale-125 ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-900' : ''
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsSubjectModalOpen(false)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
                >
                  Save Subject & Syllabus
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Chapter Modal */}
      {isChapterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingChapter ? 'Edit Chapter Topic' : 'Add Chapter to Syllabus'}
              </h3>
              <button
                onClick={() => setIsChapterModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveChapter} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Chapter / Topic Name
                </label>
                <input
                  type="text"
                  required
                  value={chapterName}
                  onChange={(e) => setChapterName(e.target.value)}
                  placeholder="e.g. Multi-Head Attention & Transformer Architectures"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Key Concepts / Topic Summary
                </label>
                <textarea
                  rows={2}
                  value={topicDescription}
                  onChange={(e) => setTopicDescription(e.target.value)}
                  placeholder="Scaled dot-product attention, query-key-value projections, positional encoding..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Difficulty Level
                  </label>
                  <select
                    value={chapterDifficulty}
                    onChange={(e) => setChapterDifficulty(e.target.value as Difficulty)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Easy">Easy (Faster intervals)</option>
                    <option value="Medium">Medium (Balanced)</option>
                    <option value="Hard">Hard (Additional drill)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Exam Importance
                  </label>
                  <select
                    value={chapterImportance}
                    onChange={(e) => setChapterImportance(e.target.value as Priority)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="High">High (High Weightage)</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Preparation Status
                  </label>
                  <select
                    value={chapterStatus}
                    onChange={(e) => setChapterStatus(e.target.value as PreparationStatus)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Not Started">Not Started</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Needs Revision">Needs Revision</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Est. Study Hours
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    max="15"
                    value={estimatedHours}
                    onChange={(e) => setEstimatedHours(parseFloat(e.target.value) || 3)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Understanding Level (1 to 5)
                </label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setUnderstandingLevel(star)}
                      className={`p-1 hover:scale-125 transition-transform ${
                        star <= understandingLevel ? 'text-amber-400 fill-amber-400' : 'text-slate-300 dark:text-slate-700'
                      }`}
                    >
                      <Star className="w-5 h-5" />
                    </button>
                  ))}
                  <span className="text-xs text-slate-500 ml-2">
                    {understandingLevel <= 2 && 'Needs frequent spaced drills'}
                    {understandingLevel === 3 && 'Moderate grasp'}
                    {understandingLevel >= 4 && 'Solid mastery'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsChapterModalOpen(false)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
                >
                  Save Chapter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
