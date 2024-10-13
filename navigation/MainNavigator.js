import React, { useState, useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import GuestNavigator from './GuestNavigator';
import StudentNavigator from './StudentNavigator';
import EmployeeNavigator from './EmployeeNavigator';
import AuthNavigator from './AuthNavigator';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Stack = createStackNavigator();

export default function MainNavigator() {
  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    const getRole = async () => {
      try {
        const role = await AsyncStorage.getItem('role');

        if (role === 'ROLE_STUDENT') {
          setInitialRoute('Students');
        } else if (role === 'ROLE_EMPLOYEE') {
          setInitialRoute('Employees');
        } else if (role === 'ROLE_GUEST') {
          setInitialRoute('Guests');
        } else {
          setInitialRoute('Auth');
        }
      } catch (error) {
        console.error('Failed to get role:', error);
        setInitialRoute('Auth');
      }
    };

    getRole();
  }, []);

  if (!initialRoute) {
    return null;
  }

  return (
    <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Auth" component={AuthNavigator} />
      <Stack.Screen name="Guests" component={GuestNavigator} />
      <Stack.Screen name="Students" component={StudentNavigator} />
      <Stack.Screen name="Employees" component={EmployeeNavigator} />
    </Stack.Navigator>
  );
}