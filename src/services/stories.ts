import type { Story, StudentSkills } from '../types';

// Stories data - embedded for demo mode
const demoStories: Story[] = [
  {
    id: "story_001",
    title: "המבחן במתמטיקה",
    titleEn: "The Math Test",
    text: "Tom has a math test today. He is worried. His teacher says, 'You can do it!' Tom does the test. He feels happy.",
    hebrewTranslation: "לתום יש מבחן מתמטיקה היום. הוא מודאג. המורה שלו אומרת, 'אתה יכול!' תום עושה את המבחן. הוא מרגיש שמח.",
    difficulty: 1,
    wordCount: 23,
    sentences: 5,
    vocabularyIds: ["tom", "test", "today", "worried", "teacher", "says", "you", "can", "do", "it", "feel", "happy"],
    emotionWords: ["worried", "happy"],
    themes: ["school", "support", "success"],
    comprehensionQuestion: "מי עוזר לתום להרגיש יותר טוב לפני המבחן?",
    comprehensionQuestionEn: "Who helps Tom feel better before the test?",
    answerOptions: ["המורה", "החבר שלו", "האמא שלו", "הכלב"],
    answerOptionsEn: ["The teacher", "His friend", "His mom", "The dog"],
    correctAnswerIndex: 0
  },
  {
    id: "story_002",
    title: "חברה חדשה",
    titleEn: "A New Friend",
    text: "Maya sits alone at lunch. She feels sad. Noa sits next to her. They talk and eat together. Maya is happy now.",
    hebrewTranslation: "מאיה יושבת לבד בארוחת הצהריים. היא מרגישה עצובה. נועה יושבת לידה. הן מדברות ואוכלות ביחד. מאיה שמחה עכשיו.",
    difficulty: 1,
    wordCount: 23,
    sentences: 5,
    vocabularyIds: ["maya", "sits", "alone", "lunch", "feel", "sad", "noa", "sit", "next", "her", "they", "talk", "eat", "together", "happy", "now"],
    emotionWords: ["sad", "happy"],
    themes: ["friendship", "loneliness", "connection"],
    comprehensionQuestion: "מה נועה עושה שעוזר למאיה?",
    comprehensionQuestionEn: "What does Noa do that helps Maya?",
    answerOptions: ["יושבת לידה ומדברת איתה", "נותנת לה אוכל", "משחקת איתה כדורגל", "קוראת למורה"],
    answerOptionsEn: ["Sits next to her and talks", "Gives her food", "Plays soccer with her", "Calls the teacher"],
    correctAnswerIndex: 0
  },
  {
    id: "story_003",
    title: "הכדורגל",
    titleEn: "The Ball",
    text: "Dan plays with a red ball. The ball goes over the fence. A dog finds the ball. Dan gets the ball back. He thanks the dog.",
    hebrewTranslation: "דן משחק עם כדור אדום. הכדור עובר מעבר לגדר. כלב מוצא את הכדור. דן מקבל את הכדור בחזרה. הוא מודה לכלב.",
    difficulty: 1,
    wordCount: 27,
    sentences: 5,
    vocabularyIds: ["dan", "play", "red", "ball", "go", "over", "fence", "dog", "find", "get", "back", "thank"],
    emotionWords: ["worried", "happy"],
    themes: ["play", "problem", "solution"],
    comprehensionQuestion: "מי מוצא את הכדור?",
    comprehensionQuestionEn: "Who finds the ball?",
    answerOptions: ["הכלב", "דן", "השכן", "המורה"],
    answerOptionsEn: ["The dog", "Dan", "The neighbor", "The teacher"],
    correctAnswerIndex: 0
  },
  {
    id: "story_004",
    title: "הציור",
    titleEn: "The Drawing",
    text: "Sara draws a picture of a cat. She uses many colors. Her mom likes the picture. Sara gives it to her mom. Her mom hangs it on the wall.",
    hebrewTranslation: "שרה מציירת תמונה של חתול. היא משתמשת בהרבה צבעים. אמא שלה אוהבת את התמונה. שרה נותנת אותה לאמא שלה. אמא שלה תולה אותה על הקיר.",
    difficulty: 1,
    wordCount: 29,
    sentences: 5,
    vocabularyIds: ["sara", "draw", "picture", "cat", "use", "many", "color", "mom", "like", "give", "hang", "wall"],
    emotionWords: ["happy"],
    themes: ["art", "family", "creativity"],
    comprehensionQuestion: "שרה ציירה תמונה של מי?",
    comprehensionQuestionEn: "What did Sara draw a picture of?",
    answerOptions: ["חתול", "כלב", "פרח", "בית"],
    answerOptionsEn: ["A cat", "A dog", "A flower", "A house"],
    correctAnswerIndex: 0
  },
  {
    id: "story_005",
    title: "הארוחה",
    titleEn: "The Lunch",
    text: "Ben makes a sandwich for lunch. He puts cheese and tomatoes. His sister wants some too. They share the sandwich. Both are happy.",
    hebrewTranslation: "בן מכין כריך לארוחת הצהריים. הוא שם גבינה ועגבניות. אחותו רוצה גם. הם חולקים את הכריך. שניהם שמחים.",
    difficulty: 1,
    wordCount: 25,
    sentences: 5,
    vocabularyIds: ["ben", "make", "sandwich", "lunch", "put", "cheese", "tomato", "sister", "want", "some", "too", "share", "both", "happy"],
    emotionWords: ["happy"],
    themes: ["food", "sharing", "family"],
    comprehensionQuestion: "בן מכין מה לארוחת הצהריים?",
    comprehensionQuestionEn: "What does Ben make for lunch?",
    answerOptions: ["כריך", "פיצה", "סלט", "פסטה"],
    answerOptionsEn: ["A sandwich", "Pizza", "Salad", "Pasta"],
    correctAnswerIndex: 0
  },
  {
    id: "story_006",
    title: "משחק הכדורגל",
    titleEn: "The Soccer Game",
    text: "Omer's team plays soccer. The other team is fast. Omer runs fast too. He kicks the ball. Goal! Omer is proud.",
    hebrewTranslation: "הקבוצה של עומר משחקת כדורגל. הקבוצה השנייה מהירה. עומר רץ מהר גם. הוא בועט בכדור. שער! עומר גאה.",
    difficulty: 2,
    wordCount: 26,
    sentences: 5,
    vocabularyIds: ["team", "play", "soccer", "other", "fast", "run", "kick", "ball", "proud"],
    emotionWords: ["proud"],
    themes: ["sports", "effort", "achievement"],
    comprehensionQuestion: "למה עומר גאה בסוף הסיפור?",
    comprehensionQuestionEn: "Why is Omer proud at the end of the story?",
    answerOptions: ["הוא הבקיע שער", "הקבוצה שלו ניצחה", "הוא רץ מהר", "הוא קיבל ציון טוב"],
    answerOptionsEn: ["He scored a goal", "His team won", "He ran fast", "He got a good grade"],
    correctAnswerIndex: 0
  },
  {
    id: "story_007",
    title: "אבוד בעיר",
    titleEn: "Lost in the City",
    text: "Noam walks in the city. He cannot find his home. He feels afraid. A policewoman helps him. Noam sees his house. He is safe now.",
    hebrewTranslation: "נועם הולך בעיר. הוא לא מוצא את הבית שלו. הוא מרגיש מפוחד. שוטרת עוזרת לו. נועם רואה את הבית שלו. הוא בטוח עכשיו.",
    difficulty: 2,
    wordCount: 28,
    sentences: 5,
    vocabularyIds: ["walk", "city", "find", "home", "feel", "afraid", "policewoman", "help", "see", "house", "safe", "now"],
    emotionWords: ["afraid", "safe"],
    themes: ["safety", "help", "community"],
    comprehensionQuestion: "מי עוזר לנועם?",
    comprehensionQuestionEn: "Who helps Noam?",
    answerOptions: ["שוטרת", "חבר", "מורה", "אמא"],
    answerOptionsEn: ["A policewoman", "A friend", "A teacher", "His mom"],
    correctAnswerIndex: 0
  },
  {
    id: "story_008",
    title: "מתנות",
    titleEn: "Making Up",
    text: "Dan and Roy fight. They are angry. They do not talk for two days. Roy says sorry. Dan smiles. They play together again.",
    hebrewTranslation: "דן ורוי רבים. הם כועסים. הם לא מדברים במשך יומיים. רוי אומר סליחה. דן מחייך. הם משחקים שוב ביחד.",
    difficulty: 2,
    wordCount: 26,
    sentences: 5,
    vocabularyIds: ["fight", "angry", "talk", "two", "days", "sorry", "smile", "let's", "play"],
    emotionWords: ["angry", "happy"],
    themes: ["friendship", "forgiveness", "conflict"],
    comprehensionQuestion: "רוי אומר לדן מה?",
    comprehensionQuestionEn: "What does Roy say to Dan?",
    answerOptions: ["סליחה", "תודה", "שלום", "להתראות"],
    answerOptionsEn: ["Sorry", "Thank you", "Hello", "Goodbye"],
    correctAnswerIndex: 0
  },
  {
    id: "story_009",
    title: "השיעור",
    titleEn: "The Music Lesson",
    text: "Maya listens to music. She hears a new song. She feels happy. She starts to dance. She feels free.",
    hebrewTranslation: "מאיה מקשיבה למוזיקה. היא שומעת שיר חדש. היא מרגישה שמחה. היא מתחילה לרקוד. היא מרגישה חופשייה.",
    difficulty: 1,
    wordCount: 24,
    sentences: 5,
    vocabularyIds: ["listen", "music", "hear", "new", "song", "happy", "dance", "room", "feel", "free"],
    emotionWords: ["happy"],
    themes: ["music", "dance", "joy"],
    comprehensionQuestion: "מאיה מתחילה לעשות מה?",
    comprehensionQuestionEn: "What does Maya start to do?",
    answerOptions: ["לרקוד", "לשיר", "לצייר", "לכתוב"],
    answerOptionsEn: ["To dance", "To sing", "To draw", "To write"],
    correctAnswerIndex: 0
  },
  {
    id: "story_010",
    title: "סבתא",
    titleEn: "Grandma's House",
    text: "Grandma lives alone. Maya visits her every week. They cook lunch together. They tell stories. Maya feels happy.",
    hebrewTranslation: "סבתא גרה לבד. מאיה מבקרת אותה כל שבוע. הן מכינות ארוחת צהריים ביחד. הן מספרות סיפורים. מאיה מרגישה שמחה.",
    difficulty: 2,
    wordCount: 25,
    sentences: 5,
    vocabularyIds: ["grandma", "live", "alone", "visit", "every", "week", "cook", "lunch", "together", "tell", "stories", "feel", "happy"],
    emotionWords: ["happy"],
    themes: ["family", "grandparents", "love"],
    comprehensionQuestion: "מאיה מבקרת את סבתא כל כמה זמן?",
    comprehensionQuestionEn: "How often does Maya visit her grandma?",
    answerOptions: ["כל שבוע", "כל יום", "כל חודש", "פעם בשנה"],
    answerOptionsEn: ["Every week", "Every day", "Every month", "Once a year"],
    correctAnswerIndex: 0
  }
];

// Stories will be loaded from the public folder
let storiesData: Story[] | null = null;
let storiesLoaded = false;

/**
 * Load stories from the public folder
 */
async function loadStories(): Promise<Story[]> {
  if (storiesLoaded) return storiesData || [];

  try {
    // Fetch stories from the public folder
    const response = await fetch('/stories.json');
    if (!response.ok) {
      console.warn('Failed to load stories.json, using demo stories');
      storiesData = demoStories;
    } else {
      const loaded: Story[] = await response.json();
      // Merge in contextual answer options from demo when a story is missing them (by id)
      const demoById = new Map(demoStories.map(s => [s.id, s]));
      storiesData = loaded.map(story => {
        const hasOptions = story.answerOptions && story.answerOptions.length > 0 && story.answerOptions[0] !== 'תשובה א׳';
        if (hasOptions) return story;
        const demo = demoById.get(story.id);
        if (!demo?.answerOptions?.length) return story;
        return {
          ...story,
          answerOptions: demo.answerOptions,
          answerOptionsEn: demo.answerOptionsEn,
          correctAnswerIndex: demo.correctAnswerIndex ?? 0
        };
      });
    }
  } catch (error) {
    console.warn('Error loading stories.json, using demo stories:', error);
    storiesData = demoStories;
  }

  storiesLoaded = true;
  return storiesData || [];
}

/** True if the story has real multiple-choice options (not placeholder labels). Students should only see these. */
export function hasRealAnswerOptions(story: Story): boolean {
  const opts = story.answerOptions;
  return !!(opts?.length && opts[0] !== 'תשובה א׳');
}

/**
 * Get all stories (raw; includes some that may lack answer options).
 */
export async function getAllStories(): Promise<Story[]> {
  if (!storiesLoaded) {
    await loadStories();
  }
  return storiesData || [];
}

/**
 * Get stories that have real comprehension answer options so students can learn from multiple choice.
 * Use this for the Story Library and for missions.
 */
export async function getStoriesWithQuestions(): Promise<Story[]> {
  const all = await getAllStories();
  return all.filter(hasRealAnswerOptions);
}

/**
 * Get story by ID
 */
export async function getStoryById(storyId: string): Promise<Story | null> {
  const stories = await getAllStories();
  return stories.find(story => story.id === storyId) || null;
}

/**
 * Get stories by difficulty level
 */
export async function getStoriesByDifficulty(difficulty: number): Promise<Story[]> {
  const stories = await getAllStories();
  return stories.filter(story => story.difficulty === difficulty);
}

/**
 * Get stories by theme
 */
export async function getStoriesByTheme(theme: string): Promise<Story[]> {
  const stories = await getAllStories();
  return stories.filter(story =>
    story.themes && story.themes.includes(theme)
  );
}

/**
 * Get stories by vocabulary ID
 */
export async function getStoriesWithVocabulary(vocabId: string): Promise<Story[]> {
  const stories = await getAllStories();
  return stories.filter(story =>
    story.vocabularyIds && story.vocabularyIds.includes(vocabId)
  );
}

/**
 * Get random stories
 */
export async function getRandomStories(count: number = 10, difficulty: number | null = null): Promise<Story[]> {
  let stories = await getAllStories();

  if (difficulty !== null) {
    stories = stories.filter(story => story.difficulty === difficulty);
  }

  // Shuffle and return count
  const shuffled = [...stories].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

/**
 * Get stories for a mission based on student skill level.
 * Only returns stories that have real answer options so students can learn from choices.
 */
export async function getStoriesForMission(studentLevel: number, _missionType: string, count: number = 3): Promise<Story[]> {
  const stories = await getStoriesWithQuestions();

  // Get stories at or slightly below student level
  const appropriateStories = stories.filter(story =>
    story.difficulty <= studentLevel + 1 &&
    story.difficulty >= studentLevel - 1
  );

  // Shuffle and return count
  const shuffled = [...appropriateStories].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

/**
 * Search stories by text
 */
export async function searchStories(searchTerm: string): Promise<Story[]> {
  const stories = await getAllStories();
  const term = searchTerm.toLowerCase();

  return stories.filter(story =>
    story.titleEn?.toLowerCase().includes(term) ||
    story.text?.toLowerCase().includes(term) ||
    story.themes?.some(theme => theme.toLowerCase().includes(term))
  );
}

/**
 * Get all available themes
 */
export async function getAllThemes(): Promise<string[]> {
  const stories = await getAllStories();
  const themes = new Set<string>();

  stories.forEach(story => {
    if (story.themes) {
      story.themes.forEach(theme => themes.add(theme));
    }
  });

  return Array.from(themes).sort();
}

/**
 * Get all available difficulty levels
 */
export async function getDifficultyLevels(): Promise<number[]> {
  const stories = await getAllStories();
  const levels = new Set<number>();

  stories.forEach(story => {
    levels.add(story.difficulty);
  });

  return Array.from(levels).sort((a, b) => a - b);
}

/**
 * Get vocabulary IDs from a story
 */
export async function getStoryVocabulary(storyId: string): Promise<string[]> {
  const story = await getStoryById(storyId);
  return story?.vocabularyIds || [];
}

/**
 * Get stories for adaptive learning based on student performance
 */
export async function getAdaptiveSkills(studentSkills: StudentSkills | undefined, recentStoryIds: string[] = [], count: number = 5): Promise<Story[]> {
  const stories = await getAllStories();
  const level = studentSkills?.readingLevel || 1;

  // Filter out recently read stories
  const availableStories = stories.filter(story =>
    !recentStoryIds.includes(story.id)
  );

  // Get stories at appropriate difficulty
  const targetStories = availableStories.filter(story =>
    story.difficulty <= level + 1 &&
    story.difficulty >= level - 1
  );

  // If not enough stories, expand range
  let finalStories = targetStories;
  if (finalStories.length < count) {
    finalStories = availableStories.filter(story =>
      story.difficulty <= level + 2 &&
      story.difficulty >= level - 2
    );
  }

  // Shuffle and return count
  const shuffled = [...finalStories].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

export interface StoryStats {
  totalStories: number;
  averageWordCount: number;
  storiesByDifficulty: Record<number, number>;
  storiesByTheme: Record<string, number>;
  totalThemes: number;
}

/**
 * Get story statistics
 */
export async function getStoryStats(): Promise<StoryStats> {
  const stories = await getAllStories();

  const stats: StoryStats = {
    totalStories: stories.length,
    averageWordCount: 0,
    storiesByDifficulty: {},
    storiesByTheme: {},
    totalThemes: 0
  };

  if (stories.length === 0) return stats;

  // Calculate average word count
  const totalWords = stories.reduce((sum, story) => sum + (story.wordCount || 0), 0);
  stats.averageWordCount = Math.round(totalWords / stories.length);

  // Count by difficulty
  stories.forEach(story => {
    const diff = story.difficulty || 0;
    stats.storiesByDifficulty[diff] = (stats.storiesByDifficulty[diff] || 0) + 1;
  });

  // Count by theme
  const allThemes = new Set<string>();
  stories.forEach(story => {
    if (story.themes) {
      story.themes.forEach(theme => {
        allThemes.add(theme);
        stats.storiesByTheme[theme] = (stats.storiesByTheme[theme] || 0) + 1;
      });
    }
  });

  stats.totalThemes = allThemes.size;

  return stats;
}

export default {
  getAllStories,
  getStoryById,
  getStoriesByDifficulty,
  getStoriesByTheme,
  getStoriesWithVocabulary,
  getRandomStories,
  getStoriesForMission,
  searchStories,
  getAllThemes,
  getDifficultyLevels,
  getStoryVocabulary,
  getAdaptiveSkills,
  getStoryStats
};
