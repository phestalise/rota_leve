import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button, Card, Screen, SectionTitle, Tag } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { AppStackParamList } from '../navigation/types';
import { profileIcon, profileLabel } from '../services/profiles';
import { colors, spacing } from '../theme';
import { confirmAction } from '../utils/dialog';

export default function ProfileScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const { user, signOut } = useAuth();
  const profile = user?.profile;

  async function handleLogout() {
    if (await confirmAction('Sair', 'Deseja sair da sua conta?')) {
      await signOut();
    }
  }

  return (
    <Screen>
      <Card style={styles.userCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.name.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>
      </Card>

      <SectionTitle>Perfil de mobilidade</SectionTitle>
      <Card>
        <View style={styles.row}>
          <Ionicons name={profileIcon(profile?.type)} size={26} color={colors.primary} />
          <Text style={styles.profileLabel}>{profileLabel(profile?.type)}</Text>
        </View>
        {profile && (
          <View style={styles.tags}>
            {profile.avoidStairs && <Tag text="Evitar escadas" icon="close-circle-outline" />}
            {profile.preferElevator && <Tag text="Prioriza elevador" icon="arrow-up-circle-outline" />}
            {profile.needSeat && <Tag text="Precisa de assento" icon="cafe-outline" />}
            {profile.avoidSteepSlopes && <Tag text="Evitar ladeiras" icon="trending-up-outline" />}
            <Tag text={`Até ${profile.maxWalkMeters} m a pé`} icon="walk-outline" />
          </View>
        )}
        <Button
          title="Editar perfil de mobilidade"
          variant="secondary"
          icon="create-outline"
          onPress={() => navigation.navigate('ProfileSetup', { firstTime: false })}
        />
      </Card>

      <SectionTitle>Aplicativo</SectionTitle>
      <Button
        title="Sobre o App"
        variant="secondary"
        icon="information-circle-outline"
        onPress={() => navigation.navigate('About')}
      />
      <Button title="Sair" variant="danger" icon="log-out-outline" onPress={handleLogout} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  userCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontSize: 24, fontWeight: '800' },
  name: { fontSize: 18, fontWeight: '700', color: colors.text },
  email: { color: colors.textMuted },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  profileLabel: { fontSize: 16, fontWeight: '700', color: colors.text },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
});
