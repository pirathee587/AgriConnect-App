import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert, 
  Modal 
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FarmerTabParamList } from '../../../navigation/types';
import { farmerApi } from '../../../api/farmer.api';
import { bookingApi } from '../../../api/booking.api';
import { confirmBookingSuccessRedux } from '../../../store/slices/bookingSlice';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { theme } from '../../../theme';
import { Input, Button, Loader, OtpInput, Card } from '../../../components';
import { Ionicons } from '@expo/vector-icons';

type BookingFormRouteProp = RouteProp<FarmerTabParamList, 'BookingForm'>;
type BookingFormNavigationProp = NativeStackNavigationProp<FarmerTabParamList, 'BookingForm'>;

interface Props {
  route: BookingFormRouteProp;
  navigation: BookingFormNavigationProp;
}

export const BookingFormScreen: React.FC<Props> = ({ route, navigation }) => {
  const { packageId, vegetableName, initialPrice } = route.params;
  const dispatch = useDispatch();

  const [weightKg, setWeightKg] = useState('');
  const [pickupAddress, setPickupAddress] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // OTP Verification modal state
  const [otpVisible, setOtpVisible] = useState(false);
  const [otpCode, setOtpCode] = useState('');

  // Prefill bank details & profile address
  const fetchDefaults = async () => {
    setLoading(true);
    try {
      const profile = await farmerApi.getProfile();
      if (profile.address) setPickupAddress(profile.address);
      if (profile.bankName) setBankName(profile.bankName);
      if (profile.accountHolderName) setAccountHolderName(profile.accountHolderName);
      
      const bank = await farmerApi.getBankDetail();
      if (bank) {
        if (bank.bankName) setBankName(bank.bankName);
        if (bank.accountHolderName) setAccountHolderName(bank.accountHolderName);
        // Bank details return masked account number from backend, so we don't overwrite if empty
      }
    } catch (e) {
      console.log('No default bank details found, user will input.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDefaults();
  }, []);

  const totalValue = Number(weightKg) ? Number(weightKg) * initialPrice : 0;

  const validate = () => {
    const tempErrors: Record<string, string> = {};
    if (!weightKg) {
      tempErrors.weightKg = 'Weight is required';
    } else if (isNaN(Number(weightKg)) || Number(weightKg) <= 0) {
      tempErrors.weightKg = 'Weight must be a positive number';
    }

    if (!pickupAddress.trim()) tempErrors.pickupAddress = 'Pickup location address is required';
    if (!bankName.trim()) tempErrors.bankName = 'Bank name is required';
    if (!accountNumber.trim()) tempErrors.accountNumber = 'Account number is required';
    if (!accountHolderName.trim()) tempErrors.accountHolderName = 'Account holder name is required';

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  // Step 1: Initiate Booking (Sends OTP)
  const handleInitiate = async () => {
    if (!validate()) return;
    setLoading(true);

    try {
      const msg = await bookingApi.initiateBooking({
        packageId,
        vegetableName,
        weightKg: Number(weightKg),
        pickupAddress,
        bankName,
        accountNumber,
        accountHolderName});

      // Show OTP verification modal
      setOtpVisible(true);
    } catch (e: any) {
      Alert.alert('Booking Failed', e.message || 'Could not initiate booking.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP & Commit Booking
  const handleVerifyOtp = async () => {
    if (otpCode.length < 6) {
      Alert.alert('Incomplete Code', 'Please enter the 6-digit OTP verification code.');
      return;
    }

    setLoading(true);
    try {
      const bookingRes = await bookingApi.confirmBooking({
        packageId,
        vegetableName,
        weightKg: Number(weightKg),
        pickupAddress,
        bankName,
        accountNumber,
        accountHolderName,
        otp: otpCode});

      // Optionally save bank details in backend
      try {
        await farmerApi.saveOrUpdateBankDetail({
          bankName,
          accountNumber,
          accountHolderName});
      } catch (bankErr) {
        console.warn('Failed to persist bank detail profile:', bankErr);
      }

      dispatch(confirmBookingSuccessRedux(bookingRes));
      setOtpVisible(false);
      
      Alert.alert(
        'Booking Confirmed',
        `Trips booked: ${vegetableName} (${weightKg} kg) to ${bookingRes.marketDestination}.\n\nAgency: ${bookingRes.agencyName} (${bookingRes.agencyPhone}).\nPickup schedule is confirmed.`,
        [
          {
            text: 'View Bookings',
            onPress: () => navigation.replace('MyBookings')},
        ]
      );
    } catch (e: any) {
      Alert.alert('Verification Failed', e.message || 'Incorrect OTP code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Loader visible={loading} message="Processing..." />
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Confirm Booking</Text>
        </View>

        {/* Selected Crop summary */}
        <Card style={styles.cropCard}>
          <Text style={styles.cropLabel}>Selected Crop</Text>
          <Text style={styles.cropName}>{vegetableName}</Text>
          <View style={styles.priceMeta}>
            <Text style={styles.priceMetaText}>Market Price: Rs. {initialPrice} / kg</Text>
          </View>
        </Card>

        {/* Form */}
        <Text style={styles.sectionTitle}>1. Transport Load (KG)</Text>
        <Input
          label="Weight to Transport (kg)"
          placeholder="e.g. 150"
          keyboardType="numeric"
          value={weightKg}
          onChangeText={setWeightKg}
          error={errors.weightKg}
          icon={<Ionicons name="scale-outline" size={20} color={theme.colors.textMuted} />}
        />

        <Text style={styles.sectionTitle}>2. Pickup Location</Text>
        <Input
          label="Detailed Pickup Address"
          placeholder="Enter address where agency should pick up vegetables"
          multiline
          numberOfLines={2}
          value={pickupAddress}
          onChangeText={setPickupAddress}
          error={errors.pickupAddress}
          icon={<Ionicons name="location-outline" size={20} color={theme.colors.textMuted} />}
          containerStyle={styles.multilineInputContainer}
        />

        <Text style={styles.sectionTitle}>3. Bank Account for Payment</Text>
        <Text style={styles.sectionDesc}>Payments from market sales will be wired directly to this account.</Text>
        <Input
          label="Bank Name"
          placeholder="e.g. People's Bank"
          value={bankName}
          onChangeText={setBankName}
          error={errors.bankName}
          icon={<Ionicons name="business-outline" size={20} color={theme.colors.textMuted} />}
        />
        <Input
          label="Account Number"
          placeholder="Enter your bank account digits"
          keyboardType="numeric"
          value={accountNumber}
          onChangeText={setAccountNumber}
          error={errors.accountNumber}
          icon={<Ionicons name="card-outline" size={20} color={theme.colors.textMuted} />}
        />
        <Input
          label="Account Holder Name"
          placeholder="Name on bank passbook"
          value={accountHolderName}
          onChangeText={setAccountHolderName}
          error={errors.accountHolderName}
          icon={<Ionicons name="person-outline" size={20} color={theme.colors.textMuted} />}
        />

        {/* Cost estimate details */}
        {totalValue > 0 && (
          <Card style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Expected Load Value</Text>
              <Text style={styles.summaryValue}>Rs. {totalValue.toLocaleString()}</Text>
            </View>
            <Text style={styles.summarySub}>*Final payout is determined at market sales.</Text>
          </Card>
        )}

        <Button 
          title="Initiate Booking (Sends SMS OTP)" 
          onPress={handleInitiate} 
          style={styles.bookButton}
        />

        {/* OTP VERIFICATION MODAL OVERLAY */}
        <Modal transparent visible={otpVisible} animationType="slide">
          <View style={styles.modalBg}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Confirm OTP</Text>
                <TouchableOpacity onPress={() => setOtpVisible(false)}>
                  <Ionicons name="close" size={24} color={theme.colors.text} />
                </TouchableOpacity>
              </View>
              <Text style={styles.modalDesc}>
                We sent a 6-digit confirmation code via SMS. Enter it below to complete your vegetable cargo booking.
              </Text>
              
              <OtpInput codeLength={6} onCodeChanged={setOtpCode} />

              <Button 
                title="Verify & Confirm Booking" 
                onPress={handleVerifyOtp} 
                style={styles.modalConfirmBtn}
              />
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background},
  scrollContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20},
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginRight: 16},
  headerTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text},
  cropCard: {
    padding: 16,
    marginBottom: 20,
    backgroundColor: 'rgba(16, 185, 129, 0.04)',
    borderColor: theme.colors.primary},
  cropLabel: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primaryDark,
    textTransform: 'uppercase',
    marginBottom: 4},
  cropName: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text},
  priceMeta: {
    marginTop: 6},
  priceMetaText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.weights.medium},
  sectionTitle: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
    marginTop: 8,
    marginBottom: 12},
  sectionDesc: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    marginBottom: 12},
  multilineInputContainer: {
    marginBottom: 20},
  summaryCard: {
    padding: 16,
    marginTop: 10,
    backgroundColor: 'rgba(59, 130, 246, 0.04)',
    borderColor: theme.colors.info},
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'},
  summaryLabel: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textSecondary},
  summaryValue: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.info},
  summarySub: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: 6},
  bookButton: {
    marginTop: 24,
    backgroundColor: theme.colors.primary},
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'flex-end'},
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    shadowColor: theme.colors.text,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 10},
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16},
  modalTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text},
  modalDesc: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12},
  modalConfirmBtn: {
    backgroundColor: theme.colors.primary,
    marginTop: 16}});

export default BookingFormScreen;
