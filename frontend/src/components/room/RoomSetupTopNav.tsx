import { useState } from 'react';
import { Animated, Easing, Pressable, Text, TextInput, View } from 'react-native';

import { CircleButton, RoomIcon } from '@/components/room/RoomSetupControls';
import { roomSetupStyles as styles } from '@/screens/roomSetupStyles';

type RoomSetupTopNavProps = {
  isHistoryVisible: boolean;
  isExpanded: boolean;
  onCollapse: () => void;
  onToggleHistory: () => void;
  screenHeight: number;
  topInset: number;
  translateY: Animated.Value;
};

export function RoomSetupTopNav({
  isHistoryVisible,
  isExpanded,
  onCollapse,
  onToggleHistory,
  screenHeight,
  topInset,
  translateY,
}: RoomSetupTopNavProps) {
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
  const [isSearchContentVisible, setIsSearchContentVisible] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchProgress] = useState(() => new Animated.Value(0));
  const progress = translateY.interpolate({
    extrapolate: 'clamp',
    inputRange: [0, screenHeight],
    outputRange: [1, 0],
  });
  const downSpin = translateY.interpolate({
    extrapolate: 'clamp',
    inputRange: [0, screenHeight],
    outputRange: ['-90deg', '90deg'],
  });
  const titleScale = translateY.interpolate({
    extrapolate: 'clamp',
    inputRange: [0, screenHeight],
    outputRange: [1, 1.35],
  });
  const searchButtonWidth = searchProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [36, 76],
  });

  const openSearch = () => {
    setIsActionMenuOpen(false);
    setIsSearchContentVisible(false);
    setIsSearchVisible(true);
    searchProgress.setValue(0);
    Animated.timing(searchProgress, {
      duration: 220,
      easing: Easing.out(Easing.cubic),
      toValue: 1,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) setIsSearchContentVisible(true);
    });
  };

  const closeSearch = () => {
    setIsSearchContentVisible(false);
    setSearchQuery('');
    Animated.timing(searchProgress, {
      duration: 190,
      easing: Easing.in(Easing.cubic),
      toValue: 0,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (!finished) return;
      setIsSearchVisible(false);
    });
  };

  return (
    <View style={[styles.topNav, { paddingTop: Math.max(topInset, 14) }]}>
      {isExpanded ? (
        <Animated.View style={{ opacity: progress, transform: [{ rotate: downSpin }] }}>
          <CircleButton icon="back" label="Collapse room setup" onPress={onCollapse} />
        </Animated.View>
      ) : (
        <View style={styles.homeNavLeft}>
          <Pressable
            accessibilityLabel="Open quick actions"
            accessibilityRole="button"
            onPress={() => setIsActionMenuOpen((current) => !current)}
            style={styles.homeNavButton}
          >
            <RoomIcon color="#FFFFFF" name="more" size={18} strokeWidth={3} />
          </Pressable>
          {isActionMenuOpen ? (
            <View style={styles.quickActionMenu}>
              <View style={styles.quickActionRow}>
                <RoomIcon color="#3A6700" name="bell" size={16} strokeWidth={2.2} />
                <Text style={styles.quickActionText}>Notifications</Text>
              </View>
              <Pressable
                accessibilityLabel={
                  isHistoryVisible ? 'Hide session history' : 'Show session history'
                }
                accessibilityRole="button"
                onPress={() => {
                  onToggleHistory();
                  setIsActionMenuOpen(false);
                }}
                style={styles.quickActionRow}
              >
                <RoomIcon color="#3A6700" name="history" size={16} strokeWidth={2.2} />
                <Text style={styles.quickActionText}>{isHistoryVisible ? 'Hide' : 'Show'}</Text>
              </Pressable>
            </View>
          ) : null}
        </View>
      )}
      {isExpanded ? (
        <Animated.Text
          style={[styles.navTitle, { opacity: progress, transform: [{ scale: titleScale }] }]}
        >
          New Room Setup
        </Animated.Text>
      ) : isSearchVisible ? (
        <Animated.View
          style={[
            styles.homeSearchShell,
            {
              transform: [{ scaleX: searchProgress }],
              transformOrigin: 'right center',
            },
          ]}
        >
          {isSearchContentVisible ? (
            <>
              <TextInput
                autoCorrect={false}
                autoCapitalize="none"
                onChangeText={setSearchQuery}
                placeholder="session history"
                placeholderTextColor="rgba(255,255,255,0.68)"
                selectionColor="#FFFFFF"
                style={styles.homeSearchInput}
                underlineColorAndroid="transparent"
                value={searchQuery}
              />
              <Pressable
                accessibilityLabel="Close session search"
                accessibilityRole="button"
                onPress={closeSearch}
                style={styles.homeSearchClose}
              >
                <RoomIcon color="#FFFFFF" name="close" size={14} strokeWidth={2.4} />
              </Pressable>
            </>
          ) : null}
        </Animated.View>
      ) : (
        <Text style={styles.navTitle}>Home</Text>
      )}
      {isExpanded ? (
        <View style={styles.navSpacer} />
      ) : isSearchVisible ? (
        <View style={styles.searchSubmitSlot}>
          <Animated.View style={[styles.searchSubmitButton, { width: searchButtonWidth }]}>
            <Pressable
              accessibilityLabel="Submit session search"
              accessibilityRole="button"
              style={styles.searchSubmitContent}
            >
              <RoomIcon color="#FFFFFF" name="search" size={15} strokeWidth={2.2} />
              {isSearchContentVisible ? <Text style={styles.searchSubmitText}>Search</Text> : null}
            </Pressable>
          </Animated.View>
        </View>
      ) : (
        <Pressable
          accessibilityLabel="Search sessions"
          accessibilityRole="button"
          onPress={openSearch}
          style={styles.homeNavButton}
        >
          <RoomIcon color="#FFFFFF" name="search" size={18} strokeWidth={2.2} />
        </Pressable>
      )}
    </View>
  );
}
