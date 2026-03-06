import React from 'react';
import { ApolloClient, InMemoryCache, ApolloProvider as BaseApolloProvider, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { useAuth } from './AuthProvider';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';

export function ApolloProvider({ children }: { children: React.ReactNode }) {
  const { getToken } = useAuth();

  const httpLink = createHttpLink({ uri: `${API_URL}/graphql` });

  const authLink = setContext(async (_, { headers }) => {
    const token = await getToken();
    return {
      headers: {
        ...headers,
        authorization: token ? `Bearer ${token}` : '',
      },
    };
  });

  const client = new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache(),
  });

  return <BaseApolloProvider client={client}>{children}</BaseApolloProvider>;
}
