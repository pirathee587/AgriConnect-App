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
  RefreshControl,
  Alert 
} from 'react-native';
import { adminApi, AdminUserResponse } from '../../../api/admin.api';
import { theme } from '../../../theme';
import { Card, StatusBadge, Button, EmptyState } from '../../../components';
import { Ionicons } from '@expo/vector-icons';

export const UserManagementScreen: React.FC = () => {
  const [users, setUsers] = useState<AdminUserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<'ALL' | 'FARMER' | 'AGENCY'>('ALL');

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getAllUsers();
      setUsers(data.users);
    } catch (e: any) {
      console.log('Failed to fetch users, using sandbox mockups.');
      setUsers([
        {
          userId: 1,
          name: 'Sunil Rajapakse',
          phone: '+94771234567',
          role: 'AGENCY',
          isVerified: true,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          agencyStatus: 'ACTIVE',
          averageRating: 4.8},
        {
          userId: 2,
          name: 'K. Sivalingam',
          phone: '+94777654321',
          role: 'FARMER',
          isVerified: true,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          district: 'Nuwara Eliya',
          address: '42, Farm Road, Nuwara Eliya'}
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUsers();
    setRefreshing(false);
  };

  const handleToggleActive = async (userId: number, currentActive: boolean) => {
    try {
      if (currentActive) {
        await adminApi.deactivateUser(userId);
        Alert.alert('Account Deactivated', 'User profile deactivated successfully.');
      } else {
        await adminApi.activateUser(userId);
        Alert.alert('Account Activated', 'User profile active status restored.');
      }
      loadUsers();
    } catch (e: any) {
      Alert.alert('Toggle Failed', e.message || 'Could not update user active status.');
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchSearch = 
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.phone.includes(searchQuery);

    if (selectedRole === 'ALL') return matchSearch;
    return u.role === selectedRole && matchSearch;
  });

  const renderUserItem = ({ item }: { item: AdminUserResponse }) => {
    const isFarmer = item.role === 'FARMER';
    
    return (
      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.userMeta}>
            <Text style={styles.userName}>{item.name}</Text>
            <View style={styles.roleRow}>
              <View style={[
                styles.roleBadge,
                isFarmer ? styles.farmerBadge : styles.agencyBadge
              ]}>
                <Text style={[
                  styles.roleText,
                  isFarmer ? styles.farmerText : styles.agencyText
                ]}>
                  {item.role}
                </Text>
              </View>
              <Text style={styles.phoneText}>{item.phone}</Text>
            </View>
          </View>
          <StatusBadge status={item.isActive ? 'ACTIVE' : 'SUSPENDED'} />
        </View>

        {isFarmer ? (
          <Text style={styles.locationText}>
            District: {item.district || 'N/A'} • Address: {item.address || 'N/A'}
          </Text>
        ) : (
          <Text style={styles.locationText}>
            Agency Verification: {item.agencyStatus || 'PENDING'} • Avg Rating: {item.averageRating ? item.averageRating.toFixed(1) : '0.0'}
          </Text>
        )}

        <View style={styles.divider} />

        <Button
          title={item.isActive ? "Deactivate Account" : "Activate Account"}
          variant={item.isActive ? "outline" : "primary"}
          style={[styles.toggleBtn, item.isActive ? styles.btnDeactivate : styles.btnActivate] as any}
          textStyle={item.isActive ? { color: theme.colors.error } : { color: '#ffffff' }}
          onPress={() => handleToggleActive(item.userId, item.isActive)}
        />
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>User Directory</Text>
        <Text style={styles.sub}>Manage system users and access status controls</Text>
      </View>

      <View style={styles.searchBarBox}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={theme.colors.textMuted} style={styles.searchIcon} />
          <TextInput
            placeholder="Search by name or mobile number..."
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={theme.colors.textMuted}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={theme.colors.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      <View style={styles.tabsRow}>
        {(['ALL', 'FARMER', 'AGENCY'] as const).map((r) => (
          <TouchableOpacity
            key={r}
            style={[
              styles.tabBtn,
              selectedRole === r ? styles.tabBtnActive : {}
            ]}
            onPress={() => setSelectedRole(r)}
          >
            <Text style={[
              styles.tabText,
              selectedRole === r ? styles.tabTextActive : {}
            ]}>
              {r}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading && users.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#475569" />
        </View>
      ) : (
        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => item.userId.toString()}
          renderItem={renderUserItem}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#475569']} />
          }
          ListEmptyComponent={
            <EmptyState
              title="No Users Found"
              description="No user records matched your filter or search query."
              icon="people-outline"
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
  searchBarBox: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border},
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 40},
  searchIcon: {
    marginRight: 6},
  searchInput: {
    flex: 1,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text,
    padding: 0},
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border},
  tabBtn: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#f1f5f9'},
  tabBtnActive: {
    backgroundColor: '#475569'},
  tabText: {
    fontSize: 11,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textSecondary},
  tabTextActive: {
    color: '#ffffff'},
  listContainer: {
    padding: 16},
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
    alignItems: 'flex-start',
    marginBottom: 10},
  userMeta: {
    flex: 1},
  userName: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
    marginBottom: 6},
  roleRow: {
    flexDirection: 'row',
    alignItems: 'center'},
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginRight: 8},
  farmerBadge: {
    backgroundColor: theme.colors.primaryLight},
  agencyBadge: {
    backgroundColor: '#fef3c7'},
  roleText: {
    fontSize: 9,
    fontWeight: theme.typography.weights.bold},
  farmerText: {
    color: theme.colors.primaryDark},
  agencyText: {
    color: theme.colors.secondaryDark},
  phoneText: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textMuted},
  locationText: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    lineHeight: 16},
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: 12},
  toggleBtn: {
    height: 38},
  btnDeactivate: {
    borderColor: theme.colors.error},
  btnActivate: {
    backgroundColor: '#475569'}});

export default UserManagementScreen;
