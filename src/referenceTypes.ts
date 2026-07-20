/** Shared shape returned by every per-style bibliography formatter (ABNT, IEEE, MLA, APA). */
export interface FormattedReference {
  key: string;
  /** Ready-to-inject, already-escaped HTML. */
  html: string;
  /** Upper-cased sort key (first-author surname, or title if authorless). */
  sortKey: string;
}
