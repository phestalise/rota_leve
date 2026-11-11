import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import RouteCard from '../components/RouteCard';
import { Banner, Button, EmptyState, Row, Screen, T } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { AppStackParamList } from '../navigation/types';
import { MIN_ACCESSIBLE_SCORE, rankRoutes } from '../services/accessibility';
import { profileIcon, profileLabel } from '../services/profiles';
import { fetchCandidateRoutes } from '../services/routeProvider';
import { getActiveReports } from '../storage/reports';
import { colors, elev, radius, spacing, themed } from '../theme';
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
      const [candidates, reports] = await Promise.all([fetchCandidateRoutes(origin, destination), getActiveReports()]);
      setRoutes(rankRoutes(candidates, user!.profile!, reports));
    } catch {
      setError('Não foi possível buscar as rotas agora. Tente novamente.');
    }
  }, [origin, destination, user]);

  useEffect(() => {
    load();
  }, [load]);

  const trip = (
    <View style={[styles.trip, elev.shadow]}>
      <Row gap={spacing.md}>
        <View style={styles.rail}>
          <View style={styles.originDot} />
          <View style={styles.railLine} />
          <Ionicons name="location" size={15} color={colors.brand} />
        </View>
        <View style={{ flex: 1, gap: 10 }}>
          <T variant="bodyStrong" numberOfLines={1}>
            {origin}
          </T>
          <T variant="bodyStrong" numberOfLines={1}>
            {destination}
          </T>
        </View>
      </Row>
      <Row gap={6} style={styles.profile}>
        <Ionicons name={profileIcon(user?.profile?.type)} size={14} color={colors.brandDark} />
        <T variant="caption" color={colors.brandDark} style={{ flex: 1 }}>
          Ordenado pela nota para o perfil “{profileLabel(user?.profile?.type)}”
        </T>
      </Row>
    </View>
  );

  if (error) {
    return (
      <Screen>
        {trip}
        <EmptyState
          icon="cloud-offline-outline"
          title="Erro na busca"
          message={error}
          action={<Button title="Tentar novamente" icon="refresh" onPress={load} />}
        />
      </Screen>
    );
  }

  if (!routes) {
    return (
      <Screen>
        {trip}
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.brand} />
          <T variant="bodyStrong" center>
            Avaliando a acessibilidade…
          </T>
          <T variant="caption" center style={{ maxWidth: 260 }}>
            Cruzando as opções de transporte com elevadores, escadas e relatos da comunidade.
          </T>
        </View>
      </Screen>
    );
  }

  const noAccessible = routes.every((r) => r.blocked || r.score < MIN_ACCESSIBLE_SCORE);

  return (
    <Screen>
      {trip}
      {noAccessible && (
        <Banner
          tone="bad"
          icon="warning"
          title="Nenhuma opção totalmente acessível"
          text="Todas as rotas têm obstáculos para o seu perfil. Mostramos a menos difícil primeiro. Considere transporte por aplicativo ou o Atende+ da SPTrans."
        />
      )}
      <Row style={{ justifyContent: 'space-between' }}>
        <T variant="overline">{routes.length} opções</T>
        <T variant="caption">Toque para ver o trajeto</T>
      </Row>
      {routes.map((r, i) => (
        <RouteCard key={r.id} route={r} rank={i + 1} onPress={() => navigation.navigate('RouteDetail', { route: r })} />
      ))}
    </Screen>
  );
}

const styles = themed(() => StyleSheet.create({
  trip: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.md },
  rail: { alignItems: 'center', width: 16, alignSelf: 'stretch', paddingVertical: 5 },
  originDot: { width: 11, height: 11, borderRadius: 6, borderWidth: 3, borderColor: colors.brand },
  railLine: { width: 2, flex: 1, backgroundColor: colors.line, marginVertical: 3 },
  profile: { backgroundColor: colors.brandSoft, paddingHorizontal: spacing.md, paddingVertical: 8, borderRadius: radius.sm },
  loading: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xxxl },
}));
