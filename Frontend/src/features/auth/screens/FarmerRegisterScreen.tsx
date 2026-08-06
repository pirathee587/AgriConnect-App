import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert 
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../../navigation/types';
import { authApi } from '../../../api/auth.api';
import { theme } from '../../../theme';
import { Input, Button, Loader } from '../../../components';
import { Ionicons } from '@expo/vector-icons';

type FarmerRegisterScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'FarmerRegister'>;

interface Props {
  navigation: FarmerRegisterScreenNavigationProp;
}

export const FarmerRegisterScreen: React.FC<Props> = ({ navigation }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [district, setDistrict] = useState('');
  const [address, setAddress] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const tempErrors: Record<string, string> = {};
    if (!name.trim()) tempErrors.name = 'Full Name is required';
    if (!phone) {
      tempErrors.phone = 'Phone number is required';
    } else if (!/^(?:\+94|0)?7[0-9]{8}$/.test(phone)) {
      tempErrors.phone = 'Enter a valid Sri Lankan phone number (e.g. 0771234567)';
    }
    if (!email) {
      tempErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      tempErrors.email = 'Enter a valid email address';
    }
    if (!password) {
      tempErrors.password = 'Password is required';
    } else if (password.length < 6) {
      tempErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);

    let formattedPhone = phone.trim();
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '+94' + formattedPhone.substring(1);
    } else if (!formattedPhone.startsWith('+94')) {
      formattedPhone = '+94' + formattedPhone;
    }

    try {
      const response = await authApi.farmerRegister({
        name,
        phone: formattedPhone,
        password,
        email,
        district,
        address});

      Alert.alert(
        'Registration Initiated',
        'OTP code has been sent to your phone. Please verify to complete registration.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('OtpVerify', {
              phone: formattedPhone,
              purpose: 'REGISTRATION',
              role: 'farmer'})},
        ]
      );
    } catch (error: any) {
      const msg = error.message || 'Registration failed. Try again.';
      Alert.alert('Registration Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Loader visible={loading} message="Submitting registration..." />
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Farmer Registration</Text>
          <Text style={styles.subtext}>Register to start booking transport capacity and view market prices</Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Full Name"
            placeholder="John Doe"
            value={name}
            onChangeText={setName}
            error={errors.name}
            icon={<Ionicons name="person-outline" size={20} color={theme.colors.textMuted} />}
          />
          <Input
            label="Phone Number"
            placeholder="07XXXXXXXX"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
            error={errors.phone}
            icon={<Ionicons name="call-outline" size={20} color={theme.colors.textMuted} />}
          />
          <Input
            label="Email Address"
            placeholder="john@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            error={errors.email}
            icon={<Ionicons name="mail-outline" size={20} color={theme.colors.textMuted} />}
          />
          <Input
            label="Password"
            placeholder="Min 6 characters"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            error={errors.password}
            icon={<Ionicons name="lock-closed-outline" size={20} color={theme.colors.textMuted} />}
          />
          <Input
            label="District (Optional)"
            placeholder="e.g. Dambulla, Nuwara Eliya"
            value={district}
            onChangeText={setDistrict}
            icon={<Ionicons name="map-outline" size={20} color={theme.colors.textMuted} />}
          />
          <Input
            label="Pickup Address (Optional)"
            placeholder="Enter your farm pickup location"
            value={address}
            onChangeText={setAddress}
            icon={<Ionicons name="location-outline" size={20} color={theme.colors.textMuted} />}
          />

          <Button 
            title="Register" 
            onPress={handleRegister} 
            style={styles.registerBtn}
          />

          <View style={styles.loginContainer}>
            <Text style={styles.hasAccountText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login', { role: 'farmer' })}>
              <Text style={styles.loginText}>Log In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background},
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40},
  header: {
    marginTop: 24,
    marginBottom: 24},
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
    color: theme.colors.primaryDark},
  subtext: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    marginTop: 6,
    lineHeight: 20},
  form: {
    flex: 1},
  registerBtn: {
    marginTop: 10,
    backgroundColor: theme.colors.primary},
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24},
  hasAccountText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.sizes.sm},
  loginText: {
    color: theme.colors.primary,
    fontWeight: theme.typography.weights.semibold,
    fontSize: theme.typography.sizes.sm}});

export default FarmerRegisterScreen;
