import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Keyboard, StyleSheet, View } from 'react-native';
import { actions, RichEditor } from 'react-native-pell-rich-editor';

import {
  ReportFormattingToolbar,
  type ReportFormat,
} from '@/components/reports/ReportFormattingToolbar';
import { radii, spacing, usePalette } from '@/theme';

const LIST_FORMATS: ReportFormat[] = ['numbered-list', 'circle-list', 'bullet-list'];
const ACTIONS: Record<Exclude<ReportFormat, 'circle-list'>, actions> = {
  bold: actions.setBold,
  italic: actions.setItalic,
  underline: actions.setUnderline,
  strike: actions.setStrikethrough,
  'align-left': actions.alignLeft,
  'align-right': actions.alignRight,
  'numbered-list': actions.insertOrderedList,
  'bullet-list': actions.insertBulletsList,
};

export interface RichReportEditorRef {
  blur: () => void;
  focus: () => void;
}

export const RichReportEditor = forwardRef<
  RichReportEditorRef,
  {
    editing: boolean;
    html: string;
    onChange: (html: string) => void;
    onStart: () => void;
  }
>(function RichReportEditor({ editing, html, onChange, onStart }, ref) {
  const p = usePalette();
  const editor = useRef<RichEditor>(null);
  const unorderedStyle = useRef<'bullet-list' | 'circle-list'>('bullet-list');
  const [active, setActive] = useState<Set<ReportFormat>>(new Set());
  const [, setFocused] = useState(false);

  const [initialHtml] = useState(html);
  const wasEditing = useRef(false);

  useImperativeHandle(ref, () => ({
    blur: () => {
      Keyboard.dismiss();
      editor.current?.blurContentEditor();
    },
    focus: () => {
      editor.current?.focusContentEditor();
    },
  }));

  useEffect(() => {
    if (!editing) {
      setActive((current) => (current.size === 0 ? current : new Set()));
      if (!html) editor.current?.setContentHTML('');
      wasEditing.current = false;
      return;
    }
    if (!wasEditing.current) {
      wasEditing.current = true;
      editor.current?.focusContentEditor();
    }
  }, [editing, html]);

  const execute = (format: ReportFormat) => {
    const instance = editor.current;
    if (!instance) return;
    if (format === 'circle-list' || format === 'bullet-list') {
      unorderedStyle.current = format;
      instance.sendAction(actions.insertBulletsList, 'result');
      const type = format === 'circle-list' ? 'circle' : 'disc';
      instance.command(
        `var s=$.getSelection(),n=s&&s.anchorNode;while(n&&n.nodeType===3)n=n.parentNode;while(n&&n!==$.body&&n.tagName!=='UL')n=n.parentNode;if(n&&n.tagName==='UL')n.style.listStyleType='${type}'`,
      );
      return;
    }
    instance.sendAction(ACTIONS[format], 'result');
  };

  const select = (format: ReportFormat) => {
    if (!editing) onStart();
    let toExecute: ReportFormat = format;
    setActive((current) => {
      const next = new Set(current);
      if (format === 'align-left') {
        next.delete('align-left');
        next.delete('align-right');
        toExecute = 'align-left';
      } else if (format === 'align-right') {
        if (current.has('align-right')) {
          next.delete('align-right');
          toExecute = 'align-left';
        } else {
          next.delete('align-left');
          next.add('align-right');
          toExecute = 'align-right';
        }
      } else {
        const exclusive = LIST_FORMATS;
        if (current.has(format)) next.delete(format);
        else {
          if (format.endsWith('-list')) {
            exclusive.forEach((item) => next.delete(item));
          }
          next.add(format);
        }
      }
      return next;
    });
    queueMicrotask(() => execute(toExecute));
  };

  const ready = () =>
    editor.current?.registerToolbar((items) => {
      const selected = new Set<ReportFormat>();
      for (const item of items) {
        if (typeof item !== 'string') continue;
        const match = Object.entries(ACTIONS).find(([, action]) => action === item)?.[0] as
          Exclude<ReportFormat, 'circle-list'> | undefined;
        if (match === 'bullet-list') selected.add(unorderedStyle.current);
        else if (match && match !== 'align-left') selected.add(match);
      }
      setActive(selected);
    });

  return (
    <View style={styles.container}>
      <ReportFormattingToolbar active={active} onSelect={select} />
      <RichEditor
        ref={editor}
        autoCapitalize="sentences"
        disabled={!editing}
        editorInitializedCallback={ready}
        editorStyle={{
          backgroundColor: p.surfaceDim,
          caretColor: p.primary,
          color: p.ink,
          contentCSSText:
            'font-size:15px;line-height:22px;padding:12px 14px;min-height:100%;box-sizing:border-box;-webkit-overflow-scrolling:touch;',
          placeholderColor: p.muted,
        }}
        initialContentHTML={initialHtml}
        nestedScrollEnabled
        onBlur={() => setFocused(false)}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        pasteAsPlainText
        placeholder={editing ? 'Write your report…' : 'Tap + to start a report'}
        scrollEnabled
        style={[styles.editor, { backgroundColor: p.surfaceDim }]}
        testID="rich-report-editor"
        useContainer
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: { flex: 1, gap: spacing.md },
  editor: { borderRadius: radii.lg, flex: 1, minHeight: 240, overflow: 'hidden' },
  accessory: {
    alignItems: 'flex-end',
    borderTopWidth: StyleSheet.hairlineWidth,
    left: -spacing.xl,
    padding: spacing.sm,
    position: 'absolute',
    right: -spacing.xl,
    zIndex: 20,
  },
  done: {
    alignItems: 'center',
    borderRadius: radii.pill,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  doneText: { fontSize: 13, fontWeight: '800' },
});
