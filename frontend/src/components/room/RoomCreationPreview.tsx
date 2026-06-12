import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Image, Pressable, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { RoomImageMosaic } from '@/components/room/RoomImageMosaic';
import { RoomActionWordPattern } from '@/components/room/RoomActionWordPattern';
import { RoomIcon, type RoomIconName } from '@/components/room/RoomSetupControls';
import { roomCreationPreviewStyles as styles } from '@/components/room/roomCreationPreviewStyles';
import { useStableScreenSize } from '@/hooks/useStableScreenSize';
import { getRoomCreationLayout } from '@/screens/roomSetupConfig';

type RoomCreationPreviewProps = {
  children?: ReactNode;
  collapsedImageUris: string[];
  drawerHeight: Animated.Value;
  expandedImageUri: string;
  imageProgress: Animated.Value;
  isCreateOpen: boolean;
  onComplete?: () => void;
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
  collapsedImageUris,
  drawerHeight,
  expandedImageUri,
  imageProgress,
  isCreateOpen,
  onComplete,
  onCreateSettle,
}: RoomCreationPreviewProps) {
  const { bottom } = useSafeAreaInsets();
  const { height, width } = useStableScreenSize();
  const [actionMode, setActionMode] = useState<RoomActionMode>('create');
  const [activeSessionCode, setActiveSessionCode] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuIcon, setMenuIcon] = useState<RoomIconName>('menu');
  const [swipeX] = useState(() => new Animated.Value(0));
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const layout = getRoomCreationLayout(width, height, bottom);
  const maxSwipeX = layout.maxSwipeX;
  const drawerTop = layout.imageHeight - layout.outerStepHeight;
  const drawerBodyTop = Math.max(0, layout.outerStepHeight - layout.innerStepHeight * 0.36);
  const drawerUnderlayHeight = drawerHeight.interpolate({
    extrapolate: 'clamp',
    inputRange: [0, drawerBodyTop, height],
    outputRange: [0, 0, height],
  });
  const stairPath = getStairPath(width, layout.outerStepHeight, layout.innerStepHeight);
  const copyTextStyle = { fontSize: layout.copyFontSize, lineHeight: layout.copyLineHeight };
  const swipeTraceWidth = Animated.add(swipeX, layout.controlSize / 2);
  const chevronColor = isCreateOpen ? '#3A3D40' : '#6D6D6D';
  const controlIconColor = isCreateOpen ? '#25282B' : '#858585';
  const copyTextProps = {
    adjustsFontSizeToFit: true,
    maxFontSizeMultiplier: 1,
    minimumFontScale: 0.86,
    numberOfLines: 1,
  } as const;
  const selectedCopyStyle = { transform: [{ scale: 1.1 }] };
  const controlShapeStyle = {
    borderRadius: layout.controlSize / 2,
    height: layout.controlSize,
    width: layout.controlSize,
  };
  const swipeTraceOpacity = swipeX.interpolate({
    extrapolate: 'clamp',
    inputRange: [0, 1],
    outputRange: [0, 1],
  });
  // Circle + trace dissolve over the last leg so the settled pill matches the
  // flat "Save and continue" final state instead of leaving the puck behind.
  const swipeFade = swipeX.interpolate({
    extrapolate: 'clamp',
    inputRange: [0, maxSwipeX * 0.6, maxSwipeX],
    outputRange: [1, 1, 0],
  });
  const isActiveSessionMode = actionMode === 'active' && !isCreateOpen;
  const actionTextStyle = {
    fontSize: layout.actionTextFontSize,
    lineHeight: layout.actionTextFontSize * 1.18,
  };
  const actionTrackStyle = isCreateOpen
    ? { left: 0, width: maxSwipeX }
    : {
        left: layout.controlSize + 6,
        right: isActiveSessionMode ? 12 : layout.nextControlWidth + 6,
      };

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

  const resetSwipe = useCallback(() => {
    Animated.spring(swipeX, {
      damping: 18,
      stiffness: 180,
      toValue: 0,
      useNativeDriver: false,
    }).start();
  }, [swipeX]);

  const selectActionMode = (mode: RoomActionMode) => {
    setActionMode(mode);
    if (mode === 'active') resetSwipe();
  };

  const submitActiveSession = () => {
    setActiveSessionCode((value) => value.trim());
    onComplete?.();
  };

  const settleSwipe = useCallback(
    (shouldOpen: boolean) => {
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
    },
    [maxSwipeX, onCreateSettle, resetSwipe, swipeX],
  );

  // Click-to-create: the press plays the same settle animation the chevron uses
  // (puck glides to the end + drawer drops in) — no manual drag tracking.
  const openCreateRoom = useCallback(() => settleSwipe(true), [settleSwipe]);

  return (
    <View style={styles.stage}>
      <View style={styles.screen}>
        <View style={[styles.imageWrap, { height: layout.imageHeight }]}>
          <Image
            accessibilityIgnoresInvertColors
            resizeMode="cover"
            source={{ uri: expandedImageUri }}
            style={styles.image}
          />
          <RoomImageMosaic
            height={layout.imageHeight}
            imageUris={collapsedImageUris}
            revealProgress={imageProgress}
            width={width}
          />
          <Svg
            height={layout.outerStepHeight}
            pointerEvents="none"
            style={[styles.imageCutoutShape, isCreateOpen && styles.hidden]}
            viewBox={`0 0 ${width} ${layout.outerStepHeight}`}
            width={width}
          >
            <Path d={stairPath} fill="#101111" />
          </Svg>
          <View
            pointerEvents="none"
            style={[styles.imageSeamCover, isCreateOpen && styles.hidden]}
          />
          <View
            pointerEvents="none"
            style={[
              styles.imagePatternLayer,
              { height: layout.outerStepHeight + 12 },
              isCreateOpen && styles.hidden,
            ]}
          >
            <RoomActionWordPattern
              density="edge"
              word={actionMode === 'active' ? 'ACTIVE' : 'NEW'}
            />
          </View>
        </View>
        <View
          style={[
            styles.copyWrap,
            { paddingBottom: layout.copyBottomPadding, paddingTop: layout.copyTopPadding },
          ]}
        >
          <RoomActionWordPattern word={actionMode === 'active' ? 'ACTIVE' : 'NEW'} />
          <View style={[styles.copyStack, { gap: layout.copyGap, width: layout.copyStackWidth }]}>
            <View style={styles.copyRow}>
              <Pressable
                accessibilityLabel="Use new room mode"
                accessibilityRole="button"
                hitSlop={12}
                onPress={() => selectActionMode('create')}
                style={[styles.copyModeButton, { width: layout.copyLaneWidth }]}
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
                style={[styles.copyModeButton, { width: layout.copyLaneWidth }]}
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
                style={[styles.copy, copyTextStyle, { width: layout.copyLaneWidth }]}
              >
                CODE
              </Text>
              <Text
                {...copyTextProps}
                style={[
                  styles.copy,
                  copyTextStyle,
                  styles.copyRight,
                  { width: layout.copyLaneWidth },
                ]}
              >
                SESSION
              </Text>
            </View>
          </View>
        </View>
        <Animated.View
          pointerEvents="none"
          style={[
            styles.drawerUnderlay,
            { height: drawerUnderlayHeight, top: drawerTop + drawerBodyTop },
          ]}
        />
        {children}
        <View
          style={[
            styles.controls,
            {
              bottom: layout.controlsBottom,
              gap: layout.controlsGap,
              left: (width - layout.controlsWidth) / 2,
              width: layout.controlsWidth,
            },
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
              style={[
                styles.secondaryControl,
                controlShapeStyle,
                isCreateOpen && styles.secondaryControlLight,
              ]}
            >
              <RoomIcon color={controlIconColor} name={menuIcon} size={24} strokeWidth={2.2} />
            </Pressable>
          </View>
          <View
            style={[
              styles.actionPill,
              { borderRadius: layout.controlSize / 2, height: layout.controlSize },
              isCreateOpen && styles.actionPillLight,
            ]}
          >
            <Animated.View
              style={[
                styles.swipeTrace,
                { height: layout.controlSize },
                isCreateOpen && styles.swipeTraceLight,
                {
                  opacity: isActiveSessionMode
                    ? 0
                    : Animated.multiply(swipeTraceOpacity, swipeFade),
                  width: isActiveSessionMode ? 0 : swipeTraceWidth,
                },
              ]}
            />
            <Animated.View
              pointerEvents={isCreateOpen ? 'none' : 'auto'}
              style={[
                styles.primaryControl,
                controlShapeStyle,
                isCreateOpen && styles.primaryControlLight,
                isActiveSessionMode
                  ? null
                  : { opacity: swipeFade, transform: [{ translateX: swipeX }] },
              ]}
            >
              <Pressable
                accessibilityLabel={
                  isActiveSessionMode
                    ? 'Send active room session'
                    : isCreateOpen
                      ? undefined
                      : 'Tap to create room'
                }
                accessibilityRole="button"
                onPress={
                  isActiveSessionMode
                    ? submitActiveSession
                    : isCreateOpen
                      ? onComplete
                      : openCreateRoom
                }
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
            <View style={[styles.participate, { height: layout.controlSize }, actionTrackStyle]}>
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
                <Pressable
                  accessibilityLabel={isCreateOpen ? 'Save and continue' : undefined}
                  accessibilityRole={isCreateOpen ? 'button' : undefined}
                  disabled={!isCreateOpen}
                  onPress={isCreateOpen ? onComplete : undefined}
                  style={styles.participatePressable}
                >
                  <Text
                    adjustsFontSizeToFit
                    maxFontSizeMultiplier={1}
                    minimumFontScale={0.78}
                    numberOfLines={1}
                    style={[
                      styles.participateText,
                      actionTextStyle,
                      isCreateOpen && styles.participateTextLight,
                    ]}
                  >
                    {isCreateOpen ? 'Save and continue' : 'Tap to create room'}
                  </Text>
                </Pressable>
              )}
            </View>
            {isActiveSessionMode ? null : (
              <Pressable
                accessibilityLabel="Next reminder"
                onPress={isCreateOpen ? onComplete : openCreateRoom}
                style={[
                  styles.nextControl,
                  { height: layout.controlSize, width: layout.nextControlWidth },
                ]}
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
