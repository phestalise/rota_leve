import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Platform, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import { colors } from './src/theme';

/** No navegador de um computador, mostra o app numa "moldura" de celular. */
function DeviceFrame({ children }: { children: React.ReactNode }) {
  const { width, height } = useWindowDimensions();
  if (Platform.OS !== 'web' || width < 520) return <>{children}</>;
  return (
    <View style={styles.backdrop}>
      <View style={[styles.phone, { height: Math.min(880, height - 48) }]}>{children}</View>
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <DeviceFrame>
          <AppNavigator />
        </DeviceFrame>
        <StatusBar style="light" />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DCEBE6',
  },
  phone: {
    width: 410,
    borderRadius: 36,
    overflow: 'hidden',
    backgroundColor: colors.background,
    borderWidth: 10,
    borderColor: '#1D2B28',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 12 },
  },
});
