import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/plus-jakarta-sans';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { Platform, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import DialogHost from './src/components/DialogHost';
import { Loading } from './src/components/ui';
import { AuthProvider } from './src/context/AuthContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';
import { colors } from './src/theme';

/**
 * No navegador, o fundo da página (html/body) fica fora do app. Pintamos com a cor do tema e
 * travamos a rolagem da página, para nunca aparecer uma faixa de outra cor atrás do app.
 */
function useWebPageBackground(color: string) {
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    for (const el of [document.documentElement, document.body, document.getElementById('root')]) {
      if (!el) continue;
      el.style.backgroundColor = color;
      el.style.overflow = 'hidden';
      el.style.height = '100%';
    }
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', color);
  }, [color]);
}

function Root() {
  const { mode } = useTheme();
  useWebPageBackground(colors.bg);
  return (
    <View key={mode} style={{ flex: 1, backgroundColor: colors.bg }}>
      <AppNavigator />
      <DialogHost />
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
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
      <ThemeProvider>
        {fontsLoaded ? (
          <AuthProvider>
            <Root />
          </AuthProvider>
        ) : (
          <Loading />
        )}
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
