import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Banner, Button, Card, EmptyState, IconBubble, Loading, Pill, Row, Screen, T } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { AppStackParamList } from '../navigation/types';
import { placesOf } from '../services/accessibility';
import { CATEGORY_ICONS, CATEGORY_LABELS, confirmReport, deleteReport, getReport, resolveReport } from '../storage/reports';
import { getSavedRoutes } from '../storage/routes';
import { colors, fonts, radius, spacing, themed, toneColors } from '../theme';
import { Report } from '../types';
import { confirmAction, notify } from '../utils/dialog';
import { formatDate, normalize } from '../utils/id';
import { CATEGORY_TONES, statusPill } from './ReportsListScreen';

type Props = NativeStackScreenProps<AppStackParamList, 'ReportDetail'>;

export default function ReportDetailScreen({ route, navigation }: Props) {
  const { user } = useAuth();
  const [report, setReport] = useState<Report | null | undefined>(undefined);
  const [affected, setAffected] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const r = await getReport(route.params.reportId);
    setReport(r ?? null);
    if (r) {
      const saved = await getSavedRoutes(user!.id);
      const loc = normalize(r.location);
      setAffected(
        saved
          .filter((s) => placesOf(s.route).some((p) => loc.includes(normalize(p)) || normalize(p).includes(loc)))
          .map((s) => s.name),
      );
    }
  }, [route.params.reportId, user]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  if (report === undefined) return <Loading />;
  if (report === null) {
    return (
      <Screen>
        <EmptyState icon="search-outline" title="Relato não encontrado" message="Ele pode ter sido removido." />
      </Screen>
    );
  }

  const isAuthor = report.userId === user?.id;
  const alreadyConfirmed = report.confirmations.includes(user!.id);
  const active = report.status === 'ativo';
  const tone = CATEGORY_TONES[report.category];

  async function handleConfirm() {
    setBusy(true);
    try {
      setReport(await confirmReport(report!.id, user!.id));
      notify('Obrigado!', 'Sua confirmação mantém o relato ativo por mais tempo.');
    } catch (e) {
      notify('Não foi possível confirmar', (e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function handleResolve() {
    if (!(await confirmAction('Marcar como resolvido', 'O problema foi resolvido no local?'))) return;
    await resolveReport(report!.id);
    load();
  }

  async function handleDelete() {
    if (!(await confirmAction('Excluir relato', 'Deseja excluir este relato?'))) return;
    await deleteReport(report!.id);
    navigation.goBack();
  }

  const footer = active ? (
    <Row gap={spacing.md}>
      <Button
        title="Resolvido"
        variant="secondary"
        icon="checkmark-done"
        onPress={handleResolve}
        style={{ flex: isAuthor ? 1 : undefined, paddingHorizontal: spacing.lg }}
      />
      {!isAuthor && (
        <Button
          title={alreadyConfirmed ? 'Confirmado' : 'Ainda está assim'}
          icon={alreadyConfirmed ? 'checkmark-circle' : 'hand-left-outline'}
          onPress={handleConfirm}
          disabled={alreadyConfirmed}
          loading={busy}
          style={{ flex: 1 }}
        />
      )}
    </Row>
  ) : undefined;

  return (
    <Screen footer={footer}>
      <View>
        {report.photoUri ? (
          <Image source={{ uri: report.photoUri }} style={styles.photo} resizeMode="cover" />
        ) : (
          <View style={[styles.photo, styles.photoEmpty, { backgroundColor: toneColors(tone).bg }]}>
            <IconBubble icon={CATEGORY_ICONS[report.category] as keyof typeof Ionicons.glyphMap} tone={tone} size={76} solid />
            <T variant="caption" color={toneColors(tone).fg} style={{ fontFamily: fonts.semibold, marginTop: spacing.sm }}>
              Relato sem foto
            </T>
          </View>
        )}
        <View style={styles.photoBadge}>{statusPill(report)}</View>
      </View>

      <View style={{ gap: 6 }}>
        <Pill text={CATEGORY_LABELS[report.category]} tone={tone} icon={CATEGORY_ICONS[report.category] as keyof typeof Ionicons.glyphMap} />
        <T variant="h1">{report.location}</T>
        <T variant="body" color={colors.ink} style={{ fontSize: 15.5, lineHeight: 24 }}>
          {report.description}
        </T>
      </View>

      <Row gap={spacing.md}>
        <Card style={styles.stat}>
          <Text style={styles.statValue}>{report.confirmations.length}</Text>
          <T variant="caption">confirmaç{report.confirmations.length === 1 ? 'ão' : 'ões'}</T>
        </Card>
        <Card style={styles.stat}>
          <Text style={styles.statValue}>{report.confirmations.length + 1}</Text>
          <T variant="caption">pessoas viram</T>
        </Card>
      </Row>

      <Card style={{ gap: spacing.md }}>
        <Info icon="person-circle-outline" label="Relatado por" value={isAuthor ? 'Você' : report.userName} />
        <Info icon="calendar-outline" label="Quando" value={formatDate(report.createdAt)} />
        <Info icon="hourglass-outline" label="Válido até" value={formatDate(report.expiresAt)} />
      </Card>

      {active && (
        <T variant="caption" center style={{ paddingHorizontal: spacing.lg }}>
          Relatos expiram em 48h se ninguém confirmar. Cada confirmação garante mais 24h.
        </T>
      )}

      {affected.length > 0 && (
        <Banner tone="warn" icon="bookmark" title="Afeta suas rotas salvas" text={affected.join(' · ')} />
      )}

      {isAuthor && (
        <Pressable onPress={handleDelete} style={styles.delete} accessibilityRole="button">
          <Ionicons name="trash-outline" size={16} color={colors.bad} />
          <Text style={styles.deleteText}>Excluir relato</Text>
        </Pressable>
      )}
    </Screen>
  );
}

function Info({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  return (
    <Row gap={spacing.md}>
      <Ionicons name={icon} size={20} color={colors.inkFaint} />
      <T variant="body" style={{ flex: 1 }}>
        {label}
      </T>
      <T variant="bodyStrong">{value}</T>
    </Row>
  );
}

const styles = themed(() => StyleSheet.create({
  photo: { width: '100%', height: 230, borderRadius: radius.xl },
  photoEmpty: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden', height: 190 },
  circleDeco: { position: 'absolute', width: 260, height: 260, borderRadius: 130, opacity: 0.07, top: -80, right: -70 },
  photoBadge: { position: 'absolute', top: 12, left: 12 },
  stat: { flex: 1, alignItems: 'center', gap: 0, paddingVertical: spacing.md },
  statValue: { fontFamily: fonts.extrabold, fontSize: 26, color: colors.ink, letterSpacing: -0.5 },
  delete: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: spacing.md },
  deleteText: { fontFamily: fonts.bold, fontSize: 14, color: colors.bad },
}));
