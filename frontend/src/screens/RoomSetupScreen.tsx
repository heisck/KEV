import { useCallback, useRef, useState } from 'react';
import { Animated, Image, Pressable, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppLogoMark, getCenteredHeroLogoTop } from '@/components/AppLogoMark';
import { SystemStatusBar } from '@/components/SystemStatusBar';
import { CourseRangeChip } from '@/components/room/CourseRangeChip';
import { Field, RoomIcon, RoundAction, SendBadgeIcon } from '@/components/room/RoomSetupControls';
import { RoomSetupDock } from '@/components/room/RoomSetupDock';
import { RoomSessionHistory } from '@/components/room/RoomSessionHistory';
import { RoomSetupSwipePrompt } from '@/components/room/RoomSetupSwipePrompt';
import { RoomSetupTopNav } from '@/components/room/RoomSetupTopNav';
import { LIMEADE } from '@/screens/authConfig';
import {
  DEFAULT_ROOM_SETUP_FLOOR_INDEX,
  ROOM_SETUP_FLOORS,
  ROOM_SETUP_IMAGE_URL,
} from '@/screens/roomSetupConfig';
import { roomSetupStyles as styles } from '@/screens/roomSetupStyles';
import { useSlideUpPanel } from '@/hooks/useSlideUpPanel';

type RoomSetupScreenProps = {
  onClose?: () => void;
  onComplete?: () => void;
  roomCode?: string;
};
type CourseRange = { course: string; id: string; indexFrom: string; indexTo: string };

function getCenteredWidth(screenWidth: number) {
  const width = Math.min(screenWidth - 40, 360);
  return { left: Math.max(20, (screenWidth - width) / 2), width };
}

function getCourseRangeLabel({ course, indexFrom, indexTo }: CourseRange) {
  return `${indexFrom}-${indexTo} ${course}`;
}

export function RoomSetupScreen({ onComplete, roomCode = '482913' }: RoomSetupScreenProps) {
  const { height, width } = useWindowDimensions();
  const { bottom, top } = useSafeAreaInsets();
  const [floorIndex, setFloorIndex] = useState(DEFAULT_ROOM_SETUP_FLOOR_INDEX);
  const [building, setBuilding] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [course, setCourse] = useState('');
  const [indexFrom, setIndexFrom] = useState('');
  const [indexTo, setIndexTo] = useState('');
  const [sessionCode, setSessionCode] = useState('');
  const [isHistoryVisible, setIsHistoryVisible] = useState(true);
  const [courses, setCourses] = useState<CourseRange[]>([]);
  const nextCourseId = useRef(0);
  const { hide, isVisible: isExpanded, show, translateY } = useSlideUpPanel(height);

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

  const logoTop = getCenteredHeroLogoTop(height, height * 0.31, top);
  const collapsedInputBottom = Math.round(height * 0.24) + bottom + 38;
  const collapsedDividerBottom = collapsedInputBottom - 56;
  const collapsedHistoryTop = Math.max(top, 14) + 54;
  const collapsedInputPosition = getCenteredWidth(width);

  return (
    <View style={styles.screen}>
      <SystemStatusBar backgroundColor="transparent" barStyle="light-content" translucent />
      <Image
        accessibilityIgnoresInvertColors
        source={{ uri: ROOM_SETUP_IMAGE_URL }}
        style={styles.hero}
      />

      <RoomSetupTopNav
        isHistoryVisible={isHistoryVisible}
        isExpanded={isExpanded}
        onCollapse={hide}
        onToggleHistory={() => setIsHistoryVisible((current) => !current)}
        screenHeight={height}
        topInset={top}
        translateY={translateY}
      />

      {!isExpanded ? (
        <View pointerEvents="none" style={[styles.logoAnchor, { top: logoTop }]}>
          <AppLogoMark />
        </View>
      ) : null}

      {!isExpanded ? (
        <>
          {isHistoryVisible ? (
            <RoomSessionHistory
              style={{
                bottom: collapsedInputBottom + 64,
                left: 0,
                right: 0,
                top: collapsedHistoryTop,
              }}
            />
          ) : null}
          <View
            style={[
              styles.collapsedSessionRow,
              { bottom: collapsedInputBottom },
              collapsedInputPosition,
            ]}
          >
            <Field
              keyboardType="number-pad"
              onChangeText={setSessionCode}
              placeholder="Active Session Code"
              value={sessionCode}
            />
            <RoundAction icon="send" label="Save and continue" onPress={onComplete} />
          </View>
          <View style={[styles.orDivider, { bottom: collapsedDividerBottom }]}>
            <View style={styles.orLine} />
            <Text style={styles.orText}>Or</Text>
            <View style={styles.orLine} />
          </View>
          <View style={[styles.swipePromptOverlay, { bottom: bottom + 12 }]}>
            <RoomSetupSwipePrompt onExpand={show} />
          </View>
        </>
      ) : null}

      {isExpanded ? (
        <Animated.View
          style={[
            styles.sheet,
            styles.expandedSheet,
            { paddingBottom: 20 + bottom, transform: [{ translateY }] },
          ]}
        >
          <View pointerEvents="none" style={styles.expandedLogo}>
            <AppLogoMark color={LIMEADE} scale={0.42} />
          </View>
          <View style={styles.expandedForm}>
            <View style={styles.row}>
              <Field
                onChangeText={setBuilding}
                placeholder="Building or College"
                value={building}
              />
            </View>
            <View style={styles.row}>
              <Field onChangeText={setRoomNumber} placeholder="Room Number" value={roomNumber} />
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
              <RoundAction icon="plus" label="Add course range" onPress={addCourse} tone="muted" />
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
              <Pressable accessibilityRole="button" onPress={onComplete} style={styles.saveButton}>
                <Text style={styles.saveText}>Save and continue</Text>
                <SendBadgeIcon />
              </Pressable>
            </View>
          </View>
        </Animated.View>
      ) : null}
      {!isExpanded ? (
        <RoomSetupDock
          bottomInset={bottom}
          screenHeight={height}
          screenWidth={width}
          topInset={top}
        />
      ) : null}
    </View>
  );
}
