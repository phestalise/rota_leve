import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { Image, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Button, Field, IconBubble, Row, Screen, SectionHeader, T } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { AppStackParamList } from '../navigation/types';
import { CATEGORY_ICONS, CATEGORY_LABELS, createReport, REPORT_TTL_HOURS } from '../storage/reports';
import { colors, fonts, radius, shadow, spacing } from '../theme';
import { ReportCategory } from '../types';
import { notify } from '../utils/dialog';
import { CATEGORY_TONES } from './ReportsListScreen';

type Props = NativeStackScreenProps<AppStackParamList, 'NewReport'>;

const CATEGORIES = Object.keys(CATEGORY_LABELS) as ReportCategory[];

const SHORT: Record<ReportCategory, string> = {
  elevador: 'Elevador quebrado',
  escada_rolante: 'Escada parada',
  calcada: 'Calçada ruim',
  rampa: 'Rampa bloqueada',
  cobertura: 'Sem cobertura',
  outro: 'Outro',
};

export default function NewReportScreen({ navigation, route }: Props) {
  const { user } = useAuth();
  const [category, setCategory] = useState<ReportCategory | undefined>();
  const [location, setLocation] = useState(route.params?.location ?? '');
  const [description, setDescription] = useState('');
  const [photoUri, setPhotoUri] = useState<string | undefined>();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  async function pick(fromCamera: boolean) {
    const options: ImagePicker.ImagePickerOptions = {
      mediaTypes: ['images'],
      quality: 0.3,
      base64: true,
      allowsEditing: true,
      aspect: [4, 3],
    };
    if (fromCamera) {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        notify('Permissão negada', 'Autorize o uso da câmera para fotografar o problema.');
        return;
      }
    }
    const result = fromCamera ? await ImagePicker.launchCameraAsync(options) : await ImagePicker.launchImageLibraryAsync(options);
    if (result.canceled || !result.assets?.length) return;
    const asset = result.assets[0];
    // Guardamos como data URI para a foto sobreviver no AsyncStorage (inclusive no navegador).
    const uri =
      asset.base64 && !asset.uri.startsWith('data:') ? `data:${asset.mimeType ?? 'image/jpeg'};base64,${asset.base64}` : asset.uri;
    setPhotoUri(uri);
    setErrors((e) => ({ ...e, photo: '' }));
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!category) e.category = 'Escolha o tipo de problema.';
    if (location.trim().length < 3) e.location = 'Informe a estação, rua ou ponto.';
    if (description.trim().length < 10) e.description = 'Descreva o problema (mínimo 10 caracteres).';
    if (!photoUri) e.photo = 'Adicione uma foto: ela ajuda outras pessoas a confirmarem.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setSaving(true);
    try {
      const report = await createReport(user!, { category: category!, location, description, photoUri });
      notify('Relato enviado', `Obrigado! Ele fica ativo por ${REPORT_TTL_HOURS}h e é renovado a cada confirmação.`);
      navigation.replace('ReportDetail', { reportId: report.id });
    } catch {
      notify('Erro', 'Não foi possível salvar o relato. Tente de novo.');
      setSaving(false);
    }
  }

  return (
    <Screen footer={<Button title="Enviar relato" icon="paper-plane" onPress={handleSubmit} loading={saving} />}>
      <View style={{ gap: 6 }}>
        <T variant="h1">O que você encontrou?</T>
        <T variant="body">Seu relato ajuda quem vem depois e muda a nota das rotas na hora.</T>
      </View>

      <View style={styles.grid}>
        {CATEGORIES.map((c) => {
          const active = c === category;
          return (
            <Pressable
              key={c}
              onPress={() => {
                setCategory(c);
                setErrors((e) => ({ ...e, category: '' }));
              }}
              style={({ pressed }) => [styles.cat, shadow, active && styles.catActive, pressed && { opacity: 0.9 }]}
              accessibilityRole="radio"
              accessibilityState={{ selected: active }}
              accessibilityLabel={CATEGORY_LABELS[c]}
            >
              <IconBubble
                icon={CATEGORY_ICONS[c] as keyof typeof Ionicons.glyphMap}
                tone={active ? 'brand' : CATEGORY_TONES[c]}
                solid={active}
                size={38}
              />
              <Text style={[styles.catText, active && { color: colors.brandDark }]} numberOfLines={2}>
                {SHORT[c]}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {errors.category ? (
        <T variant="caption" color={colors.bad}>
          {errors.category}
        </T>
      ) : null}

      <SectionHeader title="Onde e como" />
      <Field label="Local" icon="location-outline" value={location} onChangeText={setLocation} placeholder="Ex.: Estação Sé" error={errors.location} />
      <Field
        label="Descrição"
        value={description}
        onChangeText={setDescription}
        placeholder="Ex.: Elevador do acesso Praça da Sé parado desde segunda."
        multiline
        error={errors.description}
      />

      <SectionHeader title="Foto" />
      {photoUri ? (
        <View>
          <Image source={{ uri: photoUri }} style={styles.photo} resizeMode="cover" />
          <Row gap={spacing.sm} style={styles.photoActions}>
            <Pressable onPress={() => pick(false)} style={styles.photoAction}>
              <Ionicons name="swap-horizontal" size={15} color={colors.white} />
              <Text style={styles.photoActionText}>Trocar</Text>
            </Pressable>
            <Pressable onPress={() => setPhotoUri(undefined)} style={styles.photoAction} accessibilityLabel="Remover foto">
              <Ionicons name="trash-outline" size={15} color={colors.white} />
            </Pressable>
          </Row>
        </View>
      ) : (
        <Pressable
          onPress={() => pick(Platform.OS !== 'web')}
          style={[styles.drop, errors.photo ? { borderColor: colors.bad } : null]}
          accessibilityRole="button"
          accessibilityLabel="Adicionar foto"
        >
          <IconBubble icon="camera" size={52} />
          <T variant="bodyStrong">{Platform.OS === 'web' ? 'Escolher uma foto' : 'Tirar uma foto'}</T>
          <T variant="caption" center>
            Fotografe a calçada, a rampa ou o elevador
          </T>
          {Platform.OS !== 'web' && (
            <Pressable onPress={() => pick(false)} hitSlop={8}>
              <T variant="label" color={colors.brand}>
                ou escolher da galeria
              </T>
            </Pressable>
          )}
        </Pressable>
      )}
      {errors.photo ? (
        <Row gap={6}>
          <Ionicons name="alert-circle" size={14} color={colors.bad} />
          <T variant="caption" color={colors.bad} style={{ flex: 1 }}>
            {errors.photo}
          </T>
        </Row>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  cat: {
    width: '31%',
    flexGrow: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  catActive: { borderColor: colors.brand, backgroundColor: '#F4FAF8' },
  catText: { fontFamily: fonts.semibold, fontSize: 12.5, lineHeight: 16, color: colors.ink },
  photo: { width: '100%', height: 210, borderRadius: radius.lg },
  photoActions: { position: 'absolute', top: 10, right: 10 },
  photoAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(22,33,30,0.65)',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: radius.pill,
  },
  photoActionText: { fontFamily: fonts.semibold, fontSize: 12.5, color: colors.white },
  drop: {
    alignItems: 'center',
    gap: 6,
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
});
