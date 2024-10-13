import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';

// Import Screens
import Login from '../screens/Auth/Login';
import Forgot from '../screens/Auth/Forgot';
import CreateAccount from '../screens/Auth/CreateAccount';
import VerifyOtp from '../screens/Auth/VerifyOtp';

// Stack Navigators
const Stack = createStackNavigator();
const AuthStack = createStackNavigator();
const GuestStack = createStackNavigator();
const StudentStack = createStackNavigator();
const EmployeeStack = createStackNavigator();

// Auth Navigator
function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={Login} />
      <AuthStack.Screen name="Forgot" component={Forgot} />
      <AuthStack.Screen name="CreateAccount" component={CreateAccount} />
      <AuthStack.Screen name="VerifyOtp" component={VerifyOtp} />
    </AuthStack.Navigator>
  );
}

// Guest Navigator
function GuestNavigator() {
  return (
    <GuestStack.Navigator screenOptions={{ headerShown: false }}>
    </GuestStack.Navigator>
  );
}

// Student Navigator
function StudentNavigator() {
  return (
    <StudentStack.Navigator screenOptions={{ headerShown: false }}>
    </StudentStack.Navigator>
  );
}

// Employee Navigator
function EmployeeNavigator() {
  return (
    <EmployeeStack.Navigator screenOptions={{ headerShown: false }}>
    </EmployeeStack.Navigator>
  );
}

// Main App Navigator
export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={MainNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
