import { useState, useEffect } from 'react';
import { getStoriesWithQuestions } from '../../services/stories';
import type { Story, Student, StoryCardProps, StoryReaderProps } from '../../types';
import { useSpeechSynthesis } from '../../hooks/useSpeechSynthesis';

interface StudentStoriesProps {
  student: Student;
  onRefresh: () => void;
}

function StudentStories({ student, onRefresh }: StudentStoriesProps) {
  const [selectedStory, setSelectedStory] = useState<Story | null>(null); // selected story to display
  const [filter, setFilter] = useState<'all' | 'level'>('all'); // filter to apply to the stories
  const [selectedDifficulty, setSelectedDifficulty] = useState<number>(student?.currentLevel || 1); // selected difficulty to display
  const [showAnswer, setShowAnswer] = useState<boolean>(false); // show answer to the selected story
  const [stories, setStories] = useState<Story[]>([]); // stories to display
  const [loading, setLoading] = useState<boolean>(true); // loading state

  // Load stories on mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true); // set loading to true
      try {
        const loadedStories = await getStoriesWithQuestions();
        setStories(loadedStories); // set stories to the loaded stories
      } catch (error) {
        console.error('Error loading stories:', error);
        setStories([]); // set stories to an empty array
      } finally {
        setLoading(false); // set loading to false
      }
    };
    loadData();
  }, []);

  // Set default difficulty based on student level
  useEffect(() => {
    if (student?.currentLevel) {
      setSelectedDifficulty(student.currentLevel); // set selected difficulty to the student's current level
    }
  }, [student?.currentLevel]);

  // Apply filters - show stories appropriate for student level
  const filteredStories = stories.filter(story => {
    if (filter === 'all') {
      // Show stories at or near student's level (+/- 1 level)
      const studentLevel = student?.currentLevel || 1;
      return story.difficulty >= studentLevel - 1 && story.difficulty <= studentLevel + 1;
    }
    if (filter === 'level') {
      return story.difficulty === selectedDifficulty; // return true if the story's difficulty is equal to the selected difficulty
    }
    return true; // return true if the story's difficulty is not equal to the selected difficulty
  });

  const storiesRead = student?.storiesRead || 0; // stories read by the student

  const handleStoryComplete = () => {
    // Would update student progress in Firestore
    setSelectedStory(null); // set selected story to null
    setShowAnswer(false); // set show answer to false
    onRefresh(); // refresh the stories list by calling the onRefresh function  
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div> {/* loading spinner */}
        <p className="ml-4 text-gray-600">טוען סיפורים... / Loading stories...</p>
      </div>
    ); // return the loading spinner and the text "טוען סיפורים... / Loading stories..."
  }

  if (selectedStory) {
    return (
      <StoryReader
        story={selectedStory}
        onComplete={handleStoryComplete}
        onClose={() => {
          setSelectedStory(null); // set selected story to null
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">ספריית הסיפורים</h1>
          <p className="text-gray-600">Story Library</p>
        </div>
        <div className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full font-bold">
          📚 {filteredStories.length} סיפורים
        </div>
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
            <label htmlFor="filter-by" className="block text-gray-700 mb-2 text-sm font-medium">
              סינון לפי / Filter by
            </label>
            <select
              id="filter-by"
              value={filter}
              onChange={(e) => setFilter(e.target.value as 'all' | 'level')}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">רמה שלי / My Level ({student?.currentLevel || 1})</option>
              <option value="level">רמה ספציפית / Specific Level</option>
            </select>
          </div>

          {filter === 'level' && (
            <div className="flex-1">
              <label htmlFor="difficulty-level" className="block text-gray-700 mb-2 text-sm font-medium">
                רמה / Level
              </label>
              <select
                id="difficulty-level"
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {[1, 2, 3, 4, 5].map(level => (
                  <option key={level} value={level}>
                    Level {level}
                  </option>
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
        <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-bold">
          ☀️ {story.difficulty}
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
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isCorrectAnswer, setIsCorrectAnswer] = useState<boolean | null>(null);
  const { speak, stop, isSpeaking } = useSpeechSynthesis({ lang: 'en-US', rate: 0.9 });

  const handleSelectAnswer = (index: number) => {
    setSelectedAnswer(index);
    const isCorrect = index === (story.correctAnswerIndex ?? 0);
    setIsCorrectAnswer(isCorrect);
    onAnswer();
  };

  const answerOptions = story.answerOptions || ['תשובה א׳', 'תשובה ב׳', 'תשובה ג׳', 'תשובה ד׳'];
  const answerOptionsEn = story.answerOptionsEn;
  const correctIndex = story.correctAnswerIndex ?? 0;
  // Story Library only shows stories with real options; this is a fallback if opened by id
  const hasRealOptions = answerOptions.length > 0 && answerOptions[0] !== 'תשובה א׳';

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
            ☀️ Level {story.difficulty}
          </span>
          <h2 className="text-3xl font-bold mb-2">{story.titleEn}</h2>
          <p className="text-blue-100 text-lg">{story.title}</p>
        </div>

        <div className="p-6 lg:p-8">
          {/* Read aloud button */}
          <div className="flex justify-center mb-4">
            <button
              type="button"
              onClick={() => (isSpeaking ? stop() : speak(story.text))}
              className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl font-medium text-white transition-all shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 ${isSpeaking ? 'bg-red-600 focus:ring-red-400 hover:bg-red-700' : 'bg-blue-500 focus:ring-blue-400 hover:bg-blue-600'}`}
              aria-label={isSpeaking ? 'Stop reading' : 'Listen to story'}
            >
              {isSpeaking ? (
                <>
                  <span className="text-lg">⏹</span>
                  <span>Stop / עצור</span>
                </>
              ) : (
                <>
                  <span className="text-lg">🔊</span>
                  <span>Listen to story / האזן לסיפור</span>
                </>
              )}
            </button>
          </div>
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
              hasRealOptions ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                  {answerOptions.map((answer, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectAnswer(idx)}
                      className="p-5 border-2 border-gray-200 rounded-xl text-right hover:border-blue-300 hover:bg-blue-50 transition-colors text-lg text-gray-800 bg-white flex flex-col items-stretch gap-3"
                    >
                      <span className="ml-2 font-bold text-gray-400">{['א׳', 'ב׳', 'ג׳', 'ד׳'][idx]}</span>
                      <span dir="rtl" className="text-gray-800">{answer}</span>
                      <span className="block text-lg text-gray-600 border-t border-gray-100 pt-2" dir="ltr">
                        {answerOptionsEn?.[idx] ?? answer}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <p className="text-amber-800 mb-3">שאלות הבנה לא זמינות לסיפור זה. חזור לספרייה ובחר סיפור אחר.</p>
                  <p className="text-gray-600 text-sm mb-3">Comprehension questions are not available for this story. Go back and choose another story.</p>
                  <button
                    onClick={onClose}
                    className="px-6 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600"
                  >
                    חזור לספרייה / Back to library
                  </button>
                </div>
              )
            ) : (
              <div className="space-y-6">
                {hasRealOptions ? (
                <>
                {/* Show all answers with correct/incorrect highlighting */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                  {answerOptions.map((answer, idx) => (
                    <div
                      key={idx}
                      className={`p-5 border-2 rounded-xl text-right text-lg flex flex-col gap-3 ${
                        idx === correctIndex
                          ? 'border-green-500 bg-green-50 text-green-800'
                          : idx === selectedAnswer && idx !== correctIndex
                          ? 'border-red-500 bg-red-50 text-red-800'
                          : 'border-gray-200 bg-gray-50 text-gray-500'
                      }`}
                    >
                      <span className="ml-2 font-bold">{['א׳', 'ב׳', 'ג׳', 'ד׳'][idx]}</span>
                      <span dir="rtl">{answer}</span>
                      <span className="block text-lg border-t border-gray-200 pt-2" dir="ltr">
                        {answerOptionsEn?.[idx] ?? answer}
                      </span>
                      {idx === correctIndex && <span className="mr-2">✅</span>}
                    </div>
                  ))}
                </div>

                {isCorrectAnswer ? (
                  <div className="bg-green-100 border-2 border-green-300 rounded-xl p-5">
                    <p className="font-bold text-green-700 text-lg mb-2">✅ מצוין! תשובה נכונה!</p>
                    <p className="text-gray-700">Excellent! Correct answer!</p>
                  </div>
                ) : (
                  <div className="bg-orange-100 border-2 border-orange-300 rounded-xl p-5">
                    <p className="font-bold text-orange-700 text-lg mb-2">👍 לא נורא! נסה שוב בפעם הבאה</p>
                    <p className="text-gray-700">That's okay! Try again next time. You still made progress!</p>
                  </div>
                )}
                </>
                ) : null}

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
