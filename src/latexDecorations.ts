import { Decoration, EditorView, MatchDecorator, ViewPlugin, type DecorationSet } from '@codemirror/view';

const LATEX_TOKEN_RE = /\\cite\{[^}]*\}|\\[a-zA-Z]+(?:\{[^}]*\})?|\$\$[^$]*\$\$|\$[^$\n]+\$/g;

function classify(token: string): string {
  if (token.startsWith('\\cite{')) return 'cm-latex-cite';
  if (token.startsWith('$$')) return 'cm-latex-math-block';
  if (token.startsWith('$')) return 'cm-latex-math-inline';
  return 'cm-latex-command';
}

const matcher = new MatchDecorator({
  regexp: LATEX_TOKEN_RE,
  decoration: (match) => Decoration.mark({ class: classify(match[0]) }),
});

/** Regex-based decorations that highlight \cite{}, other \commands, and $...$/$$...$$ math spans. */
export const latexHighlightPlugin = ViewPlugin.define(
  (view) => ({
    decorations: matcher.createDeco(view),
    update(update) {
      this.decorations = matcher.updateDeco(update, this.decorations);
    },
  }),
  {
    decorations: (instance) => instance.decorations as DecorationSet,
  }
);

export const latexHighlightTheme = EditorView.baseTheme({
  '.cm-latex-cite': {
    color: '#0ea5e9',
    fontWeight: '600',
  },
  '.cm-latex-command': {
    color: '#a855f7',
  },
  '.cm-latex-math-inline, .cm-latex-math-block': {
    color: '#f59e0b',
  },
});
