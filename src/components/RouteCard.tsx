import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, elev, fonts, radius, scoreTone, scoreVerdict, spacing, themed, toneColors } from '../theme';
import { RouteStep, ScoredRoute, StepMode } from '../types';
import { Row, ScoreRing, T } from './ui';

export const MODE_ICONS: Record<StepMode, keyof typeof Ionicons.glyphMap> = {
  walk: 'walk',
  bus: 'bus',
  metro: 'subway',
  train: 'train',
};

export const MODE_COLORS: Record<StepMode, string> = {
  walk: '#7D8A86',
  bus: '#D97A1E',
  metro: '#2D5FB8',
  train: '#8A3FAE',
};

function stepLabel(s: RouteStep) {
  if (s.mode === 'walk') return `${s.durationMin}'`;
  if (s.mode === 'bus') return s.line?.split('-')[0] ?? 'Ônibus';
  const m = s.line?.match(/Linha (\d+)/);
  return m ? `L${m[1]}` : s.mode === 'train' ? 'Trem' : 'Metrô';
}

/** Sequência de modais da rota, como em apps de mapa. */
export function ModeStrip({ route }: { route: ScoredRoute }) {
  return (
    <View style={styles.strip}>
      {route.steps.map((s, i) => (
        <Row key={s.id} gap={4}>
          {i > 0 && <Ionicons name="chevron-forward" size={11} color={colors.inkFaint} />}
          {s.mode === 'walk' ? (
            <Row gap={2}>
              <Ionicons name="walk" size={15} color={MODE_COLORS.walk} />
              <Text style={styles.walkText}>{stepLabel(s)}</Text>
            </Row>
          ) : (
            <Row gap={4} style={[styles.modeChip, { backgroundColor: MODE_COLORS[s.mode] }]}>
              <Ionicons name={MODE_ICONS[s.mode]} size={12} color={colors.white} />
              <Text style={styles.modeChipText}>{stepLabel(s)}</Text>
            </Row>
          )}
        </Row>
      ))}
    </View>
  );
}

export function RouteStats({ route }: { route: ScoredRoute }) {
  return (
    <Row gap={spacing.md} style={{ flexWrap: 'wrap' }}>
      <Row gap={4}>
        <Ionicons name="time-outline" size={14} color={colors.inkSoft} />
        <T variant="caption">{route.durationMin} min</T>
      </Row>
      <Row gap={4}>
        <Ionicons name="walk-outline" size={14} color={colors.inkSoft} />
        <T variant="caption">{route.walkMeters} m</T>
      </Row>
      <Row gap={4}>
        <Ionicons name="git-compare-outline" size={14} color={colors.inkSoft} />
        <T variant="caption">
          {route.transfers === 0 ? 'Direto' : `${route.transfers} baldeaç${route.transfers === 1 ? 'ão' : 'ões'}`}
        </T>
      </Row>
    </Row>
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
  const tone = scoreTone(route.score, route.blocked);
  const c = toneColors(tone);
  const best = rank === 1 && !route.blocked;
  const mainIssue = route.issues[0];
  const mainHighlight = route.highlights[0];
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.card, elev.shadow, best && styles.cardBest, pressed && { opacity: 0.94 }]}
    >
      {best && (
        <Row gap={6} style={styles.bestRibbon}>
          <Ionicons name="sparkles" size={13} color={colors.white} />
          <Text style={styles.bestText}>Melhor opção para você</Text>
        </Row>
      )}
      <View style={styles.inner}>
        <Row gap={spacing.lg} align="flex-start">
          <ScoreRing score={route.score} blocked={route.blocked} size={58} />
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={[styles.verdict, { color: c.fg }]}>{scoreVerdict(route.score, route.blocked)}</Text>
            <T variant="title">{route.summary}</T>
            <RouteStats route={route} />
          </View>
        </Row>
        <ModeStrip route={route} />
        {(mainIssue || mainHighlight) && (
          <View style={styles.footer}>
            {mainIssue ? (
              <Row gap={6} align="flex-start">
                <Ionicons name="alert-circle" size={15} color={colors.bad} style={{ marginTop: 1 }} />
                <T variant="caption" color={colors.ink} style={{ flex: 1 }} numberOfLines={2}>
                  {mainIssue}
                </T>
                {route.issues.length > 1 && (
                  <View style={styles.more}>
                    <Text style={styles.moreText}>+{route.issues.length - 1}</Text>
                  </View>
                )}
              </Row>
            ) : (
              <Row gap={6}>
                <Ionicons name="checkmark-circle" size={15} color={colors.good} />
                <T variant="caption" color={colors.ink} style={{ flex: 1 }}>
                  {mainHighlight}
                </T>
              </Row>
            )}
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = themed(() => StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, overflow: 'hidden' },
  cardBest: { borderWidth: 2, borderColor: colors.brand },
  bestRibbon: { backgroundColor: colors.brand, paddingHorizontal: spacing.lg, paddingVertical: 7 },
  bestText: { fontFamily: fonts.bold, fontSize: 12.5, color: colors.white, letterSpacing: 0.2 },
  inner: { padding: spacing.lg, gap: spacing.md },
  verdict: { fontFamily: fonts.bold, fontSize: 11.5, letterSpacing: 0.6, textTransform: 'uppercase' },
  strip: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 4 },
  modeChip: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6 },
  modeChipText: { fontFamily: fonts.bold, fontSize: 11.5, color: colors.white },
  walkText: { fontFamily: fonts.semibold, fontSize: 11.5, color: MODE_COLORS.walk },
  footer: { borderTopWidth: 1, borderTopColor: colors.line, paddingTop: spacing.md },
  more: { backgroundColor: colors.badSoft, borderRadius: 8, paddingHorizontal: 6, paddingVertical: 1 },
  moreText: { fontFamily: fonts.bold, fontSize: 11, color: colors.bad },
}));
