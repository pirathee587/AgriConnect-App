import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../../navigation/types';
import { theme } from '../../../theme';
import { Ionicons } from '@expo/vector-icons';

type RoleSelectScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'RoleSelect'>;

interface Props {
  navigation: RoleSelectScreenNavigationProp;
}

export const RoleSelectScreen: React.FC<Props> = ({ navigation }) => {
  const roles = [
    {
      id: 'farmer' as const,
      title: 'Farmer / விவசாயி',
      description: 'Book cargo space, check live vegetable market prices, and rate agencies.',
      icon: 'leaf-outline',
      color: theme.colors.primary},
    {
      id: 'agency' as const,
      title: 'Marketing Agency / முகவர்',
      description: 'List travel trips, manage farmer bookings, and update crop prices.',
      icon: 'bus-outline',
      color: theme.colors.secondary},
    {
      id: 'admin' as const,
      title: 'System Administrator',
      description: 'Approve agency NICs, verify activation fee payments, and view analytics.',
      icon: 'shield-checkmark-outline',
      color: '#475569'},
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcome}>Welcome to</Text>
        <Text style={styles.brandName}>AgriConnect</Text>
        <Text style={styles.subtext}>Select your account type to proceed</Text>
      </View>

      <View style={styles.rolesContainer}>
        {roles.map((role) => (
          <TouchableOpacity
            key={role.id}
            activeOpacity={0.9}
            style={[styles.roleCard, { borderColor: role.color + '20' }]}
            onPress={() => navigation.navigate('Login', { role: role.id })}
          >
            <View style={[styles.iconContainer, { backgroundColor: role.color + '10' }]}>
              <Ionicons name={role.icon as any} size={28} color={role.color} />
            </View>
            <View style={styles.roleInfo}>
              <Text style={styles.roleTitle}>{role.title}</Text>
              <Text style={styles.roleDesc}>{role.description}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} />
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Connecting Agriculture with Markets</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: 20,
    justifyContent: 'space-between'},
  header: {
    marginTop: 40,
    alignItems: 'center'},
  welcome: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.textSecondary},
  brandName: {
    fontSize: theme.typography.sizes.xxxl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primaryDark,
    marginVertical: 4,
    letterSpacing: 0.5},
  subtext: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textMuted,
    marginTop: 4},
  rolesContainer: {
    flex: 1,
    justifyContent: 'center',
    marginVertical: 20},
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1.5,
    shadowColor: theme.colors.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 12,
    elevation: 2},
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16},
  roleInfo: {
    flex: 1,
    paddingRight: 8},
  roleTitle: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
    marginBottom: 4},
  roleDesc: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    lineHeight: 16},
  footer: {
    marginBottom: 20,
    alignItems: 'center'},
  footerText: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.textMuted}});

export default RoleSelectScreen;
