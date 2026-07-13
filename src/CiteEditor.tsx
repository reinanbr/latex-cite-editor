import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Compartment, EditorSelection, EditorState, type Extension } from '@codemirror/state';
import { EditorView, keymap, highlightActiveLine, lineNumbers, placeholder as placeholderExt } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { markdown } from '@codemirror/lang-markdown';
import { defaultHighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { autocompletion, closeBrackets, closeBracketsKeymap, completionKeymap } from '@codemirror/autocomplete';
import { openSearchPanel, search, searchKeymap } from '@codemirror/search';
import type { BibEntry } from './bibtex';
import { latexHighlightPlugin, latexHighlightTheme } from './latexDecorations';
import { citationCompletionSource, latexCommandCompletionSource } from './autocomplete';

export interface CiteEditorProps {
  value: string;
  onChange: (value: string) => void;
  /** Parsed .bib entries used to power \cite{} autocomplete; pass the output of parseBibtex(). */
  bibEntries?: BibEntry[];
  fontSize?: number;
  className?: string;
  placeholder?: string;
  minHeight?: string;
}

/**
 * Imperative API for host toolbars that need to manipulate the document the
 * way a `<textarea>` toolbar would (wrap selection, insert at line start, ...)
 * without reaching into CodeMirror internals themselves.
 */
export interface CiteEditorHandle {
  view: EditorView | null;
  focus(): void;
  getSelection(): string;
  /** Wraps every selection range with `before`/`after`; empty ranges use `placeholder` as the wrapped text. */
  wrapSelection(before: string, after: string, placeholder?: string): void;
  /** Inserts `prefix` at the start of the line containing the cursor. */
  insertAtLineStart(prefix: string): void;
  /** Inserts `text` at the cursor, replacing any selection. */
  insertText(text: string): void;
  /** Duplicates the line containing the cursor, matching the common editor Ctrl+D shortcut. */
  duplicateCurrentLine(): void;
  /** Opens CodeMirror's built-in search & replace panel. */
  openSearch(): void;
}

function fontSizeTheme(fontSize: number, minHeight: string): Extension {
  return EditorView.theme({
    '&': { fontSize: `${fontSize}px`, height: '100%' },
    '.cm-scroller': { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', minHeight },
    '.cm-content': { padding: '12px 0' },
  });
}

const CiteEditor = forwardRef<CiteEditorHandle, CiteEditorProps>(function CiteEditor(
  { value, onChange, bibEntries = [], fontSize = 14, className, placeholder, minHeight = '500px' },
  ref
) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const viewRef = useRef<EditorView | null>(null);
  const bibEntriesRef = useRef(bibEntries);
  bibEntriesRef.current = bibEntries;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const [themeCompartment] = useState(() => new Compartment());

  useImperativeHandle(
    ref,
    () => ({
      get view() {
        return viewRef.current;
      },
      focus() {
        viewRef.current?.focus();
      },
      getSelection() {
        const view = viewRef.current;
        if (!view) return '';
        return view.state.sliceDoc(view.state.selection.main.from, view.state.selection.main.to);
      },
      wrapSelection(before, after, placeholderText = '') {
        const view = viewRef.current;
        if (!view) return;
        const { state } = view;
        const changes = state.changeByRange((range) => {
          const selected = state.sliceDoc(range.from, range.to) || placeholderText;
          const insert = `${before}${selected}${after}`;
          return {
            changes: { from: range.from, to: range.to, insert },
            range: EditorSelection.range(range.from + before.length, range.from + before.length + selected.length),
          };
        });
        view.dispatch(state.update(changes, { scrollIntoView: true }));
        view.focus();
      },
      insertAtLineStart(prefix) {
        const view = viewRef.current;
        if (!view) return;
        const { state } = view;
        const changes = state.changeByRange((range) => {
          const line = state.doc.lineAt(range.from);
          return {
            changes: { from: line.from, to: line.from, insert: prefix },
            range: EditorSelection.range(range.from + prefix.length, range.to + prefix.length),
          };
        });
        view.dispatch(state.update(changes, { scrollIntoView: true }));
        view.focus();
      },
      insertText(text) {
        const view = viewRef.current;
        if (!view) return;
        const { state } = view;
        const changes = state.changeByRange((range) => ({
          changes: { from: range.from, to: range.to, insert: text },
          range: EditorSelection.cursor(range.from + text.length),
        }));
        view.dispatch(state.update(changes, { scrollIntoView: true }));
        view.focus();
      },
      duplicateCurrentLine() {
        const view = viewRef.current;
        if (!view) return;
        const line = view.state.doc.lineAt(view.state.selection.main.head);
        view.dispatch({
          changes: { from: line.to, to: line.to, insert: '\n' + line.text },
          scrollIntoView: true,
        });
        view.focus();
      },
      openSearch() {
        const view = viewRef.current;
        if (!view) return;
        openSearchPanel(view);
      },
    }),
    []
  );

  useEffect(() => {
    if (!containerRef.current) return;

    const extensions: Extension[] = [
      lineNumbers(),
      history(),
      highlightActiveLine(),
      markdown(),
      syntaxHighlighting(defaultHighlightStyle),
      latexHighlightPlugin,
      latexHighlightTheme,
      closeBrackets(),
      search({ top: true }),
      autocompletion({
        override: [citationCompletionSource(() => bibEntriesRef.current), latexCommandCompletionSource],
      }),
      keymap.of([...closeBracketsKeymap, ...defaultKeymap, ...historyKeymap, ...completionKeymap, ...searchKeymap]),
      EditorView.lineWrapping,
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          onChangeRef.current(update.state.doc.toString());
        }
      }),
      themeCompartment.of(fontSizeTheme(fontSize, minHeight)),
      ...(placeholder ? [placeholderExt(placeholder)] : []),
    ];

    const state = EditorState.create({ doc: value, extensions });
    const view = new EditorView({ state, parent: containerRef.current });
    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
    // Mount once; external `value` changes are synced via the effect below instead of
    // recreating the view (which would drop cursor position/undo history on every keystroke).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const current = view.state.doc.toString();
    if (current !== value) {
      view.dispatch({ changes: { from: 0, to: current.length, insert: value } });
    }
  }, [value]);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    view.dispatch({ effects: themeCompartment.reconfigure(fontSizeTheme(fontSize, minHeight)) });
  }, [fontSize, minHeight, themeCompartment]);

  return <div ref={containerRef} className={className} />;
});

export default CiteEditor;
