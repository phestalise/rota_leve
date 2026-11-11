import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Logo from '../components/Logo';
import { Banner, Button, IconBubble, Row, ScoreRing, T, ThemeToggle } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { AppStackParamList } from '../navigation/types';
import { scoreRoute } from '../services/accessibility';
import { alertMessage, getRouteAlerts, RouteAlert } from '../services/alerts';
import { profileIcon } from '../services/profiles';
import { DESTINATION_SUGGESTIONS, ORIGIN_SUGGESTIONS } from '../services/stations';
import { CATEGORY_ICONS, CATEGORY_LABELS, getActiveReports } from '../storage/reports';
import { getSavedRoutes } from '../storage/routes';
import { colors, fonts, radius, spacing, themed, toneColors, useIsWide } from '../theme';
import { Report, SavedRoute, ScoredRoute } from '../types';
import { timeUntil } from '../utils/id';
import { CATEGORY_TONES } from './ReportsListScreen';

const PROFILE_SHORT: Record<string, string> = {
  gestante: 'Gestante',
  cadeirante: 'Cadeira de rodas',
  carrinho: 'Carrinho de bebê',
  idoso: 'Idoso(a)',
  temporaria: 'Mobilidade temporária',
};

type Nav = NativeStackNavigationProp<AppStackParamList>;

export default function SearchRouteScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const wide = useIsWide();
  const { user } = useAuth();
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [error, setError] = useState('');
  const [focused, setFocused] = useState<'origin' | 'destination'>('origin');
  const [alerts, setAlerts] = useState<RouteAlert[]>([]);
  const [trips, setTrips] = useState<{ saved: SavedRoute; current: ScoredRoute }[]>([]);
  const [reports, setReports] = useState<Report[]>([]);

  useFocusEffect(
    useCallback(() => {
      if (!user?.profile) return;
      const profile = user.profile;
      Promise.all([getRouteAlerts(user.id), getSavedRoutes(user.id), getActiveReports()]).then(
        ([a, saved, active]) => {
          setAlerts(a);
          setTrips(saved.map((s) => ({ saved: s, current: scoreRoute(s.route, profile, active) })));
          setReports(active);
        },
      );
    }, [user]),
  );

  function handleSearch() {
    if (origin.trim().length < 3) return setError('Informe de onde você vai sair.');
    if (destination.trim().length < 3) return setError('Informe para onde você vai.');
    if (origin.trim().toLowerCase() === destination.trim().toLowerCase())
      return setError('Origem e destino precisam ser diferentes.');
    setError('');
    navigation.navigate('RouteResults', { origin: origin.trim(), destination: destination.trim() });
  }

  function pickSuggestion(value: string) {
    if (focused === 'origin') {
      setOrigin(value);
      setFocused('destination');
    } else {
      setDestination(value);
    }
    setError('');
  }

  const suggestions = focused === 'origin' ? ORIGIN_SUGGESTIONS : DESTINATION_SUGGESTIONS;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';
  const webInput = Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : null;

  /* ---------------- Coluna principal: busca ---------------- */
  const searchColumn = (
    <View style={{ gap: spacing.lg }}>
      <View style={{ gap: spacing.sm }}>
        <T variant="caption">
          {greeting}, {user?.name.split(' ')[0]}
        </T>
        <T variant="display" style={wide ? { fontSize: 34, lineHeight: 40 } : null}>
          Para onde vamos?
        </T>
        <Pressable
          onPress={() => navigation.navigate('ProfileSetup', { firstTime: false })}
          style={styles.profileChip}
          accessibilityLabel="Editar perfil de mobilidade"
        >
          <Ionicons name={profileIcon(user?.profile?.type)} size={14} color={colors.brandDark} />
          <Text style={styles.profileChipText}>
            Avaliando para: {PROFILE_SHORT[user?.profile?.type ?? ''] ?? '—'}
          </Text>
          <Ionicons name="chevron-forward" size={13} color={colors.brandDark} />
        </Pressable>
      </View>

      <View style={styles.searchCard}>
        <Row gap={spacing.md}>
          <View style={styles.rail}>
            <View style={styles.originDot} />
            <View style={styles.railLine} />
            <Ionicons name="location" size={18} color={colors.brand} />
          </View>
          <View style={{ flex: 1 }}>
            <T variant="overline" style={{ fontSize: 10.5 }}>
              Saindo de
            </T>
            <TextInput
              value={origin}
              onChangeText={(t) => {
                setOrigin(t);
                setError('');
              }}
              onFocus={() => setFocused('origin')}
              placeholder="Estação, bairro ou endereço"
              placeholderTextColor={colors.inkFaint}
              style={[styles.input, webInput]}
              accessibilityLabel="Origem"
            />
            <View style={styles.inputDivider} />
            <T variant="overline" style={{ fontSize: 10.5 }}>
              Indo para
            </T>
            <TextInput
              value={destination}
              onChangeText={(t) => {
                setDestination(t);
                setError('');
              }}
              onFocus={() => setFocused('destination')}
              onSubmitEditing={handleSearch}
              placeholder="Hospital, UBS, trabalho…"
              placeholderTextColor={colors.inkFaint}
              style={[styles.input, webInput]}
              accessibilityLabel="Destino"
            />
          </View>
          <Pressable
            onPress={() => {
              setOrigin(destination);
              setDestination(origin);
            }}
            style={styles.swap}
            accessibilityLabel="Inverter origem e destino"
          >
            <Ionicons name="swap-vertical" size={18} color={colors.ink} />
          </Pressable>
        </Row>

        {error ? (
          <Row gap={6}>
            <Ionicons name="alert-circle" size={15} color={colors.bad} />
            <T variant="caption" color={colors.bad}>
              {error}
            </T>
          </Row>
        ) : null}

        <Button title="Buscar rotas acessíveis" icon="search" onPress={handleSearch} />

        <View style={{ gap: spacing.sm }}>
          <T variant="caption" style={{ fontSize: 12 }}>
            {focused === 'origin' ? 'Sugestões de origem' : 'Sugestões de destino'}
          </T>
          <View style={styles.chips}>
            {suggestions.map((s) => (
              <Pressable
                key={s}
                onPress={() => pickSuggestion(s)}
                style={({ pressed }) => [styles.chip, pressed && { backgroundColor: colors.brandSoft }]}
              >
                <Ionicons
                  name={focused === 'origin' ? 'subway-outline' : 'business-outline'}
                  size={13}
                  color={colors.inkSoft}
                />
                <Text style={styles.chipText} numberOfLines={1}>
                  {s}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>

      {alerts.length > 0 && (
        <Banner
          tone="bad"
          icon="notifications"
          title={alertMessage(alerts[0].reports[0].place, alerts[0].reports[0].report)}
          text={`Afeta sua rota salva "${alerts[0].saved.name}".`}
          actionLabel="Ver alternativas"
          onPress={() =>
            navigation.navigate('RouteResults', {
              origin: alerts[0].saved.route.origin,
              destination: alerts[0].saved.route.destination,
            })
          }
        />
      )}
    </View>
  );

  /* ---------------- Coluna lateral: trajetos + comunidade ---------------- */
  const sideColumn = (
    <View style={{ gap: spacing.xl }}>
      <View style={{ gap: spacing.md }}>
        <SectionTitle
          title="Seus trajetos"
          action={trips.length ? 'Ver todos' : undefined}
          onAction={() => navigation.navigate('Tabs', { screen: 'MinhasRotas' })}
        />
        {trips.length === 0 ? (
          <View style={[styles.panel, styles.emptyPanel]}>
            <Ionicons name="bookmark-outline" size={20} color={colors.inkFaint} />
            <T variant="caption" style={{ flex: 1 }}>
              Salve um trajeto que você faz sempre e a gente avisa quando algo quebrar no caminho.
            </T>
          </View>
        ) : (
          <View style={styles.panel}>
            {trips.slice(0, 3).map(({ saved, current }, i) => {
              const hasAlert = alerts.some((a) => a.saved.id === saved.id);
              return (
                <Pressable
                  key={saved.id}
                  onPress={() => navigation.navigate('RouteDetail', { route: current, savedId: saved.id })}
                  style={({ pressed }) => [
                    styles.tripRow,
                    i > 0 && styles.rowBorder,
                    pressed && { backgroundColor: colors.surfaceAlt },
                  ]}
                >
                  <ScoreRing score={current.score} blocked={current.blocked} size={44} />
                  <View style={{ flex: 1, gap: 2 }}>
                    <T variant="bodyStrong" numberOfLines={1}>
                      {saved.name}
                    </T>
                    <T variant="caption" numberOfLines={1}>
                      {current.origin} → {current.destination}
                    </T>
                  </View>
                  {hasAlert ? (
                    <Ionicons name="warning" size={18} color={colors.bad} />
                  ) : (
                    <Ionicons name="chevron-forward" size={18} color={colors.inkFaint} />
                  )}
                </Pressable>
              );
            })}
          </View>
        )}
      </View>

      <View style={{ gap: spacing.md }}>
        <SectionTitle
          title="Na comunidade"
          action="Ver todos"
          onAction={() => navigation.navigate('Tabs', { screen: 'Relatos' })}
        />
        <View style={styles.panel}>
          {reports.slice(0, 3).map((r, i) => {
            const tone = toneColors(CATEGORY_TONES[r.category]);
            return (
              <Pressable
                key={r.id}
                onPress={() => navigation.navigate('ReportDetail', { reportId: r.id })}
                style={({ pressed }) => [
                  styles.tripRow,
                  i > 0 && styles.rowBorder,
                  pressed && { backgroundColor: colors.surfaceAlt },
                ]}
              >
                <View style={[styles.reportIcon, { backgroundColor: tone.bg }]}>
                  <Ionicons
                    name={CATEGORY_ICONS[r.category] as keyof typeof Ionicons.glyphMap}
                    size={18}
                    color={tone.fg}
                  />
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <T variant="bodyStrong" numberOfLines={1}>
                    {r.location}
                  </T>
                  <T variant="caption" numberOfLines={1}>
                    {CATEGORY_LABELS[r.category]} · {timeUntil(r.expiresAt)}
                  </T>
                </View>
                <Row gap={3}>
                  <Ionicons name="people-outline" size={14} color={colors.inkFaint} />
                  <Text style={styles.count}>{r.confirmations.length}</Text>
                </Row>
              </Pressable>
            );
          })}
          <Pressable
            onPress={() => navigation.navigate('NewReport')}
            style={({ pressed }) => [
              styles.tripRow,
              reports.length > 0 && styles.rowBorder,
              pressed && { backgroundColor: colors.surfaceAlt },
            ]}
          >
            <IconBubble icon="camera-outline" size={40} />
            <View style={{ flex: 1 }}>
              <T variant="bodyStrong" color={colors.brand}>
                Relatar um problema
              </T>
              <T variant="caption">Elevador parado, calçada ruim, rampa bloqueada…</T>
            </View>
            <Ionicons name="add" size={20} color={colors.brand} />
          </Pressable>
        </View>
      </View>
    </View>
  );

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={[
        styles.page,
        { paddingTop: insets.top + (wide ? spacing.xxxl : spacing.lg) },
      ]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {!wide && (
        <Row style={{ justifyContent: 'space-between', marginBottom: spacing.lg }}>
          <Logo size={34} />
          <ThemeToggle />
        </Row>
      )}
      {wide ? (
        <Row align="flex-start" gap={spacing.xxxl}>
          <View style={{ flex: 1.25 }}>{searchColumn}</View>
          <View style={{ flex: 1, paddingTop: spacing.sm }}>{sideColumn}</View>
        </Row>
      ) : (
        <View style={{ gap: spacing.xl }}>
          {searchColumn}
          {sideColumn}
        </View>
      )}
    </ScrollView>
  );
}

function SectionTitle({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <Row style={{ justifyContent: 'space-between' }}>
      <T variant="h2">{title}</T>
      {action && onAction ? (
        <Pressable onPress={onAction} hitSlop={8}>
          <Text style={styles.sectionAction}>{action}</Text>
        </Pressable>
      ) : null}
    </Row>
  );
}

const styles = themed(() =>
  StyleSheet.create({
    page: {
      width: '100%',
      maxWidth: 1080,
      alignSelf: 'center',
      paddingHorizontal: spacing.xl,
      paddingBottom: spacing.xxxl,
    },
    profileChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      alignSelf: 'flex-start',
      backgroundColor: colors.brandSoft,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: radius.pill,
    },
    profileChipText: { fontFamily: fonts.semibold, fontSize: 12.5, color: colors.brandDark },
    searchCard: {
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.line,
      padding: spacing.lg,
      gap: spacing.lg,
    },
    rail: { alignItems: 'center', width: 18, alignSelf: 'stretch', paddingTop: 22, paddingBottom: 12 },
    originDot: { width: 12, height: 12, borderRadius: 6, borderWidth: 3, borderColor: colors.ink },
    railLine: { width: 2, flex: 1, backgroundColor: colors.line, marginVertical: 4, borderRadius: 1 },
    input: { fontFamily: fonts.semibold, fontSize: 16, color: colors.ink, paddingVertical: 8 },
    inputDivider: { height: 1, backgroundColor: colors.line, marginVertical: 8 },
    swap: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: colors.surfaceAlt,
      alignItems: 'center',
      justifyContent: 'center',
    },
    chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      maxWidth: '100%',
      paddingHorizontal: 11,
      paddingVertical: 7,
      borderRadius: radius.pill,
      borderWidth: 1,
      borderColor: colors.line,
      backgroundColor: colors.surface,
    },
    chipText: { fontFamily: fonts.semibold, fontSize: 13, color: colors.ink, flexShrink: 1 },
    sectionAction: { fontFamily: fonts.bold, fontSize: 13, color: colors.brand },
    panel: {
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.line,
      overflow: 'hidden',
    },
    emptyPanel: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg },
    tripRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
    },
    rowBorder: { borderTopWidth: 1, borderTopColor: colors.line },
    reportIcon: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    count: { fontFamily: fonts.bold, fontSize: 12.5, color: colors.inkSoft },
  }),
);
