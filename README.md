# Reading Platform - ESL Learning Application

A full-featured React-based web application for teaching English as a Second Language (ESL) to Israeli students. The platform includes ultra-short stories, mission-based learning, progress tracking, and separate portals for teachers and students.

## Features

### For Teachers
- **Dashboard**: Overview of classes, students, and platform statistics
- **Class Management**: Create and manage multiple classes
- **Student Management**: Add students, track individual progress
- **Mission Management**: Create and assign reading missions
- **Reports & Analytics**: View detailed progress reports and performance data
- **Settings**: Customize notifications and mission defaults

### For Students
- **Hebrew RTL Interface**: Fully localized Hebrew interface with right-to-left layout
- **Story Library**: Browse and read 484 ultra-short English stories
- **Mission System**: Complete reading missions to earn points
- **Progress Tracking**: View level progression, skills, and achievements
- **Bilingual Content**: Stories include Hebrew translations
- **Mobile Responsive**: Works on phones and tablets

### Content
- **484 Reading Stories**: Age-appropriate stories for 12-15 year old Israeli students
- **5 Difficulty Levels**: Stories organized by reading level
- **Vocabulary Database**: 2000+ curated vocabulary words
- **Bilingual Comprehension Questions**: Questions in both Hebrew and English

## Tech Stack

- **Frontend**: React 18 with Vite
- **Backend**: Firebase (Firestore, Authentication)
- **Routing**: React Router v6
- **Styling**: Custom CSS with utility classes (similar to Tailwind CSS)
- **Icons**: Emoji-based icon system (no external icon library needed)

## Project Structure

```
reading-platform/
├── public/
│   └── stories.json          # 484 reading stories
├── src/
│   ├── config/
│   │   └── firebase.js       # Firebase configuration
│   ├── contexts/
│   │   └── AuthContext.jsx   # Authentication context
│   ├── pages/
│   │   ├── LoginPage.jsx     # Role selection & login
│   │   ├── TeacherDashboard.jsx  # Teacher portal layout
│   │   ├── StudentPortal.jsx     # Student portal layout
│   │   ├── teacher/          # Teacher pages
│   │   │   ├── ClassesPage.jsx
│   │   │   ├── StudentsPage.jsx
│   │   │   ├── MissionsPage.jsx
│   │   │   ├── ReportsPage.jsx
│   │   │   └── SettingsPage.jsx
│   │   └── student/          # Student pages
│   │       ├── StudentHome.jsx
│   │       ├── StudentMissions.jsx
│   │       ├── StudentStories.jsx
│   │       └── StudentProfile.jsx
│   ├── services/
│   │   ├── firestore.js      # Firestore operations
│   │   └── stories.js        # Story data access
│   ├── App.jsx               # Main app with routing
│   └── App.css               # Global styles
├── .env.example              # Environment variables template
└── package.json
```

## Setup Instructions

### 1. Prerequisites
- Node.js 18+ and npm
- A Firebase account and project

### 2. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project (or use existing)
3. Enable **Authentication** → **Email/Password**
4. Create a **Firestore Database**
5. Get your Firebase config values

### 3. Install Dependencies

```bash
cd reading-platform
npm install
```

### 4. Environment Configuration

Copy `.env.example` to `.env` and fill in your Firebase credentials:

```bash
cp .env.example .env
```

Edit `.env` with your Firebase configuration:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

### 5. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### 6. Build for Production

```bash
npm run build
```

The optimized production files will be in the `dist/` directory.

### 7. Deploy

Deploy the `dist/` folder to any static hosting service:
- **Firebase Hosting**: `firebase deploy`
- **Netlify**: Drag and drop the `dist/` folder
- **Vercel**: Connect your Git repository
- **GitHub Pages**: Use the `dist/` folder

## Firestore Security Rules

Important: Set up proper Firestore security rules in your Firebase console. Here's a starting point:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Teachers can read/write their own data
    match /teachers/{teacherId} {
      allow read, write: if request.auth != null;
    }

    // Students can read their data, teachers can write
    match /students/{studentId} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    // Classes managed by teachers
    match /classes/{classId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

## Usage

### Teacher Login
1. Select "מורה / Teacher" on the login page
2. Enter email and password (requires Firebase Auth account)
3. Create classes and add students
4. Create missions and assign to classes

### Student Login
1. Select "תלמיד / Student" on the login page
2. Enter class code (provided by teacher)
3. Enter student ID
4. Start reading stories and completing missions

## Story Content Format

Stories follow these specifications:
- 20-30 words per story
- 5 sentences each
- Simple present or past tense
- Maximum 8 words per sentence
- Emotional arc: problem → action → resolution
- Difficulty levels 1-5
- Bilingual (English + Hebrew translation)

## License

This project is for educational purposes.

## Support

For issues or questions, please refer to the ARCHITECTURE.md document for detailed system design documentation.
