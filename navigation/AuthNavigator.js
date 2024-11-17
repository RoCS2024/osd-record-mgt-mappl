import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import Login from '../screens/Auth/Login';
import ForgotPassword from '../screens/Auth/ForgotPassword';
import ForgotUsername from '../screens/Auth/ForgotUsername';
import CreateAccount from '../screens/Auth/CreateAccount';
import VerifyOtp from '../screens/Auth/VerifyOtp';
import AddGuest from '../screens/Auth/AddGuest';
import AddGuestNext from '../screens/Auth/AddGuestNext';

const AuthStack = createStackNavigator();

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={Login} />
      <AuthStack.Screen name="ForgotPassword" component={ForgotPassword} />
      <AuthStack.Screen name="ForgotUsername" component={ForgotUsername} />
      <AuthStack.Screen name="CreateAccount" component={CreateAccount} />
      <AuthStack.Screen name="VerifyOtp" component={VerifyOtp} />
      <AuthStack.Screen name="AddGuest" component={AddGuest} />
      <AuthStack.Screen name="AddGuestNext" component={AddGuestNext} />
    </AuthStack.Navigator>
  );
}

export default AuthNavigator;
