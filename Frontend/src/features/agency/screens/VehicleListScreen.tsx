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
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AgencyTabParamList } from '../../../navigation/types';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { driverApi } from '../../../api/driver.api';
import {
  fetchVehiclesSuccess,
  vehicleLoadStart,
  vehicleLoadFail,
  VehicleResponse,
} from '../../../store/slices/driverSlice';
import { theme } from '../../../theme';
import { Card, Button } from '../../../components';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  navigation: NativeStackNavigationProp<AgencyTabParamList, 'VehicleList'>;
};

export const VehicleListScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch();
  const { vehicles, loadingVehicles } = useSelector((s: RootState) => s.drivers);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    dispatch(vehicleLoadStart());
    try {
      const data = await driverApi.listVehicles();
      dispatch(fetchVehiclesSuccess(data));
    } catch (e: any) {
      dispatch(vehicleLoadFail(e.message || 'Failed to load vehicles'));
    }
  }, [dispatch]);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return { bg: '#dcfce7', text: '#15803d' };
      case 'ASSIGNED':
        return { bg: '#e0f2fe', text: '#0369a1' };
      case 'UNDER_MAINTENANCE':
        return { bg: '#fee2e2', text: '#b91c1c' };
      default:
        return { bg: '#f3f4f6', text: '#374151' };
    }
  };

  const renderVehicleIcon = (type: string) => {
    switch (type) {
      case 'LORRY':
        return <Ionicons name="bus" size={24} color={theme.colors.secondary} />;
      case 'TRUCK':
        return <Ionicons name="car-sport" size={24} color={theme.colors.secondary} />;
      case 'VAN':
        return <Ionicons name="car" size={24} color={theme.colors.secondary} />;
      default:
        return <Ionicons name="construct" size={24} color={theme.colors.secondary} />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Vehicle Fleet</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('AddVehicle')}
        >
          <Ionicons name="add" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {loadingVehicles && !refreshing ? (
        <ActivityIndicator color={theme.colors.secondary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={vehicles}
          keyExtractor={(item) => String(item.vehicleId)}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.secondary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="car-outline" size={48} color={theme.colors.textMuted} />
              <Text style={styles.emptyText}>No vehicles in your fleet yet.</Text>
              <Button
                title="Register Vehicle"
                variant="secondary"
                onPress={() => navigation.navigate('AddVehicle')}
                style={styles.emptyBtn}
              />
            </View>
          }
          renderItem={({ item }) => {
            const { bg, text } = getStatusColor(item.availabilityStatus);
            return (
              <TouchableOpacity onPress={() => navigation.navigate('VehicleDetail', { vehicleId: item.vehicleId })}>
                <Card style={styles.card}>
                  <View style={styles.cardRow}>
                    <View style={styles.iconBox}>{renderVehicleIcon(item.vehicleType)}</View>
                    <View style={styles.info}>
                      <Text style={styles.plate}>{item.plateNumber}</Text>
                      <Text style={styles.type}>
                        {item.vehicleTypeLabel} · Capacity: {item.capacityKg.toLocaleString()} kg
                      </Text>
                    </View>
                    <View style={styles.right}>
                      <View style={[styles.badge, { backgroundColor: bg }]}>
                        <Text style={[styles.badgeText, { color: text }]}>{item.availabilityLabel}</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} style={{ marginTop: 8 }} />
                    </View>
                  </View>
                </Card>
              </TouchableOpacity>
            );
          }}
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
    flex: 1,
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: theme.colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
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
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.secondary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  plate: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
  },
  type: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  right: {
    alignItems: 'flex-end',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  empty: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    marginTop: 12,
    marginBottom: 16,
  },
  emptyBtn: {
    height: 44,
    paddingHorizontal: 20,
  },
});

export default VehicleListScreen;
