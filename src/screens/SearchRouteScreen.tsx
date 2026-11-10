import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Banner, Button, IconBubble, Row, SectionHeader, T } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { AppStackParamList } from '../navigation/types';
import { alertMessage, getRouteAlerts, RouteAlert } from '../services/alerts';
import { profileIcon } from '../services/profiles';
import { DESTINATION_SUGGESTIONS, ORIGIN_SUGGESTIONS } from '../services/stations';
import { getSavedRoutes } from '../storage/routes';
import { colors, fonts, radius, shadow, shadowStrong, spacing } from '../theme';

const PROFILE_SHORT: Record<string, string> = {
  gestante: 'Gestante',
  cadeirante: 'Cadeira de rodas',
  carrinho: 'Carrinho de bebê',
  idoso: 'Idoso(a)',
  temporaria: 'Mobilidade temporária',
};

export default function SearchRouteScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [error, setError] = useState('');
  const [alerts, setAlerts] = useState<RouteAlert[]>([]);
  const [savedCount, setSavedCount] = useState(0);
  const [focused, setFocused] = useState<'origin' | 'destination'>('origin');

  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      getRouteAlerts(user.id).then(setAlerts);
      getSavedRoutes(user.id).then((r) => setSavedCount(r.length));
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

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{ paddingBottom: spacing.xxxl }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.hero, { paddingTop: insets.top + spacing.xxl }]}>
        <View style={[styles.circle, { width: 220, height: 220, top: -80, right: -60 }]} />
        <View style={[styles.circle, { width: 90, height: 90, bottom: 30, right: 80, opacity: 0.06 }]} />
        <Row style={{ justifyContent: 'space-between' }}>
          <View style={{ gap: 2, flex: 1 }}>
            <T variant="caption" color="rgba(255,255,255,0.75)" style={{ fontFamily: fonts.semibold }}>
              {greeting}, {user?.name.split(' ')[0]}
            </T>
            <T variant="h1" color={colors.white} style={{ fontSize: 27, lineHeight: 33 }}>
              Para onde vamos?
            </T>
          </View>
          <Pressable
            onPress={() => navigation.navigate('ProfileSetup', { firstTime: false })}
            style={styles.profileBtn}
            accessibilityLabel="Editar perfil de mobilidade"
          >
            <Ionicons name={profileIcon(user?.profile?.type)} size={22} color={colors.white} />
          </Pressable>
        </Row>
        <Row gap={6} style={styles.profileChip}>
          <View style={styles.liveDot} />
          <Text style={styles.profileChipText}>
            Rotas avaliadas para: {PROFILE_SHORT[user?.profile?.type ?? ''] ?? '—'}
          </Text>
        </Row>
      </View>

      <View style={styles.body}>
        <View style={[styles.searchCard, shadowStrong]}>
          <Row gap={spacing.md}>
            <View style={styles.rail}>
              <View style={styles.originDot} />
              <View style={styles.railLine} />
              <Ionicons name="location" size={18} color={colors.accent} />
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
              <Ionicons name="swap-vertical" size={18} color={colors.brandDark} />
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

        <Row gap={spacing.md}>
          <Pressable
            style={[styles.shortcut, shadow]}
            onPress={() => navigation.navigate('Tabs', { screen: 'MinhasRotas' })}
          >
            <IconBubble icon="bookmark" tone="brand" size={38} />
            <T variant="title">{savedCount}</T>
            <T variant="caption">rota{savedCount === 1 ? '' : 's'} salva{savedCount === 1 ? '' : 's'}</T>
          </Pressable>
          <Pressable style={[styles.shortcut, shadow]} onPress={() => navigation.navigate('NewReport')}>
            <IconBubble icon="camera" tone="accent" size={38} />
            <T variant="title">Relatar</T>
            <T variant="caption">um problema</T>
          </Pressable>
        </Row>

        <SectionHeader title={focused === 'origin' ? 'Sugestões de origem' : 'Sugestões de destino'} />
        <View style={[styles.suggestions, shadow]}>
          {suggestions.map((s, i) => (
            <Pressable
              key={s}
              onPress={() => pickSuggestion(s)}
              style={({ pressed }) => [
                styles.suggestion,
                i < suggestions.length - 1 && styles.suggestionBorder,
                pressed && { backgroundColor: colors.bg },
              ]}
            >
              <IconBubble
                icon={focused === 'origin' ? 'subway-outline' : 'business-outline'}
                tone="neutral"
                size={34}
              />
              <T variant="bodyStrong" style={{ flex: 1 }} numberOfLines={1}>
                {s}
              </T>
              <Ionicons name="arrow-up-outline" size={16} color={colors.inkFaint} style={{ transform: [{ rotate: '45deg' }] }} />
            </Pressable>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: colors.brand,
    paddingHorizontal: spacing.xl,
    paddingBottom: 72,
    gap: spacing.md,
    overflow: 'hidden',
  },
  circle: { position: 'absolute', borderRadius: 999, backgroundColor: colors.white, opacity: 0.09 },
  profileBtn: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileChip: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0,0,0,0.14)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#7CF0C8' },
  profileChipText: { fontFamily: fonts.semibold, fontSize: 12.5, color: colors.white },
  body: { paddingHorizontal: spacing.xl, marginTop: -52, gap: spacing.lg },
  searchCard: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.xl, gap: spacing.lg },
  rail: { alignItems: 'center', width: 18, alignSelf: 'stretch', paddingTop: 22, paddingBottom: 12 },
  originDot: { width: 12, height: 12, borderRadius: 6, borderWidth: 3, borderColor: colors.brand },
  railLine: { width: 2, flex: 1, backgroundColor: colors.line, marginVertical: 4, borderRadius: 1 },
  input: { fontFamily: fonts.semibold, fontSize: 16, color: colors.ink, paddingVertical: 8 },
  inputDivider: { height: 1, backgroundColor: colors.line, marginVertical: 8 },
  swap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shortcut: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, gap: 4 },
  suggestions: { backgroundColor: colors.surface, borderRadius: radius.lg, overflow: 'hidden' },
  suggestion: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.lg, paddingVertical: 12 },
  suggestionBorder: { borderBottomWidth: 1, borderBottomColor: colors.bg },
});
