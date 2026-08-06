import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert, 
  Image 
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../../navigation/types';
import * as ImagePicker from 'expo-image-picker';
import { authApi } from '../../../api/auth.api';
import { theme } from '../../../theme';
import { Input, Button, Loader, Card } from '../../../components';
import { Ionicons } from '@expo/vector-icons';

type AgencyRegisterScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'AgencyRegister'>;

interface Props {
  navigation: AgencyRegisterScreenNavigationProp;
}

export const AgencyRegisterScreen: React.FC<Props> = ({ navigation }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nicNumber, setNicNumber] = useState('');
  const [address, setAddress] = useState('');
  
  // Bank details (optional)
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');
  
  // NIC photos
  const [nicFront, setNicFront] = useState<{ uri: string; name: string; type: string } | null>(null);
  const [nicBack, setNicBack] = useState<{ uri: string; name: string; type: string } | null>(null);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const pickImage = async (side: 'front' | 'back') => {
    // Request permission first
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Please grant photo library access to upload your NIC.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 10],
      quality: 0.8});

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      const uri = asset.uri;
      // Extract file name
      const filename = uri.split('/').pop() || `nic_${side}.jpg`;
      // Determine file extension and type
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image/jpeg`;

      const fileData = {
        uri,
        name: filename,
        type};

      if (side === 'front') {
        setNicFront(fileData);
      } else {
        setNicBack(fileData);
      }
    }
  };

  const validate = () => {
    const tempErrors: Record<string, string> = {};
    if (!name.trim()) tempErrors.name = 'Full Name is required';
    if (!phone) {
      tempErrors.phone = 'Phone number is required';
    } else if (!/^(?:\+94|0)?7[0-9]{8}$/.test(phone)) {
      tempErrors.phone = 'Enter a valid Sri Lankan phone number';
    }
    if (!nicNumber.trim()) {
      tempErrors.nicNumber = 'NIC number is required';
    } else if (!/^[0-9]{9}[vVxX]|[0-9]{12}$/.test(nicNumber)) {
      tempErrors.nicNumber = 'Enter a valid NIC format (e.g. 199912345678 or 991234567V)';
    }
    if (!address.trim()) tempErrors.address = 'Address is required';
    if (!password) {
      tempErrors.password = 'Password is required';
    } else if (password.length < 6) {
      tempErrors.password = 'Password must be at least 6 characters';
    }
    if (!nicFront) {
      tempErrors.nicFront = 'NIC Front scan is required';
    }
    if (!nicBack) {
      tempErrors.nicBack = 'NIC Back scan is required';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) {
      if (!nicFront || !nicBack) {
        Alert.alert('Incomplete NIC Upload', 'Please select both Front and Back photos of your NIC card.');
      }
      return;
    }
    setLoading(true);

    let formattedPhone = phone.trim();
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '+94' + formattedPhone.substring(1);
    } else if (!formattedPhone.startsWith('+94')) {
      formattedPhone = '+94' + formattedPhone;
    }

    try {
      await authApi.agencyRegister({
        name,
        phone: formattedPhone,
        password,
        email: email || undefined,
        nicNumber,
        address,
        bankName: bankName || undefined,
        accountNumber: accountNumber || undefined,
        accountHolderName: accountHolderName || undefined,
        nicFront: nicFront || undefined,
        nicBack: nicBack || undefined});

      Alert.alert(
        'Registration Initiated',
        'OTP code has been sent to your phone. Please verify to complete registration.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('OtpVerify', {
              phone: formattedPhone,
              purpose: 'REGISTRATION',
              role: 'agency'})},
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
      <Loader visible={loading} message="Submitting agency profile..." />
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Agency Registration</Text>
          <Text style={styles.subtext}>Register as a transport agency. Requires Admin verification of your NIC before active access.</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.sectionHeader}>Personal Information</Text>
          <Input
            label="Full Name"
            placeholder="Jane Smith"
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
            label="Email Address (Optional)"
            placeholder="jane@example.com"
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
            label="NIC Number"
            placeholder="e.g. 199912345678 or 991234567V"
            value={nicNumber}
            onChangeText={setNicNumber}
            error={errors.nicNumber}
            icon={<Ionicons name="card-outline" size={20} color={theme.colors.textMuted} />}
          />
          <Input
            label="Permanent Address"
            placeholder="Enter your residence or office address"
            value={address}
            onChangeText={setAddress}
            error={errors.address}
            icon={<Ionicons name="location-outline" size={20} color={theme.colors.textMuted} />}
          />

          <Text style={styles.sectionHeader}>Bank Details (Optional)</Text>
          <Input
            label="Bank Name"
            placeholder="e.g. Bank of Ceylon, Commercial Bank"
            value={bankName}
            onChangeText={setBankName}
            icon={<Ionicons name="business-outline" size={20} color={theme.colors.textMuted} />}
          />
          <Input
            label="Account Number"
            placeholder="e.g. 81092849"
            keyboardType="numeric"
            value={accountNumber}
            onChangeText={setAccountNumber}
            icon={<Ionicons name="wallet-outline" size={20} color={theme.colors.textMuted} />}
          />
          <Input
            label="Account Holder Name"
            placeholder="As it appears on checkbook"
            value={accountHolderName}
            onChangeText={setAccountHolderName}
            icon={<Ionicons name="person-circle-outline" size={20} color={theme.colors.textMuted} />}
          />

          <Text style={styles.sectionHeader}>NIC Card Photocopy Scans</Text>
          <Text style={styles.nicDesc}>Please upload clear photos of your National Identity Card for approval.</Text>
          
          <View style={styles.nicPhotosRow}>
            {/* Front Card */}
            <TouchableOpacity 
              activeOpacity={0.8}
              style={[styles.nicCardBox, !nicFront && styles.nicCardBoxEmpty]}
              onPress={() => pickImage('front')}
            >
              {nicFront ? (
                <Image source={{ uri: nicFront.uri }} style={styles.nicImage} />
              ) : (
                <View style={styles.nicCardPlaceholder}>
                  <Ionicons name="camera" size={32} color={theme.colors.textMuted} />
                  <Text style={styles.nicCardLabel}>NIC Front</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Back Card */}
            <TouchableOpacity 
              activeOpacity={0.8}
              style={[styles.nicCardBox, !nicBack && styles.nicCardBoxEmpty]}
              onPress={() => pickImage('back')}
            >
              {nicBack ? (
                <Image source={{ uri: nicBack.uri }} style={styles.nicImage} />
              ) : (
                <View style={styles.nicCardPlaceholder}>
                  <Ionicons name="camera" size={32} color={theme.colors.textMuted} />
                  <Text style={styles.nicCardLabel}>NIC Back</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <Button 
            title="Register" 
            onPress={handleRegister} 
            style={styles.registerBtn}
          />

          <View style={styles.loginContainer}>
            <Text style={styles.hasAccountText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login', { role: 'agency' })}>
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
    color: theme.colors.secondaryDark},
  subtext: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    marginTop: 6,
    lineHeight: 20},
  sectionHeader: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
    marginTop: 12,
    marginBottom: 16,
    borderBottomWidth: 1.5,
    borderBottomColor: theme.colors.border,
    paddingBottom: 6},
  nicDesc: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    marginBottom: 16},
  nicPhotosRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 28},
  nicCardBox: {
    width: '47%',
    height: 110,
    borderRadius: 12,
    overflow: 'hidden'},
  nicCardBoxEmpty: {
    borderWidth: 1.5,
    borderColor: theme.colors.borderDark,
    borderStyle: 'dashed',
    backgroundColor: 'rgba(241, 245, 249, 0.5)'},
  nicImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover'},
  nicCardPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'},
  nicCardLabel: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.weights.medium,
    marginTop: 6},
  form: {
    flex: 1},
  registerBtn: {
    marginTop: 10,
    backgroundColor: theme.colors.secondary},
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24},
  hasAccountText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.sizes.sm},
  loginText: {
    color: theme.colors.secondary,
    fontWeight: theme.typography.weights.semibold,
    fontSize: theme.typography.sizes.sm}});

export default AgencyRegisterScreen;
