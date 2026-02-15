import { useState } from 'react';
import type { Student } from '../../types';
import type { MicroLesson } from '../../data/microLessons';
import {
  grammarLessons,
  vocabularyLessons,
  readingLessons,
  pronunciationLessons,
  getLessonsByLevel
} from '../../data/microLessons';
import { MicroLessonViewer, LessonCard } from '../../components/MicroLessonViewer';

interface MicroLessonsPageProps {
  student: Student;
  onBack: () => void;
}

type FilterType = 'all' | 'grammar' | 'vocabulary' | 'reading' | 'pronunciation';

function MicroLessonsPage({ student, onBack }: MicroLessonsPageProps) {
  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedLesson, setSelectedLesson] = useState<MicroLesson | null>(null);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);

  const handleComplete = () => {
    if (selectedLesson) {
      setCompletedLessons(prev =>
        prev.includes(selectedLesson.id) ? prev : [...prev, selectedLesson.id]
      );
    }
  };

  const getFilteredLessons = (): MicroLesson[] => {
    const studentLevel = student.currentLevel || 1;

    switch (filter) {
      case 'grammar':
        return grammarLessons.filter(l => l.level <= studentLevel);
      case 'vocabulary':
        return vocabularyLessons.filter(l => l.level <= studentLevel);
      case 'reading':
        return readingLessons.filter(l => l.level <= studentLevel);
      case 'pronunciation':
        return pronunciationLessons.filter(l => l.level <= studentLevel);
      default:
        return getLessonsByLevel(studentLevel);
    }
  };

  const lessons = getFilteredLessons();

  // Lesson Viewer
  if (selectedLesson) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => setSelectedLesson(null)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <span>→</span>
          <span>חזור לשיעורים / Back to Lessons</span>
        </button>

        <MicroLessonViewer
          lesson={selectedLesson}
          onComplete={handleComplete}
          onClose={() => setSelectedLesson(null)}
        />
      </div>
    );
  }

  // Lesson List
  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
      >
        <span>→</span>
        <span>חזור / Back</span>
      </button>

      {/* Header */}
      <div className="bg-gradient-to-r from-rose-500 to-pink-600 rounded-3xl p-6 lg:p-8 text-white shadow-xl">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-3xl">
            📚
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold">Mini Lessons</h1>
            <p className="text-pink-100 text-lg">שיעורים קצרים</p>
          </div>
        </div>
        <p className="text-pink-100">
          Quick lessons to boost your English skills! 🚀
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow p-4 text-center">
          <div className="text-2xl font-bold text-gray-800">{lessons.length}</div>
          <div className="text-sm text-gray-500">Available</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{completedLessons.length}</div>
          <div className="text-sm text-gray-500">Completed</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {lessons.reduce((sum, l) => sum + l.duration, 0)}
          </div>
          <div className="text-sm text-gray-500">Total mins</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'all', label: 'All', emoji: '📚' },
          { id: 'grammar', label: 'Grammar', emoji: '📝' },
          { id: 'vocabulary', label: 'Vocabulary', emoji: '📖' },
          { id: 'reading', label: 'Reading', emoji: '📕' },
          { id: 'pronunciation', label: 'Pronunciation', emoji: '🗣️' }
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id as FilterType)}
            className={`px-4 py-2 rounded-full font-medium transition-all ${
              filter === f.id
                ? 'bg-pink-500 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            {f.emoji} {f.label}
          </button>
        ))}
      </div>

      {/* Lessons List */}
      <div className="space-y-3">
        {lessons.map((lesson) => (
          <LessonCard
            key={lesson.id}
            lesson={lesson}
            onClick={() => setSelectedLesson(lesson)}
            completed={completedLessons.includes(lesson.id)}
          />
        ))}

        {lessons.length === 0 && (
          <div className="bg-white rounded-xl shadow p-8 text-center">
            <div className="text-4xl mb-4">📭</div>
            <p className="text-gray-500">No lessons available for this filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default MicroLessonsPage;
