/*
  # Create Test Users and Sample Data

  1. Test Users
    - Electrician: Custom Automotive Electrical & Air Conditioning
    - Plumber: Reliable Plumbing Solutions
    - Painter: Premium Painting Services

  2. Sample Data
    - Business profiles for each user
    - Clients for each business
    - Realistic quotes with proper items
    - Invoices converted from quotes

  3. Security
    - All data follows RLS policies
    - Realistic Australian business data
*/

-- Create test users in auth.users (these would normally be created through Supabase Auth)
-- Note: In production, users are created through the auth system, but for testing we'll create the profiles directly

-- Test User 1: Electrician
INSERT INTO business_profiles (
  id,
  user_name,
  business_name,
  abn,
  phone,
  email,
  country,
  payment_terms,
  quote_footer_notes,
  bank_name,
  bsb,
  account_number,
  account_name,
  hourly_rate,
  gst_enabled,
  is_premium,
  subscription_status
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Mike Johnson',
  'Custom Automotive Electrical & Air Conditioning',
  '12345678901',
  '+61435097261',
  'mike@caeelectrical.com.au',
  'Australia',
  'Payment due within 7 days of job completion. Bank transfer preferred.',
  'All work completed to Australian electrical standards with 12-month warranty on parts and labour.',
  'Commonwealth Bank',
  '123456',
  '12345678',
  'Custom Automotive Electrical Pty Ltd',
  125.00,
  true,
  true,
  'active'
);

-- Test User 2: Plumber
INSERT INTO business_profiles (
  id,
  user_name,
  business_name,
  abn,
  phone,
  email,
  country,
  payment_terms,
  quote_footer_notes,
  bank_name,
  bsb,
  account_number,
  account_name,
  hourly_rate,
  gst_enabled,
  is_premium,
  subscription_status
) VALUES (
  '22222222-2222-2222-2222-222222222222',
  'Sarah Thompson',
  'Reliable Plumbing Solutions',
  '23456789012',
  '+61412345678',
  'sarah@reliableplumbing.com.au',
  'Australia',
  'Payment due within 14 days. Cash, card, or bank transfer accepted.',
  'Licensed plumber with 15+ years experience. All work guaranteed.',
  'Westpac Banking Corporation',
  '234567',
  '23456789',
  'Reliable Plumbing Solutions Pty Ltd',
  110.00,
  true,
  false,
  'inactive'
);

-- Test User 3: Painter
INSERT INTO business_profiles (
  id,
  user_name,
  business_name,
  abn,
  phone,
  email,
  country,
  payment_terms,
  quote_footer_notes,
  bank_name,
  bsb,
  account_number,
  account_name,
  hourly_rate,
  gst_enabled,
  is_premium,
  subscription_status
) VALUES (
  '33333333-3333-3333-3333-333333333333',
  'David Chen',
  'Premium Painting Services',
  '34567890123',
  '+61498765432',
  'david@premiumpaint.com.au',
  'Australia',
  'Payment due on completion. 50% deposit required for jobs over $2000.',
  'Professional painting with premium Dulux paints. 5-year warranty on exterior work.',
  'ANZ Bank',
  '345678',
  '34567890',
  'Premium Painting Services Pty Ltd',
  95.00,
  true,
  true,
  'active'
);

-- Create test clients for each business

-- Clients for Electrician (Mike)
INSERT INTO clients (id, user_id, name, email, phone, updated_at) VALUES
('c1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'John Smith', 'john.smith@email.com', '+61412345001', now()),
('c1111111-1111-1111-1111-111111111112', '11111111-1111-1111-1111-111111111111', 'Toyota Service Centre', 'service@toyotamelbourne.com.au', '+61398765432', now()),
('c1111111-1111-1111-1111-111111111113', '11111111-1111-1111-1111-111111111111', 'Lisa Wilson', 'lisa.wilson@gmail.com', '+61423456789', now());

-- Clients for Plumber (Sarah)
INSERT INTO clients (id, user_id, name, email, phone, updated_at) VALUES
('c2222222-2222-2222-2222-222222222221', '22222222-2222-2222-2222-222222222222', 'Robert Davis', 'robert.davis@outlook.com', '+61434567890', now()),
('c2222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'Melbourne Property Group', 'maintenance@melbproperty.com.au', '+61387654321', now()),
('c2222222-2222-2222-2222-222222222223', '22222222-2222-2222-2222-222222222222', 'Emma Johnson', 'emma.j@email.com', '+61445678901', now());

-- Clients for Painter (David)
INSERT INTO clients (id, user_id, name, email, phone, updated_at) VALUES
('c3333333-3333-3333-3333-333333333331', '33333333-3333-3333-3333-333333333333', 'Michael Brown', 'michael.brown@email.com', '+61456789012', now()),
('c3333333-3333-3333-3333-333333333332', '33333333-3333-3333-3333-333333333333', 'Sunshine Apartments', 'manager@sunshineapts.com.au', '+61376543210', now()),
('c3333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 'Jennifer Lee', 'jen.lee@gmail.com', '+61467890123', now());

-- Create realistic quotes for each user

-- Electrician Quotes (Mike)
INSERT INTO quotes (id, user_id, client_id, job_title, description, status, subtotal, gst_amount, total, created_at, updated_at) VALUES
('q1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'Dual Battery System Installation', 'Install complete dual battery system in Toyota Hilux including 100Ah AGM battery, DC-DC charger, Anderson plug, and wiring. System will allow running of camping equipment without draining starter battery.', 'sent', 1545.45, 154.55, 1700.00, now() - interval '3 days', now() - interval '2 days'),
('q1111111-1111-1111-1111-111111111112', '11111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111112', 'Workshop Electrical Upgrade', 'Upgrade workshop electrical system including new switchboard, 15A power points for vehicle hoists, LED lighting upgrade, and safety switch installation. All work to AS/NZS 3000 standards.', 'approved', 2727.27, 272.73, 3000.00, now() - interval '1 week', now() - interval '5 days'),
('q1111111-1111-1111-1111-111111111113', '11111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111113', 'Air Conditioning Installation', 'Supply and install Mitsubishi 2.5kW split system air conditioner in living room. Includes electrical connection, refrigerant piping, and commissioning.', 'draft', 1363.64, 136.36, 1500.00, now() - interval '1 day', now() - interval '1 day');

-- Plumber Quotes (Sarah)
INSERT INTO quotes (id, user_id, client_id, job_title, description, status, subtotal, gst_amount, total, created_at, updated_at) VALUES
('q2222222-2222-2222-2222-222222222221', '22222222-2222-2222-2222-222222222222', 'c2222222-2222-2222-2222-222222222221', 'Hot Water System Replacement', 'Remove old electric hot water system and install new Rheem 315L electric hot water system. Includes all plumbing connections, tempering valve, and electrical connection by licensed electrician.', 'sent', 1818.18, 181.82, 2000.00, now() - interval '4 days', now() - interval '3 days'),
('q2222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'c2222222-2222-2222-2222-222222222222', 'Bathroom Renovation Plumbing', 'Complete bathroom plumbing for renovation including new toilet suite, vanity basin, shower mixer, and all associated pipework. Includes waterproofing and compliance certification.', 'approved', 2272.73, 227.27, 2500.00, now() - interval '1 week', now() - interval '4 days'),
('q2222222-2222-2222-2222-222222222223', '22222222-2222-2222-2222-222222222222', 'c2222222-2222-2222-2222-222222222223', 'Kitchen Tap Replacement', 'Replace kitchen mixer tap with new Methven Culinary tap. Includes removal of old tap and installation with new flexible hoses.', 'draft', 272.73, 27.27, 300.00, now() - interval '2 hours', now() - interval '2 hours');

-- Painter Quotes (David)
INSERT INTO quotes (id, user_id, client_id, job_title, description, status, subtotal, gst_amount, total, created_at, updated_at) VALUES
('q3333333-3333-3333-3333-333333333331', '33333333-3333-3333-3333-333333333333', 'c3333333-3333-3333-3333-333333333331', 'Exterior House Painting', 'Complete exterior house painting including pressure washing, scraping, priming, and two coats of Dulux Weathershield. Includes all trim, gutters, and downpipes. 5-year warranty.', 'sent', 4545.45, 454.55, 5000.00, now() - interval '5 days', now() - interval '4 days'),
('q3333333-3333-3333-3333-333333333332', '33333333-3333-3333-3333-333333333333', 'c3333333-3333-3333-3333-333333333332', 'Apartment Complex Touch-ups', 'Touch-up painting for 12 apartments including patching, priming, and painting of walls and ceilings. Premium low-odour paint suitable for occupied premises.', 'approved', 1818.18, 181.82, 2000.00, now() - interval '1 week', now() - interval '3 days'),
('q3333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 'c3333333-3333-3333-3333-333333333333', 'Interior Feature Wall', 'Create feature wall in living room with premium Dulux paint. Includes surface preparation, primer, and two coats of feature colour with professional finish.', 'draft', 454.55, 45.45, 500.00, now() - interval '3 hours', now() - interval '3 hours');

-- Create quote items for each quote

-- Electrician Quote 1 Items (Dual Battery System)
INSERT INTO quote_items (quote_id, type, name, quantity, unit_price, total, created_at) VALUES
('q1111111-1111-1111-1111-111111111111', 'labour', 'Dual Battery System Installation', 8, 125.00, 1000.00, now()),
('q1111111-1111-1111-1111-111111111111', 'materials', '100Ah AGM Deep Cycle Battery', 1, 350.00, 350.00, now()),
('q1111111-1111-1111-1111-111111111111', 'materials', 'DC-DC Battery Charger 25A', 1, 180.00, 180.00, now()),
('q1111111-1111-1111-1111-111111111111', 'travel', 'Service Call-Out Fee', 1, 65.00, 65.00, now());

-- Electrician Quote 2 Items (Workshop Upgrade)
INSERT INTO quote_items (quote_id, type, name, quantity, unit_price, total, created_at) VALUES
('q1111111-1111-1111-1111-111111111112', 'labour', 'Electrical Installation Work', 16, 125.00, 2000.00, now()),
('q1111111-1111-1111-1111-111111111112', 'materials', 'Main Switchboard 12-Way', 1, 450.00, 450.00, now()),
('q1111111-1111-1111-1111-111111111112', 'materials', '15A Power Points (Industrial)', 4, 85.00, 340.00, now()),
('q1111111-1111-1111-1111-111111111112', 'materials', 'LED High Bay Lights 150W', 6, 120.00, 720.00, now()),
('q1111111-1111-1111-1111-111111111112', 'materials', 'Safety Switch & Circuit Breakers', 1, 180.00, 180.00, now()),
('q1111111-1111-1111-1111-111111111112', 'other', 'Electrical Compliance Certificate', 1, 150.00, 150.00, now());

-- Electrician Quote 3 Items (Air Con)
INSERT INTO quote_items (quote_id, type, name, quantity, unit_price, total, created_at) VALUES
('q1111111-1111-1111-1111-111111111113', 'labour', 'Air Conditioner Installation', 6, 125.00, 750.00, now()),
('q1111111-1111-1111-1111-111111111113', 'materials', 'Mitsubishi 2.5kW Split System', 1, 850.00, 850.00, now()),
('q1111111-1111-1111-1111-111111111113', 'travel', 'Service Call-Out Fee', 1, 65.00, 65.00, now());

-- Plumber Quote 1 Items (Hot Water)
INSERT INTO quote_items (quote_id, type, name, quantity, unit_price, total, created_at) VALUES
('q2222222-2222-2222-2222-222222222221', 'labour', 'Hot Water System Installation', 8, 110.00, 880.00, now()),
('q2222222-2222-2222-2222-222222222221', 'materials', 'Rheem 315L Electric Hot Water System', 1, 1200.00, 1200.00, now()),
('q2222222-2222-2222-2222-222222222221', 'materials', 'Tempering Valve & Fittings', 1, 180.00, 180.00, now()),
('q2222222-2222-2222-2222-222222222221', 'other', 'Old System Disposal', 1, 80.00, 80.00, now());

-- Plumber Quote 2 Items (Bathroom Reno)
INSERT INTO quote_items (quote_id, type, name, quantity, unit_price, total, created_at) VALUES
('q2222222-2222-2222-2222-222222222222', 'labour', 'Bathroom Plumbing Installation', 12, 110.00, 1320.00, now()),
('q2222222-2222-2222-2222-222222222222', 'materials', 'Toilet Suite - Caroma Profile Smart', 1, 450.00, 450.00, now()),
('q2222222-2222-2222-2222-222222222222', 'materials', 'Vanity Basin & Mixer', 1, 320.00, 320.00, now()),
('q2222222-2222-2222-2222-222222222222', 'materials', 'Shower Mixer & Rail', 1, 280.00, 280.00, now()),
('q2222222-2222-2222-2222-222222222222', 'materials', 'Pipework & Fittings', 1, 350.00, 350.00, now()),
('q2222222-2222-2222-2222-222222222222', 'other', 'Waterproofing Certification', 1, 150.00, 150.00, now());

-- Plumber Quote 3 Items (Kitchen Tap)
INSERT INTO quote_items (quote_id, type, name, quantity, unit_price, total, created_at) VALUES
('q2222222-2222-2222-2222-222222222223', 'labour', 'Kitchen Tap Replacement', 1.5, 110.00, 165.00, now()),
('q2222222-2222-2222-2222-222222222223', 'materials', 'Methven Culinary Kitchen Mixer', 1, 180.00, 180.00, now()),
('q2222222-2222-2222-2222-222222222223', 'materials', 'Flexible Hoses & Fittings', 1, 35.00, 35.00, now());

-- Painter Quote 1 Items (Exterior House)
INSERT INTO quote_items (quote_id, type, name, quantity, unit_price, total, created_at) VALUES
('q3333333-3333-3333-3333-333333333331', 'labour', 'Exterior House Painting', 32, 95.00, 3040.00, now()),
('q3333333-3333-3333-3333-333333333331', 'materials', 'Dulux Weathershield Paint', 25, 45.00, 1125.00, now()),
('q3333333-3333-3333-3333-333333333331', 'materials', 'Primer & Preparation Materials', 1, 280.00, 280.00, now()),
('q3333333-3333-3333-3333-333333333331', 'other', 'Pressure Washing & Setup', 1, 200.00, 200.00, now());

-- Painter Quote 2 Items (Apartment Touch-ups)
INSERT INTO quote_items (quote_id, type, name, quantity, unit_price, total, created_at) VALUES
('q3333333-3333-3333-3333-333333333332', 'labour', 'Touch-up Painting (12 Apartments)', 16, 95.00, 1520.00, now()),
('q3333333-3333-3333-3333-333333333332', 'materials', 'Low-Odour Interior Paint', 15, 38.00, 570.00, now()),
('q3333333-3333-3333-3333-333333333332', 'materials', 'Patching Compound & Primer', 1, 120.00, 120.00, now()),
('q3333333-3333-3333-3333-333333333332', 'travel', 'Site Access & Setup', 1, 80.00, 80.00, now());

-- Painter Quote 3 Items (Feature Wall)
INSERT INTO quote_items (quote_id, type, name, quantity, unit_price, total, created_at) VALUES
('q3333333-3333-3333-3333-333333333333', 'labour', 'Feature Wall Painting', 4, 95.00, 380.00, now()),
('q3333333-3333-3333-3333-333333333333', 'materials', 'Premium Dulux Feature Paint', 2, 55.00, 110.00, now()),
('q3333333-3333-3333-3333-333333333333', 'materials', 'Primer & Preparation', 1, 25.00, 25.00, now());

-- Create invoices for approved quotes

-- Invoice for Electrician's Workshop Upgrade (approved quote)
INSERT INTO invoices (id, quote_id, invoice_number, total, due_date, status, created_at, updated_at) VALUES
('i1111111-1111-1111-1111-111111111112', 'q1111111-1111-1111-1111-111111111112', 'INV-001234', 3000.00, (now() + interval '7 days')::date, 'Unpaid', now() - interval '4 days', now() - interval '4 days');

-- Invoice for Plumber's Bathroom Renovation (approved quote)
INSERT INTO invoices (id, quote_id, invoice_number, total, due_date, status, created_at, updated_at) VALUES
('i2222222-2222-2222-2222-222222222222', 'q2222222-2222-2222-2222-222222222222', 'INV-002345', 2500.00, (now() + interval '14 days')::date, 'Unpaid', now() - interval '3 days', now() - interval '3 days');

-- Invoice for Painter's Apartment Touch-ups (approved quote)
INSERT INTO invoices (id, quote_id, invoice_number, total, due_date, status, created_at, updated_at) VALUES
('i3333333-3333-3333-3333-333333333332', 'q3333333-3333-3333-3333-333333333332', 'INV-003456', 2000.00, (now() + interval '7 days')::date, 'Paid', now() - interval '2 days', now() - interval '1 day');

-- Create some email logs to show activity
INSERT INTO email_logs (quote_id, invoice_id, recipient_email, email_type, resend_id, sent_at, status, created_at) VALUES
('q1111111-1111-1111-1111-111111111111', null, 'john.smith@email.com', 'quote', 'resend_123abc', now() - interval '2 days', 'sent', now() - interval '2 days'),
('q2222222-2222-2222-2222-222222222221', null, 'robert.davis@outlook.com', 'quote', 'resend_456def', now() - interval '3 days', 'sent', now() - interval '3 days'),
('q3333333-3333-3333-3333-333333333331', null, 'michael.brown@email.com', 'quote', 'resend_789ghi', now() - interval '4 days', 'sent', now() - interval '4 days'),
(null, 'i3333333-3333-3333-3333-333333333332', 'manager@sunshineapts.com.au', 'invoice', 'resend_012jkl', now() - interval '1 day', 'sent', now() - interval '1 day');