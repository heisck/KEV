import { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  Keyboard,
  Platform,
  StyleSheet,
  Text,
  View,
  type KeyboardEvent,
} from 'react-native';
import { actions, RichEditor } from 'react-native-pell-rich-editor';

import {
  ReportFormattingToolbar,
  type ReportFormat,
} from '@/components/reports/ReportFormattingToolbar';
import { HapticPressable } from '@/components/ui/HapticPressable';
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

function useKeyboardHeight(active: boolean): number {
  const [height, setHeight] = useState(0);
  useEffect(() => {
    if (!active || Platform.OS !== 'ios') return;
    const change = ({ endCoordinates }: KeyboardEvent) =>
      setHeight(Math.max(0, Dimensions.get('screen').height - endCoordinates.screenY));
    const frame = Keyboard.addListener('keyboardWillChangeFrame', change);
    const hide = Keyboard.addListener('keyboardWillHide', () => setHeight(0));
    return () => {
      frame.remove();
      hide.remove();
    };
  }, [active]);
  return height;
}

export function RichReportEditor({
  editing,
  html,
  onChange,
  onStart,
}: {
  editing: boolean;
  html: string;
  onChange: (html: string) => void;
  onStart: () => void;
}) {
  const p = usePalette();
  const editor = useRef<RichEditor>(null);
  const unorderedStyle = useRef<'bullet-list' | 'circle-list'>('bullet-list');
  const [active, setActive] = useState<Set<ReportFormat>>(new Set());
  const [focused, setFocused] = useState(false);
  const keyboardHeight = useKeyboardHeight(focused);

  useEffect(() => {
    if (!editing) {
      setActive((current) => (current.size === 0 ? current : new Set()));
      if (!html) editor.current?.setContentHTML('');
      return;
    }
    editor.current?.focusContentEditor();
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
    setActive((current) => {
      const next = new Set(current);
      const exclusive = format.startsWith('align-')
        ? (['align-left', 'align-right'] as ReportFormat[])
        : LIST_FORMATS;
      if (current.has(format)) next.delete(format);
      else {
        if (format.startsWith('align-') || format.endsWith('-list')) {
          exclusive.forEach((item) => next.delete(item));
        }
        next.add(format);
      }
      return next;
    });
    queueMicrotask(() => execute(format));
  };

  const ready = () =>
    editor.current?.registerToolbar((items) => {
      const selected = new Set<ReportFormat>();
      for (const item of items) {
        if (typeof item !== 'string') continue;
        const match = Object.entries(ACTIONS).find(([, action]) => action === item)?.[0] as
          Exclude<ReportFormat, 'circle-list'> | undefined;
        if (match === 'bullet-list') selected.add(unorderedStyle.current);
        else if (match) selected.add(match);
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
          contentCSSText: 'font-size:16px;line-height:24px;padding:4px 2px;',
          placeholderColor: p.muted,
        }}
        enterKeyHint="done"
        initialContentHTML={html}
        onBlur={() => setFocused(false)}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        pasteAsPlainText
        placeholder={editing ? 'Write your report…' : 'Tap + to start a report'}
        style={[styles.editor, { backgroundColor: p.surfaceDim }]}
        testID="rich-report-editor"
      />
      {keyboardHeight > 0 ? (
        <View
          style={[
            styles.accessory,
            { backgroundColor: p.surface, borderTopColor: p.hairline, bottom: keyboardHeight },
          ]}
        >
          <HapticPressable
            accessibilityLabel="Hide keyboard"
            onPress={() => editor.current?.blurContentEditor()}
            style={[styles.done, { backgroundColor: p.primary }]}
          >
            <Text style={[styles.doneText, { color: p.onPrimary }]}>Go</Text>
          </HapticPressable>
        </View>
      ) : null}
    </View>
  );
}

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
