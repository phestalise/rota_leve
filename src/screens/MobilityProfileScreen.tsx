import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { Button, Card, Screen, SectionTitle } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { AppStackParamList } from '../navigation/types';
import { MOBILITY_OPTIONS, WALK_LIMITS } from '../services/profiles';
import { colors, radius, spacing } from '../theme';
import { MobilityProfile, MobilityType } from '../types';
import { notify } from '../utils/dialog';

type Props = NativeStackScreenProps<AppStackParamList, 'ProfileSetup'>;

export default function MobilityProfileScreen({ navigation, route }: Props) {
  const { user, saveProfile } = useAuth();
  const firstTime = route.params?.firstTime ?? !user?.profile;
  const [type, setType] = useState<MobilityType | undefined>(user?.profile?.type);
  const [prefs, setPrefs] = useState<Omit<MobilityProfile, 'type'>>(
    user?.profile ?? MOBILITY_OPTIONS[0].defaults,
  );
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  function selectType(t: MobilityType) {
    setType(t);
    setError('');
    const option = MOBILITY_OPTIONS.find((o) => o.type === t)!;
    setPrefs(option.defaults);
  }

  async function handleSave() {
    if (!type) {
      setError('Escolha pelo menos uma situação de mobilidade para continuar.');
      return;
    }
    setSaving(true);
    await saveProfile({ type, ...prefs });
    setSaving(false);
    if (!firstTime) {
      notify('Perfil atualizado', 'As próximas rotas serão avaliadas com as novas preferências.');
      navigation.goBack();
    }
  }

  return (
    <Screen>
      <Text style={styles.intro}>
        {firstTime
          ? `Olá, ${user?.name.split(' ')[0]}! Conte para a gente como você se desloca. Isso define o que pesa na nota de cada rota.`
          : 'Ajuste suas preferências. As notas das rotas são recalculadas com base nelas.'}
      </Text>

      <SectionTitle>Minha situação</SectionTitle>
      {MOBILITY_OPTIONS.map((option) => {
        const selected = option.type === type;
        return (
          <Pressable
            key={option.type}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            onPress={() => selectType(option.type)}
            style={[styles.option, selected && styles.optionSelected]}
          >
            <Ionicons
              name={option.icon}
              size={28}
              color={selected ? colors.primary : colors.textMuted}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.optionLabel}>{option.label}</Text>
              <Text style={styles.optionDesc}>{option.description}</Text>
            </View>
            <Ionicons
              name={selected ? 'radio-button-on' : 'radio-button-off'}
              size={22}
              color={selected ? colors.primary : colors.border}
            />
          </Pressable>
        );
      })}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {type && (
        <>
          <SectionTitle>O que pesa na rota</SectionTitle>
          <Card>
            <ToggleRow
              label="Evitar escadas"
              value={prefs.avoidStairs}
              onChange={(v) => setPrefs({ ...prefs, avoidStairs: v })}
            />
            <ToggleRow
              label="Priorizar elevador"
              value={prefs.preferElevator}
              onChange={(v) => setPrefs({ ...prefs, preferElevator: v })}
            />
            <ToggleRow
              label="Preciso de assento / banco"
              value={prefs.needSeat}
              onChange={(v) => setPrefs({ ...prefs, needSeat: v })}
            />
            <ToggleRow
              label="Evitar ladeiras"
              value={prefs.avoidSteepSlopes}
              onChange={(v) => setPrefs({ ...prefs, avoidSteepSlopes: v })}
            />
          </Card>

          <SectionTitle>Caminhada máxima no total</SectionTitle>
          <View style={styles.chips}>
            {WALK_LIMITS.map((m) => {
              const selected = prefs.maxWalkMeters === m;
              return (
                <Pressable
                  key={m}
                  onPress={() => setPrefs({ ...prefs, maxWalkMeters: m })}
                  style={[styles.chip, selected && styles.chipSelected]}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                >
                  <Text style={[styles.chipText, selected && { color: '#fff' }]}>
                    {m >= 1000 ? `${m / 1000} km` : `${m} m`}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </>
      )}

      <Button
        title={firstTime ? 'Salvar e começar' : 'Salvar perfil'}
        icon="checkmark-circle-outline"
        onPress={handleSave}
        loading={saving}
        style={{ marginTop: spacing.md }}
      />
    </Screen>
  );
}

function ToggleRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <View style={styles.toggleRow}>
      <Text style={styles.toggleLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ true: colors.primary, false: colors.border }}
        thumbColor="#fff"
        accessibilityLabel={label}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  intro: { fontSize: 15, color: colors.textMuted, lineHeight: 21 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  optionSelected: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  optionLabel: { fontSize: 16, fontWeight: '700', color: colors.text },
  optionDesc: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  error: { color: colors.danger, fontWeight: '600' },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  toggleLabel: { fontSize: 15, color: colors.text, flex: 1 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.primary,
    backgroundColor: colors.surface,
  },
  chipSelected: { backgroundColor: colors.primary },
  chipText: { fontWeight: '700', color: colors.primary },
});
