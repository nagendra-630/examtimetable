-- ========================================================
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

-- 6. Revision Tasks Table
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

-- 7. Study Sessions Logs Table
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
) ENGINE=InnoDB;
