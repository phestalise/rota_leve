import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import Steps from '../components/Steps';
import { Button, Card, Divider, IconBubble, IconName, Row, Screen, SectionHeader, T } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { AppStackParamList } from '../navigation/types';
import { MOBILITY_OPTIONS, WALK_LIMITS } from '../services/profiles';
import { colors, elev, fonts, radius, spacing, themed } from '../theme';
import { MobilityProfile, MobilityType } from '../types';
import { notify } from '../utils/dialog';

type Props = NativeStackScreenProps<AppStackParamList, 'ProfileSetup'>;

const SHORT_LABELS: Record<MobilityType, string> = {
  gestante: 'Gestante',
  cadeirante: 'Cadeira de rodas',
  carrinho: 'Carrinho de bebê',
  idoso: 'Pessoa idosa',
  temporaria: 'Mobilidade temporária',
};

export default function MobilityProfileScreen({ navigation, route }: Props) {
  const { user, saveProfile } = useAuth();
  const firstTime = route.params?.firstTime ?? !user?.profile;
  const [type, setType] = useState<MobilityType | undefined>(user?.profile?.type);
  const [prefs, setPrefs] = useState<Omit<MobilityProfile, 'type'>>(user?.profile ?? MOBILITY_OPTIONS[0].defaults);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  function selectType(t: MobilityType) {
    setType(t);
    setError('');
    setPrefs(MOBILITY_OPTIONS.find((o) => o.type === t)!.defaults);
  }

  async function handleSave() {
    if (!type) {
      setError('Escolha a situação que mais combina com você para continuar.');
      return;
    }
    setSaving(true);
    try {
      await saveProfile({ type, ...prefs });
      if (!firstTime) {
        notify('Perfil atualizado', 'As próximas rotas serão avaliadas com as novas preferências.');
        navigation.goBack();
      }
    } finally {
      setSaving(false);
    }
  }

  const selected = MOBILITY_OPTIONS.find((o) => o.type === type);

  return (
    <Screen
      footer={
        <Button
          title={firstTime ? 'Salvar e começar' : 'Salvar perfil'}
          icon={firstTime ? undefined : 'checkmark'}
          iconRight={firstTime ? 'arrow-forward' : undefined}
          onPress={handleSave}
          loading={saving}
        />
      }
    >
      {firstTime && <Steps current={2} total={2} />}
      <View style={{ gap: 6 }}>
        <T variant="h1">{firstTime ? `Como você se desloca, ${user?.name.split(' ')[0]}?` : 'Seu perfil de mobilidade'}</T>
        <T variant="body">Isso define o que pesa na nota de cada rota. Você pode mudar quando quiser.</T>
      </View>

      <View style={styles.grid}>
        {MOBILITY_OPTIONS.map((o) => {
          const active = o.type === type;
          return (
            <Pressable
              key={o.type}
              onPress={() => selectType(o.type)}
              accessibilityRole="radio"
              accessibilityState={{ selected: active }}
              accessibilityLabel={o.label}
              style={({ pressed }) => [styles.option, active && styles.optionActive, pressed && { opacity: 0.9 }]}
            >
              <IconBubble icon={o.icon} size={44} tone={active ? 'brand' : 'neutral'} solid={active} />
              <Text style={[styles.optionLabel, active && { color: colors.brandDark }]}>{SHORT_LABELS[o.type]}</Text>
              {active && (
                <View style={styles.check}>
                  <Ionicons name="checkmark" size={13} color={colors.white} />
                </View>
              )}
            </Pressable>
          );
        })}
      </View>
      {error ? (
        <Row gap={6}>
          <Ionicons name="alert-circle" size={16} color={colors.bad} />
          <T variant="caption" color={colors.bad} style={{ flex: 1 }}>
            {error}
          </T>
        </Row>
      ) : selected ? (
        <T variant="caption">{selected.description}</T>
      ) : null}

      {type && (
        <>
          <SectionHeader title="O que pesa na rota" />
          <Card style={{ padding: 0, gap: 0 }}>
            <Toggle icon="footsteps-outline" label="Evitar escadas" value={prefs.avoidStairs} onChange={(v) => setPrefs({ ...prefs, avoidStairs: v })} />
            <Divider inset={16} />
            <Toggle icon="arrow-up-circle-outline" label="Priorizar elevador" value={prefs.preferElevator} onChange={(v) => setPrefs({ ...prefs, preferElevator: v })} />
            <Divider inset={16} />
            <Toggle icon="cafe-outline" label="Preciso de assento" value={prefs.needSeat} onChange={(v) => setPrefs({ ...prefs, needSeat: v })} />
            <Divider inset={16} />
            <Toggle icon="trending-up-outline" label="Evitar ladeiras" value={prefs.avoidSteepSlopes} onChange={(v) => setPrefs({ ...prefs, avoidSteepSlopes: v })} />
          </Card>

          <SectionHeader title="Quanto você consegue andar" />
          <Card>
            <Row style={{ justifyContent: 'space-between' }}>
              <T variant="bodyStrong">Caminhada máxima</T>
              <T variant="h2" color={colors.brand}>
                {prefs.maxWalkMeters >= 1000 ? `${prefs.maxWalkMeters / 1000} km` : `${prefs.maxWalkMeters} m`}
              </T>
            </Row>
            <View style={styles.walkTrack}>
              {WALK_LIMITS.map((m) => {
                const active = prefs.maxWalkMeters === m;
                const filled = m <= prefs.maxWalkMeters;
                return (
                  <Pressable
                    key={m}
                    onPress={() => setPrefs({ ...prefs, maxWalkMeters: m })}
                    style={styles.walkStop}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: active }}
                    accessibilityLabel={`${m} metros`}
                    hitSlop={6}
                  >
                    <View style={[styles.walkBar, filled && { backgroundColor: colors.brand }, active && styles.walkBarActive]} />
                    <Text style={[styles.walkLabel, active && { color: colors.brandDark, fontFamily: fonts.bold }]}>
                      {m >= 1000 ? '1k' : m}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <T variant="caption">Somando todos os trechos a pé da viagem, em metros.</T>
          </Card>
        </>
      )}
    </Screen>
  );
}

function Toggle({
  icon,
  label,
  value,
  onChange,
}: {
  icon: IconName;
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <Pressable onPress={() => onChange(!value)} style={styles.toggle} accessibilityRole="switch" accessibilityState={{ checked: value }}>
      <T variant="bodyStrong" style={{ flex: 1 }}>
        {label}
      </T>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ true: colors.brand, false: colors.line }}
        thumbColor={colors.white}
        {...({ activeThumbColor: colors.white } as object)}
      />
    </Pressable>
  );
}

const styles = themed(() => StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  option: {
    width: '47%',
    flexGrow: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
    ...(elev.shadow as object),
  },
  optionActive: { borderColor: colors.brand, backgroundColor: '#F4FAF8' },
  optionLabel: { fontFamily: fonts.bold, fontSize: 14.5, color: colors.ink },
  check: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggle: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.lg, paddingVertical: 14 },
  walkTrack: { flexDirection: 'row', gap: 6, marginTop: spacing.xs },
  walkStop: { flex: 1, alignItems: 'center', gap: 6 },
  walkBar: { height: 10, alignSelf: 'stretch', borderRadius: 5, backgroundColor: colors.surfaceAlt },
  walkBarActive: { height: 14, marginTop: -2, backgroundColor: colors.brandDark },
  walkLabel: { fontFamily: fonts.medium, fontSize: 11.5, color: colors.inkFaint },
}));
