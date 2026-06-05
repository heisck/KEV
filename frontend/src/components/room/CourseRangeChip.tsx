import { Pressable, Text, View } from 'react-native';

import { RoomIcon } from '@/components/room/RoomSetupControls';
import { roomSetupStyles as styles } from '@/screens/roomSetupStyles';

type CourseRangeChipProps = {
  label: string;
  onRemove: () => void;
};

export function CourseRangeChip({ label, onRemove }: CourseRangeChipProps) {
  return (
    <View style={styles.chip}>
      <Text numberOfLines={2} style={styles.chipText}>
        {label}
      </Text>
      <Pressable
        accessibilityLabel={`Remove ${label}`}
        accessibilityRole="button"
        hitSlop={8}
        onPress={onRemove}
        style={styles.chipEditButton}
      >
        <RoomIcon color="#5C9E08" name="close" size={10} strokeWidth={2.8} />
      </Pressable>
    </View>
  );
}
