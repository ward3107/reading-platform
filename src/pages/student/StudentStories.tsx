import { useState, useEffect } from 'react';
import { getAllStories } from '../../services/stories';
import type { Story, Student, StudentSkills, StoryCardProps, StoryReaderProps } from '../../types';

interface StudentStoriesProps {
  student: Student;
  skills?: StudentSkills;
  onRefresh: () => void;
}

function StudentStories({ student, skills, onRefresh }: StudentStoriesProps) {
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [filter, setFilter] = useState<'all' | 'difficulty' | 'theme'>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<number>(1);
  const [selectedTheme, setSelectedTheme] = useState<string>('all');
  const [showAnswer, setShowAnswer] = useState<boolean>(false);
  const [stories, setStories] = useState<Story[]>([]);
  const [themes, setThemes] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Load stories on mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const loadedStories = await getAllStories();
        setStories(loadedStories);
        setThemes(loadedStories.flatMap(s => s.themes || []).filter((v, i, a) => a.indexOf(v) === i).sort());
      } catch (error) {
        console.error('Error loading stories:', error);
        setStories([]);
        setThemes([]);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Apply filters
  const filteredStories = stories.slice(0, 50);
  const storiesRead = student?.storiesRead || 0;

  const handleStoryComplete = () => {
    // Would update student progress in Firestore
    setSelectedStory(null);
    setShowAnswer(false);
    onRefresh();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
        <p className="ml-4 text-gray-600">טוען סיפורים... / Loading stories...</p>
      </div>
    );
  }

  if (selectedStory) {
    return (
      <StoryReader
        story={selectedStory}
        onComplete={handleStoryComplete}
        onClose={() => {
          setSelectedStory(null);
          setShowAnswer(false);
        }}
        showAnswer={showAnswer}
        onAnswer={() => setShowAnswer(true)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">ספריית הסיפורים</h1>
        <p className="text-gray-600">Story Library</p>
      </div>

      {/* Stats Bar */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-5 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-100 text-sm">סיפורים שנקראו</p>
            <p className="text-3xl font-bold">{storiesRead}</p>
          </div>
          <div className="text-5xl">📚</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-gray-700 mb-2 text-sm font-medium">
              סינון לפי / Filter by
            </label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as 'all' | 'difficulty' | 'theme')}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">הכל / All Stories</option>
              <option value="difficulty">רמת קושי / Difficulty</option>
              <option value="theme">נושא / Theme</option>
            </select>
          </div>

          {filter === 'difficulty' && (
            <div className="flex-1">
              <label className="block text-gray-700 mb-2 text-sm font-medium">
                רמה / Level
              </label>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {[1, 2, 3, 4, 5].map(level => (
                  <option key={level} value={level}>
                    שָׁׁמֶשׁ {level}
                  </option>
                ))}
              </select>
            </div>
          )}

          {filter === 'theme' && (
            <div className="flex-1">
              <label className="block text-gray-700 mb-2 text-sm font-medium">
                נושא / Theme
              </label>
              <select
                value={selectedTheme}
                onChange={(e) => setSelectedTheme(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">כל הנושאים / All Themes</option>
                {themes.map(theme => (
                  <option key={theme} value={theme}>{theme}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Stories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStories.map(story => (
          <StoryCard
            key={story.id}
            story={story}
            onClick={() => setSelectedStory(story)}
          />
        ))}
      </div>

      {stories.length === 0 && !loading && (
        <div className="bg-white rounded-xl shadow p-12 text-center">
          <div className="text-6xl mb-4">📚</div>
          <p className="text-gray-500">לא נמצאו סיפורים</p>
          <p className="text-gray-400">No stories found</p>
        </div>
      )}
    </div>
  );
}

// Story Card Component
function StoryCard({ story, onClick }: StoryCardProps) {
  return (
    <button
      onClick={onClick}
      className="bg-white rounded-xl shadow p-5 text-right hover:shadow-xl transition-all border-2 border-transparent hover:border-blue-300"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-bold text-lg text-gray-800 mb-1">{story.titleEn}</h3>
          <p className="text-sm text-gray-500">{story.title}</p>
        </div>
        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-bold">
          שָׁׁמֶשׁ {story.difficulty}
        </span>
      </div>

      <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
        <span>📝 {story.wordCount} מילים</span>
        <span>📖 {story.sentences} משפטים</span>
      </div>

      {story.themes && story.themes.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {story.themes.slice(0, 2).map(theme => (
            <span
              key={theme}
              className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
            >
              {theme}
            </span>
          ))}
        </div>
      )}
    </button>
  );
}

// Story Reader Component
function StoryReader({ story, onComplete, onClose, showAnswer, onAnswer }: StoryReaderProps) {
  return (
    <div className="space-y-4">
      {/* Back Button */}
      <button
        onClick={onClose}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
      >
        <span>→</span>
        <span>חזור לספרייה</span>
      </button>

      {/* Story Content */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white text-center">
          <span className="px-4 py-2 bg-white/20 rounded-full text-sm font-bold mb-3 inline-block">
            שָׁׁמֶשׁ {story.difficulty}
          </span>
          <h2 className="text-3xl font-bold mb-2">{story.titleEn}</h2>
          <p className="text-blue-100 text-lg">{story.title}</p>
        </div>

        <div className="p-6 lg:p-8">
          {/* English Text */}
          <div className="text-xl leading-relaxed text-gray-800 text-center mb-8" dir="ltr">
            {story.text}
          </div>

          {/* Hebrew Translation */}
          <div className="bg-gradient-to-l from-gray-50 to-gray-100 rounded-2xl p-6 mb-8" dir="rtl">
            <p className="text-sm text-gray-500 mb-3 flex items-center gap-2">
              <span>🔤</span>
              <span>תרגום לעברית</span>
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">{story.hebrewTranslation}</p>
          </div>

          {/* Vocabulary */}
          {story.vocabularyIds && story.vocabularyIds.length > 0 && (
            <div className="bg-blue-50 rounded-xl p-5 mb-8">
              <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span>📚</span>
                <span>מילים חדשות / New Words</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {story.vocabularyIds.slice(0, 10).map(word => (
                  <span
                    key={word}
                    className="px-3 py-2 bg-white rounded-lg text-sm text-gray-700 shadow-sm"
                  >
                    {word}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Comprehension Question */}
          <div className="border-t border-gray-200 pt-8">
            <h3 className="font-bold text-xl text-gray-800 mb-4 flex items-center gap-2">
              <span>❓</span>
              <span>שאלת הבנה / Comprehension Question</span>
            </h3>

            <div className="bg-yellow-50 rounded-xl p-5 mb-6" dir="rtl">
              <p className="text-lg text-gray-800">{story.comprehensionQuestion}</p>
            </div>
            <p className="text-gray-500 mb-6" dir="ltr">{story.comprehensionQuestionEn}</p>

            {!showAnswer ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {['תשובה א׳', 'תשובה ב׳', 'תשובה ג׳', 'תשובה ד׳'].map((answer, idx) => (
                  <button
                    key={idx}
                    onClick={onAnswer}
                    className="p-4 border-2 border-gray-200 rounded-xl text-right hover:border-blue-300 hover:bg-blue-50 transition-colors text-lg"
                  >
                    {answer}
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-green-100 border-2 border-green-300 rounded-xl p-5">
                  <p className="font-bold text-green-700 text-lg mb-2">✅ מצוין! קראת סיפור נוסף</p>
                  <p className="text-gray-700">You read another story and made progress!</p>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={onComplete}
                    className="flex-1 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-bold text-lg hover:from-blue-600 hover:to-blue-700 transition-all"
                  >
                    סיום וחזרה לספרייה →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentStories;
