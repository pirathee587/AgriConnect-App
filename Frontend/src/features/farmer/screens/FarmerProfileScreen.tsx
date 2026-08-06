import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Alert, 
  ActivityIndicator 
} from 'react-native';
import { useDispatch } from 'react-redux';
import { logoutUser } from '../../../store/slices/authSlice';
import { farmerApi, FarmerProfileResponse } from '../../../api/farmer.api';
import { theme } from '../../../theme';
import { Input, Button, Card, Loader } from '../../../components';
import { Ionicons } from '@expo/vector-icons';

export const FarmerProfileScreen: React.FC = () => {
  const dispatch = useDispatch();
  const [profile, setProfile] = useState<FarmerProfileResponse | null>(null);
  
  // Profile edit fields
  const [name, setName] = useState('');
  const [district, setDistrict] = useState('');
  const [address, setAddress] = useState('');

  // Bank edit fields
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const data = await farmerApi.getProfile();
      setProfile(data);
      setName(data.name);
      setDistrict(data.district || '');
      setAddress(data.address || '');
      
      if (data.bankName) setBankName(data.bankName);
      if (data.accountHolderName) setAccountHolderName(data.accountHolderName);
    } catch (e: any) {
      Alert.alert('Error', 'Failed to retrieve profile details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdateProfile = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name field is required');
      return;
    }
    setUpdating(true);
    try {
      const res = await farmerApi.updateProfile({ name, district, address });
      setProfile(res);
      Alert.alert('Profile Updated', 'Your contact details have been updated.');
    } catch (e: any) {
      Alert.alert('Update Failed', e.message || 'Could not update profile details.');
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateBank = async () => {
    if (!bankName.trim() || !accountNumber.trim() || !accountHolderName.trim()) {
      Alert.alert('Error', 'Please fill in all bank details.');
      return;
    }
    setUpdating(true);
    try {
      const res = await farmerApi.saveOrUpdateBankDetail({
        bankName,
        accountNumber,
        accountHolderName});
      
      // Refresh profile to update masked account number display
      const data = await farmerApi.getProfile();
      setProfile(data);
      
      Alert.alert('Bank Account Updated', 'Your banking wire settings are successfully saved.');
    } catch (e: any) {
      Alert.alert('Update Failed', e.message || 'Could not update banking settings.');
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out of AgriConnect?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: () => dispatch(logoutUser() as any) }
    ]);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Loader visible={updating} message="Saving settings..." />
      <View style={styles.header}>
        <Text style={styles.title}>My Profile Settings</Text>
        <Text style={styles.sub}>{profile?.phone} • Verified Farmer</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        {/* Personal Info Card */}
        <Text style={styles.sectionHeader}>Personal Contact Details</Text>
        <Card style={styles.card}>
          <Input
            label="Full Name"
            placeholder="Name"
            value={name}
            onChangeText={setName}
            icon={<Ionicons name="person-outline" size={20} color={theme.colors.textMuted} />}
          />
          <Input
            label="District"
            placeholder="e.g. Nuwara Eliya"
            value={district}
            onChangeText={setDistrict}
            icon={<Ionicons name="map-outline" size={20} color={theme.colors.textMuted} />}
          />
          <Input
            label="Home / Farm Address"
            placeholder="Standard pickup point address"
            value={address}
            onChangeText={setAddress}
            icon={<Ionicons name="location-outline" size={20} color={theme.colors.textMuted} />}
          />
          <Button 
            title="Save Contact Details" 
            onPress={handleUpdateProfile} 
            style={styles.saveBtn}
          />
        </Card>

        {/* Banking Settings Card */}
        <Text style={styles.sectionHeader}>Saved Bank Account for Sales</Text>
        <Card style={styles.card}>
          {profile?.maskedAccountNumber ? (
            <View style={styles.maskedBox}>
              <Ionicons name="card" size={18} color={theme.colors.success} />
              <Text style={styles.maskedText}>
                Active Wire Settings: {profile.bankName} ({profile.maskedAccountNumber})
              </Text>
            </View>
          ) : null}

          <Input
            label="Bank Name"
            placeholder="e.g. Bank of Ceylon"
            value={bankName}
            onChangeText={setBankName}
            icon={<Ionicons name="business-outline" size={20} color={theme.colors.textMuted} />}
          />
          <Input
            label="Account Number"
            placeholder="Enter digits to update"
            keyboardType="numeric"
            value={accountNumber}
            onChangeText={setAccountNumber}
            icon={<Ionicons name="card-outline" size={20} color={theme.colors.textMuted} />}
          />
          <Input
            label="Account Holder Name"
            placeholder="Passbook holder name"
            value={accountHolderName}
            onChangeText={setAccountHolderName}
            icon={<Ionicons name="person-outline" size={20} color={theme.colors.textMuted} />}
          />
          <Button 
            title="Update Bank Settings" 
            onPress={handleUpdateBank} 
            style={styles.saveBtn}
          />
        </Card>

        <Button 
          title="Sign Out / வெளியேறு" 
          variant="outline"
          onPress={handleLogout} 
          style={styles.logoutBtn}
          textStyle={{ color: theme.colors.error }}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background},
  header: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border},
  title: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text},
  sub: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textMuted,
    marginTop: 4},
  scrollContainer: {
    padding: 16,
    paddingBottom: 40},
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'},
  sectionHeader: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
    marginTop: 10,
    marginBottom: 12},
  card: {
    padding: 16,
    marginBottom: 20},
  maskedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.04)',
    borderColor: 'rgba(16, 185, 129, 0.2)',
    borderWidth: 1,
    padding: 12,
    borderRadius: 10,
    marginBottom: 16},
  maskedText: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.primaryDark,
    marginLeft: 8,
    flex: 1},
  saveBtn: {
    height: 46,
    marginTop: 8,
    backgroundColor: theme.colors.primary},
  logoutBtn: {
    borderColor: theme.colors.error,
    borderWidth: 1.5,
    marginTop: 10}});

export default FarmerProfileScreen;
