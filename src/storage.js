const STORAGE_KEY = 'gratitude-scores';

/**
 * @typedef {Object} DailyScore
 * @property {string} date ISO date string (yyyy-mm-dd)
 * @property {number} score Percentage score for the day
 */

function safeLoad() {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.warn('Unable to load stored scores', error);
    return [];
  }
}

function safeSave(data) {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.warn('Unable to save scores', error);
  }
}

export function getScores() {
  return safeLoad();
}

export function saveDailyScore(score, date = new Date()) {
  const currentDate = new Date(date);
  const todayKey = currentDate.toISOString().slice(0, 10);
  const scores = safeLoad();
  const existingIndex = scores.findIndex((entry) => entry.date === todayKey);

  if (existingIndex >= 0) {
    scores[existingIndex].score = score;
  } else {
    scores.push({ date: todayKey, score });
  }

  const sorted = scores
    .filter((entry) => typeof entry.score === 'number')
    .sort((a, b) => a.date.localeCompare(b.date));

  safeSave(sorted);
  return sorted;
}

export function computeRollingAverage(days) {
  const window = Math.max(1, Math.min(Number(days) || 1, 365));
  const scores = safeLoad();
  if (scores.length === 0) return 0;

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - (window - 1));
  const total = scores.reduce(
    (acc, entry) => {
      const entryDate = new Date(entry.date);
      if (entryDate >= cutoff) {
        return { sum: acc.sum + Number(entry.score || 0), count: acc.count + 1 };
      }
      return acc;
    },
    { sum: 0, count: 0 }
  );

  if (total.count === 0) return 0;
  return Math.round(total.sum / total.count);
}
