import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';
import ErrorBoundary from '@/components/ErrorBoundary';
import 'react-native-url-polyfill/auto';

export default function RootLayout() {
  useFrameworkReady();

  useEffect(() => {
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, { hasSession: !!session });
      
      if (event === 'SIGNED_OUT' || !session) {
        console.log('User signed out, navigating to login');
        router.replace('/(auth)/login');
      } else if (event === 'SIGNED_IN' && session) {
        console.log('User signed in, navigating to tabs');
        router.replace('/(tabs)');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <ErrorBoundary>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="fast-quote" options={{ headerShown: false }} />
        <Stack.Screen name="quote-preview" options={{ headerShown: false }} />
        <Stack.Screen name="invoice-view" options={{ headerShown: false }} />
        <Stack.Screen name="quote-approval" options={{ headerShown: false }} />
        <Stack.Screen name="send-quote" options={{ headerShown: false }} />
        <Stack.Screen name="send-invoice" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ErrorBoundary>
  );
}