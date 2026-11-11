import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Appearance } from 'react-native';
import { applyTheme, getThemeMode, ThemeMode } from '../theme';

const STORAGE_KEY = '@rotaleve:theme';

interface ThemeContextValue {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  mode: 'light',
  setMode: () => {},
  toggle: () => {},
});

// Aplica o tema do sistema já no carregamento, antes do primeiro render.
applyTheme(Appearance.getColorScheme() === 'dark' ? 'dark' : 'light');

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(getThemeMode());

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((saved) => {
        if ((saved === 'light' || saved === 'dark') && saved !== getThemeMode()) {
          applyTheme(saved);
          setModeState(saved);
        }
      })
      .catch(() => {});
  }, []);

  const setMode = useCallback((next: ThemeMode) => {
    applyTheme(next);
    setModeState(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
  }, []);

  const toggle = useCallback(() => setMode(getThemeMode() === 'dark' ? 'light' : 'dark'), [setMode]);

  const value = useMemo(() => ({ mode, setMode, toggle }), [mode, setMode, toggle]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
