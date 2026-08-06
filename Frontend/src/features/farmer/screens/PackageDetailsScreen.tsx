import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert 
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FarmerTabParamList } from '../../../navigation/types';
import { packageApi, PackageResponse } from '../../../api/package.api';
import { theme } from '../../../theme';
import { Card, RatingStars, PriceTag, Button } from '../../../components';
import { Ionicons } from '@expo/vector-icons';

type PackageDetailsRouteProp = RouteProp<FarmerTabParamList, 'PackageDetails'>;
type PackageDetailsNavigationProp = NativeStackNavigationProp<FarmerTabParamList, 'PackageDetails'>;

interface Props {
  route: PackageDetailsRouteProp;
  navigation: PackageDetailsNavigationProp;
}

export const PackageDetailsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { packageId } = route.params;
  const [pkg, setPkg] = useState<PackageResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVeg, setSelectedVeg] = useState<number | null>(null);

  const loadDetail = async () => {
    setLoading(true);
    try {
      const data = await packageApi.getPackageDetail(packageId);
      setPkg(data);
      if (data.vegetables && data.vegetables.length > 0) {
        setSelectedVeg(data.vegetables[0].id); // default select first
      }
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to load trip details');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetail();
  }, [packageId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!pkg) return null;

  const handleBook = () => {
    if (selectedVeg === null) {
      Alert.alert('Select Vegetable', 'Please choose which vegetable type you want to book.');
      return;
    }
    
    const selectedVegData = pkg.vegetables.find(v => v.id === selectedVeg);
    if (!selectedVegData) return;

    if (selectedVegData.remainingKg <= 0) {
      Alert.alert('Capacity Full', `${selectedVegData.vegetableName} capacity is fully booked.`);
      return;
    }

    navigation.navigate('BookingForm', {
      packageId: pkg.packageId,
      vegetableName: selectedVegData.vegetableName,
      initialPrice: selectedVegData.pricePerKg});
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Trip Details</Text>
        </View>

        {/* Destination Card */}
        <Card style={styles.mainCard}>
          <View style={styles.marketHeader}>
            <Ionicons name="location" size={28} color={theme.colors.primary} />
            <View style={styles.marketInfo}>
              <Text style={styles.destinationLabel}>MARKET DESTINATION</Text>
              <Text style={styles.destinationVal}>{pkg.marketDestination}</Text>
            </View>
          </View>
          <View style={styles.capacityProgressSection}>
            <View style={styles.capacityMeta}>
              <Text style={styles.capacityMetaLabel}>Overall Remaining Capacity</Text>
              <Text style={styles.capacityMetaVal}>{pkg.remainingCapacityKg} / {pkg.totalCapacityKg} KG</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[
                styles.progressBarFill, 
                { width: `${(pkg.remainingCapacityKg / pkg.totalCapacityKg) * 100}%` }
              ]} />
            </View>
          </View>
        </Card>

        {/* Trip Schedule & Vehicle */}
        <Text style={styles.sectionTitle}>Schedule & Transport</Text>
        <Card style={styles.detailCard}>
          <View style={styles.detailRow}>
            <View style={styles.detailIconBox}>
              <Ionicons name="calendar" size={22} color={theme.colors.primary} />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Travel Date & Time</Text>
              <Text style={styles.detailValue}>
                {new Date(pkg.travelDateTime).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </Text>
              <Text style={styles.detailSubValue}>
                Departure: {new Date(pkg.travelDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailIconBox}>
              <Ionicons name="time" size={22} color={theme.colors.secondary} />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Pickup Windows</Text>
              <Text style={styles.detailValue}>
                Starts: {pkg.pickupWindowStart ? new Date(pkg.pickupWindowStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Flexible'}
              </Text>
              <Text style={styles.detailSubValue}>
                Ends: {pkg.pickupWindowEnd ? new Date(pkg.pickupWindowEnd).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Flexible'}
              </Text>
            </View>
          </View>

          {(pkg.vehicleType || pkg.vehicleNumber) && (
            <View style={styles.detailRow}>
              <View style={styles.detailIconBox}>
                <Ionicons name="bus" size={22} color="#6366f1" />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Vehicle Information</Text>
                <Text style={styles.detailValue}>
                  {pkg.vehicleType || 'Transport Lorry'}
                </Text>
                {pkg.vehicleNumber && (
                  <Text style={styles.detailSubValue}>
                    License Plate: {pkg.vehicleNumber}
                  </Text>
                )}
              </View>
            </View>
          )}
        </Card>

        {/* Agency Info */}
        <Text style={styles.sectionTitle}>Marketing Agency</Text>
        <Card style={styles.agencyCard}>
          <View style={styles.agencyInfoRow}>
            <View style={styles.agencyAvatar}>
              <Text style={styles.avatarText}>{pkg.agencyName.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={styles.agencyTextMeta}>
              <Text style={styles.agencyName}>{pkg.agencyName}</Text>
              <View style={styles.agencyRatingBox}>
                <RatingStars rating={pkg.agencyRating || 0} size={16} />
                <Text style={styles.agencyRatingLabel}>
                  {pkg.agencyRating ? pkg.agencyRating.toFixed(1) : 'No'} ratings ({pkg.agencyTotalRatings || 0} reviews)
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.agencyContactRow}>
            <Ionicons name="call" size={16} color={theme.colors.textSecondary} />
            <Text style={styles.agencyContactText}>{pkg.agencyPhone}</Text>
          </View>
        </Card>

        {/* Vegetables pricing selection */}
        <Text style={styles.sectionTitle}>Select Vegetables to Book</Text>
        <Text style={styles.sectionDesc}>Tap a vegetable below to view and book capacity.</Text>

        {pkg.vegetables.map((veg) => {
          const isSelected = selectedVeg === veg.id;
          const isVegFull = veg.remainingKg <= 0;
          
          return (
            <TouchableOpacity
              key={veg.id}
              activeOpacity={0.8}
              style={[
                styles.vegSelectorCard,
                isSelected && styles.vegCardSelected,
                isVegFull && styles.vegCardFull
              ]}
              onPress={() => !isVegFull && setSelectedVeg(veg.id)}
              disabled={isVegFull}
            >
              <View style={styles.vegCardLeft}>
                <View style={[
                  styles.checkbox,
                  isSelected && styles.checkboxChecked,
                  isVegFull && styles.checkboxDisabled
                ]}>
                  {isSelected && <Ionicons name="checkmark" size={14} color="#ffffff" />}
                </View>
                <View style={styles.vegNameBox}>
                  <Text style={[styles.vegNameText, isVegFull && styles.textLineThrough]}>
                    {veg.vegetableName}
                  </Text>
                  <Text style={styles.vegCapRemaining}>
                    {isVegFull ? 'Out of capacity' : `${veg.remainingKg} kg left of max ${veg.maxKg} kg`}
                  </Text>
                </View>
              </View>
              <PriceTag price={veg.pricePerKg} />
            </TouchableOpacity>
          );
        })}

        {/* Confirm book */}
        <Button 
          title="Book Selected Cargo Capacity" 
          onPress={handleBook} 
          disabled={selectedVeg === null}
          style={styles.bookButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background},
  scrollContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20},
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginRight: 16},
  headerTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text},
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'},
  mainCard: {
    padding: 20,
    marginBottom: 24},
  marketHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20},
  marketInfo: {
    marginLeft: 16},
  destinationLabel: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textMuted,
    letterSpacing: 0.5},
  destinationVal: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
    marginTop: 2},
  capacityProgressSection: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(226, 232, 240, 0.5)',
    paddingTop: 16},
  capacityMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8},
  capacityMetaLabel: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.weights.medium},
  capacityMetaVal: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text},
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.border,
    width: '100%',
    overflow: 'hidden'},
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: theme.colors.primary},
  sectionTitle: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
    marginBottom: 12},
  sectionDesc: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    marginBottom: 14},
  detailCard: {
    padding: 16,
    marginBottom: 20},
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16},
  detailIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14},
  detailContent: {
    flex: 1},
  detailLabel: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textMuted,
    marginBottom: 2},
  detailValue: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text},
  detailSubValue: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    marginTop: 2},
  agencyCard: {
    padding: 16,
    marginBottom: 20},
  agencyInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12},
  agencyAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16},
  avatarText: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primaryDark},
  agencyTextMeta: {
    flex: 1},
  agencyName: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
    marginBottom: 2},
  agencyRatingBox: {
    flexDirection: 'row',
    alignItems: 'center'},
  agencyRatingLabel: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    marginLeft: 6},
  agencyContactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10},
  agencyContactText: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textSecondary,
    marginLeft: 8},
  vegSelectorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: theme.colors.border},
  vegCardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: 'rgba(16, 185, 129, 0.02)'},
  vegCardFull: {
    backgroundColor: 'rgba(241, 245, 249, 0.5)',
    borderColor: theme.colors.border,
    opacity: 0.6},
  vegCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1},
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: theme.colors.borderDark,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14},
  checkboxChecked: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary},
  checkboxDisabled: {
    backgroundColor: theme.colors.border},
  vegNameBox: {
    flex: 1,
    paddingRight: 8},
  vegNameText: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
    marginBottom: 2},
  textLineThrough: {
    textDecorationLine: 'line-through'},
  vegCapRemaining: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary},
  bookButton: {
    marginTop: 24,
    backgroundColor: theme.colors.primary}});

export default PackageDetailsScreen;
