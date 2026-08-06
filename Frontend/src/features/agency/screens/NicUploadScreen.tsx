import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  Alert 
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AgencyTabParamList } from '../../../navigation/types';
import * as ImagePicker from 'expo-image-picker';
import { uploadApi } from '../../../api/upload.api';
import { updateAgencyStatus } from '../../../store/slices/authSlice';
import { useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from '../../../theme';
import { Button, Loader, Card } from '../../../components';
import { Ionicons } from '@expo/vector-icons';

type NicUploadNavigationProp = NativeStackNavigationProp<AgencyTabParamList, 'NicUpload'>;

interface Props {
  navigation: NicUploadNavigationProp;
}

export const NicUploadScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch();
  const [nicFront, setNicFront] = useState<{ uri: string; name: string; type: string } | null>(null);
  const [nicBack, setNicBack] = useState<{ uri: string; name: string; type: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async (side: 'front' | 'back') => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Media library access is needed to select NIC photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 10],
      quality: 0.85});

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      const uri = asset.uri;
      const filename = uri.split('/').pop() || `nic_${side}.jpg`;
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image/jpeg`;

      const fileData = {
        uri,
        name: filename,
        type};

      if (side === 'front') {
        setNicFront(fileData);
      } else {
        setNicBack(fileData);
      }
    }
  };

  const handleUpload = async () => {
    if (!nicFront || !nicBack) {
      Alert.alert('Incomplete Scans', 'Please select both Front and Back photos of your NIC.');
      return;
    }

    setLoading(true);
    try {
      const response = await uploadApi.uploadNic(nicFront, nicBack);
      
      // Update Agency Status to PENDING_APPROVAL
      await AsyncStorage.setItem('agencyStatus', 'PENDING_APPROVAL');
      dispatch(updateAgencyStatus('PENDING_APPROVAL'));

      Alert.alert(
        'Upload Successful',
        'Your new NIC photo scans are uploaded. The Administrator will review them for approval.',
        [
          {
            text: 'OK',
            onPress: () => navigation.replace('AgencyDashboard')},
        ]
      );
    } catch (e: any) {
      Alert.alert('Upload Failed', e.message || 'Could not upload NIC files. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Loader visible={loading} message="Uploading NIC photos..." />
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Upload NIC Scans</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Submit Document Proof</Text>
        <Text style={styles.desc}>
          Upload clear, readable photo scans of the front and back of your National Identity Card (NIC).
        </Text>

        <View style={styles.photosWrapper}>
          <Text style={styles.label}>NIC FRONT PHOTO</Text>
          <TouchableOpacity 
            activeOpacity={0.8}
            style={[styles.photoBox, !nicFront && styles.photoBoxEmpty]}
            onPress={() => pickImage('front')}
          >
            {nicFront ? (
              <Image source={{ uri: nicFront.uri }} style={styles.image} />
            ) : (
              <View style={styles.placeholder}>
                <Ionicons name="camera" size={36} color={theme.colors.textMuted} />
                <Text style={styles.placeholderText}>Tap to select NIC Front scan</Text>
              </View>
            )}
          </TouchableOpacity>

          <Text style={styles.label}>NIC BACK PHOTO</Text>
          <TouchableOpacity 
            activeOpacity={0.8}
            style={[styles.photoBox, !nicBack && styles.photoBoxEmpty]}
            onPress={() => pickImage('back')}
          >
            {nicBack ? (
              <Image source={{ uri: nicBack.uri }} style={styles.image} />
            ) : (
              <View style={styles.placeholder}>
                <Ionicons name="camera" size={36} color={theme.colors.textMuted} />
                <Text style={styles.placeholderText}>Tap to select NIC Back scan</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <Button 
          title="Upload Scans for Review" 
          onPress={handleUpload} 
          style={styles.uploadBtn}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: 20},
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
  content: {
    flex: 1},
  title: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
    marginBottom: 6},
  desc: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    lineHeight: 20,
    marginBottom: 20},
  photosWrapper: {
    flex: 1},
  label: {
    fontSize: 11,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textMuted,
    marginBottom: 8,
    textTransform: 'uppercase'},
  photoBox: {
    height: 120,
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 20},
  photoBoxEmpty: {
    borderWidth: 2,
    borderColor: theme.colors.borderDark,
    borderStyle: 'dashed',
    backgroundColor: '#ffffff'},
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover'},
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'},
  placeholderText: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textMuted,
    marginTop: 8},
  uploadBtn: {
    backgroundColor: theme.colors.secondary,
    marginBottom: 30}});

export default NicUploadScreen;
