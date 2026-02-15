import { useState, useEffect, type FormEvent } from 'react';
import { getStudentsByClass, createStudent } from '../../services/firestore';
import type { Student, Class } from '../../types';

interface StudentsPageProps {
  classes: Class[];
  onRefresh: () => void;
}

interface AddStudentFormData {
  name: string;
  studentId: string;
  classId: string;
  isActive: boolean;
}

function StudentsPage({ classes }: StudentsPageProps) {
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || '');
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('name');

  useEffect(() => {
    if (selectedClassId) {
      loadStudents();
    }
  }, [selectedClassId]);

  const loadStudents = async () => {
    setLoading(true);
    try {
      const studentsData = await getStudentsByClass(selectedClassId);
      setStudents(studentsData);
    } catch (error) {
      console.error('Error loading students:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectedClass = classes.find(c => c.id === selectedClassId);

  // Filter and sort students
  const filteredStudents = students
    .filter(s =>
      s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.studentId?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
      if (sortBy === 'points') return (b.totalPoints || 0) - (a.totalPoints || 0);
      if (sortBy === 'level') return (b.currentLevel || 0) - (a.currentLevel || 0);
      if (sortBy === 'stories') return (b.storiesRead || 0) - (a.storiesRead || 0);
      return 0;
    });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">ניהול תלמידים</h2>
          <p className="text-gray-600">Student Management</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
        >
          <span className="text-xl">👤</span>
          <span>הוסף תלמיד / Add Student</span>
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
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            {classes.map(cls => (
              <option key={cls.id} value={cls.id}>
                {cls.name} / {cls.nameEn}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Filters and Search */}
      {selectedClass && (
        <div className="bg-white rounded-xl shadow p-4 flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="חיפוש תלמיד / Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <div className="md:w-48">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="name">לפי שם / By Name</option>
              <option value="points">לפי נקודות / By Points</option>
              <option value="level">לפי רמה / By Level</option>
              <option value="stories">לפי סיפורים / By Stories</option>
            </select>
          </div>
        </div>
      )}

      {/* Students List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-green-600"></div>
        </div>
      ) : !selectedClass ? (
        <div className="bg-white rounded-xl shadow p-12 text-center">
          <div className="text-6xl mb-4">👥</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">אין כיתות</h3>
          <p className="text-gray-500">Create a class first to manage students</p>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-12 text-center">
          <div className="text-6xl mb-4">👤</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">אין תלמידים</h3>
          <p className="text-gray-500 mb-6">No students in this class yet</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            הוסף תלמיד ראשון / Add First Student
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                  תלמיד / Student
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                  רמה / Level
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                  נקודות / Points
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                  סיפורים / Stories
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                  משימות / Missions
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                  סטטוס / Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredStudents.map((student) => (
                <StudentRow key={student.id} student={student} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Student Modal */}
      {showAddModal && (
        <AddStudentModal
          classId={selectedClassId}
          onClose={() => setShowAddModal(false)}
          onAdded={loadStudents}
        />
      )}
    </div>
  );
}

// Student Row Component
interface StudentRowProps {
  student: Student;
}

function StudentRow({ student }: StudentRowProps) {
  const lastActiveTime = student.lastActiveAt && typeof student.lastActiveAt === 'object' && 'toDate' in student.lastActiveAt
    ? student.lastActiveAt.toDate().getTime()
    : Date.now();
  const daysSinceActive = Math.floor((Date.now() - lastActiveTime) / (1000 * 60 * 60 * 24));
  const isActive = daysSinceActive <= 7;

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-bold">
            {student.name?.charAt(0) || '?'}
          </div>
          <div>
            <p className="font-semibold text-gray-800">{student.name || 'תלמיד'}</p>
            <p className="text-sm text-gray-500">ID: {student.studentId || '-'}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 text-center">
        <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 font-semibold">
          שָׁׁמֶשׁ {student.currentLevel || 1}
        </span>
      </td>
      <td className="px-6 py-4 text-center">
        <span className="font-bold text-lg text-yellow-600">⭐ {student.totalPoints || 0}</span>
      </td>
      <td className="px-6 py-4 text-center">
        <span className="font-semibold text-gray-700">{student.storiesRead || 0}</span>
      </td>
      <td className="px-6 py-4 text-center">
        <span className="font-semibold text-gray-700">{student.missionsCompleted || 0}</span>
      </td>
      <td className="px-6 py-4 text-center">
        {isActive ? (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            פעיל / Active
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-sm font-medium">
            <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
            לא פעיל ({daysSinceActive} יום)
          </span>
        )}
      </td>
    </tr>
  );
}

// Add Student Modal Component
interface AddStudentModalProps {
  classId: string;
  onClose: () => void;
  onAdded: () => void;
}

function AddStudentModal({ classId, onClose, onAdded }: AddStudentModalProps) {
  const [formData, setFormData] = useState<AddStudentFormData>({
    name: '',
    studentId: '',
    classId: classId,
    isActive: true
  });
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createStudent(formData);
      onAdded();
      onClose();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      alert('שגיאה ביצירת תלמיד: ' + message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800">
            הוסף תלמיד חדש / Add New Student
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
              שם מלא / Full Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="ישראל ישראלי"
              dir="rtl"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="12345"
              dir="ltr"
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
              disabled={loading}
              className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
            >
              {loading ? 'יוצר... / Creating...' : 'צור / Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default StudentsPage;
