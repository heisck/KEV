import { Text, View } from 'react-native';
import type { ReactNode } from 'react';

import type { StyleProp, TextStyle } from 'react-native';

const TOKEN = /(\*\*.*?\*\*|~~.*?~~|<u>.*?<\/u>|_[^_]+_)/g;
const ALIGNMENT = /^<(left|right)>(.*)<\/\1>$/;

function wrapped(value: string, key: number): ReactNode {
  if (value.startsWith('**') && value.endsWith('**')) {
    return (
      <Text key={key} style={{ fontWeight: '800' }}>
        {wrapped(value.slice(2, -2), key)}
      </Text>
    );
  }
  if (value.startsWith('~~') && value.endsWith('~~')) {
    return (
      <Text key={key} style={{ textDecorationLine: 'line-through' }}>
        {wrapped(value.slice(2, -2), key)}
      </Text>
    );
  }
  if (value.startsWith('<u>') && value.endsWith('</u>')) {
    return (
      <Text key={key} style={{ textDecorationLine: 'underline' }}>
        {wrapped(value.slice(3, -4), key)}
      </Text>
    );
  }
  if (value.startsWith('_') && value.endsWith('_')) {
    return (
      <Text key={key} style={{ fontStyle: 'italic' }}>
        {wrapped(value.slice(1, -1), key)}
      </Text>
    );
  }
  return inline(value);
}

function inline(value: string): ReactNode {
  return value.split(TOKEN).map((part, index) => {
    return part.match(TOKEN) ? wrapped(part, index) : part;
  });
}

export function FormattedReportText({
  value,
  style,
}: {
  value: string;
  style?: StyleProp<TextStyle>;
}) {
  return (
    <View>
      {value.split('\n').map((line, index) => {
        const aligned = line.match(ALIGNMENT);
        const text = aligned?.[2] ?? line;
        return (
          <Text
            key={`${index}-${line}`}
            style={[style, aligned && { textAlign: aligned[1] as 'left' | 'right' }]}
          >
            {wrapped(text, index)}
          </Text>
        );
      })}
    </View>
  );
}
