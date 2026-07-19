import { Text, View } from 'react-native';

import { RoomIcon } from '@/components/room/RoomSetupControls';
import { HapticPressable } from '@/components/ui/HapticPressable';
import { roomSetupStyles as styles } from '@/screens/roomSetupStyles';
import { colors } from '@/theme';

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
      <HapticPressable
        accessibilityLabel={`Remove ${label}`}
        accessibilityRole="button"
        haptic="select"
        hitSlop={8}
        onPress={onRemove}
        style={styles.chipEditButton}
      >
        <RoomIcon color={colors.primary} name="close" size={10} strokeWidth={2.8} />
      </HapticPressable>
    </View>
  );
}
