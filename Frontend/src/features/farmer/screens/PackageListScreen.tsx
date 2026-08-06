import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  TextInput, 
  ActivityIndicator,
  ScrollView 
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../store';
import { packageApi, PackageResponse } from '../../../api/package.api';
import { fetchAvailableSuccess, packageFailure, packageStart } from '../../../store/slices/packageSlice';
import { theme } from '../../../theme';
import { Card, RatingStars, EmptyState } from '../../../components';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FarmerTabParamList } from '../../../navigation/types';

type PackageListNavigationProp = NativeStackNavigationProp<FarmerTabParamList, 'PackageList'>;

interface Props {
  navigation: PackageListNavigationProp;
}

export const PackageListScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch();
  const { availablePackages, loading } = useSelector((state: RootState) => state.packages);
  const [selectedMarket, setSelectedMarket] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const markets = ['All', 'Dambulla', 'Colombo', 'Kandy', 'Jaffna'];

  const loadPackages = async () => {
    dispatch(packageStart());
    try {
      let data: PackageResponse[];
      if (selectedMarket === 'All') {
        data = await packageApi.getAvailablePackages();
      } else {
        data = await packageApi.getPackagesByMarket(selectedMarket);
      }
      dispatch(fetchAvailableSuccess(data));
    } catch (e: any) {
      dispatch(packageFailure(e.message || 'Failed to fetch packages'));
    }
  };

  useEffect(() => {
    loadPackages();
  }, [selectedMarket]);

  const getFilteredPackages = () => {
    if (!searchQuery.trim()) return availablePackages;
    
    return availablePackages.filter(pkg => 
      pkg.marketDestination.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pkg.agencyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pkg.vegetables.some(v => v.vegetableName.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  };

  const filteredData = getFilteredPackages();

  const renderPackageItem = ({ item }: { item: PackageResponse }) => {
    const isFull = item.status === 'FULL' || item.remainingCapacityKg <= 0;
    
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => navigation.navigate('PackageDetails', { packageId: item.packageId })}
      >
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.marketInfo}>
              <Ionicons name="location" size={18} color={theme.colors.primary} />
              <Text style={styles.marketText}>{item.marketDestination}</Text>
            </View>
            <View style={[
              styles.capacityBadge,
              isFull ? styles.capacityFull : styles.capacityOpen
            ]}>
              <Text style={[
                styles.capacityText,
                isFull ? styles.textFull : styles.textOpen
              ]}>
                {isFull ? 'FULL' : `${item.remainingCapacityKg} kg left`}
              </Text>
            </View>
          </View>

          <View style={styles.agencyRow}>
            <View style={styles.agencyAvatar}>
              <Text style={styles.avatarLetter}>{item.agencyName.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={styles.agencyMeta}>
              <Text style={styles.agencyName}>{item.agencyName}</Text>
              <View style={styles.ratingRow}>
                <RatingStars rating={item.agencyRating || 0} size={14} />
                <Text style={styles.ratingsCount}>({item.agencyTotalRatings || 0})</Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailsContainer}>
            <View style={styles.detailItem}>
              <Ionicons name="calendar-outline" size={16} color={theme.colors.textMuted} />
              <Text style={styles.detailText}>
                {new Date(item.travelDateTime).toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="time-outline" size={16} color={theme.colors.textMuted} />
              <Text style={styles.detailText}>
                {new Date(item.travelDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          </View>

          <View style={styles.vegetablesList}>
            <Text style={styles.vegLabel}>Accepts: </Text>
            <Text style={styles.vegItems} numberOfLines={1}>
              {item.vegetables.map(v => `${v.vegetableName} (Rs.${v.pricePerKg})`).join(', ')}
            </Text>
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Search Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Available Trips</Text>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color={theme.colors.textMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by vegetable, agency, destination..."
            placeholderTextColor={theme.colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={theme.colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Markets Filter Selector */}
      <View style={styles.filterWrapper}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {markets.map((market) => (
            <TouchableOpacity
              key={market}
              style={[
                styles.filterBtn,
                selectedMarket === market ? styles.filterBtnActive : {}
              ]}
              onPress={() => setSelectedMarket(market)}
            >
              <Text style={[
                styles.filterText,
                selectedMarket === market ? styles.filterTextActive : {}
              ]}>
                {market}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Packages list */}
      {loading && filteredData.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredData}
          keyExtractor={(item) => item.packageId.toString()}
          renderItem={renderPackageItem}
          contentContainerStyle={styles.listContainer}
          refreshing={loading}
          onRefresh={loadPackages}
          ListEmptyComponent={
            <EmptyState
              title="No Transport Trips Found"
              description={
                searchQuery 
                  ? "We couldn't find any trips matching your search query. Try typing something else." 
                  : "There are currently no active transport trips listed for " + selectedMarket + " market."
              }
              icon="bus-outline"
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
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border},
  title: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
    marginBottom: 12},
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    paddingHorizontal: 12},
  searchIcon: {
    marginRight: 8},
  searchInput: {
    flex: 1,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text},
  filterWrapper: {
    backgroundColor: '#ffffff',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border},
  filterScroll: {
    paddingHorizontal: 16},
  filterBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: theme.colors.background,
    marginRight: 10,
    borderWidth: 1,
    borderColor: theme.colors.border},
  filterBtnActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary},
  filterText: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.textSecondary},
  filterTextActive: {
    color: '#ffffff'},
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
    marginBottom: 14},
  marketInfo: {
    flexDirection: 'row',
    alignItems: 'center'},
  marketText: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
    marginLeft: 6},
  capacityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8},
  capacityOpen: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)'},
  capacityFull: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)'},
  capacityText: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.bold},
  textOpen: {
    color: theme.colors.success},
  textFull: {
    color: theme.colors.error},
  agencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12},
  agencyAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12},
  avatarLetter: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primaryDark},
  agencyMeta: {
    flex: 1},
  agencyName: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
    marginBottom: 2},
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center'},
  ratingsCount: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textMuted,
    marginLeft: 4},
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: 12},
  detailsContainer: {
    flexDirection: 'row',
    marginBottom: 12},
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20},
  detailText: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    marginLeft: 6},
  vegetablesList: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: 'rgba(241, 245, 249, 0.8)',
    padding: 10,
    borderRadius: 8},
  vegLabel: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textSecondary},
  vegItems: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    flex: 1}});

export default PackageListScreen;
