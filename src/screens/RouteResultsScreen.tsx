import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import RouteCard from '../components/RouteCard';
import { Button, Card, EmptyState, Screen } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { AppStackParamList } from '../navigation/types';
import { MIN_ACCESSIBLE_SCORE, rankRoutes } from '../services/accessibility';
import { fetchCandidateRoutes } from '../services/routeProvider';
import { getActiveReports } from '../storage/reports';
import { colors, radius, spacing } from '../theme';
import { ScoredRoute } from '../types';

type Props = NativeStackScreenProps<AppStackParamList, 'RouteResults'>;

export default function RouteResultsScreen({ route, navigation }: Props) {
  const { origin, destination } = route.params;
  const { user } = useAuth();
  const [routes, setRoutes] = useState<ScoredRoute[] | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setError('');
    setRoutes(null);
    try {
      const [candidates, reports] = await Promise.all([
        fetchCandidateRoutes(origin, destination),
        getActiveReports(),
      ]);
      setRoutes(rankRoutes(candidates, user!.profile!, reports));
    } catch {
      setError('Não foi possível buscar as rotas agora. Tente novamente.');
    }
  }, [origin, destination, user]);

  useEffect(() => {
    load();
  }, [load]);

  if (error) {
    return (
      <Screen>
        <EmptyState
          icon="cloud-offline-outline"
          title="Erro na busca"
          message={error}
          action={<Button title="Tentar novamente" onPress={load} />}
        />
      </Screen>
    );
  }

  if (!routes) {
    return (
      <Screen style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Buscando opções de transporte e avaliando a acessibilidade…</Text>
      </Screen>
    );
  }

  const noAccessible = routes.every((r) => r.blocked || r.score < MIN_ACCESSIBLE_SCORE);

  return (
    <Screen>
      <View style={styles.trip}>
        <Text style={styles.tripText} numberOfLines={1}>
          <Ionicons name="ellipse-outline" size={12} /> {origin}
        </Text>
        <Text style={styles.tripText} numberOfLines={1}>
          <Ionicons name="location" size={12} /> {destination}
        </Text>
        <Text style={styles.tripHint}>
          {routes.length} opções encontradas, reordenadas pela nota de acessibilidade do seu perfil.
        </Text>
      </View>

      {noAccessible && (
        <Card style={styles.warning}>
          <View style={{ flexDirection: 'row', gap: spacing.sm, alignItems: 'center' }}>
            <Ionicons name="warning" size={22} color={colors.danger} />
            <Text style={styles.warningTitle}>Nenhuma opção totalmente acessível</Text>
          </View>
          <Text style={styles.warningText}>
            Todas as rotas encontradas têm obstáculos para o seu perfil. Mostramos a menos difícil
            primeiro. Considere um transporte por aplicativo ou o Atende+ da SPTrans.
          </Text>
        </Card>
      )}

      {routes.map((r, i) => (
        <RouteCard
          key={r.id}
          route={r}
          rank={i + 1}
          onPress={() => navigation.navigate('RouteDetail', { route: r })}
        />
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  loading: { flexGrow: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: colors.textMuted, textAlign: 'center', marginTop: spacing.md },
  trip: { backgroundColor: colors.primaryLight, padding: spacing.md, borderRadius: radius.md, gap: 2 },
  tripText: { fontSize: 15, fontWeight: '700', color: colors.primaryDark },
  tripHint: { fontSize: 13, color: colors.primaryDark, marginTop: spacing.xs },
  warning: { backgroundColor: colors.dangerLight, borderColor: colors.danger },
  warningTitle: { fontWeight: '800', color: colors.danger, fontSize: 15, flex: 1 },
  warningText: { color: colors.text },
});
