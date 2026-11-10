import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { Loading } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import MyRoutesScreen from '../screens/MyRoutesScreen';
import MobilityProfileScreen from '../screens/MobilityProfileScreen';
import NewReportScreen from '../screens/NewReportScreen';
import ProfileScreen from '../screens/ProfileScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ReportDetailScreen from '../screens/ReportDetailScreen';
import ReportsListScreen from '../screens/ReportsListScreen';
import RouteDetailScreen from '../screens/RouteDetailScreen';
import RouteResultsScreen from '../screens/RouteResultsScreen';
import SearchRouteScreen from '../screens/SearchRouteScreen';
import { colors } from '../theme';
import { AppStackParamList, AuthStackParamList, TabParamList } from './types';

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const AppStack = createNativeStackNavigator<AppStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

const screenOptions = {
  headerStyle: { backgroundColor: colors.primary },
  headerTintColor: '#fff',
  headerTitleStyle: { fontWeight: '700' as const },
  contentStyle: { backgroundColor: colors.background },
};

const TAB_ICONS: Record<keyof TabParamList, keyof typeof Ionicons.glyphMap> = {
  Buscar: 'navigate',
  Relatos: 'megaphone',
  MinhasRotas: 'bookmark',
  Perfil: 'person',
};

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '700' },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
        tabBarIcon: ({ color, size, focused }) => {
          const base = TAB_ICONS[route.name];
          const name = (focused ? base : `${base}-outline`) as keyof typeof Ionicons.glyphMap;
          return <Ionicons name={name} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Buscar" component={SearchRouteScreen} options={{ title: 'Buscar rota' }} />
      <Tab.Screen name="Relatos" component={ReportsListScreen} options={{ title: 'Relatos' }} />
      <Tab.Screen name="MinhasRotas" component={MyRoutesScreen} options={{ title: 'Minhas rotas' }} />
      <Tab.Screen name="Perfil" component={ProfileScreen} options={{ title: 'Perfil' }} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) return <Loading />;

  return (
    <NavigationContainer>
      {!user ? (
        <AuthStack.Navigator screenOptions={screenOptions}>
          <AuthStack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <AuthStack.Screen name="Register" component={RegisterScreen} options={{ title: 'Criar conta' }} />
        </AuthStack.Navigator>
      ) : !user.profile ? (
        <AppStack.Navigator screenOptions={screenOptions}>
          <AppStack.Screen
            name="ProfileSetup"
            component={MobilityProfileScreen}
            initialParams={{ firstTime: true }}
            options={{ title: 'Perfil de mobilidade' }}
          />
        </AppStack.Navigator>
      ) : (
        <AppStack.Navigator screenOptions={screenOptions}>
          <AppStack.Screen name="Tabs" component={Tabs} options={{ headerShown: false }} />
          <AppStack.Screen
            name="ProfileSetup"
            component={MobilityProfileScreen}
            options={{ title: 'Perfil de mobilidade' }}
          />
          <AppStack.Screen
            name="RouteResults"
            component={RouteResultsScreen}
            options={{ title: 'Rotas encontradas' }}
          />
          <AppStack.Screen
            name="RouteDetail"
            component={RouteDetailScreen}
            options={{ title: 'Detalhe da rota' }}
          />
          <AppStack.Screen name="NewReport" component={NewReportScreen} options={{ title: 'Novo relato' }} />
          <AppStack.Screen
            name="ReportDetail"
            component={ReportDetailScreen}
            options={{ title: 'Detalhe do relato' }}
          />
        </AppStack.Navigator>
      )}
    </NavigationContainer>
  );
}
