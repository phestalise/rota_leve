import { Ionicons } from '@expo/vector-icons';
import { BottomTabBarProps, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DarkTheme, DefaultTheme, NavigationContainer, NavigationState } from '@react-navigation/native';
import { createNativeStackNavigator, NativeStackNavigationOptions } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaInsetsContext, useSafeAreaInsets } from 'react-native-safe-area-context';
import Logo from '../components/Logo';
import { Loading, ThemeToggle } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import AboutScreen from '../screens/AboutScreen';
import LoginScreen from '../screens/LoginScreen';
import MobilityProfileScreen from '../screens/MobilityProfileScreen';
import MyRoutesScreen from '../screens/MyRoutesScreen';
import NewReportScreen from '../screens/NewReportScreen';
import ProfileScreen from '../screens/ProfileScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ReportDetailScreen from '../screens/ReportDetailScreen';
import ReportsListScreen from '../screens/ReportsListScreen';
import RouteDetailScreen from '../screens/RouteDetailScreen';
import RouteResultsScreen from '../screens/RouteResultsScreen';
import SearchRouteScreen from '../screens/SearchRouteScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import { useTheme } from '../context/ThemeContext';
import { colors, CONTENT_MAX_WIDTH, fonts, getThemeMode, themed, useIsWide } from '../theme';
import { AppStackParamList, AuthStackParamList, TabParamList } from './types';

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const AppStack = createNativeStackNavigator<AppStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function makeNavTheme() {
  const base = getThemeMode() === 'dark' ? DarkTheme : DefaultTheme;
  return {
    ...base,
    colors: {
      ...base.colors,
      background: colors.bg,
      primary: colors.brand,
      card: colors.bg,
      text: colors.ink,
      border: colors.line,
    },
  };
}

const makeStackOptions = (): NativeStackNavigationOptions => ({
  headerStyle: { backgroundColor: colors.bg },
  headerShadowVisible: false,
  headerTintColor: colors.ink,
  headerTitleAlign: 'center',
  headerTitleStyle: { fontFamily: fonts.bold, fontSize: 16, color: colors.ink },
  headerBackButtonDisplayMode: 'minimal',
  contentStyle: { backgroundColor: colors.bg },
});

const TABS: Record<keyof TabParamList, { icon: string; label: string }> = {
  Buscar: { icon: 'navigate', label: 'Buscar' },
  Relatos: { icon: 'megaphone', label: 'Relatos' },
  MinhasRotas: { icon: 'bookmark', label: 'Salvas' },
  Perfil: { icon: 'person', label: 'Perfil' },
};

function TabIcon({ name, focused }: { name: keyof TabParamList; focused: boolean }) {
  const base = TABS[name].icon;
  const icon = (focused ? base : `${base}-outline`) as keyof typeof Ionicons.glyphMap;
  return <Ionicons name={icon} size={21} color={focused ? colors.brand : colors.inkFaint} />;
}

/**
 * Barra superior do app. Em telas largas mostra os links inline; em telas estreitas vira um
 * menu sanduíche que abre um painel com as abas e a troca de tema.
 */
function TopNav({ state, navigation }: BottomTabBarProps) {
  const wide = useIsWide();
  const insets = useSafeAreaInsets();
  const { mode, toggle } = useTheme();
  const [open, setOpen] = useState(false);
  const headerHeight = 64 + insets.top;

  const go = (index: number) => {
    const route = state.routes[index];
    const focused = state.index === index;
    setOpen(false);
    const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
    if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
  };

  return (
    <View style={[styles.topNav, { paddingTop: insets.top }]}>
      <View style={styles.topNavInner}>
        <Logo size={32} />
        {wide ? (
          <View style={{ flexDirection: 'row', gap: 4, alignItems: 'center' }}>
            {state.routes.map((route, index) => {
              const focused = state.index === index;
              const name = route.name as keyof TabParamList;
              return (
                <Pressable
                  key={route.key}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: focused }}
                  onPress={() => go(index)}
                  style={({ hovered, pressed }: { hovered?: boolean; pressed: boolean }) => [
                    styles.topNavItem,
                    (hovered || pressed) && !focused && { backgroundColor: colors.surfaceAlt },
                    focused && { backgroundColor: colors.brandSoft },
                  ]}
                >
                  <Text style={[styles.topNavLabel, focused && { color: colors.brandDark, fontFamily: fonts.bold }]}>
                    {TABS[name].label}
                  </Text>
                </Pressable>
              );
            })}
            <View style={{ marginLeft: 8 }}>
              <ThemeToggle size={38} />
            </View>
          </View>
        ) : (
          <Pressable
            onPress={() => setOpen((v) => !v)}
            accessibilityRole="button"
            accessibilityLabel={open ? 'Fechar menu' : 'Abrir menu'}
            accessibilityState={{ expanded: open }}
            hitSlop={6}
            style={({ pressed }) => [styles.burger, pressed && { opacity: 0.7 }]}
          >
            <Ionicons name={open ? 'close' : 'menu'} size={22} color={colors.ink} />
          </Pressable>
        )}
      </View>

      <Modal visible={open && !wide} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.menuBackdrop} onPress={() => setOpen(false)} accessibilityLabel="Fechar menu" />
        <View style={[styles.menuSheet, { top: 0, paddingTop: headerHeight }]}>
          <View style={[styles.menuHeader, { top: insets.top }]}>
            <Logo size={32} />
            <Pressable
              onPress={() => setOpen(false)}
              accessibilityRole="button"
              accessibilityLabel="Fechar menu"
              hitSlop={6}
              style={({ pressed }) => [styles.burger, pressed && { opacity: 0.7 }]}
            >
              <Ionicons name="close" size={22} color={colors.ink} />
            </Pressable>
          </View>
          {state.routes.map((route, index) => {
            const focused = state.index === index;
            const name = route.name as keyof TabParamList;
            return (
              <Pressable
                key={route.key}
                accessibilityRole="menuitem"
                accessibilityState={{ selected: focused }}
                onPress={() => go(index)}
                style={({ pressed }) => [
                  styles.menuItem,
                  pressed && !focused && { backgroundColor: colors.surfaceAlt },
                  focused && { backgroundColor: colors.brandSoft },
                ]}
              >
                <TabIcon name={name} focused={focused} />
                <Text style={[styles.menuLabel, focused && { color: colors.brandDark, fontFamily: fonts.bold }]}>
                  {TABS[name].label}
                </Text>
              </Pressable>
            );
          })}
          <View style={styles.menuDivider} />
          <Pressable
            onPress={toggle}
            accessibilityRole="button"
            style={({ pressed }) => [styles.menuItem, pressed && { backgroundColor: colors.surfaceAlt }]}
          >
            <Ionicons name={mode === 'dark' ? 'sunny-outline' : 'moon-outline'} size={21} color={colors.inkFaint} />
            <Text style={styles.menuLabel}>{mode === 'dark' ? 'Tema claro' : 'Tema escuro'}</Text>
          </Pressable>
        </View>
      </Modal>
    </View>
  );
}

function Tabs() {
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      tabBar={(props) => <TopNav {...props} />}
      // A barra superior já desconta a área segura do topo; as telas não devem somá-la de novo.
      screenLayout={({ children }) => (
        <SafeAreaInsetsContext.Provider value={{ ...insets, top: 0 }}>{children}</SafeAreaInsetsContext.Provider>
      )}
      screenOptions={{
        headerShown: false,
        tabBarPosition: 'top',
        sceneStyle: { backgroundColor: colors.bg },
      }}
    >
      <Tab.Screen name="Buscar" component={SearchRouteScreen} />
      <Tab.Screen name="Relatos" component={ReportsListScreen} />
      <Tab.Screen name="MinhasRotas" component={MyRoutesScreen} />
      <Tab.Screen name="Perfil" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// Guarda o estado da navegação para que trocar o tema (que recria a árvore) não volte à tela inicial.
const savedNavState: Partial<Record<string, NavigationState>> = {};

export default function AppNavigator() {
  const { user, loading } = useAuth();
  const { mode } = useTheme();

  if (loading) return <Loading />;

  // A "key" recria a navegação a cada troca de fluxo (login → perfil → app). Sem isso, ao salvar o
  // perfil pela primeira vez o container reaproveitava o estado e ficava preso na tela de perfil.
  const flow = !user ? 'auth' : !user.profile ? 'onboarding' : 'app';
  // Ao sair, esquece onde o usuário estava: o próximo login começa na tela inicial.
  if (flow === 'auth') {
    delete savedNavState.app;
    delete savedNavState.onboarding;
  }
  const stackOptions = makeStackOptions();
  return (
    <NavigationContainer
      key={`${flow}-${mode}`}
      theme={makeNavTheme()}
      initialState={savedNavState[flow]}
      onStateChange={(state) => {
        savedNavState[flow] = state;
      }}
    >
      {!user ? (
        <AuthStack.Navigator key="auth" screenOptions={stackOptions}>
          <AuthStack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
          <AuthStack.Screen name="Login" component={LoginScreen} options={{ title: '' }} />
          <AuthStack.Screen name="Register" component={RegisterScreen} options={{ title: '' }} />
        </AuthStack.Navigator>
      ) : !user.profile ? (
        <AppStack.Navigator key="onboarding" screenOptions={stackOptions}>
          <AppStack.Screen
            name="ProfileSetup"
            component={MobilityProfileScreen}
            initialParams={{ firstTime: true }}
            options={{ title: '' }}
          />
        </AppStack.Navigator>
      ) : (
        <AppStack.Navigator key="app" screenOptions={stackOptions}>
          <AppStack.Screen name="Tabs" component={Tabs} options={{ headerShown: false }} />
          <AppStack.Screen name="ProfileSetup" component={MobilityProfileScreen} options={{ title: 'Perfil de mobilidade' }} />
          <AppStack.Screen name="RouteResults" component={RouteResultsScreen} options={{ title: 'Rotas encontradas' }} />
          <AppStack.Screen name="RouteDetail" component={RouteDetailScreen} options={{ title: 'Detalhe da rota' }} />
          <AppStack.Screen name="About" component={AboutScreen} options={{ title: 'Sobre o App' }} />
          <AppStack.Screen name="NewReport" component={NewReportScreen} options={{ title: 'Novo relato' }} />
          <AppStack.Screen name="ReportDetail" component={ReportDetailScreen} options={{ title: 'Relato' }} />
        </AppStack.Navigator>
      )}
    </NavigationContainer>
  );
}

const styles = themed(() => StyleSheet.create({
  topNav: { backgroundColor: colors.bg, borderBottomWidth: 1, borderBottomColor: colors.line },
  topNavInner: {
    width: '100%',
    maxWidth: 1080,
    alignSelf: 'center',
    height: 64,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topNavItem: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, height: 40, borderRadius: 10 },
  topNavLabel: { fontFamily: fonts.semibold, fontSize: 14, color: colors.inkSoft },
  burger: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
  },
  menuBackdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: colors.overlay },
  menuSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: colors.bg,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    paddingHorizontal: 12,
    paddingBottom: 16,
    gap: 2,
  },
  menuHeader: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 64,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 14, height: 50, borderRadius: 12 },
  menuLabel: { fontFamily: fonts.semibold, fontSize: 16, color: colors.ink },
  menuDivider: { height: 1, backgroundColor: colors.line, marginVertical: 8, marginHorizontal: 14 },
}));
