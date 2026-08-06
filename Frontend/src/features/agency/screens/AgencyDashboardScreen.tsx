import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  RefreshControl,
  Alert 
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../store';
import { agencyApi, AgencyProfileResponse } from '../../../api/agency.api';
import { packageApi, PackageResponse } from '../../../api/package.api';
import { fetchMyPackagesSuccess, packageStart, packageFailure } from '../../../store/slices/packageSlice';
import { updateAgencyStatus } from '../../../store/slices/authSlice';
import { theme } from '../../../theme';
import { Card, StatusBadge, Button } from '../../../components';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AgencyTabParamList } from '../../../navigation/types';

type AgencyDashboardNavigationProp = NativeStackNavigationProp<AgencyTabParamList, 'AgencyDashboard'>;

interface Props {
  navigation: AgencyDashboardNavigationProp;
}

export const AgencyDashboardScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch();
  const agencyStatus = useSelector((state: RootState) => state.auth.agencyStatus);
  const userName = useSelector((state: RootState) => state.auth.name);
  const { myPackages, loading } = useSelector((state: RootState) => state.packages);
  const [refreshing, setRefreshing] = useState(false);
  const [profile, setProfile] = useState<AgencyProfileResponse | null>(null);

  const loadData = async () => {
    dispatch(packageStart());
    try {
      // Fetch latest profile status
      const prof = await agencyApi.getProfile();
      setProfile(prof);
      dispatch(updateAgencyStatus(prof.agencyStatus));

      if (prof.agencyStatus === 'ACTIVE') {
        const pkgs = await packageApi.getMyPackages();
        dispatch(fetchMyPackagesSuccess(pkgs));
      }
    } catch (e: any) {
      dispatch(packageFailure(e.message || 'Failed to sync data'));
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Good Morning / காலை வணக்கம்';
    if (hr < 17) return 'Good Afternoon / மதிய வணக்கம்';
    return 'Good Evening / மாலை வணக்கம்';
  };

  // Render Status Banners
  const renderStatusBanner = () => {
    switch (agencyStatus) {
      case 'PENDING_APPROVAL':
        return (
          <Card style={{ ...styles.bannerCard, borderColor: theme.colors.warning }}>
            <View style={styles.bannerHeader}>
              <Ionicons name="time-outline" size={24} color={theme.colors.warning} />
              <Text style={[styles.bannerTitle, { color: theme.colors.warning }]}>Verification Pending</Text>
            </View>
            <Text style={styles.bannerText}>
              Your account registration is received. The Administrator is reviewing your uploaded National Identity Card (NIC) documents. This usually takes less than 24 hours.
            </Text>
          </Card>
        );
      case 'PENDING_PAYMENT':
        return (
          <Card style={{ ...styles.bannerCard, borderColor: theme.colors.secondary }}>
            <View style={styles.bannerHeader}>
              <Ionicons name="card-outline" size={24} color={theme.colors.secondary} />
              <Text style={[styles.bannerTitle, { color: theme.colors.secondary }]}>Payment Activation Required</Text>
            </View>
            <Text style={styles.bannerText}>
              Congratulations! Your profile has been approved by the Admin. Please pay the small platform activation fee to activate your account and start posting travel packages.
            </Text>
            <Button 
              title="Pay Activation Fee" 
              variant="secondary"
              onPress={() => navigation.navigate('ActivationPayment')}
              style={styles.bannerBtn}
            />
          </Card>
        );
      case 'SUSPENDED':
        return (
          <Card style={{ ...styles.bannerCard, borderColor: theme.colors.error }}>
            <View style={styles.bannerHeader}>
              <Ionicons name="alert-circle-outline" size={24} color={theme.colors.error} />
              <Text style={[styles.bannerTitle, { color: theme.colors.error }]}>Account Suspended</Text>
            </View>
            <Text style={styles.bannerText}>
              Your account is suspended due to a policy violation or review feedback. Please contact platform support for resolution details.
            </Text>
          </Card>
        );
      case 'REJECTED':
        return (
          <Card style={{ ...styles.bannerCard, borderColor: theme.colors.error }}>
            <View style={styles.bannerHeader}>
              <Ionicons name="close-circle-outline" size={24} color={theme.colors.error} />
              <Text style={[styles.bannerTitle, { color: theme.colors.error }]}>Application Rejected</Text>
            </View>
            <Text style={styles.bannerText}>
              Your registration application was rejected. Please re-upload clear front & back photo copies of your NIC.
            </Text>
            <Button 
              title="Upload NIC Scans" 
              variant="danger"
              onPress={() => navigation.navigate('NicUpload')}
              style={styles.bannerBtn}
            />
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.secondary]} />}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.userName}>{userName || 'Agency'}</Text>
          </View>
          <TouchableOpacity 
            style={styles.profileBadge}
            onPress={() => navigation.navigate('AgencyProfile')}
          >
            <Ionicons name="bus" size={20} color={theme.colors.secondaryDark} />
          </TouchableOpacity>
        </View>

        {renderStatusBanner()}

        {agencyStatus === 'ACTIVE' && (
          <View>
            {/* Quick stats */}
            <View style={styles.statsRow}>
              <Card style={styles.statsCard}>
                <Text style={styles.statsLabel}>Listed Trips</Text>
                <Text style={styles.statsVal}>{myPackages.filter(p => p.status === 'OPEN' || p.status === 'FULL').length}</Text>
              </Card>
              <Card style={styles.statsCard}>
                <Text style={styles.statsLabel}>Total Bookings</Text>
                <Text style={styles.statsVal}>
                  {myPackages.reduce((acc, p) => acc + (p.confirmedBookings || 0), 0)}
                </Text>
              </Card>
            </View>

            {/* Quick Actions */}
            <Card style={styles.actionsCard}>
              <Text style={styles.actionsHeader}>Agency Operations</Text>
              <View style={styles.actionsRow}>
                <TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate('CreatePackage')}>
                  <View style={[styles.actionIconBox, { backgroundColor: theme.colors.secondary + '10' }]}>
                    <Ionicons name="add-circle" size={24} color={theme.colors.secondary} />
                  </View>
                  <Text style={styles.actionText}>Add Trip</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate('BookingRequests')}>
                  <View style={[styles.actionIconBox, { backgroundColor: theme.colors.info + '10' }]}>
                    <Ionicons name="checkbox" size={24} color={theme.colors.info} />
                  </View>
                  <Text style={styles.actionText}>Requests</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate('DriverList' as any)}>
                  <View style={[styles.actionIconBox, { backgroundColor: theme.colors.primary + '10' }]}>
                    <Ionicons name="people" size={24} color={theme.colors.primary} />
                  </View>
                  <Text style={styles.actionText}>Drivers</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate('VehicleList' as any)}>
                  <View style={[styles.actionIconBox, { backgroundColor: theme.colors.warning + '10' }]}>
                    <Ionicons name="bus" size={24} color={theme.colors.warning} />
                  </View>
                  <Text style={styles.actionText}>Fleet</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate('Earnings')}>
                  <View style={[styles.actionIconBox, { backgroundColor: theme.colors.secondary + '10' }]}>
                    <Ionicons name="trending-up" size={24} color={theme.colors.secondary} />
                  </View>
                  <Text style={styles.actionText}>Earnings</Text>
                </TouchableOpacity>
              </View>
            </Card>

            {/* Listed Trips */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>My Transport Packages</Text>
              <TouchableOpacity onPress={() => navigation.navigate('ManagePackages')}>
                <Text style={styles.viewAllText}>Manage</Text>
              </TouchableOpacity>
            </View>

            {myPackages.map((pkg) => {
              const bookedPercent = ((pkg.totalCapacityKg - pkg.remainingCapacityKg) / pkg.totalCapacityKg) * 100;
              
              return (
                <TouchableOpacity
                  key={pkg.packageId}
                  activeOpacity={0.9}
                  onPress={() => navigation.navigate('UpdatePrice', { packageId: pkg.packageId })}
                >
                  <Card style={styles.tripCard}>
                    <View style={styles.tripHeader}>
                      <View style={styles.destBox}>
                        <Ionicons name="location" size={16} color={theme.colors.secondary} />
                        <Text style={styles.destText}>{pkg.marketDestination}</Text>
                      </View>
                      <StatusBadge status={pkg.status} />
                    </View>

                    <Text style={styles.dateText}>
                      Departs: {new Date(pkg.travelDateTime).toLocaleDateString()} at {new Date(pkg.travelDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>

                    <View style={styles.progressBarSection}>
                      <View style={styles.progressLabelRow}>
                        <Text style={styles.progressLabel}>Booked Capacity</Text>
                        <Text style={styles.progressVal}>{Math.round(bookedPercent)}% ({pkg.totalCapacityKg - pkg.remainingCapacityKg} kg)</Text>
                      </View>
                      <View style={styles.progressBg}>
                        <View style={[styles.progressFill, { width: `${bookedPercent}%` }]} />
                      </View>
                    </View>

                    <View style={styles.vegBox}>
                      <Text style={styles.vegLabel}>Crops / Pricing:</Text>
                      <Text style={styles.vegVal} numberOfLines={1}>
                        {pkg.vegetables.map(v => `${v.vegetableName} (Rs.${v.pricePerKg})`).join(', ')}
                      </Text>
                    </View>
                  </Card>
                </TouchableOpacity>
              );
            })}

            {myPackages.length === 0 && !loading && (
              <View style={styles.emptyContainer}>
                <Ionicons name="bus-outline" size={48} color={theme.colors.textMuted} />
                <Text style={styles.emptyText}>You haven't listed any trips yet.</Text>
                <Button 
                  title="List My First Trip" 
                  variant="secondary"
                  onPress={() => navigation.navigate('CreatePackage')}
                  style={styles.emptyBtn}
                />
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background},
  scrollContainer: {
    paddingHorizontal: 18,
    paddingBottom: 24},
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20},
  greeting: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.weights.medium},
  userName: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text},
  profileBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fef3c7',
    justifyContent: 'center',
    alignItems: 'center'},
  bannerCard: {
    borderLeftWidth: 5,
    padding: 16,
    marginBottom: 24},
  bannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8},
  bannerTitle: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    marginLeft: 8},
  bannerText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    lineHeight: 20},
  bannerBtn: {
    height: 42,
    marginTop: 14},
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16},
  statsCard: {
    width: '48%',
    padding: 16,
    alignItems: 'center'},
  statsLabel: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.weights.semibold,
    textTransform: 'uppercase',
    marginBottom: 6},
  statsVal: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text},
  actionsCard: {
    padding: 16,
    marginBottom: 24},
  actionsHeader: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textMuted,
    fontWeight: theme.typography.weights.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 16},
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around'},
  actionItem: {
    alignItems: 'center'},
  actionIconBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6},
  actionText: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textSecondary},
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 14},
  sectionTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text},
  viewAllText: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.secondary},
  tripCard: {
    padding: 16,
    marginBottom: 12},
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8},
  destBox: {
    flexDirection: 'row',
    alignItems: 'center'},
  destText: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
    marginLeft: 6},
  dateText: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textMuted,
    marginBottom: 14},
  progressBarSection: {
    marginBottom: 14},
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6},
  progressLabel: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.weights.medium},
  progressVal: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text},
  progressBg: {
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.border,
    overflow: 'hidden'},
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.secondary},
  vegBox: {
    flexDirection: 'row',
    backgroundColor: theme.colors.background,
    padding: 8,
    borderRadius: 8},
  vegLabel: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textSecondary,
    marginRight: 4},
  vegVal: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    flex: 1},
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 32,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
    marginTop: 10},
  emptyText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    marginTop: 12,
    marginBottom: 16},
  emptyBtn: {
    height: 44,
    paddingHorizontal: 20,
    backgroundColor: theme.colors.secondary}});

export default AgencyDashboardScreen;
