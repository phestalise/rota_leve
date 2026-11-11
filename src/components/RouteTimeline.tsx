import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { activeReportsFor } from '../services/accessibility';
import { STATIONS } from '../services/stations';
import { colors, fonts, spacing, themed } from '../theme';
import { Report, RouteStep, StepMode } from '../types';
import { MODE_COLORS, MODE_ICONS } from './RouteCard';
import { Row, T } from './ui';

const SLOPE_LABEL = { plana: 'plano', moderada: 'leve subida', ingreme: 'ladeira' } as const;

const MODE_LABEL: Record<StepMode, string> = {
  walk: 'Caminhada',
  bus: 'Ônibus',
  metro: 'Metrô',
  train: 'Trem',
};

function Facility({ ok, label }: { ok: boolean; label: string }) {
  return (
    <Row gap={3} style={[styles.facility, { backgroundColor: ok ? colors.goodSoft : colors.badSoft }]}>
      <Ionicons name={ok ? 'checkmark' : 'close'} size={11} color={ok ? colors.good : colors.bad} />
      <Text style={[styles.facilityText, { color: ok ? colors.good : colors.bad }]}>{label}</Text>
    </Row>
  );
}

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
        const last = i === steps.length - 1;
        const elevatorBroken = (st: string) => activeReportsFor(st, reports, ['elevador']).length > 0;
        const stationAlerts = (s.stations ?? []).flatMap((st) =>
          activeReportsFor(st, reports, ['elevador', 'escada_rolante']).map((r) => ({ st, r })),
        );
        const streetAlerts = s.street ? activeReportsFor(s.street, reports, ['calcada', 'rampa']) : [];
        const reportTarget = s.mode === 'walk' ? s.street : s.stop ?? s.stations?.[0];
        return (
          <View key={s.id}>
            {/* Parada de início do trecho */}
            <Row gap={spacing.md}>
              <View style={styles.nodeCol}>
                <View style={[styles.node, { borderColor: i === 0 ? colors.brand : colors.ink }]} />
              </View>
              <T variant="title" style={{ flex: 1, fontSize: 15 }}>
                {s.from}
              </T>
            </Row>

            {/* Trecho */}
            <Row gap={spacing.md} align="stretch">
              <View style={styles.nodeCol}>
                <View
                  style={[
                    styles.segment,
                    s.mode === 'walk' ? styles.segmentWalk : { backgroundColor: color },
                    s.mode === 'walk' && { borderColor: color },
                  ]}
                />
              </View>
              <View style={styles.stepBody}>
                <Row gap={8}>
                  <View style={[styles.modeIcon, { backgroundColor: color }]}>
                    <Ionicons name={MODE_ICONS[s.mode]} size={14} color={colors.white} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.modeLabel, { color }]}>
                      {MODE_LABEL[s.mode]}
                      {s.line ? ` · ${s.line}` : ''}
                    </Text>
                    <T variant="caption">
                      {s.mode === 'walk'
                        ? `${s.distanceMeters} m · ${SLOPE_LABEL[s.slope ?? 'plana']} · ${s.durationMin} min`
                        : `${s.durationMin} min até ${s.to}`}
                    </T>
                  </View>
                </Row>

                {(s.stations ?? []).map((st) => {
                  const info = STATIONS[st];
                  if (!info) return null;
                  return (
                    <Row key={st} gap={6} style={{ flexWrap: 'wrap' }}>
                      <T variant="caption" color={colors.ink} style={{ fontFamily: fonts.semibold }}>
                        {st}
                      </T>
                      <Facility ok={info.hasElevator && !elevatorBroken(st)} label="Elevador" />
                      <Facility ok={info.hasEscalator} label="Escada rol." />
                      <Facility ok={info.hasSeats} label="Bancos" />
                    </Row>
                  );
                })}

                {[...stationAlerts.map(({ st, r }) => ({ id: r.id, text: `${st}: ${r.description}` })), ...streetAlerts.map((r) => ({ id: r.id, text: r.description }))].map(
                  (a) => (
                    <Row key={a.id} gap={6} align="flex-start" style={styles.alert}>
                      <Ionicons name="warning" size={13} color={colors.bad} style={{ marginTop: 2 }} />
                      <T variant="caption" color={colors.bad} style={{ flex: 1, fontFamily: fonts.semibold }}>
                        {a.text}
                      </T>
                    </Row>
                  ),
                )}

                {reportTarget && (
                  <Pressable onPress={() => onReport(reportTarget)} hitSlop={6} style={{ alignSelf: 'flex-start' }}>
                    <Row gap={4}>
                      <Ionicons name="add-circle-outline" size={14} color={colors.inkFaint} />
                      <Text style={styles.reportText}>Relatar problema aqui</Text>
                    </Row>
                  </Pressable>
                )}
              </View>
            </Row>

            {last && (
              <Row gap={spacing.md}>
                <View style={styles.nodeCol}>
                  <Ionicons name="location" size={20} color={colors.brand} />
                </View>
                <T variant="title" style={{ flex: 1, fontSize: 15 }}>
                  {s.to}
                </T>
              </Row>
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = themed(() => StyleSheet.create({
  nodeCol: { width: 20, alignItems: 'center' },
  node: { width: 14, height: 14, borderRadius: 7, borderWidth: 3, backgroundColor: colors.white },
  segment: { width: 5, flex: 1, borderRadius: 3, marginVertical: 3 },
  segmentWalk: { width: 0, borderLeftWidth: 3, borderStyle: 'dotted' },
  stepBody: { flex: 1, gap: 8, paddingVertical: spacing.md },
  modeIcon: { width: 26, height: 26, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  modeLabel: { fontFamily: fonts.bold, fontSize: 13.5 },
  facility: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  facilityText: { fontFamily: fonts.semibold, fontSize: 10.5 },
  alert: { backgroundColor: colors.badSoft, padding: 8, borderRadius: 8 },
  reportText: { fontFamily: fonts.semibold, fontSize: 12, color: colors.inkFaint },
}));
