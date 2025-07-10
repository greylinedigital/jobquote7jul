import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  ScrollView,
  ActivityIndicator,
  FlatList,
  Alert,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Zap, FileText, ChevronRight, Plus, Pencil, Receipt, Crown } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { Quote, Client, BusinessProfile, Invoice } from '@/types/database';
import { useSubscription } from '@/hooks/useSubscription';
import { getCurrentUsage } from '@/lib/subscription';
import PremiumBadge from '@/components/PremiumBadge';
import LoadingSpinner from '@/components/LoadingSpinner';
import EmptyState from '@/components/EmptyState';
import Toast from '@/components/Toast';
import SubscriptionModal from '@/components/SubscriptionModal';

const LOGO_URL = 'https://pofgpoktfwwrpkgzwuwa.supabase.co/storage/v1/object/sign/logoassets/JobQuote-mainlogo.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8yZjIxYTE4My1kNTZmLTRhOTYtOTkxMi0yNGU4NTllYzUxYjciLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJsb2dvYXNzZXRzL0pvYlF1b3RlLW1haW5sb2dvLnBuZyIsImlhdCI6MTc1MDE3MzI5OSwiZXhwIjoxODQ0NzgxMjk5fQ.-iEcQYX1u7yDZjDssRq6szOYc3r8ziTlv2OTidRtQSs';

type QuoteWithClient = Quote & {
  clients: Client;
  invoices?: Invoice[];
};

export default function FastQuoteTab() {
  const [quotes, setQuotes] = useState<QuoteWithClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null);
  const [profileCheckComplete, setProfileCheckComplete] = useState(false);
  const [usage, setUsage] = useState({ quotesThisWeek: 0, maxQuotesPerWeek: 3, invoicesThisMonth: 0, maxInvoicesPerMonth: 3 });
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');
  
  // Subscription state
  const { isPremium, refreshSubscriptionStatus } = useSubscription();
  const [subscriptionModalVisible, setSubscriptionModalVisible] = useState(false);
  
  // Scroll tracking for sticky button
  const [showStickyButton, setShowStickyButton] = useState(false);

  // Use useFocusEffect to refresh quotes when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchDashboardData();
      fetchUsageData();
    }, [])
  );

  const fetchDashboardData = async () => {
    try {
      console.log('=== FETCHING DASHBOARD DATA ===');
      setError(null);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No authenticated user found');
        setLoading(false);
        setProfileCheckComplete(true);
        return;
      }

      console.log('Fetching business profile for user:', user.id);

      // Fetch business profile for user name
      const { data: businessProfile, error: profileError } = await supabase
        .from('business_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      console.log('Business profile result:', { businessProfile, profileError });

      let displayName = '';

      if (profileError && profileError.code === 'PGRST116') {
        // No business profile exists
        console.log('No business profile found');
        const emailName = user.email?.split('@')[0] || 'User';
        displayName = emailName.charAt(0).toUpperCase() + emailName.slice(1);
      } else if (profileError) {
        // Other error - log it
        console.error('Error fetching business profile:', profileError);
        const emailName = user.email?.split('@')[0] || 'User';
        displayName = emailName.charAt(0).toUpperCase() + emailName.slice(1);
      } else if (businessProfile) {
        // Business profile exists
        setBusinessProfile(businessProfile);
        
        // Prioritize user_name over business_name for personal greeting
        if (businessProfile.user_name && businessProfile.user_name.trim().length > 0) {
          // Use the user's actual name
          console.log('User has personal name:', businessProfile.user_name);
          const firstName = businessProfile.user_name.split(' ')[0];
          displayName = firstName;
        } else if (businessProfile.business_name && businessProfile.business_name.trim().length > 0) {
          // Fallback to business name
          console.log('Using business name:', businessProfile.business_name);
          const firstName = businessProfile.business_name.split(' ')[0];
          displayName = firstName;
        } else {
          // Fallback to email
          const emailName = user.email?.split('@')[0] || 'User';
          displayName = emailName.charAt(0).toUpperCase() + emailName.slice(1);
        }
      }

      setUserName(displayName);
      setProfileCheckComplete(true);

      console.log('Final state:', { 
        displayName, 
        hasUserName: businessProfile?.user_name,
        hasBusinessName: businessProfile?.business_name 
      });

      console.log('Fetching quotes with client data...');
      // Fetch quotes with client data and invoices
      const { data: quotesData } = await supabase
        .from('quotes')
        .select(`
          *,
          clients (*),
          invoices (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (quotesData) {
        console.log('Successfully fetched quotes:', quotesData.length);
        setQuotes(quotesData);
      } else {
        console.log('No quotes found');
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
      setProfileCheckComplete(true);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsageData = async () => {
    try {
      console.log('Fetching usage data...');
      const usageData = await getCurrentUsage();
      console.log('Usage data:', usageData);
      setUsage(usageData);
    } catch (error) {
      console.error('Error fetching usage data:', error);
      // Don't show error for usage data as it's not critical
    }
  };

  const createInvoice = async (quote: QuoteWithClient) => {
    try {
      console.log('Creating invoice for quote:', quote.id);
      
      // Generate invoice number
      const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
      
      // Calculate due date (7 days from now)
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 7);

      const { data, error } = await supabase
        .from('invoices')
        .insert({
          quote_id: quote.id,
          invoice_number: invoiceNumber,
          total: quote.total,
          due_date: dueDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
          status: 'Unpaid',
        })
        .select()
        .single();

      if (error) throw error;

      console.log('Invoice created successfully:', data.id);
      
      showSuccessToast('Invoice created successfully!');
      
      Alert.alert(
        'Invoice Created',
        `Invoice ${invoiceNumber} has been created successfully!`,
        [
          {
            text: 'View Invoice',
            onPress: () => {
              router.push(`/invoice-view/${data.id}`);
            }
          },
          {
            text: 'OK',
            onPress: () => {
              // Refresh the quotes list to show updated button
              fetchDashboardData();
            }
          }
        ]
      );

    } catch (error) {
      console.error('Error creating invoice:', error);
      showErrorToast('Failed to create invoice. Please try again.');
    }
  };

  const handleInvoiceAction = (quote: QuoteWithClient) => {
    const hasInvoice = quote.invoices && quote.invoices.length > 0;
    
    if (hasInvoice) {
      // Navigate to existing invoice
      router.push(`/invoice-view/${quote.invoices![0].id}`);
    } else {
      // Create new invoice
      createInvoice(quote);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'short',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'draft':
        return '#6C757D';
      case 'sent':
        return '#17A2B8';
      case 'approved':
        return '#28A745';
      case 'rejected':
        return '#DC3545';
      default:
        return '#6C757D';
    }
  };

  // Optimized scroll handler with useCallback to prevent re-renders
  const handleScroll = useCallback((event: any) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;
    const shouldShow = currentScrollY > 300;
    
    // Only update state if the value actually changes
    if (shouldShow !== showStickyButton) {
      setShowStickyButton(shouldShow);
    }
  }, [showStickyButton]);

  const handleSubscriptionSuccess = () => {
    refreshSubscriptionStatus();
    fetchUsageData();
  };
  
  const showSuccessToast = (message: string) => {
    setToastMessage(message);
    setToastType('success');
    setShowToast(true);
  };
  
  const showErrorToast = (message: string) => {
    setToastMessage(message);
    setToastType('error');
    setShowToast(true);
  };
  
  const showInfoToast = (message: string) => {
    setToastMessage(message);
    setToastType('info');
    setShowToast(true);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner message="Loading dashboard..." />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <EmptyState
          icon={<AlertCircle size={48} color="#DC3545" />}
          title="Failed to Load"
          subtitle={error}
          actionText="Try Again"
          onAction={fetchDashboardData}
        />
      </SafeAreaView>
    );
  }

  const renderQuote = ({ item }: { item: QuoteWithClient }) => {
    const hasInvoice = item.invoices && item.invoices.length > 0;
    
    return (
      <View style={styles.quoteCard}>
        <TouchableOpacity
          onPress={() => router.push(`/quote-preview/${item.id}`)}
          style={styles.quoteContent}
        >
          <View style={styles.quoteHeader}>
            <View style={styles.quoteHeaderLeft}>
              <Text style={styles.quoteTitle}>{item.job_title}</Text>
              <Text style={styles.clientName}>{item.clients.name}</Text>
              <Text style={styles.quoteDescription} numberOfLines={2}>
                {item.description}
              </Text>
            </View>
            <View style={styles.quoteHeaderRight}>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                <Text style={styles.statusText}>{(item.status || 'DRAFT').toUpperCase()}</Text>
              </View>
              <Text style={styles.quoteTotal}>{formatCurrency(item.total || 0)}</Text>
              <Text style={styles.quoteDate}>{formatDate(item.created_at)}</Text>
            </View>
          </View>
        </TouchableOpacity>

        <View style={styles.quoteActions}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => router.push(`/quote-preview/${item.id}`)}
          >
            <Pencil size={16} color="#666" />
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>

          {/* Show action buttons for sent/approved quotes */}
          {(item.status?.toLowerCase() === 'sent' || item.status?.toLowerCase() === 'approved') && (
            <TouchableOpacity 
              style={styles.invoiceButton}
              onPress={(e) => {
                e.stopPropagation();
                handleInvoiceAction(item);
              }}
            >
              <Receipt size={16} color="#FFFFFF" />
              <Text style={styles.invoiceButtonText}>
                {hasInvoice ? 'View Invoice' : 'Create Invoice'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Sticky Generate Button */}
      {showStickyButton && (
        <View style={styles.stickyButtonContainer}>
          <TouchableOpacity
            style={styles.stickyGenerateButton}
            onPress={() => router.push('/fast-quote')}
          >
            <Zap size={20} color="#FFFFFF" />
            <Text style={styles.stickyGenerateButtonText}>GENERATE FAST QUOTE</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={100} // Reduced frequency to prevent excessive calls
      >
        {/* Header with Logo and Greeting */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Image 
              source={{ uri: LOGO_URL }} 
              style={styles.logo}
              resizeMode="contain"
            />
            {isPremium && (
              <PremiumBadge size="medium" style={styles.headerPremiumBadge} />
            )}
          </View>
          <Text style={styles.greeting}>{getGreeting()},</Text>
          <Text style={styles.userName}>{userName}</Text>
        </View>

        {/* Usage Stats for Free Users */}
        {!isPremium && (
          <View style={styles.usageCard}>
            <View style={styles.usageHeader}>
              <Text style={styles.usageTitle}>Your Usage This Week</Text>
              <TouchableOpacity
                style={styles.upgradeButton}
                onPress={() => setSubscriptionModalVisible(true)}
              >
                <Crown size={16} color="#F6A623" />
                <Text style={styles.upgradeButtonText}>Upgrade</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.usageStats}>
              <View style={styles.usageStat}>
                <Text style={styles.usageStatNumber}>
                  {usage.quotesThisWeek}/{usage.maxQuotesPerWeek}
                </Text>
                <Text style={styles.usageStatLabel}>Quotes</Text>
              </View>
              <View style={styles.usageStat}>
                <Text style={styles.usageStatNumber}>
                  {usage.invoicesThisMonth}/{usage.maxInvoicesPerMonth}
                </Text>
                <Text style={styles.usageStatLabel}>Invoices</Text>
              </View>
            </View>
            
            {(usage.quotesThisWeek >= usage.maxQuotesPerWeek || usage.invoicesThisMonth >= usage.maxInvoicesPerMonth) && (
              <View style={styles.limitWarning}>
                <Text style={styles.limitWarningText}>
                  You've reached your limit. Upgrade to Premium for unlimited access.
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Generate Fast Quote Button */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push('/fast-quote')}
          >
            <Zap size={24} color="#FFFFFF" />
            <Text style={styles.primaryButtonText}>GENERATE FAST QUOTE</Text>
          </TouchableOpacity>
        </View>

        {/* Your Quotes Section - Simplified */}
        {quotes.length > 0 && (
          <View style={styles.quotesContainer}>
            <Text style={styles.quotesTitle}>Your Quotes</Text>

            <FlatList
              data={quotes}
              renderItem={renderQuote}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContainer}
              refreshing={loading}
              onRefresh={fetchDashboardData}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          </View>
        )}

        {/* Empty state when no quotes */}
        {quotes.length === 0 && (
          <EmptyState
            icon={<FileText size={48} color="#666" />}
            title="No Quotes Yet"
            subtitle="Create your first quote with AI assistance"
            actionText="Create First Quote"
            onAction={() => router.push('/fast-quote')}
          />
        )}
      </ScrollView>

      {/* Subscription Modal */}
      <SubscriptionModal
        visible={subscriptionModalVisible}
        onClose={() => setSubscriptionModalVisible(false)}
        onSubscriptionSuccess={handleSubscriptionSuccess}
      />
      
      {/* Toast Notifications */}
      <Toast
        visible={showToast}
        message={toastMessage}
        type={toastType}
        onHide={() => setShowToast(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  stickyButtonContainer: {
    position: 'absolute',
    top: 60, // Position below status bar
    left: 20,
    right: 20,
    zIndex: 1000,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  stickyGenerateButton: {
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center',
    backgroundColor: '#F6A623', 
    borderRadius: 12, 
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  stickyGenerateButtonText: {
    color: '#FFFFFF', 
    fontSize: 16, 
    fontWeight: 'bold', 
    marginLeft: 8,
    letterSpacing: 0.5,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 32,
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    width: 120,
    height: 120,
  },
  headerPremiumBadge: {
    marginLeft: 16,
  },
  greeting: {
    fontSize: 24,
    color: '#888',
    fontWeight: '400',
    textAlign: 'center',
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 4,
    textAlign: 'center',
  },
  usageCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  usageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  usageTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5E6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F6A623',
    gap: 4,
  },
  upgradeButtonText: {
    color: '#F6A623',
    fontSize: 14,
    fontWeight: '600',
  },
  usageStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  usageStat: {
    alignItems: 'center',
  },
  usageStatNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F6A623',
    marginBottom: 4,
  },
  usageStatLabel: {
    fontSize: 14,
    color: '#666',
  },
  limitWarning: {
    backgroundColor: '#FFF5F5',
    borderColor: '#FECACA',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
  },
  limitWarningText: {
    color: '#DC3545',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  actionContainer: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  primaryButton: {
    backgroundColor: '#F6A623',
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 12,
    letterSpacing: 0.5,
  },
  quotesContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  quotesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  listContainer: {
    paddingBottom: 20,
  },
  quoteCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  quoteContent: {
    padding: 16,
  },
  quoteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  quoteHeaderLeft: {
    flex: 1,
    marginRight: 16,
  },
  quoteHeaderRight: {
    alignItems: 'flex-end',
  },
  quoteTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  clientName: {
    fontSize: 14,
    color: '#F6A623',
    fontWeight: '600',
    marginBottom: 4,
  },
  quoteDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  quoteTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  quoteDate: {
    fontSize: 12,
    color: '#999',
  },
  quoteActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F8F9FA',
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  editButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  invoiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#28A745',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  invoiceButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
    marginHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
  },
  createFirstButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F6A623',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  createFirstText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});