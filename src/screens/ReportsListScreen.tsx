import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, Image, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { EmptyState, Loading, Pill, Row, Segmented, T } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { AppStackParamList } from '../navigation/types';
import { CATEGORY_ICONS, CATEGORY_LABELS, getReports } from '../storage/reports';
import { colors, fonts, radius, shadow, shadowStrong, spacing, Tone, toneColors } from '../theme';
import { Report, ReportCategory } from '../types';
import { normalize, timeUntil } from '../utils/id';

type Filter = 'ativos' | 'meus' | 'todos';

export const CATEGORY_TONES: Record<ReportCategory, Tone> = {
  elevador: 'bad',
  escada_rolante: 'warn',
  calcada: 'accent',
  rampa: 'warn',
  cobertura: 'brand',
  outro: 'neutral',
};

export function statusPill(r: Report) {
  if (r.status === 'resolvido') return <Pill text="Resolvido" tone="good" icon="checkmark-done" />;
  if (r.status === 'expirado') return <Pill text="Expirado" tone="neutral" icon="time-outline" />;
  return <Pill text={timeUntil(r.expiresAt)} tone="warn" icon="time-outline" />;
}

/** Mantido por compatibilidade. */
export const statusTag = statusPill;

export default function ReportsListScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[] | null>(null);
  const [filter, setFilter] = useState<Filter>('ativos');
  const [query, setQuery] = useState('');

  useFocusEffect(
    useCallback(() => {
      getReports().then(setReports);
    }, []),
  );

  const visible = useMemo(() => {
    if (!reports) return [];
    const q = normalize(query);
    return reports
      .filter((r) => (filter === 'ativos' ? r.status === 'ativo' : filter === 'meus' ? r.userId === user?.id : true))
      .filter((r) => !q || normalize(`${r.location} ${r.description}`).includes(q));
  }, [reports, filter, query, user]);

  if (!reports) return <Loading />;

  const activeCount = reports.filter((r) => r.status === 'ativo').length;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <FlatList
        data={visible}
        keyExtractor={(r) => r.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={{ gap: spacing.md, marginBottom: spacing.xs }}>
            <T variant="body" style={{ marginTop: -spacing.sm }}>
              {activeCount} problema{activeCount === 1 ? '' : 's'} ativo{activeCount === 1 ? '' : 's'} relatado
              {activeCount === 1 ? '' : 's'} pela comunidade.
            </T>
            <Row gap={spacing.sm} style={[styles.search, shadow]}>
              <Ionicons name="search" size={18} color={colors.inkFaint} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Buscar estação ou rua"
                placeholderTextColor={colors.inkFaint}
                style={[styles.searchInput, Platform.OS === 'web' && ({ outlineStyle: 'none' } as object)]}
                accessibilityLabel="Buscar relatos"
              />
              {query ? (
                <Pressable onPress={() => setQuery('')} hitSlop={8}>
                  <Ionicons name="close-circle" size={18} color={colors.inkFaint} />
                </Pressable>
              ) : null}
            </Row>
            <Segmented
              options={[
                { key: 'ativos', label: 'Ativos' },
                { key: 'meus', label: 'Meus' },
                { key: 'todos', label: 'Todos' },
              ]}
              value={filter}
              onChange={setFilter}
            />
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            icon="megaphone-outline"
            title={filter === 'meus' ? 'Você ainda não relatou' : 'Nada por aqui'}
            message="Viu um elevador quebrado ou uma calçada ruim? Toque no + e avise a comunidade."
          />
        }
        renderItem={({ item }) => {
          const tone = CATEGORY_TONES[item.category];
          const faded = item.status !== 'ativo';
          return (
            <Pressable
              onPress={() => navigation.navigate('ReportDetail', { reportId: item.id })}
              style={({ pressed }) => [styles.card, shadow, faded && { opacity: 0.7 }, pressed && { opacity: 0.9 }]}
            >
              {item.photoUri ? (
                <Image source={{ uri: item.photoUri }} style={styles.thumb} />
              ) : (
                <View style={[styles.thumb, styles.thumbEmpty, { backgroundColor: toneColors(tone).bg }]}>
                  <Ionicons name={CATEGORY_ICONS[item.category] as keyof typeof Ionicons.glyphMap} size={30} color={toneColors(tone).fg} />
                </View>
              )}
              <View style={{ flex: 1, gap: 3 }}>
                <T variant="overline" style={{ fontSize: 10.5 }}>
                  {CATEGORY_LABELS[item.category]}
                </T>
                <T variant="title" numberOfLines={1} style={{ fontSize: 15 }}>
                  {item.location}
                </T>
                <T variant="caption" numberOfLines={2}>
                  {item.description}
                </T>
                <Row style={{ justifyContent: 'space-between', marginTop: 6 }}>
                  {statusPill(item)}
                  <Row gap={4}>
                    <Ionicons name="people" size={13} color={colors.inkFaint} />
                    <Text style={styles.count}>{item.confirmations.length}</Text>
                  </Row>
                </Row>
              </View>
            </Pressable>
          );
        }}
      />

      <Pressable
        onPress={() => navigation.navigate('NewReport')}
        style={({ pressed }) => [styles.fab, shadowStrong, pressed && { transform: [{ scale: 0.95 }] }]}
        accessibilityRole="button"
        accessibilityLabel="Novo relato"
      >
        <Ionicons name="add" size={24} color={colors.white} />
        <Text style={styles.fabText}>Relatar</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.xl, paddingTop: spacing.sm, gap: spacing.md, paddingBottom: 110, width: '100%', maxWidth: 680, alignSelf: 'center' },
  search: { backgroundColor: colors.surface, borderRadius: radius.md, paddingHorizontal: spacing.md },
  searchInput: { flex: 1, paddingVertical: 13, fontSize: 15, fontFamily: fonts.medium, color: colors.ink },
  card: { flexDirection: 'row', gap: spacing.md, backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md },
  thumb: { width: 76, alignSelf: 'stretch', minHeight: 90, borderRadius: radius.md, backgroundColor: colors.surfaceAlt },
  thumbEmpty: { alignItems: 'center', justifyContent: 'center' },
  count: { fontFamily: fonts.bold, fontSize: 12.5, color: colors.inkSoft },
  fab: {
    position: 'absolute',
    right: spacing.xl,
    bottom: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.brand,
    paddingLeft: 16,
    paddingRight: 20,
    height: 54,
    borderRadius: 27,
  },
  fabText: { fontFamily: fonts.bold, fontSize: 15, color: colors.white },
});
