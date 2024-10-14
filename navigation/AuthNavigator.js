import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import Login from '../screens/Auth/Login';
import Forgot from '../screens/Auth/Forgot';
import CreateAccount from '../screens/Auth/CreateAccount';
import VerifyOtp from '../screens/Auth/VerifyOtp';

const AuthStack = createStackNavigator();

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

export default AuthNavigator;
