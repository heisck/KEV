import { type ReactNode, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Image,
  Pressable,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { RoomIcon, type RoomIconName } from '@/components/room/RoomSetupControls';
import { roomCreationPreviewStyles as styles } from '@/components/room/roomCreationPreviewStyles';
import {
  ROOM_CREATION_IMAGE_HEIGHT_RATIO,
  ROOM_CREATION_INNER_STEP_RATIO,
  ROOM_CREATION_OUTER_STEP_RATIO,
} from '@/screens/roomSetupConfig';

type RoomCreationPreviewProps = {
  children?: ReactNode;
  collapsedImageUri: string;
  expandedImageUri: string;
  imageProgress: Animated.Value;
  isCreateOpen: boolean;
  onCreateProgress: (progress: number) => void;
  onCreateSettle: (shouldOpen: boolean) => void;
};
type RoomActionMode = 'active' | 'create';

function getStairPath(width: number, outerHeight: number, innerHeight: number) {
  const radius = Math.min(16, outerHeight * 0.38, width * 0.04);
  const stepY = outerHeight - innerHeight;
  const leftOuter = width * 0.245;
  const leftInner = width * 0.445;
  const rightInner = width * 0.555;
  const rightOuter = width * 0.755;

  return [
    `M0 ${outerHeight}`,
    'L0 0',
    `H${leftOuter - radius}`,
    `Q${leftOuter} 0 ${leftOuter} ${radius}`,
    `V${stepY}`,
    `H${leftInner - radius}`,
    `Q${leftInner} ${stepY} ${leftInner} ${stepY + radius}`,
    `V${outerHeight}`,
    `H${rightInner}`,
    `V${stepY + radius}`,
    `Q${rightInner} ${stepY} ${rightInner + radius} ${stepY}`,
    `H${rightOuter}`,
    `V${radius}`,
    `Q${rightOuter} 0 ${rightOuter + radius} 0`,
    `H${width}`,
    `V${outerHeight}`,
    'Z',
  ].join(' ');
}

export function RoomCreationPreview({
  children,
  collapsedImageUri,
  expandedImageUri,
  imageProgress,
  isCreateOpen,
  onCreateProgress,
  onCreateSettle,
}: RoomCreationPreviewProps) {
  const { bottom } = useSafeAreaInsets();
  const { height, width } = useWindowDimensions();
  const [actionMode, setActionMode] = useState<RoomActionMode>('create');
  const [activeSessionCode, setActiveSessionCode] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuIcon, setMenuIcon] = useState<RoomIconName>('menu');
  const [swipeX] = useState(() => new Animated.Value(0));
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const swipeStartX = useRef<number | null>(null);
  const controlsWidth = Math.min(width - 20, 430);
  const maxSwipeX = Math.max(92, controlsWidth - 164);
  const controlsBottom = Math.max(bottom, 16);
  const imageHeight = height * ROOM_CREATION_IMAGE_HEIGHT_RATIO;
  const imageRevealHeight = Animated.multiply(imageProgress, imageHeight);
  const outerStepHeight = height * ROOM_CREATION_OUTER_STEP_RATIO;
  const innerStepHeight = height * ROOM_CREATION_INNER_STEP_RATIO;
  const stairPath = getStairPath(width, outerStepHeight, innerStepHeight);
  const copyBottomPadding = controlsBottom + height * 0.18;
  const copyGap = height * 0.028;
  const copyStackWidth = Math.min(width * 0.9, height * 0.46);
  const copyLaneWidth = copyStackWidth * 0.42;
  const copyFontSize = Math.max(26, Math.min(34, copyLaneWidth / 4.55));
  const copyLineHeight = copyFontSize * 1.06;
  const copyTextStyle = { fontSize: copyFontSize, lineHeight: copyLineHeight };
  const swipeTraceWidth = Animated.add(swipeX, 38);
  const chevronColor = isCreateOpen ? '#3A3D40' : '#6D6D6D';
  const controlIconColor = isCreateOpen ? '#25282B' : '#858585';
  const copyTextProps = {
    adjustsFontSizeToFit: true,
    maxFontSizeMultiplier: 1,
    minimumFontScale: 0.86,
    numberOfLines: 1,
  } as const;
  const selectedCopyStyle = { transform: [{ scale: 1.14 }] };
  const swipeTraceOpacity = swipeX.interpolate({
    extrapolate: 'clamp',
    inputRange: [0, 1],
    outputRange: [0, 1],
  });
  const isActiveSessionMode = actionMode === 'active' && !isCreateOpen;

  useEffect(
    () => () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    },
    [],
  );

  useEffect(() => {
    if (!isCreateOpen) swipeX.setValue(0);
  }, [isCreateOpen, swipeX]);

  const selectMenuIcon = (icon: RoomIconName) => {
    if (resetTimer.current) clearTimeout(resetTimer.current);
    setIsMenuOpen(false);
    setMenuIcon(icon);
    resetTimer.current = setTimeout(() => setMenuIcon('menu'), 5000);
  };

  const resetSwipe = () => {
    Animated.spring(swipeX, {
      damping: 18,
      stiffness: 180,
      toValue: 0,
      useNativeDriver: false,
    }).start();
  };

  const selectActionMode = (mode: RoomActionMode) => {
    setActionMode(mode);
    if (mode === 'active') resetSwipe();
  };

  const submitActiveSession = () => {
    setActiveSessionCode((value) => value.trim());
  };

  const settleSwipe = (shouldOpen: boolean) => {
    onCreateSettle(shouldOpen);
    if (!shouldOpen) {
      resetSwipe();
      return;
    }
    Animated.timing(swipeX, {
      duration: 260,
      toValue: maxSwipeX,
      useNativeDriver: false,
    }).start();
  };

  return (
    <View style={styles.stage}>
      <View style={styles.screen}>
        <View style={[styles.imageWrap, { height: imageHeight }]}>
          <Image
            accessibilityIgnoresInvertColors
            resizeMode="cover"
            source={{ uri: collapsedImageUri }}
            style={styles.image}
          />
          <Animated.View style={[styles.imageReveal, { height: imageRevealHeight }]}>
            <Image
              accessibilityIgnoresInvertColors
              resizeMode="cover"
              source={{ uri: expandedImageUri }}
              style={[styles.image, styles.imageRevealImage, { height: imageHeight }]}
            />
          </Animated.View>
          <Svg
            height={outerStepHeight}
            pointerEvents="none"
            style={styles.imageCutoutShape}
            viewBox={`0 0 ${width} ${outerStepHeight}`}
            width={width}
          >
            <Path d={stairPath} fill="#101111" />
          </Svg>
        </View>
        <View style={[styles.copyWrap, { paddingBottom: copyBottomPadding }]}>
          <View style={[styles.copyStack, { gap: copyGap, width: copyStackWidth }]}>
            <View style={styles.copyRow}>
              <Pressable
                accessibilityLabel="Use new room mode"
                accessibilityRole="button"
                hitSlop={12}
                onPress={() => selectActionMode('create')}
                style={[styles.copyModeButton, { width: copyLaneWidth }]}
              >
                <Text
                  {...copyTextProps}
                  onPress={() => selectActionMode('create')}
                  style={[styles.copy, copyTextStyle, actionMode === 'create' && selectedCopyStyle]}
                >
                  NEW
                </Text>
              </Pressable>
              <Pressable
                accessibilityLabel="Use active room mode"
                accessibilityRole="button"
                hitSlop={12}
                onPress={() => selectActionMode('active')}
                style={[styles.copyModeButton, { width: copyLaneWidth }]}
              >
                <Text
                  {...copyTextProps}
                  onPress={() => selectActionMode('active')}
                  style={[
                    styles.copy,
                    copyTextStyle,
                    styles.copyRight,
                    actionMode === 'active' && selectedCopyStyle,
                  ]}
                >
                  ACTIVE
                </Text>
              </Pressable>
            </View>
            <Text {...copyTextProps} style={[styles.copy, copyTextStyle, styles.copyCenter]}>
              ROOM
            </Text>
            <View style={styles.copyRow}>
              <Text
                {...copyTextProps}
                style={[styles.copy, copyTextStyle, { width: copyLaneWidth }]}
              >
                CODE
              </Text>
              <Text
                {...copyTextProps}
                style={[styles.copy, copyTextStyle, styles.copyRight, { width: copyLaneWidth }]}
              >
                SESSION
              </Text>
            </View>
          </View>
        </View>
        {children}
        <View
          style={[
            styles.controls,
            { bottom: controlsBottom, left: (width - controlsWidth) / 2, width: controlsWidth },
          ]}
        >
          <View style={styles.menuSlot}>
            {isMenuOpen ? (
              <View style={styles.menuFlyout}>
                <Pressable
                  accessibilityLabel="Show home icon"
                  onPress={() => selectMenuIcon('home')}
                  style={[styles.menuFlyoutButton, isCreateOpen && styles.menuFlyoutButtonLight]}
                >
                  <RoomIcon color={controlIconColor} name="home" size={22} strokeWidth={2.1} />
                </Pressable>
                <Pressable
                  accessibilityLabel="Show profile icon"
                  onPress={() => selectMenuIcon('profile')}
                  style={[styles.menuFlyoutButton, isCreateOpen && styles.menuFlyoutButtonLight]}
                >
                  <RoomIcon color={controlIconColor} name="profile" size={22} strokeWidth={2.1} />
                </Pressable>
              </View>
            ) : null}
            <Pressable
              accessibilityLabel="Open reminder menu"
              onPress={() => setIsMenuOpen((current) => !current)}
              style={[styles.secondaryControl, isCreateOpen && styles.secondaryControlLight]}
            >
              <RoomIcon color={controlIconColor} name={menuIcon} size={24} strokeWidth={2.2} />
            </Pressable>
          </View>
          <View style={[styles.actionPill, isCreateOpen && styles.actionPillLight]}>
            <Animated.View
              style={[
                styles.swipeTrace,
                isCreateOpen && styles.swipeTraceLight,
                {
                  opacity: isActiveSessionMode ? 0 : swipeTraceOpacity,
                  width: isActiveSessionMode ? 0 : swipeTraceWidth,
                },
              ]}
            />
            <Animated.View
              style={[
                styles.primaryControl,
                isCreateOpen && styles.primaryControlLight,
                isActiveSessionMode ? null : { transform: [{ translateX: swipeX }] },
              ]}
            >
              <Pressable
                accessibilityLabel={
                  isActiveSessionMode ? 'Send active room session' : 'Swipe to create room'
                }
                accessibilityRole="button"
                onPress={isActiveSessionMode ? submitActiveSession : undefined}
                onTouchEnd={(event) => {
                  if (isActiveSessionMode) return;
                  const startX = swipeStartX.current;
                  swipeStartX.current = null;
                  if (startX !== null && event.nativeEvent.pageX - startX > maxSwipeX * 0.6) {
                    settleSwipe(true);
                    return;
                  }
                  settleSwipe(false);
                }}
                onTouchMove={(event) => {
                  if (isActiveSessionMode) return;
                  const startX = swipeStartX.current;
                  if (startX === null) return;
                  const distance = Math.max(
                    0,
                    Math.min(maxSwipeX, event.nativeEvent.pageX - startX),
                  );
                  onCreateProgress(distance / maxSwipeX);
                  swipeX.setValue(distance);
                }}
                onTouchStart={(event) => {
                  if (isActiveSessionMode) return;
                  swipeStartX.current = event.nativeEvent.pageX;
                }}
                style={styles.primaryControlHitArea}
              >
                <RoomIcon
                  color="#111111"
                  name={isActiveSessionMode ? 'send' : 'play'}
                  size={24}
                  strokeWidth={2.4}
                />
              </Pressable>
            </Animated.View>
            <View
              style={[
                styles.participate,
                isActiveSessionMode && styles.activeSessionField,
                isCreateOpen && styles.participateOpen,
                isCreateOpen && { width: maxSwipeX },
              ]}
            >
              {isActiveSessionMode ? (
                <TextInput
                  autoCapitalize="none"
                  autoCorrect={false}
                  disableFullscreenUI
                  keyboardType="number-pad"
                  maxFontSizeMultiplier={1}
                  onChangeText={setActiveSessionCode}
                  placeholder="Active room session"
                  placeholderTextColor="#8B8B8B"
                  returnKeyType="send"
                  selectionColor="#24272A"
                  style={styles.activeSessionInput}
                  underlineColorAndroid="transparent"
                  value={activeSessionCode}
                />
              ) : (
                <Text
                  adjustsFontSizeToFit
                  maxFontSizeMultiplier={1}
                  minimumFontScale={0.78}
                  numberOfLines={1}
                  style={[styles.participateText, isCreateOpen && styles.participateTextLight]}
                >
                  {isCreateOpen ? 'Save and continue' : 'Swipe to create room'}
                </Text>
              )}
            </View>
            {isActiveSessionMode ? null : (
              <Pressable
                accessibilityLabel="Next reminder"
                onPress={() => settleSwipe(true)}
                style={styles.nextControl}
              >
                <RoomIcon color={chevronColor} name="chevronsRight" size={24} strokeWidth={1.8} />
              </Pressable>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}
