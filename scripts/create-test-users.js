const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client with service role key for admin operations
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://pofgpoktfwwrpkgzwuwa.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key-here';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createTestUsers() {
  console.log('🚀 Starting test user creation...');
  
  const testUsers = [
    {
      email: 'test.electrician@jobquote.app',
      password: 'Test1234!',
      trade: 'electrician',
      businessName: 'Custom Automotive Electrical & Air Conditioning',
      userName: 'Mike Johnson',
      abn: '12345678901',
      phone: '+61435097261',
      businessEmail: 'mike@caeelectrical.com.au'
    },
    {
      email: 'test.plumber@jobquote.app',
      password: 'Test1234!',
      trade: 'plumber',
      businessName: 'Reliable Plumbing Solutions',
      userName: 'Sarah Thompson',
      abn: '23456789012',
      phone: '+61412345678',
      businessEmail: 'sarah@reliableplumbing.com.au'
    },
    {
      email: 'test.painter@jobquote.app',
      password: 'Test1234!',
      trade: 'painter',
      businessName: 'Premium Painting Services',
      userName: 'David Chen',
      abn: '34567890123',
      phone: '+61498765432',
      businessEmail: 'david@premiumpaint.com.au'
    }
  ];

  const createdUsers = [];

  for (const userData of testUsers) {
    try {
      console.log(`\n📧 Creating user: ${userData.email}`);
      
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true // Auto-confirm email
      });

      if (authError) {
        console.error(`❌ Failed to create auth user ${userData.email}:`, authError);
        continue;
      }

      const userId = authData.user.id;
      console.log(`✅ Created auth user with ID: ${userId}`);

      // Create business profile
      const { error: profileError } = await supabase
        .from('business_profiles')
        .insert({
          id: userId,
          user_name: userData.userName,
          business_name: userData.businessName,
          abn: userData.abn,
          phone: userData.phone,
          email: userData.businessEmail,
          country: 'Australia',
          hourly_rate: 120,
          gst_enabled: true,
          payment_terms: 'Payment due within 7 days of job completion.',
          bank_name: 'Commonwealth Bank',
          bsb: '123456',
          account_number: '12345678',
          account_name: userData.businessName
        });

      if (profileError) {
        console.error(`❌ Failed to create business profile for ${userData.email}:`, profileError);
        continue;
      }

      console.log(`✅ Created business profile for ${userData.userName}`);

      createdUsers.push({
        ...userData,
        userId,
        authData
      });

    } catch (error) {
      console.error(`❌ Unexpected error creating user ${userData.email}:`, error);
    }
  }

  return createdUsers;
}

async function createClientsForUser(userId, trade) {
  console.log(`\n👥 Creating clients for ${trade}...`);
  
  const clientsData = {
    electrician: [
      { name: 'John Smith', email: 'john.smith@email.com', phone: '+61412345001' },
      { name: 'Toyota Service Centre', email: 'service@toyota.com.au', phone: '+61387654321' },
      { name: 'Lisa Wilson', email: 'lisa.wilson@email.com', phone: '+61498765001' }
    ],
    plumber: [
      { name: 'Robert Davis', email: 'robert.davis@email.com', phone: '+61412345002' },
      { name: 'Melbourne Property Group', email: 'admin@melbproperty.com.au', phone: '+61387654322' },
      { name: 'Emma Johnson', email: 'emma.johnson@email.com', phone: '+61498765002' }
    ],
    painter: [
      { name: 'Michael Brown', email: 'michael.brown@email.com', phone: '+61412345003' },
      { name: 'Sunshine Apartments', email: 'manager@sunshineapts.com.au', phone: '+61387654323' },
      { name: 'Jennifer Lee', email: 'jennifer.lee@email.com', phone: '+61498765003' }
    ]
  };

  const clients = clientsData[trade] || [];
  const createdClients = [];

  for (const clientData of clients) {
    try {
      const { data, error } = await supabase
        .from('clients')
        .insert({
          user_id: userId,
          name: clientData.name,
          email: clientData.email,
          phone: clientData.phone
        })
        .select()
        .single();

      if (error) {
        console.error(`❌ Failed to create client ${clientData.name}:`, error);
        continue;
      }

      console.log(`✅ Created client: ${clientData.name}`);
      createdClients.push(data);
    } catch (error) {
      console.error(`❌ Unexpected error creating client ${clientData.name}:`, error);
    }
  }

  return createdClients;
}

async function createQuotesForUser(userId, trade, clients) {
  console.log(`\n📋 Creating quotes for ${trade}...`);
  
  const quotesData = {
    electrician: [
      {
        job_title: 'Dual Battery System Installation',
        description: 'Install dual battery system with 120A isolator, Anderson plugs, and wiring for 4WD touring setup.',
        items: [
          { name: 'Dual Battery Kit', type: 'materials', quantity: 1, unit_price: 450 },
          { name: 'Installation Labour', type: 'labour', quantity: 4, unit_price: 120 },
          { name: 'Wiring & Accessories', type: 'materials', quantity: 1, unit_price: 180 },
          { name: 'Service Call-Out', type: 'travel', quantity: 1, unit_price: 65 }
        ],
        status: 'Draft'
      },
      {
        job_title: 'Workshop Electrical Upgrade',
        description: 'Upgrade workshop electrical system with new switchboard, 3-phase power, and LED lighting.',
        items: [
          { name: 'Switchboard Upgrade', type: 'materials', quantity: 1, unit_price: 800 },
          { name: 'Electrical Installation', type: 'labour', quantity: 12, unit_price: 120 },
          { name: 'LED Light Fittings', type: 'materials', quantity: 8, unit_price: 45 },
          { name: 'Compliance Testing', type: 'other', quantity: 1, unit_price: 200 }
        ],
        status: 'Sent'
      },
      {
        job_title: 'Air Conditioning Installation',
        description: 'Install reverse cycle air conditioning unit in main workshop area.',
        items: [
          { name: 'Air Con Unit', type: 'materials', quantity: 1, unit_price: 950 },
          { name: 'Installation Labour', type: 'labour', quantity: 3, unit_price: 120 },
          { name: 'Electrical Connection', type: 'labour', quantity: 1, unit_price: 120 },
          { name: 'Service Call-Out', type: 'travel', quantity: 1, unit_price: 65 }
        ],
        status: 'Approved'
      }
    ],
    plumber: [
      {
        job_title: 'Hot Water System Replacement',
        description: 'Replace old electric hot water system with new 315L Rheem electric unit.',
        items: [
          { name: 'Rheem 315L Electric HWS', type: 'materials', quantity: 1, unit_price: 1200 },
          { name: 'Installation Labour', type: 'labour', quantity: 4, unit_price: 95 },
          { name: 'Plumbing Fittings', type: 'materials', quantity: 1, unit_price: 150 },
          { name: 'Service Call-Out', type: 'travel', quantity: 1, unit_price: 80 }
        ],
        status: 'Draft'
      },
      {
        job_title: 'Bathroom Renovation Plumbing',
        description: 'Complete bathroom renovation including new vanity, toilet, and shower installation.',
        items: [
          { name: 'Bathroom Fixtures', type: 'materials', quantity: 1, unit_price: 800 },
          { name: 'Plumbing Labour', type: 'labour', quantity: 12, unit_price: 95 },
          { name: 'Waterproofing', type: 'materials', quantity: 1, unit_price: 300 },
          { name: 'Compliance Certificate', type: 'other', quantity: 1, unit_price: 150 }
        ],
        status: 'Sent'
      },
      {
        job_title: 'Kitchen Tap Replacement',
        description: 'Replace kitchen mixer tap with new Methven model.',
        items: [
          { name: 'Methven Kitchen Mixer', type: 'materials', quantity: 1, unit_price: 180 },
          { name: 'Installation Labour', type: 'labour', quantity: 1, unit_price: 95 },
          { name: 'Service Call-Out', type: 'travel', quantity: 1, unit_price: 80 }
        ],
        status: 'Draft'
      }
    ],
    painter: [
      {
        job_title: 'Exterior House Painting',
        description: 'Complete exterior house painting including preparation, primer, and two coats of premium paint.',
        items: [
          { name: 'Premium Exterior Paint', type: 'materials', quantity: 25, unit_price: 85 },
          { name: 'Painting Labour', type: 'labour', quantity: 32, unit_price: 65 },
          { name: 'Surface Preparation', type: 'labour', quantity: 8, unit_price: 65 },
          { name: 'Equipment & Supplies', type: 'materials', quantity: 1, unit_price: 200 }
        ],
        status: 'Draft'
      },
      {
        job_title: 'Apartment Interior Touch-ups',
        description: 'Interior painting touch-ups for apartment including walls, ceilings, and trim.',
        items: [
          { name: 'Interior Paint', type: 'materials', quantity: 8, unit_price: 75 },
          { name: 'Painting Labour', type: 'labour', quantity: 16, unit_price: 65 },
          { name: 'Preparation Work', type: 'labour', quantity: 4, unit_price: 65 },
          { name: 'Travel & Setup', type: 'travel', quantity: 1, unit_price: 120 }
        ],
        status: 'Sent'
      },
      {
        job_title: 'Feature Wall Installation',
        description: 'Create decorative feature wall with textured paint finish.',
        items: [
          { name: 'Specialty Paint & Texture', type: 'materials', quantity: 1, unit_price: 180 },
          { name: 'Artistic Labour', type: 'labour', quantity: 4, unit_price: 75 },
          { name: 'Service Call-Out', type: 'travel', quantity: 1, unit_price: 80 }
        ],
        status: 'Draft'
      }
    ]
  };

  const quotes = quotesData[trade] || [];
  const createdQuotes = [];

  for (let i = 0; i < quotes.length; i++) {
    const quoteData = quotes[i];
    const client = clients[i % clients.length]; // Cycle through clients

    try {
      // Calculate totals
      const subtotal = quoteData.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
      const gst_amount = subtotal * 0.1;
      const total = subtotal + gst_amount;

      // Create quote
      const { data: quote, error: quoteError } = await supabase
        .from('quotes')
        .insert({
          user_id: userId,
          client_id: client.id,
          job_title: quoteData.job_title,
          description: quoteData.description,
          status: quoteData.status,
          subtotal,
          gst_amount,
          total
        })
        .select()
        .single();

      if (quoteError) {
        console.error(`❌ Failed to create quote ${quoteData.job_title}:`, quoteError);
        continue;
      }

      console.log(`✅ Created quote: ${quoteData.job_title}`);

      // Create quote items
      const quoteItems = quoteData.items.map(item => ({
        quote_id: quote.id,
        name: item.name,
        type: item.type,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total: item.quantity * item.unit_price
      }));

      const { error: itemsError } = await supabase
        .from('quote_items')
        .insert(quoteItems);

      if (itemsError) {
        console.error(`❌ Failed to create quote items for ${quoteData.job_title}:`, itemsError);
        continue;
      }

      console.log(`✅ Created ${quoteItems.length} quote items`);
      createdQuotes.push(quote);

    } catch (error) {
      console.error(`❌ Unexpected error creating quote ${quoteData.job_title}:`, error);
    }
  }

  return createdQuotes;
}

async function createInvoicesForUser(userId, quotes) {
  console.log(`\n🧾 Creating invoices...`);
  
  // Create invoice for the first approved/sent quote
  const invoiceQuote = quotes.find(q => q.status === 'Sent' || q.status === 'Approved');
  
  if (!invoiceQuote) {
    console.log('⚠️ No suitable quote found for invoice creation');
    return [];
  }

  try {
    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7);

    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        quote_id: invoiceQuote.id,
        invoice_number: invoiceNumber,
        total: invoiceQuote.total,
        due_date: dueDate.toISOString().split('T')[0],
        status: 'Unpaid'
      })
      .select()
      .single();

    if (invoiceError) {
      console.error(`❌ Failed to create invoice:`, invoiceError);
      return [];
    }

    console.log(`✅ Created invoice: ${invoiceNumber}`);
    return [invoice];

  } catch (error) {
    console.error(`❌ Unexpected error creating invoice:`, error);
    return [];
  }
}

async function main() {
  try {
    console.log('🎯 JobQuote Test User Creation Script');
    console.log('=====================================');

    // Create test users
    const users = await createTestUsers();
    
    if (users.length === 0) {
      console.log('❌ No users were created successfully');
      return;
    }

    // Create data for each user
    for (const user of users) {
      console.log(`\n🔧 Setting up data for ${user.userName} (${user.trade})`);
      
      // Create clients
      const clients = await createClientsForUser(user.userId, user.trade);
      
      if (clients.length === 0) {
        console.log(`⚠️ No clients created for ${user.userName}`);
        continue;
      }

      // Create quotes
      const quotes = await createQuotesForUser(user.userId, user.trade, clients);
      
      if (quotes.length === 0) {
        console.log(`⚠️ No quotes created for ${user.userName}`);
        continue;
      }

      // Create invoices
      const invoices = await createInvoicesForUser(user.userId, quotes);
      
      console.log(`✅ Setup complete for ${user.userName}:`);
      console.log(`   - ${clients.length} clients`);
      console.log(`   - ${quotes.length} quotes`);
      console.log(`   - ${invoices.length} invoices`);
    }

    console.log('\n🎉 Test user creation completed!');
    console.log('\n📧 Test User Credentials:');
    console.log('========================');
    users.forEach(user => {
      console.log(`${user.trade.toUpperCase()}: ${user.email} / Test1234!`);
    });

  } catch (error) {
    console.error('❌ Script failed:', error);
  }
}

// Run the script
main();