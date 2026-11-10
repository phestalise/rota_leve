import AsyncStorage from '@react-native-async-storage/async-storage';

export const KEYS = {
  users: '@rotaleve:users',
  session: '@rotaleve:session',
  reports: '@rotaleve:reports',
  savedRoutes: '@rotaleve:savedRoutes',
  seeded: '@rotaleve:seeded',
};

export async function readJSON<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export async function writeJSON<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function removeKey(key: string): Promise<void> {
  await AsyncStorage.removeItem(key);
}
