# Exam Timetable Planner – Smart Revision Scheduler (Spring Boot & MySQL Backend)

Production-grade RESTful API backend engineered with Java 17, Spring Boot 3.3.x, Spring Security (JWT + BCrypt), Spring Data JPA, and MySQL.

## 1. Architecture Highlights

- **JWT Authentication & Authorization**: Stateless Bearer token validation with BCrypt password hashing.
- **Smart Spaced Repetition Engine**: Algorithmic scheduler prioritizing imminent exams, topic difficulty multipliers (1.0x - 1.6x), student understanding levels (1 - 5 stars), and cognitive rest buffers.
- **Conflict Prevention**: Enforces daily study hour limits and prevents session overlap.
- **MySQL 3NF Relational Schema**: Strict foreign keys with cascading deletions, compound indexes on `(scheduled_date, is_completed)` for sub-millisecond query response times.

---

## 2. Prerequisites & Local Environment

- **Java JDK**: Version 17 or higher
- **Maven**: Version 3.8+ (or use included `./mvnw`)
- **MySQL Server**: Version 8.0+

---

## 3. Database Initialization

Execute the database definition script using MySQL CLI or Workbench:

```bash
mysql -u root -p < schema.sql
```

This will create `exam_planner_db` with tables:
- `users`
- `study_preferences`
- `subjects`
- `chapters`
- `exams`
- `revision_tasks`
- `study_sessions`

---

## 4. Configuration

Edit `src/main/resources/application.yml`:

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/exam_planner_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
    username: root
    password: your_secret_password
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: false

jwt:
  secret: 404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970
  expirationMs: 86400000 # 24 Hours
```

---

## 5. Build and Run

```bash
cd backend-spring-boot
./mvnw clean install
./mvnw spring-boot:run
```

The server starts on port `8080`.

---

## 6. REST API Endpoints Overview

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new student or administrator | No |
| `POST` | `/api/auth/login` | Authenticate and retrieve JWT Bearer token | No |
| `GET` | `/api/exams` | List exams for the authenticated student | Yes |
| `POST` | `/api/exams` | Add exam with date, priority, and venue | Yes |
| `PUT` | `/api/exams/{id}` | Update existing exam details | Yes |
| `DELETE` | `/api/exams/{id}` | Delete exam and clear linked tasks | Yes |
| `GET` | `/api/subjects` | Retrieve subjects and chapters syllabus | Yes |
| `POST` | `/api/schedule/generate` | Run Spaced Repetition Scheduling Algorithm | Yes |
| `PATCH` | `/api/tasks/{id}/toggle` | Mark session complete and log focus | Yes |
| `POST` | `/api/tasks/{id}/reschedule` | Reschedule missed session into next available slot | Yes |
| `GET` | `/api/analytics/summary` | Retrieve subject mastery and study hour logs | Yes |

---

## 7. Automated Testing

Run the test suite:

```bash
./mvnw test
```

Includes unit tests for the Smart Scheduling algorithm, JPA integration tests with H2 in-memory fallback, and MockMvc security authorization tests.
