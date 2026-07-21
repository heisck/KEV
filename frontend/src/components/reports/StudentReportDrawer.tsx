import { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { getProblemDetail } from '@/api/schemas';
import { useCreateReport } from '@/api/hooks';
import { Avatar } from '@/components/kev/people';
import { BottomDrawer } from '@/components/ui/BottomDrawer';
import { HapticPressable } from '@/components/ui/HapticPressable';
import { toast } from '@/lib/toast';
import { radii, spacing, usePalette } from '@/theme';

export type ReportStudent = {
  id: string;
  name: string;
  index: string;
  person: string;
  course: string;
};

export function StudentReportDrawer({
  visible,
  onClose,
  sessionId,
  student,
}: {
  visible: boolean;
  onClose: () => void;
  sessionId: string;
  student: ReportStudent | null;
}) {
  const p = usePalette();
  const create = useCreateReport();
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!visible) setMessage('');
  }, [visible]);

  const send = async () => {
    const studentId = Number(student?.id);
    if (!student || !Number.isInteger(studentId) || !message.trim()) return;
    try {
      await create.mutateAsync({
        sessionId: Number(sessionId),
        studentId,
        message: message.trim(),
      });
      toast.success('Report sent to session invigilators');
      onClose();
    } catch (error: unknown) {
      toast.error(getProblemDetail(error)?.detail ?? 'Could not send report');
    }
  };

  return (
    <BottomDrawer
      visible={visible}
      onClose={onClose}
      title="Make student report"
      testID="student-report-drawer"
    >
      {student ? (
        <View style={styles.student}>
          <Avatar person={student.person} size={48} />
          <View style={styles.studentText}>
            <Text style={[styles.name, { color: p.ink }]}>{student.name}</Text>
            <Text style={[styles.meta, { color: p.muted }]}>{student.index}</Text>
          </View>
        </View>
      ) : null}
      <TextInput
        multiline
        onChangeText={setMessage}
        placeholder="Describe the concern"
        placeholderTextColor={p.muted}
        style={[
          styles.input,
          { backgroundColor: p.surfaceDim, borderColor: p.hairline, color: p.ink },
        ]}
        textAlignVertical="top"
        value={message}
      />
      <HapticPressable
        accessibilityRole="button"
        disabled={!message.trim() || create.isPending}
        haptic="success"
        onPress={send}
        style={[
          styles.send,
          { backgroundColor: p.primary },
          (!message.trim() || create.isPending) && styles.disabled,
        ]}
        testID="student-report-send"
      >
        <Text style={[styles.sendText, { color: p.onPrimary }]}>
          {create.isPending ? 'Sending...' : 'Send report'}
        </Text>
      </HapticPressable>
    </BottomDrawer>
  );
}

const styles = StyleSheet.create({
  student: { alignItems: 'center', flexDirection: 'row', gap: spacing.md },
  studentText: { flex: 1 },
  name: { fontSize: 15, fontWeight: '800' },
  meta: { fontSize: 12, marginTop: 2 },
  input: {
    borderRadius: radii.md,
    borderWidth: 1,
    fontSize: 15,
    minHeight: 120,
    padding: spacing.md,
  },
  send: { alignItems: 'center', borderRadius: radii.pill, minHeight: 52, justifyContent: 'center' },
  sendText: { fontSize: 15, fontWeight: '700' },
  disabled: { opacity: 0.45 },
});
