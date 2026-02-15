const fs = require('fs');
const path = require('path');

const storiesPath = path.join(__dirname, '../public/stories.json');
const stories = JSON.parse(fs.readFileSync(storiesPath, 'utf8'));

console.log('Original stories:', stories.length);

// Remove duplicates based on text content
const seen = new Set();
const uniqueStories = [];
const duplicates = [];

stories.forEach(s => {
  const key = s.text.trim().toLowerCase();
  if (!seen.has(key)) {
    seen.add(key);
    uniqueStories.push(s);
  } else {
    duplicates.push(s.id);
  }
});

console.log('Duplicates removed:', duplicates.length);

// Limit stories per level
const MAX_PER_LEVEL = {
  1: 50,
  2: 50,
  3: 100,  // Reduce from 451 to 100
  4: 50,
  5: 50
};

const byLevel = {};
uniqueStories.forEach(s => {
  if (!byLevel[s.difficulty]) byLevel[s.difficulty] = [];
  byLevel[s.difficulty].push(s);
});

// Shuffle and limit each level
function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const finalStories = [];
const finalByLevel = {};

Object.keys(byLevel).sort().forEach(level => {
  const levelStories = byLevel[level];
  const max = MAX_PER_LEVEL[level] || 50;
  const shuffled = shuffle(levelStories);
  const limited = shuffled.slice(0, max);
  finalByLevel[level] = limited.length;
  finalStories.push(...limited);
});

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

console.log('\nFinal stories:', finalStories.length);
console.log('Final distribution:', JSON.stringify(finalByLevel));
console.log('\nSaved to public/stories.json');
