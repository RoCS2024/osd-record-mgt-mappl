import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import StudentViolation from '../screens/Student/StudentViolation';
// import StudentCsSlip from '../screens/Student/StudentCsSlip';

const StudentStack = createStackNavigator();

function StudentNavigator() {
  return (
      <StudentStack.Navigator screenOptions={{ headerShown: false }}>
      <StudentStack.Screen name="StudentViolation" component={StudentViolation} />
      {/* <StudentStack.Screen name="StudentCsSlip" component={StudentCsSlip} /> */}
    </StudentStack.Navigator>
  );
}

export default StudentNavigator;
