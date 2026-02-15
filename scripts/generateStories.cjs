/**
 * Story Generator Script - Simple Version
 *
 * Generates balanced leveled stories and appends them to stories.json
 * Run with: node scripts/generateStories.cjs
 */

const fs = require('fs');
const path = require('path');

// Character names
const BOYS = ['Tom', 'Dan', 'Ben', 'Roy', 'Omer', 'Noam', 'Amir', 'Daniel', 'Idan', 'Gal', 'Yoni', 'Nadav', 'Itay', 'Matan', 'Shay'];
const GIRLS = ['Maya', 'Noa', 'Sara', 'Li', 'Tamar', 'Yael', 'Shira', 'Dana', 'Michal', 'Roni', 'Noya', 'Lior', 'Eden', 'Hadar', 'Aviv'];

const HEBREW_BOYS = ['תום', 'דן', 'בן', 'רוי', 'עומר', 'נועם', 'אמיר', 'דניאל', 'עידן', 'גל', 'יוני', 'נדב', 'איתי', 'מתן', 'שי'];
const HEBREW_GIRLS = ['מאיה', 'נועה', 'שרה', 'לי', 'תמר', 'יעל', 'שירה', 'דנה', 'מיכל', 'רוני', 'נויה', 'ליאור', 'עדן', 'הדר', 'אביב'];

let storyIdCounter = 500;

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function wordCount(text) {
  return text.split(/\s+/).filter(w => w.length > 0).length;
}

function sentenceCount(text) {
  return (text.match(/[.!?]+/g) || []).length;
}

function extractVocab(text) {
  const words = text.toLowerCase().split(/\s+/);
  const unique = [...new Set(words.map(w => w.replace(/[^a-z]/g, '')).filter(w => w.length > 2))];
  return unique.slice(0, 12);
}

function extractEmotions(text) {
  const emotions = ['happy', 'sad', 'angry', 'afraid', 'proud', 'worried', 'excited', 'tired', 'surprised', 'confused', 'brave', 'grateful', 'disappointed', 'curious', 'nervous', 'confident', 'determined'];
  const lower = text.toLowerCase();
  return emotions.filter(e => lower.includes(e));
}

function genId() {
  return `story_${String(storyIdCounter++).padStart(3, '0')}`;
}

// Level 1 story generators (simple, 4-5 sentences, basic vocabulary)
function createLevel1Story() {
  const isBoy = Math.random() > 0.5;
  const idx = Math.floor(Math.random() * (isBoy ? BOYS.length : GIRLS.length));
  const name = isBoy ? BOYS[idx] : GIRLS[idx];
  const heName = isBoy ? HEBREW_BOYS[idx] : HEBREW_GIRLS[idx];
  const pronoun = isBoy ? 'He' : 'She';

  const templates = [
    {
      en: `${name} has a new ball. ${pronoun} plays with it outside. The ball is red and big. ${pronoun} kicks the ball far. ${name} runs after it.`,
      he: `ל${heName} יש כדור חדש. הוא משחק איתו בחוץ. הכדור אדום וגדול. הוא בועט את הכדור רחוק. ${heName} רץ אחריו.`,
      theme: 'play',
      question: 'מה צבע הכדור?',
      questionEn: 'What color is the ball?',
      answers: ['אדום', 'כחול', 'ירוק', 'צהוב'],
      answersEn: ['Red', 'Blue', 'Green', 'Yellow']
    },
    {
      en: `${name} eats an apple. The apple is sweet. ${pronoun} likes it very much. ${pronoun} eats more. ${name} is happy.`,
      he: `${heName} אוכל תפוח. התפוח מתוק. הוא אוהב אותו מאוד. הוא אוכל עוד. ${heName} שמח.`,
      theme: 'food',
      question: `מה ${heName} אוכל?`,
      questionEn: `What does ${heName} eat?`,
      answers: ['תפוח', 'בננה', 'תפוז', 'ענבים'],
      answersEn: ['Apple', 'Banana', 'Orange', 'Grapes']
    },
    {
      en: `${name} sees a little bird. The bird is blue. It sings a song. ${name} listens carefully. ${pronoun} likes the song.`,
      he: `${heName} רואה ציפור קטנה. הציפור כחולה. היא שרה שיר. ${heName} מקשיב בזהירות. הוא אוהב את השיר.`,
      theme: 'nature',
      question: 'איזה צבע הציפור?',
      questionEn: 'What color is the bird?',
      answers: ['כחול', 'אדום', 'ירוק', 'צהוב'],
      answersEn: ['Blue', 'Red', 'Green', 'Yellow']
    },
    {
      en: `${name} has a pet cat. The cat is soft and warm. ${pronoun} pets the cat gently. The cat purrs. ${name} smiles.`,
      he: `ל${heName} יש חתול מחמד. החתול רך וחם. הוא מלטף את החתול בעדינות. החתול מגרגר. ${heName} מחייך.`,
      theme: 'pets',
      question: `איזה חיית מחמד יש ל${heName}?`,
      questionEn: `What pet does ${heName} have?`,
      answers: ['חתול', 'כלב', 'ארנב', 'דג'],
      answersEn: ['Cat', 'Dog', 'Rabbit', 'Fish']
    },
    {
      en: `${name} reads a book. The book has many pictures. ${pronoun} looks at each picture. The story is fun. ${name} loves reading.`,
      he: `${heName} קורא ספר. לספר יש הרבה תמונות. הוא מסתכל על כל תמונה. הסיפור כיף. ${heName} אוהב לקרוא.`,
      theme: 'reading',
      question: 'מה יש בספר?',
      questionEn: 'What does the book have?',
      answers: ['הרבה תמונות', 'הרבה עמודים', 'הרבה מילים', 'הרבה צבעים'],
      answersEn: ['Many pictures', 'Many pages', 'Many words', 'Many colors']
    }
  ];

  const t = pick(templates);
  return {
    id: genId(),
    title: t.theme.charAt(0).toUpperCase() + t.theme.slice(1),
    titleEn: t.theme.charAt(0).toUpperCase() + t.theme.slice(1),
    text: t.en,
    hebrewTranslation: t.he,
    difficulty: 1,
    wordCount: wordCount(t.en),
    sentences: sentenceCount(t.en),
    vocabularyIds: extractVocab(t.en),
    emotionWords: extractEmotions(t.en),
    themes: [t.theme],
    comprehensionQuestion: t.question,
    comprehensionQuestionEn: t.questionEn,
    answerOptions: t.answers,
    answerOptionsEn: t.answersEn,
    correctAnswerIndex: 0
  };
}

// Level 2 story generators (compound sentences, slightly more complex)
function createLevel2Story() {
  const isBoy = Math.random() > 0.5;
  const idx = Math.floor(Math.random() * (isBoy ? BOYS.length : GIRLS.length));
  const name = isBoy ? BOYS[idx] : GIRLS[idx];
  const heName = isBoy ? HEBREW_BOYS[idx] : HEBREW_GIRLS[idx];
  const pronoun = isBoy ? 'He' : 'She';

  const friendIdx = Math.floor(Math.random() * (isBoy ? GIRLS.length : BOYS.length));
  const friend = isBoy ? GIRLS[friendIdx] : BOYS[friendIdx];
  const friendHe = isBoy ? HEBREW_GIRLS[friendIdx] : HEBREW_BOYS[friendIdx];

  const templates = [
    {
      en: `${name} wants to ride a bike, but ${pronoun} does not know how. ${friend} sees ${name} trying and offers to help. They practice together every day. After one week, ${name} can ride well. ${pronoun} feels proud of this achievement.`,
      he: `${heName} רוצה לרכוב על אופניים, אבל הוא לא יודע איך. ${friendHe} רואה את ${heName} מנסה ומציע לעזור. הם מתאמנים יחד כל יום. אחרי שבוע אחד, ${heName} יכול לרכוב טוב. הוא מרגיש גאה בהישג הזה.`,
      theme: 'learning',
      question: `מי עוזר ל${heName} ללמוד לרכוב?`,
      questionEn: `Who helps ${name} learn to ride?`,
      answers: [friendHe, 'המורה', 'אמא', 'אבא'],
      answersEn: [friend, 'Teacher', 'Mom', 'Dad']
    },
    {
      en: `${name} finds a wallet on the street. ${pronoun} opens it and finds money inside. ${pronoun} looks around and sees a worried man. ${name} gives the wallet to the man. The man thanks ${name} with a big smile.`,
      he: `${heName} מוצא ארנק ברחוב. הוא פותח אותו ומוצא כסף בפנים. הוא מסתכל מסביב ורואה גבר מודאג. ${heName} נותן את הארנק לגבר. הגבר מודה ל${heName} בחיוך גדול.`,
      theme: 'honesty',
      question: `מה ${heName} מוצא ברחוב?`,
      questionEn: `What does ${name} find on the street?`,
      answers: ['ארנק', 'כסף', 'טלפון', 'מפתח'],
      answersEn: ['Wallet', 'Money', 'Phone', 'Key']
    },
    {
      en: `${name} and ${friend} want to play together. ${name} wants to play soccer, but ${friend} wants to draw. They decide to take turns. First they play soccer, then they draw pictures. Both of them are happy.`,
      he: `${heName} ו${friendHe} רוצים לשחק יחד. ${heName} רוצה לשחק כדורגל, אבל ${friendHe} רוצה לצייר. הם מחליטים לעשות תורות. קודם הם משחקים כדורגל, אז הם מציירים תמונות. שניהם שמחים.`,
      theme: 'friendship',
      question: 'איך הם פותרים את הבעיה שלהם?',
      questionEn: 'How do they solve their problem?',
      answers: ['הם עושים תורות', 'הם לא משחקים', 'הם רבים', 'הם הולכים הביתה'],
      answersEn: ['They take turns', 'They do not play', 'They fight', 'They go home']
    },
    {
      en: `${name} helps mother make dinner. First they wash the vegetables. Then they cut them carefully. After that, they cook everything together. The food tastes delicious, and the family enjoys the meal.`,
      he: `${heName} עוזר לאמא שלו להכין ארוחת ערב. קודם הם שוטפים את הירקות. אז הם חותכים אותם בזהירות. אחרי זה, הם מבשלים הכל ביחד. האוכל טעים מאוד, והמשפחה נהנית מהארוחה.`,
      theme: 'family',
      question: `מה ${heName} עוזר להכין?`,
      questionEn: `What does ${name} help prepare?`,
      answers: ['ארוחת ערב', 'ארוחת בוקר', 'עוגה', 'כריכים'],
      answersEn: ['Dinner', 'Breakfast', 'Cake', 'Sandwiches']
    }
  ];

  const t = pick(templates);
  return {
    id: genId(),
    title: t.theme.charAt(0).toUpperCase() + t.theme.slice(1),
    titleEn: t.theme.charAt(0).toUpperCase() + t.theme.slice(1),
    text: t.en,
    hebrewTranslation: t.he,
    difficulty: 2,
    wordCount: wordCount(t.en),
    sentences: sentenceCount(t.en),
    vocabularyIds: extractVocab(t.en),
    emotionWords: extractEmotions(t.en),
    themes: [t.theme],
    comprehensionQuestion: t.question,
    comprehensionQuestionEn: t.questionEn,
    answerOptions: t.answers,
    answerOptionsEn: t.answersEn,
    correctAnswerIndex: 0
  };
}

// Level 4 story generators (complex sentences, abstract themes)
function createLevel4Story() {
  const isBoy = Math.random() > 0.5;
  const idx = Math.floor(Math.random() * (isBoy ? BOYS.length : GIRLS.length));
  const name = isBoy ? BOYS[idx] : GIRLS[idx];
  const heName = isBoy ? HEBREW_BOYS[idx] : HEBREW_GIRLS[idx];
  const pronoun = isBoy ? 'He' : 'She';

  const templates = [
    {
      en: `When ${name} learns about the problem of plastic pollution in the ocean, ${pronoun.toLowerCase()} decides to take action. First, ${pronoun.toLowerCase()} researches how plastic affects sea animals. Then, ${pronoun.toLowerCase()} organizes a beach cleanup with classmates. Together, they collect over fifty bags of trash. The project demonstrates how young people can make a significant difference in their community.`,
      he: `כש${heName} לומד על הבעיה של זיהום פלסטיק באוקיינוס, הוא מחליט לפעול. קודם, הוא חוקר איך פלסטיק משפיע על חיות ים. אז, הוא מארגן ניקיון חוף עם חברי הכיתה. יחד, הם אוספים יותר מחמישים שקיות זבל. הפרויקט מדגים איך צעירים יכולים לעשות הבדל משמעותי בקהילה שלהם.`,
      theme: 'environment',
      question: `מה ${heName} מארגן כדי לעזור?`,
      questionEn: `What does ${name} organize to help?`,
      answers: ['ניקיון חוף', 'הרצאה', 'תחרות', 'מסיבה'],
      answersEn: ['Beach cleanup', 'Lecture', 'Competition', 'Party']
    },
    {
      en: `${name} is chosen to be the team leader for the science project. At first, it is difficult to get everyone to agree on what to do. ${pronoun} listens carefully to each team member's ideas. Eventually, ${pronoun} helps the team find a solution that combines everyone's suggestions. The team succeeds because ${name} showed good leadership skills.`,
      he: `${heName} נבחר להיות מנהיג הצוות לפרויקט המדע. בהתחלה, קשה לגרום לכולם להסכים על מה לעשות. הוא מקשיב בזהירות לרעיונות של כל חבר צוות. בסופו של דבר, הוא עוזר לצוות למצוא פתרון שמשלב את ההצעות של כולם. הצוות מצליח כי ${heName} הראה כישורי מנהיגות טובים.`,
      theme: 'leadership',
      question: 'למה הצוות מצליח?',
      questionEn: 'Why does the team succeed?',
      answers: ['בגלל מנהיגות טובה', 'בגלל מזל', 'בגלל המורה', 'בגלל כסף'],
      answersEn: ['Because of good leadership', 'Because of luck', 'Because of the teacher', 'Because of money']
    },
    {
      en: `${name} faces a difficult choice between joining the soccer team or the music club. Both activities have benefits, and ${pronoun.toLowerCase()} enjoys them equally. After thinking about goals and talking with family, ${name} chooses music. Although soccer would have been fun, ${pronoun} feels confident that this choice is right for personal growth.`,
      he: `${heName} עומד בפני בחירה קשה בין להצטרף לקבוצת כדורגל או למועדון מוזיקה. לשתי הפעילויות יש יתרונות, והוא נהנה מהן באותה מידה. אחרי שחושב על מטרות ומדבר עם המשפחה, ${heName} בוחר במוזיקה. למרות שכדורגל היה יכול להיות כיף, הוא מרגיש בטוח שהבחירה הזו נכונה לצמיחה אישית.`,
      theme: 'decision',
      question: `מה ${heName} בוחר בסוף?`,
      questionEn: `What does ${name} choose in the end?`,
      answers: ['מועדון מוזיקה', 'קבוצת כדורגל', 'שניהם', 'אף אחד'],
      answersEn: ['Music club', 'Soccer team', 'Both', 'Neither']
    }
  ];

  const t = pick(templates);
  return {
    id: genId(),
    title: t.theme.charAt(0).toUpperCase() + t.theme.slice(1),
    titleEn: t.theme.charAt(0).toUpperCase() + t.theme.slice(1),
    text: t.en,
    hebrewTranslation: t.he,
    difficulty: 4,
    wordCount: wordCount(t.en),
    sentences: sentenceCount(t.en),
    vocabularyIds: extractVocab(t.en),
    emotionWords: extractEmotions(t.en),
    themes: [t.theme],
    comprehensionQuestion: t.question,
    comprehensionQuestionEn: t.questionEn,
    answerOptions: t.answers,
    answerOptionsEn: t.answersEn,
    correctAnswerIndex: 0
  };
}

// Level 5 story generators (advanced vocabulary, complex themes)
function createLevel5Story() {
  const isBoy = Math.random() > 0.5;
  const idx = Math.floor(Math.random() * (isBoy ? BOYS.length : GIRLS.length));
  const name = isBoy ? BOYS[idx] : GIRLS[idx];
  const heName = isBoy ? HEBREW_BOYS[idx] : HEBREW_GIRLS[idx];
  const pronoun = isBoy ? 'He' : 'She';

  const templates = [
    {
      en: `${name} participates in a research project investigating renewable energy sources. The investigation requires collecting data, analyzing results, and drawing conclusions based on evidence. Through careful experimentation, ${name} discovers that solar panel efficiency varies depending on their angle relative to the sun. This finding leads ${pronoun.toLowerCase()} to propose an innovative tracking system. The experience demonstrates that scientific inquiry requires both methodology and creativity.`,
      he: `${heName} משתתף בפרויקט מחקר שחוקר מקורות אנרגיה מתחדשים. החקירה דורשת איסוף נתונים, ניתוח תוצאות והסקת מסקנות על סמך ראיות. דרך ניסויים זהירים, ${heName} מגלה שיעילות פאנלים סולאריים משתנה בהתאם לזווית שלהם ביחס לשמש. התגלית הזו מובילה אותו להציע מערכת מעקב חדשנית. החוויה מדגימה שחקירה מדעית דורשת גם מתודולוגיה וגם יצירתיות.`,
      theme: 'science',
      question: `מה התגלית של ${heName}?`,
      questionEn: `What is ${name}'s discovery?`,
      answers: ['יעילות הפאנלים תלויה בזווית', 'פאנלים לא עובדים', 'השמש לא חשובה', 'אנרגיה לא חשובה'],
      answersEn: ['Panel efficiency depends on angle', 'Panels do not work', 'The sun is not important', 'Energy is not important']
    },
    {
      en: `${name} reads extensively about climate change and becomes concerned about its global impact. After researching various perspectives, ${pronoun.toLowerCase()} understands that this complex problem requires international cooperation. ${name} realizes that while individual actions matter, systemic change is necessary. This knowledge motivates ${pronoun.toLowerCase()} to think about future career choices that could contribute to solutions.`,
      he: `${heName} קורא בהרחבה על שינויי אקלים ומודאג לגבי ההשפעה הגלובלית שלו. אחרי מחקר של נקודות מבט שונות, הוא מבין שהבעיה המורכבת הזו דורשת שיתוף פעולה בינלאומי. ${heName} מבין שבעוד פעולות אישיות חשובות, שינוי מערכתי הכרחי. הידע הזה מניע אותו לחשוב על בחירות קריירה עתידיות שיכולות לתרום לפתרונות.`,
      theme: 'global',
      question: `מה ${heName} מבין על בעיות גלובליות?`,
      questionEn: `What does ${name} understand about global problems?`,
      answers: ['דורשות שיתוף פעולה בינלאומי', 'קל לפתור לבד', 'לא חשובות', 'רק מבוגרים יכולים לעזור'],
      answersEn: ['Require international cooperation', 'Easy to solve alone', 'Not important', 'Only adults can help']
    },
    {
      en: `${name} encounters an ethical dilemma when ${pronoun.toLowerCase()} discovers that a friend has been cheating on tests. The friend asks ${name} to keep this secret. ${name} carefully considers the values of honesty, loyalty, and fairness. After reflection, ${pronoun.toLowerCase()} decides to encourage the friend to tell the truth. The situation teaches ${name} that ethical choices are sometimes difficult but necessary for personal integrity.`,
      he: `${heName} נתקל בדילמה אתית כשהוא מגלה שחבר שלו רימה במבחנים. החבר מבקש מ${heName} לשמור את הסוד הזה. ${heName} שוקל בזהירות את הערכים של כנות, נאמנות והוגנות. אחרי הרהור, הוא מחליט לעודד את החבר לומר את האמת. המצב מלמד את ${heName} שבחירות אתיות לפעמים קשות אבל הכרחיות ליושרה אישית.`,
      theme: 'ethics',
      question: `מה ${heName} מחליט לעשות?`,
      questionEn: `What does ${name} decide to do?`,
      answers: ['לעודד את החבר לומר אמת', 'לספר למורה', 'לשמור את הסוד', 'להתעלם'],
      answersEn: ['Encourage the friend to tell the truth', 'Tell the teacher', 'Keep the secret', 'Ignore it']
    }
  ];

  const t = pick(templates);
  return {
    id: genId(),
    title: t.theme.charAt(0).toUpperCase() + t.theme.slice(1),
    titleEn: t.theme.charAt(0).toUpperCase() + t.theme.slice(1),
    text: t.en,
    hebrewTranslation: t.he,
    difficulty: 5,
    wordCount: wordCount(t.en),
    sentences: sentenceCount(t.en),
    vocabularyIds: extractVocab(t.en),
    emotionWords: extractEmotions(t.en),
    themes: [t.theme],
    comprehensionQuestion: t.question,
    comprehensionQuestionEn: t.questionEn,
    answerOptions: t.answers,
    answerOptionsEn: t.answersEn,
    correctAnswerIndex: 0
  };
}

// Main execution
const storiesPath = path.join(__dirname, '../public/stories.json');

// Read existing stories
const existingStories = JSON.parse(fs.readFileSync(storiesPath, 'utf8'));
const maxId = Math.max(...existingStories.map(s => parseInt(s.id.split('_')[1])));
storyIdCounter = maxId + 1;

console.log('Current stories:', existingStories.length);
console.log('Max ID:', maxId);

// Count by level
const byLevel = {};
existingStories.forEach(s => {
  byLevel[s.difficulty] = (byLevel[s.difficulty] || 0) + 1;
});
console.log('Current distribution:', JSON.stringify(byLevel));

// Generate new stories to balance levels
const targetPerLevel = {
  1: 50,  // Currently 6, need more
  2: 50,  // Currently 27, need more
  4: 50,  // Currently 0, need all
  5: 50   // Currently 0, need all
};

const newStories = [];

for (const [level, target] of Object.entries(targetPerLevel)) {
  const levelNum = parseInt(level);
  const current = byLevel[levelNum] || 0;
  const needed = Math.max(0, target - current);

  if (needed > 0) {
    console.log(`Generating ${needed} stories for level ${levelNum}...`);
    for (let i = 0; i < needed; i++) {
      if (levelNum === 1) {
        newStories.push(createLevel1Story());
      } else if (levelNum === 2) {
        newStories.push(createLevel2Story());
      } else if (levelNum === 4) {
        newStories.push(createLevel4Story());
      } else if (levelNum === 5) {
        newStories.push(createLevel5Story());
      }
    }
  }
}

// Combine and save
const allStories = [...existingStories, ...newStories];
fs.writeFileSync(storiesPath, JSON.stringify(allStories, null, 2));

console.log(`Generated ${newStories.length} new stories`);
console.log('Total stories:', allStories.length);

// New distribution
const newByLevel = {};
allStories.forEach(s => {
  newByLevel[s.difficulty] = (newByLevel[s.difficulty] || 0) + 1;
});
console.log('New distribution:', JSON.stringify(newByLevel));
