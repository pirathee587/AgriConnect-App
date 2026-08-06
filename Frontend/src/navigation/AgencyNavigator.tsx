import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AgencyTabParamList } from './types';
import { AgencyDashboardScreen } from '../features/agency/screens/AgencyDashboardScreen';
import { NicUploadScreen } from '../features/agency/screens/NicUploadScreen';
import { ActivationPaymentScreen } from '../features/agency/screens/ActivationPaymentScreen';
import { CreatePackageScreen } from '../features/agency/screens/CreatePackageScreen';
import { ManagePackagesScreen } from '../features/agency/screens/ManagePackagesScreen';
import { UpdatePriceScreen } from '../features/agency/screens/UpdatePriceScreen';
import { BookingRequestsScreen } from '../features/agency/screens/BookingRequestsScreen';
import { EarningsScreen } from '../features/agency/screens/EarningsScreen';
import { AgencyProfileScreen } from '../features/agency/screens/AgencyProfileScreen';

// Driver Module Screens
import { DriverListScreen } from '../features/agency/screens/DriverListScreen';
import { AddDriverScreen } from '../features/agency/screens/AddDriverScreen';
import { DriverDetailScreen } from '../features/agency/screens/DriverDetailScreen';
import { EditDriverScreen } from '../features/agency/screens/EditDriverScreen';
import { VehicleListScreen } from '../features/agency/screens/VehicleListScreen';
import { AddVehicleScreen } from '../features/agency/screens/AddVehicleScreen';
import { VehicleDetailScreen } from '../features/agency/screens/VehicleDetailScreen';
import { AssignDriverScreen } from '../features/agency/screens/AssignDriverScreen';
import { PackageDetailScreen } from '../features/agency/screens/PackageDetailScreen';

import { theme } from '../theme';
import { Ionicons } from '@expo/vector-icons';

const Stack = createNativeStackNavigator<AgencyTabParamList>();
const Tab = createBottomTabNavigator<AgencyTabParamList>();

// Bottom Tabs Flow
const AgencyTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.secondaryDark,
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
          if (route.name === 'AgencyDashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Earnings') {
            iconName = focused ? 'trending-up' : 'trending-up-outline';
          } else if (route.name === 'AgencyProfile') {
            iconName = focused ? 'person' : 'person-outline';
          }
          return <Ionicons name={iconName} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen 
        name="AgencyDashboard" 
        component={AgencyDashboardScreen} 
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen 
        name="Earnings" 
        component={EarningsScreen} 
        options={{ tabBarLabel: 'Earnings' }}
      />
      <Tab.Screen 
        name="AgencyProfile" 
        component={AgencyProfileScreen} 
        options={{ tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

// Main Stack Wrapper
export const AgencyNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="AgencyDashboard" component={AgencyTabs} />
      <Stack.Screen name="NicUpload" component={NicUploadScreen} />
      <Stack.Screen name="ActivationPayment" component={ActivationPaymentScreen} />
      <Stack.Screen name="CreatePackage" component={CreatePackageScreen} />
      <Stack.Screen name="ManagePackages" component={ManagePackagesScreen} />
      <Stack.Screen name="UpdatePrice" component={UpdatePriceScreen} />
      <Stack.Screen name="BookingRequests" component={BookingRequestsScreen} />

      {/* Driver Module Screens */}
      <Stack.Screen name="PackageDetail" component={PackageDetailScreen} />
      <Stack.Screen name="AssignDriver" component={AssignDriverScreen} />
      <Stack.Screen name="DriverList" component={DriverListScreen} />
      <Stack.Screen name="AddDriver" component={AddDriverScreen} />
      <Stack.Screen name="DriverDetail" component={DriverDetailScreen} />
      <Stack.Screen name="EditDriver" component={EditDriverScreen} />
      <Stack.Screen name="VehicleList" component={VehicleListScreen} />
      <Stack.Screen name="AddVehicle" component={AddVehicleScreen} />
      <Stack.Screen name="VehicleDetail" component={VehicleDetailScreen} />
    </Stack.Navigator>
  );
};

export default AgencyNavigator;
