import type { BibEntry } from './bibtex';
import { cleanLatexText } from './latexText';
import { escapeHtml, resolveEntryUrl } from './entryUtils';
import { formatEntryForStyle, type CitationStyle } from './styles';

export const CITE_COMMAND_RE = /\\cite\{([^}]*)\}/g;

export { escapeHtml, resolveEntryUrl } from './entryUtils';

/** Order of first appearance, deduplicated, across every \cite{...} in the text. */
export function extractCiteKeys(text: string): string[] {
  const keys: string[] = [];
  const seen = new Set<string>();
  const re = new RegExp(CITE_COMMAND_RE);
  let match: RegExpExecArray | null;
  while ((match = re.exec(text))) {
    for (const key of match[1].split(',').map((s) => s.trim()).filter(Boolean)) {
      if (!seen.has(key)) {
        seen.add(key);
        keys.push(key);
      }
    }
  }
  return keys;
}

/** Formats a single BibTeX entry as a plain reference-list line (numeric/IEEE-ish style). */
export function formatEntry(entry: BibEntry): string {
  const f = entry.fields;
  const author = f.author ? cleanLatexText(f.author.replace(/\s+and\s+/g, ', ')) : 'Unknown author';
  const year = f.year ? ` (${f.year})` : '';
  const title = f.title ? ` ${cleanLatexText(f.title)}.` : '';
  const venue = f.journal || f.booktitle || f.publisher || '';
  let text = `${author}${year}.${title}`;
  if (venue) text += ` ${cleanLatexText(venue)}.`;
  return text.trim();
}

export interface BibliographyItem {
  key: string;
  index: number;
  entry?: BibEntry;
  text: string;
  url?: string;
  /** Present when `resolveCitations` is called with a `style` option: the entry formatted per that citation style (ready-to-inject HTML), used in place of `text` when building `bibliographyHtml`. */
  html?: string;
}

export interface ResolvedCitations {
  /** Markdown/HTML-safe text with every \cite{key[,key2]} replaced by numbered, linked markers. */
  text: string;
  bibliography: BibliographyItem[];
  /** Ready-to-inject HTML block listing the bibliography (or '' if there are no citations). */
  bibliographyHtml: string;
}

export interface ResolveCitationsOptions {
  /**
   * Formats each bibliography entry per this citation style (IEEE, MLA, APA,
   * or ABNT) instead of the default plain numeric line. Citation-order
   * numbering (the `[1]`/`[2]`/... markers) is unaffected either way — only
   * ABNT/MLA/APA's own alphabetical sorting is skipped here, since the
   * bibliography list must stay in the same order as the in-text markers.
   */
  style?: CitationStyle;
}

/**
 * Resolves \cite{...} commands against parsed BibTeX entries, numbering them
 * by order of first appearance (like LaTeX + natbib's numeric style), and
 * builds the trailing bibliography section.
 */
export function resolveCitations(
  text: string,
  entries: BibEntry[],
  options: ResolveCitationsOptions = {}
): ResolvedCitations {
  const byKey = new Map(entries.map((e) => [e.key, e]));
  const order = extractCiteKeys(text);
  const indexOf = new Map(order.map((key, idx) => [key, idx + 1]));

  const occurrenceCount = new Map<number, number>();
  const resolvedText = text.replace(CITE_COMMAND_RE, (_match, rawKeys: string) => {
    const keys = rawKeys.split(',').map((s) => s.trim()).filter(Boolean);
    return keys
      .map((key) => {
        const idx = indexOf.get(key);
        if (!idx) return `<sup class="citation-ref citation-missing">[?]</sup>`;
        // Each citation marker needs a unique id even when the same source is
        // cited more than once, so bibliography backrefs always target one anchor.
        const occurrence = (occurrenceCount.get(idx) ?? 0) + 1;
        occurrenceCount.set(idx, occurrence);
        return `<sup class="citation-ref"><a href="#cite-${idx}" id="cite-ref-${idx}-${occurrence}">[${idx}]</a></sup>`;
      })
      .join('');
  });

  const bibliography: BibliographyItem[] = order.map((key) => {
    const entry = byKey.get(key);
    const idx = indexOf.get(key)!;
    return {
      key,
      index: idx,
      entry,
      text: entry ? formatEntry(entry) : `Reference not found in .bib: ${key}`,
      url: entry ? resolveEntryUrl(entry) : undefined,
      html: entry && options.style ? formatEntryForStyle(entry, options.style).html : undefined,
    };
  });

  const bibliographyHtml = bibliography.length
    ? `<div class="bibliography"><h2>References</h2><ol>${bibliography
        .map((item) => {
          const body = item.html
            ? item.html
            : item.url
              ? `<a href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer" class="citation-link">${escapeHtml(item.text)}</a>`
              : escapeHtml(item.text);
          return `<li id="cite-${item.index}">${body} <a href="#cite-ref-${item.index}-1" class="citation-backref">↩</a></li>`;
        })
        .join('')}</ol></div>`
    : '';

  return { text: resolvedText, bibliography, bibliographyHtml };
}
