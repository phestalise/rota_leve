import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ModeStrip } from '../components/RouteCard';
import { Button, Card, EmptyState, Loading, ScoreBadge, Screen } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { AppStackParamList } from '../navigation/types';
import { scoreRoute } from '../services/accessibility';
import { alertMessage, getRouteAlerts, RouteAlert } from '../services/alerts';
import { getActiveReports } from '../storage/reports';
import { getSavedRoutes } from '../storage/routes';
import { colors, spacing } from '../theme';
import { SavedRoute, ScoredRoute } from '../types';
import { formatDate } from '../utils/id';

interface Item {
  saved: SavedRoute;
  current: ScoredRoute;
  alert?: RouteAlert;
}

export default function MyRoutesScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const { user } = useAuth();
  const [items, setItems] = useState<Item[] | null>(null);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const [saved, reports, alerts] = await Promise.all([
          getSavedRoutes(user!.id),
          getActiveReports(),
          getRouteAlerts(user!.id),
        ]);
        setItems(
          saved.map((s) => ({
            saved: s,
            current: scoreRoute(s.route, user!.profile!, reports),
            alert: alerts.find((a) => a.saved.id === s.id),
          })),
        );
      })();
    }, [user]),
  );

  if (!items) return <Loading />;

  if (items.length === 0) {
    return (
      <Screen>
        <EmptyState
          icon="bookmark-outline"
          title="Nenhuma rota salva"
          message="Salve as rotas que você usa com frequência para acompanhar problemas no caminho."
          action={
            <Button
              title="Buscar uma rota"
              icon="search"
              onPress={() => navigation.navigate('Tabs', { screen: 'Buscar' })}
            />
          }
        />
      </Screen>
    );
  }

  return (
    <Screen>
      {items.some((i) => i.alert) && (
        <View style={styles.summary}>
          <Ionicons name="notifications" size={18} color={colors.danger} />
          <Text style={styles.summaryText}>
            {items.filter((i) => i.alert).length} rota(s) salva(s) com problema relatado pela comunidade
          </Text>
        </View>
      )}
      {items.map(({ saved, current, alert }) => (
        <Card
          key={saved.id}
          onPress={() => navigation.navigate('RouteDetail', { route: current, savedId: saved.id })}
        >
          <View style={styles.header}>
            <ScoreBadge score={current.score} />
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{saved.name}</Text>
              <Text style={styles.meta}>
                {current.summary} · {current.durationMin} min
              </Text>
              <Text style={styles.meta}>Salva em {formatDate(saved.savedAt)}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </View>
          <ModeStrip route={current} />
          {alert && (
            <View style={styles.alert}>
              {alert.reports.map(({ place, report }) => (
                <View key={report.id} style={styles.alertRow}>
                  <Ionicons name="warning" size={16} color={colors.danger} />
                  <Text style={styles.alertText}>{alertMessage(place, report)}</Text>
                </View>
              ))}
              <Button
                title="Ver alternativas"
                variant="danger"
                icon="git-branch-outline"
                onPress={() =>
                  navigation.navigate('RouteResults', {
                    origin: saved.route.origin,
                    destination: saved.route.destination,
                  })
                }
              />
            </View>
          )}
        </Card>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  title: { fontSize: 16, fontWeight: '700', color: colors.text },
  meta: { fontSize: 13, color: colors.textMuted },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.dangerLight,
    padding: spacing.md,
    borderRadius: 12,
  },
  summaryText: { flex: 1, color: colors.danger, fontWeight: '700' },
  alert: {
    backgroundColor: colors.dangerLight,
    borderRadius: 12,
    padding: spacing.md,
    gap: spacing.sm,
  },
  alertRow: { flexDirection: 'row', gap: 6, alignItems: 'flex-start' },
  alertText: { flex: 1, color: colors.danger, fontWeight: '600' },
});
