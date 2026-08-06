import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStackParamList } from './types';
import { RoleSelectScreen } from '../features/auth/screens/RoleSelectScreen';
import { LoginScreen } from '../features/auth/screens/LoginScreen';
import { FarmerRegisterScreen } from '../features/auth/screens/FarmerRegisterScreen';
import { AgencyRegisterScreen } from '../features/auth/screens/AgencyRegisterScreen';
import { OtpVerifyScreen } from '../features/auth/screens/OtpVerifyScreen';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export const AuthNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="RoleSelect"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="RoleSelect" component={RoleSelectScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="FarmerRegister" component={FarmerRegisterScreen} />
      <Stack.Screen name="AgencyRegister" component={AgencyRegisterScreen} />
      <Stack.Screen name="OtpVerify" component={OtpVerifyScreen} />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
