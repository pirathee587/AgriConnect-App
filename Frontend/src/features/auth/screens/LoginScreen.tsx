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
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../../navigation/types';
import { authApi } from '../../../api/auth.api';
import { persistAndLogin } from '../../../store/slices/authSlice';
import { useDispatch } from 'react-redux';
import { theme } from '../../../theme';
import { Input, Button, Loader } from '../../../components';
import { Ionicons } from '@expo/vector-icons';

type LoginScreenRouteProp = RouteProp<AuthStackParamList, 'Login'>;
type LoginScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

interface Props {
  route: LoginScreenRouteProp;
  navigation: LoginScreenNavigationProp;
}

export const LoginScreen: React.FC<Props> = ({ route, navigation }) => {
  const { role } = route.params;
  const dispatch = useDispatch();
  
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ phone?: string; password?: string }>({});

  const validate = () => {
    const tempErrors: { phone?: string; password?: string } = {};
    if (!phone) {
      tempErrors.phone = 'Phone number is required';
    } else if (!/^(?:\+94|0)?7[0-9]{8}$/.test(phone)) {
      tempErrors.phone = 'Enter a valid Sri Lankan phone number (e.g. 0771234567)';
    }
    
    if (!password) {
      tempErrors.password = 'Password is required';
    } else if (password.length < 6) {
      tempErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);

    // Format phone to standard +94 format if it starts with 0
    let formattedPhone = phone.trim();
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '+94' + formattedPhone.substring(1);
    } else if (!formattedPhone.startsWith('+94')) {
      formattedPhone = '+94' + formattedPhone;
    }

    try {
      if (role === 'farmer') {
        const response = await authApi.farmerLogin({ phone: formattedPhone, password });
        // Successful login
        dispatch(persistAndLogin({
          token: response.token,
          role: 'farmer',
          name: response.name,
          userId: response.userId,
          farmerId: response.farmerId}) as any);
        Alert.alert('Success', 'Welcome back, ' + response.name);
      } else if (role === 'agency') {
        const response = await authApi.agencyLogin({ phone: formattedPhone, password });
        dispatch(persistAndLogin({
          token: response.token,
          role: 'agency',
          name: response.name,
          userId: response.userId,
          agencyId: response.agencyId,
          agencyStatus: response.agencyStatus}) as any);
        
        Alert.alert('Success', 'Welcome back, ' + response.name);
      } else if (role === 'admin') {
        const response = await authApi.adminLogin({ phone: formattedPhone, password });
        dispatch(persistAndLogin({
          token: response.token,
          role: 'admin',
          name: response.name,
          userId: response.userId}) as any);
        Alert.alert('Success', 'Admin session started');
      }
    } catch (error: any) {
      const msg = error.message || 'Invalid phone or password';
      Alert.alert('Login Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  const getRoleHeaderLabel = () => {
    switch (role) {
      case 'farmer':
        return 'Farmer Portal';
      case 'agency':
        return 'Agency Portal';
      case 'admin':
        return 'Admin Panel';
    }
  };

  const getRoleColor = () => {
    switch (role) {
      case 'farmer':
        return theme.colors.primary;
      case 'agency':
        return theme.colors.secondary;
      case 'admin':
        return '#475569';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Loader visible={loading} message="Authenticating..." />
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <View style={[styles.badge, { backgroundColor: getRoleColor() + '10' }]}>
            <Text style={[styles.badgeText, { color: getRoleColor() }]}>
              {getRoleHeaderLabel()}
            </Text>
          </View>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtext}>Sign in to continue connecting</Text>
        </View>

        <View style={styles.form}>
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
            label="Password"
            placeholder="••••••••"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            error={errors.password}
            icon={<Ionicons name="lock-closed-outline" size={20} color={theme.colors.textMuted} />}
          />

          <Button 
            title="Log In" 
            onPress={handleLogin} 
            style={{ ...styles.loginBtn, backgroundColor: getRoleColor() }}
          />

          {role !== 'admin' && (
            <View style={styles.registerContainer}>
              <Text style={styles.noAccountText}>Don't have an account? </Text>
              <TouchableOpacity 
                onPress={() => {
                  if (role === 'farmer') {
                    navigation.navigate('FarmerRegister');
                  } else {
                    navigation.navigate('AgencyRegister');
                  }
                }}
              >
                <Text style={[styles.registerText, { color: getRoleColor() }]}>Register Here</Text>
              </TouchableOpacity>
            </View>
          )}
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
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 12},
  badgeText: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.semibold,
    textTransform: 'uppercase'},
  title: {
    fontSize: theme.typography.sizes.xxl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text},
  subtext: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    marginTop: 6},
  form: {
    flex: 1},
  loginBtn: {
    marginTop: 10},
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24},
  noAccountText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.sizes.sm},
  registerText: {
    fontWeight: theme.typography.weights.semibold,
    fontSize: theme.typography.sizes.sm}});

export default LoginScreen;
