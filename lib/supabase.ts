import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Get Supabase configuration from environment or constants
const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || 
                   process.env.EXPO_PUBLIC_SUPABASE_URL || 
                   'https://pofgpoktfwwrpkgzwuwa.supabase.co';

const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || 
                       process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 
                       'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvZmdwb2t0Znd3cnBrZ3p3dXdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3NDI0OTgsImV4cCI6MjA2NTMxODQ5OH0.Exfvy_9M-h5W-4QEKZvS3m4ikrbPG3ms-NtAQQbSDs4';

console.log('Supabase Configuration:', {
  url: supabaseUrl,
  keyPrefix: supabaseAnonKey.substring(0, 20) + '...',
  platform: Platform.OS
});

// Create Supabase client with minimal configuration for stability
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  global: {
    headers: {
      'X-Client-Info': `jobquote-${Platform.OS}`,
    },
  },
});

// Helper function to check if user is authenticated
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    console.log('Authentication check:', { hasSession: !!session, error: error?.message });
    return !error && !!session?.user;
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
};

// Helper function to get current user
export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    console.log('Current user:', { id: user?.id, email: user?.email });
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

// Helper function to ensure user is authenticated before operations
export const requireAuth = async () => {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    throw new Error('Authentication required. Please log in to continue.');
  }
  return true;
};

// Enhanced connection test
export const testSupabaseConnection = async (): Promise<{ success: boolean; error?: string; details?: any }> => {
  try {
    console.log('=== Testing Supabase Connection ===');
    console.log('Platform:', Platform.OS);
    console.log('URL:', supabaseUrl);
    console.log('Key (first 20 chars):', supabaseAnonKey.substring(0, 20) + '...');
    
    const startTime = Date.now();
    
    // Test 1: Check authentication status
    console.log('Test 1: Authentication status...');
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      console.error('Auth check failed:', authError);
      return { 
        success: false, 
        error: `Authentication check failed: ${authError.message}`,
        details: { error: authError.message, responseTime: Date.now() - startTime }
      };
    }
    
    // Test 2: Basic connectivity
    console.log('Test 2: Basic connectivity...');
    const { data, error } = await supabase
      .from('users')
      .select('id', { head: true })
      .limit(1);
    
    const responseTime = Date.now() - startTime;
    console.log(`Response time: ${responseTime}ms`);
    
    if (error) {
      console.error('Basic connectivity test failed:', error);
      return { 
        success: false, 
        error: `Database connection failed: ${error.message}`,
        details: { error: error.message, responseTime }
      };
    }
    
    console.log('=== Connection Test Successful ===');
    console.log('Current user:', session?.user?.id || 'Not authenticated');
    console.log('Response time:', responseTime + 'ms');
    
    return { 
      success: true, 
      details: { 
        responseTime, 
        userAuthenticated: !!session?.user,
        userId: session?.user?.id,
      }
    };
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('=== Connection Test Failed ===');
    console.error('Error:', error);
    
    return { 
      success: false, 
      error: `Connection error: ${errorMessage}`,
      details: { error: errorMessage, platform: Platform.OS }
    };
  }
};

// Helper function to check if we're in a development environment
export const isDevelopment = () => {
  return __DEV__ || process.env.NODE_ENV === 'development';
};

// Helper function to get storage URL with fallback
export const getStorageUrl = (bucket: string, path: string) => {
  try {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  } catch (error) {
    console.warn('Failed to get storage URL:', error);
    return null;
  }
};

// Helper function to check network connectivity
export const checkNetworkConnectivity = async (): Promise<boolean> => {
  try {
    const response = await fetch('https://www.google.com/favicon.ico', {
      method: 'HEAD',
      mode: 'no-cors',
      cache: 'no-cache',
    });
    return true;
  } catch (error) {
    console.warn('Network connectivity check failed:', error);
    return false;
  }
};

// Enhanced error handler for better user experience
export const handleSupabaseError = (error: any): string => {
  if (!error) return 'Unknown error occurred';
  
  const message = error.message || error.toString();
  
  // Authentication and RLS errors
  if (message.includes('row-level security policy') || message.includes('RLS')) {
    return 'Authentication required. Please log in to continue.';
  }
  
  // Network-related errors
  if (message.includes('Failed to fetch') || message.includes('Network request failed')) {
    return 'Network connection failed. Please check your internet connection and try again.';
  }
  
  // Timeout errors
  if (message.includes('timeout') || message.includes('Request timeout')) {
    return 'Connection timeout. Please try again.';
  }
  
  // Authentication errors
  if (message.includes('401') || message.includes('Unauthorized')) {
    return 'Authentication required. Please log in to continue.';
  }
  
  // Permission errors
  if (message.includes('403') || message.includes('permission denied')) {
    return 'Access denied. Please check your permissions.';
  }
  
  // Database errors
  if (message.includes('relation') && message.includes('does not exist')) {
    return 'Database table not found. Please contact support.';
  }
  
  // Generic error with original message
  return `Error: ${message}`;
};