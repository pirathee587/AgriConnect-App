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
import { DriverResponse, DriverStatus, NicStatus } from '../../../store/slices/driverSlice';
import { theme } from '../../../theme';
import { Card, Button, StatusBadge, Input } from '../../../components';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  navigation: NativeStackNavigationProp<AdminTabParamList, 'DriverRegistry'>;
};

export const DriverRegistryScreen: React.FC<Props> = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [drivers, setDrivers] = useState<DriverResponse[]>([]);
  const [filteredDrivers, setFilteredDrivers] = useState<DriverResponse[]>([]);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [nicFilter, setNicFilter] = useState<'ALL' | NicStatus>('ALL');

  const loadAllDrivers = useCallback(async () => {
    try {
      const data = await driverApi.adminGetAllDrivers();
      setDrivers(data);
      applyFilters(data, searchQuery, nicFilter);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Could not fetch global driver registry.');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, nicFilter]);

  useEffect(() => {
    loadAllDrivers();
  }, []);

  const applyFilters = (
    data: DriverResponse[],
    search: string,
    nic: 'ALL' | NicStatus
  ) => {
    let list = [...data];

    // Filter by name/agency/phone/licence
    if (search.trim()) {
      const query = search.toLowerCase();
      list = list.filter(
        (d) =>
          d.fullName.toLowerCase().includes(query) ||
          d.agencyName.toLowerCase().includes(query) ||
          d.phone.includes(query) ||
          d.licenceNumber.toLowerCase().includes(query)
      );
    }

    // Filter by NIC status
    if (nic !== 'ALL') {
      list = list.filter((d) => d.nicStatus === nic);
    }

    setFilteredDrivers(list);
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    applyFilters(drivers, text, nicFilter);
  };

  const handleNicFilterChange = (filter: 'ALL' | NicStatus) => {
    setNicFilter(filter);
    applyFilters(drivers, searchQuery, filter);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAllDrivers();
    setRefreshing(false);
  };

  const handleSuspendDriver = (driverId: number, name: string) => {
    Alert.alert(
      'Suspend Driver',
      `Are you sure you want to suspend driver ${name} system-wide? This prevents them from being assigned to any future trips.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Suspend',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await driverApi.adminSuspendDriver(driverId);
              Alert.alert('Suspended', 'Driver has been suspended successfully.');
              loadAllDrivers();
            } catch (e: any) {
              Alert.alert('Failed', e.message || 'Could not suspend driver.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Driver Registry (Audit)</Text>
      </View>

      <View style={styles.filterSection}>
        <Input
          placeholder="Search by name, agency, license..."
          value={searchQuery}
          onChangeText={handleSearch}
          icon={<Ionicons name="search" size={20} color={theme.colors.textMuted} />}
          containerStyle={styles.searchBar}
        />

        <View style={styles.filterTabs}>
          <TouchableOpacity
            style={[styles.tab, nicFilter === 'ALL' && styles.tabActive]}
            onPress={() => handleNicFilterChange('ALL')}
          >
            <Text style={[styles.tabText, nicFilter === 'ALL' && styles.tabTextActive]}>All</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, nicFilter === 'NIC_PROVIDED' && styles.tabActive]}
            onPress={() => handleNicFilterChange('NIC_PROVIDED')}
          >
            <Text style={[styles.tabText, nicFilter === 'NIC_PROVIDED' && styles.tabTextActive]}>
              NIC Provided
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, nicFilter === 'NIC_NOT_PROVIDED' && styles.tabActive]}
            onPress={() => handleNicFilterChange('NIC_NOT_PROVIDED')}
          >
            <Text style={[styles.tabText, nicFilter === 'NIC_NOT_PROVIDED' && styles.tabTextActive]}>
              NIC Pending
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading && !refreshing ? (
        <ActivityIndicator color={theme.colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filteredDrivers}
          keyExtractor={(item) => String(item.driverId)}
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
              <Ionicons name="people-outline" size={48} color={theme.colors.textMuted} />
              <Text style={styles.emptyText}>No registered drivers found matching criteria.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <Card style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.driverInfo}>
                  <Text style={styles.driverName}>{item.fullName}</Text>
                  <Text style={styles.agencyName}>Agency: {item.agencyName}</Text>
                  <Text style={styles.subInfo}>
                    Licence: {item.licenceClass} · {item.licenceNumber}
                  </Text>
                  <Text style={styles.subInfo}>Phone: {item.phone}</Text>
                </View>
                <View style={styles.badgeColumn}>
                  <StatusBadge status={item.status} />
                  <View
                    style={[
                      styles.nicBadge,
                      {
                        backgroundColor:
                          item.nicStatus === 'NIC_PROVIDED' ? '#dcfce7' : '#fff7ed',
                        marginTop: 6,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.nicBadgeText,
                        {
                          color:
                            item.nicStatus === 'NIC_PROVIDED' ? '#15803d' : '#c2410c',
                        },
                      ]}
                    >
                      {item.nicStatus === 'NIC_PROVIDED' ? '✓ NIC' : '⚠ NIC Pending'}
                    </Text>
                  </View>
                </View>
              </View>

              {item.status === 'ACTIVE' && (
                <TouchableOpacity
                  style={styles.suspendAction}
                  onPress={() => handleSuspendDriver(item.driverId, item.fullName)}
                >
                  <Ionicons name="ban-outline" size={14} color={theme.colors.error} />
                  <Text style={styles.suspendText}>Suspend Driver</Text>
                </TouchableOpacity>
              )}
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
    fontSize: 12,
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  driverInfo: {
    flex: 1,
  },
  driverName: {
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
  subInfo: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  badgeColumn: {
    alignItems: 'flex-end',
  },
  nicBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 20,
  },
  nicBadgeText: {
    fontSize: 9,
    fontWeight: '600',
  },
  suspendAction: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    marginTop: 12,
    paddingTop: 10,
  },
  suspendText: {
    fontSize: 11,
    color: theme.colors.error,
    fontWeight: '600',
    marginLeft: 6,
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

export default DriverRegistryScreen;
