import { useEffect, useMemo, useState } from 'react';
import { BackHandler, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { CreateSessionInput } from '@/api/sessions';
import { BackIcon, ChevronRightIcon, CloseIcon } from '@/components/kev/icons';
import { FloorStepper, RoomSlider } from '@/components/session/LocationControls';
import { DateTimeField } from '@/components/session/DateTimeField';
import { HapticPressable } from '@/components/ui/HapticPressable';
import { radii, shadows, spacing, usePalette } from '@/theme';
import type { Palette } from '@/theme';

/** Verification methods a session may allow — the set the app can actually capture. */
export type VerificationMethod = 'FACE' | 'NFC' | 'MANUAL';

/** All selectable methods, in display order. */
export const ALL_METHODS: VerificationMethod[] = ['FACE', 'NFC', 'MANUAL'];

export type CourseRange = { course: string; indexFrom: string; indexTo: string };

export type WizardValues = {
  building: string;
  floor: string;
  room: string;
  courses: CourseRange[];
  examDate: string;
  startTime: string;
  endTime: string;
  methods: VerificationMethod[];
};

const STEPS = ['Location', 'Exam', 'Schedule', 'Methods', 'Review'] as const;

const METHOD_OPTIONS: { key: VerificationMethod; label: string }[] = [
  { key: 'FACE', label: 'Face' },
  { key: 'NFC', label: 'NFC' },
  { key: 'MANUAL', label: 'Manual' },
];

const EMPTY: WizardValues = {
  building: '',
  floor: '',
  room: '',
  courses: [{ course: '', indexFrom: '', indexTo: '' }],
  examDate: '',
  startTime: '',
  endTime: '',
  methods: ['FACE', 'MANUAL'],
};

/** Human-readable floor label: -1 → "Basement 1", 0 → "Ground", 3 → "Floor 3". */
export function floorLabel(floor: string): string {
  const n = Number(floor);
  if (!floor.trim() || !Number.isFinite(n)) return '';
  if (n < 0) return `Basement ${-n}`;
  if (n === 0) return 'Ground';
  return `Floor ${n}`;
}

/** Maps the wizard form into the backend create-session payload. */
export function toCreateInput(v: WizardValues): CreateSessionInput {
  const froms = v.courses.map((c) => Number(c.indexFrom)).filter(Number.isFinite);
  const tos = v.courses.map((c) => Number(c.indexTo)).filter(Number.isFinite);
  return {
    title:
      v.courses
        .map((c) => c.course)
        .filter(Boolean)
        .join(', ') || undefined,
    building: v.building.trim(),
    floor: floorLabel(v.floor) || undefined,
    room: v.room.trim() || undefined,
    courseCodes: [...new Set(v.courses.map((c) => c.course.trim()).filter(Boolean))],
    indexRangeStart: froms.length ? String(Math.min(...froms)) : undefined,
    indexRangeEnd: tos.length ? String(Math.max(...tos)) : undefined,
    examDate: v.examDate.trim() || undefined,
    startTime: v.startTime.trim() || undefined,
    endTime: v.endTime.trim() || undefined,
    verificationMethods: v.methods,
  };
}

type Props = {
  onSubmit: (input: CreateSessionInput) => void;
  onBack?: () => void;
  submitting?: boolean;
};

/** Five-step exam-creation wizard: Location → Exam → Schedule → Methods → Review. */
export function CreateSessionWizard({ onSubmit, onBack, submitting = false }: Props) {
  const p = usePalette();
  const { top } = useSafeAreaInsets();
  const s = useMemo(() => makeStyles(p), [p]);
  const [step, setStep] = useState(0);
  const [v, setV] = useState<WizardValues>(EMPTY);

  const set = <K extends keyof WizardValues>(key: K, value: WizardValues[K]) =>
    setV((prev) => ({ ...prev, [key]: value }));

  const setCourse = (i: number, patch: Partial<CourseRange>) =>
    setV((prev) => ({
      ...prev,
      courses: prev.courses.map((c, idx) => (idx === i ? { ...c, ...patch } : c)),
    }));

  const canNext =
    (step === 0 && v.building.trim().length > 0) ||
    (step === 1 && v.courses.some((c) => c.course.trim())) ||
    step === 2 ||
    (step === 3 && v.methods.length > 0) ||
    step === 4;

  const next = () => (step < STEPS.length - 1 ? setStep(step + 1) : onSubmit(toCreateInput(v)));
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
        <Text style={s.topTitle}>{`New session · ${STEPS[step]}`}</Text>
        <View style={s.topSpacer} />
      </View>
      <View style={s.progress}>
        {STEPS.map((_, i) => (
          <View key={i} style={[s.dot, i <= step && s.dotActive]} />
        ))}
      </View>

      <ScrollView contentContainerStyle={s.body} keyboardShouldPersistTaps="handled">
        {step === 0 ? <LocationStep v={v} set={set} s={s} p={p} /> : null}
        {step === 1 ? <ExamStep v={v} setV={setV} setCourse={setCourse} s={s} p={p} /> : null}
        {step === 2 ? <ScheduleStep v={v} set={set} s={s} /> : null}
        {step === 3 ? <MethodsStep v={v} setV={setV} s={s} p={p} /> : null}
        {step === 4 ? <ReviewStep v={v} s={s} /> : null}
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
            <Text style={s.ctaText}>{submitting ? 'Creating…' : 'Create session'}</Text>
          </HapticPressable>
        )}
      </View>
    </View>
  );
}

type StepShared = { s: ReturnType<typeof makeStyles>; p: Palette };

function LocationStep({
  v,
  set,
  s,
  p,
}: StepShared & {
  v: WizardValues;
  set: <K extends keyof WizardValues>(k: K, val: WizardValues[K]) => void;
}) {
  return (
    <View style={s.section}>
      <Field
        label="Building or College"
        value={v.building}
        onChange={(t) => set('building', t)}
        s={s}
        p={p}
      />
      <FloorStepper value={Number(v.floor) || 0} onChange={(n) => set('floor', String(n))} />
      <RoomSlider value={Number(v.room) || 1} onChange={(n) => set('room', String(n))} />
    </View>
  );
}

function ExamStep({
  v,
  setV,
  setCourse,
  s,
  p,
}: StepShared & {
  v: WizardValues;
  setV: React.Dispatch<React.SetStateAction<WizardValues>>;
  setCourse: (i: number, patch: Partial<CourseRange>) => void;
}) {
  const removeCourse = (i: number) =>
    setV((prev) => ({ ...prev, courses: prev.courses.filter((_, idx) => idx !== i) }));
  return (
    <View style={s.section}>
      <Text style={s.hint}>Add course codes and their index-number ranges.</Text>
      {v.courses.map((c, i) => (
        <View key={i} style={s.courseCard}>
          {v.courses.length > 1 ? (
            <HapticPressable
              accessibilityRole="button"
              accessibilityLabel={`Remove range ${i + 1}`}
              haptic="select"
              hitSlop={8}
              onPress={() => removeCourse(i)}
              style={s.courseRemove}
              testID={`course-remove-${i}`}
            >
              <CloseIcon color={p.muted} size={16} />
            </HapticPressable>
          ) : null}
          <Field
            label="Course code"
            value={c.course}
            onChange={(t) => setCourse(i, { course: t })}
            s={s}
            p={p}
          />
          <View style={s.row}>
            <View style={s.flex}>
              <Field
                label="Index from"
                value={c.indexFrom}
                onChange={(t) => setCourse(i, { indexFrom: t })}
                numeric
                s={s}
                p={p}
              />
            </View>
            <View style={s.flex}>
              <Field
                label="Index to"
                value={c.indexTo}
                onChange={(t) => setCourse(i, { indexTo: t })}
                numeric
                s={s}
                p={p}
              />
            </View>
          </View>
        </View>
      ))}
      <HapticPressable
        accessibilityRole="button"
        onPress={() =>
          setV((prev) => ({
            ...prev,
            courses: [...prev.courses, { course: '', indexFrom: '', indexTo: '' }],
          }))
        }
        style={s.addRange}
      >
        <Text style={s.addRangeText}>+ Add another range</Text>
      </HapticPressable>
    </View>
  );
}

function ScheduleStep({
  v,
  set,
  s,
}: {
  v: WizardValues;
  set: <K extends keyof WizardValues>(k: K, val: WizardValues[K]) => void;
  s: ReturnType<typeof makeStyles>;
}) {
  return (
    <View style={s.section}>
      <DateTimeField
        label="Exam date"
        mode="date"
        value={v.examDate}
        onChange={(t) => set('examDate', t)}
        placeholder="Select a date"
      />
      <View style={s.row}>
        <View style={s.flex}>
          <DateTimeField
            label="Start time"
            mode="time"
            value={v.startTime}
            onChange={(t) => set('startTime', t)}
            placeholder="09:00"
          />
        </View>
        <View style={s.flex}>
          <DateTimeField
            label="End time"
            mode="time"
            value={v.endTime}
            onChange={(t) => set('endTime', t)}
            placeholder="12:00"
          />
        </View>
      </View>
    </View>
  );
}

function MethodsStep({
  v,
  setV,
  s,
  p,
}: StepShared & { v: WizardValues; setV: React.Dispatch<React.SetStateAction<WizardValues>> }) {
  const toggle = (k: VerificationMethod) =>
    setV((prev) => ({
      ...prev,
      methods: prev.methods.includes(k)
        ? prev.methods.filter((m) => m !== k)
        : [...prev.methods, k],
    }));
  const allActive = ALL_METHODS.every((m) => v.methods.includes(m));
  const toggleAll = () => setV((prev) => ({ ...prev, methods: allActive ? [] : [...ALL_METHODS] }));
  return (
    <View style={s.section}>
      <Text style={s.hint}>Choose the verification methods invigilators can use.</Text>
      <View style={s.methodGrid}>
        <HapticPressable
          accessibilityRole="button"
          accessibilityState={{ selected: allActive }}
          haptic="select"
          onPress={toggleAll}
          style={[
            s.methodChip,
            {
              borderColor: allActive ? p.primary : p.hairline,
              backgroundColor: allActive ? p.primary : p.surface,
            },
          ]}
        >
          <Text style={[s.methodChipText, { color: allActive ? p.onPrimary : p.inkSoft }]}>
            All
          </Text>
        </HapticPressable>
        {METHOD_OPTIONS.map((m) => {
          const active = v.methods.includes(m.key);
          return (
            <HapticPressable
              key={m.key}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              haptic="select"
              onPress={() => toggle(m.key)}
              style={[
                s.methodChip,
                {
                  borderColor: active ? p.primary : p.hairline,
                  backgroundColor: active ? p.primary12 : p.surface,
                },
              ]}
            >
              <Text style={[s.methodChipText, { color: active ? p.primary : p.inkSoft }]}>
                {m.label}
              </Text>
            </HapticPressable>
          );
        })}
      </View>
    </View>
  );
}

function ReviewStep({ v, s }: { v: WizardValues; s: ReturnType<typeof makeStyles> }) {
  const rows: [string, string][] = [
    ['Location', [v.building, floorLabel(v.floor), v.room].filter(Boolean).join(' · ') || '—'],
    [
      'Courses',
      v.courses
        .map((c) => c.course)
        .filter(Boolean)
        .join(', ') || '—',
    ],
    ['Ranges', v.courses.map((c) => `${c.indexFrom || '?'}–${c.indexTo || '?'}`).join(', ')],
    ['Date', v.examDate || '—'],
    ['Time', [v.startTime, v.endTime].filter(Boolean).join(' – ') || '—'],
    ['Methods', v.methods.join(', ') || '—'],
  ];
  return (
    <View style={s.section}>
      {rows.map(([label, value]) => (
        <View key={label} style={s.reviewRow}>
          <Text style={s.reviewLabel}>{label}</Text>
          <Text style={s.reviewValue}>{value}</Text>
        </View>
      ))}
    </View>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  autoCap = 'characters',
  numeric = false,
  s,
  p,
}: {
  label: string;
  value: string;
  onChange: (t: string) => void;
  placeholder?: string;
  autoCap?: 'none' | 'characters';
  numeric?: boolean;
  s: ReturnType<typeof makeStyles>;
  p: Palette;
}) {
  return (
    <View style={s.field}>
      <Text style={s.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={(t) => onChange(numeric ? t.replace(/[^0-9]/g, '') : t)}
        placeholder={placeholder ?? label}
        placeholderTextColor={p.muted}
        style={s.input}
        autoCapitalize={autoCap}
        keyboardType={numeric ? 'number-pad' : 'default'}
      />
    </View>
  );
}

const makeStyles = (p: Palette) =>
  StyleSheet.create({
    screen: { backgroundColor: p.bg, flex: 1, paddingHorizontal: spacing.xl },
    topBar: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: spacing.md,
      paddingVertical: spacing.sm,
    },
    topClose: {
      alignItems: 'center',
      backgroundColor: p.surfaceDim,
      borderRadius: radii.pill,
      height: 40,
      justifyContent: 'center',
      width: 40,
    },
    topTitle: { color: p.ink, flex: 1, fontSize: 16, fontWeight: '700' },
    topSpacer: { height: 40, width: 40 },
    progress: { flexDirection: 'row', gap: spacing.sm, paddingVertical: spacing.md },
    dot: { backgroundColor: p.hairline, borderRadius: radii.pill, flex: 1, height: 4 },
    dotActive: { backgroundColor: p.primary },
    body: { gap: spacing.lg, paddingBottom: spacing.xxxl, paddingTop: spacing.md },
    section: { gap: spacing.md },
    hint: { color: p.muted, fontSize: 13, fontWeight: '500' },
    row: { flexDirection: 'row', gap: spacing.md },
    flex: { flex: 1 },
    field: { gap: spacing.xs },
    fieldLabel: { color: p.inkSoft, fontSize: 13, fontWeight: '700' },
    input: {
      backgroundColor: p.surfaceDim,
      borderColor: p.hairline,
      borderRadius: radii.md,
      borderWidth: 1,
      color: p.ink,
      fontSize: 16,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
    },
    courseCard: {
      backgroundColor: p.surfaceDim,
      borderRadius: radii.lg,
      gap: spacing.sm,
      padding: spacing.md,
    },
    courseRemove: {
      alignItems: 'center',
      backgroundColor: p.bg,
      borderRadius: radii.pill,
      height: 28,
      justifyContent: 'center',
      position: 'absolute',
      right: spacing.sm,
      top: spacing.sm,
      width: 28,
      zIndex: 1,
    },
    addRange: { paddingVertical: spacing.sm },
    addRangeText: { color: p.primary, fontSize: 14, fontWeight: '700' },
    methodGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
    methodChip: {
      borderRadius: radii.pill,
      borderWidth: 1.5,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm + 2,
    },
    methodChipText: { fontSize: 14, fontWeight: '700' },
    reviewRow: {
      borderBottomColor: p.hairline,
      borderBottomWidth: StyleSheet.hairlineWidth,
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: spacing.md,
    },
    reviewLabel: { color: p.muted, fontSize: 13, fontWeight: '600' },
    reviewValue: { color: p.ink, flex: 1, fontSize: 14, fontWeight: '700', textAlign: 'right' },
    footer: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: spacing.md,
      marginBottom: spacing.xxl,
    },
    backFab: {
      alignItems: 'center',
      backgroundColor: p.surfaceDim,
      borderColor: p.hairline,
      borderRadius: 30,
      borderWidth: 1,
      height: 60,
      justifyContent: 'center',
      width: 60,
    },
    cta: {
      alignItems: 'center',
      backgroundColor: p.primary,
      borderRadius: radii.pill,
      flex: 1,
      paddingVertical: spacing.lg - 2,
    },
    ctaDisabled: { opacity: 0.4 },
    ctaText: { color: p.onPrimary, fontSize: 15, fontWeight: '700' },
    nextFab: {
      alignItems: 'center',
      backgroundColor: p.primary,
      borderRadius: 30,
      height: 60,
      justifyContent: 'center',
      marginLeft: 'auto',
      width: 60,
      ...shadows.floating,
    },
  });
