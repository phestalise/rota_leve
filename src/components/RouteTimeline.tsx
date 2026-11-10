import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { activeReportsFor } from '../services/accessibility';
import { STATIONS } from '../services/stations';
import { colors, spacing } from '../theme';
import { Report, RouteStep, StepMode } from '../types';
import { MODE_ICONS } from './RouteCard';

const MODE_COLORS: Record<StepMode, string> = {
  walk: '#8A9A96',
  bus: '#D9822B',
  metro: '#1F5FAD',
  train: '#7B3FA0',
};

const MODE_LABEL: Record<StepMode, string> = {
  walk: 'A pé',
  bus: 'Ônibus',
  metro: 'Metrô',
  train: 'Trem',
};

/** Mapa esquemático do trajeto: cada trecho é um segmento colorido com suas paradas. */
export default function RouteTimeline({
  steps,
  reports,
  onReport,
}: {
  steps: RouteStep[];
  reports: Report[];
  onReport: (location: string) => void;
}) {
  return (
    <View>
      {steps.map((s, i) => {
        const color = MODE_COLORS[s.mode];
        const stationAlerts = (s.stations ?? []).flatMap((st) =>
          activeReportsFor(st, reports, ['elevador', 'escada_rolante']).map((r) => ({ st, r })),
        );
        const streetAlerts = s.street ? activeReportsFor(s.street, reports, ['calcada', 'rampa']) : [];
        const reportTarget = s.mode === 'walk' ? s.street : s.stop ?? s.stations?.[0];
        return (
          <View key={s.id} style={styles.row}>
            <View style={styles.rail}>
              <View style={[styles.dot, { borderColor: color }]} />
              <View
                style={[
                  styles.segment,
                  { backgroundColor: color },
                  s.mode === 'walk' && styles.dashed,
                  i === steps.length - 1 && { flex: 0, height: 0 },
                ]}
              />
            </View>
            <View style={styles.body}>
              <Text style={styles.place}>{s.from}</Text>
              <View style={styles.modeRow}>
                <Ionicons name={MODE_ICONS[s.mode]} size={16} color={color} />
                <Text style={[styles.mode, { color }]}>
                  {MODE_LABEL[s.mode]}
                  {s.line ? ` · ${s.line}` : ''}
                </Text>
              </View>
              <Text style={styles.detail}>
                {s.mode === 'walk'
                  ? `${s.distanceMeters} m pela ${s.street} · terreno ${s.slope ?? 'plano'} · ${s.durationMin} min`
                  : `Até ${s.to} · ${s.durationMin} min`}
              </Text>
              {(s.stations ?? []).map((st) => {
                const info = STATIONS[st];
                if (!info) return null;
                return (
                  <Text key={st} style={styles.station}>
                    {st}: {info.hasElevator ? 'elevador' : 'sem elevador'}
                    {info.hasEscalator ? ' · escada rolante' : ''}
                    {info.hasSeats ? ' · bancos' : ''}
                  </Text>
                );
              })}
              {stationAlerts.map(({ st, r }) => (
                <View key={r.id} style={styles.alert}>
                  <Ionicons name="warning" size={14} color={colors.danger} />
                  <Text style={styles.alertText}>
                    {st}: {r.description}
                  </Text>
                </View>
              ))}
              {streetAlerts.map((r) => (
                <View key={r.id} style={styles.alert}>
                  <Ionicons name="warning" size={14} color={colors.danger} />
                  <Text style={styles.alertText}>{r.description}</Text>
                </View>
              ))}
              {reportTarget && (
                <Pressable onPress={() => onReport(reportTarget)} style={styles.reportBtn}>
                  <Ionicons name="megaphone-outline" size={14} color={colors.primary} />
                  <Text style={styles.reportText}>Relatar problema aqui</Text>
                </Pressable>
              )}
              {i === steps.length - 1 && (
                <View style={[styles.modeRow, { marginTop: spacing.md }]}>
                  <Ionicons name="location" size={18} color={colors.danger} />
                  <Text style={styles.place}>{s.to}</Text>
                </View>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.md },
  rail: { width: 18, alignItems: 'center' },
  dot: { width: 16, height: 16, borderRadius: 8, borderWidth: 4, backgroundColor: '#fff' },
  segment: { width: 5, flex: 1, minHeight: 40, borderRadius: 3 },
  dashed: { opacity: 0.5 },
  body: { flex: 1, paddingBottom: spacing.lg, gap: 3 },
  place: { fontSize: 15, fontWeight: '700', color: colors.text },
  modeRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  mode: { fontWeight: '700', fontSize: 14 },
  detail: { color: colors.textMuted, fontSize: 13 },
  station: { color: colors.text, fontSize: 12 },
  alert: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'flex-start',
    backgroundColor: colors.dangerLight,
    padding: 6,
    borderRadius: 6,
  },
  alertText: { flex: 1, color: colors.danger, fontSize: 12, fontWeight: '600' },
  reportBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  reportText: { color: colors.primary, fontSize: 12, fontWeight: '600' },
});
