import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { FarmerTabParamList } from './types';
import { FarmerDashboardScreen } from '../features/farmer/screens/FarmerDashboardScreen';
import { PackageListScreen } from '../features/farmer/screens/PackageListScreen';
import { PackageDetailsScreen } from '../features/farmer/screens/PackageDetailsScreen';
import { BookingFormScreen } from '../features/farmer/screens/BookingFormScreen';
import { MyBookingsScreen } from '../features/farmer/screens/MyBookingsScreen';
import { FarmerProfileScreen } from '../features/farmer/screens/FarmerProfileScreen';
import { RateAgencyScreen } from '../features/farmer/screens/RateAgencyScreen';
import { theme } from '../theme';
import { Ionicons } from '@expo/vector-icons';

const Stack = createNativeStackNavigator<FarmerTabParamList>();
const Tab = createBottomTabNavigator<FarmerTabParamList>();

// Bottom Tabs flow
const FarmerTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
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
          fontSize: 11,
          fontWeight: theme.typography.weights.medium,
        },
        tabBarIcon: ({ color, focused }) => {
          let iconName: any;
          if (route.name === 'FarmerDashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'PackageList') {
            iconName = focused ? 'search' : 'search-outline';
          } else if (route.name === 'MyBookings') {
            iconName = focused ? 'document-text' : 'document-text-outline';
          } else if (route.name === 'FarmerProfile') {
            iconName = focused ? 'person' : 'person-outline';
          }
          return <Ionicons name={iconName} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen 
        name="FarmerDashboard" 
        component={FarmerDashboardScreen} 
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen 
        name="PackageList" 
        component={PackageListScreen} 
        options={{ tabBarLabel: 'Trips' }}
      />
      <Tab.Screen 
        name="MyBookings" 
        component={MyBookingsScreen} 
        options={{ tabBarLabel: 'Bookings' }}
      />
      <Tab.Screen 
        name="FarmerProfile" 
        component={FarmerProfileScreen} 
        options={{ tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

// Main Stack wrapper
export const FarmerNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="FarmerDashboard" component={FarmerTabs} />
      <Stack.Screen name="PackageDetails" component={PackageDetailsScreen} />
      <Stack.Screen name="BookingForm" component={BookingFormScreen} />
      <Stack.Screen name="RateAgency" component={RateAgencyScreen} />
    </Stack.Navigator>
  );
};

export default FarmerNavigator;
