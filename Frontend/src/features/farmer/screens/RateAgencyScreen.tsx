import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert 
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FarmerTabParamList } from '../../../navigation/types';
import { farmerApi } from '../../../api/farmer.api';
import { theme } from '../../../theme';
import { Input, Button, RatingStars, Loader, Card } from '../../../components';
import { Ionicons } from '@expo/vector-icons';

type RateAgencyRouteProp = RouteProp<FarmerTabParamList, 'RateAgency'>;
type RateAgencyNavigationProp = NativeStackNavigationProp<FarmerTabParamList, 'RateAgency'>;

interface Props {
  route: RateAgencyRouteProp;
  navigation: RateAgencyNavigationProp;
}

export const RateAgencyScreen: React.FC<Props> = ({ route, navigation }) => {
  const { bookingId, agencyName, marketDestination } = route.params;
  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await farmerApi.submitRating({
        bookingId,
        stars,
        comment: comment.trim() || undefined});

      Alert.alert(
        'Review Submitted',
        'Thank you for rating the agency! Your feedback helps keep the platform secure.',
        [
          {
            text: 'OK',
            onPress: () => {
              navigation.navigate('MyBookings');
            }},
        ]
      );
    } catch (e: any) {
      Alert.alert('Review Failed', e.message || 'Could not submit your review. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Loader visible={loading} message="Submitting review..." />
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Rate Agency</Text>
      </View>

      <View style={styles.content}>
        <Card style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Completed Trip Review</Text>
          <Text style={styles.agencyName}>{agencyName}</Text>
          <Text style={styles.destination}>Destination: {marketDestination}</Text>
        </Card>

        <Text style={styles.title}>How was your experience?</Text>
        <Text style={styles.sub}>Select a star rating for the agency's pickup schedule, vehicle transport quality, and service.</Text>

        <View style={styles.starsWrapper}>
          <RatingStars 
            rating={stars} 
            size={36} 
            onRatingPress={setStars} 
          />
        </View>

        <Input
          label="Leave a Comment (Optional)"
          placeholder="Share your experience (e.g. pickup was on time, vegetables delivered in excellent condition)"
          multiline
          numberOfLines={3}
          value={comment}
          onChangeText={setComment}
          icon={<Ionicons name="chatbox-ellipses-outline" size={20} color={theme.colors.textMuted} />}
          containerStyle={styles.commentInput}
        />

        <Button 
          title="Submit Rating" 
          onPress={handleSubmit} 
          style={styles.submitBtn}
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
    marginBottom: 24},
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
  summaryCard: {
    padding: 16,
    marginBottom: 24,
    backgroundColor: 'rgba(245, 158, 11, 0.04)',
    borderColor: theme.colors.secondary},
  summaryLabel: {
    fontSize: 11,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.secondaryDark,
    textTransform: 'uppercase',
    marginBottom: 6},
  agencyName: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
    marginBottom: 2},
  destination: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary},
  title: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
    marginBottom: 8,
    textAlign: 'center'},
  sub: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20},
  starsWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16},
  commentInput: {
    marginTop: 10,
    marginBottom: 24},
  submitBtn: {
    backgroundColor: theme.colors.secondary}});

export default RateAgencyScreen;
