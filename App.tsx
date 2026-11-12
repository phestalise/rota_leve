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
 * No navegador, o fundo da página (html/body) fica fora do app. Injetamos uma folha de estilo global
 * com a cor do tema e fixamos o #root na janela inteira, para nunca aparecer uma faixa de outra cor
 * atrás do app (nem ao redimensionar, nem com a barra do navegador do celular mudando de altura).
 */
function useWebPageBackground(color: string, mode: 'light' | 'dark') {
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    let tag = document.getElementById('rotaleve-page-bg') as HTMLStyleElement | null;
    if (!tag) {
      tag = document.createElement('style');
      tag.id = 'rotaleve-page-bg';
      document.head.appendChild(tag);
    }
    tag.textContent = `
      html, body, #root { background-color: ${color} !important; margin: 0; height: 100%; overflow: hidden; }
      html { color-scheme: ${mode}; }
      #root { position: fixed; inset: 0; display: flex; }
    `;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', color);
  }, [color, mode]);
}

function Root() {
  const { mode } = useTheme();
  useWebPageBackground(colors.bg, mode);
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
