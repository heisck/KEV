import { useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackIcon } from '@/components/kev/icons';
import { Avatar, type PersonKey } from '@/components/kev/people';
import { HapticPressable } from '@/components/ui/HapticPressable';
import { INVIGILATORS } from '@/data/exams';
import { useChatStore } from '@/store/chatStore';
import { colors, radii, spacing } from '@/theme';

/** Lecturer inbox + thread. Open via `/(tabs)/chat?with=<lecturerId>`. */
export function ChatScreen() {
  const { top, bottom } = useSafeAreaInsets();
  const { with: withId } = useLocalSearchParams<{ with?: string }>();
  const threads = useChatStore((s) => s.threads);
  const activeId = useChatStore((s) => s.activeLecturerId);
  const openThread = useChatStore((s) => s.openThread);
  const closeThread = useChatStore((s) => s.closeThread);
  const send = useChatStore((s) => s.send);
  const [draft, setDraft] = useState('');
  const listRef = useRef<FlatList>(null);

  // Deep-link from "Message in chat" / invigilators.
  useEffect(() => {
    if (typeof withId === 'string' && withId.length > 0) {
      openThread(withId);
    }
  }, [openThread, withId]);

  const peer = useMemo(() => INVIGILATORS.find((i) => i.id === activeId) ?? null, [activeId]);
  const messages = activeId ? (threads[activeId] ?? []) : [];

  const submit = () => {
    if (!activeId || !draft.trim()) return;
    send(activeId, draft);
    setDraft('');
    requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
  };

  if (activeId && peer) {
    return (
      <KeyboardAvoidingView
        style={[styles.screen, { paddingTop: top + spacing.md }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={8}
      >
        <View style={styles.threadHeader}>
          <HapticPressable
            accessibilityRole="button"
            accessibilityLabel="Back to inbox"
            haptic="select"
            hitSlop={10}
            onPress={closeThread}
            style={styles.backBtn}
          >
            <BackIcon color={colors.ink} />
          </HapticPressable>
          <Avatar person={peer.person as PersonKey} size={36} verified />
          <View style={styles.threadHeadText}>
            <Text style={styles.threadName} numberOfLines={1}>
              {peer.name}
            </Text>
            <Text style={styles.threadSub} numberOfLines={1}>
              {peer.hall}
            </Text>
          </View>
        </View>

        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m) => m.id}
          contentContainerStyle={styles.messages}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
          ListEmptyComponent={
            <Text style={styles.threadEmpty}>Say hello — this is the start of your chat.</Text>
          }
          renderItem={({ item }) => (
            <View style={[styles.bubble, item.mine ? styles.bubbleMine : styles.bubbleTheirs]}>
              <Text style={[styles.bubbleText, item.mine && styles.bubbleTextMine]}>
                {item.text}
              </Text>
              <Text style={[styles.bubbleTime, item.mine && styles.bubbleTimeMine]}>{item.at}</Text>
            </View>
          )}
        />

        <View style={[styles.composer, { paddingBottom: Math.max(bottom, spacing.md) }]}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Message…"
            placeholderTextColor={colors.muted}
            style={styles.input}
            returnKeyType="send"
            onSubmitEditing={submit}
            testID="chat-input"
          />
          <HapticPressable
            accessibilityRole="button"
            accessibilityLabel="Send message"
            disabled={!draft.trim()}
            onPress={submit}
            style={[styles.send, !draft.trim() && styles.sendDisabled]}
            testID="chat-send"
          >
            <Text style={styles.sendText}>Send</Text>
          </HapticPressable>
        </View>
      </KeyboardAvoidingView>
    );
  }

  // Inbox: every lecturer is messageable.
  return (
    <View style={[styles.screen, { paddingTop: top + spacing.md }]}>
      <Text style={styles.title}>Chat</Text>
      <Text style={styles.subtitle}>Message other lecturers on this session.</Text>
      <ScrollView contentContainerStyle={styles.inbox} showsVerticalScrollIndicator={false}>
        {INVIGILATORS.map((i) => {
          const last = threads[i.id]?.[threads[i.id].length - 1];
          return (
            <HapticPressable
              key={i.id}
              accessibilityRole="button"
              accessibilityLabel={`Chat with ${i.name}`}
              haptic="select"
              onPress={() => openThread(i.id)}
              style={styles.row}
              testID={`chat-row-${i.id}`}
            >
              <Avatar person={i.person as PersonKey} size={48} verified />
              <View style={styles.rowText}>
                <Text style={styles.rowName}>{i.name}</Text>
                <Text style={styles.rowPreview} numberOfLines={1}>
                  {last?.text ?? 'No messages yet — tap to start'}
                </Text>
              </View>
              {last ? <Text style={styles.rowTime}>{last.at}</Text> : null}
            </HapticPressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: colors.white, flex: 1 },
  title: {
    color: colors.ink,
    fontSize: 24,
    fontWeight: '800',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
  },
  subtitle: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '500',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  inbox: { gap: spacing.sm, paddingBottom: spacing.xxxl, paddingHorizontal: spacing.xl },
  row: {
    alignItems: 'center',
    backgroundColor: colors.surfaceDim,
    borderRadius: radii.lg,
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
  },
  rowText: { flex: 1, gap: 2 },
  rowName: { color: colors.ink, fontSize: 15, fontWeight: '700' },
  rowPreview: { color: colors.muted, fontSize: 13, fontWeight: '500' },
  rowTime: { color: colors.muted, fontSize: 11, fontWeight: '600' },

  threadHeader: {
    alignItems: 'center',
    borderBottomColor: colors.hairline,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: spacing.md,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  backBtn: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  threadHeadText: { flex: 1, gap: 1 },
  threadName: { color: colors.ink, fontSize: 16, fontWeight: '700' },
  threadSub: { color: colors.muted, fontSize: 12, fontWeight: '500' },
  messages: { flexGrow: 1, gap: spacing.sm, padding: spacing.lg },
  threadEmpty: {
    color: colors.muted,
    fontSize: 13,
    marginTop: spacing.xxxl,
    textAlign: 'center',
  },
  bubble: {
    borderRadius: radii.md,
    maxWidth: '78%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  bubbleMine: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  bubbleTheirs: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surfaceDim,
    borderBottomLeftRadius: 4,
  },
  bubbleText: { color: colors.ink, fontSize: 15, fontWeight: '500', lineHeight: 20 },
  bubbleTextMine: { color: colors.white },
  bubbleTime: {
    alignSelf: 'flex-end',
    color: colors.muted,
    fontSize: 10,
    fontWeight: '600',
    marginTop: 4,
  },
  bubbleTimeMine: { color: 'rgba(255,255,255,0.75)' },
  composer: {
    alignItems: 'center',
    borderTopColor: colors.hairline,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  input: {
    backgroundColor: colors.surfaceDim,
    borderRadius: radii.pill,
    color: colors.ink,
    flex: 1,
    fontSize: 15,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  send: {
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  sendDisabled: { opacity: 0.4 },
  sendText: { color: colors.white, fontSize: 14, fontWeight: '700' },
});
