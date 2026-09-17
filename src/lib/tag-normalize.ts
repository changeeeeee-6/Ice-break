/**
 * Tag name normalization utility
 * Handles: case, full-width/half-width, CJK punctuation, whitespace
 */

// Full-width to half-width mapping
function fullWidthToHalfWidth(str: string): string {
  return str.replace(/[\uff01-\uff5e]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) - 0xfee0)
  );
}

// Normalize CJK punctuation to ASCII equivalents
function normalizeCjkPunctuation(str: string): string {
  const map: Record<string, string> = {
    '\u3002': '.',  // 。 → .
    '\uff0c': ',',  // ， → ,
    '\u3001': ',',  // 、 → ,
    '\uff1a': ':',  // ： → :
    '\uff1b': ';',  // ； → ;
    '\uff01': '!',  // ！ → !
    '\uff1f': '?',  // ？ → ?
    '\uff08': '(',  // （ → (
    '\uff09': ')',  // ） → )
    '\u3010': '[',  // 【 → [
    '\u3011': ']',  // 】 → ]
    '\u201c': '"',  // " → "
    '\u201d': '"',  // " → "
    '\u2018': "'",  // ' → '
    '\u2019': "'",  // ' → '
    '\u300a': '<',  // 《 → <
    '\u300b': '>',  // 》 → >
    '\u00b7': '-',  // · → -
    '\u2014': '-',  // — → -
    '\u2026': '...', // … → ...
  };
  let result = str;
  for (const [cjk, ascii] of Object.entries(map)) {
    result = result.split(cjk).join(ascii);
  }
  return result;
}

// Normalize full-width space to regular space
function normalizeSpaces(str: string): string {
  return str.replace(/\u3000/g, ' ');
}

/**
 * Normalize a tag name for deduplication comparison.
 * - Trim whitespace
 * - Full-width → half-width (letters, digits, punctuation)
 * - CJK punctuation → ASCII equivalents
 * - Lowercase
 * - Collapse multiple spaces to single space
 */
export function normalizeTagName(name: string): string {
  let result = name.trim();
  result = fullWidthToHalfWidth(result);
  result = normalizeCjkPunctuation(result);
  result = normalizeSpaces(result);
  result = result.toLowerCase();
  result = result.replace(/\s+/g, ' ').trim();
  return result;
}
