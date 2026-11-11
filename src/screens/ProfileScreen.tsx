import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card, Container, Divider, IconBubble, ListRow, Pill, Row, SectionHeader, Segmented, T } from '../components/ui';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { AppStackParamList } from '../navigation/types';
import { profileIcon, profileLabel } from '../services/profiles';
import { getReports } from '../storage/reports';
import { getSavedRoutes } from '../storage/routes';
import { colors, fonts, radius, spacing, themed } from '../theme';
import { confirmAction } from '../utils/dialog';

export default function ProfileScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const insets = useSafeAreaInsets();
  const { user, signOut } = useAuth();
  const { mode, setMode } = useTheme();
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
    if (await confirmAction('Sair da conta', 'Você vai precisar entrar de novo para ver suas rotas.', 'Sair')) await signOut();
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
      <Container style={{ paddingTop: insets.top + spacing.xxl, gap: spacing.lg }}>
        <Row gap={spacing.lg}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <T variant="h1">{user?.name}</T>
            <T variant="caption">{user?.email}</T>
          </View>
        </Row>

        <Row style={styles.stats}>
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
          <View>
            <T variant="title">{profileLabel(profile?.type)}</T>
            <T variant="caption">Até {profile?.maxWalkMeters ?? 0} m de caminhada por viagem</T>
          </View>
          {profile && (
            <Row gap={6} style={{ flexWrap: 'wrap' }}>
              {profile.avoidStairs && <Pill text="Sem escadas" tone="brand" icon="footsteps-outline" />}
              {profile.preferElevator && <Pill text="Elevador" tone="brand" icon="arrow-up-circle-outline" />}
              {profile.needSeat && <Pill text="Assento" tone="brand" icon="cafe-outline" />}
              {profile.avoidSteepSlopes && <Pill text="Sem ladeiras" tone="brand" icon="trending-up-outline" />}
            </Row>
          )}
        </Card>

        <SectionHeader title="Aparência" />
        <Segmented
          options={[
            { key: 'light', label: 'Vermelho + branco' },
            { key: 'dark', label: 'Vermelho + preto' },
          ]}
          value={mode}
          onChange={setMode}
        />

        <SectionHeader title="Aplicativo" />
        <Card style={{ padding: 0, gap: 0, overflow: 'hidden' }}>
          <ListRow
            icon="options-outline"
            title="Preferências de rota"
            subtitle="Escadas, elevador, assento e caminhada"
            onPress={() => navigation.navigate('ProfileSetup', { firstTime: false })}
          />
          <Divider inset={16} />
          <ListRow icon="information-circle-outline" title="Sobre o App" subtitle="Como o Rota Leve funciona" onPress={() => navigation.navigate('About')} />
          <Divider inset={16} />
          <ListRow icon="log-out-outline" title="Sair" danger onPress={handleLogout} />
        </Card>
      </Container>
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

const styles = themed(() => StyleSheet.create({
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontFamily: fonts.extrabold, fontSize: 24, color: colors.white },
  stats: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    paddingVertical: spacing.lg,
  },
  statDivider: { width: 1, alignSelf: 'stretch', backgroundColor: colors.line },
  statValue: { fontFamily: fonts.extrabold, fontSize: 22, color: colors.ink },
}));
