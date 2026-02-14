// Progress Visualization Components
// Simple chart components using SVG (no external dependencies)

import type { StudentSkills } from '../../types';

// ============================================
// WEEKLY ACTIVITY CHART
// ============================================

interface WeeklyActivityChartProps {
  data: Array<{ day: string; value: number }>;
  title?: string;
  titleHe?: string;
}

export function WeeklyActivityChart({ data, title = 'Weekly Activity', titleHe = 'פעילות שבועית' }: WeeklyActivityChartProps) {
  const maxValue = Math.max(...data.map(d => d.value), 1);
  const barWidth = 100 / data.length;

  return (
    <div className="bg-white rounded-xl shadow p-5">
      <h3 className="font-bold text-gray-800 mb-4">{title}</h3>
      <p className="text-sm text-gray-500 mb-4">{titleHe}</p>

      <div className="flex items-end justify-between h-32 gap-2">
        {data.map((item, idx) => {
          const height = (item.value / maxValue) * 100;
          return (
            <div key={idx} className="flex-1 flex flex-col items-center">
              <div className="w-full bg-gray-100 rounded-t-lg relative" style={{ height: '100px' }}>
                <div
                  className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-teal-500 to-cyan-400 rounded-t-lg transition-all duration-500"
                  style={{ height: `${height}%` }}
                />
              </div>
              <span className="text-xs text-gray-500 mt-2">{item.day}</span>
              <span className="text-sm font-bold text-gray-700">{item.value}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================
// SKILLS RADAR CHART
// ============================================

interface SkillsRadarChartProps {
  skills: StudentSkills;
}

export function SkillsRadarChart({ skills }: SkillsRadarChartProps) {
  const skillData = [
    { name: 'Fluency', value: skills.fluencyLevel || 10 },
    { name: 'Comprehension', value: skills.comprehensionLevel || 10 },
    { name: 'Vocabulary', value: skills.vocabularyLevel || 10 },
    { name: 'Grammar', value: skills.grammarLevel || 10 }
  ];

  const centerX = 100;
  const centerY = 100;
  const radius = 70;

  // Calculate points for the radar
  const angleStep = (2 * Math.PI) / skillData.length;
  const points = skillData.map((skill, idx) => {
    const angle = idx * angleStep - Math.PI / 2;
    const value = (skill.value / 100) * radius;
    return {
      x: centerX + value * Math.cos(angle),
      y: centerY + value * Math.sin(angle)
    };
  });

  const pathData = points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';

  return (
    <div className="bg-white rounded-xl shadow p-5">
      <h3 className="font-bold text-gray-800 mb-2">Skills Overview</h3>
      <p className="text-sm text-gray-500 mb-4">סקירת כישורים</p>

      <div className="flex justify-center">
        <svg width="200" height="200" viewBox="0 0 200 200">
          {/* Background circles */}
          {[20, 40, 60, 80, 100].map((pct) => (
            <circle
              key={pct}
              cx={centerX}
              cy={centerY}
              r={(pct / 100) * radius}
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="1"
            />
          ))}

          {/* Axis lines */}
          {skillData.map((_, idx) => {
            const angle = idx * angleStep - Math.PI / 2;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            return (
              <line
                key={idx}
                x1={centerX}
                y1={centerY}
                x2={x}
                y2={y}
                stroke="#e5e7eb"
                strokeWidth="1"
              />
            );
          })}

          {/* Skill area */}
          <path
            d={pathData}
            fill="rgba(20, 184, 166, 0.3)"
            stroke="#14b8a6"
            strokeWidth="2"
          />

          {/* Skill points */}
          {points.map((p, idx) => (
            <circle
              key={idx}
              cx={p.x}
              cy={p.y}
              r="4"
              fill="#14b8a6"
            />
          ))}
        </svg>
      </div>

      {/* Labels */}
      <div className="grid grid-cols-2 gap-2 mt-4">
        {skillData.map((skill) => (
          <div key={skill.name} className="flex items-center justify-between px-2">
            <span className="text-sm text-gray-600">{skill.name}</span>
            <span className="text-sm font-bold text-teal-600">{skill.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// PROGRESS LINE CHART
// ============================================

interface ProgressLineChartProps {
  data: Array<{ label: string; value: number }>;
  title?: string;
  titleHe?: string;
  color?: string;
}

export function ProgressLineChart({
  data,
  title = 'Progress Over Time',
  titleHe = 'התקדמות לאורך זמן',
  color = '#14b8a6'
}: ProgressLineChartProps) {
  const maxValue = Math.max(...data.map(d => d.value), 1);
  const minValue = Math.min(...data.map(d => d.value), 0);
  const range = maxValue - minValue || 1;

  const width = 300;
  const height = 150;
  const padding = 30;

  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const points = data.map((d, idx) => ({
    x: padding + (idx / (data.length - 1 || 1)) * chartWidth,
    y: padding + chartHeight - ((d.value - minValue) / range) * chartHeight
  }));

  const pathData = points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  const areaPath = pathData + ` L ${points[points.length - 1]?.x || padding} ${height - padding} L ${padding} ${height - padding} Z`;

  return (
    <div className="bg-white rounded-xl shadow p-5">
      <h3 className="font-bold text-gray-800 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 mb-4">{titleHe}</p>

      <div className="flex justify-center overflow-x-auto">
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((pct) => {
            const y = padding + chartHeight - (pct / 100) * chartHeight;
            return (
              <g key={pct}>
                <line
                  x1={padding}
                  y1={y}
                  x2={width - padding}
                  y2={y}
                  stroke="#e5e7eb"
                  strokeWidth="1"
                />
                <text
                  x={padding - 5}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="10"
                  fill="#9ca3af"
                >
                  {Math.round(minValue + (pct / 100) * range)}
                </text>
              </g>
            );
          })}

          {/* Area fill */}
          <path
            d={areaPath}
            fill={`${color}20`}
          />

          {/* Line */}
          <path
            d={pathData}
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Points */}
          {points.map((p, idx) => (
            <circle
              key={idx}
              cx={p.x}
              cy={p.y}
              r="4"
              fill="white"
              stroke={color}
              strokeWidth="2"
            />
          ))}

          {/* Labels */}
          {data.map((d, idx) => {
            const x = padding + (idx / (data.length - 1 || 1)) * chartWidth;
            return (
              <text
                key={idx}
                x={x}
                y={height - 10}
                textAnchor="middle"
                fontSize="10"
                fill="#9ca3af"
              >
                {d.label}
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

// ============================================
// CIRCULAR PROGRESS
// ============================================

interface CircularProgressProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;
  labelHe?: string;
}

export function CircularProgress({
  value,
  max = 100,
  size = 120,
  strokeWidth = 10,
  color = '#14b8a6',
  label,
  labelHe
}: CircularProgressProps) {
  const percentage = Math.min(100, (value / max) * 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.5s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-gray-800">{Math.round(percentage)}%</span>
        </div>
      </div>
      {label && (
        <div className="mt-2 text-center">
          <p className="text-sm font-medium text-gray-700">{label}</p>
          {labelHe && <p className="text-xs text-gray-500">{labelHe}</p>}
        </div>
      )}
    </div>
  );
}

// ============================================
// STATS SUMMARY CARDS
// ============================================

interface StatCardProps {
  icon: string;
  label: string;
  labelHe: string;
  value: number | string;
  change?: number;
  color?: string;
}

export function StatCard({ icon, label, labelHe, value, change, color = 'teal' }: StatCardProps) {
  const colorClasses: Record<string, string> = {
    teal: 'from-teal-500 to-cyan-500',
    blue: 'from-blue-500 to-indigo-500',
    purple: 'from-purple-500 to-pink-500',
    orange: 'from-orange-500 to-red-500',
    green: 'from-green-500 to-emerald-500'
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} rounded-xl p-4 text-white shadow-lg`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
        {change !== undefined && (
          <span className={`text-sm font-medium ${change >= 0 ? 'text-green-200' : 'text-red-200'}`}>
            {change >= 0 ? '+' : ''}{change}%
          </span>
        )}
      </div>
      <p className="text-3xl font-bold">{value}</p>
      <p className="text-sm opacity-90">{label}</p>
      <p className="text-xs opacity-75">{labelHe}</p>
    </div>
  );
}

// ============================================
// PROGRESS PAGE COMPONENT
// ============================================

interface ProgressVisualizationProps {
  student: {
    storiesRead: number;
    totalPoints: number;
    currentLevel: number;
    missionsCompleted: number;
  };
  skills: StudentSkills;
  streakDays: number;
}

export function ProgressVisualization({ student, skills, streakDays }: ProgressVisualizationProps) {
  // Demo data for charts
  const weeklyActivity = [
    { day: 'Sun', value: 2 },
    { day: 'Mon', value: 3 },
    { day: 'Tue', value: 1 },
    { day: 'Wed', value: 4 },
    { day: 'Thu', value: 2 },
    { day: 'Fri', value: 3 },
    { day: 'Sat', value: 1 }
  ];

  const pointsProgress = [
    { label: 'W1', value: 10 },
    { label: 'W2', value: 25 },
    { label: 'W3', value: 45 },
    { label: 'W4', value: 70 }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon="📖"
          label="Stories Read"
          labelHe="סיפורים שנקראו"
          value={student.storiesRead}
          color="teal"
        />
        <StatCard
          icon="⭐"
          label="Total Points"
          labelHe="סה״כ נקודות"
          value={student.totalPoints}
          color="orange"
        />
        <StatCard
          icon="🎯"
          label="Missions"
          labelHe="משימות"
          value={student.missionsCompleted}
          color="purple"
        />
        <StatCard
          icon="🔥"
          label="Day Streak"
          labelHe="רצף ימים"
          value={streakDays}
          color="blue"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WeeklyActivityChart data={weeklyActivity} />
        <SkillsRadarChart skills={skills} />
      </div>

      {/* Progress Chart */}
      <ProgressLineChart
        data={pointsProgress}
        title="Points Progress"
        titleHe="התקדמות נקודות"
      />

      {/* Level Progress */}
      <div className="bg-white rounded-xl shadow p-5">
        <h3 className="font-bold text-gray-800 mb-4">Level Progress / התקדמות רמה</h3>
        <div className="flex items-center justify-around">
          <CircularProgress
            value={student.totalPoints % 100}
            max={100}
            size={140}
            color="#14b8a6"
            label="To Next Level"
            labelHe="לרמה הבאה"
          />
          <CircularProgress
            value={skills.fluencyLevel || 10}
            size={140}
            color="#6366f1"
            label="Fluency"
            labelHe="שטף"
          />
          <CircularProgress
            value={skills.comprehensionLevel || 10}
            size={140}
            color="#ec4899"
            label="Comprehension"
            labelHe="הבנה"
          />
        </div>
      </div>
    </div>
  );
}
