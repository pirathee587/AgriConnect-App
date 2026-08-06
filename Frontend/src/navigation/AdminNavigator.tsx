import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AdminTabParamList } from './types';
import { AdminDashboardScreen } from '../features/admin/screens/AdminDashboardScreen';
import { AgencyVerificationScreen } from '../features/admin/screens/AgencyVerificationScreen';
import { ActivationPaymentMonitorScreen } from '../features/admin/screens/ActivationPaymentMonitorScreen';
import { RevenueAnalyticsScreen } from '../features/admin/screens/RevenueAnalyticsScreen';
import { UserManagementScreen } from '../features/admin/screens/UserManagementScreen';

// Audit Screens
import { DriverRegistryScreen } from '../features/admin/screens/DriverRegistryScreen';
import { VehicleRegistryScreen } from '../features/admin/screens/VehicleRegistryScreen';

import { theme } from '../theme';
import { Ionicons } from '@expo/vector-icons';

const Stack = createNativeStackNavigator<AdminTabParamList>();
const Tab = createBottomTabNavigator<AdminTabParamList>();

// Bottom Tabs Flow
const AdminTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#334155', // Charcoal slate
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarStyle: {
          height: 64,
          paddingBottom: 10,
          paddingTop: 8,
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: theme.colors.border,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: theme.typography.weights.medium,
        },
        tabBarIcon: ({ color, focused }) => {
          let iconName: any;
          if (route.name === 'AdminDashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'AgencyVerification') {
            iconName = focused ? 'shield-checkmark' : 'shield-checkmark-outline';
          } else if (route.name === 'ActivationPaymentMonitor') {
            iconName = focused ? 'wallet' : 'wallet-outline';
          } else if (route.name === 'RevenueAnalytics') {
            iconName = focused ? 'bar-chart' : 'bar-chart-outline';
          } else if (route.name === 'UserManagement') {
            iconName = focused ? 'people' : 'people-outline';
          }
          return <Ionicons name={iconName} size={20} color={color} />;
        },
      })}
    >
      <Tab.Screen 
        name="AdminDashboard" 
        component={AdminDashboardScreen} 
        options={{ tabBarLabel: 'Overview' }}
      />
      <Tab.Screen 
        name="AgencyVerification" 
        component={AgencyVerificationScreen} 
        options={{ tabBarLabel: 'NIC Approvals' }}
      />
      <Tab.Screen 
        name="ActivationPaymentMonitor" 
        component={ActivationPaymentMonitorScreen} 
        options={{ tabBarLabel: 'Payments' }}
      />
      <Tab.Screen 
        name="RevenueAnalytics" 
        component={RevenueAnalyticsScreen} 
        options={{ tabBarLabel: 'Analytics' }}
      />
      <Tab.Screen 
        name="UserManagement" 
        component={UserManagementScreen} 
        options={{ tabBarLabel: 'Users' }}
      />
    </Tab.Navigator>
  );
};

// Main Stack Wrapper (allows details to push over the tabs if needed)
export const AdminNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="AdminDashboard" component={AdminTabs} />
      <Stack.Screen name="DriverRegistry" component={DriverRegistryScreen} />
      <Stack.Screen name="VehicleRegistry" component={VehicleRegistryScreen} />
    </Stack.Navigator>
  );
};

export default AdminNavigator;
