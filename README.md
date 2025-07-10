# JobQuote - Professional Quoting App

A production-ready mobile app for tradies to create professional quotes and invoices with AI assistance.

## 🚀 Features

- **AI-Powered Quote Generation**: Smart quote creation based on job descriptions
- **Professional Email Templates**: Beautiful, mobile-responsive quote and invoice emails
- **Client Management**: Organize and manage your client database
- **Business Profile**: Complete business setup with branding and bank details
- **Invoice Generation**: Convert quotes to professional invoices
- **Email Integration**: Send quotes and invoices via Resend API
- **Subscription Management**: Free tier with premium upgrade options
- **Multi-Trade Support**: Specialized templates for electrical, plumbing, automotive, and more

## 🔧 Tech Stack

- **Frontend**: React Native with Expo Router
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Email**: Resend API
- **AI**: OpenAI GPT for quote generation
- **Styling**: React Native StyleSheet
- **Icons**: Lucide React Native

## 📱 Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI
- Supabase account
- Resend account

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd jobquote-app
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env
```

Fill in your environment variables:
```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
RESEND_API_KEY=your_resend_api_key
```

4. Run the development server
```bash
npm start
```

## 🧪 Testing Credentials

For testing purposes, you can use these demo credentials:

**Demo Account 1:**
- Email: `demo@jobquote.app`
- Password: `demo123456`

**Demo Account 2:**
- Email: `tradie@example.com`
- Password: `tradie123`

## 📋 Production Checklist

### ✅ Authentication
- [x] User registration and login
- [x] Password reset functionality
- [x] Session management
- [x] Secure logout

### ✅ Quote Management
- [x] AI-powered quote generation
- [x] Quote editing and preview
- [x] Quote status tracking (Draft → Sent → Approved)
- [x] Quote item management

### ✅ Email System
- [x] Professional quote email templates
- [x] Invoice email templates
- [x] Resend API integration
- [x] Email status tracking

### ✅ Client Management
- [x] Client creation and editing
- [x] Client search and filtering
- [x] Client-quote associations

### ✅ Business Profile
- [x] Business information setup
- [x] Logo upload
- [x] Bank details configuration
- [x] Payment terms setup

### ✅ Invoice System
- [x] Convert quotes to invoices
- [x] Invoice editing
- [x] Payment tracking
- [x] Professional invoice emails

### ✅ Error Handling
- [x] Comprehensive error catching
- [x] User-friendly error messages
- [x] Network error handling
- [x] Authentication error handling

### ✅ Performance
- [x] Optimized database queries
- [x] Efficient state management
- [x] Fast navigation
- [x] Responsive UI

## 🔐 Security Features

- Row Level Security (RLS) on all database tables
- Secure authentication with Supabase Auth
- API key protection
- Input validation and sanitization
- HTTPS-only communication

## 📧 Email Templates

The app includes professional, mobile-responsive email templates for:

- **Quote Emails**: Clean layout with company branding, itemized breakdown, and call-to-action
- **Invoice Emails**: Professional invoicing with payment details and terms
- **Travel Fee Notifications**: Automatic detection and explanation of travel charges

## 🎨 Design System

- **Primary Color**: #F6A623 (Orange)
- **Typography**: System fonts with proper hierarchy
- **Spacing**: 8px grid system
- **Components**: Reusable, accessible components
- **Responsive**: Works on all screen sizes

## 🚀 Deployment

The app is configured for deployment on:

- **Mobile**: Expo Application Services (EAS)
- **Web**: Netlify/Vercel
- **API**: Supabase Edge Functions

## 📞 Support

For technical support or questions:
- Email: support@jobquote.app
- Documentation: [Link to docs]

## 🔄 Version History

- **v1.0.0**: Initial production release
  - Core quoting functionality
  - Email integration
  - Client management
  - Business profile setup

---

**Built with ❤️ for Australian tradies**