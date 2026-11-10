import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator, NativeStackNavigationOptions } from '@react-navigation/native-stack';
import React from 'react';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Loading } from '../components/ui';
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
import { colors, fonts } from '../theme';
import { AppStackParamList, AuthStackParamList, TabParamList } from './types';

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const AppStack = createNativeStackNavigator<AppStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

const navTheme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: colors.bg, primary: colors.brand, card: colors.bg, text: colors.ink },
};

const stackOptions: NativeStackNavigationOptions = {
  headerStyle: { backgroundColor: colors.bg },
  headerShadowVisible: false,
  headerTintColor: colors.ink,
  headerTitleAlign: 'center',
  headerTitleStyle: { fontFamily: fonts.bold, fontSize: 16, color: colors.ink },
  headerBackButtonDisplayMode: 'minimal',
  contentStyle: { backgroundColor: colors.bg },
};

const TABS: Record<keyof TabParamList, { icon: string; label: string }> = {
  Buscar: { icon: 'navigate', label: 'Buscar' },
  Relatos: { icon: 'megaphone', label: 'Relatos' },
  MinhasRotas: { icon: 'bookmark', label: 'Salvas' },
  Perfil: { icon: 'person', label: 'Perfil' },
};

function Tabs() {
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: colors.bg },
        headerShadowVisible: false,
        headerTitleAlign: 'left',
        headerTitleStyle: { fontFamily: fonts.extrabold, fontSize: 24, color: colors.ink, letterSpacing: -0.4 },
        sceneStyle: { backgroundColor: colors.bg },
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 0,
          height: 68 + insets.bottom,
          paddingTop: 8,
          paddingBottom: 8 + insets.bottom,
          boxShadow: '0 -4px 24px rgba(22,33,30,0.06)',
        } as object,
        tabBarIcon: ({ focused }) => {
          const base = TABS[route.name].icon;
          const name = (focused ? base : `${base}-outline`) as keyof typeof Ionicons.glyphMap;
          return (
            <View
              style={{
                width: 56,
                height: 30,
                borderRadius: 15,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: focused ? colors.brandSoft : 'transparent',
              }}
            >
              <Ionicons name={name} size={20} color={focused ? colors.brandDark : colors.inkFaint} />
            </View>
          );
        },
        tabBarLabel: ({ focused }) => (
          <Text
            style={{
              fontFamily: focused ? fonts.bold : fonts.medium,
              fontSize: 11.5,
              marginTop: 4,
              color: focused ? colors.brandDark : colors.inkFaint,
            }}
          >
            {TABS[route.name].label}
          </Text>
        ),
      })}
    >
      <Tab.Screen name="Buscar" component={SearchRouteScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Relatos" component={ReportsListScreen} options={{ title: 'Relatos' }} />
      <Tab.Screen name="MinhasRotas" component={MyRoutesScreen} options={{ title: 'Rotas salvas' }} />
      <Tab.Screen name="Perfil" component={ProfileScreen} options={{ headerShown: false }} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) return <Loading />;

  // A "key" recria a navegação a cada troca de fluxo (login → perfil → app). Sem isso, ao salvar o
  // perfil pela primeira vez o container reaproveitava o estado e ficava preso na tela de perfil.
  const flow = !user ? 'auth' : !user.profile ? 'onboarding' : 'app';
  return (
    <NavigationContainer key={flow} theme={navTheme}>
      {!user ? (
        <AuthStack.Navigator key="auth" screenOptions={stackOptions}>
          <AuthStack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
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
