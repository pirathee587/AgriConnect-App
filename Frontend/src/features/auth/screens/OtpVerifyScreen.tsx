import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert 
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../../navigation/types';
import { authApi } from '../../../api/auth.api';
import { theme } from '../../../theme';
import { Button, OtpInput, Loader } from '../../../components';
import { Ionicons } from '@expo/vector-icons';

type OtpVerifyScreenRouteProp = RouteProp<AuthStackParamList, 'OtpVerify'>;
type OtpVerifyScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'OtpVerify'>;

interface Props {
  route: OtpVerifyScreenRouteProp;
  navigation: OtpVerifyScreenNavigationProp;
}

export const OtpVerifyScreen: React.FC<Props> = ({ route, navigation }) => {
  const { phone, purpose, role } = route.params;
  
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleVerify = async () => {
    if (otp.length < 6) {
      Alert.alert('Incomplete Code', 'Please enter the complete 6-digit verification code.');
      return;
    }

    setLoading(true);
    try {
      if (role === 'farmer') {
        const message = await authApi.farmerVerifyOtp({
          phone,
          otp,
          purpose});
        
        Alert.alert('Verification Successful', 'Your account has been verified successfully. Please login to continue.', [
          {
            text: 'Login Now',
            onPress: () => navigation.navigate('Login', { role: 'farmer' })}
        ]);
      } else {
        const message = await authApi.agencyVerifyOtp({
          phone,
          otp,
          purpose});

        Alert.alert('Verification Successful', 'Your mobile number is verified. The Admin will review your NIC details shortly.', [
          {
            text: 'Go to Login',
            onPress: () => navigation.navigate('Login', { role: 'agency' })}
        ]);
      }
    } catch (error: any) {
      const msg = error.message || 'Incorrect OTP code. Please try again.';
      Alert.alert('Verification Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      let msg = '';
      if (role === 'farmer') {
        msg = await authApi.farmerResendOtp(phone);
      } else {
        msg = await authApi.agencyResendOtp(phone);
      }
      Alert.alert('Code Resent', 'A new verification code has been sent to ' + phone);
    } catch (error: any) {
      const msg = error.message || 'Failed to resend verification code.';
      Alert.alert('Resend Failed', msg);
    } finally {
      setResending(false);
    }
  };

  const getThemeColor = () => {
    return role === 'farmer' ? theme.colors.primary : theme.colors.secondary;
  };

  return (
    <SafeAreaView style={styles.container}>
      <Loader visible={loading || resending} message="Verifying..." />
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Verify Number</Text>
        <Text style={styles.subtext}>
          We sent a 6-digit verification code to your phone number:
        </Text>
        <Text style={styles.phone}>{phone}</Text>
      </View>

      <View style={styles.content}>
        <OtpInput codeLength={6} onCodeChanged={setOtp} />
        
        <View style={styles.resendContainer}>
          <Text style={styles.noCodeText}>Didn't receive the code? </Text>
          <TouchableOpacity onPress={handleResend}>
            <Text style={[styles.resendText, { color: getThemeColor() }]}>Resend Code</Text>
          </TouchableOpacity>
        </View>

        <Button 
          title="Verify & Proceed" 
          onPress={handleVerify} 
          style={{ ...styles.verifyButton, backgroundColor: getThemeColor() }}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: 24},
  header: {
    marginTop: 24,
    marginBottom: 32},
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: theme.colors.border},
  title: {
    fontSize: theme.typography.sizes.xxl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text},
  subtext: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    marginTop: 8,
    lineHeight: 20},
  phone: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
    marginTop: 6},
  content: {
    flex: 1},
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20},
  noCodeText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.sizes.sm},
  resendText: {
    fontWeight: theme.typography.weights.semibold,
    fontSize: theme.typography.sizes.sm},
  verifyButton: {
    marginTop: 20}});

export default OtpVerifyScreen;
