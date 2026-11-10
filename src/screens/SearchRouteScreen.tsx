import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Button, Card, Field, Screen, SectionTitle } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { AppStackParamList } from '../navigation/types';
import { alertMessage, getRouteAlerts, RouteAlert } from '../services/alerts';
import { profileIcon, profileLabel } from '../services/profiles';
import { DESTINATION_SUGGESTIONS, ORIGIN_SUGGESTIONS } from '../services/stations';
import { colors, radius, spacing } from '../theme';

export default function SearchRouteScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const { user } = useAuth();
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [errors, setErrors] = useState<{ origin?: string; destination?: string }>({});
  const [alerts, setAlerts] = useState<RouteAlert[]>([]);

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

  return (
    <Screen>
      <Pressable
        style={styles.profileBanner}
        onPress={() => navigation.navigate('ProfileSetup', { firstTime: false })}
        accessibilityRole="button"
        accessibilityLabel="Editar perfil de mobilidade"
      >
        <Ionicons name={profileIcon(user?.profile?.type)} size={22} color={colors.primaryDark} />
        <Text style={styles.profileText}>
          Rotas avaliadas para: <Text style={{ fontWeight: '800' }}>{profileLabel(user?.profile?.type)}</Text>
        </Text>
        <Ionicons name="chevron-forward" size={18} color={colors.primaryDark} />
      </Pressable>

      {alerts.length > 0 && (
        <Pressable
          style={styles.alert}
          onPress={() => navigation.navigate('Tabs', { screen: 'MinhasRotas' })}
          accessibilityRole="button"
        >
          <Ionicons name="notifications" size={22} color={colors.danger} />
          <View style={{ flex: 1 }}>
            <Text style={styles.alertTitle}>Aviso em rota salva: {alerts[0].saved.name}</Text>
            <Text style={styles.alertText}>
              {alertMessage(alerts[0].reports[0].place, alerts[0].reports[0].report)} Toque para ver
              alternativas.
            </Text>
          </View>
        </Pressable>
      )}

      <Card>
        <Field
          label="Origem"
          value={origin}
          onChangeText={setOrigin}
          placeholder="Ex.: Tatuapé"
          error={errors.origin}
        />
        <Pressable onPress={swap} style={styles.swap} accessibilityLabel="Inverter origem e destino">
          <Ionicons name="swap-vertical" size={20} color={colors.primary} />
          <Text style={styles.swapText}>Inverter</Text>
        </Pressable>
        <Field
          label="Destino"
          value={destination}
          onChangeText={setDestination}
          placeholder="Ex.: Hospital São Paulo"
          error={errors.destination}
          onSubmitEditing={handleSearch}
        />
        <Button title="Buscar rotas acessíveis" icon="search" onPress={handleSearch} />
      </Card>

      <SectionTitle>Sugestões de origem</SectionTitle>
      <View style={styles.chips}>
        {ORIGIN_SUGGESTIONS.map((s) => (
          <Pressable key={s} style={styles.chip} onPress={() => setOrigin(s)}>
            <Text style={styles.chipText}>{s}</Text>
          </Pressable>
        ))}
      </View>
      <SectionTitle>Sugestões de destino</SectionTitle>
      <View style={styles.chips}>
        {DESTINATION_SUGGESTIONS.map((s) => (
          <Pressable key={s} style={styles.chip} onPress={() => setDestination(s)}>
            <Text style={styles.chipText}>{s}</Text>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  profileBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primaryLight,
    padding: spacing.md,
    borderRadius: radius.md,
  },
  profileText: { flex: 1, color: colors.primaryDark },
  alert: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
    backgroundColor: colors.dangerLight,
    borderWidth: 1,
    borderColor: colors.danger,
    padding: spacing.md,
    borderRadius: radius.md,
  },
  alertTitle: { fontWeight: '800', color: colors.danger },
  alertText: { color: colors.text, fontSize: 13 },
  swap: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-end' },
  swapText: { color: colors.primary, fontWeight: '600' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  chipText: { color: colors.text },
});
