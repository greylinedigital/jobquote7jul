# 🧪 Test Users for JobQuote App

## Real Test User Credentials

These are actual Supabase Auth users created with real user IDs and proper foreign key relationships:

### 1. 🔌 **Electrician - Mike Johnson**
- **Email**: `test.electrician@jobquote.app`
- **Password**: `Test1234!`
- **Business**: Custom Automotive Electrical & Air Conditioning
- **Trade**: Automotive Electrical

**Test Data Includes:**
- ✅ 3 Quotes: Dual Battery System ($1,295), Workshop Upgrade ($2,730), Air Con Install ($1,365)
- ✅ 1 Invoice: Workshop Upgrade (from sent quote)
- ✅ 3 Clients: John Smith, Toyota Service Centre, Lisa Wilson

### 2. 🔧 **Plumber - Sarah Thompson**
- **Email**: `test.plumber@jobquote.app`
- **Password**: `Test1234!`
- **Business**: Reliable Plumbing Solutions
- **Trade**: Plumbing

**Test Data Includes:**
- ✅ 3 Quotes: Hot Water System ($1,815), Bathroom Reno ($2,275), Kitchen Tap ($390.50)
- ✅ 1 Invoice: Bathroom Renovation (from sent quote)
- ✅ 3 Clients: Robert Davis, Melbourne Property Group, Emma Johnson

### 3. 🎨 **Painter - David Chen**
- **Email**: `test.painter@jobquote.app`
- **Password**: `Test1234!`
- **Business**: Premium Painting Services
- **Trade**: Painting

**Test Data Includes:**
- ✅ 3 Quotes: Exterior House ($4,675), Apartment Touch-ups ($1,980), Feature Wall ($368.50)
- ✅ 1 Invoice: Apartment Touch-ups (from sent quote)
- ✅ 3 Clients: Michael Brown, Sunshine Apartments, Jennifer Lee

## 🔧 How to Create Test Users

### Option 1: Run the Script (Recommended)
```bash
npm run create-test-users
```

### Option 2: Manual Creation
1. Register each user through the app's normal registration flow
2. Complete business profile setup
3. The script will handle all the data creation

## ✅ What Gets Created

### For Each User:
- ✅ **Real Supabase Auth User** with confirmed email
- ✅ **Business Profile** with complete details (ABN, bank info, etc.)
- ✅ **3 Clients** with realistic contact information
- ✅ **3 Quotes** with different statuses (Draft, Sent, Approved)
- ✅ **Quote Items** with proper pricing and categories
- ✅ **1 Invoice** generated from a sent quote
- ✅ **Proper Foreign Keys** linking all data correctly

### Data Features:
- ✅ **Realistic Pricing** based on Australian trade rates
- ✅ **Proper GST Calculations** (10% Australian GST)
- ✅ **Trade-Specific Items** (electrical components, plumbing fixtures, paint supplies)
- ✅ **Professional Descriptions** for quotes and services
- ✅ **Complete Business Details** including ABN and bank information

## 🧪 Testing Scenarios

### Authentication & Navigation
1. Login with any test user credentials
2. Navigate through all app sections
3. Verify data loads correctly without crashes

### Quote Management
1. View existing quotes in dashboard
2. Open quote preview for each quote
3. Edit quote details and save changes
4. Send quotes via email (test with your own email)
5. Check quote status updates

### Invoice Management
1. View existing invoices
2. Create new invoices from approved quotes
3. Send invoice emails
4. Mark invoices as paid
5. Track payment status

### Client Management
1. View existing clients
2. Add new clients
3. Create quotes for existing clients
4. Edit client information
5. Delete clients (with proper warnings)

## 🚀 Quick Test Flow

1. **Login** as `test.electrician@jobquote.app` / `Test1234!`
2. **Dashboard** - See 3 existing quotes and usage stats
3. **Quote Preview** - Open "Workshop Electrical Upgrade" quote
4. **Send Email** - Test email delivery (use your own email address)
5. **Create Invoice** - Convert the approved quote to invoice
6. **Client Management** - View Toyota Service Centre and other clients
7. **Settings** - Check Mike's complete business profile

## 🔐 Security Features

- ✅ **Row Level Security (RLS)** - Each user can only see their own data
- ✅ **Proper Authentication** - Real Supabase Auth integration
- ✅ **Foreign Key Constraints** - Data integrity maintained
- ✅ **Email Confirmation** - Users are auto-confirmed for testing

## 📊 Realistic Test Data

### Quote Pricing by Trade:
- **Electrical**: $300 - $3,000 (automotive, residential, commercial)
- **Plumbing**: $300 - $2,500 (repairs, installations, renovations)  
- **Painting**: $350 - $5,000 (interior, exterior, commercial)

### Business Details:
- Australian ABNs (11 digits)
- Australian phone numbers (+61 format)
- Commonwealth Bank details
- Professional business names
- Realistic hourly rates ($65-$120/hour)

All test data is production-ready and demonstrates the full capabilities of your JobQuote app! 🎉