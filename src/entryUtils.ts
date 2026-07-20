import type { BibEntry } from './bibtex';

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Resolves the URL a bibliography entry should link to, if any (`url`, `link`, then `doi`). */
export function resolveEntryUrl(entry: BibEntry): string | undefined {
  const f = entry.fields;
  return f.url || f.link || (f.doi ? `https://doi.org/${f.doi}` : undefined);
}
