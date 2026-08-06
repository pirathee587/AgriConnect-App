import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AgencyTabParamList } from '../../../navigation/types';
import { driverApi } from '../../../api/driver.api';
import { packageApi } from '../../../api/package.api';
import { theme } from '../../../theme';
import { Card, Button } from '../../../components';
import { Ionicons } from '@expo/vector-icons';
import { DriverResponse, VehicleResponse } from '../../../store/slices/driverSlice';

type Route = RouteProp<AgencyTabParamList, 'AssignDriver'>;
type Navigation = NativeStackNavigationProp<AgencyTabParamList, 'AssignDriver'>;

type Props = {
  route: Route;
  navigation: Navigation;
};

export const AssignDriverScreen: React.FC<Props> = ({ route, navigation }) => {
  const { packageId } = route.params;
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Data
  const [availableVehicles, setAvailableVehicles] = useState<VehicleResponse[]>([]);
  const [activeDrivers, setActiveDrivers] = useState<DriverResponse[]>([]);

  // Selection state
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleResponse | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<DriverResponse | null>(null);

  // Modals visibility
  const [vehicleModalVisible, setVehicleModalVisible] = useState(false);
  const [driverModalVisible, setDriverModalVisible] = useState(false);

  useEffect(() => {
    const loadFleetAndDrivers = async () => {
      try {
        const vehiclesData = await driverApi.listVehicles();
        const driversData = await driverApi.listDrivers();

        // Filter: only show AVAILABLE vehicles, and ACTIVE drivers
        setAvailableVehicles(vehiclesData.filter((v) => v.availabilityStatus === 'AVAILABLE'));
        setActiveDrivers(driversData.filter((d) => d.status === 'ACTIVE'));
      } catch (e: any) {
        Alert.alert('Error', 'Could not load fleet or driver list.');
      } finally {
        setFetching(false);
      }
    };

    loadFleetAndDrivers();
  }, []);

  const handleAssign = async () => {
    if (!selectedVehicle) {
      Alert.alert('Selection Required', 'Please select a vehicle to assign.');
      return;
    }
    setLoading(true);

    try {
      await packageApi.assignToPackage(packageId, {
        vehicleId: selectedVehicle.vehicleId,
        driverId: selectedDriver ? selectedDriver.driverId : undefined,
      });

      Alert.alert(
        'Success',
        'Fleet vehicle and driver assigned successfully.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (e: any) {
      Alert.alert('Assignment Failed', e.message || 'Could not assign fleet to the package.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.secondary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Assign Fleet & Driver</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Step 1: Vehicle Select */}
        <Text style={styles.stepTitle}>Step 1: Select Fleet Vehicle</Text>
        <TouchableOpacity
          style={styles.pickerTrigger}
          onPress={() => setVehicleModalVisible(true)}
        >
          <View style={styles.pickerContent}>
            <Ionicons name="bus-outline" size={24} color={theme.colors.secondary} />
            <View style={styles.pickerTextCol}>
              {selectedVehicle ? (
                <>
                  <Text style={styles.selectedPlate}>{selectedVehicle.plateNumber}</Text>
                  <Text style={styles.selectedSub}>
                    {selectedVehicle.vehicleTypeLabel} · {selectedVehicle.capacityKg.toLocaleString()} kg
                  </Text>
                </>
              ) : (
                <Text style={styles.placeholderText}>Choose an available vehicle...</Text>
              )}
            </View>
            <Ionicons name="chevron-down" size={20} color={theme.colors.textMuted} />
          </View>
        </TouchableOpacity>

        {/* Step 2: Driver Select */}
        <Text style={styles.stepTitle}>Step 2: Select Driver (Optional)</Text>
        <TouchableOpacity
          style={styles.pickerTrigger}
          onPress={() => setDriverModalVisible(true)}
        >
          <View style={styles.pickerContent}>
            <Ionicons name="person-outline" size={24} color={theme.colors.secondary} />
            <View style={styles.pickerTextCol}>
              {selectedDriver ? (
                <>
                  <Text style={styles.selectedPlate}>{selectedDriver.fullName}</Text>
                  <Text style={styles.selectedSub}>
                    Licence: {selectedDriver.licenceClass} · {selectedDriver.phone}
                  </Text>
                </>
              ) : (
                <Text style={styles.placeholderText}>Choose an active driver...</Text>
              )}
            </View>
            <Ionicons name="chevron-down" size={20} color={theme.colors.textMuted} />
          </View>
        </TouchableOpacity>

        {selectedDriver && selectedDriver.nicStatus === 'NIC_NOT_PROVIDED' && (
          <Card style={styles.warningCard}>
            <Ionicons name="warning-outline" size={20} color={theme.colors.warning} />
            <Text style={styles.warningText}>
              WARNING: This driver has not submitted their NIC yet. You can still assign them, but ensure you collect it before departure.
            </Text>
          </Card>
        )}

        <Button
          title={loading ? "Assigning..." : "Confirm Assignment"}
          onPress={handleAssign}
          disabled={loading || !selectedVehicle}
          style={styles.assignBtn}
          variant="secondary"
        />
      </ScrollView>

      {/* Vehicle Selection Modal */}
      <Modal
        visible={vehicleModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setVehicleModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Available Vehicle</Text>
              <TouchableOpacity onPress={() => setVehicleModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={availableVehicles}
              keyExtractor={(item) => String(item.vehicleId)}
              ListEmptyComponent={
                <Text style={styles.modalEmptyText}>No available vehicles in your fleet.</Text>
              }
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => {
                    setSelectedVehicle(item);
                    setVehicleModalVisible(false);
                  }}
                >
                  <View style={styles.modalItemTextContainer}>
                    <Text style={styles.modalItemTitle}>{item.plateNumber}</Text>
                    <Text style={styles.modalItemSub}>
                      {item.vehicleTypeLabel} · Capacity: {item.capacityKg.toLocaleString()} kg
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Driver Selection Modal */}
      <Modal
        visible={driverModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setDriverModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Active Driver</Text>
              <TouchableOpacity onPress={() => {
                setSelectedDriver(null);
                setDriverModalVisible(false);
              }}>
                <Text style={styles.clearSelectText}>Clear</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={activeDrivers}
              keyExtractor={(item) => String(item.driverId)}
              ListEmptyComponent={
                <Text style={styles.modalEmptyText}>No active drivers found.</Text>
              }
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => {
                    setSelectedDriver(item);
                    setDriverModalVisible(false);
                  }}
                >
                  <View style={styles.modalItemTextContainer}>
                    <Text style={styles.modalItemTitle}>{item.fullName}</Text>
                    <Text style={styles.modalItemSub}>
                      Licence: {item.licenceClass} · NIC: {item.nicStatusLabel}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
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
  stepTitle: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textSecondary,
    marginTop: 20,
    marginBottom: 10,
  },
  pickerTrigger: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
  },
  pickerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pickerTextCol: {
    flex: 1,
    marginLeft: 14,
  },
  placeholderText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textMuted,
  },
  selectedPlate: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
  },
  selectedSub: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  warningCard: {
    backgroundColor: theme.colors.warning + '10',
    borderColor: theme.colors.warning,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginTop: 15,
    marginBottom: 10,
  },
  warningText: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginLeft: 10,
    flex: 1,
    lineHeight: 16,
  },
  assignBtn: {
    backgroundColor: theme.colors.secondary,
    marginTop: 30,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingBottom: 15,
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
  },
  clearSelectText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.error,
    fontWeight: theme.typography.weights.semibold,
  },
  modalEmptyText: {
    textAlign: 'center',
    color: theme.colors.textMuted,
    marginTop: 30,
    marginBottom: 30,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border + '50',
    paddingVertical: 14,
  },
  modalItemTextContainer: {
    flex: 1,
  },
  modalItemTitle: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
  },
  modalItemSub: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
});

export default AssignDriverScreen;
