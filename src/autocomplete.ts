import type { Completion, CompletionContext, CompletionResult } from '@codemirror/autocomplete';
import type { BibEntry } from './bibtex';

const LATEX_COMMANDS: Completion[] = [
  { label: '\\cite{}', apply: '\\cite{}', type: 'keyword', detail: 'citar referência do .bib', boost: 2 },
  { label: '\\textbf{}', apply: '\\textbf{}', type: 'keyword', detail: 'negrito' },
  { label: '\\textit{}', apply: '\\textit{}', type: 'keyword', detail: 'itálico' },
  { label: '\\section{}', apply: '\\section{}', type: 'keyword', detail: 'seção' },
  { label: '\\subsection{}', apply: '\\subsection{}', type: 'keyword', detail: 'subseção' },
  { label: '\\label{}', apply: '\\label{}', type: 'keyword', detail: 'rótulo para referência cruzada' },
  { label: '\\ref{}', apply: '\\ref{}', type: 'keyword', detail: 'referência cruzada a um \\label' },
  { label: '\\footnote{}', apply: '\\footnote{}', type: 'keyword', detail: 'nota de rodapé' },
];

const MATH_SYMBOLS: Completion[] = [
  '\\alpha', '\\beta', '\\gamma', '\\delta', '\\theta', '\\lambda', '\\pi', '\\sigma', '\\omega',
  '\\sum', '\\int', '\\prod', '\\infty', '\\partial', '\\nabla',
  '\\leq', '\\geq', '\\neq', '\\approx', '\\times', '\\cdot',
].map((label): Completion => ({ label, type: 'constant' })).concat([
  { label: '\\sqrt{}', apply: '\\sqrt{}', type: 'constant' },
  { label: '\\frac{}{}', apply: '\\frac{}{}', type: 'constant' },
]);

function citationDetail(entry: BibEntry): string {
  const firstAuthor = entry.fields.author?.split(/\s+and\s+/)[0]?.split(',')[0]?.trim();
  const year = entry.fields.year;
  const who = firstAuthor ?? 'autor desconhecido';
  return year ? `${who} (${year})` : who;
}

/** Autocompletes bib keys right after `\cite{`, sourced live from the current .bib entries. */
export function citationCompletionSource(getEntries: () => BibEntry[]) {
  return (context: CompletionContext): CompletionResult | null => {
    const match = context.matchBefore(/\\cite\{[^}]*/);
    if (!match) return null;
    const braceIdx = match.text.indexOf('{');
    const from = match.from + braceIdx + 1;
    const entries = getEntries();
    if (entries.length === 0) return null;

    return {
      from,
      options: entries.map((entry) => ({
        label: entry.key,
        detail: citationDetail(entry),
        info: entry.fields.title ? entry.fields.title.replace(/[{}]/g, '') : undefined,
        type: 'text',
      })),
      validFor: /^[^}]*$/,
    };
  };
}

function isInsideMath(textBeforeCursor: string): boolean {
  const lastParagraphBreak = textBeforeCursor.lastIndexOf('\n\n');
  const scope = lastParagraphBreak === -1 ? textBeforeCursor : textBeforeCursor.slice(lastParagraphBreak);
  const dollarCount = (scope.match(/\$/g) || []).length;
  return dollarCount % 2 === 1;
}

/** Autocompletes LaTeX-like commands (\cite, \textbf, ...) and, inside $...$, math symbols. */
export function latexCommandCompletionSource(context: CompletionContext): CompletionResult | null {
  const word = context.matchBefore(/\\[a-zA-Z]*/);
  if (!word || (word.from === word.to && !context.explicit)) return null;

  const inMath = isInsideMath(context.state.sliceDoc(0, word.from));
  const options = inMath ? [...MATH_SYMBOLS, ...LATEX_COMMANDS] : LATEX_COMMANDS;

  return {
    from: word.from,
    options,
    validFor: /^\\[a-zA-Z]*$/,
  };
}
