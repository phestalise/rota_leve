import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useState } from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';
import { ModeStrip } from '../components/RouteCard';
import RouteTimeline from '../components/RouteTimeline';
import { Button, Card, Divider, IconButton, Row, ScoreRing, Screen, SectionHeader, T } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { AppStackParamList } from '../navigation/types';
import { scoreRoute } from '../services/accessibility';
import { getActiveReports } from '../storage/reports';
import { deleteSavedRoute, findSavedRouteByRouteId, saveRoute } from '../storage/routes';
import { colors, fonts, radius, scoreTone, scoreVerdict, spacing, themed, toneColors } from '../theme';
import { Report, ScoredRoute } from '../types';
import { confirmAction, notify } from '../utils/dialog';

type Props = NativeStackScreenProps<AppStackParamList, 'RouteDetail'>;

export default function RouteDetailScreen({ route: navRoute, navigation }: Props) {
  const { user } = useAuth();
  const [route, setRoute] = useState<ScoredRoute>(navRoute.params.route);
  const [reports, setReports] = useState<Report[]>([]);
  const [savedId, setSavedId] = useState<string | undefined>(navRoute.params.savedId);
  const [busy, setBusy] = useState(false);

  // Recalcula a nota ao abrir a tela: relatos novos podem ter mudado a situação da rota.
  useFocusEffect(
    useCallback(() => {
      (async () => {
        const active = await getActiveReports();
        setReports(active);
        setRoute((r) => scoreRoute(r, user!.profile!, active));
        const saved = await findSavedRouteByRouteId(user!.id, navRoute.params.route.id);
        setSavedId(saved?.id);
      })();
    }, [user, navRoute.params.route.id]),
  );

  async function handleSave() {
    setBusy(true);
    const saved = await saveRoute(user!.id, route);
    setSavedId(saved.id);
    setBusy(false);
    notify('Rota salva', 'Se alguém relatar um problema neste trajeto, ela aparece com aviso na tela inicial.');
  }

  async function handleRemove() {
    if (!savedId) return;
    if (!(await confirmAction('Remover rota', 'Deseja remover esta rota das suas rotas salvas?'))) return;
    await deleteSavedRoute(savedId);
    setSavedId(undefined);
    if (navRoute.params.savedId) navigation.goBack();
  }

  function openMap() {
    const url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
      route.origin + ', São Paulo',
    )}&destination=${encodeURIComponent(route.destination + ', São Paulo')}&travelmode=transit`;
    Linking.openURL(url);
  }

  const tone = toneColors(scoreTone(route.score, route.blocked));

  return (
    <Screen
      footer={
        <Row gap={spacing.md}>
          <IconButton icon="map-outline" label="Abrir no Google Maps" onPress={openMap} size={54} />
          {savedId ? (
            <Button title="Remover das salvas" variant="danger" icon="bookmark" onPress={handleRemove} style={{ flex: 1 }} />
          ) : (
            <Button title="Salvar rota" icon="bookmark-outline" onPress={handleSave} loading={busy} style={{ flex: 1 }} />
          )}
        </Row>
      }
    >
      {/* Resumo */}
      <Card style={{ padding: 0, gap: 0, overflow: 'hidden' }}>
        <View style={[styles.hero, { backgroundColor: tone.bg }]}>
          <ScoreRing score={route.score} blocked={route.blocked} size={92} />
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={[styles.verdict, { color: tone.fg }]}>{scoreVerdict(route.score, route.blocked)}</Text>
            <T variant="h2">{route.summary}</T>
            <T variant="caption" numberOfLines={2}>
              {route.origin} até {route.destination}
            </T>
          </View>
        </View>
        <Row style={styles.stats}>
          <Stat icon="time-outline" value={`${route.durationMin}`} unit="min" />
          <View style={styles.statDivider} />
          <Stat icon="walk-outline" value={`${route.walkMeters}`} unit="m a pé" />
          <View style={styles.statDivider} />
          <Stat icon="git-compare-outline" value={`${route.transfers}`} unit={route.transfers === 1 ? 'baldeação' : 'baldeações'} />
        </Row>
        <View style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.lg }}>
          <ModeStrip route={route} />
        </View>
      </Card>

      {/* Explicação */}
      <View style={styles.ai}>
        <T variant="label" color={colors.brandDark}>
          Resumo
        </T>
        <T variant="body" color={colors.ink} style={{ fontSize: 15.5, lineHeight: 24 }}>
          {route.explanation}
        </T>
      </View>

      {/* Atenção e a favor */}
      {(route.issues.length > 0 || route.highlights.length > 0) && (
        <Card style={{ gap: spacing.sm }}>
          {route.issues.map((i) => (
            <Row key={i} gap={10} align="flex-start">
              <View style={[styles.bullet, { backgroundColor: colors.badSoft }]}>
                <Ionicons name="alert" size={12} color={colors.bad} />
              </View>
              <T variant="body" color={colors.ink} style={{ flex: 1, fontSize: 14 }}>
                {i}
              </T>
            </Row>
          ))}
          {route.issues.length > 0 && route.highlights.length > 0 && <Divider />}
          {route.highlights.map((h) => (
            <Row key={h} gap={10} align="flex-start">
              <View style={[styles.bullet, { backgroundColor: colors.goodSoft }]}>
                <Ionicons name="checkmark" size={12} color={colors.good} />
              </View>
              <T variant="body" color={colors.ink} style={{ flex: 1, fontSize: 14 }}>
                {h}
              </T>
            </Row>
          ))}
        </Card>
      )}

      <SectionHeader title="Trajeto passo a passo" action="Abrir mapa" onAction={openMap} />
      <Card>
        <RouteTimeline steps={route.steps} reports={reports} onReport={(location) => navigation.navigate('NewReport', { location })} />
      </Card>
    </Screen>
  );
}

function Stat({ icon, value, unit }: { icon: keyof typeof Ionicons.glyphMap; value: string; unit: string }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', gap: 2 }}>
      <Ionicons name={icon} size={16} color={colors.inkFaint} />
      <Text style={styles.statValue}>{value}</Text>
      <T variant="caption" style={{ fontSize: 11.5 }}>
        {unit}
      </T>
    </View>
  );
}

const styles = themed(() => StyleSheet.create({
  hero: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg, padding: spacing.lg },
  verdict: { fontFamily: fonts.semibold, fontSize: 12.5 },
  stats: { paddingVertical: spacing.lg },
  statDivider: { width: 1, alignSelf: 'stretch', backgroundColor: colors.line },
  statValue: { fontFamily: fonts.extrabold, fontSize: 20, color: colors.ink, letterSpacing: -0.3 },
  ai: {
    backgroundColor: colors.brandSoft,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
    borderLeftWidth: 4,
    borderLeftColor: colors.brand,
  },
  aiIcon: { width: 24, height: 24, borderRadius: 8, backgroundColor: colors.brand, alignItems: 'center', justifyContent: 'center' },
  bullet: { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
}));
