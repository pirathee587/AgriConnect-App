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
import { fetchMyBookingsSuccess, bookingFailure, bookingStart, updateBookingStatusSuccess } from '../../../store/slices/bookingSlice';
import { theme } from '../../../theme';
import { Card, StatusBadge, EmptyState, Button } from '../../../components';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FarmerTabParamList } from '../../../navigation/types';

type MyBookingsNavigationProp = NativeStackNavigationProp<FarmerTabParamList, 'MyBookings'>;

interface Props {
  navigation: MyBookingsNavigationProp;
}

export const MyBookingsScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch();
  const { myBookings, loading } = useSelector((state: RootState) => state.bookings);
  const [refreshing, setRefreshing] = useState(false);

  const loadBookings = async () => {
    dispatch(bookingStart());
    try {
      const data = await bookingApi.getMyBookings();
      dispatch(fetchMyBookingsSuccess(data));
    } catch (e: any) {
      dispatch(bookingFailure(e.message || 'Failed to fetch bookings'));
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadBookings();
    setRefreshing(false);
  };

  const handleCancelBooking = (bookingId: number) => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this transport booking? This action cannot be undone.',
      [
        { text: 'No, Keep It', style: 'cancel' },
        { 
          text: 'Yes, Cancel', 
          style: 'destructive',
          onPress: async () => {
            dispatch(bookingStart());
            try {
              const res = await bookingApi.cancelBooking(bookingId);
              dispatch(updateBookingStatusSuccess({ bookingId, status: 'CANCELLED' }));
              Alert.alert('Booking Cancelled', 'Your vegetable transport request has been cancelled.');
              loadBookings(); // reload
            } catch (e: any) {
              Alert.alert('Cancellation Failed', e.message || 'Could not cancel booking.');
            }
          }
        }
      ]
    );
  };

  const renderBookingItem = ({ item }: { item: BookingResponse }) => {
    const isCancellable = item.status === 'PENDING_APPROVAL' || item.status === 'APPROVED';
    const isCompletedAndUnrated = item.status === 'COMPLETED' && !item.isRated;
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
            <Text style={styles.metaLabel}>Price snapshot</Text>
            <Text style={styles.metaVal}>Rs. {item.priceAtBooking} / kg</Text>
          </View>
          <View style={styles.metaCol}>
            <Text style={styles.metaLabel}>Est. Value</Text>
            <Text style={styles.metaVal}>Rs. {bookingValue.toLocaleString()}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.addressRow}>
          <Ionicons name="location-outline" size={16} color={theme.colors.textMuted} />
          <Text style={styles.addressText} numberOfLines={1}>
            {item.pickupAddress}
          </Text>
        </View>

        <View style={styles.agencyInfoRow}>
          <View style={styles.agencyMeta}>
            <Ionicons name="person-outline" size={14} color={theme.colors.textSecondary} />
            <Text style={styles.agencyText}>Agency: {item.agencyName || 'Verifying'}</Text>
          </View>
          <View style={styles.agencyMeta}>
            <Ionicons name="call-outline" size={14} color={theme.colors.textSecondary} />
            <Text style={styles.agencyText}>{item.agencyPhone || 'N/A'}</Text>
          </View>
        </View>

        {item.cancelReason && (
          <View style={styles.reasonBox}>
            <Text style={styles.reasonTitle}>Cancellation Reason:</Text>
            <Text style={styles.reasonText}>{item.cancelReason}</Text>
          </View>
        )}

        {(isCancellable || isCompletedAndUnrated) && (
          <View style={styles.actionButtons}>
            {isCancellable && (
              <Button 
                title="Cancel Booking" 
                variant="outline"
                onPress={() => handleCancelBooking(item.bookingId)}
                style={styles.cancelBtn}
                textStyle={styles.cancelBtnText}
              />
            )}
            {isCompletedAndUnrated && (
              <Button 
                title="Rate Agency & Trip" 
                variant="secondary"
                onPress={() => navigation.navigate('RateAgency', {
                  bookingId: item.bookingId,
                  agencyName: item.agencyName || 'Agency',
                  marketDestination: item.marketDestination})}
                style={styles.rateBtn}
              />
            )}
          </View>
        )}
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Crop Bookings</Text>
        <Text style={styles.sub}>Track vegetable transport details and statuses</Text>
      </View>

      {loading && myBookings.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={myBookings}
          keyExtractor={(item) => item.bookingId.toString()}
          renderItem={renderBookingItem}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />
          }
          ListEmptyComponent={
            <EmptyState
              title="No Bookings Placed Yet"
              description="Browse the listed trips and book vegetable transport capacity to get started."
              icon="document-text-outline"
              actionTitle="Find Active Trips"
              onActionPress={() => navigation.navigate('PackageList')}
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
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10},
  addressText: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    marginLeft: 6,
    flex: 1},
  agencyInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
    backgroundColor: theme.colors.background,
    padding: 10,
    borderRadius: 8},
  agencyMeta: {
    flexDirection: 'row',
    alignItems: 'center'},
  agencyText: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.textSecondary,
    marginLeft: 4},
  reasonBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.04)',
    borderColor: 'rgba(239, 68, 68, 0.2)',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginTop: 12},
  reasonTitle: {
    fontSize: 11,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.error,
    marginBottom: 2},
  reasonText: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    lineHeight: 16},
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(226, 232, 240, 0.5)',
    paddingTop: 12},
  cancelBtn: {
    height: 38,
    paddingHorizontal: 16,
    borderColor: theme.colors.error,
    borderWidth: 1},
  cancelBtnText: {
    color: theme.colors.error,
    fontSize: theme.typography.sizes.xs},
  rateBtn: {
    height: 38,
    paddingHorizontal: 16,
    backgroundColor: theme.colors.secondary}});

export default MyBookingsScreen;
