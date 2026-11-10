import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { Image, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Button, Card, Field, Screen, SectionTitle } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { AppStackParamList } from '../navigation/types';
import { CATEGORY_ICONS, CATEGORY_LABELS, createReport, REPORT_TTL_HOURS } from '../storage/reports';
import { colors, radius, spacing } from '../theme';
import { ReportCategory } from '../types';
import { notify } from '../utils/dialog';

type Props = NativeStackScreenProps<AppStackParamList, 'NewReport'>;

const CATEGORIES = Object.keys(CATEGORY_LABELS) as ReportCategory[];

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
    const result = fromCamera
      ? await ImagePicker.launchCameraAsync(options)
      : await ImagePicker.launchImageLibraryAsync(options);
    if (result.canceled || !result.assets?.length) return;
    const asset = result.assets[0];
    // Guardamos como data URI para a foto sobreviver no AsyncStorage (inclusive no navegador).
    const uri =
      asset.base64 && !asset.uri.startsWith('data:')
        ? `data:${asset.mimeType ?? 'image/jpeg'};base64,${asset.base64}`
        : asset.uri;
    setPhotoUri(uri);
    setErrors((e) => ({ ...e, photo: '' }));
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!category) e.category = 'Escolha o tipo de problema.';
    if (location.trim().length < 3) e.location = 'Informe a estação, rua ou ponto.';
    if (description.trim().length < 10) e.description = 'Descreva o problema (mínimo 10 caracteres).';
    if (!photoUri) e.photo = 'Adicione uma foto: ela ajuda outras pessoas a confirmarem o relato.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setSaving(true);
    try {
      const report = await createReport(user!, {
        category: category!,
        location,
        description,
        photoUri,
      });
      notify(
        'Relato enviado',
        `Obrigado! O relato fica ativo por ${REPORT_TTL_HOURS}h e é renovado a cada confirmação da comunidade.`,
      );
      navigation.replace('ReportDetail', { reportId: report.id });
    } catch {
      notify('Erro', 'Não foi possível salvar o relato. Tente de novo.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen>
      <SectionTitle>Tipo de problema</SectionTitle>
      <View style={styles.grid}>
        {CATEGORIES.map((c) => {
          const selected = c === category;
          return (
            <Pressable
              key={c}
              onPress={() => {
                setCategory(c);
                setErrors((e) => ({ ...e, category: '' }));
              }}
              style={[styles.cat, selected && styles.catSelected]}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
            >
              <Ionicons
                name={CATEGORY_ICONS[c] as keyof typeof Ionicons.glyphMap}
                size={24}
                color={selected ? '#fff' : colors.primary}
              />
              <Text style={[styles.catText, selected && { color: '#fff' }]}>{CATEGORY_LABELS[c]}</Text>
            </Pressable>
          );
        })}
      </View>
      {errors.category ? <Text style={styles.error}>{errors.category}</Text> : null}

      <Card>
        <Field
          label="Local"
          value={location}
          onChangeText={setLocation}
          placeholder="Ex.: Estação Sé, Rua Vergueiro 1200"
          error={errors.location}
        />
        <Field
          label="Descrição"
          value={description}
          onChangeText={setDescription}
          placeholder="Ex.: Elevador do acesso Praça da Sé parado desde segunda."
          multiline
          error={errors.description}
        />
      </Card>

      <SectionTitle>Foto do problema</SectionTitle>
      <Card>
        {photoUri ? (
          <View>
            <Image source={{ uri: photoUri }} style={styles.photo} resizeMode="cover" />
            <Pressable
              onPress={() => setPhotoUri(undefined)}
              style={styles.removePhoto}
              accessibilityLabel="Remover foto"
            >
              <Ionicons name="close" size={18} color="#fff" />
            </Pressable>
          </View>
        ) : (
          <View style={[styles.photo, styles.photoEmpty]}>
            <Ionicons name="camera-outline" size={40} color={colors.textMuted} />
            <Text style={styles.photoHint}>Fotografe a calçada, a rampa ou o elevador</Text>
          </View>
        )}
        <View style={styles.photoButtons}>
          {Platform.OS !== 'web' && (
            <Button
              title="Câmera"
              variant="secondary"
              icon="camera"
              onPress={() => pick(true)}
              style={{ flex: 1 }}
            />
          )}
          <Button
            title={Platform.OS === 'web' ? 'Escolher foto' : 'Galeria'}
            variant="secondary"
            icon="images"
            onPress={() => pick(false)}
            style={{ flex: 1 }}
          />
        </View>
        {errors.photo ? <Text style={styles.error}>{errors.photo}</Text> : null}
      </Card>

      <Button title="Enviar relato" icon="send" onPress={handleSubmit} loading={saving} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  cat: {
    width: '48%',
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.primary,
    backgroundColor: colors.surface,
  },
  catSelected: { backgroundColor: colors.primary },
  catText: { flex: 1, fontWeight: '700', color: colors.primary, fontSize: 13 },
  error: { color: colors.danger, fontWeight: '600' },
  photo: { width: '100%', height: 200, borderRadius: radius.md },
  photoEmpty: {
    backgroundColor: colors.background,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  photoHint: { color: colors.textMuted, textAlign: 'center' },
  removePhoto: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 16,
    padding: 6,
  },
  photoButtons: { flexDirection: 'row', gap: spacing.sm },
});
