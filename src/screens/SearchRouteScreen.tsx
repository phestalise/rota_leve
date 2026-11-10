import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { AppStackParamList } from '../navigation/types';
import { alertMessage, getRouteAlerts, RouteAlert } from '../services/alerts';
import { profileIcon, profileLabel } from '../services/profiles';
import { DESTINATION_SUGGESTIONS, ORIGIN_SUGGESTIONS } from '../services/stations';
import { colors, radius, spacing } from '../theme';

export default function SearchRouteScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [errors, setErrors] = useState<{ origin?: string; destination?: string }>({});
  const [alerts, setAlerts] = useState<RouteAlert[]>([]);
  const [focused, setFocused] = useState<'origin' | 'destination'>('origin');

  useFocusEffect(
    useCallback(() => {
      if (user) getRouteAlerts(user.id).then(setAlerts);
    }, [user]),
  );

  function handleSearch() {
    const e: typeof errors = {};
    if (origin.trim().length < 3) e.origin = 'Informe de onde você vai sair.';
    if (destination.trim().length < 3) e.destination = 'Informe para onde você vai.';
    if (!e.origin && !e.destination && origin.trim().toLowerCase() === destination.trim().toLowerCase()) {
      e.destination = 'Origem e destino precisam ser diferentes.';
    }
    setErrors(e);
    if (Object.keys(e).length) return;
    navigation.navigate('RouteResults', { origin: origin.trim(), destination: destination.trim() });
  }

  function swap() {
    setOrigin(destination);
    setDestination(origin);
  }

  function pickSuggestion(value: string) {
    if (focused === 'origin') {
      setOrigin(value);
      setFocused('destination');
    } else {
      setDestination(value);
    }
    setErrors({});
  }

  const suggestions = focused === 'origin' ? ORIGIN_SUGGESTIONS : DESTINATION_SUGGESTIONS;
  const firstName = user?.name.split(' ')[0];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: spacing.xxl }}
      keyboardShouldPersistTaps="handled"
    >
      <View style={[styles.hero, { paddingTop: insets.top + spacing.xl }]}>
        <Text style={styles.hello}>Olá, {firstName}</Text>
        <Text style={styles.heroTitle}>Para onde vamos hoje?</Text>
        <Pressable
          style={styles.profileChip}
          onPress={() => navigation.navigate('ProfileSetup', { firstTime: false })}
          accessibilityRole="button"
          accessibilityLabel="Editar perfil de mobilidade"
        >
          <Ionicons name={profileIcon(user?.profile?.type)} size={16} color="#fff" />
          <Text style={styles.profileChipText}>{profileLabel(user?.profile?.type)}</Text>
          <Ionicons name="create-outline" size={14} color="#fff" />
        </Pressable>
      </View>

      <View style={styles.body}>
        <View style={styles.searchCard}>
          <View style={styles.tripRow}>
            <View style={styles.rail}>
              <View style={[styles.dot, { borderColor: colors.primary }]} />
              <View style={styles.railLine} />
              <Ionicons name="location" size={18} color={colors.danger} />
            </View>
            <View style={{ flex: 1, gap: spacing.sm }}>
              <TextInput
                value={origin}
                onChangeText={(t) => {
                  setOrigin(t);
                  setErrors({});
                }}
                onFocus={() => setFocused('origin')}
                placeholder="De onde você sai?"
                placeholderTextColor={colors.textMuted}
                style={[styles.input, focused === 'origin' && styles.inputFocused, errors.origin && styles.inputError]}
                accessibilityLabel="Origem"
              />
              <TextInput
                value={destination}
                onChangeText={(t) => {
                  setDestination(t);
                  setErrors({});
                }}
                onFocus={() => setFocused('destination')}
                onSubmitEditing={handleSearch}
                placeholder="Para onde você vai?"
                placeholderTextColor={colors.textMuted}
                style={[
                  styles.input,
                  focused === 'destination' && styles.inputFocused,
                  errors.destination && styles.inputError,
                ]}
                accessibilityLabel="Destino"
              />
            </View>
            <Pressable onPress={swap} style={styles.swap} accessibilityLabel="Inverter origem e destino">
              <Ionicons name="swap-vertical" size={20} color={colors.primary} />
            </Pressable>
          </View>
          {errors.origin || errors.destination ? (
            <Text style={styles.error}>{errors.origin ?? errors.destination}</Text>
          ) : null}
          <Button title="Buscar rotas acessíveis" icon="search" onPress={handleSearch} />
        </View>

        <Text style={styles.section}>
          {focused === 'origin' ? 'Sair de' : 'Ir para'}
        </Text>
        <View style={styles.suggestions}>
          {suggestions.map((s) => (
            <Pressable key={s} style={styles.suggestion} onPress={() => pickSuggestion(s)}>
              <View style={styles.suggestionIcon}>
                <Ionicons
                  name={focused === 'origin' ? 'subway-outline' : 'medkit-outline'}
                  size={16}
                  color={colors.primary}
                />
              </View>
              <Text style={styles.suggestionText} numberOfLines={1}>
                {s}
              </Text>
              <Ionicons name="arrow-forward" size={16} color={colors.textMuted} />
            </Pressable>
          ))}
        </View>

        {alerts.length > 0 && (
          <>
            <Text style={styles.section}>Avisos</Text>
            <Pressable
              style={styles.alert}
              onPress={() => navigation.navigate('Tabs', { screen: 'MinhasRotas' })}
              accessibilityRole="button"
            >
              <View style={styles.alertIcon}>
                <Ionicons name="notifications" size={20} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.alertTitle}>{alerts[0].saved.name}</Text>
                <Text style={styles.alertText}>
                  {alertMessage(alerts[0].reports[0].place, alerts[0].reports[0].report)}
                </Text>
                <Text style={styles.alertLink}>Ver alternativas →</Text>
              </View>
            </Pressable>
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  hero: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingBottom: 64,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    gap: 4,
  },
  hello: { color: 'rgba(255,255,255,0.85)', fontSize: 15, fontWeight: '600' },
  heroTitle: { color: '#fff', fontSize: 26, fontWeight: '800' },
  profileChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    marginTop: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  profileChipText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  body: { paddingHorizontal: spacing.lg, marginTop: -44, gap: spacing.md },
  searchCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
    shadowColor: '#0B3D33',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  tripRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  rail: { alignItems: 'center', width: 20, paddingVertical: 14 },
  dot: { width: 14, height: 14, borderRadius: 7, borderWidth: 3, backgroundColor: '#fff' },
  railLine: { width: 2, flex: 1, minHeight: 22, backgroundColor: colors.border, marginVertical: 3 },
  input: {
    backgroundColor: colors.background,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: 'transparent',
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.text,
  },
  inputFocused: { borderColor: colors.primary, backgroundColor: '#fff' },
  inputError: { borderColor: colors.danger },
  swap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  error: { color: colors.danger, fontWeight: '600', fontSize: 13 },
  section: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: spacing.sm,
  },
  suggestions: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  suggestion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.background,
  },
  suggestionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestionText: { flex: 1, color: colors.text, fontSize: 15 },
  alert: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    borderLeftWidth: 4,
    borderLeftColor: colors.danger,
    padding: spacing.lg,
    borderRadius: radius.md,
  },
  alertIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertTitle: { fontWeight: '800', color: colors.text },
  alertText: { color: colors.textMuted, fontSize: 13, marginTop: 2 },
  alertLink: { color: colors.danger, fontWeight: '700', fontSize: 13, marginTop: 6 },
});
