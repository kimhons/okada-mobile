# African Mobile Money API Integration Cookbook

A comprehensive step-by-step guide for registering and obtaining developer API keys from major Mobile Money providers across Africa.

---

## Table of Contents

1. [Overview](#overview)
2. [Provider Comparison](#provider-comparison)
3. [MTN Mobile Money (MoMo)](#mtn-mobile-money-momo)
4. [Orange Money](#orange-money)
5. [M-Pesa (Safaricom - Kenya)](#m-pesa-safaricom---kenya)
6. [M-Pesa (Vodacom - Tanzania & Others)](#m-pesa-vodacom---tanzania--others)
7. [Airtel Money](#airtel-money)
8. [Wave Money](#wave-money)
9. [Payment Aggregators](#payment-aggregators)
10. [Recommended Strategy](#recommended-strategy)

---

## Overview

Mobile Money has become the dominant payment method across Africa, with over 600 million registered accounts. This cookbook provides practical guidance for integrating with the major providers to enable payments in your application.

### Key Considerations

Before choosing a provider, consider the following factors:

| Factor | Description |
|--------|-------------|
| **Geographic Coverage** | Which countries do you need to support? |
| **Integration Complexity** | Direct integration vs. aggregator |
| **Time to Market** | Sandbox access vs. production approval |
| **Transaction Fees** | Varies by provider and country |
| **Settlement Time** | How quickly funds are available |
| **Technical Support** | Quality of documentation and support |

---

## Provider Comparison

### Direct Providers vs. Aggregators

| Approach | Pros | Cons |
|----------|------|------|
| **Direct Integration** | Lower fees, direct relationship, full control | Multiple integrations needed, longer approval |
| **Aggregator** | Single integration, faster setup, wider coverage | Higher fees, dependency on third party |

### Coverage by Country

| Country | MTN | Orange | M-Pesa | Airtel | Wave | Flutterwave | Paystack |
|---------|-----|--------|--------|--------|------|-------------|----------|
| Nigeria | ✗ | ✗ | ✗ | ✓ | ✗ | ✓ | ✓ |
| Kenya | ✗ | ✗ | ✓ | ✓ | ✗ | ✓ | ✓ |
| Ghana | ✓ | ✗ | ✗ | ✓ | ✗ | ✓ | ✓ |
| Tanzania | ✗ | ✗ | ✓ | ✓ | ✗ | ✓ | ✗ |
| Uganda | ✓ | ✗ | ✗ | ✓ | ✓ | ✓ | ✗ |
| Cameroon | ✓ | ✓ | ✗ | ✗ | ✗ | ✓ | ✗ |
| Senegal | ✗ | ✓ | ✗ | ✗ | ✓ | ✓ | ✗ |
| Ivory Coast | ✓ | ✓ | ✗ | ✗ | ✓ | ✓ | ✗ |
| Rwanda | ✓ | ✗ | ✗ | ✓ | ✗ | ✓ | ✗ |
| Zambia | ✓ | ✗ | ✗ | ✓ | ✗ | ✓ | ✗ |
| South Africa | ✓ | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ |
| DRC | ✗ | ✓ | ✓ | ✓ | ✗ | ✓ | ✗ |
| Mali | ✗ | ✓ | ✗ | ✗ | ✓ | ✓ | ✗ |

---

## MTN Mobile Money (MoMo)

### Available Countries
Ghana, Uganda, Zambia, Cameroon, Benin, Ivory Coast, Liberia, Guinea, Congo, Rwanda, South Africa, Eswatini

### Developer Portal
**URL:** https://momodeveloper.mtn.com/

### Step 1: Create Developer Account

1. Navigate to https://momodeveloper.mtn.com/signup
2. Fill in the registration form with your email and password
3. Check your email for the activation link (expires in 24 hours)
4. Click the activation link to verify your account

### Step 2: Subscribe to Products

1. Log in to the developer portal
2. Navigate to the **Products** page
3. Subscribe to the products you need:
   - **Collection** - Receive payments from customers
   - **Disbursements** - Send money to customers
   - **Remittances** - Cross-border transfers
   - **Collection Widget** - Pre-built payment UI

4. After subscribing, you receive:
   - **Primary Key** - Main API access key
   - **Secondary Key** - Backup API access key

### Step 3: Generate API User and API Key (Sandbox)

The sandbox requires provisioning an API User and API Key using the Provisioning API.

**Create API User:**
```bash
curl -X POST "https://sandbox.momodeveloper.mtn.com/v1_0/apiuser" \
  -H "X-Reference-Id: YOUR-UUID-HERE" \
  -H "Ocp-Apim-Subscription-Key: YOUR-SUBSCRIPTION-KEY" \
  -H "Content-Type: application/json" \
  -d '{"providerCallbackHost": "your-callback-url.com"}'
```

**Create API Key:**
```bash
curl -X POST "https://sandbox.momodeveloper.mtn.com/v1_0/apiuser/YOUR-API-USER/apikey" \
  -H "Ocp-Apim-Subscription-Key: YOUR-SUBSCRIPTION-KEY"
```

### Step 4: Go Live (Production)

Production credentials are provisioned through the MTN Partner Portal, not the developer portal. Contact MTN directly or through their partner program for production access.

### API Endpoints

| Environment | Base URL |
|-------------|----------|
| Sandbox | https://sandbox.momodeveloper.mtn.com |
| Production | https://proxy.momoapi.mtn.com |

---

## Orange Money

### Available Countries
Mali, Cameroon, Ivory Coast, Senegal, Madagascar, Botswana, Guinea Conakry, Guinea Bissau, Sierra Leone, DRC, Central African Republic

### Developer Portal
**URL:** https://developer.orange.com/

### Step 1: Create Developer Account

1. Navigate to https://developer.orange.com/
2. Click "Log in / Register" in the top right
3. Create an Orange Developer account with:
   - Email address
   - Password
   - Company information

### Step 2: Subscribe to Orange Money API

1. Navigate to Products → Payment
2. Select "Orange Money Web Payment / M Payment"
3. Review the API documentation and terms
4. Click "Apply for Orange Money" or "Contact us"

### Step 3: Merchant Registration (Required)

Orange Money requires you to be a registered merchant:

1. Visit an Orange store in your country of business
2. Provide required documents:
   - Trade and Personal Property Credit Register
   - Business registration documents (per local legislation)
   - KYA (Know Your Agent) compliance documents
3. Sign up for Orange Money merchant service
4. Accept Web Payment / M Payment offer conditions

### Step 4: Integration

After merchant approval:

1. Receive API credentials from Orange
2. Integrate using the provided documentation
3. Test with sandbox environment
4. Go live after Orange verification

### Payment Flow

The Orange Money payment flow uses OTP (One-Time Password) validation:

1. Customer selects Orange Money on your website
2. Customer requests OTP via Orange Money USSD service
3. Customer enters OTP on payment screen
4. Payment is processed and confirmed

---

## M-Pesa (Safaricom - Kenya)

### Developer Portal
**URL:** https://developer.safaricom.co.ke/ (Daraja 3.0)

### Step 1: Create Developer Account

1. Navigate to https://developer.safaricom.co.ke/account/signup
2. Fill in the registration form:
   - First Name
   - Last Name
   - Email Address
   - Username
   - Phone Number (Kenya +254)
   - Password
3. Accept Terms and Conditions
4. Verify your email and phone number

### Step 2: Create Sandbox App

1. Log in to the Daraja portal
2. Navigate to Dashboard → My Apps
3. Click "Create New App"
4. Select the APIs you want to use:
   - M-Pesa Express (STK Push)
   - Customer To Business (C2B)
   - Business To Customer (B2C)
   - Transaction Status
   - Account Balance
   - Reversals
5. Save and receive your sandbox credentials:
   - Consumer Key
   - Consumer Secret

### Step 3: Test in Sandbox

**Get Access Token:**
```bash
curl -X GET "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials" \
  -H "Authorization: Basic BASE64(ConsumerKey:ConsumerSecret)"
```

**STK Push (M-Pesa Express):**
```bash
curl -X POST "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest" \
  -H "Authorization: Bearer ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "BusinessShortCode": "174379",
    "Password": "BASE64_ENCODED_PASSWORD",
    "Timestamp": "20231123123456",
    "TransactionType": "CustomerPayBillOnline",
    "Amount": "1",
    "PartyA": "254712345678",
    "PartyB": "174379",
    "PhoneNumber": "254712345678",
    "CallBackURL": "https://your-callback-url.com",
    "AccountReference": "Test",
    "TransactionDesc": "Test Payment"
  }'
```

### Step 4: Go Live (Production)

1. Complete sandbox testing successfully
2. Apply for production credentials via Safaricom Business Portal
3. Submit required documents:
   - Certificate of Incorporation / Business Registration
   - Copy of ID/Passport of directors
   - KRA PIN Certificate
4. Await approval (typically 3-5 business days)
5. Receive production credentials
6. Update API endpoints from sandbox to production

### API Endpoints

| Environment | Base URL |
|-------------|----------|
| Sandbox | https://sandbox.safaricom.co.ke |
| Production | https://api.safaricom.co.ke |

---

## M-Pesa (Vodacom - Tanzania & Others)

### Available Countries
Tanzania, DRC, Mozambique, Lesotho, Ghana, Egypt

### Developer Portal
**URL:** https://business.m-pesa.com/developers/

### Step 1: Create Developer Account

1. Navigate to https://business.m-pesa.com/developers/
2. Click "Sign Up"
3. Enter your email address
4. Verify email via activation link
5. Add phone number for final activation
6. Complete account setup

### Step 2: Access API Documentation

After activation, you have access to:
- API documentation
- Sandbox testing environment
- API Key and Public Key (in Account Profile)

### Step 3: Develop and Test

1. Download the library file (e.g., portal-sdk.jar for Java)
2. Configure your development environment with:
   - API Key
   - Public Key
3. Test in sandbox environment
4. Verify successful transactions

### Step 4: Go Live

1. Ensure successful test transactions in sandbox
2. Navigate to Account Profile
3. Click "Go Live!" button
4. Your account details and transaction reports are sent to Vodafone M-Pesa
5. Await review and approval
6. Receive production credentials

### Available APIs

| API | Description |
|-----|-------------|
| C2B | Customer to Business payments |
| Reversals | Reverse transactions |
| Transaction Status | Query transaction status |

---

## Airtel Money

### Available Countries
Uganda, Kenya, Tanzania, Malawi, Zambia, Rwanda, Nigeria, Niger, Chad, Gabon, Congo, DRC, Madagascar, Seychelles

### Developer Portal
**URL:** https://developers.airtel.africa/

### Step 1: Create Developer Account

1. Navigate to https://developers.airtel.africa/user/signup
2. Fill in the registration form:
   - First Name
   - Last Name
   - User Name
   - Email Id
   - Phone Number
   - Country (select from dropdown)
   - Password (min 12 chars, 1 special, 1 uppercase, 1 lowercase, 1 digit)
3. Complete captcha verification
4. Accept Terms of Use
5. Click "Sign Up"

### Step 2: Register Application

1. Log in to the developer portal
2. Navigate to "My Applications"
3. Click "Register Application"
4. Add the APIs you need:
   - Collection APIs
   - Remittance APIs
   - Disbursement APIs
5. Save your application

### Step 3: Test in Sandbox

- Read documentation and instructions carefully
- Submit API requests to get realistic responses
- Free sandbox testing available

### Step 4: Go Live

1. Comply with API requirements
2. Complete legal compliance documentation
3. Complete onboarding process
4. Await approval from Airtel
5. Go Live with production credentials

### API Products

| Product | Description |
|---------|-------------|
| Mobile Money Remittance | Transfer/receive funds in local currency |
| Selling Goods & Services | Collect payments from customers |
| Bulk Payments | Pay stakeholders in bulk |
| Generate Business Till | Accept payments on till |

---

## Wave Money

### Available Countries
Senegal, Ivory Coast, Mali, Burkina Faso, The Gambia, Guinea-Bissau, Uganda

### Developer Portal
**URL:** https://docs.wave.com/business

### Step 1: Get Wave Business Account

1. Sign up for a Wave Business Account at https://business.wave.com
2. Complete business verification
3. Activate your business wallet

### Step 2: Obtain API Keys

1. Log in to Wave Business Portal
2. Navigate to Developer's section in settings
3. Create new API key
4. Define which APIs the key has access to:
   - Balance & Reconciliation API
   - Checkout API
   - Payout API
   - Aggregated Merchants API
5. Copy the full key immediately (shown only once)

### Step 3: Integrate

**Authentication:**
```bash
curl -X POST "https://api.wave.com/v1/checkout/sessions" \
  -H "Authorization: Bearer wave_sn_prod_YhUNb9d...i4bA6" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": "1000",
    "currency": "XOF",
    "error_url": "https://example.com/error",
    "success_url": "https://example.com/success"
  }'
```

### Available APIs

| API | Description |
|-----|-------------|
| Checkout API | Receive payments from customers |
| Payout API | Send money to recipients |
| Balance API | Check wallet balance |
| Webhooks | Real-time notifications |

---

## Payment Aggregators

### Flutterwave

**Best For:** Multi-country coverage with single integration

**Developer Portal:** https://developer.flutterwave.com/

**Registration Steps:**

1. Navigate to https://onboarding.flutterwave.com/signup
2. Create sandbox account:
   - First name
   - Last name
   - Email address (requires verification)
   - Password
3. Access API keys in Dashboard → Settings → Developer

**Supported Mobile Money:**
- MTN Mobile Money (Cameroon, Côte d'Ivoire, Rwanda, Uganda, Zambia)
- Airtel Money (Uganda, Tanzania, Zambia, Malawi, Kenya, Rwanda)
- M-Pesa
- Orange Money
- Vodafone Cash

**Go-Live Requirements:**
- Business registration documents
- Director's ID
- Bank account details
- Verifiable website URL

---

### Paystack

**Best For:** Nigeria, Ghana, South Africa, Kenya

**Developer Portal:** https://paystack.com/docs/

**Registration Steps:**

1. Navigate to https://dashboard.paystack.com/signup
2. Create free account:
   - Email address
   - Password
   - Business name
   - Country
3. Receive test keys immediately
4. Access API keys in Settings → API Keys & Webhooks

**Supported Payment Methods:**
- Cards (Visa, Mastercard, Verve)
- Bank Transfers
- USSD
- Mobile Money (Ghana)
- QR Payments

**Go-Live Requirements:**
- Business registration certificate
- Director's ID
- Bank account details
- KRA PIN (Kenya only)

---

## Recommended Strategy

### For Cameroon-Focused Operations

Since your primary market is Cameroon, here's the recommended approach:

#### Phase 1: Immediate (Aggregator)

Use **Flutterwave** for quick market entry:
- Single integration covers MTN MoMo and Orange Money
- Sandbox available immediately
- Go-live in 1-2 weeks with proper documentation

#### Phase 2: Direct Integration (Cost Optimization)

After establishing operations, integrate directly with:
1. **MTN MoMo** - Largest mobile money provider in Cameroon
2. **Orange Money** - Second largest provider

This reduces transaction fees and gives you more control.

### For Pan-African Expansion

| Region | Primary Provider | Backup/Aggregator |
|--------|------------------|-------------------|
| West Africa (Francophone) | Orange Money, Wave | Flutterwave |
| West Africa (Anglophone) | MTN MoMo | Flutterwave, Paystack |
| East Africa | M-Pesa (Safaricom/Vodacom) | Flutterwave |
| Southern Africa | MTN MoMo, Airtel | Flutterwave, Paystack |
| Central Africa | MTN MoMo, Orange | Flutterwave |

### Timeline Estimates

| Provider | Sandbox Access | Production Approval |
|----------|----------------|---------------------|
| MTN MoMo | Immediate | 2-4 weeks |
| Orange Money | 1-2 weeks | 3-6 weeks |
| M-Pesa (Kenya) | Immediate | 3-5 days |
| M-Pesa (Tanzania) | 1-2 days | 2-4 weeks |
| Airtel Money | Immediate | 2-4 weeks |
| Wave | 1-2 days | 1-2 weeks |
| Flutterwave | Immediate | 1-2 weeks |
| Paystack | Immediate | 1-2 weeks |

---

## Quick Reference Links

| Provider | Developer Portal | Sign Up |
|----------|------------------|---------|
| MTN MoMo | https://momodeveloper.mtn.com/ | https://momodeveloper.mtn.com/signup |
| Orange Money | https://developer.orange.com/ | https://developer.orange.com/ |
| M-Pesa (Kenya) | https://developer.safaricom.co.ke/ | https://developer.safaricom.co.ke/account/signup |
| M-Pesa (Tanzania) | https://business.m-pesa.com/developers/ | https://business.m-pesa.com/ |
| Airtel Money | https://developers.airtel.africa/ | https://developers.airtel.africa/user/signup |
| Wave | https://docs.wave.com/business | https://business.wave.com |
| Flutterwave | https://developer.flutterwave.com/ | https://onboarding.flutterwave.com/signup |
| Paystack | https://paystack.com/docs/ | https://dashboard.paystack.com/signup |

---

## Document Information

| Field | Value |
|-------|-------|
| Version | 1.0 |
| Last Updated | January 2026 |
| Author | Okada Platform Team |
| Status | Active |

