import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import './App.css';

// Pages
import LoginPage from './pages/LoginPage';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentPortal from './pages/StudentPortal';

// Protected Route Component
function ProtectedRoute({ children, allowedUserType }) {
  const { user, student, userType, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (allowedUserType === 'teacher' && userType !== 'teacher') {
    return <Navigate to="/login/teacher" replace />;
  }

  if (allowedUserType === 'student' && userType !== 'student') {
    return <Navigate to="/login/student" replace />;
  }

  if (!user && !student) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// Public Route - redirect if already logged in
function PublicRoute({ children }) {
  const { user, student, userType, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (userType === 'teacher') {
    return <Navigate to="/teacher" replace />;
  }

  if (userType === 'student') {
    return <Navigate to="/student" replace />;
  }

  return children;
}

function AppRoutes() {
  return (
    <Router>
      <Routes>
        {/* Default login page - shows role selection */}
        <Route
          path="/"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />

        {/* Teacher login */}
        <Route
          path="/login/teacher"
          element={
            <PublicRoute>
              <LoginPage defaultMode="teacher" />
            </PublicRoute>
          }
        />

        {/* Student login */}
        <Route
          path="/login/student"
          element={
            <PublicRoute>
              <LoginPage defaultMode="student" />
            </PublicRoute>
          }
        />

        {/* Teacher Dashboard */}
        <Route
          path="/teacher/*"
          element={
            <ProtectedRoute allowedUserType="teacher">
              <TeacherDashboard />
            </ProtectedRoute>
          }
        />

        {/* Student Portal */}
        <Route
          path="/student/*"
          element={
            <ProtectedRoute allowedUserType="student">
              <StudentPortal />
            </ProtectedRoute>
          }
        />

        {/* Catch all - redirect to login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <div className="App" dir="ltr">
        <AppRoutes />
      </div>
    </AuthProvider>
  );
}

export default App;
