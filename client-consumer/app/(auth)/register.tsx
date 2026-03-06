import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Link, router } from 'expo-router';
import { useAuth } from '../../src/providers/AuthProvider';

export default function RegisterScreen() {
  const { register } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!fullName || !email || !password) return Alert.alert('Error', 'Please fill in all fields');
    if (password.length < 8) return Alert.alert('Error', 'Password must be at least 8 characters');
    setLoading(true);
    try {
      await register(email, password, fullName);
      router.replace('/(tabs)');
    } catch (e: any) {
      Alert.alert('Registration Failed', e.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.inner}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join WashPass today</Text>

        <TextInput style={styles.input} placeholder="Full Name" value={fullName} onChangeText={setFullName} />
        <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        <TextInput style={styles.input} placeholder="Password (8+ characters)" value={password} onChangeText={setPassword} secureTextEntry />

        <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Creating account...' : 'Create Account'}</Text>
        </TouchableOpacity>

        <Link href="/(auth)/login" style={styles.link}>
          <Text style={styles.linkText}>Already have an account? Sign in</Text>
        </Link>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  inner: { flex: 1, justifyContent: 'center', padding: 24 },
  title: { fontSize: 32, fontWeight: 'bold', textAlign: 'center', color: '#2563eb', marginBottom: 8 },
  subtitle: { fontSize: 16, textAlign: 'center', color: '#6b7280', marginBottom: 32 },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 14, fontSize: 16, marginBottom: 16 },
  button: { backgroundColor: '#2563eb', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  link: { marginTop: 24, alignItems: 'center' },
  linkText: { color: '#2563eb', fontSize: 14 },
});
