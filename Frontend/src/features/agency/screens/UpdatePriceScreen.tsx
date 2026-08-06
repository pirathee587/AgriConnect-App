import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator 
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AgencyTabParamList } from '../../../navigation/types';
import { packageApi, PackageResponse, VegetableInfo } from '../../../api/package.api';
import { updatePriceSuccess } from '../../../store/slices/packageSlice';
import { useDispatch } from 'react-redux';
import { theme } from '../../../theme';
import { Card, Input, Button, Loader } from '../../../components';
import { Ionicons } from '@expo/vector-icons';

type UpdatePriceRouteProp = RouteProp<AgencyTabParamList, 'UpdatePrice'>;
type UpdatePriceNavigationProp = NativeStackNavigationProp<AgencyTabParamList, 'UpdatePrice'>;

interface Props {
  route: UpdatePriceRouteProp;
  navigation: UpdatePriceNavigationProp;
}

export const UpdatePriceScreen: React.FC<Props> = ({ route, navigation }) => {
  const { packageId } = route.params;
  const dispatch = useDispatch();
  
  const [pkg, setPkg] = useState<PackageResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  
  // Selected veg to edit
  const [selectedVeg, setSelectedVeg] = useState<VegetableInfo | null>(null);
  const [newPrice, setNewPrice] = useState('');

  const loadDetails = async () => {
    setLoading(true);
    try {
      const data = await packageApi.getPackageById(packageId);
      setPkg(data);
      if (data.vegetables.length > 0) {
        setSelectedVeg(data.vegetables[0]);
        setNewPrice(String(data.vegetables[0].pricePerKg));
      }
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Could not load trip.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetails();
  }, [packageId]);

  const handleSelectVeg = (veg: VegetableInfo) => {
    setSelectedVeg(veg);
    setNewPrice(String(veg.pricePerKg));
  };

  const handleUpdate = async () => {
    if (!selectedVeg) return;
    if (!newPrice || isNaN(Number(newPrice)) || Number(newPrice) <= 0) {
      Alert.alert('Invalid Price', 'Please enter a valid crop price per kg.');
      return;
    }

    setUpdating(true);
    try {
      await packageApi.updateVegetablePrice({
        packageVegetableId: selectedVeg.id,
        newPricePerKg: Number(newPrice)});

      dispatch(updatePriceSuccess({
        packageVegetableId: selectedVeg.id,
        newPrice: Number(newPrice)}));

      // Update local state
      if (pkg) {
        const updatedVegs = pkg.vegetables.map(v =>
          v.id === selectedVeg.id ? { ...v, pricePerKg: Number(newPrice), priceUpdatedAt: new Date().toISOString() } : v
        );
        setPkg({ ...pkg, vegetables: updatedVegs });
      }

      Alert.alert('Price Updated', `Price of ${selectedVeg.vegetableName} has been updated to Rs. ${newPrice} / kg.`);
    } catch (e: any) {
      Alert.alert('Update Failed', e.message || 'Could not update price.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.secondary} />
      </View>
    );
  }

  if (!pkg) return null;

  return (
    <SafeAreaView style={styles.container}>
      <Loader visible={updating} message="Syncing prices with markets..." />
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Update Crop Prices</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        {/* Info card */}
        <Card style={styles.tripCard}>
          <Text style={styles.metaLabel}>ACTIVE TRIP DESTINATION</Text>
          <Text style={styles.destText}>{pkg.marketDestination}</Text>
          <Text style={styles.dateText}>
            Scheduled: {new Date(pkg.travelDateTime).toLocaleDateString()}
          </Text>
        </Card>

        {/* Crops configuration */}
        <Text style={styles.sectionTitle}>1. Select Crop to Update</Text>
        {pkg.vegetables.map((v) => {
          const isSelected = selectedVeg?.id === v.id;
          return (
            <TouchableOpacity
              key={v.id}
              activeOpacity={0.8}
              style={[
                styles.vegCard,
                isSelected && styles.vegCardSelected
              ]}
              onPress={() => handleSelectVeg(v)}
            >
              <View style={styles.vegCardLeft}>
                <Ionicons 
                  name={isSelected ? "ellipse" : "ellipse-outline"} 
                  size={16} 
                  color={isSelected ? theme.colors.secondary : theme.colors.textMuted} 
                  style={styles.icon}
                />
                <View>
                  <Text style={styles.vegName}>{v.vegetableName}</Text>
                  <Text style={styles.vegCap}>Max capacity: {v.maxKg} kg</Text>
                </View>
              </View>
              <Text style={styles.priceText}>Rs. {v.pricePerKg} / kg</Text>
            </TouchableOpacity>
          );
        })}

        {/* Edit Panel */}
        {selectedVeg && (
          <View style={styles.editPanel}>
            <Text style={styles.sectionTitle}>2. Modify Rate for {selectedVeg.vegetableName}</Text>
            <Card style={styles.editCard}>
              <Input
                label="New Price / kg (Rs.)"
                placeholder="240"
                keyboardType="numeric"
                value={newPrice}
                onChangeText={setNewPrice}
                icon={<Ionicons name="cash-outline" size={20} color={theme.colors.textMuted} />}
              />
              <Button 
                title="Publish Price Update" 
                onPress={handleUpdate} 
                style={styles.updateBtn}
              />
            </Card>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
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
  scrollContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40},
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'},
  tripCard: {
    padding: 16,
    marginBottom: 20,
    backgroundColor: 'rgba(245, 158, 11, 0.04)',
    borderColor: theme.colors.secondary},
  metaLabel: {
    fontSize: 10,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.secondaryDark,
    letterSpacing: 0.5,
    marginBottom: 4},
  destText: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text},
  dateText: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    marginTop: 4},
  sectionTitle: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
    marginBottom: 12,
    marginTop: 8},
  vegCard: {
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
    borderColor: theme.colors.secondary,
    backgroundColor: 'rgba(245, 158, 11, 0.02)'},
  vegCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1},
  icon: {
    marginRight: 12},
  vegName: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text},
  vegCap: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    marginTop: 2},
  priceText: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textSecondary},
  editPanel: {
    marginTop: 14},
  editCard: {
    padding: 16},
  updateBtn: {
    backgroundColor: theme.colors.secondary,
    marginTop: 10}});

export default UpdatePriceScreen;
