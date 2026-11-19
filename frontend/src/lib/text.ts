/** First letter of the first and last words, uppercased: `"Ada Lovelace"` → `"AL"`. */
export function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const first = words[0];
  const last = words.length > 1 ? words[words.length - 1] : undefined;
  return [first, last]
    .map((word) => (word ? ([...word][0] ?? '') : ''))
    .join('')
    .toLocaleUpperCase('en');
}
