import { ScrollView, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { RoomIcon } from '@/components/room/RoomSetupControls';
import { roomSessionHistoryStyles as styles } from '@/components/room/roomSessionHistoryStyles';

const SESSIONS = [
  { code: '482913', meta: 'MATH 101 - Room 204', total: '46 students' },
  { code: '314720', meta: 'CS 205 - Block B', total: '31 students' },
  { code: '809122', meta: 'STAT 151 - Lab 2', total: '18 students' },
];

export function RoomSessionHistory({ style }: { style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.shell, style]}>
      <View style={styles.header}>
        <Text style={styles.title}>Session History</Text>
        <RoomIcon color="#FFFFFF" name="history" size={17} strokeWidth={2.2} />
      </View>
      <ScrollView
        nestedScrollEnabled
        showsVerticalScrollIndicator={false}
        style={styles.list}
        contentContainerStyle={styles.listContent}
      >
        {SESSIONS.map((session) => (
          <View key={session.code} style={styles.item}>
            <View style={styles.divider} />
            <View style={styles.itemBody}>
              <Text style={styles.code}>{session.code}</Text>
              <View style={styles.itemCopy}>
                <Text style={styles.meta}>{session.meta}</Text>
                <Text style={styles.total}>{session.total}</Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
      <View pointerEvents="none" style={styles.fadeEdge} />
    </View>
  );
}
