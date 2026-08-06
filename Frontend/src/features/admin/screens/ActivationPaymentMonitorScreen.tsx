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
import { adminApi, PaymentEntryResponse } from '../../../api/admin.api';
import { theme } from '../../../theme';
import { Card, StatusBadge, EmptyState } from '../../../components';
import { Ionicons } from '@expo/vector-icons';

export const ActivationPaymentMonitorScreen: React.FC = () => {
  const [payments, setPayments] = useState<PaymentEntryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadPayments = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getAllPayments();
      setPayments(data);
    } catch (e: any) {
      console.log('Failed to fetch payments, using sandbox mockups.');
      setPayments([
        {
          paymentId: 301,
          agencyId: 10,
          agencyName: 'Sunil Rajapakse',
          agencyPhone: '+94771234567',
          amount: 1000.00,
          currency: 'LKR',
          paymentReference: 'PAYHERE_REF_8293',
          paymentMethod: 'VISA',
          status: 'SUCCESS',
          failureReason: '',
          createdAt: new Date().toISOString()},
        {
          paymentId: 302,
          agencyId: 11,
          agencyName: 'M. Perera',
          agencyPhone: '+94777654321',
          amount: 1000.00,
          currency: 'LKR',
          paymentReference: 'PAYHERE_REF_9182',
          paymentMethod: 'MASTER',
          status: 'FAILED',
          failureReason: 'Insufficient funds on credit card',
          createdAt: new Date(Date.now() - 3600000).toISOString()}
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPayments();
    setRefreshing(false);
  };

  const renderPaymentItem = ({ item }: { item: PaymentEntryResponse }) => {
    return (
      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.amountBox}>
            <Text style={styles.amountText}>Rs. {item.amount.toLocaleString()}</Text>
            <Text style={styles.currencyText}>{item.currency}</Text>
          </View>
          <StatusBadge status={item.status} />
        </View>

        <View style={styles.agencyMetaBox}>
          <Text style={styles.agencyText}>Agency: {item.agencyName} ({item.agencyPhone})</Text>
          <Text style={styles.refText}>Ref: {item.paymentReference || 'N/A'} • Method: {item.paymentMethod || 'N/A'}</Text>
        </View>

        {item.failureReason ? (
          <View style={styles.errorBox}>
            <Ionicons name="warning" size={14} color={theme.colors.error} />
            <Text style={styles.errorText}>Failure Reason: {item.failureReason}</Text>
          </View>
        ) : null}

        <View style={styles.divider} />
        <Text style={styles.dateText}>
          Processed: {new Date(item.createdAt).toLocaleDateString()} at {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Payment Logs Monitor</Text>
        <Text style={styles.sub}>Track agency platform activation gateway transaction records</Text>
      </View>

      {loading && payments.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#475569" />
        </View>
      ) : (
        <FlatList
          data={payments}
          keyExtractor={(item) => item.paymentId.toString()}
          renderItem={renderPaymentItem}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#475569']} />
          }
          ListEmptyComponent={
            <EmptyState
              title="No Payments Logged"
              description="No agency activation payments have been recorded yet."
              icon="wallet-outline"
            />
          }
        />
      )}
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
    padding: 16,
    paddingBottom: 40},
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'},
  card: {
    padding: 16,
    marginBottom: 12},
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12},
  amountBox: {
    flexDirection: 'row',
    alignItems: 'baseline'},
  amountText: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text},
  currencyText: {
    fontSize: 10,
    color: theme.colors.textMuted,
    marginLeft: 4,
    fontWeight: theme.typography.weights.semibold},
  agencyMetaBox: {
    marginBottom: 8},
  agencyText: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textSecondary,
    marginBottom: 2},
  refText: {
    fontSize: 11,
    color: theme.colors.textMuted},
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.04)',
    borderColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    padding: 8,
    borderRadius: 8,
    marginVertical: 4},
  errorText: {
    fontSize: 11,
    color: theme.colors.error,
    marginLeft: 6,
    flex: 1},
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: 10},
  dateText: {
    fontSize: 10,
    color: theme.colors.textMuted}});

export default ActivationPaymentMonitorScreen;
