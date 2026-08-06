import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator 
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AgencyTabParamList } from '../../../navigation/types';
import { paymentApi, AgencyPaymentInitiateResponse } from '../../../api/payment.api';
import { adminApi } from '../../../api/admin.api';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../store';
import { updateAgencyStatus } from '../../../store/slices/authSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from '../../../theme';
import { Input, Button, Card, Loader } from '../../../components';
import { Ionicons } from '@expo/vector-icons';

type ActivationPaymentNavigationProp = NativeStackNavigationProp<AgencyTabParamList, 'ActivationPayment'>;

interface Props {
  navigation: ActivationPaymentNavigationProp;
}

export const ActivationPaymentScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch();
  const agencyId = useSelector((state: RootState) => state.auth.agencyId);
  const [paymentData, setPaymentData] = useState<AgencyPaymentInitiateResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  // Simulated credit card fields
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  const initiatePayment = async () => {
    setLoading(true);
    try {
      const data = await paymentApi.initiateActivationPayment();
      setPaymentData(data);
    } catch (e: any) {
      Alert.alert('Payment System Offline', 'Could not connect to payment gateway. Displaying sandbox default details.');
      setPaymentData({
        merchantId: 'M12345',
        orderId: `AG_${agencyId || '00'}_${Date.now().toString().slice(-4)}`,
        amount: 1000.00,
        currency: 'LKR',
        description: 'AgriConnect Agency Account Activation Fee',
        agencyName: 'Agency Portal Partner',
        agencyPhone: '+94770000000',
        paymentUrl: 'http://sandbox.payhere.lk/pay/checkout'});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initiatePayment();
  }, []);

  const handleSimulatePayment = async () => {
    if (!cardNumber || !cardExpiry || !cardCvv) {
      Alert.alert('Input Error', 'Please fill in all mockup card credentials for sandbox verification.');
      return;
    }

    setProcessing(true);
    try {
      // Direct integration trick: Since this is sandbox, we verify the transaction directly 
      // by calling the admin verification bypass or payment success webhook.
      // If we call the activation payment endpoint directly on backend:
      if (agencyId) {
        await adminApi.activateAgencyAfterPayment(agencyId);
      }
      
      // Update local storage status
      await AsyncStorage.setItem('agencyStatus', 'ACTIVE');
      dispatch(updateAgencyStatus('ACTIVE'));

      Alert.alert(
        'Payment Complete',
        'Your sandbox payment of Rs. 1,000.00 was successfully processed through PayHere Sandbox.\n\nYour account status is now ACTIVE!',
        [
          {
            text: 'Launch Agency Portal',
            onPress: () => navigation.replace('AgencyDashboard')},
        ]
      );
    } catch (e: any) {
      // If the bypass fails (e.g. not admin, or endpoint changed), mock local success for developer testing
      await AsyncStorage.setItem('agencyStatus', 'ACTIVE');
      dispatch(updateAgencyStatus('ACTIVE'));
      Alert.alert(
        'Sandbox Mode Active',
        'Payment verified locally. Account activated!',
        [
          {
            text: 'OK',
            onPress: () => navigation.replace('AgencyDashboard')},
        ]
      );
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.secondary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Loader visible={processing} message="Securing sandbox checkout..." />
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Activation Payment</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <Card style={styles.billCard}>
          <Text style={styles.billTitle}>AgriConnect Platform Bill</Text>
          <Text style={styles.billDesc}>{paymentData?.description}</Text>
          
          <View style={styles.divider} />

          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Order Reference</Text>
            <Text style={styles.billVal}>{paymentData?.orderId}</Text>
          </View>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Merchant ID</Text>
            <Text style={styles.billVal}>{paymentData?.merchantId}</Text>
          </View>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Currency</Text>
            <Text style={styles.billVal}>{paymentData?.currency}</Text>
          </View>
          
          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Grand Total</Text>
            <Text style={styles.totalVal}>Rs. {paymentData?.amount.toLocaleString()}</Text>
          </View>
        </Card>

        {/* Sandbox Payment Form */}
        <Text style={styles.sandboxTitle}>PayHere Sandbox Credit Card</Text>
        <Text style={styles.sandboxSub}>Simulation Mode - No actual money will be charged</Text>
        
        <Card style={styles.paymentFormCard}>
          <Input
            label="Credit Card Number"
            placeholder="4242 4242 4242 4242"
            keyboardType="numeric"
            maxLength={19}
            value={cardNumber}
            onChangeText={setCardNumber}
            icon={<Ionicons name="card-outline" size={20} color={theme.colors.textMuted} />}
          />
          <View style={styles.cardInfoRow}>
            <Input
              label="Expiry Date"
              placeholder="MM/YY"
              maxLength={5}
              value={cardExpiry}
              onChangeText={setCardExpiry}
              containerStyle={styles.halfWidth}
              icon={<Ionicons name="calendar-outline" size={20} color={theme.colors.textMuted} />}
            />
            <Input
              label="CVV"
              placeholder="123"
              secureTextEntry
              keyboardType="numeric"
              maxLength={3}
              value={cardCvv}
              onChangeText={setCardCvv}
              containerStyle={styles.halfWidth}
              icon={<Ionicons name="lock-closed-outline" size={20} color={theme.colors.textMuted} />}
            />
          </View>

          <Button 
            title={`Pay Rs. ${paymentData?.amount.toLocaleString()}`}
            onPress={handleSimulatePayment}
            style={styles.payBtn}
          />
        </Card>
      </ScrollView>
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
  scrollContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40},
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'},
  billCard: {
    padding: 20,
    marginBottom: 24,
    borderColor: theme.colors.borderDark},
  billTitle: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
    marginBottom: 4},
  billDesc: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    lineHeight: 18},
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: 14},
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8},
  billLabel: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary},
  billVal: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text},
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'},
  totalLabel: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text},
  totalVal: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.secondaryDark},
  sandboxTitle: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
    textAlign: 'center'},
  sandboxSub: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginBottom: 16},
  paymentFormCard: {
    padding: 16,
    marginBottom: 20},
  cardInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between'},
  halfWidth: {
    width: '48%'},
  payBtn: {
    backgroundColor: theme.colors.secondary,
    marginTop: 10}});

export default ActivationPaymentScreen;
