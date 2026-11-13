import { DarkTheme, NavigationContainer, type LinkingOptions } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { HistoryProvider } from './src/context/HistoryContext';
import { CalculatorScreen } from './src/screens/CalculatorScreen';
import { HistoryScreen } from './src/screens/HistoryScreen';
import { colors } from './src/theme/colors';
import type { RootStackParamList } from './src/types/calculator';

const Stack = createNativeStackNavigator<RootStackParamList>();

const navigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.background,
    card: colors.appSurface,
    text: colors.textPrimary,
    border: colors.border,
    primary: colors.accent,
  },
};

const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [],
  config: {
    screens: {
      Calculator: '',
      History: 'historico',
    },
  },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <HistoryProvider>
        <StatusBar style="light" />
        <NavigationContainer
          theme={navigationTheme}
          linking={linking}
          documentTitle={{
            formatter: (options, route) => {
              if (route?.name === 'History') {
                return 'Histórico — Calculadora';
              }
              return options?.title ?? 'Calculadora com Histórico';
            },
          }}
        >
          <Stack.Navigator
            initialRouteName="Calculator"
            screenOptions={{
              headerShown: false,
              animation: 'slide_from_right',
              contentStyle: { backgroundColor: colors.background },
            }}
          >
            <Stack.Screen
              name="Calculator"
              component={CalculatorScreen}
              options={{ title: 'Calculadora' }}
            />
            <Stack.Screen
              name="History"
              component={HistoryScreen}
              options={{ title: 'Histórico' }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </HistoryProvider>
    </SafeAreaProvider>
  );
}
