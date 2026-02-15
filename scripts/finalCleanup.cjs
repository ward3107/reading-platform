const fs = require('fs');
const path = require('path');

const storiesPath = path.join(__dirname, '../public/stories.json');
let stories = JSON.parse(fs.readFileSync(storiesPath, 'utf8'));

console.log('Starting stories:', stories.length);

// 1. Remove stories with duplicate TEXT content
const seenText = new Set();
stories = stories.filter(s => {
  const key = s.text.trim().toLowerCase();
  if (seenText.has(key)) return false;
  seenText.add(key);
  return true;
});
console.log('After removing duplicate text:', stories.length);

// 2. Remove stories with duplicate TITLE (same titleEn and title)
const seenTitle = new Set();
stories = stories.filter(s => {
  const key = (s.titleEn || '') + '|' + (s.title || '');
  if (seenTitle.has(key)) return false;
  seenTitle.add(key);
  return true;
});
console.log('After removing duplicate titles:', stories.length);

// 3. Keep only the original good stories (story_001 to story_484 range)
// These are the original stories from the first 484
const originalStories = stories.filter(s => {
  const num = parseInt(s.id.split('_')[1]);
  return num <= 484;
});

console.log('Original stories (ID <= 484):', originalStories.length);

// Count by level
const byLevel = {};
originalStories.forEach(s => {
  byLevel[s.difficulty] = (byLevel[s.difficulty] || 0) + 1;
});
console.log('Original distribution:', JSON.stringify(byLevel));

// 4. If we need more stories, keep some generated ones that are unique
const generatedStories = stories.filter(s => {
  const num = parseInt(s.id.split('_')[1]);
  return num > 484;
});

console.log('Generated stories available:', generatedStories.length);

// Limit per level
const MAX_PER_LEVEL = { 1: 50, 2: 50, 3: 100, 4: 50, 5: 50 };
const finalByLevel = {};
const finalStories = [];

Object.keys(MAX_PER_LEVEL).forEach(level => {
  const levelNum = parseInt(level);
  const original = originalStories.filter(s => s.difficulty === levelNum);
  const generated = generatedStories.filter(s => s.difficulty === levelNum);

  // Shuffle generated
  const shuffled = generated.sort(() => Math.random() - 0.5);

  // Combine original + generated up to max
  const combined = [...original, ...shuffled].slice(0, MAX_PER_LEVEL[levelNum]);
  finalByLevel[levelNum] = combined.length;
  finalStories.push(...combined);
});

console.log('Final distribution:', JSON.stringify(finalByLevel));
console.log('Final total:', finalStories.length);

// Re-index IDs
finalStories.sort((a, b) => {
  const aNum = parseInt(a.id.split('_')[1]);
  const bNum = parseInt(b.id.split('_')[1]);
  return aNum - bNum;
});

finalStories.forEach((s, i) => {
  s.id = `story_${String(i + 1).padStart(3, '0')}`;
});

// Save
fs.writeFileSync(storiesPath, JSON.stringify(finalStories, null, 2));
console.log('\nSaved cleaned stories to public/stories.json');
