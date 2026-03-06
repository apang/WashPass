import React from 'react';
import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../src/providers/AuthProvider';
import { ApolloProvider } from '../src/providers/ApolloProvider';

export default function RootLayout() {
  return (
    <AuthProvider>
      <ApolloProvider>
        <StatusBar style="dark" />
        <Slot />
      </ApolloProvider>
    </AuthProvider>
  );
}
