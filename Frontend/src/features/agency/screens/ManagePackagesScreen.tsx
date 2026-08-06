import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator, 
  RefreshControl 
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../store';
import { packageApi, PackageResponse } from '../../../api/package.api';
import { fetchMyPackagesSuccess, packageStart, packageFailure, cancelPackageSuccessRedux } from '../../../store/slices/packageSlice';
import { theme } from '../../../theme';
import { Card, StatusBadge, Button, EmptyState } from '../../../components';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AgencyTabParamList } from '../../../navigation/types';

type ManagePackagesNavigationProp = NativeStackNavigationProp<AgencyTabParamList, 'ManagePackages'>;

interface Props {
  navigation: ManagePackagesNavigationProp;
}

export const ManagePackagesScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch();
  const { myPackages, loading } = useSelector((state: RootState) => state.packages);
  const [refreshing, setRefreshing] = useState(false);

  const loadPackages = async () => {
    dispatch(packageStart());
    try {
      const data = await packageApi.getMyPackages();
      dispatch(fetchMyPackagesSuccess(data));
    } catch (e: any) {
      dispatch(packageFailure(e.message || 'Failed to load trips.'));
    }
  };

  useEffect(() => {
    loadPackages();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPackages();
    setRefreshing(false);
  };

  const handleUpdateStatus = async (packageId: number, status: 'IN_TRANSIT' | 'DELIVERED') => {
    const alertMsg = status === 'IN_TRANSIT' 
      ? 'Start this trip? This notifies booking farmers that the cargo lorry is departing.'
      : 'Mark this trip as delivered? This closes the cargo logs.';

    Alert.alert(
      'Update Trip Status',
      alertMsg,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Update', 
          onPress: async () => {
            dispatch(packageStart());
            try {
              await packageApi.updatePackageStatus(packageId, status);
              Alert.alert('Status Updated', `Trip status is now ${status.replace('_', ' ')}.`);
              loadPackages();
            } catch (e: any) {
              Alert.alert('Error', e.message || 'Could not update status.');
            }
          }
        }
      ]
    );
  };

  const handleCancelPackage = (packageId: number) => {
    Alert.alert(
      'Cancel Trip',
      'Are you sure you want to cancel this entire transport trip? This will reject all active booking cargo requests.',
      [
        { text: 'Keep Trip', style: 'cancel' },
        { 
          text: 'Cancel Trip', 
          style: 'destructive',
          onPress: async () => {
            dispatch(packageStart());
            try {
              await packageApi.cancelPackage(packageId);
              dispatch(cancelPackageSuccessRedux(packageId));
              Alert.alert('Trip Cancelled', 'All bookings have been notified of the cancellation.');
              loadPackages();
            } catch (e: any) {
              Alert.alert('Error', e.message || 'Could not cancel trip.');
            }
          }
        }
      ]
    );
  };

  const handleRemoveDriverInline = (packageId: number, driverName: string, isTransit: boolean) => {
    const performRemoval = async (force: boolean) => {
      dispatch(packageStart());
      try {
        await packageApi.removeDriver(packageId, force);
        Alert.alert('Removed', 'Driver removed successfully.');
        loadPackages();
      } catch (e: any) {
        Alert.alert('Error', e.message || 'Could not remove driver.');
      }
    };

    if (isTransit) {
      Alert.alert(
        'Warning: Trip in Progress',
        `Removing driver ${driverName} mid-trip requires confirmation. Proceed?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Yes, Remove',
            style: 'destructive',
            onPress: () => performRemoval(true),
          },
        ]
      );
    } else {
      Alert.alert(
        'Remove Driver',
        `Remove ${driverName} from this trip?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Remove',
            style: 'destructive',
            onPress: () => performRemoval(false),
          },
        ]
      );
    }
  };

  const renderPackageItem = ({ item }: { item: any }) => {
    const isOpen = item.status === 'OPEN' || item.status === 'FULL';
    const isInTransit = item.status === 'IN_TRANSIT';
    const isCompleted = item.status === 'DELIVERED' || item.status === 'COMPLETED';

    const hasVehicle = item.vehicleId != null || item.vehicleNumber != null;
    const hasDriver = item.driverId != null;
    
    return (
      <Card style={styles.card}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.navigate('PackageDetail', { packageId: item.packageId })}
        >
          <View style={styles.cardHeader}>
            <View style={styles.destBox}>
              <Ionicons name="location" size={18} color={theme.colors.secondary} />
              <Text style={styles.destText}>{item.marketDestination}</Text>
            </View>
            <StatusBadge status={item.status} />
          </View>

          <Text style={styles.dateText}>
            Date: {new Date(item.travelDateTime).toLocaleDateString()} at {new Date(item.travelDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>

          {/* Vehicle and Driver Info Row */}
          <View style={styles.assignmentSummary}>
            <View style={styles.assignmentLine}>
              <Ionicons name="bus-outline" size={14} color={theme.colors.textSecondary} />
              <Text style={styles.assignmentSummaryText}>
                {hasVehicle ? (item.plateNumber || item.vehicleNumber) : 'No vehicle assigned'}
              </Text>
            </View>

            <View style={styles.assignmentLine}>
              <Ionicons name="person-outline" size={14} color={theme.colors.textSecondary} />
              <Text style={styles.assignmentSummaryText}>
                {hasDriver ? item.driverName : 'No driver assigned'}
              </Text>
              {hasDriver && !isCompleted && (
                <TouchableOpacity
                  style={styles.inlineRemoveDriverBtn}
                  onPress={() => handleRemoveDriverInline(item.packageId, item.driverName, isInTransit)}
                >
                  <Ionicons name="trash-outline" size={14} color={theme.colors.error} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          <View style={styles.capacityRow}>
            <Text style={styles.capacityLabel}>Remaining Capacity:</Text>
            <Text style={styles.capacityVal}>{item.remainingCapacityKg} kg of {item.totalCapacityKg} kg</Text>
          </View>

          <View style={styles.vegBox}>
            <Text style={styles.vegLabel}>Crops:</Text>
            <Text style={styles.vegVal} numberOfLines={1}>
              {item.vegetables.map((v: any) => `${v.vegetableName} (Rs.${v.pricePerKg})`).join(', ')}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Action Panel */}
        {(isOpen || isInTransit) && (
          <View style={styles.actionsPanel}>
            {isOpen && (
              <View style={styles.rowActions}>
                <Button 
                  title="Cancel Trip" 
                  variant="outline"
                  onPress={() => handleCancelPackage(item.packageId)}
                  style={styles.cancelBtn}
                  textStyle={styles.cancelText}
                />
                <Button 
                  title="Start Transit" 
                  variant="secondary"
                  onPress={() => handleUpdateStatus(item.packageId, 'IN_TRANSIT')}
                  style={styles.transitBtn}
                />
              </View>
            )}
            {isInTransit && (
              <Button 
                title="Mark Delivered to Market" 
                variant="secondary"
                onPress={() => handleUpdateStatus(item.packageId, 'DELIVERED')}
                style={styles.deliverBtn}
              />
            )}
          </View>
        )}
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.navigate('AgencyDashboard')}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Trips</Text>
      </View>

      {loading && myPackages.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.secondary} />
        </View>
      ) : (
        <FlatList
          data={myPackages}
          keyExtractor={(item) => item.packageId.toString()}
          renderItem={renderPackageItem}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.secondary]} />
          }
          ListEmptyComponent={
            <EmptyState
              title="No Trips Listed"
              description="Create a travel trip package first to manage cargo loads."
              icon="bus-outline"
              actionTitle="List New Trip"
              onActionPress={() => navigation.navigate('CreatePackage')}
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#ffffff',
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border},
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16},
  headerTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text},
  listContainer: {
    padding: 16,
    paddingBottom: 40},
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'},
  card: {
    padding: 16,
    marginBottom: 14},
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12},
  destBox: {
    flexDirection: 'row',
    alignItems: 'center'},
  destText: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
    marginLeft: 6},
  dateText: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textMuted,
    marginBottom: 10},
  capacityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10},
  capacityLabel: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary},
  capacityVal: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text},
  vegBox: {
    flexDirection: 'row',
    backgroundColor: theme.colors.background,
    padding: 8,
    borderRadius: 8,
    marginBottom: 14},
  vegLabel: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textSecondary,
    marginRight: 4},
  vegVal: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    flex: 1},
  assignmentSummary: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  assignmentLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  assignmentSummaryText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginLeft: 8,
    flex: 1,
  },
  inlineRemoveDriverBtn: {
    padding: 4,
    borderRadius: 4,
    backgroundColor: '#fee2e2',
  },
  actionsPanel: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(226, 232, 240, 0.5)',
    paddingTop: 12},
  rowActions: {
    flexDirection: 'row',
    justifyContent: 'space-between'},
  cancelBtn: {
    width: '48%',
    height: 38,
    borderColor: theme.colors.error,
    borderWidth: 1},
  cancelText: {
    color: theme.colors.error,
    fontSize: theme.typography.sizes.xs},
  transitBtn: {
    width: '48%',
    height: 38,
    backgroundColor: theme.colors.secondary},
  deliverBtn: {
    height: 38,
    backgroundColor: theme.colors.primary}});

export default ManagePackagesScreen;
