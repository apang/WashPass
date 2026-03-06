import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useQuery } from '@apollo/client';
import { GET_WASH_HISTORY } from '../../src/graphql/queries';

export default function HistoryScreen() {
  const { data, loading, fetchMore } = useQuery(GET_WASH_HISTORY, {
    variables: { limit: 25 },
  });

  const items = data?.washHistory?.items || [];
  const hasMore = data?.washHistory?.hasMore;
  const nextCursor = data?.washHistory?.nextCursor;

  const statusColor = (status: string) => {
    switch (status) {
      case 'VALIDATED': return '#10b981';
      case 'PENDING': return '#f59e0b';
      case 'EXPIRED': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.center}><Text>Loading history...</Text></View>
      ) : items.length === 0 ? (
        <View style={styles.center}><Text style={styles.emptyText}>No wash history yet</Text></View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item: any) => item.id}
          renderItem={({ item }: { item: any }) => (
            <View style={styles.card}>
              <View style={styles.row}>
                <Text style={styles.location}>{item.locationName}</Text>
                <Text style={[styles.status, { color: statusColor(item.status) }]}>{item.status}</Text>
              </View>
              <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
              <Text style={styles.code}>Code: {item.numericCode}</Text>
            </View>
          )}
          onEndReached={() => {
            if (hasMore && nextCursor) {
              fetchMore({ variables: { cursor: nextCursor } });
            }
          }}
          onEndReachedThreshold={0.5}
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
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  location: { fontSize: 16, fontWeight: '600' },
  status: { fontSize: 14, fontWeight: '500' },
  date: { fontSize: 13, color: '#6b7280', marginTop: 4 },
  code: { fontSize: 13, color: '#9ca3af', marginTop: 2 },
});
