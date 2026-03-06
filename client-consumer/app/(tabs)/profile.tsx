import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useQuery } from '@apollo/client';
import { useAuth } from '../../src/providers/AuthProvider';
import { GET_MEMBER_PROFILE, GET_MY_MEMBERSHIP, GET_MY_VEHICLES } from '../../src/graphql/queries';

export default function ProfileScreen() {
  const { logout, user } = useAuth();
  const { data: profileData } = useQuery(GET_MEMBER_PROFILE);
  const { data: membershipData } = useQuery(GET_MY_MEMBERSHIP);
  const { data: vehiclesData } = useQuery(GET_MY_VEHICLES);

  const profile = profileData?.memberProfile;
  const membership = membershipData?.myMembership;
  const vehicles = vehiclesData?.myVehicles || [];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Profile</Text>
        <View style={styles.card}>
          <Text style={styles.label}>Name</Text>
          <Text style={styles.value}>{profile?.fullName || 'N/A'}</Text>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{profile?.email || user?.email}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Membership</Text>
        <View style={styles.card}>
          {membership ? (
            <>
              <Text style={styles.planName}>{membership.planName}</Text>
              <Text style={[styles.status, { color: membership.status === 'ACTIVE' ? '#10b981' : '#f59e0b' }]}>
                {membership.status}
              </Text>
              <View style={styles.statsRow}>
                <View style={styles.stat}>
                  <Text style={styles.statNumber}>{membership.washesRemaining}</Text>
                  <Text style={styles.statLabel}>Washes Left</Text>
                </View>
                <View style={styles.stat}>
                  <Text style={styles.statNumber}>{membership.rolloverWashes}</Text>
                  <Text style={styles.statLabel}>Rollover</Text>
                </View>
              </View>
            </>
          ) : (
            <Text style={styles.noMembership}>No active membership</Text>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Vehicles ({vehicles.length})</Text>
        {vehicles.map((v: any) => (
          <View key={v.id} style={styles.card}>
            <Text style={styles.vehicleName}>{v.year} {v.make} {v.model}</Text>
            {v.isDefault && <Text style={styles.defaultBadge}>Default</Text>}
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  section: { padding: 16, paddingBottom: 0 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12, color: '#111827' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12 },
  label: { fontSize: 12, color: '#6b7280', textTransform: 'uppercase', marginTop: 8 },
  value: { fontSize: 16, color: '#111827', marginTop: 2 },
  planName: { fontSize: 18, fontWeight: '600' },
  status: { fontSize: 14, fontWeight: '500', marginTop: 4 },
  statsRow: { flexDirection: 'row', marginTop: 16 },
  stat: { flex: 1, alignItems: 'center' },
  statNumber: { fontSize: 28, fontWeight: '700', color: '#2563eb' },
  statLabel: { fontSize: 12, color: '#6b7280', marginTop: 4 },
  noMembership: { fontSize: 14, color: '#6b7280' },
  vehicleName: { fontSize: 16, fontWeight: '500' },
  defaultBadge: { fontSize: 12, color: '#2563eb', marginTop: 4 },
  logoutButton: { margin: 16, padding: 16, borderRadius: 8, backgroundColor: '#ef4444', alignItems: 'center' },
  logoutText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
