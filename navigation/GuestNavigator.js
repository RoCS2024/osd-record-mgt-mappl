import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

const GuestStack = createStackNavigator();

function GuestNavigator() {
  return (
    <GuestStack.Navigator screenOptions={{ headerShown: false }}>
    </GuestStack.Navigator>
  );
}

export default GuestNavigator;
