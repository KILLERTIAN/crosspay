# CrossPay Demo Guide

This step-by-step guide provides detailed instructions for demonstrating the CrossPay application to audiences, with a focus on showcasing the RWA tokenization features and Pharos Network integration.

## Prerequisites

Before starting the demo:

1. Ensure you have MetaMask installed and configured
2. Add the Pharos Testnet to MetaMask with these settings:
   - Network Name: Pharos Testnet
   - RPC URL: https://testnet.dplabs-internal.com
   - Chain ID: 688688
   - Currency Symbol: PHAR
3. Ensure you have some test PHAR tokens in your wallet
4. Make sure the application is running locally with `npm run dev`

## Demo Steps

### 1. Homepage Overview

**URL**: `/`

1. **Start with the header**
   - Point out the navigation menu items
   - Mention that users can access all key features from here
   
2. **Highlight the hero section**
   - Emphasize the main value proposition: "Cross-Border Payments Redefined"
   - Point out the key metrics: <1% fees, <1s settlement, 30+ countries
   
3. **Demonstrate the currency converter**
   - Select "USD" as the source currency
   - Enter "1000" as the amount
   - Select "MXN" as the destination currency
   - Highlight how it shows both the fiat amount (16,770 MXN) and the equivalent token amount
   - Explain this represents the real-time conversion that happens on the blockchain
   
4. **Scroll through features section**
   - Briefly mention each key feature and its importance
   - Highlight the comparison with traditional banking systems

5. **Show the mobile app preview**
   - Explain that the same functionality is available on mobile
   - Mention the convenience of managing international transfers on the go

### 2. About Page / How It Works

**URL**: `/about`

1. **Explain the RWA tokenization concept**
   - Point out how real-world assets are represented as tokens
   - Emphasize the stability compared to cryptocurrencies
   
2. **Walk through the cross-border process**
   - Explain the 3-step process: Convert → Transfer → Receive
   - Highlight the role of the Pharos blockchain in enabling instant settlement
   
3. **Discuss regulatory compliance**
   - Explain how the platform handles different jurisdictional requirements
   - Mention the KYC/AML processes built into the system

### 3. Wallet Connection

1. **Click on the "Connect Wallet" button in the header**
   - MetaMask will prompt for connection
   - Accept the connection request
   
2. **Point out the wallet information display**
   - Show how the wallet address is displayed
   - Note the RWA token balance
   
3. **Explain the Pharos Network connection**
   - Mention that we're connected to the Pharos Testnet
   - Explain that both Testnet and Devnet are supported
   - Highlight the Pharos Network's advantages for payment applications

### 4. Cross-Border Payment Demo

**URL**: `/demo`

1. **Payment Details Step**
   - Enter "1000" in the amount field
   - Select "USD" as the source currency
   - Select "MXN" as the destination currency
   - Point out:
     - The fee calculation (1% = $10)
     - The token amount equivalent (~1000 RWA tokens)
     - The exchange rate (1 USD = 16.77 MXN)
     - The amount the recipient will receive (16,770 MXN)
   - Click "Continue"

2. **Recipient Information Step**
   - Fill in recipient details:
     - Name: "Maria Rodriguez"
     - Email: "maria@example.com"
     - Wallet Address: "0x2a45d27aaF8167A29394CE4de6B4F8b25C215f90"
   - Point out the payment summary:
     - Original amount
     - Fee
     - Total amount
     - Recipient amount in their currency
     - Token amount being transferred
   - Click "Complete Payment"

3. **Transaction Processing**
   - Explain that in a real scenario:
     - The system would convert USD to RWA tokens
     - Transfer the tokens on the Pharos blockchain
     - The recipient would receive MXN
   - Wait for the transaction to complete

4. **Success Page**
   - Point out the transaction ID
   - Mention that this transaction is recorded on the Pharos blockchain
   - Show how users can view the transaction on the blockchain explorer
   - Highlight the "Send Another" button for repeat transactions

### 5. Technical Details (Optional)

If the audience is technical:

1. **Explain the smart contract architecture**
   - Mention the RWACrossPay contract deployed at 0x1532E3302eF5951Ad8420FAAe017AAe6BD9DF2F5
   - Explain how the contract handles:
     - Asset tokenization
     - Multi-currency support
     - Fee management
     - Regulatory compliance

2. **Show the Pharos Network configuration**
   - Explain how the application connects to both Testnet and Devnet
   - Mention the custom RPC configurations for special requirements
   - Highlight the WalletConnect integration

## Handling Questions

Common questions and their answers:

1. **How secure is the platform?**
   - Blockchain provides immutable transaction records
   - Smart contracts are audited for security
   - Wallet connection uses industry standard security

2. **What happens if something goes wrong with a transfer?**
   - Transactions are tracked on the blockchain
   - Customer support can assist with any issues
   - Smart contracts have built-in mechanisms for dispute resolution

3. **How does RWA tokenization maintain price stability?**
   - Each token is backed by real-world assets
   - The value is pegged to stable fiat currencies
   - Not subject to the volatility of cryptocurrencies

4. **What makes Pharos Network ideal for payments?**
   - Fast block times for near-instant settlement
   - Low transaction fees
   - Built for payment applications with specialized features

## Post-Demo Follow-up

After the demo:

1. Share the GitHub repository link for those interested in the technical implementation
2. Provide contact information for further questions
3. Offer to schedule a personalized demo for specific use cases
4. Share the presentation materials with attendees 