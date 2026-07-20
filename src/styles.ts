import type { BibEntry } from './bibtex';
import { formatBibliographyAbnt, formatEntryAbnt } from './abnt';
import { formatBibliographyIeee, formatEntryIeee } from './ieee';
import { formatBibliographyMla, formatEntryMla } from './mla';
import { formatBibliographyApa, formatEntryApa } from './apa';
import { exportEndNote } from './endnote';
import { exportRefMan } from './ris';
import { exportRefWorks } from './refworks';
import type { FormattedReference } from './referenceTypes';

export type CitationStyle = 'abnt' | 'ieee' | 'mla' | 'apa';

/** Formats every entry per the given citation style; see the per-style `formatBibliography*` functions for details. */
export function formatBibliography(entries: BibEntry[], style: CitationStyle): FormattedReference[] {
  switch (style) {
    case 'abnt':
      return formatBibliographyAbnt(entries);
    case 'ieee':
      return formatBibliographyIeee(entries);
    case 'mla':
      return formatBibliographyMla(entries);
    case 'apa':
      return formatBibliographyApa(entries);
  }
}

/** Formats a single entry per the given citation style; see the per-style `formatEntry*` functions for details. */
export function formatEntryForStyle(entry: BibEntry, style: CitationStyle): FormattedReference {
  switch (style) {
    case 'abnt':
      return formatEntryAbnt(entry);
    case 'ieee':
      return formatEntryIeee(entry);
    case 'mla':
      return formatEntryMla(entry);
    case 'apa':
      return formatEntryApa(entry);
  }
}

export type ExportFormat = 'endnote' | 'refman' | 'refworks';

/** Exports every entry as a single file string in the given reference-manager import format. */
export function exportBibliography(entries: BibEntry[], format: ExportFormat): string {
  switch (format) {
    case 'endnote':
      return exportEndNote(entries);
    case 'refman':
      return exportRefMan(entries);
    case 'refworks':
      return exportRefWorks(entries);
  }
}
