import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { useCreateReport, useSessions } from '@/api/hooks';
import { PlusIcon, SendIcon } from '@/components/kev/icons';
import { RichReportEditor, type RichReportEditorRef } from '@/components/reports/RichReportEditor';
import { HapticPressable } from '@/components/ui/HapticPressable';
import { hasVisibleReportContent, richHtmlToReportMarkup } from '@/lib/reportRichText';
import { toast } from '@/lib/toast';
import { radii, spacing, usePalette } from '@/theme';

export interface ReportCreatePanelRef {
  blur: () => void;
}

export const ReportCreatePanel = forwardRef<
  ReportCreatePanelRef,
  { onSendingChange: (sending: boolean) => void }
>(function ReportCreatePanel({ onSendingChange }, ref) {
  const p = usePalette();
  const { data: sessions } = useSessions();
  const create = useCreateReport();
  const available = useMemo(() => sessions ?? [], [sessions]);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [contentHtml, setContentHtml] = useState('');
  const [editing, setEditing] = useState(false);
  const editorRef = useRef<RichReportEditorRef>(null);

  useImperativeHandle(ref, () => ({ blur: () => editorRef.current?.blur() }));

  useEffect(() => onSendingChange(create.isPending), [create.isPending, onSendingChange]);

  const send = async () => {
    if (!hasVisibleReportContent(contentHtml) || create.isPending) return;
    try {
      await create.mutateAsync({
        message: richHtmlToReportMarkup(contentHtml),
        ...(sessionId === null ? {} : { sessionId }),
      });
      setContentHtml('');
      setEditing(false);
      toast.success('Report sent');
    } catch {
      toast.error('Could not send report');
    }
  };

  return (
    <View style={styles.panel}>
      <ScrollView
        horizontal
        keyboardShouldPersistTaps="always"
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.sessions}
        style={styles.sessionScroll}
      >
        <HapticPressable
          onPress={() => setSessionId(null)}
          style={[
            styles.session,
            { backgroundColor: sessionId === null ? p.primary : p.surfaceDim },
          ]}
        >
          <Text
            style={[styles.sessionText, { color: sessionId === null ? p.onPrimary : p.inkSoft }]}
          >
            General
          </Text>
        </HapticPressable>
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
      <RichReportEditor
        ref={editorRef}
        editing={editing}
        html={contentHtml}
        onChange={setContentHtml}
        onStart={() => setEditing(true)}
      />
      <HapticPressable
        accessibilityLabel={editing ? 'Send report' : 'Start report'}
        disabled={editing && (!hasVisibleReportContent(contentHtml) || create.isPending)}
        haptic={editing ? 'success' : 'select'}
        onPress={editing ? send : () => setEditing(true)}
        style={[
          styles.fab,
          { backgroundColor: p.primary },
          editing && (!hasVisibleReportContent(contentHtml) || create.isPending) && styles.disabled,
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
});

const styles = StyleSheet.create({
  panel: { flex: 1, gap: spacing.md, paddingHorizontal: spacing.xl },
  sessionScroll: { flexGrow: 0 },
  sessions: { alignItems: 'center', gap: spacing.sm },
  session: { borderRadius: radii.pill, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  sessionText: { fontSize: 12, fontWeight: '700' },
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
