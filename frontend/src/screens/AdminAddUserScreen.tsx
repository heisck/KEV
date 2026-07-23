import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  useWindowDimensions,
  View,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useCreateAdmin, useCreateLecturer } from '@/api/hooks';
import { getProblemDetail } from '@/api/schemas';
import { CircleButton } from '@/components/kev/chrome';
import { CloseIcon } from '@/components/kev/icons';
import { AppButton } from '@/components/ui';
import { HapticPressable } from '@/components/ui/HapticPressable';
import { toast } from '@/lib/toast';
import { radii, spacing, usePalette } from '@/theme';

type UserRoleTab = 'lecturer' | 'admin';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SWIPE_THRESHOLD = 50;

/**
 * Admin Onboarding Screen — full-screen step-up layout with tap & swipe tab toggle
 * between Lecturer and Administrator creation forms.
 */
export function AdminAddUserScreen() {
  const router = useRouter();
  const p = usePalette();
  const { top } = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();

  const [activeTab, setActiveTab] = useState<UserRoleTab>('lecturer');

  // Lecturer Form State
  const [fullName, setFullName] = useState('');
  const [lecturerId, setLecturerId] = useState('');
  const [universityEmail, setUniversityEmail] = useState('');
  const [personalEmail, setPersonalEmail] = useState('');
  const [lecturerPhone, setLecturerPhone] = useState('');
  const [uniEmailError, setUniEmailError] = useState<string | null>(null);
  const [uniEmailTouched, setUniEmailTouched] = useState(false);
  const [personalEmailError, setPersonalEmailError] = useState<string | null>(null);
  const [personalEmailTouched, setPersonalEmailTouched] = useState(false);
  const [lecturerFormError, setLecturerFormError] = useState<string | null>(null);

  // Admin Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPhone, setAdminPhone] = useState('');
  const [adminEmailError, setAdminEmailError] = useState<string | null>(null);
  const [adminEmailTouched, setAdminEmailTouched] = useState(false);
  const [adminFormError, setAdminFormError] = useState<string | null>(null);

  const createLecturer = useCreateLecturer();
  const createAdmin = useCreateAdmin();

  // Shared Animation Values for Swiping
  const translateX = useSharedValue(0);

  const switchTab = useCallback(
    (tab: UserRoleTab) => {
      Keyboard.dismiss();
      setActiveTab(tab);
      translateX.value = withTiming(tab === 'lecturer' ? 0 : -windowWidth, {
        duration: 220,
      });
    },
    [translateX, windowWidth],
  );

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      const base = activeTab === 'lecturer' ? 0 : -windowWidth;
      translateX.value = base + event.translationX;
    })
    .onEnd((event) => {
      if (activeTab === 'lecturer' && event.translationX < -SWIPE_THRESHOLD) {
        runOnJS(switchTab)('admin');
      } else if (activeTab === 'admin' && event.translationX > SWIPE_THRESHOLD) {
        runOnJS(switchTab)('lecturer');
      } else {
        const target = activeTab === 'lecturer' ? 0 : -windowWidth;
        translateX.value = withTiming(target, { duration: 220 });
      }
    });

  const animatedSlideStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const validateEmail = (val: string) => {
    const trimmed = val.trim();
    if (!trimmed) return 'Email is required';
    if (!EMAIL_REGEX.test(trimmed)) return 'Incorrect email address';
    return null;
  };

  // Submit Lecturer
  const handleLecturerSubmit = () => {
    Keyboard.dismiss();
    setLecturerFormError(null);
    const uErr = validateEmail(universityEmail);
    const pErr = validateEmail(personalEmail);
    setUniEmailTouched(true);
    setPersonalEmailTouched(true);
    setUniEmailError(uErr);
    setPersonalEmailError(pErr);

    if (uErr || pErr) return;
    if (!fullName.trim() || !lecturerId.trim() || !lecturerPhone.trim()) {
      setLecturerFormError('All fields are required.');
      return;
    }

    createLecturer.mutate(
      {
        fullName: fullName.trim(),
        lecturerId: lecturerId.trim(),
        universityEmail: universityEmail.trim(),
        personalEmail: personalEmail.trim(),
        phone: lecturerPhone.trim(),
      },
      {
        onSuccess: () => {
          toast.success('Lecturer account created! Credentials sent.');
          router.back();
        },
        onError: (err) => {
          const detail = getProblemDetail(err);
          setLecturerFormError(detail?.detail ?? detail?.title ?? 'Failed to create lecturer');
        },
      },
    );
  };

  // Submit Admin
  const handleAdminSubmit = () => {
    Keyboard.dismiss();
    setAdminFormError(null);
    const err = validateEmail(adminEmail);
    setAdminEmailTouched(true);
    setAdminEmailError(err);

    if (err) return;
    if (!firstName.trim() || !lastName.trim()) {
      setAdminFormError('First name and last name are required.');
      return;
    }

    createAdmin.mutate(
      {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: adminEmail.trim(),
        phone: adminPhone.trim() || undefined,
      },
      {
        onSuccess: () => {
          toast.success('Administrator account created! Credentials sent.');
          router.back();
        },
        onError: (e) => {
          const detail = getProblemDetail(e);
          setAdminFormError(detail?.detail ?? detail?.title ?? 'Failed to create admin');
        },
      },
    );
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={[styles.screen, { backgroundColor: p.bg, paddingTop: top + spacing.md }]}>
        {/* Full-Screen Header with Close Button */}
        <View style={styles.header}>
          <CircleButton label="Close form" onPress={() => router.back()}>
            <CloseIcon color={p.ink} size={20} />
          </CircleButton>
          <Text style={[styles.headerTitle, { color: p.ink }]}>Onboard User</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Segmented Switcher (Lecturer vs Admin) */}
        <View style={[styles.segmentBar, { backgroundColor: p.surfaceDim }]}>
          <HapticPressable
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === 'lecturer' }}
            haptic="select"
            onPress={() => switchTab('lecturer')}
            style={[styles.segmentTab, activeTab === 'lecturer' && { backgroundColor: p.primary }]}
          >
            <Text
              style={[
                styles.segmentLabel,
                { color: activeTab === 'lecturer' ? p.onPrimary : p.muted },
              ]}
            >
              Lecturer
            </Text>
          </HapticPressable>

          <HapticPressable
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === 'admin' }}
            haptic="select"
            onPress={() => switchTab('admin')}
            style={[styles.segmentTab, activeTab === 'admin' && { backgroundColor: p.primary }]}
          >
            <Text
              style={[
                styles.segmentLabel,
                { color: activeTab === 'admin' ? p.onPrimary : p.muted },
              ]}
            >
              Administrator
            </Text>
          </HapticPressable>
        </View>

        {/* Swipeable View Area inside KeyboardAvoidingView */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardAvoidingArea}
        >
          <GestureDetector gesture={panGesture}>
            <Animated.View
              style={[styles.slideContainer, { width: windowWidth * 2 }, animatedSlideStyle]}
            >
              {/* Page 1: Lecturer Form */}
              <View style={{ width: windowWidth, paddingHorizontal: spacing.xl }}>
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  contentContainerStyle={styles.formContent}
                >
                  {lecturerFormError ? (
                    <Text style={[styles.serverError, { color: p.error }]}>
                      {lecturerFormError}
                    </Text>
                  ) : null}

                  <Text style={[styles.fieldLabel, { color: p.inkSoft }]}>Full Name</Text>
                  <TextInput
                    placeholder="e.g. Dr. Kwame Mensah"
                    placeholderTextColor={p.muted}
                    style={[styles.input, { color: p.ink, borderColor: p.hairline }]}
                    value={fullName}
                    onChangeText={setFullName}
                  />

                  <Text style={[styles.fieldLabel, { color: p.inkSoft }]}>Lecturer ID Number</Text>
                  <TextInput
                    placeholder="e.g. LEC-001"
                    placeholderTextColor={p.muted}
                    style={[styles.input, { color: p.ink, borderColor: p.hairline }]}
                    value={lecturerId}
                    onChangeText={setLecturerId}
                  />

                  <Text style={[styles.fieldLabel, { color: p.inkSoft }]}>University Email</Text>
                  <TextInput
                    autoCapitalize="none"
                    keyboardType="email-address"
                    placeholder="e.g. kwame.mensah@university.edu"
                    placeholderTextColor={p.muted}
                    style={[
                      styles.input,
                      { color: p.ink, borderColor: p.hairline },
                      Boolean(uniEmailError) && uniEmailTouched && styles.inputError,
                    ]}
                    value={universityEmail}
                    onBlur={() => {
                      setUniEmailTouched(true);
                      setUniEmailError(validateEmail(universityEmail));
                    }}
                    onChangeText={(txt) => {
                      setUniversityEmail(txt);
                      if (uniEmailTouched) setUniEmailError(validateEmail(txt));
                    }}
                  />
                  {uniEmailError && uniEmailTouched ? (
                    <Text style={styles.errorText}>{uniEmailError}</Text>
                  ) : null}

                  <Text style={[styles.fieldLabel, { color: p.inkSoft }]}>Personal Email</Text>
                  <TextInput
                    autoCapitalize="none"
                    keyboardType="email-address"
                    placeholder="e.g. kwame.personal@gmail.com"
                    placeholderTextColor={p.muted}
                    style={[
                      styles.input,
                      { color: p.ink, borderColor: p.hairline },
                      Boolean(personalEmailError) && personalEmailTouched && styles.inputError,
                    ]}
                    value={personalEmail}
                    onBlur={() => {
                      setPersonalEmailTouched(true);
                      setPersonalEmailError(validateEmail(personalEmail));
                    }}
                    onChangeText={(txt) => {
                      setPersonalEmail(txt);
                      if (personalEmailTouched) setPersonalEmailError(validateEmail(txt));
                    }}
                  />
                  {personalEmailError && personalEmailTouched ? (
                    <Text style={styles.errorText}>{personalEmailError}</Text>
                  ) : null}

                  <Text style={[styles.fieldLabel, { color: p.inkSoft }]}>Phone Number</Text>
                  <TextInput
                    keyboardType="phone-pad"
                    placeholder="e.g. +233 24 000 0000"
                    placeholderTextColor={p.muted}
                    style={[styles.input, { color: p.ink, borderColor: p.hairline }]}
                    value={lecturerPhone}
                    onChangeText={setLecturerPhone}
                  />

                  <View style={styles.buttonRow}>
                    <AppButton
                      disabled={createLecturer.isPending}
                      label={createLecturer.isPending ? 'Creating Lecturer...' : 'Create Lecturer'}
                      variant="primary"
                      onPress={handleLecturerSubmit}
                    />
                  </View>
                </ScrollView>
              </View>

              {/* Page 2: Admin Form */}
              <View style={{ width: windowWidth, paddingHorizontal: spacing.xl }}>
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  contentContainerStyle={styles.formContent}
                >
                  {adminFormError ? (
                    <Text style={[styles.serverError, { color: p.error }]}>{adminFormError}</Text>
                  ) : null}

                  <Text style={[styles.fieldLabel, { color: p.inkSoft }]}>First Name</Text>
                  <TextInput
                    placeholder="e.g. Kwame"
                    placeholderTextColor={p.muted}
                    style={[styles.input, { color: p.ink, borderColor: p.hairline }]}
                    value={firstName}
                    onChangeText={setFirstName}
                  />

                  <Text style={[styles.fieldLabel, { color: p.inkSoft }]}>Last Name</Text>
                  <TextInput
                    placeholder="e.g. Mensah"
                    placeholderTextColor={p.muted}
                    style={[styles.input, { color: p.ink, borderColor: p.hairline }]}
                    value={lastName}
                    onChangeText={setLastName}
                  />

                  <Text style={[styles.fieldLabel, { color: p.inkSoft }]}>Email Address</Text>
                  <TextInput
                    autoCapitalize="none"
                    keyboardType="email-address"
                    placeholder="e.g. admin@knust.edu.gh"
                    placeholderTextColor={p.muted}
                    style={[
                      styles.input,
                      { color: p.ink, borderColor: p.hairline },
                      Boolean(adminEmailError) && adminEmailTouched && styles.inputError,
                    ]}
                    value={adminEmail}
                    onBlur={() => {
                      setAdminEmailTouched(true);
                      setAdminEmailError(validateEmail(adminEmail));
                    }}
                    onChangeText={(txt) => {
                      setAdminEmail(txt);
                      if (adminEmailTouched) setAdminEmailError(validateEmail(txt));
                    }}
                  />
                  {adminEmailError && adminEmailTouched ? (
                    <Text style={styles.errorText}>{adminEmailError}</Text>
                  ) : null}

                  <Text style={[styles.fieldLabel, { color: p.inkSoft }]}>
                    Phone Number (Optional)
                  </Text>
                  <TextInput
                    keyboardType="phone-pad"
                    placeholder="e.g. +233 24 000 0000"
                    placeholderTextColor={p.muted}
                    style={[styles.input, { color: p.ink, borderColor: p.hairline }]}
                    value={adminPhone}
                    onChangeText={setAdminPhone}
                  />

                  <View style={styles.buttonRow}>
                    <AppButton
                      disabled={createAdmin.isPending}
                      label={
                        createAdmin.isPending ? 'Creating Administrator...' : 'Create Administrator'
                      }
                      variant="primary"
                      onPress={handleAdminSubmit}
                    />
                  </View>
                </ScrollView>
              </View>
            </Animated.View>
          </GestureDetector>
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
  },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  headerSpacer: { width: 40 },

  segmentBar: {
    borderRadius: radii.pill,
    flexDirection: 'row',
    marginHorizontal: spacing.xl,
    marginTop: spacing.sm,
    padding: 4,
  },
  segmentTab: {
    alignItems: 'center',
    borderRadius: radii.pill,
    flex: 1,
    paddingVertical: 10,
  },
  segmentLabel: { fontSize: 14, fontWeight: '700' },

  keyboardAvoidingArea: { flex: 1 },
  slideContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  formContent: {
    gap: spacing.xs,
    paddingBottom: 60,
    paddingTop: spacing.lg,
  },
  sectionTitle: { fontSize: 20, fontWeight: '700' },
  sectionHint: { fontSize: 13, marginBottom: spacing.sm },

  fieldLabel: { fontSize: 13, fontWeight: '600', marginTop: spacing.xs },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 15,
    height: 48,
    paddingHorizontal: 14,
  },
  inputError: { borderColor: '#FF4D4D' },
  errorText: { color: '#FF4D4D', fontSize: 12, fontWeight: '600', marginTop: 2, paddingLeft: 4 },
  serverError: { fontSize: 13, fontWeight: '600', textAlign: 'center' },
  buttonRow: { marginTop: spacing.lg },
});
