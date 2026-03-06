import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery } from '@apollo/client';
import { GET_LOCATION } from '../../src/graphql/queries';

export default function LocationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, loading } = useQuery(GET_LOCATION, { variables: { id } });
  const location = data?.location;

  if (loading) return <View style={styles.center}><Text>Loading...</Text></View>;
  if (!location) return <View style={styles.center}><Text>Location not found</Text></View>;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.name}>{location.name}</Text>
        <Text style={styles.address}>{location.address}</Text>
        <Text style={styles.address}>{location.city}, {location.state} {location.zipCode}</Text>
      </View>

      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <Text style={styles.infoValue}>★ {location.avgRating.toFixed(1)}</Text>
          <Text style={styles.infoLabel}>{location.totalRatings} reviews</Text>
        </View>
        {location.phone && (
          <View style={styles.infoItem}>
            <Text style={styles.infoValue}>{location.phone}</Text>
            <Text style={styles.infoLabel}>Phone</Text>
          </View>
        )}
      </View>

      <TouchableOpacity
        style={styles.redeemButton}
        onPress={() => router.push(`/redeem/${id}`)}
      >
        <Text style={styles.redeemText}>Get Wash Code</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 24, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  name: { fontSize: 24, fontWeight: '700', color: '#111827' },
  address: { fontSize: 15, color: '#6b7280', marginTop: 4 },
  infoRow: { flexDirection: 'row', padding: 16 },
  infoItem: { flex: 1, alignItems: 'center', padding: 16 },
  infoValue: { fontSize: 20, fontWeight: '600', color: '#111827' },
  infoLabel: { fontSize: 12, color: '#6b7280', marginTop: 4 },
  redeemButton: { margin: 24, backgroundColor: '#2563eb', padding: 18, borderRadius: 12, alignItems: 'center' },
  redeemText: { color: '#fff', fontSize: 18, fontWeight: '700' },
});
