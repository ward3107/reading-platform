import { useState, type FormEvent } from 'react';
import { createClass, updateClass, deleteClass } from '../../services/firestore';
import type { Class } from '../../types';

interface ClassesPageProps {
  classes: Class[];
  onRefresh: () => void;
}

interface ClassFormData {
  name: string;
  nameEn: string;
  grade: string;
  description: string;
}

function ClassesPage({ classes, onRefresh }: ClassesPageProps) {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [formData, setFormData] = useState<ClassFormData>({
    name: '',
    nameEn: '',
    grade: '',
    description: ''
  });

  const openCreateModal = () => {
    setEditingClass(null);
    setFormData({ name: '', nameEn: '', grade: '', description: '' });
    setShowModal(true);
  };

  const openEditModal = (cls: Class) => {
    setEditingClass(cls);
    setFormData({
      name: cls.name,
      nameEn: cls.nameEn || '',
      grade: cls.grade || '',
      description: (cls as any).description || ''
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingClass(null);
    setFormData({ name: '', nameEn: '', grade: '', description: '' });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Implementation would call createClass or updateClass
    // For now, just close modal
    closeModal();
    onRefresh();
  };

  const handleDeleteClass = async (classId: string) => {
    if (confirm('האם למחוק את הכיתה? / Delete this class?')) {
      await deleteClass(classId);
      onRefresh();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">ניהול כיתות</h2>
          <p className="text-gray-600">Class Management</p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <span className="text-xl">➕</span>
          <span>כיתה חדשה / New Class</span>
        </button>
      </div>

      {/* Classes Grid */}
      {classes.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-12 text-center">
          <div className="text-6xl mb-4">🏫</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">אין כיתות עדיין</h3>
          <p className="text-gray-500 mb-6">No classes created yet</p>
          <button
            onClick={openCreateModal}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            צור כיתה ראשונה / Create First Class
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((cls) => (
            <ClassCard
              key={cls.id}
              classData={cls}
              onEdit={() => openEditModal(cls)}
              onDelete={() => handleDeleteClass(cls.id)}
            />
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <ClassModal
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSubmit}
          onClose={closeModal}
          isEditing={!!editingClass}
        />
      )}
    </div>
  );
}

// Class Card Component
interface ClassCardProps {
  classData: Class;
  onEdit: () => void;
  onDelete: () => void;
}

function ClassCard({ classData, onEdit, onDelete }: ClassCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4">
        <div className="flex items-center justify-between text-white">
          <div>
            <h3 className="font-bold text-xl">{classData.name}</h3>
            <p className="text-sm text-blue-100">{classData.nameEn}</p>
          </div>
          <span className="text-3xl">🏫</span>
        </div>
      </div>

      <div className="p-5 space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-600">כיתה / Grade:</span>
          <span className="font-semibold">{classData.grade || '-'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">תלמידים / Students:</span>
          <span className="font-semibold">{classData.analytics?.totalStudents || classData.studentCount || 0}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">פעילים / Active:</span>
          <span className="font-semibold text-green-600">
            {classData.analytics?.activeStudents || 0}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">רמה ממוצעת / Avg Level:</span>
          <span className="font-semibold">
            {classData.analytics?.avgReadingLevel?.toFixed(1) || '1.0'}
          </span>
        </div>
      </div>

      <div className="border-t border-gray-100 px-5 py-3 flex gap-2">
        <button
          onClick={onEdit}
          className="flex-1 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
        >
          ✏️ ערוך / Edit
        </button>
        <button
          onClick={onDelete}
          className="flex-1 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
        >
          🗑️ מחק / Delete
        </button>
      </div>
    </div>
  );
}

// Class Modal Component
interface ClassModalProps {
  formData: ClassFormData;
  setFormData: (data: ClassFormData) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  onClose: () => void;
  isEditing: boolean;
}

function ClassModal({ formData, setFormData, onSubmit, onClose, isEditing }: ClassModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800">
            {isEditing ? 'ערוך כיתה / Edit Class' : 'כיתה חדשה / New Class'}
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

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-2 font-medium">
              שם הכיתה (עברית) / Class Name (Hebrew)
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="כיתה א׳"
              dir="rtl"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2 font-medium">
              שם הכיתה (אנגלית) / Class Name (English)
            </label>
            <input
              type="text"
              value={formData.nameEn}
              onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Class A"
              dir="ltr"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2 font-medium">
              שכבה / Grade
            </label>
            <select
              value={formData.grade}
              onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">בחר / Select</option>
              <option value="1">כיתה א׳ / Grade 1</option>
              <option value="2">כיתה ב׳ / Grade 2</option>
              <option value="3">כיתה ג׳ / Grade 3</option>
              <option value="4">כיתה ד׳ / Grade 4</option>
              <option value="5">כיתה ה׳ / Grade 5</option>
              <option value="6">כיתה ו׳ / Grade 6</option>
              <option value="7">כיתה ז׳ / Grade 7</option>
              <option value="8">כיתה ח׳ / Grade 8</option>
              <option value="9">כיתה ט׳ / Grade 9</option>
              <option value="10">כיתה י׳ / Grade 10</option>
              <option value="11">כיתה י״א / Grade 11</option>
              <option value="12">כיתה י״ב / Grade 12</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-700 mb-2 font-medium">
              תיאור / Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="הוסף תיאור... / Add description..."
            />
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
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              {isEditing ? 'שמור / Save' : 'צור / Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ClassesPage;
