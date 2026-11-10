import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { Text } from 'react-native';
import { Button, Loading, Screen } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import { colors } from '../theme';
import { AuthStackParamList } from './types';

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const RootStack = createNativeStackNavigator();

const screenOptions = {
  headerStyle: { backgroundColor: colors.primary },
  headerTintColor: '#fff',
  headerTitleStyle: { fontWeight: '700' as const },
  contentStyle: { backgroundColor: colors.background },
};

function HomePlaceholder() {
  const { user, signOut } = useAuth();
  return (
    <Screen>
      <Text>Olá, {user?.name}!</Text>
      <Button title="Sair" variant="danger" onPress={signOut} />
    </Screen>
  );
}

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) return <Loading />;

  return (
    <NavigationContainer>
      {user ? (
        <RootStack.Navigator screenOptions={screenOptions}>
          <RootStack.Screen name="Home" component={HomePlaceholder} options={{ title: 'Rota Leve' }} />
        </RootStack.Navigator>
      ) : (
        <AuthStack.Navigator screenOptions={screenOptions}>
          <AuthStack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <AuthStack.Screen name="Register" component={RegisterScreen} options={{ title: 'Criar conta' }} />
        </AuthStack.Navigator>
      )}
    </NavigationContainer>
  );
}
