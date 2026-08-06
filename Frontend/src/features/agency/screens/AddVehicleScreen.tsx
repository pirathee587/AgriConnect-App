import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AgencyTabParamList } from '../../../navigation/types';
import { useDispatch } from 'react-redux';
import { driverApi } from '../../../api/driver.api';
import { addVehicleSuccess } from '../../../store/slices/driverSlice';
import { theme } from '../../../theme';
import { Input, Button, Card, Loader } from '../../../components';
import { Ionicons } from '@expo/vector-icons';
import { VehicleType } from '../../../store/slices/driverSlice';

type Props = {
  navigation: NativeStackNavigationProp<AgencyTabParamList, 'AddVehicle'>;
};

const VEHICLE_TYPES: { label: string; value: VehicleType }[] = [
  { label: 'Lorry', value: 'LORRY' },
  { label: 'Truck', value: 'TRUCK' },
  { label: 'Mini Truck', value: 'MINI_TRUCK' },
  { label: 'Van', value: 'VAN' },
  { label: 'Pickup', value: 'PICKUP' },
];

export const AddVehicleScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  // Form Fields
  const [vehicleType, setVehicleType] = useState<VehicleType>('LORRY');
  const [plateNumber, setPlateNumber] = useState('');
  const [capacityKg, setCapacityKg] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const tempErrors: Record<string, string> = {};
    if (!plateNumber.trim()) tempErrors.plateNumber = 'License plate number is required';
    if (!capacityKg.trim() || isNaN(Number(capacityKg)) || Number(capacityKg) <= 0) {
      tempErrors.capacityKg = 'Enter a valid load capacity weight (KG)';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) {
      Alert.alert('Form Errors', 'Please correct the errors in the form.');
      return;
    }
    setLoading(true);

    try {
      const response = await driverApi.addVehicle({
        vehicleType,
        plateNumber: plateNumber.toUpperCase().trim(),
        capacityKg: Number(capacityKg),
      });

      dispatch(addVehicleSuccess(response));
      Alert.alert(
        'Success',
        `Successfully registered vehicle ${plateNumber.toUpperCase()} to your fleet.`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (e: any) {
      Alert.alert('Registration Failed', e.message || 'Could not register vehicle.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Loader visible={loading} message="Registering vehicle..." />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add New Vehicle</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <Text style={styles.sectionHeader}>Vehicle Specifications</Text>
        <Card style={styles.formCard}>
          <Text style={styles.selectorLabel}>Vehicle Type</Text>
          <View style={styles.typeOptions}>
            {VEHICLE_TYPES.map((type) => (
              <TouchableOpacity
                key={type.value}
                style={[
                  styles.typeButton,
                  vehicleType === type.value && styles.typeActive,
                ]}
                onPress={() => setVehicleType(type.value)}
              >
                <Text
                  style={[
                    styles.typeText,
                    vehicleType === type.value && styles.typeTextActive,
                  ]}
                >
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Input
            label="License Plate Number"
            placeholder="e.g. WP ND-1249"
            autoCapitalize="characters"
            value={plateNumber}
            onChangeText={setPlateNumber}
            error={errors.plateNumber}
            icon={<Ionicons name="barcode-outline" size={20} color={theme.colors.textMuted} />}
          />

          <Input
            label="Load Capacity (KG)"
            placeholder="e.g. 3000"
            keyboardType="numeric"
            value={capacityKg}
            onChangeText={setCapacityKg}
            error={errors.capacityKg}
            icon={<Ionicons name="scale-outline" size={20} color={theme.colors.textMuted} />}
          />
        </Card>

        <Button title="Register Vehicle" onPress={handleRegister} style={styles.submitBtn} variant="secondary" />
      </ScrollView>
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
  selectorLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: 8,
  },
  typeOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  typeButton: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  typeActive: {
    borderColor: theme.colors.secondary,
    backgroundColor: theme.colors.secondary + '10',
  },
  typeText: {
    fontSize: 12,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.textSecondary,
  },
  typeTextActive: {
    color: theme.colors.secondaryDark,
    fontWeight: theme.typography.weights.bold,
  },
  submitBtn: {
    backgroundColor: theme.colors.secondary,
    marginTop: 10,
  },
});

export default AddVehicleScreen;
