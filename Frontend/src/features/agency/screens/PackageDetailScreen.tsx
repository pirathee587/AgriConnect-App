import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { RouteProp, useIsFocused } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AgencyTabParamList } from '../../../navigation/types';
import { packageApi, PackageResponse } from '../../../api/package.api';
import { theme } from '../../../theme';
import { Card, Button, StatusBadge } from '../../../components';
import { Ionicons } from '@expo/vector-icons';

type Route = RouteProp<AgencyTabParamList, 'PackageDetail'>;
type Navigation = NativeStackNavigationProp<AgencyTabParamList, 'PackageDetail'>;

type Props = {
  route: Route;
  navigation: Navigation;
};

export const PackageDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { packageId } = route.params;
  const isFocused = useIsFocused();
  const [loading, setLoading] = useState(true);
  const [pkg, setPkg] = useState<any>(null); // Uses the extended response type

  const fetchDetails = async () => {
    try {
      const data = await packageApi.getPackageById(packageId);
      setPkg(data);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Could not fetch package details.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      fetchDetails();
    }
  }, [packageId, isFocused]);

  const handleRemoveDriver = () => {
    if (!pkg || !pkg.driverId) return;

    const isTransit = pkg.status === 'IN_TRANSIT';

    const performRemoval = async (force: boolean) => {
      try {
        setLoading(true);
        await packageApi.removeDriver(packageId, force);
        Alert.alert('Removed', 'Driver removed successfully from this package.');
        await fetchDetails();
      } catch (e: any) {
        Alert.alert('Error', e.message || 'Could not remove driver.');
      } finally {
        setLoading(false);
      }
    };

    if (isTransit) {
      // Two-step warning for IN_TRANSIT
      Alert.alert(
        'Warning: Trip in Progress',
        `This trip is currently IN_TRANSIT. Removing the driver ${pkg.driverName} mid-trip requires agency confirmation and acceptance of compliance responsibility. Proceed?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Yes, Confirm & Remove',
            style: 'destructive',
            onPress: () => performRemoval(true),
          },
        ]
      );
    } else {
      Alert.alert(
        'Remove Driver',
        `Are you sure you want to remove ${pkg.driverName} from this package? The vehicle will remain assigned.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Remove',
            style: 'destructive',
            onPress: () => performRemoval(false),
          },
        ]
      );
    }
  };

  if (loading && !pkg) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.secondary} />
      </SafeAreaView>
    );
  }

  if (!pkg) return null;

  const hasVehicle = pkg.vehicleId != null || pkg.vehicleNumber != null;
  const hasDriver = pkg.driverId != null;

  const isCompleted = pkg.status === 'DELIVERED' || pkg.status === 'COMPLETED';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Trip Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Core Specs Card */}
        <Card style={styles.detailsCard}>
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>Destination</Text>
              <Text style={styles.val}>{pkg.marketDestination}</Text>
            </View>
            <StatusBadge status={pkg.status} />
          </View>

          <View style={styles.divider} />

          <View style={styles.metaRow}>
            <View style={styles.metaCol}>
              <Text style={styles.metaLabel}>Departure</Text>
              <Text style={styles.metaVal}>
                {new Date(pkg.travelDateTime).toLocaleDateString()} at{' '}
                {new Date(pkg.travelDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
            <View style={styles.metaCol}>
              <Text style={styles.metaLabel}>Remaining Weight</Text>
              <Text style={styles.metaVal}>{pkg.remainingCapacityKg.toLocaleString()} kg</Text>
            </View>
          </View>
        </Card>

        {/* Driver Assignment Section */}
        <Text style={styles.sectionTitle}>Fleet & Driver Assignment</Text>
        <Card style={styles.assignmentCard}>
          {hasVehicle ? (
            <View style={styles.assignmentInfo}>
              <View style={styles.assignmentHeader}>
                <Ionicons name="bus" size={24} color={theme.colors.secondary} />
                <Text style={styles.assignmentHeadline}>
                  {pkg.plateNumber || pkg.vehicleNumber}
                </Text>
                <Text style={styles.vehicleLabel}>
                  ({pkg.vehicleTypeLabel || pkg.vehicleType || 'Fleet vehicle'})
                </Text>
              </View>

              {hasDriver ? (
                <View style={styles.driverInfoBlock}>
                  <View style={styles.driverHeader}>
                    <Ionicons name="person" size={18} color={theme.colors.textMuted} />
                    <Text style={styles.driverName}>{pkg.driverName}</Text>
                    <View
                      style={[
                        styles.nicBadge,
                        {
                          backgroundColor:
                            pkg.nicStatus === 'NIC_PROVIDED' ? '#dcfce7' : '#fff7ed',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.nicBadgeText,
                          {
                            color:
                              pkg.nicStatus === 'NIC_PROVIDED'
                                ? '#15803d'
                                : '#c2410c',
                          },
                        ]}
                      >
                        {pkg.nicStatus === 'NIC_PROVIDED' ? '✓ NIC Held' : '⚠ NIC Pending'}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.driverSubText}>Phone: {pkg.driverPhone}</Text>

                  {/* Actions for assigned driver */}
                  <View style={styles.assignmentActions}>
                    {!isCompleted ? (
                      <>
                        <TouchableOpacity
                          style={styles.actionLink}
                          onPress={() => navigation.navigate('AssignDriver', { packageId })}
                        >
                          <Ionicons name="swap-horizontal-outline" size={16} color={theme.colors.secondary} />
                          <Text style={styles.actionLinkText}>Change Driver</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionLinkDanger} onPress={handleRemoveDriver}>
                          <Ionicons name="trash-outline" size={16} color={theme.colors.error} />
                          <Text style={styles.actionLinkTextDanger}>Remove Driver</Text>
                        </TouchableOpacity>
                      </>
                    ) : (
                      <Text style={styles.lockedText}>
                        <Ionicons name="lock-closed" size={12} /> Trip complete — assignment locked for audit
                      </Text>
                    )}
                  </View>
                </View>
              ) : (
                <View style={styles.noDriverBlock}>
                  <Text style={styles.noDriverText}>No driver assigned to this vehicle yet.</Text>
                  {!isCompleted && (
                    <Button
                      title="Assign Driver"
                      onPress={() => navigation.navigate('AssignDriver', { packageId })}
                      variant="secondary"
                      style={styles.inlineAssignBtn}
                    />
                  )}
                </View>
              )}
            </View>
          ) : (
            <View style={styles.emptyAssignment}>
              <Ionicons name="alert-circle-outline" size={32} color={theme.colors.textMuted} />
              <Text style={styles.emptyAssignmentText}>
                No fleet vehicle or driver assigned to this trip package yet.
              </Text>
              {!isCompleted && (
                <Button
                  title="Assign Vehicle & Driver"
                  onPress={() => navigation.navigate('AssignDriver', { packageId })}
                  variant="secondary"
                />
              )}
            </View>
          )}
        </Card>

        {/* Vegetables List */}
        <Text style={styles.sectionTitle}>Accepted Vegetables & Pricing</Text>
        {pkg.vegetables.map((veg: any) => {
          const bookedPercent = ((veg.maxKg - veg.remainingKg) / veg.maxKg) * 100;
          return (
            <Card key={veg.id} style={styles.vegCard}>
              <View style={styles.row}>
                <Text style={styles.vegName}>{veg.vegetableName}</Text>
                <Text style={styles.vegPrice}>Rs. {veg.pricePerKg} / kg</Text>
              </View>
              <View style={styles.progressLabelRow}>
                <Text style={styles.progressLabel}>Booked Capacity</Text>
                <Text style={styles.progressVal}>
                  {Math.round(bookedPercent)}% ({veg.maxKg - veg.remainingKg} / {veg.maxKg} kg)
                </Text>
              </View>
              <View style={styles.progressBg}>
                <View style={[styles.progressFill, { width: `${bookedPercent}%` }]} />
              </View>
            </Card>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  headerTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  detailsCard: {
    padding: 16,
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  col: {
    flex: 1,
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
  },
  val: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: 16,
  },
  metaRow: {
    flexDirection: 'row',
  },
  metaCol: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
  },
  metaVal: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
    marginTop: 10,
    marginBottom: 12,
  },
  assignmentCard: {
    padding: 16,
    marginBottom: 20,
  },
  emptyAssignment: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  emptyAssignmentText: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  assignmentInfo: {
    flex: 1,
  },
  assignmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  assignmentHeadline: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
    marginLeft: 10,
  },
  vehicleLabel: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    marginLeft: 6,
  },
  driverInfoBlock: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  driverHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  driverName: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
    marginLeft: 8,
  },
  nicBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
    marginLeft: 8,
  },
  nicBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  driverSubText: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    marginLeft: 26,
    marginTop: 4,
  },
  assignmentActions: {
    flexDirection: 'row',
    marginTop: 16,
    marginLeft: 26,
  },
  actionLink: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  actionLinkDanger: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionLinkText: {
    fontSize: 12,
    color: theme.colors.secondaryDark,
    fontWeight: '600',
    marginLeft: 4,
  },
  actionLinkTextDanger: {
    fontSize: 12,
    color: theme.colors.error,
    fontWeight: '600',
    marginLeft: 4,
  },
  lockedText: {
    fontSize: 11,
    color: theme.colors.textMuted,
    fontWeight: theme.typography.weights.semibold,
  },
  noDriverBlock: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  noDriverText: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    marginBottom: 10,
  },
  inlineAssignBtn: {
    height: 38,
  },
  vegCard: {
    padding: 14,
    marginBottom: 10,
  },
  vegName: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
  },
  vegPrice: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.secondary,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 11,
    color: theme.colors.textSecondary,
  },
  progressVal: {
    fontSize: 11,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
  },
  progressBg: {
    height: 6,
    backgroundColor: theme.colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.secondary,
  },
});

export default PackageDetailScreen;
