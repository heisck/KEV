import { useState } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { VerifiedBadgeIcon } from '@/components/nfc/NfcIcons';
import { RoomIcon } from '@/components/room/RoomSetupControls';
import { SystemStatusBar } from '@/components/SystemStatusBar';
import { studentVerificationResultStyles as styles } from '@/screens/studentVerificationResultStyles';

type StudentResult = {
  classLabel: string;
  indexNumber: string;
  name: string;
  photoUrl: string;
  programme: string;
};

type StudentVerificationResultScreenProps = {
  initialInClass?: boolean;
  onAddToClass?: () => void;
  onClose?: () => void;
  onRemoveFromClass?: () => void;
  student?: StudentResult;
};

const DEFAULT_STUDENT: StudentResult = {
  classLabel: 'MATH 101 · Main Auditorium',
  indexNumber: '1001',
  name: 'Ama Serwaa Mensah',
  photoUrl:
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=320&q=80',
  programme: 'BSc Computer Science',
};

export function StudentVerificationResultScreen({
  initialInClass = false,
  onAddToClass,
  onClose,
  onRemoveFromClass,
  student = DEFAULT_STUDENT,
}: StudentVerificationResultScreenProps) {
  const { bottom, top } = useSafeAreaInsets();
  const [isInClass, setIsInClass] = useState(initialInClass);

  const handleClassAction = () => {
    if (isInClass) {
      setIsInClass(false);
      onRemoveFromClass?.();
      return;
    }

    setIsInClass(true);
    onAddToClass?.();
  };

  return (
    <View style={styles.screen}>
      <SystemStatusBar backgroundColor="#F2F3FF" barStyle="dark-content" />
      <View style={[styles.nav, { paddingTop: Math.max(top, 14) }]}>
        <Pressable
          accessibilityLabel="Close verification result"
          accessibilityRole="button"
          onPress={onClose}
          style={styles.navButton}
        >
          <RoomIcon color="#131B2E" name="close" size={18} strokeWidth={2.3} />
        </Pressable>
      </View>

      <View style={[styles.content, { paddingBottom: bottom + 28, paddingTop: top + 78 }]}>
        <View style={styles.statusGroup}>
          <Text style={styles.statusLabel}>Student verified</Text>
          <Text style={styles.statusText}>Identity match confirmed</Text>
        </View>

        <View style={styles.photoWrap}>
          <Image
            accessibilityLabel={`${student.name} photo`}
            accessibilityIgnoresInvertColors
            source={{ uri: student.photoUrl }}
            style={styles.photo}
          />
          <View style={styles.badge}>
            <VerifiedBadgeIcon />
          </View>
        </View>

        <View style={styles.studentBlock}>
          <Text style={styles.studentName}>{student.name}</Text>
          <Text style={styles.studentMeta}>{student.indexNumber}</Text>
          <Text style={styles.studentMeta}>{student.programme}</Text>
          <Text style={styles.classState}>{isInClass ? 'Added to class' : student.classLabel}</Text>
        </View>

        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            onPress={handleClassAction}
            style={[styles.classButton, isInClass && styles.removeButton]}
          >
            <Text style={[styles.classButtonText, isInClass && styles.removeButtonText]}>
              {isInClass ? 'Remove from class' : 'Add to class'}
            </Text>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={onClose} style={styles.closeTextButton}>
            <Text style={styles.closeText}>Close</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
