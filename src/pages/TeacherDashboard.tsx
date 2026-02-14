import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  getClassesByTeacher,
  getTeacherStats,
  getClassAnalytics
} from '../services/firestore';
import type { Class } from '../types';

// Dashboard Components
import ClassesPage from './teacher/ClassesPage';
import StudentsPage from './teacher/StudentsPage';
import MissionsPage from './teacher/MissionsPage';
import ReportsPage from './teacher/ReportsPage';
import SettingsPage from './teacher/SettingsPage';

interface TeacherStats {
  totalStudents: number;
  totalClasses: number;
  totalMissionsCompleted: number;
  averageReadingLevel: number;
}

interface ClassWithAnalytics extends Class {
  analytics?: {
    totalStudents: number;
    avgReadingLevel: number;
    totalPoints: number;
    activeStudents: number;
  };
}

function TeacherDashboard() {
  const { teacher, signOut } = useAuth();
  const navigate = useNavigate();
  const [classes, setClasses] = useState<ClassWithAnalytics[]>([]);
  const [stats, setStats] = useState<TeacherStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<string>('dashboard');

  useEffect(() => {
    if (teacher) {
      loadDashboardData();
    }
  }, [teacher]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [classesData, statsData] = await Promise.all([
        getClassesByTeacher(teacher!.id),
        getTeacherStats(teacher!.id)
      ]);

      setClasses(classesData as ClassWithAnalytics[]);
      setStats(statsData as TeacherStats);

      // Load analytics for each class
      const classesWithAnalytics = await Promise.all(
        classesData.map(async (cls) => {
          const analytics = await getClassAnalytics(cls.id);
          return { ...cls, analytics };
        })
      );
      setClasses(classesWithAnalytics);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const navigation = [
    { name: 'דשבורד', nameEn: 'Dashboard', id: 'dashboard', icon: '📊' },
    { name: 'כיתות', nameEn: 'Classes', id: 'classes', icon: '🏫' },
    { name: 'תלמידים', nameEn: 'Students', id: 'students', icon: '👥' },
    { name: 'משימות', nameEn: 'Missions', id: 'missions', icon: '🎯' },
    { name: 'דוחות', nameEn: 'Reports', id: 'reports', icon: '📈' },
    { name: 'הגדרות', nameEn: 'Settings', id: 'settings', icon: '⚙️' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile backdrop when sidebar open */}
      <div
        className={`fixed inset-0 bg-black/50 z-30 transition-opacity md:hidden ${
          sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden
      />

      {/* Sidebar: overlay on mobile, inline on md+ */}
      <aside
        className={`fixed md:relative inset-y-0 left-0 z-40 flex flex-col bg-slate-800 text-white transition-all duration-300 ${
          sidebarOpen ? 'w-64 translate-x-0' : 'w-20 -translate-x-full md:translate-x-0'
        }`}
      >
        {/* Logo/Brand */}
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-400 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-xl">K</span>
            </div>
            {sidebarOpen && (
              <div>
                <h1 className="font-bold text-lg">KriaKids</h1>
                <p className="text-xs text-gray-400">קריאה לילדים</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navigation.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setCurrentPage(item.id);
                if (typeof globalThis.window !== 'undefined' && globalThis.window.innerWidth < 768) setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                currentPage === item.id
                  ? 'bg-teal-500 text-white shadow-lg'
                  : 'text-gray-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <span className="text-2xl">{item.icon}</span>
              {sidebarOpen && (
                <div className="text-right flex-1">
                  <div className="font-semibold">{item.name}</div>
                  <div className="text-xs opacity-75">{item.nameEn}</div>
                </div>
              )}
            </button>
          ))}
        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="font-bold">{teacher?.name?.charAt(0) || 'T'}</span>
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{teacher?.name || 'מורה'}</p>
                <p className="text-xs text-gray-400 truncate">{teacher?.email}</p>
              </div>
            )}
          </div>
          <button
            onClick={handleSignOut}
            className="w-full mt-3 flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition-colors"
          >
            <span>🚪</span>
            {sidebarOpen && <span>התנתק / Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm px-4 md:px-6 py-3 md:py-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 md:gap-4 min-w-0">
            <button
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors shrink-0"
              aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h2 className="text-lg md:text-2xl font-bold text-gray-800 truncate">
              {navigation.find(n => n.id === currentPage)?.nameEn}
            </h2>
          </div>
          <div className="text-xs md:text-sm text-gray-500 shrink-0 hidden sm:block">
            {new Date().toLocaleDateString('he-IL', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-4 md:p-6">
          {currentPage === 'dashboard' && (
            <DashboardHome
              classes={classes}
              stats={stats}
              onRefresh={loadDashboardData}
            />
          )}

          {currentPage === 'classes' && (
            <ClassesPage classes={classes} onRefresh={loadDashboardData} />
          )}

          {currentPage === 'students' && (
            <StudentsPage classes={classes} onRefresh={loadDashboardData} />
          )}

          {currentPage === 'missions' && (
            <MissionsPage classes={classes} onRefresh={loadDashboardData} />
          )}

          {currentPage === 'reports' && (
            <ReportsPage classes={classes} />
          )}

          {currentPage === 'settings' && (
            <SettingsPage teacher={teacher!} onRefresh={loadDashboardData} />
          )}
        </div>
      </main>
    </div>
  );
}

// Dashboard Home Component
interface DashboardHomeProps {
  classes: ClassWithAnalytics[];
  stats: TeacherStats | null;
  onRefresh: () => void;
}

function DashboardHome({ classes, stats, onRefresh }: DashboardHomeProps) {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-slate-700 to-slate-800 rounded-2xl p-8 text-white shadow-xl">
        <h1 className="text-3xl font-bold mb-2">שלום! נתראה שוב 👋</h1>
        <p className="text-gray-300 text-lg">Welcome back! Here's your overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="סה״כ תלמידים"
          titleEn="Total Students"
          value={stats?.totalStudents || 0}
          icon="👥"
          color="blue"
        />
        <StatCard
          title="כיתות פעילות"
          titleEn="Active Classes"
          value={classes.length}
          icon="🏫"
          color="green"
        />
        <StatCard
          title="משימות שהושלמו"
          titleEn="Missions Completed"
          value={stats?.totalMissionsCompleted || 0}
          icon="✅"
          color="purple"
        />
        <StatCard
          title="רמת קריאה ממוצעת"
          titleEn="Avg. Reading Level"
          value={stats?.averageReadingLevel?.toFixed(1) || '1.0'}
          icon="📊"
          color="orange"
        />
      </div>

      {/* Classes Overview */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800">הכיתות שלי / My Classes</h3>
          <button
            onClick={onRefresh}
            className="px-4 py-2 bg-teal-50 text-teal-700 rounded-lg hover:bg-teal-100 transition-colors"
          >
            רענן / Refresh
          </button>
        </div>

        {classes.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <p className="text-gray-500 text-lg mb-4">אין עדיין כיתות</p>
            <p className="text-gray-400 mb-6">No classes yet. Create your first class!</p>
            <button className="px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors">
              + צור כיתה חדשה / Create New Class
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {classes.map((cls) => (
              <ClassCard key={cls.id} classData={cls} />
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-6">פעולות מהירות / Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickActionButton
            icon="➕"
            label="כיתה חדשה"
            labelEn="New Class"
            color="blue"
          />
          <QuickActionButton
            icon="👤"
            label="הוסף תלמיד"
            labelEn="Add Student"
            color="green"
          />
          <QuickActionButton
            icon="🎯"
            label="משימה חדשה"
            labelEn="New Mission"
            color="purple"
          />
          <QuickActionButton
            icon="📊"
            label="דוחות"
            labelEn="Reports"
            color="orange"
          />
        </div>
      </div>
    </div>
  );
}

// Stat Card Component
interface StatCardProps {
  title: string;
  titleEn: string;
  value: number | string;
  icon: string;
  color: 'blue' | 'green' | 'purple' | 'orange';
}

function StatCard({ title, titleEn, value, icon, color }: StatCardProps) {
  const colorClasses: Record<string, string> = {
    blue: 'from-cyan-500 to-cyan-600',
    green: 'from-teal-500 to-teal-600',
    purple: 'from-violet-500 to-violet-600',
    orange: 'from-amber-500 to-amber-600'
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} rounded-xl p-6 text-white shadow-lg`}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-4xl">{icon}</span>
        <span className="text-3xl font-bold">{value}</span>
      </div>
      <p className="font-semibold">{title}</p>
      <p className="text-sm opacity-75">{titleEn}</p>
    </div>
  );
}

// Class Card Component
interface ClassCardProps {
  classData: ClassWithAnalytics;
}

function ClassCard({ classData }: ClassCardProps) {
  return (
    <div className="border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-shadow bg-gradient-to-br from-white to-gray-50">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h4 className="font-bold text-lg text-gray-800">{classData.name}</h4>
          <p className="text-sm text-gray-500">{classData.nameEn}</p>
        </div>
        <span className="text-3xl">🏫</span>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">תלמידים / Students:</span>
          <span className="font-semibold">{classData.analytics?.totalStudents || classData.studentCount || 0}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">פעילים / Active:</span>
          <span className="font-semibold text-green-600">
            {classData.analytics?.activeStudents || 0}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">רמה ממוצעת / Avg Level:</span>
          <span className="font-semibold">
            {classData.analytics?.avgReadingLevel?.toFixed(1) || '1.0'}
          </span>
        </div>
      </div>
    </div>
  );
}

// Quick Action Button Component
interface QuickActionButtonProps {
  icon: string;
  label: string;
  labelEn: string;
  color: 'blue' | 'green' | 'purple' | 'orange';
}

function QuickActionButton({ icon, label, labelEn, color }: QuickActionButtonProps) {
  const colorClasses: Record<string, string> = {
    blue: 'hover:bg-cyan-50 hover:border-cyan-400',
    green: 'hover:bg-teal-50 hover:border-teal-400',
    purple: 'hover:bg-violet-50 hover:border-violet-400',
    orange: 'hover:bg-amber-50 hover:border-amber-400'
  };

  return (
    <button
      className={`border-2 border-gray-200 rounded-xl p-4 transition-all ${colorClasses[color]}`}
    >
      <span className="text-3xl block mb-2">{icon}</span>
      <p className="font-semibold text-gray-800 text-sm">{label}</p>
      <p className="text-xs text-gray-500">{labelEn}</p>
    </button>
  );
}

export default TeacherDashboard;
