import type { BibEntry } from './bibtex';
import { cleanLatexText } from './latexText';
import { escapeHtml, resolveEntryUrl } from './citations';
import { initials, isInstitutionalAuthor, splitAuthorField, splitNameParts } from './nameParsing';
import type { FormattedReference } from './referenceTypes';

/** "Last, F. M." — the per-author APA form (surname first, given names abbreviated). */
function formatSingleAuthorApa(name: string): string {
  const { last, given } = splitNameParts(name);
  if (!last) return '';
  const init = initials(given);
  return init ? `${last}, ${init}` : last;
}

/**
 * Formats a BibTeX `author`/`editor` field per APA (7th ed.): "Last, F. M."
 * for one author, "&"-joined for two, comma-joined with "&" before the last
 * for 3-20 authors, and the 21+-author ellipsis rule (first 19, "...", last).
 */
export function formatAuthorsApa(rawAuthorField: string): string {
  const { names, hasEtAl } = splitAuthorField(rawAuthorField);
  const formatted = names.map((raw) =>
    isInstitutionalAuthor(raw) ? cleanLatexText(raw) : formatSingleAuthorApa(cleanLatexText(raw))
  );

  if (formatted.length === 0) return '';
  if (hasEtAl) return `${formatted[0]} et al.`;
  if (formatted.length === 1) return formatted[0];
  if (formatted.length === 2) return `${formatted[0]}, & ${formatted[1]}`;
  if (formatted.length <= 20) return `${formatted.slice(0, -1).join(', ')}, & ${formatted[formatted.length - 1]}`;
  return `${formatted.slice(0, 19).join(', ')}, ... ${formatted[formatted.length - 1]}`;
}

export type ApaReference = FormattedReference;

/**
 * Formats a single BibTeX entry per APA (7th ed.): the title of the work
 * itself is plain text (or italic when the work is a standalone book/thesis/
 * report), while the *container* it appears in (journal, edited book,
 * proceedings) is italicized — APA never uses quotation marks around titles.
 */
export function formatEntryApa(entry: BibEntry): ApaReference {
  const f = entry.fields;
  const get = (name: string): string => (f[name] ? cleanLatexText(f[name]) : '');
  const esc = escapeHtml;

  const rawAuthorField = f.author || f.editor || '';
  const authors = formatAuthorsApa(rawAuthorField);
  const title = get('title');
  const year = get('year') || 'n.d.';
  const publisher = get('publisher');
  const journal = get('journal');
  const booktitle = get('booktitle');
  const volume = get('volume');
  const number = get('number');
  const pages = get('pages').replace(/-{2,}/g, '-');
  const school = get('school') || get('institution');
  const note = get('note');
  const doi = get('doi');
  const thesisType = get('type');
  const editorField = f.author && f.editor ? formatAuthorsApa(f.editor) : '';

  const plainTitle = title ? esc(title) : '';
  const italicTitle = title ? `<em>${esc(title)}</em>` : '';
  const type = entry.type.toLowerCase();
  const clauses: string[] = [];

  const authorYear = [authors ? esc(authors) : '', `(${esc(year)})`].filter(Boolean).join(' ');
  if (authorYear) clauses.push(authorYear);

  if (type === 'book' || type === 'booklet') {
    if (italicTitle) clauses.push(italicTitle);
    if (publisher) clauses.push(esc(publisher));
  } else if (type === 'article') {
    if (plainTitle) clauses.push(plainTitle);
    // APA italicizes "Journal Name, Volume" but not the issue number, which
    // sits in plain parentheses immediately after (no space before it).
    const journalHtml = journal
      ? `<em>${esc(journal)}${volume ? `, ${esc(volume)}` : ''}</em>${number ? `(${esc(number)})` : ''}`
      : '';
    clauses.push(pages ? `${journalHtml}, ${esc(pages)}` : journalHtml);
  } else if (type === 'incollection' || type === 'inbook') {
    if (plainTitle) clauses.push(plainTitle);
    const bookTitleHtml = booktitle ? `<em>${esc(booktitle)}</em>` : italicTitle;
    const inClause = `In ${editorField ? `${esc(editorField)} (Ed.), ` : ''}${bookTitleHtml}${
      pages ? ` (pp. ${esc(pages)})` : ''
    }`;
    clauses.push(inClause);
    if (publisher) clauses.push(esc(publisher));
  } else if (type === 'inproceedings' || type === 'conference') {
    if (plainTitle) clauses.push(plainTitle);
    const bookTitleHtml = booktitle ? `<em>${esc(booktitle)}</em>` : '';
    const inClause = bookTitleHtml
      ? `In ${editorField ? `${esc(editorField)} (Ed.), ` : ''}${bookTitleHtml}${pages ? ` (pp. ${esc(pages)})` : ''}`
      : '';
    if (inClause) clauses.push(inClause);
    if (publisher) clauses.push(esc(publisher));
  } else if (type === 'mastersthesis' || type === 'phdthesis' || type === 'monografia' || type === 'monography') {
    const defaultLabel = type === 'phdthesis' ? 'Doctoral dissertation' : "Master's thesis";
    const bracket = [thesisType || defaultLabel, school].filter(Boolean).map(esc).join(', ');
    clauses.push(`${italicTitle}${bracket ? ` [${bracket}]` : ''}`);
  } else if (type === 'techreport') {
    const reportNo = get('number');
    clauses.push(`${italicTitle}${reportNo ? ` (Report No. ${esc(reportNo)})` : ''}`);
    if (school) clauses.push(esc(school));
  } else {
    if (plainTitle) clauses.push(plainTitle);
  }

  if (doi) {
    clauses.push(`<a href="https://doi.org/${esc(doi)}" target="_blank" rel="noopener noreferrer">https://doi.org/${esc(doi)}</a>`);
  } else {
    const resolvedUrl = resolveEntryUrl(entry);
    if (resolvedUrl) {
      clauses.push(`<a href="${esc(resolvedUrl)}" target="_blank" rel="noopener noreferrer">${esc(resolvedUrl)}</a>`);
    }
  }

  if (note) clauses.push(esc(note));

  let html = clauses
    .filter(Boolean)
    .map((c) => c.replace(/\.$/, ''))
    .join('. ');
  if (html) html += '.';
  const firstAuthorSurname = authors ? authors.split(',')[0].trim() : '';
  const sortKey = (firstAuthorSurname || title || entry.key).toUpperCase();

  return { key: entry.key, html, sortKey };
}

/** Formats every entry per APA and alphabetizes the result by author surname (falling back to title). */
export function formatBibliographyApa(entries: BibEntry[]): ApaReference[] {
  return entries.map(formatEntryApa).sort((a, b) => a.sortKey.localeCompare(b.sortKey));
}
