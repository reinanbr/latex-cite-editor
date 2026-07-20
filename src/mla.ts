import type { BibEntry } from './bibtex';
import { cleanLatexText } from './latexText';
import { escapeHtml, resolveEntryUrl } from './citations';
import { isInstitutionalAuthor, splitAuthorField, splitNameParts } from './nameParsing';
import type { FormattedReference } from './referenceTypes';
import { stripTrailingConnector } from './citationClauses';

/** "Last, First Middle" — the MLA form used for the first author only. */
function formatFirstAuthorMla(name: string): string {
  const { last, given } = splitNameParts(name);
  if (!last) return '';
  return given ? `${last}, ${given}` : last;
}

/** "First Middle Last" — the MLA form used for every author after the first. */
function formatSubsequentAuthorMla(name: string): string {
  const { last, given } = splitNameParts(name);
  if (!last) return '';
  return given ? `${given} ${last}` : last;
}

/**
 * Formats a BibTeX `author`/`editor` field per MLA (9th ed.): "Last, First."
 * for one author, "Last, First, and First Last." for two, and "Last, First,
 * et al." past two.
 */
export function formatAuthorsMla(rawAuthorField: string): string {
  const { names, hasEtAl } = splitAuthorField(rawAuthorField);
  if (names.length === 0) return '';

  const first = (raw: string) =>
    isInstitutionalAuthor(raw) ? cleanLatexText(raw) : formatFirstAuthorMla(cleanLatexText(raw));
  const rest = (raw: string) =>
    isInstitutionalAuthor(raw) ? cleanLatexText(raw) : formatSubsequentAuthorMla(cleanLatexText(raw));

  if (names.length > 2 || hasEtAl) return `${first(names[0])}, et al.`;
  if (names.length === 1) return first(names[0]);
  return `${first(names[0])}, and ${rest(names[1])}`;
}

export type MlaReference = FormattedReference;

/**
 * Formats a single BibTeX entry per MLA (9th ed.): titles of works contained
 * in something else (articles, chapters, conference papers, theses) in
 * quotes; titles of standalone containers (books, journals, proceedings) in
 * italics.
 */
export function formatEntryMla(entry: BibEntry): MlaReference {
  const f = entry.fields;
  const get = (name: string): string => (f[name] ? cleanLatexText(f[name]) : '');
  const esc = escapeHtml;

  const rawAuthorField = f.author || f.editor || '';
  const authors = formatAuthorsMla(rawAuthorField);
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
  const thesisType = get('type');
  const editorField = f.author && f.editor ? formatAuthorsMla(f.editor) : '';

  const quotedTitle = title ? `&ldquo;${esc(title)}.&rdquo;` : '';
  const italicTitle = title ? `<em>${esc(title)}</em>` : '';
  const type = entry.type.toLowerCase();
  const clauses: string[] = [];

  if (authors) clauses.push(esc(authors));

  if (type === 'book' || type === 'booklet') {
    if (italicTitle) clauses.push(italicTitle);
    clauses.push([esc(publisher), esc(year)].filter(Boolean).join(', '));
  } else if (type === 'article') {
    if (quotedTitle) clauses.push(quotedTitle);
    const journalHtml = journal ? `<em>${esc(journal)}</em>` : '';
    const tail: string[] = [];
    if (volume) tail.push(`vol. ${esc(volume)}`);
    if (number) tail.push(`no. ${esc(number)}`);
    tail.push(esc(year));
    if (pages) tail.push(`pp. ${esc(pages)}`);
    clauses.push(journalHtml ? `${journalHtml}, ${tail.join(', ')}` : tail.join(', '));
  } else if (type === 'incollection' || type === 'inbook') {
    if (quotedTitle) clauses.push(quotedTitle);
    const bookTitleHtml = booktitle ? `<em>${esc(booktitle)}</em>` : italicTitle;
    clauses.push(`${bookTitleHtml}${editorField ? `, edited by ${esc(editorField)}` : ''}`);
    const tail = [esc(publisher), esc(year)].filter(Boolean).join(', ');
    clauses.push(pages ? `${tail}, pp. ${esc(pages)}` : tail);
  } else if (type === 'inproceedings' || type === 'conference') {
    if (quotedTitle) clauses.push(quotedTitle);
    const bookHtml = booktitle ? `<em>${esc(booktitle)}</em>` : '';
    const tail: string[] = [esc(year)];
    if (pages) tail.push(`pp. ${esc(pages)}`);
    clauses.push(bookHtml ? `${bookHtml}, ${tail.join(', ')}` : tail.join(', '));
  } else if (type === 'mastersthesis' || type === 'phdthesis' || type === 'monografia' || type === 'monography') {
    if (quotedTitle) clauses.push(quotedTitle);
    clauses.push(esc(year));
    const defaultLabel = type === 'phdthesis' ? 'PhD dissertation' : "Master's thesis";
    clauses.push([esc(school), esc(thesisType || defaultLabel)].filter(Boolean).join(', '));
  } else if (type === 'techreport') {
    if (italicTitle) clauses.push(italicTitle);
    clauses.push([esc(school), esc(year)].filter(Boolean).join(', '));
  } else {
    if (quotedTitle) clauses.push(quotedTitle);
    clauses.push(esc(year));
  }

  const resolvedUrl = resolveEntryUrl(entry);
  if (resolvedUrl) {
    clauses.push(`<a href="${esc(resolvedUrl)}" target="_blank" rel="noopener noreferrer">${esc(resolvedUrl)}</a>`);
  }

  if (note) clauses.push(esc(note));

  let html = clauses
    .filter(Boolean)
    .map(stripTrailingConnector)
    .join('. ');
  if (html) html += '.';
  const firstAuthorSurname = authors ? authors.split(',')[0].trim() : '';
  const sortKey = (firstAuthorSurname || title || entry.key).toUpperCase();

  return { key: entry.key, html, sortKey };
}

/** Formats every entry per MLA and alphabetizes the result by author surname (falling back to title). */
export function formatBibliographyMla(entries: BibEntry[]): MlaReference[] {
  return entries.map(formatEntryMla).sort((a, b) => a.sortKey.localeCompare(b.sortKey));
}
