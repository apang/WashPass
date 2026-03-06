import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useQuery } from '@apollo/client';
import { router } from 'expo-router';
import { GET_NEARBY_LOCATIONS } from '../../src/graphql/queries';

export default function HomeScreen() {
  const [location, setLocation] = useState({ lat: 34.0522, lng: -118.2437 }); // Default LA

  const { data, loading, refetch } = useQuery(GET_NEARBY_LOCATIONS, {
    variables: { lat: location.lat, lng: location.lng, radius: 25, limit: 25 },
  });

  const locations = data?.nearbyLocations?.locations || [];

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.center}>
          <Text>Finding nearby car washes...</Text>
        </View>
      ) : locations.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>No car washes found nearby</Text>
        </View>
      ) : (
        <FlatList
          data={locations}
          keyExtractor={(item: any) => item.id}
          renderItem={({ item }: { item: any }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => router.push(`/location/${item.id}`)}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.distance}>{item.distance} km</Text>
              </View>
              <Text style={styles.address}>{item.address}, {item.city}</Text>
              <View style={styles.ratingRow}>
                <Text style={styles.rating}>★ {item.avgRating.toFixed(1)}</Text>
                <Text style={styles.ratingCount}>({item.totalRatings} reviews)</Text>
              </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 16, color: '#6b7280' },
  list: { padding: 16 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontSize: 18, fontWeight: '600', flex: 1 },
  distance: { fontSize: 14, color: '#2563eb', fontWeight: '500' },
  address: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  rating: { fontSize: 14, color: '#f59e0b', fontWeight: '600' },
  ratingCount: { fontSize: 12, color: '#9ca3af', marginLeft: 4 },
});
