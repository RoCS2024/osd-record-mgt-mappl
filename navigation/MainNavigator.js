import React, { useState, useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import GuestNavigator from './GuestNavigator';
import StudentNavigator from './StudentNavigator';
import EmployeeNavigator from './EmployeeNavigator';
import AuthNavigator from './AuthNavigator';

const Stack = createStackNavigator();

export default function MainNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Auth" component={AuthNavigator} />
      <Stack.Screen name="Guests" component={GuestNavigator} />
      <Stack.Screen name="Students" component={StudentNavigator} />
      <Stack.Screen name="Employees" component={EmployeeNavigator} />
    </Stack.Navigator>
  );
}