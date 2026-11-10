import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { Text } from 'react-native';
import { Loading, Screen } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import MobilityProfileScreen from '../screens/MobilityProfileScreen';
import ProfileScreen from '../screens/ProfileScreen';
import RegisterScreen from '../screens/RegisterScreen';
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

function SearchPlaceholder() {
  return (
    <Screen>
      <Text>Busca de rotas em construção.</Text>
    </Screen>
  );
}

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
      <Tab.Screen name="Buscar" component={SearchPlaceholder} options={{ title: 'Buscar rota' }} />
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
        </AppStack.Navigator>
      )}
    </NavigationContainer>
  );
}
