# Payment API Setup Guide

## 🔑 Getting Real API Keys

### 1. PayFast (Card Payments)
**Website**: https://www.payfast.co.za

**Steps**:
1. Register for PayFast merchant account
2. Complete business verification
3. Get your credentials from merchant dashboard:
   - Merchant ID
   - Merchant Key  
   - Passphrase (optional but recommended)

**Cost**: 2.9% + R2.00 per transaction

### 2. SnapScan (QR Code Payments)
**Website**: https://www.snapscan.co.za

**Steps**:
1. Contact SnapScan sales team
2. Complete merchant application
3. Get API credentials:
   - API Key
   - Merchant ID

**Cost**: 2.5% per transaction

### 3. MTN MoMo (Mobile Money)
**Website**: https://momodeveloper.mtn.com

**Steps**:
1. Register on MTN MoMo Developer Portal
2. Create application
3. Get sandbox credentials first
4. Apply for production access
5. Get credentials:
   - API Key
   - User ID
   - Subscription Key

**Cost**: Varies by country/volume

### 4. Vodacom M-Pesa
**Website**: https://developer.vodacom.co.za

**Steps**:
1. Register for Vodacom Developer Portal
2. Apply for M-Pesa API access
3. Complete business verification
4. Get credentials:
   - API Key
   - Public Key
   - Service Provider Code

**Cost**: Contact Vodacom for pricing

## 🛠️ Configuration Setup

### 1. Create .env File
```bash
cp src/backend/.env.example src/backend/.env
```

### 2. Add Your API Keys
Edit `src/backend/.env`:

```env
# PayFast Configuration
PAYFAST_MERCHANT_ID=your_actual_merchant_id
PAYFAST_MERCHANT_KEY=your_actual_merchant_key
PAYFAST_PASSPHRASE=your_actual_passphrase
PAYFAST_SANDBOX=false

# SnapScan Configuration
SNAPSCAN_API_KEY=your_actual_snapscan_key
SNAPSCAN_MERCHANT_ID=your_merchant_id

# MTN MoMo Configuration
MTN_MOMO_API_KEY=your_mtn_api_key
MTN_MOMO_USER_ID=your_user_id
MTN_MOMO_SUBSCRIPTION_KEY=your_subscription_key

# Environment
ENVIRONMENT=production
```

### 3. Security Notes
- **Never commit .env file** to version control
- **Keep API keys secure** and rotate regularly
- **Use sandbox first** for testing
- **Monitor transactions** for fraud

## 🧪 Testing Process

### 1. Sandbox Testing
- Start with sandbox/demo credentials
- Test all payment flows
- Verify webhooks and callbacks
- Check error handling

### 2. Production Testing
- Use small test amounts first
- Test with real payment methods
- Verify settlement and reconciliation
- Monitor for issues

## 📋 Compliance Requirements

### 1. PCI DSS (Card Payments)
- Use PayFast hosted payment pages
- Never store card details
- Implement secure transmission

### 2. Data Protection (POPIA)
- Secure customer data
- Implement privacy policies
- Handle data requests properly

### 3. Financial Regulations
- Register with relevant authorities
- Maintain transaction records
- Report suspicious activities

## 🚀 Going Live Checklist

- [ ] All API keys configured in .env
- [ ] Sandbox testing completed
- [ ] Production testing with small amounts
- [ ] Webhook endpoints secured
- [ ] Error handling implemented
- [ ] Transaction logging enabled
- [ ] Compliance requirements met
- [ ] Customer support process ready
- [ ] Monitoring and alerts configured

## 💡 Development vs Production

### Development Mode
- Uses demo/sandbox APIs
- Simulated mobile money payments
- No real money transactions
- Faster testing cycles

### Production Mode
- Real API endpoints
- Actual payment processing
- Real money transactions
- Full compliance required

## 🆘 Support Contacts

### PayFast
- Email: support@payfast.co.za
- Phone: +27 21 469 7990

### SnapScan
- Email: support@snapscan.co.za
- Phone: +27 21 300 3000

### MTN MoMo
- Developer Portal: momodeveloper.mtn.com
- Support: Through developer portal

### Vodacom
- Email: developersupport@vodacom.co.za
- Portal: developer.vodacom.co.za

## 📊 Cost Comparison

| Provider | Transaction Fee | Setup Cost | Monthly Fee |
|----------|----------------|------------|-------------|
| PayFast | 2.9% + R2.00 | Free | Free |
| SnapScan | 2.5% | Free | Free |
| MTN MoMo | Varies | Free | Varies |
| Vodacom | Contact for pricing | Free | Varies |

Choose based on your customer preferences and transaction volumes!