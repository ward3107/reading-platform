# PROJECT CONTEXT

## 1. Project Overview

**Name:** KriaKids (קריאה לילדים - "Reading for Kids")
**Description:** A bilingual (Hebrew/English) educational reading platform designed to help students improve their English reading skills through interactive stories, comprehension questions, and gamified missions.

---

## 2. Tech Stack Identification

### Frontend Framework
| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19.2.0 | UI Framework |
| **TypeScript** | 5.9.3 | Type-safe JavaScript |
| **Vite** | 7.2.4 | Build tool & dev server |
| **React Router DOM** | 7.13.0 | Client-side routing |
| **Tailwind CSS** | (implicit via classes) | Styling |

### Backend Framework
| Technology | Purpose |
|------------|---------|
| **Firebase** | Backend-as-a-Service (BaaS) |
| **Firebase Authentication** | User authentication |
| **Cloud Firestore** | NoSQL database |

### Database & ORM/Tool
| Technology | Type | Purpose |
|------------|------|---------|
| **Cloud Firestore** | NoSQL Document Database | Primary data storage |
| No ORM | - | Direct Firebase SDK usage |

### Key Libraries
| Library | Version | Purpose |
|---------|---------|---------|
| **firebase** | 12.9.0 | Firebase SDK for web |
| **@heroicons/react** | 2.2.0 | SVG icon library |
| **recharts** | 3.7.0 | Data visualization/charts |
| **workbox-precaching** | 7.4.0 | PWA offline caching |
| **ESLint** | 9.39.1 | Code linting |

---

## 3. Architecture Overview

### Application Type
**Frontend-only SPA (Single Page Application)** with Firebase Backend-as-a-Service

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT (Browser)                      │
│  ┌─────────────────────────────────────────────────────┐│
│  │  React 19 + TypeScript + Vite                       ││
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ││
│  │  │   Pages     │  │  Contexts   │  │  Services   │  ││
│  │  │  (UI/UX)    │  │  (State)    │  │  (Data)     │  ││
│  │  └─────────────┘  └─────────────┘  └─────────────┘  ││
│  └─────────────────────────────────────────────────────┘│
└──────────────────────────┬──────────────────────────────┘
                           │ Firebase SDK
                           ▼
┌─────────────────────────────────────────────────────────┐
│                 FIREBASE (Cloud Backend)                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │
│  │   Auth      │  │  Firestore  │  │   Hosting   │      │
│  │ (Email/Pass)│  │   (NoSQL)   │  │   (CDN)     │      │
│  └─────────────┘  └─────────────┘  └─────────────┘      │
└─────────────────────────────────────────────────────────┘
```

### Entry Points
| File | Purpose |
|------|---------|
| `index.html` | HTML entry point |
| `src/main.tsx` | React application bootstrap |
| `src/App.tsx` | Root component with routing |

### Project Structure
```
reading-platform/
├── src/
│   ├── main.tsx              # App entry point
│   ├── App.tsx               # Root component + routing
│   ├── vite-env.d.ts         # Type declarations
│   ├── config/
│   │   └── firebase.ts       # Firebase initialization
│   ├── contexts/
│   │   └── AuthContext.tsx   # Authentication state management
│   ├── services/
│   │   ├── firestore.ts      # Firebase Firestore operations
│   │   └── stories.ts        # Story content management
│   ├── types/
│   │   └── index.ts          # TypeScript type definitions
│   └── pages/
│       ├── LoginPage.tsx
│       ├── TeacherDashboard.tsx
│       ├── StudentPortal.tsx
│       ├── teacher/
│       │   ├── ClassesPage.tsx
│       │   ├── StudentsPage.tsx
│       │   ├── MissionsPage.tsx
│       │   ├── ReportsPage.tsx
│       │   └── SettingsPage.tsx
│       └── student/
│           ├── StudentHome.tsx
│           ├── StudentStories.tsx
│           ├── StudentMissions.tsx
│           └── StudentProfile.tsx
├── public/
│   └── stories.json          # Embedded story content
└── package.json
```

---

## 4. Core Features & Data Operations

### Feature Summary
**KriaKids** is an educational platform that enables:
- **Teachers** to manage classes, students, assign reading missions, and track student progress
- **Students** to read English stories, complete comprehension exercises, earn points, and level up

### Data Operations (Firestore)

| Operation | Function | Collection |
|-----------|----------|------------|
| Create Teacher | `createTeacher()` | `teachers` |
| Get Teacher by Email | `getTeacherByEmail()` | `teachers` |
| Update Teacher | `updateTeacher()` | `teachers` |
| Create Class | `createClass()` | `classes` |
| Get Classes by Teacher | `getClassesByTeacher()` | `classes` |
| Update/Delete Class | `updateClass()`, `deleteClass()` | `classes` |
| Create Student | `createStudent()` | `students` |
| Get Students by Class | `getStudentsByClass()` | `students` |
| Update Student | `updateStudent()` | `students` |
| Create Mission Template | `createMissionTemplate()` | `mission_templates` |
| Assign Mission to Student | `assignMissionToStudent()` | `daily_missions` |
| Get Missions for Student | `getMissionsForStudent()` | `daily_missions` |
| Update Mission Progress | `updateMissionProgress()` | `daily_missions` |
| Complete Mission | `completeMission()` | `daily_missions` + `students` |
| Get Student Skills | `getStudentSkills()` | `student_skills` |
| Update Student Skills | `updateStudentSkills()` | `student_skills` |
| Get Teacher Stats | `getTeacherStats()` | `teacher_stats` |
| Get Class Analytics | `getClassAnalytics()` | Computed |

### Client-Side Routes

| Route | Component | Access |
|-------|-----------|--------|
| `/` | LoginPage | Public |
| `/login/teacher` | LoginPage (teacher mode) | Public |
| `/login/student` | LoginPage (student mode) | Public |
| `/teacher/*` | TeacherDashboard | Teacher only |
| `/student/*` | StudentPortal | Student only |

---

## 5. Data Model Inference

### Entity Relationship Diagram

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│   Teacher   │───1:N─│    Class    │───1:N─│   Student   │
└─────────────┘       └─────────────┘       └─────────────┘
       │                    │                      │
       │ 1:1                │                      │ 1:N
       ▼                    │                      ▼
┌─────────────┐             │              ┌─────────────┐
│TeacherStats │             │              │DailyMission │
└─────────────┘             │              └─────────────┘
                            │                      │
                            │                      │ N:1
                            │                      ▼
                     ┌─────────────┐        ┌─────────────┐
                     │ClassAnalytics       │MissionTemplate│
                     └─────────────┘        └─────────────┘
                                                   │
                            ┌─────────────┐        │ N:M
                            │StudentSkills│◄───────┘
                            └─────────────┘
```

### Core Entities

#### Teacher
```typescript
interface Teacher {
  id: string;
  name: string;
  email: string;
  school: string;
  isActive: boolean;
  createdAt?: string;
}
```

#### Student
```typescript
interface Student {
  id: string;
  name: string;
  studentId: string;        // Student identifier for login
  classId: string;          // FK to Class
  email?: string;
  totalPoints: number;      // Gamification points
  currentLevel: number;     // Reading level (1-5)
  storiesRead: number;      // Stories completed count
  missionsCompleted: number;
  isActive: boolean;
  skills?: StudentSkills;
}
```

#### Class
```typescript
interface Class {
  id: string;
  name: string;             // Hebrew name
  nameEn: string;           // English name
  grade: string;
  teacherId: string;        // FK to Teacher
  studentCount: number;
  isActive: boolean;
  analytics?: ClassAnalytics;
}
```

#### Story
```typescript
interface Story {
  id: string;
  title: string;            // Hebrew title
  titleEn: string;          // English title
  text: string;             // English story text
  hebrewTranslation: string;
  difficulty: number;       // 1-5 scale
  wordCount: number;
  sentences: number;
  vocabularyIds: string[];
  emotionWords: string[];
  themes: string[];
  comprehensionQuestion: string;
  comprehensionQuestionEn: string;
  answerOptions?: string[];
  answerOptionsEn?: string[];
  correctAnswerIndex?: number;
}
```

#### Mission
```typescript
interface Mission {
  id: string;
  title: string;
  titleEn: string;
  classId: string;
  targetLevel: number;
  storyIds: string[];
  status: 'draft' | 'active' | 'completed';
  startDate: string;
  endDate: string;
}
```

#### StudentSkills
```typescript
interface StudentSkills {
  readingLevel: number;
  comprehensionLevel: number;
  vocabularyLevel: number;
  fluencyLevel: number;
  strengths: string[];
  areasForImprovement: string[];
}
```

### Firestore Collections

| Collection | Description |
|------------|-------------|
| `teachers` | Teacher profiles |
| `teacher_stats` | Aggregated teacher statistics |
| `classes` | Class/group definitions |
| `students` | Student profiles |
| `student_skills` | Student skill assessments |
| `mission_templates` | Reusable mission definitions |
| `daily_missions` | Assigned missions to students |
| `mission_logs` | Mission progress history |
| `content_cache` | Cached story content |
| `pending_sync` | Offline sync queue |

---

## 6. Security Mechanisms

### Authentication

| Method | Details |
|--------|---------|
| **Provider** | Firebase Authentication |
| **Teacher Auth** | Email/Password with Firebase Auth |
| **Student Auth** | Class Code + Student ID (custom flow) |
| **Persistence** | `browserLocalPersistence` |
| **Session** | Managed by Firebase SDK |

### Authentication Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     TEACHER LOGIN                           │
│  1. Email + Password entered                                │
│  2. signInWithEmailAndPassword (Firebase)                   │
│  3. getTeacherByEmail() → verify teacher exists             │
│  4. Check isActive status                                   │
│  5. Store in AuthContext → Redirect to /teacher             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                     STUDENT LOGIN                           │
│  1. Class Code + Student ID entered                         │
│  2. doc(students, studentId) → verify exists                │
│  3. Check classId matches + isActive                        │
│  4. Store in AuthContext → Redirect to /student             │
│  (No Firebase Auth for students - direct Firestore lookup)  │
└─────────────────────────────────────────────────────────────┘
```

### Route Protection

| Component | Purpose |
|-----------|---------|
| `ProtectedRoute` | Wraps routes requiring authentication, checks `userType` |
| `PublicRoute` | Redirects authenticated users to their dashboard |

### Security Considerations

| Feature | Status | Notes |
|---------|--------|-------|
| **Demo Mode** | ✅ Implemented | Fallback when Firebase not configured |
| **Role-Based Access** | ✅ Implemented | Teacher vs Student routes |
| **Firestore Rules** | ⚠️ Server-side | Should be configured in Firebase Console |
| **Input Validation** | ⚠️ Basic | Form validation only |
| **CSRF Protection** | ✅ Firebase | Handled by Firebase SDK |
| **Rate Limiting** | ❌ Not implemented | Could be added via Firebase |
| **CORS** | ✅ Firebase | Handled by Firebase Hosting |
| **Content Security Policy** | ⚠️ Should be configured | Via Firebase Hosting headers |

### Environment Configuration

```bash
# Required Firebase Environment Variables
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
```

### Demo Mode
The application includes a **Demo Mode** that activates when Firebase is not configured. It provides:
- Mock teacher/student data
- Functional UI without backend
- Pre-loaded stories from `stories.json`

---

## 7. Gamification System

| Feature | Description |
|---------|-------------|
| **Points** | Earned by reading stories and completing missions |
| **Levels** | 1-5 scale based on cumulative points |
| **Missions** | Assigned reading tasks with progress tracking |
| **Achievements** | Unlocked based on milestones (stories read, missions completed) |
| **Skills** | 4 tracked areas: Fluency, Comprehension, Vocabulary, Grammar |
| **Reading Streak** | Consecutive days of reading activity |

---

## 8. Internationalization

| Aspect | Implementation |
|--------|----------------|
| **Languages** | Hebrew (primary), English (secondary) |
| **Direction** | RTL for Hebrew, LTR for English content |
| **Display** | Bilingual labels on most UI elements |
| **Stories** | English text with Hebrew translations |

---

## 9. Future Considerations

### Recommended Improvements
1. **Firestore Security Rules** - Implement proper security rules in Firebase Console
2. **Error Boundaries** - Add React error boundaries for better error handling
3. **Unit Tests** - Add testing framework (Vitest + React Testing Library)
4. **E2E Tests** - Add Playwright or Cypress for integration testing
5. **Analytics** - Integrate Google Analytics or Firebase Analytics
6. **Push Notifications** - For mission reminders and achievements
7. **Offline Support** - Full PWA implementation with service workers
8. **i18n Library** - Consider react-i18next for better translation management
