import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator, 
  RefreshControl 
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../store';
import { bookingApi, BookingResponse } from '../../../api/booking.api';
import { fetchPendingBookingsSuccess, bookingFailure, bookingStart, updateBookingStatusSuccess } from '../../../store/slices/bookingSlice';
import { theme } from '../../../theme';
import { Card, StatusBadge, Button, EmptyState } from '../../../components';
import { Ionicons } from '@expo/vector-icons';

export const BookingRequestsScreen: React.FC = () => {
  const dispatch = useDispatch();
  const { pendingBookings, loading } = useSelector((state: RootState) => state.bookings);
  const [refreshing, setRefreshing] = useState(false);

  const loadRequests = async () => {
    dispatch(bookingStart());
    try {
      const data = await bookingApi.getPendingBookings();
      dispatch(fetchPendingBookingsSuccess(data));
    } catch (e: any) {
      dispatch(bookingFailure(e.message || 'Failed to fetch pending requests.'));
      // Fallback empty list for developer testing
      dispatch(fetchPendingBookingsSuccess([]));
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRequests();
    setRefreshing(false);
  };

  const handleApprove = async (bookingId: number) => {
    dispatch(bookingStart());
    try {
      await bookingApi.approveBooking(bookingId);
      dispatch(updateBookingStatusSuccess({ bookingId, status: 'APPROVED' }));
      Alert.alert('Booking Approved', 'The farmer has been notified of the booking approval.');
      loadRequests();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Could not approve booking.');
    }
  };

  const handleReject = (bookingId: number) => {
    Alert.prompt(
      'Reject Request',
      'Please enter the reason for rejecting this booking (e.g. Lorry capacity full, Route change):',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async (reason?: string) => {
            if (!reason || !reason.trim()) {
              Alert.alert('Error', 'A reason is required to reject bookings.');
              return;
            }
            dispatch(bookingStart());
            try {
              await bookingApi.rejectBooking(bookingId, reason.trim());
              dispatch(updateBookingStatusSuccess({ bookingId, status: 'REJECTED' }));
              Alert.alert('Booking Rejected', 'The booking was rejected.');
              loadRequests();
            } catch (e: any) {
              Alert.alert('Error', e.message || 'Could not reject booking.');
            }
          }
        }
      ]
    );
  };

  const renderRequestItem = ({ item }: { item: BookingResponse }) => {
    const bookingValue = item.weightKg * item.priceAtBooking;
    
    return (
      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.vegText}>{item.vegetableName}</Text>
          <StatusBadge status={item.status} />
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaCol}>
            <Text style={styles.metaLabel}>Weight</Text>
            <Text style={styles.metaVal}>{item.weightKg} KG</Text>
          </View>
          <View style={styles.metaCol}>
            <Text style={styles.metaLabel}>Rate / kg</Text>
            <Text style={styles.metaVal}>Rs. {item.priceAtBooking}</Text>
          </View>
          <View style={styles.metaCol}>
            <Text style={styles.metaLabel}>Cargo Value</Text>
            <Text style={styles.metaVal}>Rs. {bookingValue.toLocaleString()}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoBox}>
          <View style={styles.infoLine}>
            <Ionicons name="person-outline" size={14} color={theme.colors.textSecondary} />
            <Text style={styles.infoText}>Farmer: {item.farmerName} ({item.farmerPhone})</Text>
          </View>
          <View style={styles.infoLine}>
            <Ionicons name="location-outline" size={14} color={theme.colors.textSecondary} />
            <Text style={styles.infoText}>Address: {item.pickupAddress}</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <Button 
            title="Reject" 
            variant="outline"
            onPress={() => handleReject(item.bookingId)}
            style={styles.rejectBtn}
            textStyle={styles.rejectText}
          />
          <Button 
            title="Approve Cargo" 
            variant="secondary"
            onPress={() => handleApprove(item.bookingId)}
            style={styles.approveBtn}
          />
        </View>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Pending Cargo Requests</Text>
        <Text style={styles.sub}>Review and approve crop transport requests from farmers</Text>
      </View>

      {loading && pendingBookings.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.secondary} />
        </View>
      ) : (
        <FlatList
          data={pendingBookings}
          keyExtractor={(item) => item.bookingId.toString()}
          renderItem={renderRequestItem}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.secondary]} />
          }
          ListEmptyComponent={
            <EmptyState
              title="No Pending Bookings"
              description="There are currently no new crop booking requests from farmers."
              icon="checkbox-outline"
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
    marginBottom: 14},
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16},
  vegText: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text},
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12},
  metaCol: {
    alignItems: 'flex-start'},
  metaLabel: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginBottom: 2,
    textTransform: 'uppercase'},
  metaVal: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text},
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: 12},
  infoBox: {
    backgroundColor: theme.colors.background,
    padding: 10,
    borderRadius: 8,
    marginBottom: 14},
  infoLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6},
  infoText: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    marginLeft: 6,
    flex: 1},
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(226, 232, 240, 0.5)',
    paddingTop: 12},
  rejectBtn: {
    width: '32%',
    height: 38,
    borderColor: theme.colors.error,
    borderWidth: 1},
  rejectText: {
    color: theme.colors.error,
    fontSize: theme.typography.sizes.xs},
  approveBtn: {
    width: '64%',
    height: 38,
    backgroundColor: theme.colors.secondary}});

export default BookingRequestsScreen;
