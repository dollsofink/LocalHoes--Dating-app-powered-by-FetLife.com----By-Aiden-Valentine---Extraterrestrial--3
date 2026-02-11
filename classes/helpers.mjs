/**
 * Ensures the input is an array, converting a single string into a single-item array if necessary.
 * @param {string|string[]} input The variable to check and convert.
 * @returns {string[]} The resulting array.
 */
export function ensureArray(input) {
  if (typeof input === 'string') {
    return [input];
  }
  // Optional: check if it's an array for robustness, though if it's not a string, it might be something else
  if (Array.isArray(input)) {
    return input;
  }
  // Handle other potential data types (e.g., null, undefined, number, object)
  // You might want to return an empty array, the value wrapped in an array, or throw an error depending on requirements.
  // Returning an empty array for null/undefined is a common pattern:
  if (input === null || typeof input === 'undefined') {
    return [];
  }
  return [input]; 
}

/**
 * Creates a comma-separated string of question marks.
 * @param {number} count The number of question marks to generate.
 * @returns {string} A string like '?, ?, ?'.
 */
export function createQuestionMarkString(count) {
  if (count <= 0) {
    return '';
  }
  // Creates an array of 'count' length, fills it with '?', and joins with ', '
  return Array(count).fill('?').join(', ');
}