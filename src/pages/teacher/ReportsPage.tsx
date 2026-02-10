import { useState } from 'react';
import type { Class } from '../../types';

interface ReportsPageProps {
  classes: Class[];
}

function ReportsPage({ classes }: ReportsPageProps) {
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || '');
  const [reportType, setReportType] = useState<string>('overview');
  const [timeRange, setTimeRange] = useState<string>('month');

  const selectedClass = classes.find(c => c.id === selectedClassId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">דוחות ונתונים</h2>
        <p className="text-gray-600">Reports & Analytics</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow p-4 flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-gray-700 mb-2 font-medium">
            כיתה / Class
          </label>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            {classes.map(cls => (
              <option key={cls.id} value={cls.id}>
                {cls.name} / {cls.nameEn}
              </option>
            ))}
          </select>
        </div>

        <div className="md:w-48">
          <label className="block text-gray-700 mb-2 font-medium">
            סוג דוח / Report Type
          </label>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="overview">סקירה כללית / Overview</option>
            <option value="progress">התקדמות / Progress</option>
            <option value="performance">ביצועים / Performance</option>
            <option value="vocabulary">אוצר מילים / Vocabulary</option>
          </select>
        </div>

        <div className="md:w-48">
          <label className="block text-gray-700 mb-2 font-medium">
            טווח זמן / Time Range
          </label>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="week">שבוע / Week</option>
            <option value="month">חודש / Month</option>
            <option value="semester">סמסטר / Semester</option>
            <option value="year">שנה / Year</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="קריאה יומית"
          titleEn="Daily Reading"
          value="78%"
          icon="📖"
          trend="+5%"
          positive={true}
        />
        <StatCard
          title="השלמת משימות"
          titleEn="Mission Completion"
          value="92%"
          icon="✅"
          trend="+12%"
          positive={true}
        />
        <StatCard
          title="רמת קריאה ממוצעת"
          titleEn="Avg. Reading Level"
          value="2.8"
          icon="📊"
          trend="+0.3"
          positive={true}
        />
        <StatCard
          title="משתתפים פעילים"
          titleEn="Active Participants"
          value="23/25"
          icon="👥"
          trend="-2"
          positive={false}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progress Chart Placeholder */}
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            התקדמות כללית / Overall Progress
          </h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center text-gray-400">
              <span className="text-4xl">📈</span>
              <p className="mt-2">Progress Chart</p>
            </div>
          </div>
        </div>

        {/* Performance Chart Placeholder */}
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            התפלגות ביצועים / Performance Distribution
          </h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center text-gray-400">
              <span className="text-4xl">📊</span>
              <p className="mt-2">Performance Chart</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Performers */}
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">
          מצטיינים / Top Performers
        </h3>
        <div className="space-y-3">
          {[
            { name: 'דניאל כהן', points: 1250, stories: 45, rank: 1 },
            { name: 'מאיה לוי', points: 1180, stories: 42, rank: 2 },
            { name: 'יוסי אברהם', points: 1050, stories: 38, rank: 3 }
          ].map(student => (
            <div
              key={student.rank}
              className="flex items-center gap-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200"
            >
              <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center text-white font-bold">
                {student.rank}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-800">{student.name}</p>
                <p className="text-sm text-gray-500">{student.stories} stories</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-yellow-600">⭐ {student.points}</p>
                <p className="text-xs text-gray-500">points</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Export Options */}
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">
          ייצוא דוחות / Export Reports
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <span>📄</span>
            <span className="text-sm font-medium">PDF</span>
          </button>
          <button className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <span>📊</span>
            <span className="text-sm font-medium">Excel</span>
          </button>
          <button className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <span>📑</span>
            <span className="text-sm font-medium">CSV</span>
          </button>
          <button className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <span>🖨️</span>
            <span className="text-sm font-medium">Print</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// Stat Card Component
interface StatCardProps {
  title: string;
  titleEn: string;
  value: string;
  icon: string;
  trend: string;
  positive: boolean;
}

function StatCard({ title, titleEn, value, icon, trend, positive }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl shadow p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-3xl">{icon}</span>
        <span className={`text-sm font-medium px-2 py-1 rounded-full ${
          positive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {trend}
        </span>
      </div>
      <p className="text-2xl font-bold text-gray-800 mb-1">{value}</p>
      <p className="text-sm text-gray-600">{title}</p>
      <p className="text-xs text-gray-400">{titleEn}</p>
    </div>
  );
}

export default ReportsPage;
