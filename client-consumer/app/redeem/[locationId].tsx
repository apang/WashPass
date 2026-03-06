import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useMutation } from '@apollo/client';
import { GENERATE_REDEMPTION_CODE } from '../../src/graphql/mutations';

export default function RedeemScreen() {
  const { locationId } = useLocalSearchParams<{ locationId: string }>();
  const [generateCode, { data, loading, error }] = useMutation(GENERATE_REDEMPTION_CODE);
  const [timeLeft, setTimeLeft] = useState(600);

  useEffect(() => {
    generateCode({ variables: { locationId } });
  }, [locationId]);

  useEffect(() => {
    if (!data) return;
    const expiresAt = new Date(data.generateRedemptionCode.expiresAt).getTime();
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining <= 0) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [data]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#2563eb" /><Text style={styles.loadingText}>Generating code...</Text></View>;
  }

  if (error) {
    return <View style={styles.center}><Text style={styles.errorText}>{error.message}</Text></View>;
  }

  const codeData = data?.generateRedemptionCode;
  if (!codeData) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Wash Code</Text>

      <View style={styles.qrContainer}>
        <Image source={{ uri: codeData.qrDataUrl }} style={styles.qr} />
      </View>

      <Text style={styles.numericCode}>{codeData.numericCode}</Text>
      <Text style={styles.alphaCode}>{codeData.code}</Text>

      <View style={[styles.timerContainer, timeLeft < 60 && styles.timerWarning]}>
        <Text style={[styles.timer, timeLeft < 60 && styles.timerTextWarning]}>
          {timeLeft > 0 ? formatTime(timeLeft) : 'Expired'}
        </Text>
        <Text style={styles.timerLabel}>Time remaining</Text>
      </View>

      <Text style={styles.instruction}>Show this code to the car wash attendant</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', alignItems: 'center', padding: 24, paddingTop: 48 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 16, fontSize: 16, color: '#6b7280' },
  errorText: { fontSize: 16, color: '#ef4444', textAlign: 'center', padding: 24 },
  title: { fontSize: 24, fontWeight: '700', color: '#111827', marginBottom: 24 },
  qrContainer: { backgroundColor: '#f9fafb', padding: 16, borderRadius: 16, marginBottom: 24 },
  qr: { width: 200, height: 200 },
  numericCode: { fontSize: 40, fontWeight: '800', color: '#111827', letterSpacing: 8 },
  alphaCode: { fontSize: 14, color: '#6b7280', marginTop: 8, fontFamily: 'monospace' },
  timerContainer: { marginTop: 32, padding: 16, borderRadius: 12, backgroundColor: '#f0f9ff', alignItems: 'center' },
  timerWarning: { backgroundColor: '#fef2f2' },
  timer: { fontSize: 32, fontWeight: '700', color: '#2563eb' },
  timerTextWarning: { color: '#ef4444' },
  timerLabel: { fontSize: 12, color: '#6b7280', marginTop: 4 },
  instruction: { marginTop: 32, fontSize: 14, color: '#6b7280', textAlign: 'center' },
});
