/**
 * BibTeX wraps corporate/institutional authors (e.g. `{NASA Exoplanet Archive}`)
 * in an outer brace pair specifically so name-parsing tools don't split them
 * into "Last, First" — checked on the raw (pre-cleanLatexText) field text,
 * since cleanLatexText strips braces before this can be detected.
 */
export function isInstitutionalAuthor(rawName: string): boolean {
  const trimmed = rawName.trim();
  return trimmed.startsWith('{') && trimmed.endsWith('}') && !trimmed.slice(1, -1).includes('}');
}

export interface NameParts {
  last: string;
  /** First + middle name(s), space separated; '' if the name is a bare surname. */
  given: string;
}

/** Splits a single BibTeX name in either "Last, First Middle" or "First Middle Last" form. */
export function splitNameParts(name: string): NameParts {
  const trimmed = name.trim();
  if (!trimmed) return { last: '', given: '' };
  if (trimmed.includes(',')) {
    const commaIdx = trimmed.indexOf(',');
    return { last: trimmed.slice(0, commaIdx).trim(), given: trimmed.slice(commaIdx + 1).trim() };
  }
  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return { last: parts[0], given: '' };
  const last = parts.pop()!;
  return { last, given: parts.join(' ') };
}

/** "Paulo Sergio" -> "P. S.", "" -> "" — first-letter initials for style guides that abbreviate given names. */
export function initials(given: string): string {
  return given
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => `${part[0].toUpperCase()}.`)
    .join(' ');
}

/**
 * Splits a raw BibTeX `author`/`editor` field (names joined by ` and `) into
 * individual raw name strings, reporting whether it ends in a bare `others`
 * (BibTeX's convention for "et al." when the full list isn't known).
 */
export function splitAuthorField(rawField: string): { names: string[]; hasEtAl: boolean } {
  if (!rawField) return { names: [], hasEtAl: false };
  const rawAuthors = rawField
    .split(/\s+and\s+/i)
    .map((s) => s.trim())
    .filter(Boolean);
  const hasEtAl = rawAuthors.some((a) => a.toLowerCase() === 'others');
  return { names: rawAuthors.filter((a) => a.toLowerCase() !== 'others'), hasEtAl };
}
