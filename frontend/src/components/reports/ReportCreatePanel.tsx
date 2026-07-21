import { useEffect, useMemo, useRef, useState } from 'react';
import { Keyboard, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { useCreateReport, useSessions } from '@/api/hooks';
import { PlusIcon, SendIcon } from '@/components/kev/icons';
import {
  ReportFormattingToolbar,
  type ReportFormat,
} from '@/components/reports/ReportFormattingToolbar';
import { HapticPressable } from '@/components/ui/HapticPressable';
import { toast } from '@/lib/toast';
import { radii, spacing, usePalette } from '@/theme';

type Selection = { start: number; end: number };
const LIST_FORMATS: ReportFormat[] = ['numbered-list', 'circle-list', 'bullet-list'];

function serializeReportText(value: string, formats: ReadonlySet<ReportFormat>) {
  return value
    .split('\n')
    .map((line) => {
      let formatted = line;
      if (formats.has('bold')) formatted = `**${formatted}**`;
      if (formats.has('italic')) formatted = `_${formatted}_`;
      if (formats.has('underline')) formatted = `<u>${formatted}</u>`;
      if (formats.has('strike')) formatted = `~~${formatted}~~`;
      if (formats.has('align-right')) formatted = `<right>${formatted}</right>`;
      else if (formats.has('align-left')) formatted = `<left>${formatted}</left>`;
      return formatted;
    })
    .join('\n');
}

export function ReportCreatePanel({
  onSendingChange,
}: {
  onSendingChange: (sending: boolean) => void;
}) {
  const p = usePalette();
  const { data: sessions } = useSessions();
  const create = useCreateReport();
  const available = useMemo(() => sessions ?? [], [sessions]);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [content, setContent] = useState('');
  const [editing, setEditing] = useState(false);
  const [activeFormats, setActiveFormats] = useState<Set<ReportFormat>>(new Set());
  const [selection, setSelection] = useState<Selection>({ start: 0, end: 0 });
  const input = useRef<TextInput>(null);

  useEffect(() => {
    if (sessionId === null && available[0]) setSessionId(available[0].id);
  }, [available, sessionId]);

  useEffect(() => onSendingChange(create.isPending), [create.isPending, onSendingChange]);

  const focus = () => {
    setEditing(true);
    setTimeout(() => input.current?.focus(), 0);
  };

  const formatList = (marker: string) => {
    if (!editing) focus();
    const selected = content.slice(selection.start, selection.end);
    const lead = selection.start > 0 && content[selection.start - 1] !== '\n' ? '\n' : '';
    const insertion = `${lead}${(selected || '')
      .split('\n')
      .map((line) => `${marker}${line}`)
      .join('\n')}`;
    setContent(`${content.slice(0, selection.start)}${insertion}${content.slice(selection.end)}`);
    setSelection({
      start: selection.start + insertion.length,
      end: selection.start + insertion.length,
    });
    setTimeout(() => input.current?.focus(), 0);
  };

  const applyFormat = (next: ReportFormat) => {
    if (!editing) focus();
    if (next === 'numbered-list') formatList('1. ');
    else if (next === 'circle-list') formatList('○ ');
    else if (next === 'bullet-list') formatList('• ');
    setActiveFormats((current) => {
      const updated = new Set(current);
      const exclusive = next.startsWith('align-')
        ? (['align-left', 'align-right'] as ReportFormat[])
        : LIST_FORMATS;
      if (current.has(next)) {
        updated.delete(next);
      } else if (next.startsWith('align-') || next.endsWith('-list')) {
        exclusive.forEach((format) => updated.delete(format));
        updated.add(next);
      } else {
        updated.add(next);
      }
      return updated;
    });
  };

  const hideKeyboard = () => {
    input.current?.blur();
    Keyboard.dismiss();
  };

  const send = async () => {
    if (!sessionId || !content.trim() || create.isPending) return;
    try {
      await create.mutateAsync({
        sessionId,
        message: serializeReportText(content.trim(), activeFormats),
      });
      setContent('');
      setEditing(false);
      setActiveFormats(new Set());
      toast.success('Report sent');
    } catch {
      toast.error('Could not send report');
    }
  };

  return (
    <View style={styles.panel}>
      <ReportFormattingToolbar active={activeFormats} onSelect={applyFormat} />
      <ScrollView
        horizontal
        keyboardShouldPersistTaps="always"
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.sessions}
        style={styles.sessionScroll}
      >
        {available.map((session) => {
          const active = session.id === sessionId;
          return (
            <HapticPressable
              key={session.id}
              onPress={() => setSessionId(session.id)}
              style={[styles.session, { backgroundColor: active ? p.primary : p.surfaceDim }]}
            >
              <Text style={[styles.sessionText, { color: active ? p.onPrimary : p.inkSoft }]}>
                {session.title ?? session.sessionCode}
              </Text>
            </HapticPressable>
          );
        })}
      </ScrollView>
      {editing ? (
        <View style={styles.editorActions}>
          <HapticPressable
            accessibilityLabel="Hide keyboard"
            haptic="select"
            onPress={hideKeyboard}
            style={[styles.done, { backgroundColor: p.primary12 }]}
          >
            <Text style={[styles.doneText, { color: p.primaryDeep }]}>Go</Text>
          </HapticPressable>
        </View>
      ) : null}
      <TextInput
        ref={input}
        editable={editing}
        multiline
        onChangeText={setContent}
        onSelectionChange={(event) => setSelection(event.nativeEvent.selection)}
        placeholder={editing ? 'Write your report…' : 'Tap + to start a report'}
        placeholderTextColor={p.muted}
        selection={selection}
        style={[
          styles.editor,
          {
            backgroundColor: p.surfaceDim,
            color: p.ink,
            fontStyle: activeFormats.has('italic') ? 'italic' : 'normal',
            fontWeight: activeFormats.has('bold') ? '800' : '400',
            textAlign: activeFormats.has('align-right') ? 'right' : 'left',
            textDecorationLine:
              activeFormats.has('underline') && activeFormats.has('strike')
                ? 'underline line-through'
                : activeFormats.has('underline')
                  ? 'underline'
                  : activeFormats.has('strike')
                    ? 'line-through'
                    : 'none',
          },
        ]}
        textAlignVertical="top"
        value={content}
      />
      {available.length === 0 ? (
        <Text style={[styles.empty, { color: p.muted }]}>No sessions are available.</Text>
      ) : null}
      <HapticPressable
        accessibilityLabel={editing ? 'Send report' : 'Start report'}
        disabled={editing && (!sessionId || !content.trim() || create.isPending)}
        haptic={editing ? 'success' : 'select'}
        onPress={editing ? send : focus}
        style={[
          styles.fab,
          { backgroundColor: p.primary },
          editing && (!sessionId || !content.trim() || create.isPending) && styles.disabled,
        ]}
        testID="report-compose-action"
      >
        {editing ? (
          <SendIcon color={p.onPrimary} size={20} />
        ) : (
          <PlusIcon color={p.onPrimary} size={24} />
        )}
      </HapticPressable>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: { flex: 1, gap: spacing.md, paddingHorizontal: spacing.xl },
  sessionScroll: { flexGrow: 0 },
  sessions: { alignItems: 'center', gap: spacing.sm },
  session: { borderRadius: radii.pill, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  sessionText: { fontSize: 12, fontWeight: '700' },
  editorActions: { alignItems: 'flex-end', marginBottom: -spacing.sm },
  done: {
    alignItems: 'center',
    borderRadius: radii.pill,
    height: 30,
    justifyContent: 'center',
    width: 52,
  },
  doneText: { fontSize: 13, fontWeight: '800' },
  editor: {
    borderRadius: radii.lg,
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    minHeight: 240,
    padding: spacing.lg,
  },
  empty: { paddingVertical: spacing.xxl, textAlign: 'center' },
  fab: {
    alignItems: 'center',
    borderRadius: radii.pill,
    bottom: spacing.xl,
    height: 58,
    justifyContent: 'center',
    position: 'absolute',
    right: spacing.xl,
    width: 58,
  },
  disabled: { opacity: 0.45 },
});
