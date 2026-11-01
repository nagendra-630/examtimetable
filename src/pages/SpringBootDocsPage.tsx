import React, { useState } from 'react';
import {
  BookOpen,
  Check,
  Code2,
  Copy,
  Database,
  ExternalLink,
  Layers,
  Server,
  Terminal,
} from 'lucide-react';

export const SpringBootDocsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'architecture' | 'mysql' | 'apis' | 'deployment'>('architecture');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyToClipboard = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2500);
  };

  const schemaSql = `-- ========================================================
-- Exam Timetable Planner - MySQL Relational Schema
-- Normalized 3NF Database Design with Indexes & Foreign Keys
-- ========================================================

CREATE DATABASE IF NOT EXISTS exam_planner_db
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE exam_planner_db;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(180) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('STUDENT', 'ADMIN') NOT NULL DEFAULT 'STUDENT',
  school_or_university VARCHAR(200),
  target_gpa_or_goal VARCHAR(100),
  avatar_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_email (email)
) ENGINE=InnoDB;

-- 2. Study Preferences Table
CREATE TABLE IF NOT EXISTS study_preferences (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL UNIQUE,
  daily_available_hours DECIMAL(4,2) NOT NULL DEFAULT 4.0,
  preferred_start_time TIME NOT NULL DEFAULT '09:00:00',
  preferred_end_time TIME NOT NULL DEFAULT '21:00:00',
  session_duration_minutes INT NOT NULL DEFAULT 50,
  break_duration_minutes INT NOT NULL DEFAULT 10,
  reserve_pre_exam_days INT NOT NULL DEFAULT 1,
  enable_spaced_repetition BOOLEAN NOT NULL DEFAULT TRUE,
  focus_weak_subjects BOOLEAN NOT NULL DEFAULT TRUE,
  email_notifications BOOLEAN NOT NULL DEFAULT TRUE,
  daily_reminder_time TIME NOT NULL DEFAULT '08:00:00',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 3. Subjects Table
CREATE TABLE IF NOT EXISTS subjects (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  name VARCHAR(150) NOT NULL,
  code VARCHAR(20) NOT NULL,
  color VARCHAR(10) NOT NULL DEFAULT '#3B82F6',
  instructor VARCHAR(120),
  credit_hours INT DEFAULT 3,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_subj_user (user_id)
) ENGINE=InnoDB;

-- 4. Chapters Table
CREATE TABLE IF NOT EXISTS chapters (
  id VARCHAR(36) PRIMARY KEY,
  subject_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  chapter_number INT NOT NULL,
  chapter_name VARCHAR(200) NOT NULL,
  topic_description TEXT,
  difficulty ENUM('Easy', 'Medium', 'Hard') NOT NULL DEFAULT 'Medium',
  importance ENUM('Low', 'Medium', 'High') NOT NULL DEFAULT 'High',
  preparation_status ENUM('Not Started', 'In Progress', 'Needs Revision', 'Completed') NOT NULL DEFAULT 'Not Started',
  estimated_study_hours DECIMAL(4,2) NOT NULL DEFAULT 3.0,
  understanding_level TINYINT NOT NULL DEFAULT 3 CHECK (understanding_level BETWEEN 1 AND 5),
  revision_count INT NOT NULL DEFAULT 0,
  last_revised_date DATE,
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_chap_status (preparation_status),
  INDEX idx_chap_understanding (understanding_level)
) ENGINE=InnoDB;

-- 5. Exams Table
CREATE TABLE IF NOT EXISTS exams (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  subject_id VARCHAR(36) NOT NULL,
  exam_name VARCHAR(200) NOT NULL,
  exam_date DATE NOT NULL,
  start_time TIME NOT NULL,
  duration_minutes INT NOT NULL DEFAULT 120,
  exam_type VARCHAR(50) NOT NULL DEFAULT 'Midterm',
  difficulty ENUM('Easy', 'Medium', 'Hard') NOT NULL DEFAULT 'Medium',
  priority ENUM('Low', 'Medium', 'High') NOT NULL DEFAULT 'High',
  target_score INT DEFAULT 90,
  venue_or_room VARCHAR(150),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
  INDEX idx_exam_date (exam_date)
) ENGINE=InnoDB;

-- 6. Revision Schedules / Tasks Table
CREATE TABLE IF NOT EXISTS revision_tasks (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  exam_id VARCHAR(36),
  subject_id VARCHAR(36) NOT NULL,
  chapter_id VARCHAR(36) NOT NULL,
  scheduled_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  duration_minutes INT NOT NULL DEFAULT 50,
  revision_type VARCHAR(50) NOT NULL,
  priority ENUM('Low', 'Medium', 'High') NOT NULL DEFAULT 'High',
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMP NULL,
  actual_duration_minutes INT NULL,
  spaced_interval_day INT NULL,
  notes TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE SET NULL,
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
  FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE,
  INDEX idx_task_date (scheduled_date, is_completed)
) ENGINE=InnoDB;

-- 7. Study Session Logs Table (Historical analytics)
CREATE TABLE IF NOT EXISTS study_sessions (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  task_id VARCHAR(36),
  subject_id VARCHAR(36) NOT NULL,
  chapter_name VARCHAR(200) NOT NULL,
  session_date DATE NOT NULL,
  duration_minutes INT NOT NULL,
  focus_rating TINYINT NOT NULL DEFAULT 5 CHECK (focus_rating BETWEEN 1 AND 5),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
) ENGINE=InnoDB;`;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
          <Server className="w-4 h-4" />
          <span>Full-Stack Architecture & Reference Deliverables</span>
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1">
          Spring Boot & MySQL Backend Documentation
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Explore the production-ready Java Spring Boot REST controllers, Spring Security JWT configurations, MySQL 3NF schema, and deployment workflows.
        </p>
      </div>

      {/* Segmented Tab Navigation */}
      <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit">
        {[
          { id: 'architecture', label: 'Architecture & Stack', icon: Layers },
          { id: 'mysql', label: 'MySQL 3NF Schema', icon: Database },
          { id: 'apis', label: 'REST API Endpoints', icon: Code2 },
          { id: 'deployment', label: 'Deployment & Setup', icon: Terminal },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-2 transition-colors ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: Architecture & Stack */}
      {activeTab === 'architecture' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
              <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                LAYER 01
              </span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Frontend Single-Page App
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                React 19 + TypeScript + Tailwind CSS with responsive layout, Recharts data analytics, and interactive Pomodoro focus timer.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
              <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                LAYER 02
              </span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Java Spring Boot 3.3.x Backend
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Spring Security with stateless JWT Bearer token authentication, BCrypt password encoder, Spring Data JPA with Hibernate, and Spaced Repetition engine service.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
              <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                LAYER 03
              </span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                MySQL Relational Storage
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Normalized 3NF relational schema with foreign key constraints (ON DELETE CASCADE), compound date/status indexes, and check constraints for focus ratings.
              </p>
            </div>
          </div>

          {/* Directory Hierarchy */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Target Spring Boot Project Structure
            </h3>
            <pre className="p-4 rounded-xl bg-slate-950 text-slate-200 font-mono text-xs overflow-x-auto leading-relaxed">
{`backend-spring-boot/
├── pom.xml                                   # Maven dependencies (Spring Boot 3, Security, JPA, MySQL)
├── src/main/java/com/examplanner/
│   ├── ExamPlannerApplication.java          # Spring Boot Application entrypoint
│   ├── config/
│   │   ├── SecurityConfig.java               # Spring Security filter chain & CORS
│   │   ├── JwtAuthenticationFilter.java      # JWT token extraction & verification
│   │   └── JwtUtils.java                     # Token generation & claims validation
│   ├── controller/
│   │   ├── AuthController.java               # /api/auth/register, /api/auth/login
│   │   ├── ExamController.java               # /api/exams CRUD
│   │   ├── SubjectController.java            # /api/subjects & /api/chapters
│   │   ├── ScheduleController.java           # /api/schedule/generate, /api/tasks
│   │   └── AnalyticsController.java          # /api/analytics/summary
│   ├── model/
│   │   ├── User.java, Role.java              # User entity with BCrypt hash
│   │   ├── Subject.java, Chapter.java        # Syllabus entities
│   │   ├── Exam.java                         # Exam date, type, priority
│   │   ├── RevisionTask.java                 # Spaced repetition task entity
│   │   └── StudySession.java                 # Logged focus sessions
│   ├── repository/
│   │   ├── UserRepository.java               # JpaRepository<User, String>
│   │   ├── ExamRepository.java               # Custom query: findUpcomingExams
│   │   ├── RevisionTaskRepository.java       # Queries: findByScheduledDate
│   │   └── ChapterRepository.java            # Queries: findWeakChapters
│   └── service/
│       ├── SmartSchedulingService.java       # Spaced repetition scheduling algorithm
│       └── UserDetailsServiceImpl.java       # User authentication loader
└── src/main/resources/
    ├── application.yml                       # DataSource & JWT secret properties
    └── schema.sql                            # Full MySQL DDL`}
            </pre>
          </div>
        </div>
      )}

      {/* TAB 2: MySQL Schema */}
      {activeTab === 'mysql' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                MySQL 3NF Relational Database Schema
              </h3>
              <p className="text-xs text-slate-500">
                Includes normalized entities, primary keys, cascading foreign keys, and performant indexes.
              </p>
            </div>
            <button
              onClick={() => copyToClipboard(schemaSql, 'mysql')}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg flex items-center gap-1.5"
            >
              {copiedSection === 'mysql' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSection === 'mysql' ? 'Copied' : 'Copy DDL'}</span>
            </button>
          </div>

          <pre className="p-4 rounded-xl bg-slate-950 text-slate-200 font-mono text-xs overflow-x-auto leading-relaxed max-h-[500px]">
            {schemaSql}
          </pre>
        </div>
      )}

      {/* TAB 3: REST API Endpoints */}
      {activeTab === 'apis' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              RESTful API Specification & Endpoints
            </h3>
            <p className="text-xs text-slate-500">
              Complete catalog of REST APIs with Bearer JWT Authorization and payload structures.
            </p>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {/* Auth */}
            <div className="py-3 space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded text-[11px]">
                  POST
                </span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  /api/auth/register
                </span>
                <span className="text-slate-400">· Register student/admin</span>
              </div>
              <p className="text-slate-500 pl-14">
                Payload: <code>&#123; name, email, password, role &#125;</code> &rarr; Returns JWT token & user profile.
              </p>
            </div>

            <div className="py-3 space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded text-[11px]">
                  POST
                </span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  /api/auth/login
                </span>
                <span className="text-slate-400">· Authenticate & issue JWT</span>
              </div>
              <p className="text-slate-500 pl-14">
                Payload: <code>&#123; email, password &#125;</code> &rarr; Returns JWT Bearer token.
              </p>
            </div>

            {/* Exams */}
            <div className="py-3 space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded text-[11px]">
                  GET
                </span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  /api/exams
                </span>
                <span className="text-slate-400">· Retrieve student exams sorted by date</span>
              </div>
            </div>

            <div className="py-3 space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded text-[11px]">
                  POST
                </span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  /api/exams
                </span>
                <span className="text-slate-400">· Create examination record</span>
              </div>
            </div>

            {/* Scheduler */}
            <div className="py-3 space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded text-[11px]">
                  POST
                </span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  /api/schedule/generate
                </span>
                <span className="text-slate-400">· Execute smart spaced repetition generator</span>
              </div>
              <p className="text-slate-500 pl-14">
                Payload: <code>&#123; startDate, dailyAvailableHours, sessionDurationMinutes, preserveCompleted &#125;</code>
              </p>
            </div>

            <div className="py-3 space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded text-[11px]">
                  PATCH
                </span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  /api/tasks/&#123;id&#125;/toggle
                </span>
                <span className="text-slate-400">· Mark completed and increment revision count</span>
              </div>
            </div>

            <div className="py-3 space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded text-[11px]">
                  POST
                </span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  /api/tasks/&#123;id&#125;/reschedule
                </span>
                <span className="text-slate-400">· Intelligently shift missed session</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Deployment & Setup */}
      {activeTab === 'deployment' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Local Development Setup Instructions
            </h3>

            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="font-bold text-slate-800 dark:text-slate-200 block">
                  1. Setup MySQL Database:
                </span>
                <pre className="font-mono text-[11px] text-slate-700 dark:text-slate-300">
                  mysql -u root -p &lt; backend-spring-boot/schema.sql
                </pre>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="font-bold text-slate-800 dark:text-slate-200 block">
                  2. Configure application.yml:
                </span>
                <pre className="font-mono text-[11px] text-slate-700 dark:text-slate-300">
{`spring:
  datasource:
    url: jdbc:mysql://localhost:3306/exam_planner_db?useSSL=false
    username: root
    password: your_secret_password
  jpa:
    hibernate:
      ddl-auto: update`}
                </pre>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="font-bold text-slate-800 dark:text-slate-200 block">
                  3. Run Spring Boot Service:
                </span>
                <pre className="font-mono text-[11px] text-slate-700 dark:text-slate-300">
                  cd backend-spring-boot && ./mvnw spring-boot:run
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
