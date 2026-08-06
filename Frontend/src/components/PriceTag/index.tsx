import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { theme } from '../../theme';

interface PriceTagProps {
  price: number;
  unit?: string;
  containerStyle?: ViewStyle;
  priceStyle?: TextStyle;
  unitStyle?: TextStyle;
}

export const PriceTag: React.FC<PriceTagProps> = ({
  price,
  unit = 'kg',
  containerStyle,
  priceStyle,
  unitStyle,
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={[styles.currency, priceStyle]}>Rs. </Text>
      <Text style={[styles.price, priceStyle]}>{price.toLocaleString()}</Text>
      <Text style={[styles.unit, unitStyle]}> / {unit}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  currency: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.primaryDark,
  },
  price: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primaryDark,
  },
  unit: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.primaryDark,
    opacity: 0.8,
  },
});

export default PriceTag;
