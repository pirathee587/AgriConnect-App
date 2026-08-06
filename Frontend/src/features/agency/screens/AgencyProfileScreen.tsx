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
import { agencyApi, AgencyProfileResponse } from '../../../api/agency.api';
import { theme } from '../../../theme';
import { Input, Button, Card, Loader } from '../../../components';
import { Ionicons } from '@expo/vector-icons';

export const AgencyProfileScreen: React.FC = () => {
  const dispatch = useDispatch();
  const [profile, setProfile] = useState<AgencyProfileResponse | null>(null);

  // Edit fields
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const data = await agencyApi.getProfile();
      setProfile(data);
      setName(data.name);
      setAddress(data.address || '');
      setBankName(data.bankName || '');
      setAccountNumber(data.maskedAccountNumber || '');
      setAccountHolderName(data.accountHolderName || '');
    } catch (e: any) {
      Alert.alert('Error', 'Failed to retrieve agency profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdate = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name field is required.');
      return;
    }
    setUpdating(true);
    try {
      const res = await agencyApi.updateProfile({
        name,
        address: address.trim() || undefined,
        bankName: bankName.trim() || undefined,
        accountNumber: accountNumber.trim() || undefined,
        accountHolderName: accountHolderName.trim() || undefined});
      setProfile(res);
      Alert.alert('Profile Saved', 'Your agency profile and banking settings have been saved.');
    } catch (e: any) {
      Alert.alert('Save Failed', e.message || 'Could not update profile details.');
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out of the Agency Portal?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: () => dispatch(logoutUser() as any) }
    ]);
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
      <Loader visible={updating} message="Saving settings..." />
      <View style={styles.header}>
        <Text style={styles.title}>Agency Profile Settings</Text>
        <Text style={styles.sub}>{profile?.phone} • Verified Lorry Owner</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        {/* Verification Status Card */}
        <Text style={styles.sectionHeader}>Verification Summary</Text>
        <Card style={styles.card}>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Verification Status:</Text>
            <Text style={[
              styles.statusVal,
              profile?.agencyStatus === 'ACTIVE' ? styles.statusActive : styles.statusPending
            ]}>
              {profile?.agencyStatus.replace('_', ' ')}
            </Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>NIC Registered:</Text>
            <Text style={styles.nicText}>{profile?.nicNumber}</Text>
          </View>
        </Card>

        {/* Contact Info Card */}
        <Text style={styles.sectionHeader}>Agency Contact Information</Text>
        <Card style={styles.card}>
          <Input
            label="Agency / Partner Name"
            placeholder="Jane Smith"
            value={name}
            onChangeText={setName}
            icon={<Ionicons name="person-outline" size={20} color={theme.colors.textMuted} />}
          />
          <Input
            label="Office / Residence Address"
            placeholder="Office Location"
            value={address}
            onChangeText={setAddress}
            icon={<Ionicons name="location-outline" size={20} color={theme.colors.textMuted} />}
          />
        </Card>

        {/* Bank Account */}
        <Text style={styles.sectionHeader}>Bank Wiring Settings</Text>
        <Card style={styles.card}>
          <Input
            label="Bank Name"
            placeholder="e.g. Seylan Bank"
            value={bankName}
            onChangeText={setBankName}
            icon={<Ionicons name="business-outline" size={20} color={theme.colors.textMuted} />}
          />
          <Input
            label="Account Number"
            placeholder="Bank Card Numbers"
            keyboardType="numeric"
            value={accountNumber}
            onChangeText={setAccountNumber}
            icon={<Ionicons name="card-outline" size={20} color={theme.colors.textMuted} />}
          />
          <Input
            label="Account Holder Name"
            placeholder="Holder name"
            value={accountHolderName}
            onChangeText={setAccountHolderName}
            icon={<Ionicons name="person-circle-outline" size={20} color={theme.colors.textMuted} />}
          />
        </Card>

        <Button 
          title="Save Profile Settings" 
          onPress={handleUpdate} 
          style={styles.saveBtn}
        />

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
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10},
  statusLabel: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary},
  statusVal: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.bold},
  statusActive: {
    color: theme.colors.success},
  statusPending: {
    color: theme.colors.warning},
  nicText: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text},
  saveBtn: {
    backgroundColor: theme.colors.secondary,
    height: 48,
    marginBottom: 10},
  logoutBtn: {
    borderColor: theme.colors.error,
    borderWidth: 1.5,
    marginTop: 10}});

export default AgencyProfileScreen;
