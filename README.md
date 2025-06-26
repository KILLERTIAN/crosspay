# CrossPay: Cross-Border Payment Application

CrossPay is a blockchain-powered application for making cross-border payments using Real World Asset (RWA) tokenization technology. The platform simplifies global asset transfers with built-in support for country-specific regulations, fees, and verification requirements.

## Features

- **RWA Tokenization**: Convert real-world assets into blockchain tokens
- **Cross-Border Payments**: Send money internationally with low fees
- **Multi-Currency Support**: Convert between different currencies seamlessly
- **Regulatory Compliance**: Built-in support for country-specific regulations
- **User Verification**: KYC/AML verification for secure transactions
- **Wallet Integration**: Connect popular web3 wallets via RainbowKit.

## Pharos Network Integration

CrossPay supports the Pharos blockchain network, both testnet and devnet environments.

### Connecting to Pharos Networks

The application comes with built-in support for the following Pharos networks:

1. **Pharos Testnet**
   - Network Name: Pharos Testnet
   - RPC URL: https://testnet.dplabs-internal.com
   - WSS URL: wss://testnet.dplabs-internal.com
   - Chain ID: 688688
   - Currency Symbol: PHAR
   - Environment: Testnet
   - Rate Limit: 500 times/5m

2. **Pharos Devnet**
   - Network Name: Pharos Devnet
   - RPC URL: https://devnet.dplabs-internal.com
   - WSS URL: wss://devnet.dplabs-internal.com
   - Chain ID: 50002
   - Currency Symbol: PHAR
   - Block Explorer: https://pharosscan.xyz/
   - Environment: Devnet
   - Rate Limit: 500 times/5m

### Getting Testnet PHAR Tokens

1. Join the [Pharos Discord](https://discord.gg/pharos) or relevant community channel
2. Request testnet tokens from the faucet channel
3. Provide your wallet address in the format specified by the faucet bot
4. Wait for confirmation that tokens have been sent to your wallet

## Development

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Git

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/crosspay.git
   cd crosspay
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up WalletConnect Project ID:
   - Go to [WalletConnect Cloud](https://cloud.walletconnect.com/sign-in) and sign up/sign in
   - Create a new project and get your project ID
   - Update the `projectId` constant in `src/components/WalletProvider.tsx` with your project ID

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open http://localhost:5173 to view the application in your browser

## Technology Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **Blockchain Interaction**: wagmi, RainbowKit, viem
- **Smart Contracts**: Solidity, OpenZeppelin
- **Wallet Connection**: WalletConnect, MetaMask

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Pharos Network](https://pharosnetwork.xyz) for providing the blockchain infrastructure
- All contributors and supporters of the CrossPay platform
- The open-source community for their invaluable tools and resources
