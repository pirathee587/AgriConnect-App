import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AgencyTabParamList } from '../../../navigation/types';
import { useDispatch } from 'react-redux';
import { driverApi } from '../../../api/driver.api';
import { removeDriverSuccess, updateDriverSuccess } from '../../../store/slices/driverSlice';
import { theme } from '../../../theme';
import { Card, Button, StatusBadge } from '../../../components';
import { Ionicons } from '@expo/vector-icons';
import { DriverResponse } from '../../../store/slices/driverSlice';

type Route = RouteProp<AgencyTabParamList, 'DriverDetail'>;
type Navigation = NativeStackNavigationProp<AgencyTabParamList, 'DriverDetail'>;

type Props = {
  route: Route;
  navigation: Navigation;
};

export const DriverDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { driverId } = route.params;
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [driver, setDriver] = useState<DriverResponse | null>(null);

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const data = await driverApi.getDriver(driverId);
      setDriver(data);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Could not load driver details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [driverId]);

  const handleSendReminder = async () => {
    try {
      setLoading(true);
      const msg = await driverApi.sendNicReminder(driverId);
      Alert.alert('Reminder Sent', msg || 'NIC reminder notification sent successfully.');
    } catch (e: any) {
      Alert.alert('Failed', e.message || 'Could not send NIC reminder.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = () => {
    Alert.alert(
      'Confirm Deactivation',
      `Are you sure you want to deactivate driver ${driver?.fullName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Deactivate',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              const msg = await driverApi.deactivateDriver(driverId);
              dispatch(removeDriverSuccess(driverId));
              Alert.alert('Deactivated', msg || 'Driver deactivated successfully.', [
                { text: 'OK', onPress: () => navigation.goBack() },
              ]);
            } catch (e: any) {
              Alert.alert('Failed', e.message || 'Could not deactivate driver.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  if (loading && !driver) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.secondary} />
      </SafeAreaView>
    );
  }

  if (!driver) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.errorText}>Driver not found.</Text>
        <Button title="Go Back" onPress={() => navigation.goBack()} />
      </SafeAreaView>
    );
  }

  const isNicPending = driver.nicStatus === 'NIC_NOT_PROVIDED';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Driver Profile</Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate('EditDriver', { driverId })}
        >
          <Ionicons name="create-outline" size={22} color={theme.colors.secondary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Profile Card */}
        <Card style={styles.profileCard}>
          <View style={styles.avatarLarge}>
            <Ionicons name="person" size={48} color={theme.colors.secondary} />
          </View>
          <Text style={styles.name}>{driver.fullName}</Text>
          <View style={styles.statusRow}>
            <StatusBadge status={driver.status} />
          </View>
        </Card>

        {/* Details Card */}
        <Text style={styles.sectionHeader}>Credentials & Contact</Text>
        <Card style={styles.detailsCard}>
          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={20} color={theme.colors.textMuted} />
            <View style={styles.infoCol}>
              <Text style={styles.infoLabel}>Phone Number</Text>
              <Text style={styles.infoVal}>{driver.phone}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={20} color={theme.colors.textMuted} />
            <View style={styles.infoCol}>
              <Text style={styles.infoLabel}>Email Address</Text>
              <Text style={styles.infoVal}>{driver.email || 'Not Provided'}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="card-outline" size={20} color={theme.colors.textMuted} />
            <View style={styles.infoCol}>
              <Text style={styles.infoLabel}>Driving Licence Number</Text>
              <Text style={styles.infoVal}>{driver.licenceNumber}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="options-outline" size={20} color={theme.colors.textMuted} />
            <View style={styles.infoCol}>
              <Text style={styles.infoLabel}>Licence Class</Text>
              <Text style={styles.infoVal}>{driver.licenceClass}</Text>
            </View>
          </View>
        </Card>

        {/* NIC Status Card */}
        <Text style={styles.sectionHeader}>NIC Verification</Text>
        <Card style={{ ...styles.nicCard, ...(isNicPending ? styles.nicPendingBorder : styles.nicVerifiedBorder) }}>
          <View style={styles.nicHeader}>
            <Ionicons
              name={isNicPending ? 'alert-circle' : 'checkmark-circle'}
              size={24}
              color={isNicPending ? theme.colors.warning : theme.colors.success}
            />
            <Text style={[styles.nicTitle, { color: isNicPending ? theme.colors.warning : theme.colors.success }]}>
              {driver.nicStatusLabel}
            </Text>
          </View>
          <Text style={styles.nicDesc}>
            {isNicPending
              ? "The driver's physical National Identity Card (NIC) has not yet been submitted to your office. Collect and verify their physical document."
              : "The physical National Identity Card (NIC) has been collected, verified, and is safely held by your office."}
          </Text>

          {isNicPending && (
            <Button
              title="Send NIC Reminder"
              onPress={handleSendReminder}
              variant="secondary"
              style={styles.reminderBtn}
            />
          )}
        </Card>

        {/* Deactivate Option */}
        {driver.status === 'ACTIVE' && (
          <Button
            title="Deactivate Driver"
            onPress={handleDeactivate}
            variant="danger"
            style={styles.deactivateBtn}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  errorText: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.error,
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  },
  headerTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  profileCard: {
    alignItems: 'center',
    padding: 24,
    marginBottom: 20,
  },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.secondary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  name: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
    marginBottom: 8,
  },
  statusRow: {
    flexDirection: 'row',
  },
  sectionHeader: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
    marginTop: 10,
    marginBottom: 12,
  },
  detailsCard: {
    padding: 16,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoCol: {
    marginLeft: 14,
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    color: theme.colors.textMuted,
    fontWeight: theme.typography.weights.semibold,
    textTransform: 'uppercase',
  },
  infoVal: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text,
    marginTop: 2,
  },
  nicCard: {
    padding: 16,
    borderLeftWidth: 4,
    marginBottom: 24,
  },
  nicPendingBorder: {
    borderLeftColor: theme.colors.warning,
  },
  nicVerifiedBorder: {
    borderLeftColor: theme.colors.success,
  },
  nicHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  nicTitle: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    marginLeft: 8,
  },
  nicDesc: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
  reminderBtn: {
    marginTop: 14,
    height: 40,
    backgroundColor: theme.colors.warning,
  },
  deactivateBtn: {
    marginTop: 10,
    backgroundColor: theme.colors.error,
  },
});

export default DriverDetailScreen;
