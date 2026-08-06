import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AgencyTabParamList } from '../../../navigation/types';
import { useDispatch } from 'react-redux';
import { driverApi } from '../../../api/driver.api';
import { removeVehicleSuccess, updateVehicleSuccess } from '../../../store/slices/driverSlice';
import { theme } from '../../../theme';
import { Card, Button, StatusBadge } from '../../../components';
import { Ionicons } from '@expo/vector-icons';
import { VehicleResponse } from '../../../store/slices/driverSlice';

type Route = RouteProp<AgencyTabParamList, 'VehicleDetail'>;
type Navigation = NativeStackNavigationProp<AgencyTabParamList, 'VehicleDetail'>;

type Props = {
  route: Route;
  navigation: Navigation;
};

export const VehicleDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { vehicleId } = route.params;
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [vehicle, setVehicle] = useState<VehicleResponse | null>(null);

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const data = await driverApi.getVehicle(vehicleId);
      setVehicle(data);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Could not load vehicle details.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [vehicleId]);

  const handleMaintenanceToggle = async () => {
    if (!vehicle) return;

    const isMaintenance = vehicle.availabilityStatus === 'UNDER_MAINTENANCE';
    const newStatus = isMaintenance ? 'AVAILABLE' : 'UNDER_MAINTENANCE';

    try {
      setLoading(true);
      const response = await driverApi.updateVehicle(vehicleId, {
        availabilityStatus: newStatus as any,
      });
      setVehicle(response);
      dispatch(updateVehicleSuccess(response));
      Alert.alert(
        'Success',
        `Vehicle status updated to ${isMaintenance ? 'Available' : 'Under Maintenance'}.`
      );
    } catch (e: any) {
      Alert.alert('Update Failed', e.message || 'Could not change vehicle status.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    if (!vehicle) return;

    Alert.alert(
      'Remove Vehicle',
      `Are you sure you want to remove vehicle ${vehicle.plateNumber} from your fleet?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              const msg = await driverApi.removeVehicle(vehicleId);
              dispatch(removeVehicleSuccess(vehicleId));
              Alert.alert('Removed', msg || 'Vehicle removed successfully.', [
                { text: 'OK', onPress: () => navigation.goBack() },
              ]);
            } catch (e: any) {
              // Handle conflict case when vehicle is assigned
              Alert.alert('Cannot Remove Vehicle', e.message || 'Vehicle is currently assigned to an active package.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  if (loading && !vehicle) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.secondary} />
      </SafeAreaView>
    );
  }

  if (!vehicle) return null;

  const isAssigned = vehicle.availabilityStatus === 'ASSIGNED';
  const isMaintenance = vehicle.availabilityStatus === 'UNDER_MAINTENANCE';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Vehicle Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Plate Card */}
        <Card style={styles.plateCard}>
          <View style={styles.iconBoxLarge}>
            <Ionicons name="bus" size={48} color={theme.colors.secondary} />
          </View>
          <Text style={styles.plateNumber}>{vehicle.plateNumber}</Text>
          <View style={styles.statusRow}>
            <StatusBadge status={vehicle.availabilityStatus} />
          </View>
        </Card>

        {/* Specifications */}
        <Text style={styles.sectionHeader}>Specifications</Text>
        <Card style={styles.detailsCard}>
          <View style={styles.infoRow}>
            <Ionicons name="car-outline" size={20} color={theme.colors.textMuted} />
            <View style={styles.infoCol}>
              <Text style={styles.infoLabel}>Vehicle Type</Text>
              <Text style={styles.infoVal}>{vehicle.vehicleTypeLabel}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="scale-outline" size={20} color={theme.colors.textMuted} />
            <View style={styles.infoCol}>
              <Text style={styles.infoLabel}>Total Load Capacity</Text>
              <Text style={styles.infoVal}>{vehicle.capacityKg.toLocaleString()} kg</Text>
            </View>
          </View>
        </Card>

        {/* Operations */}
        <Text style={styles.sectionHeader}>Fleet Status Controls</Text>
        <Card style={styles.detailsCard}>
          {isAssigned ? (
            <View style={styles.assignedMessage}>
              <Ionicons name="information-circle-outline" size={20} color={theme.colors.info} />
              <Text style={styles.assignedText}>
                This vehicle is currently assigned to a transport trip and status cannot be updated.
              </Text>
            </View>
          ) : (
            <Button
              title={isMaintenance ? 'Clear Maintenance & Make Available' : 'Mark Under Maintenance'}
              onPress={handleMaintenanceToggle}
              variant={isMaintenance ? 'secondary' : 'danger'}
            />
          )}
        </Card>

        {/* Remove Vehicle Option */}
        {!isAssigned && (
          <Button
            title="Remove Vehicle from Fleet"
            onPress={handleDelete}
            variant="danger"
            style={styles.deleteBtn}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  headerTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  plateCard: {
    alignItems: 'center',
    padding: 24,
    marginBottom: 20,
  },
  iconBoxLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.secondary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  plateNumber: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
    marginBottom: 8,
  },
  statusRow: {
    flexDirection: 'row',
  },
  sectionHeader: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
    marginTop: 10,
    marginBottom: 12,
  },
  detailsCard: {
    padding: 16,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoCol: {
    marginLeft: 14,
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    color: theme.colors.textMuted,
    fontWeight: theme.typography.weights.semibold,
    textTransform: 'uppercase',
  },
  infoVal: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text,
    marginTop: 2,
  },
  assignedMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  assignedText: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    marginLeft: 8,
    flex: 1,
    lineHeight: 18,
  },
  deleteBtn: {
    marginTop: 10,
    backgroundColor: theme.colors.error,
  },
});

export default VehicleDetailScreen;
