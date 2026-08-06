import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';

interface RatingStarsProps {
  rating: number;
  maxStars?: number;
  size?: number;
  onRatingPress?: (rating: number) => void;
  style?: any;
}

export const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  maxStars = 5,
  size = 18,
  onRatingPress,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      {Array(maxStars)
        .fill(0)
        .map((_, index) => {
          const starNumber = index + 1;
          const isFilled = starNumber <= rating;
          
          const IconComponent = (
            <Ionicons
              name={isFilled ? 'star' : 'star-outline'}
              size={size}
              color={isFilled ? '#eab308' : theme.colors.borderDark}
              style={styles.star}
            />
          );

          if (onRatingPress) {
            return (
              <TouchableOpacity
                key={index}
                activeOpacity={0.7}
                onPress={() => onRatingPress(starNumber)}
              >
                {IconComponent}
              </TouchableOpacity>
            );
          }

          return <View key={index}>{IconComponent}</View>;
        })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  star: {
    marginRight: 2,
  },
});

export default RatingStars;
