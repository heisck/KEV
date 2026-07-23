import { useEffect, useMemo, useRef, useState } from 'react';
import { BackHandler, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackIcon, ChevronRightIcon, CloseIcon } from '@/components/kev/icons';
import {
  EMPTY_WIZARD_VALUES,
  isCourseRangeInvalid,
  isEndTimeInvalid,
  isScheduleInPast,
  type CourseRange,
  type WizardValues,
} from '@/components/session/sessionForm';
import { HapticPressable } from '@/components/ui/HapticPressable';
import {
  ExamStep,
  LocationStep,
  MethodsStep,
  ReviewStep,
  ScheduleStep,
} from '@/screens/SessionWizardSteps';
import { makeSessionWizardStyles } from '@/screens/sessionWizardStyles';
import { spacing, usePalette } from '@/theme';

/** Verification methods a session may allow — the set the app can actually capture. */
const STEPS = ['Location', 'Exam', 'Schedule', 'Methods', 'Review'] as const;

type Props = {
  onSubmit: (values: WizardValues) => void;
  onBack?: () => void;
  initialValues?: WizardValues;
  initialStep?: number;
  onChange?: (values: WizardValues, step: number) => void;
  title?: string;
  submitLabel?: string;
  submitting?: boolean;
};

/** Five-step exam-creation wizard: Location → Exam → Schedule → Methods → Review. */
export function CreateSessionWizard({
  onSubmit,
  onBack,
  initialValues = EMPTY_WIZARD_VALUES,
  initialStep = 0,
  onChange,
  title = 'New session',
  submitLabel = 'Create session',
  submitting = false,
}: Props) {
  const p = usePalette();
  const { top } = useSafeAreaInsets();
  const s = useMemo(() => makeSessionWizardStyles(p), [p]);
  const initialized = useRef(false);
  const [step, setStep] = useState(initialStep);
  const [v, setV] = useState<WizardValues>(initialValues);

  const set = <K extends keyof WizardValues>(key: K, value: WizardValues[K]) =>
    setV((prev) => ({ ...prev, [key]: value }));

  const setCourse = (i: number, patch: Partial<CourseRange>) =>
    setV((prev) => ({
      ...prev,
      courses: prev.courses.map((c, idx) => (idx === i ? { ...c, ...patch } : c)),
    }));

  const hasInvalidCourseRange = v.courses.some(isCourseRangeInvalid);
  const isScheduleInvalid =
    isScheduleInPast(v.examDate, v.startTime) || isEndTimeInvalid(v.startTime, v.endTime);

  const canNext =
    (step === 0 && v.building.trim().length > 0) ||
    (step === 1 && v.courses.some((c) => c.course.trim()) && !hasInvalidCourseRange) ||
    (step === 2 && !isScheduleInvalid) ||
    (step === 3 && v.methods.length > 0) ||
    step === 4;

  const next = () => (step < STEPS.length - 1 ? setStep(step + 1) : onSubmit(v));
  const back = () => (step > 0 ? setStep(step - 1) : onBack?.());

  // Android hardware back: step back through the wizard, dismiss at the first step.
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (step > 0) {
        setStep((prev) => prev - 1);
        return true;
      }
      if (onBack) {
        onBack();
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [step, onBack]);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      return;
    }
    onChange?.(v, step);
  }, [onChange, step, v]);

  return (
    <View style={[s.screen, { paddingTop: top + spacing.md }]}>
      <View style={s.topBar}>
        <HapticPressable
          accessibilityRole="button"
          accessibilityLabel="Close"
          haptic="select"
          onPress={() => onBack?.()}
          style={s.topClose}
          testID="wizard-close"
        >
          <CloseIcon color={p.ink} />
        </HapticPressable>
        <Text style={s.topTitle}>{`${title}: ${STEPS[step]}`}</Text>
        <View style={s.topSpacer} />
      </View>
      <View style={s.progress}>
        {STEPS.map((_, i) => (
          <View key={i} style={[s.dot, i <= step && s.dotActive]} />
        ))}
      </View>

      <ScrollView contentContainerStyle={s.body} keyboardShouldPersistTaps="handled">
        {step === 0 ? <LocationStep values={v} setValue={set} styles={s} palette={p} /> : null}
        {step === 1 ? (
          <ExamStep values={v} setValues={setV} setCourse={setCourse} styles={s} palette={p} />
        ) : null}
        {step === 2 ? <ScheduleStep values={v} setValue={set} styles={s} palette={p} /> : null}
        {step === 3 ? <MethodsStep values={v} setValues={setV} styles={s} palette={p} /> : null}
        {step === 4 ? <ReviewStep values={v} styles={s} /> : null}
      </ScrollView>

      <View style={s.footer}>
        {step > 0 ? (
          <HapticPressable
            accessibilityRole="button"
            accessibilityLabel="Previous step"
            haptic="select"
            onPress={back}
            style={s.backFab}
            testID="wizard-back"
          >
            <BackIcon color={p.ink} />
          </HapticPressable>
        ) : (
          <View style={s.backFab} />
        )}

        {step < STEPS.length - 1 ? (
          <HapticPressable
            accessibilityRole="button"
            accessibilityLabel="Next step"
            haptic="select"
            disabled={!canNext}
            onPress={next}
            style={[s.nextFab, !canNext && s.ctaDisabled]}
            testID="wizard-next"
          >
            <ChevronRightIcon color={p.onPrimary} size={26} />
          </HapticPressable>
        ) : (
          <HapticPressable
            accessibilityRole="button"
            disabled={submitting}
            onPress={next}
            style={[s.cta, submitting && s.ctaDisabled]}
            testID="wizard-create"
          >
            <Text style={s.ctaText}>{submitting ? 'Saving...' : submitLabel}</Text>
          </HapticPressable>
        )}
      </View>
    </View>
  );
}
