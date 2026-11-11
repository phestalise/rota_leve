import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ModeStrip, RouteStats } from '../components/RouteCard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, EmptyState, Loading, PageHeader, Row, ScoreRing, Screen, T } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { AppStackParamList } from '../navigation/types';
import { scoreRoute } from '../services/accessibility';
import { alertMessage, getRouteAlerts, RouteAlert } from '../services/alerts';
import { getActiveReports } from '../storage/reports';
import { getSavedRoutes } from '../storage/routes';
import { colors, elev, fonts, radius, spacing, themed } from '../theme';
import { SavedRoute, ScoredRoute } from '../types';

interface Item {
  saved: SavedRoute;
  current: ScoredRoute;
  alert?: RouteAlert;
}

export default function MyRoutesScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
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
      <Screen style={{ paddingTop: insets.top + spacing.xxl }}>
        <PageHeader title="Rotas salvas" />
        <EmptyState
          icon="bookmark-outline"
          title="Nenhuma rota salva"
          message="Salve os trajetos que você faz sempre e a gente avisa quando algo quebrar no caminho."
          action={<Button title="Buscar uma rota" icon="search" onPress={() => navigation.navigate('Tabs', { screen: 'Buscar' })} />}
        />
      </Screen>
    );
  }

  const withAlert = items.filter((i) => i.alert).length;

  return (
    <Screen style={{ paddingTop: insets.top + spacing.xxl }}>
      <PageHeader
        title="Rotas salvas"
        subtitle={
          withAlert > 0
            ? `${withAlert} de ${items.length} rota${items.length > 1 ? 's' : ''} com aviso da comunidade.`
            : 'Tudo certo nos seus trajetos por enquanto.'
        }
      />

      {items.map(({ saved, current, alert }) => (
        <Pressable
          key={saved.id}
          onPress={() => navigation.navigate('RouteDetail', { route: current, savedId: saved.id })}
          style={({ pressed }) => [styles.card, elev.shadow, pressed && { opacity: 0.94 }]}
        >
          <View style={styles.inner}>
            <Row gap={spacing.lg} align="flex-start">
              <View style={{ flex: 1, gap: 4 }}>
                <T variant="title">{saved.name}</T>
                <T variant="caption" numberOfLines={1}>
                  {current.summary}
                </T>
                <RouteStats route={current} />
              </View>
              <ScoreRing score={current.score} blocked={current.blocked} size={52} />
            </Row>
            <ModeStrip route={current} />
          </View>

          {alert && (
            <View style={styles.alert}>
              {alert.reports.map(({ place, report }) => (
                <Row key={report.id} gap={8} align="flex-start">
                  <Ionicons name="warning" size={15} color={colors.bad} style={{ marginTop: 2 }} />
                  <T variant="caption" color={colors.ink} style={{ flex: 1, fontFamily: fonts.semibold }}>
                    {alertMessage(place, report)}
                  </T>
                </Row>
              ))}
              <Pressable
                onPress={() =>
                  navigation.navigate('RouteResults', { origin: saved.route.origin, destination: saved.route.destination })
                }
                style={styles.altBtn}
                accessibilityRole="button"
              >
                <Ionicons name="git-branch-outline" size={15} color={colors.white} />
                <Text style={styles.altText}>Ver alternativas</Text>
              </Pressable>
            </View>
          )}
        </Pressable>
      ))}
    </Screen>
  );
}

const styles = themed(() => StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, overflow: 'hidden' },
  inner: { padding: spacing.lg, gap: spacing.md },
  alert: { backgroundColor: colors.badSoft, padding: spacing.lg, gap: spacing.sm },
  altBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: colors.bad,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: radius.pill,
    marginTop: 4,
  },
  altText: { fontFamily: fonts.bold, fontSize: 13, color: colors.white },
}));
