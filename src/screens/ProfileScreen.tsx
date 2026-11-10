import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card, Divider, IconBubble, ListRow, Pill, Row, SectionHeader, T } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { AppStackParamList } from '../navigation/types';
import { profileIcon, profileLabel } from '../services/profiles';
import { getReports } from '../storage/reports';
import { getSavedRoutes } from '../storage/routes';
import { colors, fonts, radius, shadow, spacing } from '../theme';
import { confirmAction } from '../utils/dialog';

export default function ProfileScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const insets = useSafeAreaInsets();
  const { user, signOut } = useAuth();
  const profile = user?.profile;
  const [stats, setStats] = useState({ routes: 0, reports: 0, confirmations: 0 });

  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      Promise.all([getSavedRoutes(user.id), getReports()]).then(([routes, reports]) =>
        setStats({
          routes: routes.length,
          reports: reports.filter((r) => r.userId === user.id).length,
          confirmations: reports.filter((r) => r.confirmations.includes(user.id)).length,
        }),
      );
    }, [user]),
  );

  async function handleLogout() {
    if (await confirmAction('Sair', 'Deseja sair da sua conta?')) await signOut();
  }

  const initials = (user?.name ?? '?')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join('');

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{ paddingBottom: spacing.xxxl }}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.hero, { paddingTop: insets.top + spacing.xxl }]}>
        <View style={[styles.circle, { width: 200, height: 200, top: -70, left: -60 }]} />
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <T variant="h1" color={colors.white} center>
          {user?.name}
        </T>
        <T variant="caption" color="rgba(255,255,255,0.75)" center>
          {user?.email}
        </T>
      </View>

      <View style={styles.body}>
        <Row style={[styles.stats, shadow]}>
          <Stat value={stats.routes} label="Rotas salvas" />
          <View style={styles.statDivider} />
          <Stat value={stats.reports} label="Relatos" />
          <View style={styles.statDivider} />
          <Stat value={stats.confirmations} label="Confirmações" />
        </Row>

        <SectionHeader
          title="Perfil de mobilidade"
          action="Editar"
          onAction={() => navigation.navigate('ProfileSetup', { firstTime: false })}
        />
        <Card>
          <Row gap={spacing.md}>
            <IconBubble icon={profileIcon(profile?.type)} size={46} solid />
            <View style={{ flex: 1 }}>
              <T variant="title">{profileLabel(profile?.type)}</T>
              <T variant="caption">Até {profile?.maxWalkMeters ?? 0} m de caminhada por viagem</T>
            </View>
          </Row>
          {profile && (
            <Row gap={6} style={{ flexWrap: 'wrap' }}>
              {profile.avoidStairs && <Pill text="Sem escadas" tone="brand" icon="footsteps-outline" />}
              {profile.preferElevator && <Pill text="Elevador" tone="brand" icon="arrow-up-circle-outline" />}
              {profile.needSeat && <Pill text="Assento" tone="brand" icon="cafe-outline" />}
              {profile.avoidSteepSlopes && <Pill text="Sem ladeiras" tone="brand" icon="trending-up-outline" />}
            </Row>
          )}
        </Card>

        <SectionHeader title="Aplicativo" />
        <Card style={{ padding: 0, gap: 0, overflow: 'hidden' }}>
          <ListRow
            icon="options-outline"
            title="Preferências de rota"
            subtitle="Escadas, elevador, assento e caminhada"
            onPress={() => navigation.navigate('ProfileSetup', { firstTime: false })}
          />
          <Divider inset={70} />
          <ListRow icon="information-circle-outline" title="Sobre o App" subtitle="Como o Rota Leve funciona" onPress={() => navigation.navigate('About')} />
          <Divider inset={70} />
          <ListRow icon="log-out-outline" title="Sair" danger onPress={handleLogout} />
        </Card>
      </View>
    </ScrollView>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <Text style={styles.statValue}>{value}</Text>
      <T variant="caption" style={{ fontSize: 12 }}>
        {label}
      </T>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: colors.brand,
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingBottom: 64,
    gap: 4,
    overflow: 'hidden',
  },
  circle: { position: 'absolute', borderRadius: 999, backgroundColor: colors.white, opacity: 0.08 },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.35)',
    marginBottom: spacing.sm,
  },
  avatarText: { fontFamily: fonts.extrabold, fontSize: 30, color: colors.white },
  body: { paddingHorizontal: spacing.xl, marginTop: -40, gap: spacing.lg },
  stats: { backgroundColor: colors.surface, borderRadius: radius.lg, paddingVertical: spacing.lg },
  statDivider: { width: 1, alignSelf: 'stretch', backgroundColor: colors.line },
  statValue: { fontFamily: fonts.extrabold, fontSize: 22, color: colors.ink },
});
