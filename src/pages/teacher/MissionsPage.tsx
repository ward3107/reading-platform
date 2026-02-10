import { useState, type FormEvent } from 'react';
import type { Class } from '../../types';

interface MissionsPageProps {
  classes: Class[];
  onRefresh: () => void;
}

interface CreateMissionFormData {
  title: string;
  titleEn: string;
  type: string;
  targetStories: number;
  points: number;
  difficulty: string;
}

interface Mission {
  id: string;
  title: string;
  titleEn: string;
  type: string;
  targetStories: number;
  points: number;
  status: string;
  assignedTo: number;
  completedBy: number;
}

function MissionsPage({ classes, onRefresh }: MissionsPageProps) {
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || '');
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);

  const selectedClass = classes.find(c => c.id === selectedClassId);

  // Mock missions data - would come from Firestore
  const missions: Mission[] = [
    {
      id: 'mission_1',
      title: 'משימת קריאה יומית',
      titleEn: 'Daily Reading Mission',
      type: 'reading',
      targetStories: 3,
      points: 100,
      status: 'active',
      assignedTo: 25,
      completedBy: 18
    },
    {
      id: 'mission_2',
      title: 'אתגר אוצר מילים',
      titleEn: 'Vocabulary Challenge',
      type: 'vocabulary',
      targetStories: 5,
      points: 150,
      status: 'active',
      assignedTo: 25,
      completedBy: 12
    },
    {
      id: 'mission_3',
      title: 'משימת הבנת הנקרא',
      titleEn: 'Comprehension Mission',
      type: 'comprehension',
      targetStories: 3,
      points: 120,
      status: 'draft',
      assignedTo: 0,
      completedBy: 0
    }
  ];

  const missionTypes = [
    { id: 'reading', name: 'קריאה', nameEn: 'Reading', icon: '📖', color: 'blue' },
    { id: 'vocabulary', name: 'אוצר מילים', nameEn: 'Vocabulary', icon: '📚', color: 'green' },
    { id: 'comprehension', name: 'הבנת הנקרא', nameEn: 'Comprehension', icon: '🧠', color: 'purple' },
    { id: 'grammar', name: 'דקדוק', nameEn: 'Grammar', icon: '✏️', color: 'orange' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">ניהול משימות</h2>
          <p className="text-gray-600">Mission Management</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
        >
          <span className="text-xl">🎯</span>
          <span>משימה חדשה / New Mission</span>
        </button>
      </div>

      {/* Class Selector */}
      {classes.length > 0 && (
        <div className="bg-white rounded-xl shadow p-4">
          <label className="block text-gray-700 mb-2 font-medium">
            בחר כיתה / Select Class
          </label>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            {classes.map(cls => (
              <option key={cls.id} value={cls.id}>
                {cls.name} / {cls.nameEn}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Mission Types Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {missionTypes.map(type => (
          <div
            key={type.id}
            className="bg-white rounded-xl shadow p-4 text-center hover:shadow-lg transition-shadow"
          >
            <span className="text-4xl block mb-2">{type.icon}</span>
            <h4 className="font-bold text-gray-800">{type.name}</h4>
            <p className="text-sm text-gray-500">{type.nameEn}</p>
          </div>
        ))}
      </div>

      {/* Active Missions */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-800">
            משימות פעילות / Active Missions
          </h3>
        </div>

        {missions.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">🎯</div>
            <p className="text-gray-500">No active missions</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {missions.map(mission => (
              <MissionCard key={mission.id} mission={mission} />
            ))}
          </div>
        )}
      </div>

      {/* Create Mission Modal */}
      {showCreateModal && (
        <CreateMissionModal
          classId={selectedClassId}
          onClose={() => setShowCreateModal(false)}
          onCreated={() => {
            setShowCreateModal(false);
            onRefresh();
          }}
        />
      )}
    </div>
  );
}

// Mission Card Component
interface MissionCardProps {
  mission: Mission;
}

function MissionCard({ mission }: MissionCardProps) {
  const completionRate = mission.assignedTo > 0
    ? Math.round((mission.completedBy / mission.assignedTo) * 100)
    : 0;

  return (
    <div className="p-5 hover:bg-gray-50 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h4 className="font-bold text-lg text-gray-800">{mission.title}</h4>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              mission.status === 'active'
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-600'
            }`}>
              {mission.status === 'active' ? 'פעיל / Active' : 'טיוטה / Draft'}
            </span>
          </div>
          <p className="text-sm text-gray-500">{mission.titleEn}</p>
        </div>
        <span className="text-2xl">🎯</span>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-3">
        <div>
          <p className="text-sm text-gray-500">סוג / Type</p>
          <p className="font-semibold">{mission.type}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">יעד / Target</p>
          <p className="font-semibold">{mission.targetStories} סיפורים</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">נקודות / Points</p>
          <p className="font-semibold text-yellow-600">⭐ {mission.points}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-2">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600">
            השלמה / Progress: {mission.completedBy}/{mission.assignedTo}
          </span>
          <span className="font-semibold">{completionRate}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all"
            style={{ width: `${completionRate}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// Create Mission Modal Component
interface CreateMissionModalProps {
  classId: string;
  onClose: () => void;
  onCreated: () => void;
}

function CreateMissionModal({ classId, onClose, onCreated }: CreateMissionModalProps) {
  const [formData, setFormData] = useState<CreateMissionFormData>({
    title: '',
    titleEn: '',
    type: 'reading',
    targetStories: 3,
    points: 100,
    difficulty: 'medium'
  });

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Would call createMission function here
    onCreated();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800">
            משימה חדשה / New Mission
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-2 font-medium">
              שם המשימה (עברית) / Mission Name (Hebrew)
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="משימת קריאה"
              dir="rtl"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2 font-medium">
              שם המשימה (אנגלית) / Mission Name (English)
            </label>
            <input
              type="text"
              value={formData.titleEn}
              onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Reading Mission"
              dir="ltr"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 mb-2 font-medium">
                סוג / Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="reading">קריאה / Reading</option>
                <option value="vocabulary">אוצר מילים / Vocabulary</option>
                <option value="comprehension">הבנת הנקרא / Comprehension</option>
                <option value="grammar">דקדוק / Grammar</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 mb-2 font-medium">
                קושי / Difficulty
              </label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="easy">קל / Easy</option>
                <option value="medium">בינוני / Medium</option>
                <option value="hard">קשה / Hard</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 mb-2 font-medium">
                כמות סיפורים / Stories
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={formData.targetStories}
                onChange={(e) => setFormData({ ...formData, targetStories: parseInt(e.target.value) })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2 font-medium">
                נקודות / Points
              </label>
              <input
                type="number"
                min="10"
                max="1000"
                step="10"
                value={formData.points}
                onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              ביטול / Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              צור משימה / Create Mission
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default MissionsPage;
