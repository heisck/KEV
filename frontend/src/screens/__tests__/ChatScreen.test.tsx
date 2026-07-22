import { fireEvent, render } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ChatDirectoryScreen } from '@/screens/kev/ChatDirectoryScreen';
import { parseMessages } from '@/lib/chatMessages';
import { ChatScreen } from '@/screens/kev/ChatScreen';
import { useAuthStore } from '@/store/authStore';
import { useChatStore } from '@/store/chatStore';

const mockBack = jest.fn();
const mockPush = jest.fn();
let mockConversations: {
  peer: { id: string };
  lastMessage: { content: string; createdAt: string };
  unreadCount: number;
}[] = [];

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({}),
  useRouter: () => ({ back: mockBack, push: mockPush }),
}));
jest.mock('@/api/hooks', () => ({
  useConversations: () => ({ data: mockConversations }),
  useLecturers: () => ({
    data: [
      { id: 'me', displayName: 'Signed In', email: 'me@example.com', role: 'LECTURER' },
      { id: 'l1', displayName: 'Ada Mensah', email: 'ada@example.com', role: 'LECTURER' },
      { id: 'l2', displayName: 'Kojo Asare', email: 'kojo@example.com', role: 'LECTURER' },
    ],
  }),
}));
jest.mock('@/api/client', () => ({
  api: {
    get: jest.fn(() => new Promise(() => undefined)),
    post: jest.fn(async () => ({ data: {} })),
  },
}));

function renderScreen(screen: React.ReactElement) {
  return render(
    <SafeAreaProvider
      initialMetrics={{
        frame: { height: 844, width: 390, x: 0, y: 0 },
        insets: { bottom: 0, left: 0, right: 0, top: 0 },
      }}
    >
      {screen}
    </SafeAreaProvider>,
  );
}

describe('chat navigation', () => {
  beforeEach(() => {
    mockBack.mockClear();
    mockPush.mockClear();
    useAuthStore.setState({
      status: 'authenticated',
      user: { id: 'me', email: 'me@example.com', role: 'LECTURER', plan: 'FREE' },
    });
    useChatStore.setState({ activeLecturerId: null, threads: {} });
    mockConversations = [];
  });

  it('opens a thread in the root stack', () => {
    const { getByLabelText, queryByLabelText } = renderScreen(<ChatDirectoryScreen />);

    expect(queryByLabelText('Chat with Signed In')).toBeNull();

    fireEvent.press(getByLabelText('Chat with Ada Mensah'));

    expect(mockPush).toHaveBeenCalledWith({ pathname: '/chat/[id]', params: { id: 'l1' } });
  });

  it('shows unread previews and orders the newest conversation first', () => {
    mockConversations = [
      {
        peer: { id: 'l1' },
        lastMessage: { content: 'Older message', createdAt: '2026-07-20T12:00:00Z' },
        unreadCount: 0,
      },
      {
        peer: { id: 'l2' },
        lastMessage: { content: 'Newest message', createdAt: '2026-07-20T12:05:00Z' },
        unreadCount: 2,
      },
    ];

    const { getAllByTestId, getByText } = renderScreen(<ChatDirectoryScreen />);

    expect(getAllByTestId(/^chat-row-/).map((row) => row.props.testID)).toEqual([
      'chat-row-l2',
      'chat-row-l1',
    ]);
    expect(getByText('Newest message')).toBeTruthy();
    expect(getByText('2')).toBeTruthy();
  });

  it('keeps one copy of a server message in its peer thread', () => {
    const message = {
      id: '7',
      text: 'Hello',
      mine: true,
      at: '12:00',
      createdAt: '2026-07-20T12:00:00.000Z',
      status: 'sent' as const,
    };

    useChatStore.getState().appendMessage('l1', message);
    useChatStore.getState().appendMessage('l1', message);

    expect(useChatStore.getState().threads.l1).toEqual([message]);
  });

  it('uses clean empty copy and returns through stack navigation', () => {
    const { getByLabelText, getByText } = renderScreen(<ChatScreen threadId="l1" />);

    expect(getByText('Say hello. Start your conversation.')).toBeTruthy();
    fireEvent.press(getByLabelText('Back to inbox'));
    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it('distinguishes received messages from the signed-in lecturer messages', () => {
    const messages = parseMessages(
      [
        { id: 1, senderId: 'me', content: 'Sent', read: false, createdAt: '2026-07-20T12:00:00Z' },
        {
          id: 2,
          senderId: 'peer',
          content: 'Received',
          read: true,
          createdAt: '2026-07-20T12:01:00Z',
        },
      ],
      'me',
    );

    expect(messages.map((message) => message.mine)).toEqual([true, false]);
  });
});
