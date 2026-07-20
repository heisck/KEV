import type { Dispatch, SetStateAction } from 'react';
import { Text, TextInput, View } from 'react-native';

import { CloseIcon } from '@/components/kev/icons';
import { DateTimeField } from '@/components/session/DateTimeField';
import { FloorStepper, RoomSlider } from '@/components/session/LocationControls';
import {
  ALL_METHODS,
  floorLabel,
  type CourseRange,
  type VerificationMethod,
  type WizardValues,
} from '@/components/session/sessionForm';
import { HapticPressable } from '@/components/ui/HapticPressable';
import { makeSessionWizardStyles } from '@/screens/sessionWizardStyles';
import type { Palette } from '@/theme';

type WizardStyles = ReturnType<typeof makeSessionWizardStyles>;
type SetValue = <K extends keyof WizardValues>(key: K, value: WizardValues[K]) => void;
type Shared = { styles: WizardStyles; palette: Palette };

const METHOD_OPTIONS: { key: VerificationMethod; label: string }[] = [
  { key: 'FACE', label: 'Face' },
  { key: 'NFC', label: 'NFC' },
  { key: 'MANUAL', label: 'Manual' },
];

export function LocationStep({
  values,
  setValue,
  styles,
  palette,
}: Shared & { values: WizardValues; setValue: SetValue }) {
  return (
    <View style={styles.section}>
      <Field
        label="Building or College"
        value={values.building}
        onChange={(text) => setValue('building', text)}
        styles={styles}
        palette={palette}
      />
      <FloorStepper
        value={Number(values.floor) || 0}
        onChange={(floor) => setValue('floor', String(floor))}
      />
      <RoomSlider
        value={Number(values.room) || 1}
        onChange={(room) => setValue('room', String(room))}
      />
    </View>
  );
}

export function ExamStep({
  values,
  setValues,
  setCourse,
  styles,
  palette,
}: Shared & {
  values: WizardValues;
  setValues: Dispatch<SetStateAction<WizardValues>>;
  setCourse: (index: number, patch: Partial<CourseRange>) => void;
}) {
  const removeCourse = (index: number) =>
    setValues((previous) => ({
      ...previous,
      courses: previous.courses.filter((_, courseIndex) => courseIndex !== index),
    }));
  return (
    <View style={styles.section}>
      <Text style={styles.hint}>Add course codes and their index-number ranges.</Text>
      {values.courses.map((course, index) => (
        <View key={index} style={styles.courseCard}>
          {values.courses.length > 1 ? (
            <HapticPressable
              accessibilityRole="button"
              accessibilityLabel={`Remove range ${index + 1}`}
              haptic="select"
              hitSlop={8}
              onPress={() => removeCourse(index)}
              style={styles.courseRemove}
              testID={`course-remove-${index}`}
            >
              <CloseIcon color={palette.muted} size={16} />
            </HapticPressable>
          ) : null}
          <Field
            label="Course code"
            value={course.course}
            onChange={(text) => setCourse(index, { course: text })}
            styles={styles}
            palette={palette}
          />
          <View style={styles.row}>
            <View style={styles.flex}>
              <Field
                label="Index from"
                value={course.indexFrom}
                onChange={(text) => setCourse(index, { indexFrom: text })}
                numeric
                styles={styles}
                palette={palette}
              />
            </View>
            <View style={styles.flex}>
              <Field
                label="Index to"
                value={course.indexTo}
                onChange={(text) => setCourse(index, { indexTo: text })}
                numeric
                styles={styles}
                palette={palette}
              />
            </View>
          </View>
        </View>
      ))}
      <HapticPressable
        accessibilityRole="button"
        onPress={() =>
          setValues((previous) => ({
            ...previous,
            courses: [...previous.courses, { course: '', indexFrom: '', indexTo: '' }],
          }))
        }
        style={styles.addRange}
      >
        <Text style={styles.addRangeText}>+ Add another range</Text>
      </HapticPressable>
    </View>
  );
}

export function ScheduleStep({
  values,
  setValue,
  styles,
}: {
  values: WizardValues;
  setValue: SetValue;
  styles: WizardStyles;
}) {
  return (
    <View style={styles.section}>
      <DateTimeField
        label="Exam date"
        mode="date"
        value={values.examDate}
        onChange={(text) => setValue('examDate', text)}
        placeholder="Select a date"
      />
      <View style={styles.row}>
        <View style={styles.flex}>
          <DateTimeField
            label="Start time"
            mode="time"
            value={values.startTime}
            onChange={(text) => setValue('startTime', text)}
            placeholder="09:00"
          />
        </View>
        <View style={styles.flex}>
          <DateTimeField
            label="End time"
            mode="time"
            value={values.endTime}
            onChange={(text) => setValue('endTime', text)}
            placeholder="12:00"
          />
        </View>
      </View>
    </View>
  );
}

export function MethodsStep({
  values,
  setValues,
  styles,
  palette,
}: Shared & { values: WizardValues; setValues: Dispatch<SetStateAction<WizardValues>> }) {
  const toggle = (method: VerificationMethod) =>
    setValues((previous) => ({
      ...previous,
      methods: previous.methods.includes(method)
        ? previous.methods.filter((item) => item !== method)
        : [...previous.methods, method],
    }));
  const allActive = ALL_METHODS.every((method) => values.methods.includes(method));
  const toggleAll = () =>
    setValues((previous) => ({
      ...previous,
      methods: allActive ? [] : [...ALL_METHODS],
    }));
  return (
    <View style={styles.section}>
      <Text style={styles.hint}>Choose the verification methods invigilators can use.</Text>
      <View style={styles.methodGrid}>
        <MethodChip
          active={allActive}
          label="All"
          onPress={toggleAll}
          styles={styles}
          palette={palette}
          solid
        />
        {METHOD_OPTIONS.map((method) => (
          <MethodChip
            key={method.key}
            active={values.methods.includes(method.key)}
            label={method.label}
            onPress={() => toggle(method.key)}
            styles={styles}
            palette={palette}
          />
        ))}
      </View>
    </View>
  );
}

function MethodChip({
  active,
  label,
  onPress,
  styles,
  palette,
  solid = false,
}: Shared & {
  active: boolean;
  label: string;
  onPress: () => void;
  solid?: boolean;
}) {
  return (
    <HapticPressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      haptic="select"
      onPress={onPress}
      style={[
        styles.methodChip,
        {
          borderColor: active ? palette.primary : palette.hairline,
          backgroundColor: active ? (solid ? palette.primary : palette.primary12) : palette.surface,
        },
      ]}
    >
      <Text
        style={[
          styles.methodChipText,
          { color: active ? (solid ? palette.onPrimary : palette.primary) : palette.inkSoft },
        ]}
      >
        {label}
      </Text>
    </HapticPressable>
  );
}

export function ReviewStep({ values, styles }: { values: WizardValues; styles: WizardStyles }) {
  const rows: [string, string][] = [
    [
      'Location',
      [values.building, floorLabel(values.floor), values.room].filter(Boolean).join(' · ') ||
        'Not set',
    ],
    [
      'Courses',
      values.courses
        .map((course) => course.course)
        .filter(Boolean)
        .join(', ') || 'Not set',
    ],
    [
      'Ranges',
      values.courses
        .map((course) => `${course.indexFrom || '?'}-${course.indexTo || '?'}`)
        .join(', '),
    ],
    ['Date', values.examDate || 'Not set'],
    ['Time', [values.startTime, values.endTime].filter(Boolean).join(' to ') || 'Not set'],
    ['Methods', values.methods.join(', ') || 'Not set'],
  ];
  return (
    <View style={styles.section}>
      {rows.map(([label, value]) => (
        <View key={label} style={styles.reviewRow}>
          <Text style={styles.reviewLabel}>{label}</Text>
          <Text style={styles.reviewValue}>{value}</Text>
        </View>
      ))}
    </View>
  );
}

function Field({
  label,
  value,
  onChange,
  numeric = false,
  styles,
  palette,
}: Shared & {
  label: string;
  value: string;
  onChange: (text: string) => void;
  numeric?: boolean;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={(text) => onChange(numeric ? text.replace(/[^0-9]/g, '') : text)}
        placeholder={label}
        placeholderTextColor={palette.muted}
        style={styles.input}
        autoCapitalize="characters"
        keyboardType={numeric ? 'number-pad' : 'default'}
      />
    </View>
  );
}
