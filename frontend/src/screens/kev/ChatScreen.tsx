import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useLecturers } from '@/api/hooks';
import * as chatApi from '@/api/chat';
import { queryClient } from '@/api/queryClient';
import { BackIcon } from '@/components/kev/icons';
import { Avatar, personForId } from '@/components/kev/people';
import { HapticPressable } from '@/components/ui/HapticPressable';
import { parseMessages } from '@/lib/chatMessages';
import { useChatStore } from '@/store/chatStore';
import { useAuthStore } from '@/store/authStore';
import { colors, radii, spacing, usePalette } from '@/theme';

type ChatScreenProps = { threadId?: string };

const CHAT_POLL_MS = 2_000;

/** Full-screen lecturer thread. The directory lives in the tabs group. */
export function ChatScreen({ threadId }: ChatScreenProps = {}) {
  const p = usePalette();
  const { top, bottom } = useSafeAreaInsets();
  const router = useRouter();
  const { with: withId } = useLocalSearchParams<{ with?: string }>();
  const threads = useChatStore((s) => s.threads);
  const currentUserId = useAuthStore((s) => s.user?.id);
  const storedActiveId = useChatStore((s) => s.activeLecturerId);
  const activeId = threadId ?? storedActiveId;
  const openThread = useChatStore((s) => s.openThread);
  const closeThread = useChatStore((s) => s.closeThread);
  const appendMessage = useChatStore((s) => s.appendMessage);
  const replaceMessage = useChatStore((s) => s.replaceMessage);
  const setThreadMessages = useChatStore((s) => s.setThreadMessages);
  const [draft, setDraft] = useState('');
  const listRef = useRef<FlatList>(null);

  const { data: lecturers } = useLecturers();

  useEffect(() => {
    if (!threadId) return undefined;
    openThread(threadId);
    return closeThread;
  }, [closeThread, openThread, threadId]);

  // Deep-link from "Message in chat" / invigilators.
  useEffect(() => {
    if (typeof withId === 'string' && withId.length > 0) {
      openThread(withId);
    }
  }, [openThread, withId]);

  // Poll while a thread is open so both lecturers see persisted messages promptly.
  useEffect(() => {
    if (!activeId) return undefined;
    let active = true;
    const load = () => {
      chatApi
        .listMessages(activeId)
        .then((data) => {
          if (!active) return;
          setThreadMessages(activeId, parseMessages(data, currentUserId));
          void chatApi.markConversationRead(activeId).then(() => {
            void queryClient.invalidateQueries({ queryKey: ['chat', 'conversations'] });
            void queryClient.invalidateQueries({ queryKey: ['notifications'] });
          });
        })
        .catch(() => {
          // Ignore offline fallback
        });
    };
    load();
    const interval = setInterval(load, CHAT_POLL_MS);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [activeId, currentUserId, setThreadMessages]);

  const peer = useMemo(() => {
    const found = lecturers?.find((i) => i.id === activeId);
    if (!found) return { id: activeId || '0', name: 'Lecturer Staff', hall: 'Exam Hall' };
    return {
      id: found.id,
      name: found.displayName || found.email,
      hall: found.role || 'Staff',
    };
  }, [activeId, lecturers]);

  const messages = activeId ? (threads[activeId] ?? []) : [];

  const submit = async () => {
    if (!activeId || !draft.trim()) return;
    const content = draft.trim();
    const createdAt = new Date().toISOString();
    const temporaryId = `pending-${createdAt}`;
    appendMessage(activeId, {
      id: temporaryId,
      text: content,
      mine: true,
      at: new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdAt,
      status: 'sending',
    });
    setDraft('');
    try {
      const response = await chatApi.sendMessage(activeId, content);
      const [message] = parseMessages([response], currentUserId);
      if (message) replaceMessage(activeId, temporaryId, message);
      void queryClient.invalidateQueries({ queryKey: ['chat', 'conversations'] });
      requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
    } catch {
      replaceMessage(activeId, temporaryId, {
        id: temporaryId,
        text: content,
        mine: true,
        at: new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        createdAt,
        status: 'failed',
      });
    }
  };

  if (activeId && peer) {
    return (
      <KeyboardAvoidingView
        style={[styles.screen, { backgroundColor: p.bg, paddingTop: top + spacing.md }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={8}
      >
        <View style={[styles.threadHeader, { borderBottomColor: p.hairline }]}>
          <HapticPressable
            accessibilityRole="button"
            accessibilityLabel="Back to inbox"
            haptic="select"
            hitSlop={10}
            onPress={() => (threadId ? router.back() : closeThread())}
            style={styles.backBtn}
          >
            <BackIcon color={p.ink} />
          </HapticPressable>
          <Avatar person={personForId(peer.id)} size={36} verified />
          <View style={styles.threadHeadText}>
            <Text style={[styles.threadName, { color: p.ink }]} numberOfLines={1}>
              {peer.name}
            </Text>
            <Text style={[styles.threadSub, { color: p.muted }]} numberOfLines={1}>
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
            <Text style={[styles.threadEmpty, { color: p.muted }]}>
              Say hello. Start your conversation.
            </Text>
          }
          renderItem={({ item }) => (
            <View
              style={[
                styles.bubble,
                item.mine
                  ? [styles.bubbleMine, { backgroundColor: p.primary }]
                  : [styles.bubbleTheirs, { backgroundColor: p.surfaceDim }],
              ]}
            >
              <Text
                style={[
                  styles.bubbleText,
                  { color: p.ink },
                  item.mine && [styles.bubbleTextMine, { color: p.onPrimary }],
                ]}
              >
                {item.text}
              </Text>
              <Text
                style={[styles.bubbleTime, { color: p.muted }, item.mine && styles.bubbleTimeMine]}
              >
                {item.at}
                {item.mine ? ` · ${receipt(item.status)}` : ''}
              </Text>
            </View>
          )}
        />

        <View
          style={[
            styles.composer,
            { borderTopColor: p.hairline, paddingBottom: Math.max(bottom, spacing.md) },
          ]}
        >
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Message…"
            placeholderTextColor={p.muted}
            style={[styles.input, { backgroundColor: p.surfaceDim, color: p.ink }]}
            returnKeyType="send"
            onSubmitEditing={submit}
            testID="chat-input"
          />
          <HapticPressable
            accessibilityRole="button"
            accessibilityLabel="Send message"
            disabled={!draft.trim()}
            onPress={submit}
            style={[
              styles.send,
              { backgroundColor: p.primary },
              !draft.trim() && styles.sendDisabled,
            ]}
            testID="chat-send"
          >
            <Text style={[styles.sendText, { color: p.onPrimary }]}>Send</Text>
          </HapticPressable>
        </View>
      </KeyboardAvoidingView>
    );
  }

  return <View style={[styles.screen, { backgroundColor: p.bg }]} />;
}

function receipt(status: 'sending' | 'sent' | 'read' | 'failed'): string {
  if (status === 'sending') return 'Sending';
  if (status === 'failed') return 'Not sent';
  return status === 'read' ? '✓✓' : '✓';
}
const styles = StyleSheet.create({
  screen: { backgroundColor: colors.white, flex: 1 },
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
