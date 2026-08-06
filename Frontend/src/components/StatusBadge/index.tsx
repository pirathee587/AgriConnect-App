import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../theme';

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStatusStyle = () => {
    const formattedStatus = status?.toUpperCase().replace(/\s+/g, '_');
    
    switch (formattedStatus) {
      case 'ACTIVE':
      case 'OPEN':
      case 'APPROVED':
      case 'COMPLETED':
      case 'DELIVERED':
        return {
          bg: 'rgba(16, 185, 129, 0.08)',
          text: theme.colors.success,
          label: status.replace('_', ' '),
        };
      case 'PENDING':
      case 'PENDING_APPROVAL':
      case 'PENDING_OTP':
      case 'PENDING_PAYMENT':
        return {
          bg: 'rgba(245, 158, 11, 0.08)',
          text: theme.colors.warning,
          label: status.replace('_', ' '),
        };
      case 'CANCELLED':
      case 'REJECTED':
      case 'SUSPENDED':
        return {
          bg: 'rgba(239, 68, 68, 0.08)',
          text: theme.colors.error,
          label: status.replace('_', ' '),
        };
      case 'IN_TRANSIT':
      case 'PICKED_UP':
      case 'FULL':
        return {
          bg: 'rgba(59, 130, 246, 0.08)',
          text: theme.colors.info,
          label: status.replace('_', ' '),
        };
      default:
        return {
          bg: '#e2e8f0',
          text: theme.colors.textSecondary,
          label: status || 'UNKNOWN',
        };
    }
  };

  const stylesDetail = getStatusStyle();

  return (
    <View style={[styles.badge, { backgroundColor: stylesDetail.bg }]}>
      <Text style={[styles.text, { color: stylesDetail.text }]}>
        {stylesDetail.label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.semibold,
    textTransform: 'uppercase',
  },
});

export default StatusBadge;
