import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/plus-jakarta-sans';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Platform, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Loading } from './src/components/ui';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import { colors, fonts } from './src/theme';

/**
 * No navegador de um computador, o app aparece dentro de uma moldura de celular,
 * com um painel de apresentação ao lado em telas largas.
 */
function DeviceFrame({ children }: { children: React.ReactNode }) {
  const { width, height } = useWindowDimensions();
  if (Platform.OS !== 'web' || width < 560) return <>{children}</>;
  const showPanel = width >= 1040;
  return (
    <View style={styles.backdrop}>
      <View style={[styles.blob, { top: -120, left: -80, backgroundColor: colors.brandSoft }]} />
      <View style={[styles.blob, { bottom: -160, right: -100, backgroundColor: colors.accentSoft }]} />
      <View style={styles.stage}>
        {showPanel && (
          <View style={styles.panel}>
            <View style={styles.panelLogo}>
              <Ionicons name="walk" size={26} color={colors.white} />
            </View>
            <Text style={styles.panelTitle}>Rota Leve</Text>
            <Text style={styles.panelText}>
              Transporte público avaliado para gestantes, pessoas com carrinho de bebê, idosos,
              cadeirantes e mobilidade reduzida.
            </Text>
            {[
              ['person-circle-outline', 'Perfil de mobilidade'],
              ['podium-outline', 'Rotas reordenadas por nota'],
              ['megaphone-outline', 'Relatos da comunidade'],
              ['notifications-outline', 'Avisos nas rotas salvas'],
            ].map(([icon, label]) => (
              <View key={label} style={styles.panelItem}>
                <Ionicons name={icon as keyof typeof Ionicons.glyphMap} size={18} color={colors.brand} />
                <Text style={styles.panelItemText}>{label}</Text>
              </View>
            ))}
            <Text style={styles.panelFoot}>Global Solution 2026 · ODS 10 e 11</Text>
          </View>
        )}
        <View style={[styles.phone, { height: Math.min(860, height - 48) }]}>{children}</View>
      </View>
    </View>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  return (
    <SafeAreaProvider>
      {fontsLoaded ? (
        <AuthProvider>
          <DeviceFrame>
            <AppNavigator />
          </DeviceFrame>
          <StatusBar style="dark" />
        </AuthProvider>
      ) : (
        <Loading />
      )}
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg,
    overflow: 'hidden',
  },
  blob: { position: 'absolute', width: 520, height: 520, borderRadius: 260, opacity: 0.8 },
  stage: { flexDirection: 'row', alignItems: 'center', gap: 72 },
  panel: { width: 340, gap: 12 },
  panelLogo: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  panelTitle: { fontFamily: fonts.extrabold, fontSize: 40, color: colors.ink, letterSpacing: -1 },
  panelText: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 25, color: colors.inkSoft, marginBottom: 8 },
  panelItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  panelItemText: { fontFamily: fonts.semibold, fontSize: 15, color: colors.ink },
  panelFoot: { fontFamily: fonts.medium, fontSize: 13, color: colors.inkFaint, marginTop: 16 },
  phone: {
    width: 400,
    borderRadius: 44,
    overflow: 'hidden',
    backgroundColor: colors.bg,
    borderWidth: 10,
    borderColor: '#14201D',
    boxShadow: '0 30px 80px rgba(14,107,92,0.25), 0 8px 24px rgba(0,0,0,0.12)',
  } as object,
});
