/**
 * Heuristic gibberish detector.
 *
 * Returns true if the message is considered gibberish / non-responsive.
 * Rules (any one match = gibberish):
 *  1. Extremely short (≤ 2 non-space chars)
 *  2. No vowels in a string longer than 4 chars (e.g. "jkdls", "qwerty")
 *  3. Character repetition ratio > 60% (e.g. "aaaaaa", "hahahahaha" — but NOT real words)
 *  4. Truly random alphanum strings (high consonant-cluster density)
 *  5. Common non-responses: ".", "...", "?", "-", "n/a", "idk" alone, etc.
 */

const NON_RESPONSE_TOKENS = new Set([
  '.', '..', '...', '....', '?', '??', '-', '--', 'na', 'n/a',
  'idk', 'dunno', 'nvm', 'lol', 'huh', '😂', '😑', '🙄',
  'nothing', 'none', 'skip', 'pass', 'bye', 'exit', 'quit', 'stop',
]);

/**
 * @param {string} message
 * @returns {boolean}
 */
function isGibberish(message) {
  if (typeof message !== 'string') return true;

  const trimmed = message.trim().toLowerCase();

  // Rule 1 — too short
  const nonSpace = trimmed.replace(/\s+/g, '');
  if (nonSpace.length <= 2) return true;

  // Rule 2 — known non-response tokens
  if (NON_RESPONSE_TOKENS.has(nonSpace)) return true;

  // Rule 3 — single repeated character (e.g. "aaaa", "!!!!")
  if (/^(.)\1{3,}$/.test(nonSpace)) return true;

  // Rule 4 — no vowels in a word longer than 4 chars (catches "sdfjk", "qwrtty")
  const words = trimmed.split(/\s+/);
  const longWordsWithNoVowels = words.filter(
    (w) => w.length > 4 && !/[aeiou]/i.test(w)
  );
  if (longWordsWithNoVowels.length > 0 && longWordsWithNoVowels.length === words.length) {
    return true;
  }

  // Rule 5 — very high character repetition ratio (e.g. "hahahahaha" — but allow "yes please")
  const charFreq = {};
  for (const c of nonSpace) {
    if (/[a-z]/i.test(c)) charFreq[c] = (charFreq[c] || 0) + 1;
  }
  const letters = Object.values(charFreq);
  if (letters.length > 0) {
    const maxFreq = Math.max(...letters);
    const ratio = maxFreq / nonSpace.replace(/[^a-z]/gi, '').length;
    if (ratio > 0.7 && nonSpace.length > 5) return true;
  }

  return false;
}

module.exports = { isGibberish };
