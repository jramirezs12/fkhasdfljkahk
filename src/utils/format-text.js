// ----------------------------------------------------------------------

export function getInitialsFromFirstAndLastWord(str) {
  if (!str) return "?";

  const words = str.trim().split(/\s+/);
  const firstInitial = words[0][0].toUpperCase();
  const lastInitial = words.length == 1 ? '' : words[words.length - 1][0].toUpperCase();

  return firstInitial + lastInitial;
}