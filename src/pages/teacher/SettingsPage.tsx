import { useState } from 'react';
import type { Teacher } from '../../types';

interface SettingsPageProps {
  teacher: Teacher;
  onRefresh: () => void;
}

function SettingsPage({ teacher, onRefresh }: SettingsPageProps) {
  const [activeTab, setActiveTab] = useState<string>('profile');
  const [saving, setSaving] = useState<boolean>(false);

  const handleSave = async () => {
    setSaving(true);
    // Simulate save
    setTimeout(() => {
      setSaving(false);
      onRefresh();
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">הגדרות</h2>
        <p className="text-gray-600">Settings</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow">
        <div className="border-b border-gray-200">
          <nav className="flex">
            {[
              { id: 'profile', label: 'פרופיל', labelEn: 'Profile', icon: '👤' },
              { id: 'notifications', label: 'התראות', labelEn: 'Notifications', icon: '🔔' },
              { id: 'missions', label: 'הגדרות משימות', labelEn: 'Mission Settings', icon: '🎯' },
              { id: 'account', label: 'חשבון', labelEn: 'Account', icon: '⚙️' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                <span className="text-sm text-gray-400">/ {tab.labelEn}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'profile' && <ProfileSettings teacher={teacher} onSave={handleSave} saving={saving} />}
          {activeTab === 'notifications' && <NotificationSettings onSave={handleSave} saving={saving} />}
          {activeTab === 'missions' && <MissionSettings onSave={handleSave} saving={saving} />}
          {activeTab === 'account' && <AccountSettings teacher={teacher} onSave={handleSave} saving={saving} />}
        </div>
      </div>
    </div>
  );
}

// Profile Settings Component
interface ProfileSettingsProps {
  teacher: Teacher;
  onSave: () => void;
  saving: boolean;
}

interface ProfileFormData {
  name: string;
  email: string;
  school: string;
  phone: string;
}

function ProfileSettings({ teacher, onSave, saving }: ProfileSettingsProps) {
  const [formData, setFormData] = useState<ProfileFormData>({
    name: teacher?.name || '',
    email: teacher?.email || '',
    school: teacher?.school || '',
    phone: (teacher as any)?.phone || ''
  });

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
          {formData.name.charAt(0) || 'T'}
        </div>
        <div>
          <button className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium">
            שנה תמונה / Change Photo
          </button>
          <p className="text-xs text-gray-500 mt-1">JPG, PNG. מקסימום 2MB</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-700 mb-2 font-medium">שם מלא / Full Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-2 font-medium">אימייל / Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-2 font-medium">בית ספר / School</label>
          <input
            type="text"
            value={formData.school}
            onChange={(e) => setFormData({ ...formData, school: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-2 font-medium">טלפון / Phone</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          onClick={onSave}
          disabled={saving}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
        >
          {saving ? 'שומר... / Saving...' : 'שמור שינויים / Save Changes'}
        </button>
      </div>
    </div>
  );
}

// Notification Settings Component
interface NotificationSettingsProps {
  onSave: () => void;
  saving: boolean;
}

interface NotificationSettingsData {
  emailNotifications: boolean;
  missionCompletion: boolean;
  weeklyReport: boolean;
  studentProgress: boolean;
  newStudent: boolean;
}

function NotificationSettings({ onSave, saving }: NotificationSettingsProps) {
  const [settings, setSettings] = useState<NotificationSettingsData>({
    emailNotifications: true,
    missionCompletion: true,
    weeklyReport: true,
    studentProgress: false,
    newStudent: true
  });

  const toggleSetting = (key: keyof NotificationSettingsData) => {
    setSettings({ ...settings, [key]: !settings[key] });
  };

  return (
    <div className="max-w-2xl space-y-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        התראות דוא״ל / Email Notifications
      </h3>

      {[
        { key: 'emailNotifications' as const, label: 'התראות דוא״ל', labelEn: 'Email Notifications' },
        { key: 'missionCompletion' as const, label: 'השלמת משימות', labelEn: 'Mission Completion' },
        { key: 'weeklyReport' as const, label: 'דוח שבועי', labelEn: 'Weekly Report' },
        { key: 'studentProgress' as const, label: 'התקדמות תלמידים', labelEn: 'Student Progress' },
        { key: 'newStudent' as const, label: 'תלמידים חדשים', labelEn: 'New Students' }
      ].map(setting => (
        <div
          key={setting.key}
          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
        >
          <div>
            <p className="font-medium text-gray-800">{setting.label}</p>
            <p className="text-sm text-gray-500">{setting.labelEn}</p>
          </div>
          <button
            onClick={() => toggleSetting(setting.key)}
            className={`relative w-14 h-8 rounded-full transition-colors ${
              settings[setting.key] ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform ${
                settings[setting.key] ? 'left-7' : 'left-1'
              }`}
            />
          </button>
        </div>
      ))}

      <div className="flex justify-end pt-4">
        <button
          onClick={onSave}
          disabled={saving}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
        >
          {saving ? 'שומר... / Saving...' : 'שמור שינויים / Save Changes'}
        </button>
      </div>
    </div>
  );
}

// Mission Settings Component
interface MissionSettingsProps {
  onSave: () => void;
  saving: boolean;
}

interface MissionSettingsData {
  defaultPoints: number;
  defaultStories: number;
  autoAssign: boolean;
  difficultyLevel: string;
  missionDuration: number;
}

function MissionSettings({ onSave, saving }: MissionSettingsProps) {
  const [settings, setSettings] = useState<MissionSettingsData>({
    defaultPoints: 100,
    defaultStories: 3,
    autoAssign: false,
    difficultyLevel: 'medium',
    missionDuration: 7
  });

  return (
    <div className="max-w-2xl space-y-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        הגדרות משימות ברירת מחדל / Default Mission Settings
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-700 mb-2 font-medium">נקודות ברירת מחדל / Default Points</label>
          <input
            type="number"
            value={settings.defaultPoints}
            onChange={(e) => setSettings({ ...settings, defaultPoints: parseInt(e.target.value) })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-2 font-medium">כמות סיפורים / Story Count</label>
          <input
            type="number"
            value={settings.defaultStories}
            onChange={(e) => setSettings({ ...settings, defaultStories: parseInt(e.target.value) })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-2 font-medium">רמת קושי / Difficulty</label>
          <select
            value={settings.difficultyLevel}
            onChange={(e) => setSettings({ ...settings, difficultyLevel: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="easy">קל / Easy</option>
            <option value="medium">בינוני / Medium</option>
            <option value="hard">קשה / Hard</option>
          </select>
        </div>

        <div>
          <label className="block text-gray-700 mb-2 font-medium">משך המשימה (ימים) / Duration</label>
          <input
            type="number"
            value={settings.missionDuration}
            onChange={(e) => setSettings({ ...settings, missionDuration: parseInt(e.target.value) })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div>
          <p className="font-medium text-gray-800">השמה אוטומטית / Auto Assign</p>
          <p className="text-sm text-gray-500">הקצה משימות אוטומטית לתלמידים חדשים</p>
        </div>
        <button
          onClick={() => setSettings({ ...settings, autoAssign: !settings.autoAssign })}
          className={`relative w-14 h-8 rounded-full transition-colors ${
            settings.autoAssign ? 'bg-blue-600' : 'bg-gray-300'
          }`}
        >
          <span
            className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform ${
              settings.autoAssign ? 'left-7' : 'left-1'
            }`}
          />
        </button>
      </div>

      <div className="flex justify-end pt-4">
        <button
          onClick={onSave}
          disabled={saving}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
        >
          {saving ? 'שומר... / Saving...' : 'שמור שינויים / Save Changes'}
        </button>
      </div>
    </div>
  );
}

// Account Settings Component
interface AccountSettingsProps {
  teacher: Teacher;
  onSave: () => void;
  saving: boolean;
}

function AccountSettings({ teacher, onSave, saving }: AccountSettingsProps) {
  return (
    <div className="max-w-2xl space-y-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        הגדרות חשבון / Account Settings
      </h3>

      <div className="space-y-4">
        <button className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          <div>
            <p className="font-medium text-gray-800">שנה סיסמה / Change Password</p>
            <p className="text-sm text-gray-500">עדכן את סיסמת החשבון שלך</p>
          </div>
          <span className="text-gray-400">→</span>
        </button>

        <button className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          <div>
            <p className="font-medium text-gray-800">אימות דו-שלבי / Two-Factor Auth</p>
            <p className="text-sm text-gray-500">הוסף שכבת אבטחה נוספת</p>
          </div>
          <span className="text-gray-400">→</span>
        </button>

        <button className="w-full flex items-center justify-between p-4 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
          <div>
            <p className="font-medium text-red-600">מחק חשבון / Delete Account</p>
            <p className="text-sm text-red-400">פעולה זו אינה הפיכה</p>
          </div>
          <span className="text-red-400">→</span>
        </button>
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <p className="text-sm text-gray-600">
          חשבון נוצר בתאריך: / Account created:
        </p>
        <p className="text-xs text-gray-500">
          {(teacher as any)?.createdAt?.toDate?.()?.toLocaleDateString('he-IL') || 'N/A'}
        </p>
      </div>
    </div>
  );
}

export default SettingsPage;
