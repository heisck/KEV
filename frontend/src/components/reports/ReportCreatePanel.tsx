import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { useCreateReport } from '@/api/hooks';
import { PlusIcon, SendIcon } from '@/components/kev/icons';
import { RichReportEditor, type RichReportEditorRef } from '@/components/reports/RichReportEditor';
import { HapticPressable } from '@/components/ui/HapticPressable';
import { hasVisibleReportContent, richHtmlToReportMarkup } from '@/lib/reportRichText';
import { useReportDraftStore } from '@/store/reportDraftStore';
import { toast } from '@/lib/toast';
import { radii, spacing, usePalette } from '@/theme';

export interface ReportCreatePanelRef {
  blur: () => void;
}

export const ReportCreatePanel = forwardRef<
  ReportCreatePanelRef,
  {
    onSendingChange: (sending: boolean) => void;
  }
>(function ReportCreatePanel({ onSendingChange }, ref) {
  const p = usePalette();
  const create = useCreateReport();
  const draftHtml = useReportDraftStore((s) => s.draftHtml);
  const setDraftHtml = useReportDraftStore((s) => s.setDraftHtml);
  const clearDraft = useReportDraftStore((s) => s.clearDraft);
  const editorRef = useRef<RichReportEditorRef>(null);

  const [contentHtml, setContentHtml] = useState(draftHtml);
  const [editing, setEditing] = useState(Boolean(draftHtml));

  useImperativeHandle(ref, () => ({
    blur: () => {
      editorRef.current?.blur();
    },
  }));

  useEffect(() => onSendingChange(create.isPending), [create.isPending, onSendingChange]);

  const handleHtmlChange = (html: string) => {
    setContentHtml(html);
    setDraftHtml(html);
  };

  const send = async () => {
    if (!hasVisibleReportContent(contentHtml) || create.isPending) return;
    try {
      await create.mutateAsync({
        message: richHtmlToReportMarkup(contentHtml),
      });
      setContentHtml('');
      clearDraft();
      setEditing(false);
      toast.success('Report sent');
    } catch {
      toast.error('Could not send report');
    }
  };

  return (
    <View style={styles.panel}>
      <RichReportEditor
        ref={editorRef}
        editing={editing}
        html={contentHtml}
        onChange={handleHtmlChange}
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
