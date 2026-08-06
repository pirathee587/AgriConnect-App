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
import { addDriverSuccess } from '../../../store/slices/driverSlice';
import { theme } from '../../../theme';
import { Input, Button, Card, Loader } from '../../../components';
import { Ionicons } from '@expo/vector-icons';
import { NicStatus } from '../../../store/slices/driverSlice';

type Props = {
  navigation: NativeStackNavigationProp<AgencyTabParamList, 'AddDriver'>;
};

export const AddDriverScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [licenceNumber, setLicenceNumber] = useState('');
  const [licenceClass, setLicenceClass] = useState('B1'); // Default licence class
  const [nicStatus, setNicStatus] = useState<NicStatus>('NIC_NOT_PROVIDED');

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const tempErrors: Record<string, string> = {};
    if (!fullName.trim()) tempErrors.fullName = 'Full name is required';
    if (!phone.trim()) tempErrors.phone = 'Phone number is required';
    if (!licenceNumber.trim()) tempErrors.licenceNumber = 'Licence number is required';
    if (!licenceClass.trim()) tempErrors.licenceClass = 'Licence class is required';

    if (email.trim() && !/\S+@\S+\.\S+/.test(email)) {
      tempErrors.email = 'Enter a valid email address';
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
      const response = await driverApi.registerDriver({
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim() ? email.trim() : undefined,
        licenceNumber: licenceNumber.trim(),
        licenceClass: licenceClass.trim(),
        nicStatus,
      });

      dispatch(addDriverSuccess(response));
      Alert.alert(
        'Success',
        `Successfully registered driver ${fullName}.`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (e: any) {
      Alert.alert('Registration Failed', e.message || 'Could not register driver.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Loader visible={loading} message="Registering driver..." />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add New Driver</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <Text style={styles.sectionHeader}>Driver Information</Text>
        <Card style={styles.formCard}>
          <Input
            label="Full Name"
            placeholder="e.g. Kamal Perera"
            value={fullName}
            onChangeText={setFullName}
            error={errors.fullName}
            icon={<Ionicons name="person-outline" size={20} color={theme.colors.textMuted} />}
          />

          <Input
            label="Phone Number"
            placeholder="e.g. 0712345678"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
            error={errors.phone}
            icon={<Ionicons name="call-outline" size={20} color={theme.colors.textMuted} />}
          />

          <Input
            label="Email Address (Optional)"
            placeholder="e.g. kamal@gmail.com"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            error={errors.email}
            icon={<Ionicons name="mail-outline" size={20} color={theme.colors.textMuted} />}
          />

          <Input
            label="Licence Number"
            placeholder="e.g. B1234567"
            value={licenceNumber}
            onChangeText={setLicenceNumber}
            error={errors.licenceNumber}
            icon={<Ionicons name="card-outline" size={20} color={theme.colors.textMuted} />}
          />

          <Input
            label="Licence Class"
            placeholder="e.g. B1, C1, CE"
            value={licenceClass}
            onChangeText={setLicenceClass}
            error={errors.licenceClass}
            icon={<Ionicons name="options-outline" size={20} color={theme.colors.textMuted} />}
          />
        </Card>

        <Text style={styles.sectionHeader}>National Identity Card (NIC)</Text>
        <Card style={styles.formCard}>
          <Text style={styles.label}>Has the driver provided their NIC to your office?</Text>
          <View style={styles.radioContainer}>
            <TouchableOpacity
              style={[
                styles.radioButton,
                nicStatus === 'NIC_PROVIDED' && styles.radioActive,
              ]}
              onPress={() => setNicStatus('NIC_PROVIDED')}
            >
              <Ionicons
                name={nicStatus === 'NIC_PROVIDED' ? 'checkbox' : 'square-outline'}
                size={20}
                color={nicStatus === 'NIC_PROVIDED' ? theme.colors.success : theme.colors.textMuted}
              />
              <Text
                style={[
                  styles.radioText,
                  nicStatus === 'NIC_PROVIDED' && styles.radioTextActive,
                ]}
              >
                Yes, NIC Provided
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.radioButton,
                nicStatus === 'NIC_NOT_PROVIDED' && styles.radioActive,
              ]}
              onPress={() => setNicStatus('NIC_NOT_PROVIDED')}
            >
              <Ionicons
                name={nicStatus === 'NIC_NOT_PROVIDED' ? 'checkbox' : 'square-outline'}
                size={20}
                color={nicStatus === 'NIC_NOT_PROVIDED' ? theme.colors.warning : theme.colors.textMuted}
              />
              <Text
                style={[
                  styles.radioText,
                  nicStatus === 'NIC_NOT_PROVIDED' && styles.radioTextActive,
                ]}
              >
                No, NIC Not Yet Provided
              </Text>
            </TouchableOpacity>
          </View>
        </Card>

        <Button title="Register Driver" onPress={handleRegister} style={styles.submitBtn} variant="secondary" />
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
  label: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textSecondary,
    marginBottom: 16,
  },
  radioContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    padding: 12,
    width: '48%',
  },
  radioActive: {
    borderColor: theme.colors.secondary,
    backgroundColor: theme.colors.secondary + '05',
  },
  radioText: {
    fontSize: 12,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.textSecondary,
    marginLeft: 8,
  },
  radioTextActive: {
    color: theme.colors.text,
    fontWeight: theme.typography.weights.bold,
  },
  submitBtn: {
    backgroundColor: theme.colors.secondary,
    marginTop: 10,
  },
});

export default AddDriverScreen;
