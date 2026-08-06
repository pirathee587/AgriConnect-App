import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Image, 
  Alert, 
  Modal, 
  ActivityIndicator,
  ScrollView,
  RefreshControl 
} from 'react-native';
import { adminApi, AgencyVerificationResponse } from '../../../api/admin.api';
import { theme } from '../../../theme';
import { Card, Button, EmptyState } from '../../../components';
import { Ionicons } from '@expo/vector-icons';

export const AgencyVerificationScreen: React.FC = () => {
  const [agencies, setAgencies] = useState<AgencyVerificationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Selected agency for detailed document preview
  const [selectedAgency, setSelectedAgency] = useState<AgencyVerificationResponse | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [processing, setProcessing] = useState(false);

  const loadAgencies = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getPendingAgencies();
      setAgencies(data);
    } catch (e: any) {
      console.log('Failed to fetch pending agencies, using sandbox mockups.');
      setAgencies([
        {
          agencyId: 10,
          userId: 12,
          name: 'Sunil Rajapakse',
          phone: '+94771234567',
          nicNumber: '199012345678',
          address: '124, Kandy Road, Dambulla',
          agencyStatus: 'PENDING_APPROVAL',
          nicFrontUrl: 'https://placehold.co/600x400/png?text=NIC+Front+Sunil',
          nicBackUrl: 'https://placehold.co/600x400/png?text=NIC+Back+Sunil',
          averageRating: 0,
          totalRatings: 0,
          bankName: 'Peoples Bank',
          maskedAccountNumber: '*********1248',
          accountHolderName: 'S. Rajapakse',
          createdAt: new Date().toISOString(),
          approvedAt: '',
          activatedAt: ''}
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAgencies();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAgencies();
    setRefreshing(false);
  };

  const handleApprove = async (agencyId: number) => {
    setProcessing(true);
    try {
      await adminApi.approveAgency(agencyId);
      Alert.alert('Agency Approved', 'Agency identity approved. Account updated to PENDING PAYMENT activation status.');
      setModalVisible(false);
      loadAgencies();
    } catch (e: any) {
      Alert.alert('Approval Failed', e.message || 'Could not approve agency.');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = (agencyId: number) => {
    Alert.prompt(
      'Reject Verification',
      'Enter the reason for rejection (e.g. NIC photo blurred, numbers mismatch):',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async (reason?: string) => {
            if (!reason || !reason.trim()) {
              Alert.alert('Error', 'A reason is required to reject agency verification.');
              return;
            }
            setProcessing(true);
            try {
              await adminApi.rejectAgency(agencyId, reason.trim());
              Alert.alert('Agency Rejected', 'Verification rejected.');
              setModalVisible(false);
              loadAgencies();
            } catch (e: any) {
              Alert.alert('Rejection Failed', e.message || 'Could not reject verification.');
            } finally {
              setProcessing(false);
            }
          }
        }
      ]
    );
  };

  const handleCardPress = (agency: AgencyVerificationResponse) => {
    setSelectedAgency(agency);
    setModalVisible(true);
  };

  const renderAgencyItem = ({ item }: { item: AgencyVerificationResponse }) => {
    return (
      <TouchableOpacity activeOpacity={0.9} onPress={() => handleCardPress(item)}>
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.agencyName}>{item.name}</Text>
            <Ionicons name="eye-outline" size={18} color="#475569" />
          </View>
          <Text style={styles.cardMeta}>NIC: {item.nicNumber} • Phone: {item.phone}</Text>
          <Text style={styles.cardAddress} numberOfLines={1}>Address: {item.address}</Text>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Agency Document Approvals</Text>
        <Text style={styles.sub}>Review and verify agency identity submissions</Text>
      </View>

      {loading && agencies.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#475569" />
        </View>
      ) : (
        <FlatList
          data={agencies}
          keyExtractor={(item) => item.agencyId.toString()}
          renderItem={renderAgencyItem}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#475569']} />
          }
          ListEmptyComponent={
            <EmptyState
              title="All Approvals Caught Up"
              description="There are currently no new agencies waiting for NIC verification."
              icon="shield-checkmark-outline"
            />
          }
        />
      )}

      {/* DOUBLE-PANE MODAL FOR NIC PREVIEW */}
      <Modal transparent visible={modalVisible} animationType="slide">
        <View style={styles.modalBg}>
          <SafeAreaView style={styles.modalContent}>
            {processing && <ActivityIndicator color="#475569" style={styles.modalLoading} />}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Verify Agency Profile</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={26} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalScroll}>
              <Text style={styles.modalSectionTitle}>Profile Details</Text>
              <View style={styles.detailsBox}>
                <View style={styles.detailsRow}>
                  <Text style={styles.detailsLabel}>Full Name</Text>
                  <Text style={styles.detailsVal}>{selectedAgency?.name}</Text>
                </View>
                <View style={styles.detailsRow}>
                  <Text style={styles.detailsLabel}>Mobile Number</Text>
                  <Text style={styles.detailsVal}>{selectedAgency?.phone}</Text>
                </View>
                <View style={styles.detailsRow}>
                  <Text style={styles.detailsLabel}>NIC Card Number</Text>
                  <Text style={styles.detailsVal}>{selectedAgency?.nicNumber}</Text>
                </View>
                <View style={styles.detailsRow}>
                  <Text style={styles.detailsLabel}>Business Address</Text>
                  <Text style={styles.detailsVal}>{selectedAgency?.address}</Text>
                </View>
              </View>

              <Text style={styles.modalSectionTitle}>NIC Front Scan Copy</Text>
              {selectedAgency?.nicFrontUrl ? (
                <View style={styles.imageBox}>
                  <Image source={{ uri: selectedAgency.nicFrontUrl }} style={styles.nicDocImage} />
                </View>
              ) : (
                <Text style={styles.noDocText}>No front photo uploaded</Text>
              )}

              <Text style={styles.modalSectionTitle}>NIC Back Scan Copy</Text>
              {selectedAgency?.nicBackUrl ? (
                <View style={styles.imageBox}>
                  <Image source={{ uri: selectedAgency.nicBackUrl }} style={styles.nicDocImage} />
                </View>
              ) : (
                <Text style={styles.noDocText}>No back photo uploaded</Text>
              )}

              <View style={styles.modalActions}>
                <Button
                  title="Reject Scan"
                  variant="outline"
                  onPress={() => selectedAgency && handleReject(selectedAgency.agencyId)}
                  style={styles.modalRejectBtn}
                  textStyle={styles.modalRejectText}
                />
                <Button
                  title="Approve Identity"
                  variant="primary"
                  onPress={() => selectedAgency && handleApprove(selectedAgency.agencyId)}
                  style={styles.modalApproveBtn}
                />
              </View>
            </ScrollView>
          </SafeAreaView>
        </View>
      </Modal>
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
    alignItems: 'center',
    marginBottom: 8},
  agencyName: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text},
  cardMeta: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    marginBottom: 4},
  cardAddress: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textMuted},
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'flex-end'},
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '90%'},
  modalLoading: {
    position: 'absolute',
    top: 20,
    left: '50%',
    zIndex: 10},
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border},
  modalTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text},
  modalScroll: {
    paddingHorizontal: 20,
    paddingBottom: 40},
  modalSectionTitle: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textSecondary,
    marginTop: 18,
    marginBottom: 10,
    textTransform: 'uppercase'},
  detailsBox: {
    backgroundColor: theme.colors.background,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.colors.border},
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(226, 232, 240, 0.5)'},
  detailsLabel: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary},
  detailsVal: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text},
  imageBox: {
    width: '100%',
    height: 200,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.borderDark,
    backgroundColor: theme.colors.background},
  nicDocImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain'},
  noDocText: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.error,
    fontStyle: 'italic'},
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 28},
  modalRejectBtn: {
    width: '32%',
    borderColor: theme.colors.error,
    borderWidth: 1.5},
  modalRejectText: {
    color: theme.colors.error},
  modalApproveBtn: {
    width: '64%',
    backgroundColor: '#475569'}});

export default AgencyVerificationScreen;
