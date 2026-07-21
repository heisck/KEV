import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { HapticPressable } from '@/components/ui/HapticPressable';
import { radii, spacing, usePalette } from '@/theme';

export type ReportFormat =
  | 'bold'
  | 'italic'
  | 'underline'
  | 'strike'
  | 'align-left'
  | 'align-right'
  | 'numbered-list'
  | 'circle-list'
  | 'bullet-list';
type ListFormat = Extract<ReportFormat, `${string}-list`>;
const LIST_FORMATS: readonly ListFormat[] = ['numbered-list', 'circle-list', 'bullet-list'];

function isListFormat(format: ReportFormat): format is ListFormat {
  return LIST_FORMATS.includes(format as ListFormat);
}

const TOOLS: { value: ReportFormat; label: string }[] = [
  { value: 'bold', label: 'Bold' },
  { value: 'italic', label: 'Italic' },
  { value: 'underline', label: 'Underline' },
  { value: 'strike', label: 'Strike through' },
  { value: 'align-left', label: 'Align left' },
  { value: 'align-right', label: 'Align right' },
  { value: 'numbered-list', label: 'Numbered list' },
  { value: 'circle-list', label: 'Circle list' },
  { value: 'bullet-list', label: 'Bullet list' },
];

export function ReportFormattingToolbar({
  active,
  onSelect,
}: {
  active: ReadonlySet<ReportFormat>;
  onSelect: (format: ReportFormat) => void;
}) {
  const p = usePalette();
  return (
    <ScrollView
      horizontal
      keyboardShouldPersistTaps="always"
      showsHorizontalScrollIndicator={false}
      style={[styles.scroll, { backgroundColor: p.surfaceDim }]}
      contentContainerStyle={styles.content}
      testID="report-format-toolbar"
    >
      {TOOLS.map((tool, index) => {
        const selected = active.has(tool.value);
        return (
          <HapticPressable
            key={tool.value}
            accessibilityLabel={tool.label}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => onSelect(tool.value)}
            style={[
              styles.button,
              index < TOOLS.length - 1 && { borderRightColor: p.hairline, borderRightWidth: 1 },
              selected && { backgroundColor: p.primary },
            ]}
            testID={`report-format-${tool.value}`}
          >
            <FormatGlyph format={tool.value} color={selected ? p.onPrimary : p.ink} />
          </HapticPressable>
        );
      })}
    </ScrollView>
  );
}

function FormatGlyph({ format, color }: { format: ReportFormat; color: string }) {
  if (format === 'align-left' || format === 'align-right') {
    return <AlignmentGlyph align={format === 'align-left' ? 'left' : 'right'} color={color} />;
  }
  if (isListFormat(format)) return <ListGlyph type={format} color={color} />;
  const labels: Partial<Record<ReportFormat, string>> = {
    bold: 'B',
    italic: 'i',
    underline: 'U',
    strike: 'S',
  };
  return <Text style={[styles.glyph, styles[format], { color }]}>{labels[format]}</Text>;
}

function ListGlyph({ type, color }: { type: ListFormat; color: string }) {
  return (
    <View style={styles.listIcon} testID={`report-list-icon-${type}`}>
      {[0, 1, 2].map((index) => (
        <View key={index} style={styles.listRow}>
          {type === 'numbered-list' ? (
            <Text style={[styles.listNumber, { color }]}>{index + 1}</Text>
          ) : (
            <View
              style={[
                styles.listMarker,
                type === 'circle-list'
                  ? { borderColor: color, borderWidth: 1 }
                  : { backgroundColor: color },
              ]}
            />
          )}
          <View
            style={[styles.listLine, { backgroundColor: color, width: index === 1 ? 15 : 18 }]}
          />
        </View>
      ))}
    </View>
  );
}

function AlignmentGlyph({ align, color }: { align: 'left' | 'right'; color: string }) {
  return (
    <View style={[styles.alignment, { alignItems: align === 'left' ? 'flex-start' : 'flex-end' }]}>
      {[18, 13, 16].map((width) => (
        <View key={width} style={[styles.line, { backgroundColor: color, width }]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { borderRadius: radii.md, flexGrow: 0, height: 44 },
  content: { alignItems: 'stretch' },
  button: { alignItems: 'center', height: 44, justifyContent: 'center', width: 44 },
  glyph: { fontSize: 17, fontWeight: '700' },
  bold: { fontWeight: '900' },
  italic: { fontFamily: 'Georgia', fontSize: 20, fontStyle: 'italic' },
  underline: { fontWeight: '500', textDecorationLine: 'underline' },
  strike: { fontWeight: '600', textDecorationLine: 'line-through' },
  alignment: { gap: spacing.xs - 1, width: 18 },
  line: { borderRadius: 1, height: 2 },
  listIcon: { gap: 2, width: 25 },
  listRow: { alignItems: 'center', flexDirection: 'row', gap: 3, height: 6 },
  listMarker: { borderRadius: 3, height: 4, width: 4 },
  listNumber: { fontSize: 6, fontWeight: '700', lineHeight: 7, width: 5 },
  listLine: { borderRadius: 1, height: 1.5 },
});
