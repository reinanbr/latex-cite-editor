/**
 * BibTeX exported from Google Scholar (and most reference managers) escapes
 * accented letters as LaTeX accent macros — `{\^o}`, `{\'e}`, `{\c c}` — instead
 * of the actual UTF-8 character. Left alone, "dem{\^o}nios" renders literally
 * as "dem\^onios" instead of "demônios". This converts the common macros back
 * to real Unicode text for display.
 */

// Diacritics written as a single non-letter symbol right after the backslash
// (a TeX "control symbol"), so no separator is required: \^o, \^{o}, {\^o}.
const SYMBOL_ACCENTS: Record<string, string> = {
  '`': '̀', // grave
  "'": '́', // acute
  '^': '̂', // circumflex
  '"': '̈', // diaeresis / umlaut
  '~': '̃', // tilde
  '=': '̄', // macron
  '.': '̇', // dot above
};

// Diacritics written as a letter-named macro (a TeX "control word"), which
// requires a separator (space or braces) before the argument: \v{c}, \c c.
const LETTER_ACCENTS: Record<string, string> = {
  u: '̆', // breve
  v: '̌', // caron / háček
  H: '̋', // double acute
  c: '̧', // cedilla
  k: '̨', // ogonek
  r: '̊', // ring above
  b: '̱', // macron below
  d: '̣', // dot below
};

// Letters/ligatures with no accentable base character, so no combining mark applies.
const LIGATURES: Record<string, string> = {
  ss: 'ß',
  aa: 'å',
  AA: 'Å',
  oe: 'œ',
  OE: 'Œ',
  ae: 'æ',
  AE: 'Æ',
  o: 'ø',
  O: 'Ø',
  l: 'ł',
  L: 'Ł',
};

// Backslash-escaped punctuation that's only special because of LaTeX/BibTeX syntax.
const ESCAPED_SYMBOLS: Record<string, string> = {
  '&': '&',
  '%': '%',
  _: '_',
  '#': '#',
  $: '$',
  '{': '{',
  '}': '}',
};

// Standalone `\text...` symbol macros with no accentable base character.
const TEXT_SYMBOLS: Record<string, string> = {
  ordmasculine: 'º',
  ordfeminine: 'ª',
};

const SYMBOL_ACCENT_RE = /\\([`'^"~=.])\{?([a-zA-Z])\}?/g;
const LETTER_ACCENT_RE = /\\(u|v|H|c|k|r|b|d)(?:\{([a-zA-Z])\}|\s+([a-zA-Z])\b)/g;
// TeX control words swallow exactly one trailing space (their normal argument
// separator), so `\OE uvres` renders as one word, "Œuvres" — not "Œ uvres".
const LIGATURE_RE = /\\(ss|aa|AA|oe|OE|ae|AE|o|O|l|L)(?![a-zA-Z]) ?/g;
const ESCAPED_SYMBOL_RE = /\\([&%_#$}{])/g;
const TEXT_SYMBOL_RE = /\\text(ordmasculine|ordfeminine)\b/g;
const URL_MACRO_RE = /\\url\{([^}]*)\}/g;
// `\i` / `\j` (dotless i/j) exist so accents have a base letter to sit on,
// e.g. `{\'\i}` for "í" — most commonly seen from BibTeX exported by
// reference managers. Resolve them to a plain letter before the accent
// regexes run, so `\'\i` composes into "í" like `\'i` already does.
const DOTLESS_RE = /\\([ij])(?![a-zA-Z])/g;

/**
 * Converts LaTeX accent macros and escaped symbols in BibTeX field text
 * (author/title/journal/...) into plain Unicode, then strips any leftover
 * `{...}` grouping braces (commonly used to protect capitalization).
 */
export function cleanLatexText(value: string): string {
  if (!value) return value;

  let text = value;

  // Unwrap \url{...} first so its contents skip every macro substitution below.
  text = text.replace(URL_MACRO_RE, (_match, url: string) => url);

  text = text.replace(DOTLESS_RE, (_match, letter: string) => letter);

  text = text.replace(SYMBOL_ACCENT_RE, (match, cmd: string, letter: string) => {
    const mark = SYMBOL_ACCENTS[cmd];
    if (!mark || !letter) return match;
    return (letter + mark).normalize('NFC');
  });

  text = text.replace(LETTER_ACCENT_RE, (match, cmd: string, braced?: string, spaced?: string) => {
    const mark = LETTER_ACCENTS[cmd];
    const letter = braced ?? spaced;
    if (!mark || !letter) return match;
    return (letter + mark).normalize('NFC');
  });

  text = text.replace(LIGATURE_RE, (match, cmd: string) => LIGATURES[cmd] ?? match);
  text = text.replace(ESCAPED_SYMBOL_RE, (match, sym: string) => ESCAPED_SYMBOLS[sym] ?? match);
  text = text.replace(TEXT_SYMBOL_RE, (match, cmd: string) => TEXT_SYMBOLS[cmd] ?? match);

  return text.replace(/[{}]/g, '');
}
