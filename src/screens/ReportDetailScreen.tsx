import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Button, Card, EmptyState, Loading, Screen } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { AppStackParamList } from '../navigation/types';
import { placesOf } from '../services/accessibility';
import {
  CATEGORY_ICONS,
  CATEGORY_LABELS,
  confirmReport,
  deleteReport,
  getReport,
  resolveReport,
} from '../storage/reports';
import { getSavedRoutes } from '../storage/routes';
import { colors, radius, spacing } from '../theme';
import { Report } from '../types';
import { confirmAction, notify } from '../utils/dialog';
import { formatDate, normalize } from '../utils/id';
import { statusTag } from './ReportsListScreen';

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

  return (
    <Screen>
      {report.photoUri ? (
        <Image source={{ uri: report.photoUri }} style={styles.photo} resizeMode="cover" />
      ) : (
        <View style={[styles.photo, styles.photoEmpty]}>
          <Ionicons
            name={CATEGORY_ICONS[report.category] as keyof typeof Ionicons.glyphMap}
            size={56}
            color={colors.primary}
          />
        </View>
      )}

      <Card>
        <Text style={styles.category}>{CATEGORY_LABELS[report.category]}</Text>
        <View style={styles.line}>
          <Ionicons name="location" size={16} color={colors.primaryDark} />
          <Text style={styles.location}>{report.location}</Text>
        </View>
        <Text style={styles.desc}>{report.description}</Text>
        {statusTag(report)}
      </Card>

      <Card>
        <Info icon="person-outline" label="Relatado por" value={isAuthor ? 'Você' : report.userName} />
        <Info icon="calendar-outline" label="Em" value={formatDate(report.createdAt)} />
        <Info icon="time-outline" label="Válido até" value={formatDate(report.expiresAt)} />
        <Info
          icon="people-outline"
          label="Confirmações"
          value={`${report.confirmations.length} pessoa${report.confirmations.length === 1 ? '' : 's'}`}
        />
      </Card>

      {affected.length > 0 && (
        <Card style={styles.affected}>
          <View style={styles.line}>
            <Ionicons name="bookmark" size={16} color={colors.warning} />
            <Text style={styles.affectedTitle}>Afeta suas rotas salvas</Text>
          </View>
          {affected.map((a) => (
            <Text key={a} style={styles.affectedItem}>
              • {a}
            </Text>
          ))}
        </Card>
      )}

      {active && !isAuthor && (
        <Button
          title={alreadyConfirmed ? 'Você já confirmou' : 'Confirmar: ainda está assim'}
          icon="checkmark-circle-outline"
          onPress={handleConfirm}
          disabled={alreadyConfirmed}
          loading={busy}
        />
      )}
      {active && (
        <Button
          title="Marcar como resolvido"
          variant="secondary"
          icon="checkmark-done-outline"
          onPress={handleResolve}
        />
      )}
      {isAuthor && (
        <Button title="Excluir relato" variant="danger" icon="trash-outline" onPress={handleDelete} />
      )}
    </Screen>
  );
}

function Info({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.info}>
      <Ionicons name={icon} size={18} color={colors.textMuted} />
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  photo: { width: '100%', height: 220, borderRadius: radius.lg },
  photoEmpty: { backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  category: { fontSize: 20, fontWeight: '800', color: colors.text },
  line: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  location: { fontSize: 15, fontWeight: '700', color: colors.primaryDark, flex: 1 },
  desc: { fontSize: 15, color: colors.text, lineHeight: 21 },
  info: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  infoLabel: { color: colors.textMuted, flex: 1 },
  infoValue: { color: colors.text, fontWeight: '700' },
  affected: { backgroundColor: colors.warningLight, borderColor: colors.warning },
  affectedTitle: { fontWeight: '800', color: colors.warning },
  affectedItem: { color: colors.text },
});
