import { useCallback, useRef, useState } from 'react';
import {
  Animated,
  Platform,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
  type ViewStyle,
} from 'react-native';
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
  ROOM_SETUP_SKY_IMAGE_URL,
  ROOM_SETUP_STUDENTS_IMAGE_URL,
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

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function RoomSetupScreen(_props: RoomSetupScreenProps) {
  const { height, width } = useWindowDimensions();
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
  const drawerPadding = clamp(width * 0.04, 12, 18);
  const formWidth = Math.min(360, width - drawerPadding * 2);
  const inputHeight = clamp(height * 0.059, 44, 50);
  const inputFontSize = clamp(width * 0.041, 14, 16);
  const rowGap = clamp(width * 0.025, 8, 10);
  const formGap = clamp(height * 0.011, 7, 9);
  const floorWidth = clamp(formWidth * 0.4, 122, 146);
  const floorButtonSize = clamp(inputHeight * 0.6, 28, 30);
  const inputStyle = {
    borderRadius: inputHeight / 2,
    fontSize: inputFontSize,
    height: inputHeight,
    minWidth: 0,
    paddingHorizontal: clamp(width * 0.041, 14, 16),
  };
  const rowStyle = { gap: rowGap };
  const roundActionStyle = {
    borderRadius: inputHeight / 2,
    height: inputHeight,
    width: inputHeight,
  };
  const webViewportLock =
    Platform.OS === 'web'
      ? ({
          bottom: 0,
          height: '100dvh',
          left: 0,
          maxHeight: '100dvh',
          overflow: 'hidden',
          position: 'fixed',
          right: 0,
          top: 0,
          width: '100vw',
        } as unknown as ViewStyle)
      : null;

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
    <View style={[styles.screen, webViewportLock]}>
      <SystemStatusBar backgroundColor="transparent" barStyle="light-content" translucent />
      <RoomCreationPreview
        collapsedImageUri={ROOM_SETUP_STUDENTS_IMAGE_URL}
        expandedImageUri={ROOM_SETUP_SKY_IMAGE_URL}
        imageProgress={drawer.progress}
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
                {
                  bottom: 0,
                  paddingHorizontal: drawerPadding,
                  paddingTop: formGap,
                  top: drawerBodyTop,
                },
              ]}
            >
              <ScrollView
                automaticallyAdjustKeyboardInsets
                bounces={false}
                contentContainerStyle={[
                  styles.formScrollContent,
                  { paddingBottom: controlsClearance + formGap, paddingTop: formGap },
                ]}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                style={styles.formScroll}
              >
                <View style={[styles.expandedForm, { flex: 0, gap: formGap, maxWidth: formWidth }]}>
                  <View style={[styles.row, rowStyle]}>
                    <Field
                      onChangeText={setBuilding}
                      placeholder="Building or College"
                      style={inputStyle}
                      value={building}
                    />
                  </View>
                  <View style={[styles.row, rowStyle]}>
                    <Field
                      onChangeText={setRoomNumber}
                      placeholder="Room Number"
                      style={inputStyle}
                      value={roomNumber}
                    />
                    <View
                      style={[
                        styles.floor,
                        {
                          borderRadius: inputHeight / 2,
                          flexBasis: floorWidth,
                          flexGrow: 0,
                          flexShrink: 0,
                          height: inputHeight,
                          paddingHorizontal: clamp(width * 0.018, 6, 8),
                          width: floorWidth,
                        },
                      ]}
                    >
                      <Pressable
                        accessibilityLabel="Decrease floor"
                        onPress={() => setFloorIndex((value) => Math.max(0, value - 1))}
                        style={[
                          styles.floorButton,
                          {
                            borderRadius: floorButtonSize / 2,
                            height: floorButtonSize,
                            width: floorButtonSize,
                          },
                        ]}
                      >
                        <RoomIcon color="#667085" name="minus" size={16} strokeWidth={2.4} />
                      </Pressable>
                      <Text
                        adjustsFontSizeToFit
                        maxFontSizeMultiplier={1}
                        minimumFontScale={0.78}
                        numberOfLines={1}
                        style={[styles.floorText, { fontSize: inputFontSize }]}
                      >
                        {ROOM_SETUP_FLOORS[floorIndex]}
                      </Text>
                      <Pressable
                        accessibilityLabel="Increase floor"
                        onPress={() =>
                          setFloorIndex((value) =>
                            Math.min(ROOM_SETUP_FLOORS.length - 1, value + 1),
                          )
                        }
                        style={[
                          styles.floorButton,
                          {
                            borderRadius: floorButtonSize / 2,
                            height: floorButtonSize,
                            width: floorButtonSize,
                          },
                        ]}
                      >
                        <RoomIcon color="#667085" name="plus" size={16} strokeWidth={2.4} />
                      </Pressable>
                    </View>
                  </View>
                  <View style={styles.formDivider} />
                  <View style={[styles.row, rowStyle]}>
                    <Field
                      keyboardType="number-pad"
                      onChangeText={setIndexFrom}
                      placeholder="Index From"
                      style={[inputStyle, styles.rangeInput]}
                      value={indexFrom}
                    />
                    <Field
                      keyboardType="number-pad"
                      onChangeText={setIndexTo}
                      placeholder="Index To"
                      style={[inputStyle, styles.rangeInput]}
                      value={indexTo}
                    />
                  </View>
                  <View style={[styles.row, rowStyle]}>
                    <Field
                      onChangeText={setCourse}
                      placeholder="Course Code"
                      style={inputStyle}
                      value={course}
                    />
                    <RoundAction
                      icon="plus"
                      label="Add course range"
                      onPress={addCourse}
                      style={roundActionStyle}
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
              </ScrollView>
            </Animated.View>
          </Animated.View>
        ) : null}
      </RoomCreationPreview>
    </View>
  );
}
