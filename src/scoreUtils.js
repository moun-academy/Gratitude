/**
 * Represents a single daily prompt response.
 * @typedef {Object} Response
 * @property {string} label - Human-friendly label for the prompt.
 * @property {('yes'|'no'|'fortunate'|'unfortunate')} answer - User response.
 * @property {number} importance - Relative weight from 1-5.
 */

/**
 * Calculate a weighted gratitude score.
 *
 * The score is the percentage of affirmative/fortunate responses weighted
 * by their importance. Non-affirmative responses count toward the total
 * possible weight but not the earned weight.
 *
 * @param {Response[]} responses
 * @returns {{ score: number, positiveWeight: number, totalWeight: number }}
 */
export function calculateWeightedScore(responses) {
  if (!Array.isArray(responses) || responses.length === 0) {
    return { score: 0, positiveWeight: 0, totalWeight: 0 };
  }

  const { positiveWeight, totalWeight } = responses.reduce(
    (acc, { answer, importance }) => {
      const weight = Number(importance) || 0;
      if (weight <= 0) return acc;

      const positive = answer === 'yes' || answer === 'fortunate';
      return {
        positiveWeight: acc.positiveWeight + (positive ? weight : 0),
        totalWeight: acc.totalWeight + weight,
      };
    },
    { positiveWeight: 0, totalWeight: 0 }
  );

  const score = totalWeight === 0 ? 0 : Math.round((positiveWeight / totalWeight) * 100);
  return { score, positiveWeight, totalWeight };
}
