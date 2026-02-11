import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface LoginPageProps {
  defaultMode?: 'teacher' | 'student' | null;
}

interface FormData {
  email: string;
  password: string;
  classCode: string;
  studentId: string;
}

function LoginPage({ defaultMode = null }: LoginPageProps) {
  const [mode, setMode] = useState<'select' | 'teacher' | 'student'>(defaultMode || 'select');
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    classCode: '',
    studentId: ''
  });
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const { signInAsTeacher, signInAsStudent } = useAuth();
  const navigate = useNavigate();

  const handleTeacherLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await signInAsTeacher(formData.email, formData.password);

    if (result.success) {
      navigate('/teacher');
    } else {
      setError(result.error || 'Login failed');
      setLoading(false);
    }
  };

  const handleStudentLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await signInAsStudent(formData.classCode, formData.studentId);

    if (result.success) {
      navigate('/student');
    } else {
      setError(result.error || 'Login failed');
      setLoading(false);
    }
  };

  const handleBackToSelect = () => {
    setMode('select');
    setError('');
    setFormData({ email: '', password: '', classCode: '', studentId: '' });
  };

  // Role Selection Screen
  if (mode === 'select') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-800 mb-4">
              פלטפורמת קריאה
            </h1>
            <h2 className="text-3xl text-gray-600">Reading Platform</h2>
            <p className="text-gray-500 mt-4 text-lg">
              בחר את סוג הכניסה שלך
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Teacher Login Card */}
            <button
              onClick={() => setMode('teacher')}
              className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-transparent hover:border-blue-500 group"
            >
              <div className="text-center">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-200 transition-colors">
                  <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">מורה</h3>
                <p className="text-gray-600 mb-4">Teacher</p>
                <p className="text-sm text-gray-500">
                  כניסה עם כתובת אימייל וסיסמה
                </p>
                <p className="text-sm text-gray-400">
                  Login with email and password
                </p>
              </div>
            </button>

            {/* Student Login Card */}
            <button
              onClick={() => setMode('student')}
              className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-transparent hover:border-green-500 group"
            >
              <div className="text-center">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-green-200 transition-colors">
                  <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">תלמיד</h3>
                <p className="text-gray-600 mb-4">Student</p>
                <p className="text-sm text-gray-500">
                  כניסה עם קוד כיתה ומספר תלמיד
                </p>
                <p className="text-sm text-gray-400">
                  Login with class code and student ID
                </p>
              </div>
            </button>
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-500 text-sm">
              ברוכים הבאים לפלטפורמת הקריאה
            </p>
            <p className="text-gray-400 text-xs mt-1">
              Welcome to the Reading Platform
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Teacher Login Form
  if (mode === 'teacher') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <button
            onClick={handleBackToSelect}
            className="mb-6 text-gray-600 hover:text-gray-800 flex items-center gap-2 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            חזור לבחירה
          </button>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-800">כניסת מורה</h2>
              <p className="text-gray-600 mt-2">Teacher Login</p>
            </div>

            <form onSubmit={handleTeacherLogin} className="space-y-6">
              <div>
                <label className="block text-gray-700 mb-2 font-medium">
                  כתובת אימייל / Email
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="teacher@school.il"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2 font-medium">
                  סיסמה / Password
                </label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                  dir="ltr"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'טוען... / Loading...' : 'התחבר / Login'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Student Login Form
  if (mode === 'student') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4" dir="rtl">
        <div className="max-w-md w-full">
          <button
            onClick={handleBackToSelect}
            className="mb-6 text-gray-600 hover:text-gray-800 flex items-center gap-2 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            חזור לבחירה
          </button>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-800">כניסת תלמיד</h2>
              <p className="text-gray-600 mt-2">Student Login</p>
            </div>

            <form onSubmit={handleStudentLogin} className="space-y-6">
              <div>
                <label className="block text-gray-700 mb-2 font-medium">
                  קוד כיתה / Class Code
                </label>
                <input
                  type="text"
                  required
                  value={formData.classCode}
                  onChange={(e) => setFormData({ ...formData, classCode: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-center text-lg tracking-widest"
                  placeholder="ABC123"
                  maxLength={10}
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2 font-medium">
                  מספר תלמיד / Student ID
                </label>
                <input
                  type="text"
                  required
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-center text-lg"
                  placeholder="12345"
                  maxLength={20}
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'טוען... / Loading...' : 'התחבר / Login'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default LoginPage;
