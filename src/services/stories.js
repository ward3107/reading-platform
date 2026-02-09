// Stories will be loaded from the public folder
let storiesData = null;
let storiesLoaded = false;

/**
 * Load stories from the public folder
 */
async function loadStories() {
  if (storiesLoaded) return storiesData;

  try {
    const response = await fetch('/stories.json');
    storiesData = await response.json();
    storiesLoaded = true;
    return storiesData;
  } catch (error) {
    console.error('Error loading stories:', error);
    return [];
  }
}

/**
 * Get all stories
 */
export async function getAllStories() {
  if (!storiesLoaded) {
    await loadStories();
  }
  return storiesData || [];
}

/**
 * Get story by ID
 */
export async function getStoryById(storyId) {
  const stories = await getAllStories();
  return stories.find(story => story.id === storyId) || null;
}

/**
 * Get stories by difficulty level
 */
export async function getStoriesByDifficulty(difficulty) {
  const stories = await getAllStories();
  return stories.filter(story => story.difficulty === difficulty);
}

/**
 * Get stories by theme
 */
export async function getStoriesByTheme(theme) {
  const stories = await getAllStories();
  return stories.filter(story =>
    story.themes && story.themes.includes(theme)
  );
}

/**
 * Get stories by vocabulary ID
 */
export async function getStoriesWithVocabulary(vocabId) {
  const stories = await getAllStories();
  return stories.filter(story =>
    story.vocabularyIds && story.vocabularyIds.includes(vocabId)
  );
}

/**
 * Get random stories
 */
export async function getRandomStories(count = 10, difficulty = null) {
  let stories = await getAllStories();

  if (difficulty !== null) {
    stories = stories.filter(story => story.difficulty === difficulty);
  }

  // Shuffle and return count
  const shuffled = [...stories].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

/**
 * Get stories for a mission based on student skill level
 */
export async function getStoriesForMission(studentLevel, missionType, count = 3) {
  const stories = await getAllStories();

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
export async function searchStories(searchTerm) {
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
export async function getAllThemes() {
  const stories = await getAllStories();
  const themes = new Set();

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
export async function getDifficultyLevels() {
  const stories = await getAllStories();
  const levels = new Set();

  stories.forEach(story => {
    levels.add(story.difficulty);
  });

  return Array.from(levels).sort((a, b) => a - b);
}

/**
 * Get vocabulary IDs from a story
 */
export async function getStoryVocabulary(storyId) {
  const story = await getStoryById(storyId);
  return story?.vocabularyIds || [];
}

/**
 * Get stories for adaptive learning based on student performance
 */
export async function getAdaptiveStories(studentSkills, recentStoryIds = [], count = 5) {
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

/**
 * Get story statistics
 */
export async function getStoryStats() {
  const stories = await getAllStories();

  const stats = {
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
  const allThemes = new Set();
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
  getAdaptiveStories,
  getStoryStats
};
