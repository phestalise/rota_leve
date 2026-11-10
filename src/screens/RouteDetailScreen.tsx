import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useState } from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';
import { ModeStrip } from '../components/RouteCard';
import RouteTimeline from '../components/RouteTimeline';
import { Button, Card, ScoreBadge, Screen, SectionTitle, Tag } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { AppStackParamList } from '../navigation/types';
import { scoreRoute } from '../services/accessibility';
import { getActiveReports } from '../storage/reports';
import { deleteSavedRoute, findSavedRouteByRouteId, saveRoute } from '../storage/routes';
import { colors, spacing } from '../theme';
import { Report, ScoredRoute } from '../types';
import { confirmAction, notify } from '../utils/dialog';
import { transfersLabel } from '../utils/id';

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
    notify('Rota salva', 'Você será avisada(o) em "Minhas rotas" se algum problema surgir neste trajeto.');
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

  return (
    <Screen>
      <Card>
        <View style={styles.header}>
          <ScoreBadge score={route.score} size="lg" />
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={styles.title}>{route.summary}</Text>
            <Text style={styles.meta}>
              {route.origin} → {route.destination}
            </Text>
            <Text style={styles.meta}>
              {route.durationMin} min · {route.walkMeters} m a pé · {transfersLabel(route.transfers)}
            </Text>
          </View>
        </View>
        <ModeStrip route={route} />
        {route.blocked && <Tag text="Inviável para o seu perfil" tone="danger" icon="close-circle" />}
      </Card>

      <Card style={styles.explain}>
        <View style={styles.explainHeader}>
          <Ionicons name="sparkles" size={18} color={colors.primaryDark} />
          <Text style={styles.explainTitle}>Resumo da rota</Text>
        </View>
        <Text style={styles.explainText}>{route.explanation}</Text>
      </Card>

      {route.issues.length > 0 && (
        <>
          <SectionTitle>Pontos de atenção</SectionTitle>
          <Card>
            {route.issues.map((i) => (
              <View key={i} style={styles.line}>
                <Ionicons name="alert-circle" size={18} color={colors.danger} />
                <Text style={styles.issue}>{i}</Text>
              </View>
            ))}
          </Card>
        </>
      )}

      {route.highlights.length > 0 && (
        <>
          <SectionTitle>A favor</SectionTitle>
          <Card>
            {route.highlights.map((h) => (
              <View key={h} style={styles.line}>
                <Ionicons name="checkmark-circle" size={18} color={colors.success} />
                <Text style={styles.highlight}>{h}</Text>
              </View>
            ))}
          </Card>
        </>
      )}

      <SectionTitle>Mapa do trajeto</SectionTitle>
      <Card>
        <RouteTimeline
          steps={route.steps}
          reports={reports}
          onReport={(location) => navigation.navigate('NewReport', { location })}
        />
        <Button title="Abrir no Google Maps" variant="secondary" icon="map-outline" onPress={openMap} />
      </Card>

      {savedId ? (
        <Button title="Remover das minhas rotas" variant="danger" icon="trash-outline" onPress={handleRemove} />
      ) : (
        <Button title="Salvar rota" icon="bookmark-outline" onPress={handleSave} loading={busy} />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', gap: spacing.lg, alignItems: 'center' },
  title: { fontSize: 18, fontWeight: '800', color: colors.text },
  meta: { color: colors.textMuted, fontSize: 13 },
  explain: { backgroundColor: colors.primaryLight, borderColor: colors.primaryLight },
  explainHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  explainTitle: { fontWeight: '800', color: colors.primaryDark },
  explainText: { color: colors.text, fontSize: 15, lineHeight: 22 },
  line: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
  issue: { flex: 1, color: colors.text },
  highlight: { flex: 1, color: colors.text },
});
