import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { bootstrapAuth } from '../store/slices/authSlice';
import { RootStackParamList } from './types';
import { AuthNavigator } from './AuthNavigator';
import { FarmerNavigator } from './FarmerNavigator';
import { AgencyNavigator } from './AgencyNavigator';
import { AdminNavigator } from './AdminNavigator';
import { theme } from '../theme';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, role, loading } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    dispatch(bootstrapAuth() as any);
  }, [dispatch]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : (
          <>
            {role === 'farmer' && (
              <Stack.Screen name="Farmer" component={FarmerNavigator} />
            )}
            {role === 'agency' && (
              <Stack.Screen name="Agency" component={AgencyNavigator} />
            )}
            {role === 'admin' && (
              <Stack.Screen name="Admin" component={AdminNavigator} />
            )}
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default RootNavigator;
