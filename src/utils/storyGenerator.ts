/**
 * Story Generator Utility
 *
 * Generates leveled stories for the reading platform.
 * Each level has progressively more complex vocabulary, longer sentences,
 * and more sophisticated themes.
 */

export interface GeneratedStory {
  id: string;
  title: string;
  titleEn: string;
  text: string;
  hebrewTranslation: string;
  difficulty: number;
  wordCount: number;
  sentences: number;
  vocabularyIds: string[];
  emotionWords: string[];
  themes: string[];
  comprehensionQuestion: string;
  comprehensionQuestionEn: string;
  answerOptions: string[];
  answerOptionsEn: string[];
  correctAnswerIndex: number;
}

// Character names used across stories
const CHARACTERS = {
  boys: ['Tom', 'Dan', 'Ben', 'Roy', 'Omer', 'Noam', 'Amir', 'Daniel', 'Idan', 'Gal', 'Yoni', 'Nadav', 'Itay', 'Matan', 'Shay'],
  girls: ['Maya', 'Noa', 'Sara', 'Li', 'Tamar', 'Yael', 'Shira', 'Dana', 'Michal', 'Roni', 'Noya', 'Lior', 'Eden', 'Hadar', 'Aviv']
};

// Level-specific vocabulary
const VOCABULARY_BY_LEVEL = {
  1: {
    words: ['play', 'run', 'eat', 'sleep', 'happy', 'sad', 'big', 'small', 'red', 'blue', 'mom', 'dad', 'dog', 'cat', 'ball', 'book', 'home', 'school', 'friend', 'love'],
    sentenceStructures: ['Subject + verb + object', 'Subject + is + adjective', 'Simple present tense'],
    maxWordsPerSentence: 6
  },
  2: {
    words: ['because', 'but', 'when', 'after', 'before', 'find', 'give', 'help', 'make', 'take', 'think', 'want', 'need', 'try', 'start', 'finish', 'together', 'always', 'never', 'sometimes'],
    sentenceStructures: ['Compound sentences with and/but', 'Simple time clauses', 'Present continuous'],
    maxWordsPerSentence: 8
  },
  3: {
    words: ['although', 'however', 'while', 'during', 'until', 'decide', 'discover', 'explain', 'realize', 'remember', 'understand', 'believe', 'imagine', 'create', 'continue', 'finally', 'suddenly', 'actually', 'probably', 'usually'],
    sentenceStructures: ['Complex sentences with subordinating conjunctions', 'Past continuous', 'Future tense with will/going to'],
    maxWordsPerSentence: 12
  },
  4: {
    words: ['therefore', 'consequently', 'meanwhile', 'furthermore', 'nevertheless', 'appreciate', 'approach', 'challenge', 'concentrate', 'determine', 'encourage', 'establish', 'participate', 'persuade', 'recommend', 'significant', 'essential', 'particular', 'various', 'obvious'],
    sentenceStructures: ['Complex compound sentences', 'Passive voice', 'Conditional sentences'],
    maxWordsPerSentence: 15
  },
  5: {
    words: ['consequently', 'additionally', 'alternatively', 'conversely', 'specifically', 'acknowledge', 'anticipate', 'circumstance', 'demonstrate', 'distinguish', 'evaluate', 'illustrate', 'incorporate', 'investigate', 'method', 'perspective', 'phenomenon', 'substantial', 'theoretical', 'ultimately'],
    sentenceStructures: ['Multiple clause sentences', 'Subjunctive mood', 'Abstract reasoning'],
    maxWordsPerSentence: 20
  }
};

// Theme templates for story generation
const THEME_TEMPLATES = {
  1: [
    { theme: 'family', context: 'spending time with family members' },
    { theme: 'friendship', context: 'making new friends' },
    { theme: 'pets', context: 'playing with animals' },
    { theme: 'play', context: 'having fun with toys and games' },
    { theme: 'food', context: 'eating and sharing meals' },
    { theme: 'school', context: 'learning new things' },
    { theme: 'nature', context: 'playing outside' },
    { theme: 'bedtime', context: 'getting ready for sleep' }
  ],
  2: [
    { theme: 'helping', context: 'helping others in need' },
    { theme: 'sharing', context: 'learning to share' },
    { theme: 'feelings', context: 'understanding emotions' },
    { theme: 'trying', context: 'not giving up' },
    { theme: 'honesty', context: 'telling the truth' },
    { theme: 'kindness', context: 'being nice to others' },
    { theme: 'safety', context: 'staying safe' },
    { theme: 'growing', context: 'learning new skills' }
  ],
  3: [
    { theme: 'responsibility', context: 'taking care of something important' },
    { theme: 'teamwork', context: 'working together to achieve goals' },
    { theme: 'creativity', context: 'using imagination to solve problems' },
    { theme: 'perseverance', context: 'overcoming challenges' },
    { theme: 'empathy', context: 'understanding how others feel' },
    { theme: 'adventure', context: 'exploring new places' },
    { theme: 'discovery', context: 'learning something new about the world' },
    { theme: 'tradition', context: 'celebrating customs and holidays' }
  ],
  4: [
    { theme: 'leadership', context: 'guiding others and making decisions' },
    { theme: 'environment', context: 'protecting nature and the planet' },
    { theme: 'conflict', context: 'resolving disagreements peacefully' },
    { theme: 'culture', context: 'appreciating different backgrounds' },
    { theme: 'innovation', context: 'creating new solutions to problems' },
    { theme: 'resilience', context: 'bouncing back from setbacks' },
    { theme: 'integrity', context: 'doing the right thing even when hard' },
    { theme: 'community', context: 'contributing to the neighborhood' }
  ],
  5: [
    { theme: 'ethics', context: 'making difficult moral choices' },
    { theme: 'global', context: 'understanding world issues' },
    { theme: 'science', context: 'exploring scientific concepts' },
    { theme: 'history', context: 'learning from the past' },
    { theme: 'philosophy', context: 'questioning and reasoning' },
    { theme: 'advocacy', context: 'standing up for beliefs' },
    { theme: 'research', context: 'investigating complex topics' },
    { theme: 'legacy', context: 'thinking about long-term impact' }
  ]
};

// Story templates by level
const STORY_TEMPLATES: Record<number, Array<(char: {name: string, gender: 'boy' | 'girl'}) => {en: string, he: string, question: {en: string, he: string}, answers: {en: string[], he: string[]}, correct: number}>> = {
  1: [
    (char) => ({
      en: `${char.name} has a new toy. ${char.gender === 'boy' ? 'He' : 'She'} plays with it. The toy is fun. ${char.gender === 'boy' ? 'He' : 'She'} is happy.`,
      he: `ל${char.name === 'Maya' ? 'מאיה' : char.name === 'Noa' ? 'נועה' : char.name === 'Sara' ? 'שרה' : char.name === 'Li' ? 'לי' : char.name === 'Tamar' ? 'תמר' : char.name === 'Yael' ? 'יעל' : char.name === 'Shira' ? 'שירה' : char.name === 'Dana' ? 'דנה' : char.name === 'Michal' ? 'מיכל' : char.name === 'Roni' ? 'רוני' : char.name === 'Noya' ? 'נויה' : char.name === 'Lior' ? 'ליאור' : char.name === 'Eden' ? 'עדן' : char.name === 'Hadar' ? 'הדר' : char.name === 'Aviv' ? 'אביב' : char.name === 'Tom' ? 'תום' : char.name === 'Dan' ? 'דן' : char.name === 'Ben' ? 'בן' : char.name === 'Roy' ? 'רוי' : char.name === 'Omer' ? 'עומר' : char.name === 'Noam' ? 'נועם' : char.name === 'Amir' ? 'אמיר' : char.name === 'Daniel' ? 'דניאל' : char.name === 'Idan' ? 'עידן' : char.name === 'Gal' ? 'גל' : char.name === 'Yoni' ? 'יוני' : char.name === 'Nadav' ? 'נדב' : char.name === 'Itay' ? 'איתי' : char.name === 'Matan' ? 'מתן' : char.name === 'Shay' ? 'שי' : char.name} יש צעצוע חדש. הוא משחק איתו. הצעצוע כיף. הוא שמח.`,
      question: { en: `What does ${char.name} have?`, he: `מה יש ל${char.name}?` },
      answers: {
        en: ['A new toy', 'A new book', 'A new friend', 'A new pet'],
        he: ['צעצוע חדש', 'ספר חדש', 'חבר חדש', 'חיית מחמד חדשה']
      },
      correct: 0
    })
  ],
  2: [
    (char) => ({
      en: `${char.name} wants to learn how to ride a bike. At first, ${char.gender === 'boy' ? 'he' : 'she'} falls down. But ${char.name} does not give up. After many tries, ${char.gender === 'boy' ? 'he' : 'she'} can ride! ${char.name} feels very proud.`,
      he: `${char.name} רוצה ללמוד לרכוב על אופניים. בהתחלה, הוא נופל. אבל ${char.name} לא מוותר. אחרי הרבה ניסיונות, הוא יכול לרכוב! ${char.name} מרגיש גאה מאוד.`,
      question: { en: `How does ${char.name} feel at the end?`, he: `איך ${char.name} מרגיש בסוף?` },
      answers: {
        en: ['Proud', 'Sad', 'Angry', 'Tired'],
        he: ['גאה', 'עצוב', 'כועס', 'עייף']
      },
      correct: 0
    })
  ],
  3: [
    (char) => ({
      en: `${char.name} discovers an old map in the attic. Curious about where it might lead, ${char.gender === 'boy' ? 'he' : 'she'} decides to follow it. After walking through the park and crossing a small bridge, ${char.name} finds a hidden garden. The garden is full of beautiful flowers. ${char.gender === 'boy' ? 'He' : 'She'} realizes that exploring can lead to wonderful discoveries.`,
      he: `${char.name} מוצא מפה ישנה בעליית הגג. סקרן לאן היא עשויה להוביל, הוא מחליט לעקוב אחריה. אחרי שהולך דרך הפארק וחוצה גשר קטן, ${char.name} מוצא גן נסתר. הגן מלא בפרחים יפים. הוא מבין שחקירה יכולה להוביל לתגליות נפלאות.`,
      question: { en: `What does ${char.name} find by following the map?`, he: `מה ${char.name} מוצא על ידי מעקב אחר המפה?` },
      answers: {
        en: ['A hidden garden', 'A treasure chest', 'An old house', 'A secret cave'],
        he: ['גן נסתר', 'תיבת אוצר', 'בית ישן', 'מערה סודית']
      },
      correct: 0
    })
  ],
  4: [
    (char) => ({
      en: `When ${char.name}'s school announces a recycling competition, ${char.gender === 'boy' ? 'he' : 'she'} decides to organize a community cleanup. First, ${char.name} creates flyers to spread awareness. Then, ${char.gender === 'boy' ? 'he' : 'she'} gathers volunteers from the neighborhood. Together, they collect over two hundred bags of trash from the local park. The project demonstrates how individual initiative can create significant environmental change. ${char.name} realizes that leadership means inspiring others to work toward a common goal.`,
      he: `כשבית הספר של ${char.name} מכריז על תחרות מיחזור, הוא מחליט לארגן ניקיון קהילתי. קודם, ${char.name} יוצר כרזות להפצת מודעות. אז, הוא אוסף מתנדבים מהשכונה. יחד, הם אוספים יותר ממאתיים שקיות זבל מהפארק המקומי. הפרויקט מדגים איך יוזמה אישית יכולה ליצור שינוי סביבתי משמעותי. ${char.name} מבין שמנהיגות פירושה להשרות אחרים לעבוד לקראת מטרה משותפת.`,
      question: { en: `What does ${char.name} learn about leadership?`, he: `מה ${char.name} לומד על מנהיגות?` },
      answers: {
        en: ['It means inspiring others toward common goals', 'It requires having the most money', 'It is about giving orders to people', 'It only works with adults'],
        he: ['זה אומר להשרות אחרים לקראת מטרות משותפות', 'זה דורש להיות עם הכי הרבה כסף', 'זה על לתת פקודות לאנשים', 'זה עובד רק עם מבוגרים']
      },
      correct: 0
    })
  ],
  5: [
    (char) => ({
      en: `${char.name} participates in a science fair investigating renewable energy sources. The project involves extensive research into solar, wind, and hydroelectric power. Through careful experimentation, ${char.gender === 'boy' ? 'he' : 'she'} discovers that the efficiency of solar panels varies significantly based on their angle relative to the sun. This finding leads ${char.name} to propose an innovative tracking system that adjusts panel positions throughout the day. The judges are impressed not only by the technical sophistication but also by the potential real-world applications. Ultimately, ${char.name} understands that scientific inquiry requires both methodical investigation and creative thinking to address complex global challenges.`,
      he: `${char.name} משתתף ביריד מדע החוקר מקורות אנרגיה מתחדשים. הפרויקט כולל מחקר נרחב לתוך אנרגיה סולארית, רוח והידרואלקטרית. דרך ניסויים זהירים, הוא מגלה שהיעילות של פאנלים סולאריים משתנה באופן משמעותי בהתבסס על הזווית שלהם ביחס לשמש. תגלית זו מובילה את ${char.name} להציע מערכת מעקב חדשנית שמתאימה את מיקומי הפאנלים לאורך היום. השופטים מתרשמים לא רק מהתחכום הטכני אלא גם מהיישומים הפוטנציאליים בעולם האמיתי. בסופו של דבר, ${char.name} מבין שחקירה מדעית דורשת גם חקירה שיטתית וגם חשיבה יצירתית כדי להתמודד עם אתגרים עולמיים מורכבים.`,
      question: { en: `What does ${char.name} conclude about scientific inquiry?`, he: `מה ${char.name} מסיק על חקירה מדעית?` },
      answers: {
        en: ['It requires both methodical investigation and creative thinking', 'It only needs expensive equipment', 'It is solely about memorizing facts', 'It cannot solve real problems'],
        he: ['זה דורש גם חקירה שיטתית וגם חשיבה יצירתית', 'זה צריך רק ציוד יקר', 'זה רק על שינון עובדות', 'זה לא יכול לפתור בעיות אמיתיות']
      },
      correct: 0
    })
  ]
};

let storyIdCounter = 500; // Start after existing stories

/**
 * Generate a unique story ID
 */
function generateStoryId(): string {
  return `story_${String(storyIdCounter++).padStart(3, '0')}`;
}

/**
 * Extract vocabulary words from text
 */
function extractVocabulary(text: string): string[] {
  const words = text.toLowerCase().split(/\s+/);
  const uniqueWords = [...new Set(words.map(w => w.replace(/[^a-z]/g, '')).filter(w => w.length > 2))];
  return uniqueWords.slice(0, 15);
}

/**
 * Count sentences in text
 */
function countSentences(text: string): number {
  return (text.match(/[.!?]+/g) || []).length;
}

/**
 * Count words in text
 */
function countWords(text: string): number {
  return text.split(/\s+/).filter(w => w.length > 0).length;
}

/**
 * Extract emotion words from text
 */
function extractEmotionWords(text: string): string[] {
  const emotionWords = [
    'happy', 'sad', 'angry', 'afraid', 'proud', 'worried', 'excited',
    'tired', 'surprised', 'confused', 'brave', 'shy', 'lonely', 'grateful',
    'disappointed', 'curious', 'nervous', 'calm', 'jealous', 'embarrassed'
  ];

  const textLower = text.toLowerCase();
  return emotionWords.filter(emotion => textLower.includes(emotion));
}

/**
 * Generate a story for a specific level
 */
export function generateStoryForLevel(level: number, templateIndex?: number): GeneratedStory {
  const templates = STORY_TEMPLATES[level];
  if (!templates || templates.length === 0) {
    throw new Error(`No templates available for level ${level}`);
  }

  const selectedTemplate = templateIndex !== undefined
    ? templates[templateIndex % templates.length]
    : templates[Math.floor(Math.random() * templates.length)];

  // Select random character
  const isBoy = Math.random() > 0.5;
  const names = isBoy ? CHARACTERS.boys : CHARACTERS.girls;
  const character = {
    name: names[Math.floor(Math.random() * names.length)],
    gender: isBoy ? 'boy' as const : 'girl' as const
  };

  // Get theme info
  const themeTemplates = THEME_TEMPLATES[level];
  const selectedTheme = themeTemplates[Math.floor(Math.random() * themeTemplates.length)];

  // Generate story content
  const storyContent = selectedTemplate(character);

  const story: GeneratedStory = {
    id: generateStoryId(),
    title: selectedTheme.theme.charAt(0).toUpperCase() + selectedTheme.theme.slice(1),
    titleEn: selectedTheme.theme.charAt(0).toUpperCase() + selectedTheme.theme.slice(1),
    text: storyContent.en,
    hebrewTranslation: storyContent.he,
    difficulty: level,
    wordCount: countWords(storyContent.en),
    sentences: countSentences(storyContent.en),
    vocabularyIds: extractVocabulary(storyContent.en),
    emotionWords: extractEmotionWords(storyContent.en),
    themes: [selectedTheme.theme],
    comprehensionQuestion: storyContent.question.he,
    comprehensionQuestionEn: storyContent.question.en,
    answerOptions: storyContent.answers.he,
    answerOptionsEn: storyContent.answers.en,
    correctAnswerIndex: storyContent.correct
  };

  return story;
}

/**
 * Generate multiple stories for a level
 */
export function generateStoriesForLevel(level: number, count: number): GeneratedStory[] {
  const stories: GeneratedStory[] = [];
  for (let i = 0; i < count; i++) {
    stories.push(generateStoryForLevel(level, i));
  }
  return stories;
}

/**
 * Generate balanced story set across all levels
 */
export function generateBalancedStories(storiesPerLevel: Record<number, number>): GeneratedStory[] {
  const allStories: GeneratedStory[] = [];

  for (const [level, count] of Object.entries(storiesPerLevel)) {
    const levelNum = parseInt(level);
    const stories = generateStoriesForLevel(levelNum, count);
    allStories.push(...stories);
  }

  return allStories;
}

/**
 * Get level specifications
 */
export function getLevelSpec(level: number) {
  return VOCABULARY_BY_LEVEL[level];
}

export default {
  generateStoryForLevel,
  generateStoriesForLevel,
  generateBalancedStories,
  getLevelSpec
};
