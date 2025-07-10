// Enhanced email sending API with proper error handling and logging
export async function POST(request: Request) {
  console.log('=== QUOTE EMAIL SENDING API ===');
  
  try {
    const requestBody = await request.text();
    let parsedBody;
    
    try {
      parsedBody = JSON.parse(requestBody);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid JSON in request body',
          details: parseError.message 
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const { quote } = parsedBody;
    
    // Validate required data
    if (!quote || !quote.clients || !quote.business_profile) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required quote data',
          details: 'Quote, client, and business profile information are required'
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('Processing quote email request:', {
      quoteId: quote.id,
      clientEmail: quote.clients.email,
      businessName: quote.business_profile.business_name
    });

    // Check for Resend API key
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      console.error('RESEND_API_KEY not found in environment variables');
      return new Response(
        JSON.stringify({ 
          error: 'Email service not configured',
          details: 'RESEND_API_KEY environment variable is missing'
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Generate email content
    const emailContent = generateQuoteEmailHTML(quote);
    const subject = `Quote for ${quote.job_title} - ${quote.business_profile.business_name || 'JobQuote'}`;

    // Send email using Resend
    const emailPayload = {
      from: `${quote.business_profile.business_name || 'JobQuote'} <quotes@jobquote.app>`,
      to: [quote.clients.email],
      subject: subject,
      html: emailContent,
    };

    console.log('Sending email via Resend...');

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailPayload),
    });

    const emailResult = await emailResponse.json();

    if (!emailResponse.ok) {
      console.error('Resend API error:', emailResult);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to send email',
          details: emailResult.message || 'Unknown email service error'
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('Email sent successfully:', emailResult.id);

    // Log the email send event (optional)
    try {
      // Import Supabase client
      const { createClient } = await import('@supabase/supabase-js');
      
      const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://pofgpoktfwwrpkgzwuwa.supabase.co';
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvZmdwb2t0Znd3cnBrZ3p3dXdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3NDI0OTgsImV4cCI6MjA2NTMxODQ5OH0.Exfvy_9M-h5W-4QEKZvS3m4ikrbPG3ms-NtAQQbSDs4';
      
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      await supabase
        .from('email_logs')
        .insert({
          quote_id: quote.id,
          recipient_email: quote.clients.email,
          email_type: 'quote',
          resend_id: emailResult.id,
          sent_at: new Date().toISOString(),
          status: 'sent'
        });
    } catch (logError) {
      console.warn('Failed to log email send event:', logError);
      // Don't fail the request if logging fails
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        emailId: emailResult.id,
        message: `Quote sent successfully to ${quote.clients.email}`,
        debug: {
          emailId: emailResult.id,
          clientEmail: quote.clients.email,
          businessName: quote.business_profile.business_name,
          quoteTotal: quote.total,
          itemCount: quote.quote_items?.length || 0
        }
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('=== QUOTE EMAIL SENDING ERROR ===');
    console.error('Error details:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

function generateQuoteEmailHTML(quote: any): string {
  const client = quote.clients;
  const items = quote.quote_items || [];
  const businessProfile = quote.business_profile || {};

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const businessName = businessProfile.business_name || 'JobQuote Professional Services';
  const businessEmail = businessProfile.email || 'hello@jobquote.app';
  const businessPhone = businessProfile.phone || '';

  // Calculate totals
  const subtotal = quote.subtotal || 0;
  const gstAmount = quote.gst_amount || 0;
  const total = quote.total || 0;

  // Check for travel fees
  const hasTravelFee = items.some(item => 
    item.type?.toLowerCase().includes('travel') || 
    item.name?.toLowerCase().includes('travel') ||
    item.name?.toLowerCase().includes('call-out') ||
    item.name?.toLowerCase().includes('service call')
  );

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Quote from ${businessName}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f8f9fa;
        }
        
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .header {
            background: linear-gradient(135deg, #F6A623 0%, #E8941A 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 8px;
        }
        
        .header p {
            font-size: 16px;
            opacity: 0.9;
        }
        
        .content {
            padding: 30px;
        }
        
        .quote-info {
            background-color: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 30px;
            border-left: 4px solid #F6A623;
        }
        
        .quote-info h2 {
            color: #F6A623;
            font-size: 20px;
            margin-bottom: 15px;
        }
        
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
        }
        
        .info-item {
            display: flex;
            flex-direction: column;
        }
        
        .info-label {
            font-size: 12px;
            color: #666;
            text-transform: uppercase;
            font-weight: 600;
            margin-bottom: 4px;
        }
        
        .info-value {
            font-size: 16px;
            color: #333;
            font-weight: 500;
        }
        
        .section {
            margin-bottom: 30px;
        }
        
        .section h3 {
            color: #333;
            font-size: 18px;
            margin-bottom: 15px;
            padding-bottom: 8px;
            border-bottom: 2px solid #F6A623;
        }
        
        .description {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            font-size: 16px;
            line-height: 1.6;
            color: #555;
        }
        
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            background-color: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .items-table th {
            background-color: #F6A623;
            color: white;
            padding: 15px 12px;
            text-align: left;
            font-weight: 600;
            font-size: 14px;
        }
        
        .items-table td {
            padding: 15px 12px;
            border-bottom: 1px solid #e9ecef;
            font-size: 14px;
        }
        
        .items-table tr:last-child td {
            border-bottom: none;
        }
        
        .item-type {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            margin-top: 4px;
        }
        
        .type-labour { background-color: #e3f2fd; color: #1976d2; }
        .type-materials { background-color: #e8f5e8; color: #388e3c; }
        .type-travel { background-color: #fff3e0; color: #f57c00; }
        .type-other { background-color: #f3e5f5; color: #7b1fa2; }
        
        .totals {
            background-color: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            margin-top: 20px;
        }
        
        .total-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 0;
            font-size: 16px;
        }
        
        .total-row.final {
            border-top: 2px solid #F6A623;
            margin-top: 10px;
            padding-top: 15px;
            font-weight: 700;
            font-size: 20px;
            color: #F6A623;
        }
        
        .travel-notice {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
            color: #856404;
        }
        
        .travel-notice strong {
            color: #533f03;
        }
        
        .footer {
            background-color: #f8f9fa;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e9ecef;
        }
        
        .business-info {
            margin-bottom: 20px;
        }
        
        .business-name {
            font-size: 20px;
            font-weight: 700;
            color: #F6A623;
            margin-bottom: 8px;
        }
        
        .contact-info {
            color: #666;
            font-size: 14px;
            line-height: 1.5;
        }
        
        .cta-section {
            background: linear-gradient(135deg, #F6A623 0%, #E8941A 100%);
            color: white;
            padding: 25px;
            border-radius: 8px;
            text-align: center;
            margin: 20px 0;
        }
        
        .cta-section h4 {
            font-size: 18px;
            margin-bottom: 10px;
        }
        
        .cta-section p {
            opacity: 0.9;
            margin-bottom: 15px;
        }
        
        .cta-button {
            display: inline-block;
            background-color: white;
            color: #F6A623;
            padding: 12px 24px;
            border-radius: 6px;
            text-decoration: none;
            font-weight: 600;
            font-size: 16px;
        }
        
        .disclaimer {
            font-size: 12px;
            color: #999;
            margin-top: 20px;
            line-height: 1.4;
        }
        
        @media (max-width: 600px) {
            .container {
                margin: 0;
                box-shadow: none;
            }
            
            .header, .content, .footer {
                padding: 20px;
            }
            
            .info-grid {
                grid-template-columns: 1fr;
            }
            
            .items-table th,
            .items-table td {
                padding: 10px 8px;
                font-size: 13px;
            }
            
            .total-row {
                font-size: 14px;
            }
            
            .total-row.final {
                font-size: 18px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Professional Quote</h1>
            <p>From ${businessName}</p>
        </div>
        
        <div class="content">
            <div class="quote-info">
                <h2>${quote.job_title}</h2>
                <div class="info-grid">
                    <div class="info-item">
                        <span class="info-label">Quote Number</span>
                        <span class="info-value">${quote.id.slice(-6).toUpperCase()}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Date</span>
                        <span class="info-value">${formatDate(quote.created_at)}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Client</span>
                        <span class="info-value">${client.name}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Valid Until</span>
                        <span class="info-value">${formatDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString())}</span>
                    </div>
                </div>
            </div>
            
            <div class="section">
                <h3>Job Description</h3>
                <div class="description">
                    ${quote.description || 'Professional trade service as discussed.'}
                </div>
            </div>
            
            <div class="section">
                <h3>Quote Breakdown</h3>
                
                <table class="items-table">
                    <thead>
                        <tr>
                            <th>Description</th>
                            <th style="text-align: center;">Qty</th>
                            <th style="text-align: right;">Rate</th>
                            <th style="text-align: right;">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${items.map(item => `
                        <tr>
                            <td>
                                <strong>${item.name}</strong>
                                <div class="item-type type-${(item.type || 'other').toLowerCase()}">${item.type || 'Other'}</div>
                            </td>
                            <td style="text-align: center;">${item.quantity || item.qty || 1}</td>
                            <td style="text-align: right;">${formatCurrency(item.unit_price || item.cost || 0)}</td>
                            <td style="text-align: right;"><strong>${formatCurrency(item.total || ((item.unit_price || item.cost || 0) * (item.quantity || item.qty || 1)))}</strong></td>
                        </tr>
                        `).join('')}
                    </tbody>
                </table>
                
                ${hasTravelFee ? `
                <div class="travel-notice">
                    <strong>Travel Fee Applied:</strong> A service call-out or travel fee has been included to cover transportation costs to your location.
                </div>
                ` : ''}
                
                <div class="totals">
                    <div class="total-row">
                        <span>Subtotal:</span>
                        <span>${formatCurrency(subtotal)}</span>
                    </div>
                    <div class="total-row">
                        <span>GST (10%):</span>
                        <span>${formatCurrency(gstAmount)}</span>
                    </div>
                    <div class="total-row final">
                        <span>Total Amount:</span>
                        <span>${formatCurrency(total)}</span>
                    </div>
                </div>
            </div>
            
            <div class="cta-section">
                <h4>Ready to Get Started?</h4>
                <p>This quote is valid for 30 days. Contact us to schedule your work or if you have any questions.</p>
                <a href="mailto:${businessEmail}?subject=Re: Quote ${quote.id.slice(-6).toUpperCase()}" class="cta-button">Accept Quote</a>
            </div>
        </div>
        
        <div class="footer">
            <div class="business-info">
                <div class="business-name">${businessName}</div>
                <div class="contact-info">
                    ${businessEmail ? `Email: ${businessEmail}<br>` : ''}
                    ${businessPhone ? `Phone: ${businessPhone}<br>` : ''}
                    ${businessProfile.abn ? `ABN: ${businessProfile.abn}` : ''}
                </div>
            </div>
            
            <div class="disclaimer">
                This quote was generated by JobQuote. All work is completed to Australian trade standards with quality materials and professional workmanship. 
                ${businessProfile.payment_terms ? businessProfile.payment_terms : ''}
            </div>
        </div>
    </div>
</body>
</html>
  `;
}