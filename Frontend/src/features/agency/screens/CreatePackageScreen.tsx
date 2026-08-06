import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AgencyTabParamList } from '../../../navigation/types';
import { packageApi } from '../../../api/package.api';
import { driverApi } from '../../../api/driver.api';
import { createSuccess } from '../../../store/slices/packageSlice';
import { useDispatch } from 'react-redux';
import { theme } from '../../../theme';
import { Input, Button, Card, Loader } from '../../../components';
import { Ionicons } from '@expo/vector-icons';
import { VehicleResponse, DriverResponse } from '../../../store/slices/driverSlice';

type CreatePackageNavigationProp = NativeStackNavigationProp<AgencyTabParamList, 'CreatePackage'>;

interface Props {
  navigation: CreatePackageNavigationProp;
}

export const CreatePackageScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [fetchingFleet, setFetchingFleet] = useState(true);

  // Fleet & Drivers data
  const [availableVehicles, setAvailableVehicles] = useState<VehicleResponse[]>([]);
  const [activeDrivers, setActiveDrivers] = useState<DriverResponse[]>([]);

  // Selection
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleResponse | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<DriverResponse | null>(null);

  // Picker Modals visibility
  const [vehicleModalVisible, setVehicleModalVisible] = useState(false);
  const [driverModalVisible, setDriverModalVisible] = useState(false);

  // Form Fields
  const [marketDestination, setMarketDestination] = useState('');
  const [travelDate, setTravelDate] = useState(''); // input e.g. YYYY-MM-DD
  const [travelTime, setTravelTime] = useState(''); // input e.g. HH:MM
  const [pickupStart, setPickupStart] = useState('');
  const [pickupEnd, setPickupEnd] = useState('');
  const [totalCapacityKg, setTotalCapacityKg] = useState('');

  // Vegetable list
  const [vegetables, setVegetables] = useState<{ vegetableName: string; pricePerKg: string; maxKg: string }[]>([
    { vegetableName: 'Carrot', pricePerKg: '', maxKg: '' }
  ]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchFleetData = async () => {
      try {
        const vehiclesData = await driverApi.listVehicles();
        const driversData = await driverApi.listDrivers();

        setAvailableVehicles(vehiclesData.filter(v => v.availabilityStatus === 'AVAILABLE'));
        setActiveDrivers(driversData.filter(d => d.status === 'ACTIVE'));
      } catch (e: any) {
        console.log('Failed to fetch fleet lists. Falling back to empty lists.');
      } finally {
        setFetchingFleet(false);
      }
    };

    fetchFleetData();
  }, []);

  const handleAddVegetable = () => {
    setVegetables([...vegetables, { vegetableName: '', pricePerKg: '', maxKg: '' }]);
  };

  const handleRemoveVegetable = (index: number) => {
    if (vegetables.length === 1) return;
    setVegetables(vegetables.filter((_, i) => i !== index));
  };

  const handleVegChange = (index: number, key: 'vegetableName' | 'pricePerKg' | 'maxKg', value: string) => {
    const list = [...vegetables];
    list[index][key] = value;
    setVegetables(list);
  };

  const validate = () => {
    const tempErrors: Record<string, string> = {};
    if (!marketDestination.trim()) tempErrors.marketDestination = 'Market destination is required';
    if (!travelDate.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(travelDate)) {
      tempErrors.travelDate = 'Enter valid date format YYYY-MM-DD';
    }
    if (!travelTime.trim() || !/^\d{2}:\d{2}$/.test(travelTime)) {
      tempErrors.travelTime = 'Enter valid time format HH:MM';
    }
    if (!selectedVehicle) {
      tempErrors.vehicleSelection = 'Please select a fleet vehicle';
    }
    if (!totalCapacityKg || isNaN(Number(totalCapacityKg)) || Number(totalCapacityKg) <= 0) {
      tempErrors.totalCapacityKg = 'Enter a valid capacity weight (KG)';
    }

    // Validate vegetables list
    vegetables.forEach((veg, index) => {
      if (!veg.vegetableName.trim()) {
        tempErrors[`vegName_${index}`] = 'Required';
      }
      if (!veg.pricePerKg || isNaN(Number(veg.pricePerKg)) || Number(veg.pricePerKg) <= 0) {
        tempErrors[`vegPrice_${index}`] = 'Invalid';
      }
      if (!veg.maxKg || isNaN(Number(veg.maxKg)) || Number(veg.maxKg) <= 0) {
        tempErrors[`vegMax_${index}`] = 'Invalid';
      }
    });

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleCreate = async () => {
    if (!validate()) {
      Alert.alert('Form Errors', 'Please correct the highlighted form errors before listing the trip.');
      return;
    }
    setLoading(true);

    // Combine date & time to ISO
    const isoDateTime = `${travelDate}T${travelTime}:00.000Z`;

    // Combine pickup window dates
    const isoPickupStart = pickupStart ? `${travelDate}T${pickupStart}:00.000Z` : undefined;
    const isoPickupEnd = pickupEnd ? `${travelDate}T${pickupEnd}:00.000Z` : undefined;

    const formattedVegs = vegetables.map(v => ({
      vegetableName: v.vegetableName.trim(),
      pricePerKg: Number(v.pricePerKg),
      maxKg: Number(v.maxKg)
    }));

    try {
      const response = await packageApi.createPackage({
        marketDestination: marketDestination.trim(),
        travelDateTime: isoDateTime,
        pickupWindowStart: isoPickupStart,
        pickupWindowEnd: isoPickupEnd,
        vehicleId: selectedVehicle?.vehicleId,
        driverId: selectedDriver?.driverId || undefined,
        totalCapacityKg: Number(totalCapacityKg),
        vegetables: formattedVegs
      } as any); // Overrides type mapping dynamically

      dispatch(createSuccess(response));
      Alert.alert(
        'Trip Package Created',
        `Successfully listed transport trip to ${marketDestination} for ${travelDate}.`,
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('AgencyDashboard')
          },
        ]
      );
    } catch (e: any) {
      Alert.alert('Creation Failed', e.message || 'Could not create travel package.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectVehicle = (vehicle: VehicleResponse) => {
    setSelectedVehicle(vehicle);
    setTotalCapacityKg(String(vehicle.capacityKg)); // Auto-fill vehicle load capacity
    setVehicleModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Loader visible={loading} message="Creating travel package..." />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Travel Trip</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        {/* Core Info */}
        <Text style={styles.sectionHeader}>Trip Specifications</Text>
        <Card style={styles.formCard}>
          <Input
            label="Market Destination"
            placeholder="e.g. Colombo Manning Market, Dambulla"
            value={marketDestination}
            onChangeText={setMarketDestination}
            error={errors.marketDestination}
            icon={<Ionicons name="location-outline" size={20} color={theme.colors.textMuted} />}
          />
          <View style={styles.row}>
            <Input
              label="Travel Date (YYYY-MM-DD)"
              placeholder="2026-07-15"
              value={travelDate}
              onChangeText={setTravelDate}
              error={errors.travelDate}
              containerStyle={styles.half}
              icon={<Ionicons name="calendar-outline" size={20} color={theme.colors.textMuted} />}
            />
            <Input
              label="Travel Time (HH:MM)"
              placeholder="22:30"
              value={travelTime}
              onChangeText={setTravelTime}
              error={errors.travelTime}
              containerStyle={styles.half}
              icon={<Ionicons name="time-outline" size={20} color={theme.colors.textMuted} />}
            />
          </View>
          <View style={styles.row}>
            <Input
              label="Pickup Start (HH:MM)"
              placeholder="15:00"
              value={pickupStart}
              onChangeText={setPickupStart}
              containerStyle={styles.half}
              icon={<Ionicons name="hourglass-outline" size={20} color={theme.colors.textMuted} />}
            />
            <Input
              label="Pickup End (HH:MM)"
              placeholder="18:30"
              value={pickupEnd}
              onChangeText={setPickupEnd}
              containerStyle={styles.half}
              icon={<Ionicons name="hourglass-outline" size={20} color={theme.colors.textMuted} />}
            />
          </View>
        </Card>

        {/* Fleet vehicle selection */}
        <Text style={styles.sectionHeader}>Fleet & Driver Assignment</Text>
        <Card style={styles.formCard}>
          <Text style={styles.selectorLabel}>Select Fleet Lorry</Text>
          <TouchableOpacity
            style={[styles.pickerTrigger, errors.vehicleSelection && styles.pickerTriggerError]}
            onPress={() => setVehicleModalVisible(true)}
          >
            <View style={styles.pickerContent}>
              <Ionicons name="bus-outline" size={20} color={theme.colors.secondary} />
              <Text style={selectedVehicle ? styles.pickerText : styles.pickerTextPlaceholder}>
                {selectedVehicle
                  ? `${selectedVehicle.plateNumber} (${selectedVehicle.vehicleTypeLabel})`
                  : 'Choose a registered vehicle...'}
              </Text>
              <Ionicons name="chevron-down" size={16} color={theme.colors.textMuted} />
            </View>
          </TouchableOpacity>
          {errors.vehicleSelection && (
            <Text style={styles.errorLabel}>{errors.vehicleSelection}</Text>
          )}

          <Text style={[styles.selectorLabel, { marginTop: 14 }]}>Assign Driver (Optional)</Text>
          <TouchableOpacity
            style={styles.pickerTrigger}
            onPress={() => setDriverModalVisible(true)}
          >
            <View style={styles.pickerContent}>
              <Ionicons name="person-outline" size={20} color={theme.colors.secondary} />
              <Text style={selectedDriver ? styles.pickerText : styles.pickerTextPlaceholder}>
                {selectedDriver ? selectedDriver.fullName : 'Choose an active driver...'}
              </Text>
              <Ionicons name="chevron-down" size={16} color={theme.colors.textMuted} />
            </View>
          </TouchableOpacity>

          <Input
            label="Total Transport Capacity (KG)"
            placeholder="e.g. 5000"
            keyboardType="numeric"
            value={totalCapacityKg}
            onChangeText={setTotalCapacityKg}
            error={errors.totalCapacityKg}
            icon={<Ionicons name="scale-outline" size={20} color={theme.colors.textMuted} />}
          />
        </Card>

        {/* Crops configuration */}
        <View style={styles.vegSectionHeaderRow}>
          <Text style={styles.sectionHeader}>Accepted Vegetables & Pricing</Text>
          <TouchableOpacity onPress={handleAddVegetable}>
            <Text style={styles.addVegText}>+ Add Vegetable</Text>
          </TouchableOpacity>
        </View>

        {vegetables.map((veg, index) => (
          <Card key={index} style={styles.vegCard}>
            <View style={styles.vegCardHeader}>
              <Text style={styles.vegIndexLabel}>Crop Entry #{index + 1}</Text>
              {vegetables.length > 1 && (
                <TouchableOpacity onPress={() => handleRemoveVegetable(index)}>
                  <Ionicons name="trash" size={18} color={theme.colors.error} />
                </TouchableOpacity>
              )}
            </View>

            <Input
              label="Vegetable Type"
              placeholder="e.g. Carrot, Potato, Leeks"
              value={veg.vegetableName}
              onChangeText={(val: string) => handleVegChange(index, 'vegetableName', val)}
              error={errors[`vegName_${index}`]}
            />

            <View style={styles.row}>
              <Input
                label="Price / kg (Rs.)"
                placeholder="240"
                keyboardType="numeric"
                value={veg.pricePerKg}
                onChangeText={(val: string) => handleVegChange(index, 'pricePerKg', val)}
                error={errors[`vegPrice_${index}`]}
                containerStyle={styles.half}
              />
              <Input
                label="Max Load Limit (kg)"
                placeholder="2000"
                keyboardType="numeric"
                value={veg.maxKg}
                onChangeText={(val: string) => handleVegChange(index, 'maxKg', val)}
                error={errors[`vegMax_${index}`]}
                containerStyle={styles.half}
              />
            </View>
          </Card>
        ))}

        <Button
          title="Create & List Trip Package"
          onPress={handleCreate}
          style={styles.createBtn}
          variant="secondary"
        />
      </ScrollView>

      {/* Vehicles Modal Selection */}
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
                <View style={styles.modalEmpty}>
                  <Text style={styles.modalEmptyText}>No available fleet vehicles registered.</Text>
                  <Button
                    title="Register New Lorry"
                    variant="secondary"
                    onPress={() => {
                      setVehicleModalVisible(false);
                      navigation.navigate('AddVehicle');
                    }}
                  />
                </View>
              }
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => handleSelectVehicle(item)}
                >
                  <View style={{ flex: 1 }}>
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

      {/* Drivers Modal Selection */}
      <Modal
        visible={driverModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setDriverModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Assign Driver (Optional)</Text>
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
                <View style={styles.modalEmpty}>
                  <Text style={styles.modalEmptyText}>No active drivers found.</Text>
                  <Button
                    title="Register New Driver"
                    variant="secondary"
                    onPress={() => {
                      setDriverModalVisible(false);
                      navigation.navigate('AddDriver');
                    }}
                  />
                </View>
              }
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => {
                    setSelectedDriver(item);
                    setDriverModalVisible(false);
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.modalItemTitle}>{item.fullName}</Text>
                    <Text style={styles.modalItemSub}>
                      Licence: {item.licenceClass} · {item.phone}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
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
    marginRight: 16,
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
  sectionHeader: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
    marginTop: 10,
    marginBottom: 12,
  },
  formCard: {
    padding: 16,
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  half: {
    width: '48%',
  },
  selectorLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  pickerTrigger: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f8fafc',
    marginBottom: 12,
  },
  pickerTriggerError: {
    borderColor: theme.colors.error,
  },
  pickerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pickerText: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text,
    flex: 1,
    marginLeft: 10,
  },
  pickerTextPlaceholder: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textMuted,
    flex: 1,
    marginLeft: 10,
  },
  errorLabel: {
    color: theme.colors.error,
    fontSize: 10,
    marginTop: -8,
    marginBottom: 10,
  },
  vegSectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  addVegText: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.secondaryDark,
  },
  vegCard: {
    padding: 14,
    marginBottom: 12,
  },
  vegCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  vegIndexLabel: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textMuted,
  },
  createBtn: {
    backgroundColor: theme.colors.secondary,
    marginTop: 20,
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
    marginBottom: 15,
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
  modalEmpty: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  modalEmptyText: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.sizes.sm,
    marginBottom: 15,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border + '50',
    paddingVertical: 14,
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

export default CreatePackageScreen;
