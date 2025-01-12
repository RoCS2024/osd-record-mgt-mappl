import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import EmployeeReport from '../screens/Employee/EmployeeReport';

const EmployeeStack = createStackNavigator();

function EmployeeNavigator() {
  return (
      <EmployeeStack.Navigator screenOptions={{ headerShown: false }}>
      <EmployeeStack.Screen name="EmployeeReport" component={EmployeeReport} />
    </EmployeeStack.Navigator>
  );
}

export default EmployeeNavigator;
