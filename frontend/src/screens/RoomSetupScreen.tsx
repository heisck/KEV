import { useCallback, useRef, useState } from 'react';
import { Animated, Pressable, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SystemStatusBar } from '@/components/SystemStatusBar';
import { CourseRangeChip } from '@/components/room/CourseRangeChip';
import { RoomCreationPreview } from '@/components/room/RoomCreationPreview';
import { CircleButton, Field, RoomIcon, RoundAction } from '@/components/room/RoomSetupControls';
import { roomSetupDrawerStyles as drawerStyles } from '@/components/room/roomSetupDrawerStyles';
import { useDropDownPanel } from '@/hooks/useDropDownPanel';
import {
  DEFAULT_ROOM_SETUP_FLOOR_INDEX,
  ROOM_CREATION_IMAGE_HEIGHT_RATIO,
  ROOM_CREATION_INNER_STEP_RATIO,
  ROOM_CREATION_OUTER_STEP_RATIO,
  ROOM_SETUP_FLOORS,
  ROOM_SETUP_IMAGE_URL,
} from '@/screens/roomSetupConfig';
import { roomSetupStyles as styles } from '@/screens/roomSetupStyles';

type RoomSetupScreenProps = {
  onClose?: () => void;
  onComplete?: () => void;
  roomCode?: string;
};
type CourseRange = { course: string; id: string; indexFrom: string; indexTo: string };

function getCourseRangeLabel({ course, indexFrom, indexTo }: CourseRange) {
  return `${indexFrom}-${indexTo} ${course}`;
}

export function RoomSetupScreen(_props: RoomSetupScreenProps) {
  const { height } = useWindowDimensions();
  const { bottom } = useSafeAreaInsets();
  const [floorIndex, setFloorIndex] = useState(DEFAULT_ROOM_SETUP_FLOOR_INDEX);
  const [building, setBuilding] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [course, setCourse] = useState('');
  const [indexFrom, setIndexFrom] = useState('');
  const [indexTo, setIndexTo] = useState('');
  const [courses, setCourses] = useState<CourseRange[]>([]);
  const nextCourseId = useRef(0);
  const outerStepHeight = height * ROOM_CREATION_OUTER_STEP_RATIO;
  const innerStepHeight = height * ROOM_CREATION_INNER_STEP_RATIO;
  const drawerTop = height * ROOM_CREATION_IMAGE_HEIGHT_RATIO - outerStepHeight;
  const drawerBodyTop = Math.max(0, outerStepHeight - innerStepHeight * 0.36);
  const drawer = useDropDownPanel(height - drawerTop);
  const controlsClearance = Math.max(bottom, 16) + 88;

  const addCourse = useCallback(() => {
    const item = {
      course: course.trim() || 'Course',
      id: String(nextCourseId.current),
      indexFrom: indexFrom.trim() || 'From',
      indexTo: indexTo.trim() || 'To',
    };

    nextCourseId.current += 1;
    setCourses((current) => [...current, item].slice(-3));
    setIndexFrom('');
    setIndexTo('');
    setCourse('');
  }, [course, indexFrom, indexTo]);

  const removeCourse = useCallback((id: string) => {
    setCourses((current) => current.filter((courseItem) => courseItem.id !== id));
  }, []);

  return (
    <View style={styles.screen}>
      <SystemStatusBar backgroundColor="transparent" barStyle="light-content" translucent />
      <RoomCreationPreview
        imageUri={ROOM_SETUP_IMAGE_URL}
        isCreateOpen={drawer.isVisible}
        onCreateProgress={drawer.setProgress}
        onCreateSettle={drawer.settle}
      >
        {drawer.isVisible ? (
          <Animated.View
            pointerEvents="box-none"
            style={[drawerStyles.container, { height: drawer.height, top: drawerTop }]}
          >
            <View style={[drawerStyles.stepLeft, { height: outerStepHeight, top: 0 }]} />
            <View
              style={[
                drawerStyles.stepLeftInner,
                { height: innerStepHeight, top: outerStepHeight - innerStepHeight },
              ]}
            />
            <View style={[drawerStyles.stepRight, { height: outerStepHeight, top: 0 }]} />
            <View
              style={[
                drawerStyles.stepRightInner,
                { height: innerStepHeight, top: outerStepHeight - innerStepHeight },
              ]}
            />
            <View style={[drawerStyles.backButton, { top: Math.max(4, outerStepHeight - 42) }]}>
              <CircleButton icon="back" label="Collapse room setup" onPress={drawer.hide} />
            </View>
            <Animated.View
              style={[
                drawerStyles.body,
                { bottom: 0, paddingBottom: controlsClearance, top: drawerBodyTop },
              ]}
            >
              <View style={styles.expandedForm}>
                <View style={styles.row}>
                  <Field
                    onChangeText={setBuilding}
                    placeholder="Building or College"
                    value={building}
                  />
                </View>
                <View style={styles.row}>
                  <Field
                    onChangeText={setRoomNumber}
                    placeholder="Room Number"
                    value={roomNumber}
                  />
                  <View style={styles.floor}>
                    <Pressable
                      accessibilityLabel="Decrease floor"
                      onPress={() => setFloorIndex((value) => Math.max(0, value - 1))}
                      style={styles.floorButton}
                    >
                      <RoomIcon color="#667085" name="minus" size={16} strokeWidth={2.4} />
                    </Pressable>
                    <Text style={styles.floorText}>{ROOM_SETUP_FLOORS[floorIndex]}</Text>
                    <Pressable
                      accessibilityLabel="Increase floor"
                      onPress={() =>
                        setFloorIndex((value) => Math.min(ROOM_SETUP_FLOORS.length - 1, value + 1))
                      }
                      style={styles.floorButton}
                    >
                      <RoomIcon color="#667085" name="plus" size={16} strokeWidth={2.4} />
                    </Pressable>
                  </View>
                </View>
                <View style={styles.formDivider} />
                <View style={styles.row}>
                  <Field
                    keyboardType="number-pad"
                    onChangeText={setIndexFrom}
                    placeholder="Index From"
                    style={styles.rangeInput}
                    value={indexFrom}
                  />
                  <Field
                    keyboardType="number-pad"
                    onChangeText={setIndexTo}
                    placeholder="Index To"
                    style={styles.rangeInput}
                    value={indexTo}
                  />
                </View>
                <View style={styles.row}>
                  <Field onChangeText={setCourse} placeholder="Course Code" value={course} />
                  <RoundAction
                    icon="plus"
                    label="Add course range"
                    onPress={addCourse}
                    tone="muted"
                  />
                </View>
                <View style={styles.actions}>
                  {courses.length > 0 ? (
                    <View style={styles.chipsRow}>
                      {courses.map((item) => (
                        <CourseRangeChip
                          key={item.id}
                          label={getCourseRangeLabel(item)}
                          onRemove={() => removeCourse(item.id)}
                        />
                      ))}
                    </View>
                  ) : null}
                </View>
              </View>
            </Animated.View>
          </Animated.View>
        ) : null}
      </RoomCreationPreview>
    </View>
  );
}
