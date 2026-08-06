import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AdminTabParamList } from '../../../navigation/types';
import { driverApi } from '../../../api/driver.api';
import { VehicleResponse, VehicleStatus } from '../../../store/slices/driverSlice';
import { theme } from '../../../theme';
import { Card, StatusBadge, Input } from '../../../components';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  navigation: NativeStackNavigationProp<AdminTabParamList, 'VehicleRegistry'>;
};

export const VehicleRegistryScreen: React.FC<Props> = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [vehicles, setVehicles] = useState<VehicleResponse[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<VehicleResponse[]>([]);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | VehicleStatus>('ALL');

  const loadAllVehicles = useCallback(async () => {
    try {
      const data = await driverApi.adminGetAllVehicles();
      setVehicles(data);
      applyFilters(data, searchQuery, statusFilter);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Could not fetch global vehicle registry.');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, statusFilter]);

  useEffect(() => {
    loadAllVehicles();
  }, []);

  const applyFilters = (
    data: VehicleResponse[],
    search: string,
    status: 'ALL' | VehicleStatus
  ) => {
    let list = [...data];

    // Search by plate/agency/type
    if (search.trim()) {
      const query = search.toLowerCase();
      list = list.filter(
        (v) =>
          v.plateNumber.toLowerCase().includes(query) ||
          v.agencyName.toLowerCase().includes(query) ||
          v.vehicleTypeLabel.toLowerCase().includes(query)
      );
    }

    // Filter by availability status
    if (status !== 'ALL') {
      list = list.filter((v) => v.availabilityStatus === status);
    }

    setFilteredVehicles(list);
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    applyFilters(vehicles, text, statusFilter);
  };

  const handleStatusFilterChange = (filter: 'ALL' | VehicleStatus) => {
    setStatusFilter(filter);
    applyFilters(vehicles, searchQuery, filter);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAllVehicles();
    setRefreshing(false);
  };

  const renderVehicleIcon = (type: string) => {
    switch (type) {
      case 'LORRY':
        return <Ionicons name="bus" size={22} color={theme.colors.primary} />;
      case 'TRUCK':
        return <Ionicons name="car-sport" size={22} color={theme.colors.primary} />;
      case 'VAN':
        return <Ionicons name="car" size={22} color={theme.colors.primary} />;
      default:
        return <Ionicons name="construct" size={22} color={theme.colors.primary} />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Vehicle Registry (Audit)</Text>
      </View>

      <View style={styles.filterSection}>
        <Input
          placeholder="Search by plate, agency, type..."
          value={searchQuery}
          onChangeText={handleSearch}
          icon={<Ionicons name="search" size={20} color={theme.colors.textMuted} />}
          containerStyle={styles.searchBar}
        />

        <View style={styles.filterTabs}>
          <TouchableOpacity
            style={[styles.tab, statusFilter === 'ALL' && styles.tabActive]}
            onPress={() => handleStatusFilterChange('ALL')}
          >
            <Text style={[styles.tabText, statusFilter === 'ALL' && styles.tabTextActive]}>All</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, statusFilter === 'AVAILABLE' && styles.tabActive]}
            onPress={() => handleStatusFilterChange('AVAILABLE')}
          >
            <Text style={[styles.tabText, statusFilter === 'AVAILABLE' && styles.tabTextActive]}>
              Available
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, statusFilter === 'ASSIGNED' && styles.tabActive]}
            onPress={() => handleStatusFilterChange('ASSIGNED')}
          >
            <Text style={[styles.tabText, statusFilter === 'ASSIGNED' && styles.tabTextActive]}>
              Assigned
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, statusFilter === 'UNDER_MAINTENANCE' && styles.tabActive]}
            onPress={() => handleStatusFilterChange('UNDER_MAINTENANCE')}
          >
            <Text style={[styles.tabText, statusFilter === 'UNDER_MAINTENANCE' && styles.tabTextActive]}>
              Maintenance
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading && !refreshing ? (
        <ActivityIndicator color={theme.colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filteredVehicles}
          keyExtractor={(item) => String(item.vehicleId)}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="car-outline" size={48} color={theme.colors.textMuted} />
              <Text style={styles.emptyText}>No registered vehicles found matching criteria.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <Card style={styles.card}>
              <View style={styles.cardRow}>
                <View style={styles.iconBox}>{renderVehicleIcon(item.vehicleType)}</View>
                <View style={styles.info}>
                  <Text style={styles.plate}>{item.plateNumber}</Text>
                  <Text style={styles.agencyName}>Agency: {item.agencyName}</Text>
                  <Text style={styles.type}>
                    {item.vehicleTypeLabel} · Capacity: {item.capacityKg.toLocaleString()} kg
                  </Text>
                </View>
                <View style={styles.right}>
                  <StatusBadge status={item.availabilityStatus} />
                </View>
              </View>
            </Card>
          )}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    marginTop: 16,
    marginBottom: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  title: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
  },
  filterSection: {
    paddingHorizontal: 18,
    marginBottom: 14,
  },
  searchBar: {
    marginBottom: 12,
  },
  filterTabs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: theme.colors.primary,
  },
  tabText: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.weights.medium,
  },
  tabTextActive: {
    color: theme.colors.text,
    fontWeight: theme.typography.weights.bold,
  },
  list: {
    paddingHorizontal: 18,
    paddingBottom: 24,
  },
  card: {
    padding: 14,
    marginBottom: 10,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  plate: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
  },
  agencyName: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.weights.semibold,
    marginTop: 2,
  },
  type: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  right: {
    alignItems: 'flex-end',
  },
  empty: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    marginTop: 12,
  },
});

export default VehicleRegistryScreen;
