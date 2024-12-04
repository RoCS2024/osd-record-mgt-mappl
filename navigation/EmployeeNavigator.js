import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
// import EmployeeReport from '../screens/Employee/EmployeeReport';
// import ModalEmployeeReport from '../screens/Employee/ModalEmployeeReport'

const EmployeeStack = createStackNavigator();

function EmployeeNavigator() {
  return (
      <EmployeeStack.Navigator screenOptions={{ headerShown: false }}>
      {/* <EmployeeStack.Screen name="EmployeeReport" component={EmployeeReport} />
      <EmployeeStack.Screen name="ModalEmployeeReport" component={ModalEmployeeReport} /> */}
    </EmployeeStack.Navigator>
  );
}

export default EmployeeNavigator;
