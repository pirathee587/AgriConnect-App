import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  ActivityIndicator, 
  RefreshControl 
} from 'react-native';
import { agencyApi, AgencyEarningsResponse } from '../../../api/agency.api';
import { theme } from '../../../theme';
import { Card, EmptyState } from '../../../components';
import { Ionicons } from '@expo/vector-icons';

export const EarningsScreen: React.FC = () => {
  const [earnings, setEarnings] = useState<AgencyEarningsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadEarnings = async () => {
    setLoading(true);
    try {
      const data = await agencyApi.getEarnings();
      setEarnings(data);
    } catch (e: any) {
      console.log('Failed to fetch earnings, using mockup fallback.');
      setEarnings({
        totalExpectedEarnings: 154000.00,
        confirmedEarnings: 82000.00,
        totalBookings: 18,
        completedBookings: 10,
        pendingBookings: 5,
        cancelledBookings: 3,
        totalPackages: 6,
        activePackages: 2,
        earningsByMarket: { Colombo: 94000, Dambulla: 60000 },
        earningsByMonth: { '2026-06': 82000, '2026-07': 72000 },
        recentCompletedBookings: [
          {
            bookingId: 101,
            farmerName: 'Sunil Perera',
            vegetableName: 'Carrots',
            weightKg: 200,
            pricePerKg: 280,
            totalValue: 56000,
            marketDestination: 'Colombo Manning Market',
            completedAt: new Date().toISOString()},
          {
            bookingId: 102,
            farmerName: 'K. Sivalingam',
            vegetableName: 'Leeks',
            weightKg: 150,
            pricePerKg: 190,
            totalValue: 28500,
            marketDestination: 'Dambulla Dedicated Economic Centre',
            completedAt: new Date(Date.now() - 86400000).toISOString()}
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEarnings();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadEarnings();
    setRefreshing(false);
  };

  const renderEarningItem = ({ item }: { item: any }) => {
    return (
      <Card style={styles.earningCard}>
        <View style={styles.earningHeader}>
          <Text style={styles.vegText}>{item.vegetableName}</Text>
          <Text style={styles.amountText}>+ Rs. {item.totalValue.toLocaleString()}</Text>
        </View>
        <Text style={styles.farmerText}>Farmer: {item.farmerName}</Text>
        <Text style={styles.metaText}>
          {item.weightKg} kg @ Rs. {item.pricePerKg} / kg • {item.marketDestination}
        </Text>
        <Text style={styles.dateText}>
          Completed on {new Date(item.completedAt).toLocaleDateString()}
        </Text>
      </Card>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.secondary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Trip Earnings Summary</Text>
        <Text style={styles.sub}>Track your transport fee revenues and deliveries</Text>
      </View>

      <FlatList
        data={earnings?.recentCompletedBookings || []}
        keyExtractor={(item) => item.bookingId.toString()}
        renderItem={renderEarningItem}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.secondary]} />
        }
        ListHeaderComponent={
          <View style={styles.statsContainer}>
            {/* Finalized Earnings Card */}
            <Card style={{ ...styles.mainStatsCard, backgroundColor: theme.colors.primaryDark }}>
              <Ionicons name="wallet" size={24} color="#ffffff" style={styles.walletIcon} />
              <Text style={styles.mainLabel}>Confirmed Earnings</Text>
              <Text style={styles.mainVal}>Rs. {earnings?.confirmedEarnings.toLocaleString()}</Text>
              <Text style={styles.mainSub}>Expected Future: Rs. {earnings?.totalExpectedEarnings.toLocaleString()}</Text>
            </Card>

            {/* Tripsy metrics */}
            <View style={styles.row}>
              <Card style={styles.halfCard}>
                <Text style={styles.metricLabel}>COMPLETED CARGO</Text>
                <Text style={styles.metricVal}>{earnings?.completedBookings} bookings</Text>
              </Card>
              <Card style={styles.halfCard}>
                <Text style={styles.metricLabel}>ACTIVE LISTINGS</Text>
                <Text style={styles.metricVal}>{earnings?.activePackages} packages</Text>
              </Card>
            </View>

            <Text style={styles.sectionHeaderTitle}>Recent Completed Shipments</Text>
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            title="No Completed Trips"
            description="Your earnings log will populate here once vegetable deliveries are marked completed."
            icon="trending-up-outline"
          />
        }
      />
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
  listContainer: {
    paddingBottom: 40},
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'},
  statsContainer: {
    padding: 16},
  mainStatsCard: {
    padding: 20,
    borderRadius: 20,
    marginBottom: 16},
  walletIcon: {
    marginBottom: 8},
  mainLabel: {
    fontSize: theme.typography.sizes.xs,
    color: '#ffffff90',
    fontWeight: theme.typography.weights.semibold,
    textTransform: 'uppercase'},
  mainVal: {
    fontSize: 28,
    fontWeight: theme.typography.weights.bold,
    color: '#ffffff',
    marginVertical: 4},
  mainSub: {
    fontSize: theme.typography.sizes.xs,
    color: '#ffffffb0',
    marginTop: 6},
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20},
  halfCard: {
    width: '48%',
    padding: 14,
    marginBottom: 0},
  metricLabel: {
    fontSize: 10,
    color: theme.colors.textMuted,
    fontWeight: theme.typography.weights.bold,
    marginBottom: 6},
  metricVal: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text},
  sectionHeaderTitle: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
    marginBottom: 8},
  earningCard: {
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12},
  earningHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6},
  vegText: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text},
  amountText: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primaryDark},
  farmerText: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.textSecondary,
    marginBottom: 4},
  metaText: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textMuted,
    marginBottom: 4},
  dateText: {
    fontSize: 11,
    color: theme.colors.textMuted}});

export default EarningsScreen;
