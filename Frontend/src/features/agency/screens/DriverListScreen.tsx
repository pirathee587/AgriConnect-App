import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl, Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AgencyTabParamList } from '../../../navigation/types';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { driverApi } from '../../../api/driver.api';
import {
  fetchDriversSuccess, driverLoadStart, driverLoadFail, DriverResponse,
} from '../../../store/slices/driverSlice';
import { theme } from '../../../theme';
import { Card, Button } from '../../../components';
import { Ionicons } from '@expo/vector-icons';

type Props = { navigation: NativeStackNavigationProp<AgencyTabParamList, 'DriverList'> };

export const DriverListScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch   = useDispatch();
  const { drivers, loadingDrivers } = useSelector((s: RootState) => s.drivers);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    dispatch(driverLoadStart());
    try {
      const data = await driverApi.listDrivers();
      dispatch(fetchDriversSuccess(data));
    } catch (e: any) {
      dispatch(driverLoadFail(e.message || 'Failed to load drivers'));
    }
  }, [dispatch]);

  useEffect(() => { load(); }, [load]);

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const renderNicBadge = (driver: DriverResponse) => {
    const provided = driver.nicStatus === 'NIC_PROVIDED';
    return (
      <View style={[styles.badge, { backgroundColor: provided ? '#dcfce7' : '#fff7ed' }]}>
        <Text style={[styles.badgeText, { color: provided ? '#15803d' : '#c2410c' }]}>
          {provided ? '✓ NIC Held' : '⚠ NIC Pending'}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Drivers</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('AddDriver')}
        >
          <Ionicons name="person-add" size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {loadingDrivers && !refreshing ? (
        <ActivityIndicator color={theme.colors.secondary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={drivers}
          keyExtractor={d => String(d.driverId)}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.secondary]} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="person-outline" size={48} color={theme.colors.textMuted} />
              <Text style={styles.emptyText}>No drivers registered yet.</Text>
              <Button title="Add First Driver" variant="secondary"
                onPress={() => navigation.navigate('AddDriver')} style={styles.emptyBtn} />
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => navigation.navigate('DriverDetail', { driverId: item.driverId })}>
              <Card style={styles.card}>
                <View style={styles.cardRow}>
                  <View style={styles.avatar}>
                    <Ionicons name="person" size={22} color={theme.colors.secondary} />
                  </View>
                  <View style={styles.info}>
                    <Text style={styles.name}>{item.fullName}</Text>
                    <Text style={styles.sub}>{item.licenceClass} · {item.licenceNumber}</Text>
                    <Text style={styles.sub}>{item.phone}</Text>
                  </View>
                  <View style={styles.right}>
                    {renderNicBadge(item)}
                    <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} style={{ marginTop: 8 }} />
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, marginTop: 16, marginBottom: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#fff', borderWidth: 1,
    borderColor: theme.colors.border, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  title: { flex: 1, fontSize: theme.typography.sizes.lg, fontWeight: theme.typography.weights.bold, color: theme.colors.text },
  addBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: theme.colors.secondary,
    justifyContent: 'center', alignItems: 'center' },
  list: { paddingHorizontal: 18, paddingBottom: 24 },
  card: { padding: 14, marginBottom: 10 },
  cardRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: theme.colors.secondary + '15',
    justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  info: { flex: 1 },
  name: { fontSize: theme.typography.sizes.md, fontWeight: theme.typography.weights.bold, color: theme.colors.text },
  sub: { fontSize: theme.typography.sizes.xs, color: theme.colors.textSecondary, marginTop: 2 },
  right: { alignItems: 'flex-end' },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  badgeText: { fontSize: 11, fontWeight: '600' },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { fontSize: theme.typography.sizes.sm, color: theme.colors.textSecondary, marginTop: 12, marginBottom: 16 },
  emptyBtn: { height: 44, paddingHorizontal: 20 },
});

export default DriverListScreen;
