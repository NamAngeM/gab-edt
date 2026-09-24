import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';

import { LoginScreen } from '../screens/LoginScreen';
import { RollCallScreen } from '../screens/RollCallScreen';
import { AddGradeScreen } from '../screens/AddGradeScreen';
import { CreateAnnouncementScreen } from '../screens/CreateAnnouncementScreen';
import { QRScannerScreen } from '../screens/QRScannerScreen';
import { RoomScheduleScreen } from '../screens/RoomScheduleScreen';
import { TabNavigator } from './TabNavigator';

const Stack = createNativeStackNavigator();

export const AppNavigator = () => {
  const { userToken, isLoading } = useAuth();

  if (isLoading) {
    // Rend un écran vide ou un composant de chargement pendant la restauration du token
    return null;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {userToken == null ? (
        // No token found, user isn't signed in
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{
            animationTypeForReplace: 'pop',
          }}
        />
      ) : (
        // User is signed in
        <>
          <Stack.Screen name="Dashboard" component={TabNavigator} />
          <Stack.Screen 
            name="RollCall" 
            component={RollCallScreen} 
            options={{ presentation: 'modal' }} 
          />
          <Stack.Screen 
            name="AddGrade" 
            component={AddGradeScreen} 
            options={{ presentation: 'card' }} 
          />
          <Stack.Screen 
            name="CreateAnnouncement" 
            component={CreateAnnouncementScreen} 
            options={{ presentation: 'modal' }} 
          />
          <Stack.Screen 
            name="QRScanner" 
            component={QRScannerScreen} 
            options={{ presentation: 'fullScreenModal' }} 
          />
          <Stack.Screen 
            name="RoomSchedule" 
            component={RoomScheduleScreen} 
            options={{ presentation: 'modal' }} 
          />
        </>
      )}
    </Stack.Navigator>
  );
};
