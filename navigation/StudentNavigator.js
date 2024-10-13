import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

const StudentStack = createStackNavigator();

function StudentNavigator() {
  return (
      <StudentStack.Navigator screenOptions={{ headerShown: false }}>
    </StudentStack.Navigator>
  );
}

export default StudentNavigator;
