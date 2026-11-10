import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../theme';
import { ScoredRoute, StepMode } from '../types';
import { transfersLabel } from '../utils/id';
import { Card, ScoreBadge, Tag } from './ui';

export const MODE_ICONS: Record<StepMode, keyof typeof Ionicons.glyphMap> = {
  walk: 'walk',
  bus: 'bus',
  metro: 'subway',
  train: 'train',
};

export function ModeStrip({ route }: { route: ScoredRoute }) {
  return (
    <View style={styles.strip}>
      {route.steps.map((s, i) => (
        <View key={s.id} style={styles.stripItem}>
          {i > 0 && <Ionicons name="chevron-forward" size={12} color={colors.textMuted} />}
          <Ionicons name={MODE_ICONS[s.mode]} size={18} color={colors.text} />
          {s.line && s.mode === 'bus' && <Text style={styles.lineText}>{s.line.split('-')[0]}</Text>}
        </View>
      ))}
    </View>
  );
}

export default function RouteCard({
  route,
  rank,
  onPress,
}: {
  route: ScoredRoute;
  rank?: number;
  onPress: () => void;
}) {
  return (
    <Card onPress={onPress}>
      <View style={styles.header}>
        <ScoreBadge score={route.score} />
        <View style={{ flex: 1, gap: 2 }}>
          {rank === 1 && !route.blocked && <Tag text="Melhor para você" tone="success" icon="star" />}
          <Text style={styles.title}>{route.summary}</Text>
          <Text style={styles.meta}>
            {route.durationMin} min · {route.walkMeters} m a pé · {transfersLabel(route.transfers)}
          </Text>
        </View>
      </View>
      <ModeStrip route={route} />
      {route.blocked && <Tag text="Inviável para o seu perfil" tone="danger" icon="close-circle" />}
      {route.issues.slice(0, 2).map((issue) => (
        <View key={issue} style={styles.line}>
          <Ionicons name="alert-circle" size={16} color={colors.danger} />
          <Text style={styles.issue}>{issue}</Text>
        </View>
      ))}
      {route.highlights.slice(0, 2).map((h) => (
        <View key={h} style={styles.line}>
          <Ionicons name="checkmark-circle" size={16} color={colors.success} />
          <Text style={styles.highlight}>{h}</Text>
        </View>
      ))}
    </Card>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
  title: { fontSize: 16, fontWeight: '700', color: colors.text },
  meta: { fontSize: 13, color: colors.textMuted },
  strip: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 4 },
  stripItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  lineText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
    backgroundColor: colors.primaryDark,
    paddingHorizontal: 4,
    borderRadius: 4,
    overflow: 'hidden',
  },
  line: { flexDirection: 'row', gap: 6, alignItems: 'flex-start' },
  issue: { flex: 1, fontSize: 13, color: colors.danger },
  highlight: { flex: 1, fontSize: 13, color: colors.success },
});
