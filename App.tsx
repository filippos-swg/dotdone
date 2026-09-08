import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Font from 'expo-font';
import * as Notifications from 'expo-notifications';
import { View, ActivityIndicator, AppState } from 'react-native';
import { RootStackParamList } from './src/types';
import HomeScreen from './src/screens/HomeScreen';
import CalendarScreen from './src/screens/CalendarScreen';
import TasksScreen from './src/screens/TasksScreen';
import { syncReminders } from './src/utils/notifications';

// A reminder that lands while the app is open still shows as a plain banner.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    Font.loadAsync({
      NDot47: require('./assets/fonts/ndot-47.otf'),
    })
      .then(() => setFontsLoaded(true))
      .catch(() => setFontsLoaded(true)); // show app even if font fails
  }, []);

  // Reminders are recomputed from storage on every launch and return to foreground.
  useEffect(() => {
    syncReminders();
    const sub = AppState.addEventListener('change', state => {
      if (state === 'active') syncReminders();
    });
    return () => sub.remove();
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color="#000" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Calendar" component={CalendarScreen} />
        <Stack.Screen name="Tasks" component={TasksScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
