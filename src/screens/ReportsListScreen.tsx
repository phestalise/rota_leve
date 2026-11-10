import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card, EmptyState, Loading, Tag } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { AppStackParamList } from '../navigation/types';
import { CATEGORY_ICONS, CATEGORY_LABELS, getReports } from '../storage/reports';
import { colors, radius, spacing } from '../theme';
import { Report } from '../types';
import { normalize, timeUntil } from '../utils/id';

type Filter = 'ativos' | 'meus' | 'todos';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'ativos', label: 'Ativos' },
  { key: 'meus', label: 'Meus relatos' },
  { key: 'todos', label: 'Todos' },
];

export function statusTag(r: Report) {
  if (r.status === 'resolvido') return <Tag text="Resolvido" tone="success" icon="checkmark-done" />;
  if (r.status === 'expirado') return <Tag text="Expirado" tone="warning" icon="time-outline" />;
  return <Tag text={timeUntil(r.expiresAt)} tone="danger" icon="time-outline" />;
}

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
      .filter((r) =>
        filter === 'ativos' ? r.status === 'ativo' : filter === 'meus' ? r.userId === user?.id : true,
      )
      .filter((r) => !q || normalize(`${r.location} ${r.description}`).includes(q));
  }, [reports, filter, query, user]);

  if (!reports) return <Loading />;

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <FlatList
        data={visible}
        keyExtractor={(r) => r.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={{ gap: spacing.md }}>
            <Button
              title="Novo relato"
              icon="add-circle-outline"
              onPress={() => navigation.navigate('NewReport')}
            />
            <View style={styles.search}>
              <Ionicons name="search" size={18} color={colors.textMuted} />
              <SearchInput value={query} onChange={setQuery} />
            </View>
            <View style={styles.filters}>
              {FILTERS.map((f) => (
                <Pressable
                  key={f.key}
                  onPress={() => setFilter(f.key)}
                  style={[styles.filter, filter === f.key && styles.filterActive]}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: filter === f.key }}
                >
                  <Text style={[styles.filterText, filter === f.key && { color: '#fff' }]}>{f.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            icon="megaphone-outline"
            title="Nenhum relato por aqui"
            message="Viu um elevador quebrado ou uma calçada ruim? Avise a comunidade."
          />
        }
        renderItem={({ item }) => (
          <Card onPress={() => navigation.navigate('ReportDetail', { reportId: item.id })}>
            <View style={styles.row}>
              {item.photoUri ? (
                <Image source={{ uri: item.photoUri }} style={styles.thumb} />
              ) : (
                <View style={[styles.thumb, styles.thumbEmpty]}>
                  <Ionicons
                    name={CATEGORY_ICONS[item.category] as keyof typeof Ionicons.glyphMap}
                    size={26}
                    color={colors.primary}
                  />
                </View>
              )}
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={styles.category}>{CATEGORY_LABELS[item.category]}</Text>
                <Text style={styles.location} numberOfLines={1}>
                  <Ionicons name="location-outline" size={13} /> {item.location}
                </Text>
                <Text style={styles.desc} numberOfLines={2}>
                  {item.description}
                </Text>
              </View>
            </View>
            <View style={styles.footer}>
              {statusTag(item)}
              <Text style={styles.confirm}>
                <Ionicons name="people-outline" size={13} /> {item.confirmations.length} confirmação
                {item.confirmations.length === 1 ? '' : 'ões'}
              </Text>
            </View>
          </Card>
        )}
      />
    </SafeAreaView>
  );
}

function SearchInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <TextInput
      value={value}
      onChangeText={onChange}
      placeholder="Buscar por estação, rua…"
      placeholderTextColor={colors.textMuted}
      style={styles.searchInput}
      accessibilityLabel="Buscar relatos"
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: {
    padding: spacing.lg,
    gap: spacing.md,
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
  },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
  },
  searchInput: { flex: 1, paddingVertical: spacing.md, fontSize: 15, color: colors.text },
  filters: { flexDirection: 'row', gap: spacing.sm },
  filter: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  filterActive: { backgroundColor: colors.primary },
  filterText: { color: colors.primary, fontWeight: '700' },
  row: { flexDirection: 'row', gap: spacing.md },
  thumb: { width: 64, height: 64, borderRadius: radius.sm, backgroundColor: colors.primaryLight },
  thumbEmpty: { alignItems: 'center', justifyContent: 'center' },
  category: { fontWeight: '800', color: colors.text, fontSize: 15 },
  location: { color: colors.primaryDark, fontSize: 13, fontWeight: '600' },
  desc: { color: colors.textMuted, fontSize: 13 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  confirm: { color: colors.textMuted, fontSize: 13 },
});
