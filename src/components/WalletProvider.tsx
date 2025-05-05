import '@rainbow-me/rainbowkit/styles.css';
import {
  getDefaultConfig,
  RainbowKitProvider,
  ConnectButton,
} from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import {
  mainnet,
  polygon,
  optimism,
  arbitrum,
  base,
} from 'wagmi/chains';
import {
  QueryClientProvider,
  QueryClient,
} from "@tanstack/react-query";
import { ReactNode } from 'react';
import { http } from 'wagmi';

// Create a query client
const queryClient = new QueryClient();

// Define Pharos Testnet (updated with latest docs)
export const pharosTestnet = {
  id: 688688,
  name: 'Pharos Testnet',
  network: 'pharos-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Pharos Testnet Token',
    symbol: 'PHAR',
  },
  rpcUrls: {
    default: { http: ['https://testnet.dplabs-internal.com'] },
    public: { http: ['https://testnet.dplabs-internal.com'] },
  },
  testnet: true,
};

// Define Pharos Devnet (updated with latest docs)
export const pharosDevnet = {
  id: 50002,
  name: 'Pharos Devnet',
  network: 'pharos-devnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Pharos Devnet Token',
    symbol: 'PHAR',
  },
  rpcUrls: {
    default: { http: ['https://devnet.dplabs-internal.com'] },
    public: { http: ['https://devnet.dplabs-internal.com'] },
  },
  blockExplorers: {
    default: { name: 'PharosScan', url: 'https://pharosscan.xyz/' },
  },
  testnet: true,
};

// Custom transport for Pharos Devnet (using a proxy endpoint with special headers)
const customTransports = {
  [pharosDevnet.id]: http(pharosDevnet.rpcUrls.default.http[0], {
    fetchOptions: {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    },
  }),
};

// WalletConnect project ID (required for production)
// Get yours at https://cloud.walletconnect.com/sign-in
const projectId = '7a026d961241ea662d0e403720f0552d';

// Configure wagmi with both standard and custom transports
const config = getDefaultConfig({
  appName: 'CrossPay',
  projectId: projectId, // Replace with your actual WalletConnect project ID
  chains: [pharosTestnet, pharosDevnet, mainnet, polygon, optimism, arbitrum, base],
  ssr: true,
  // Create transports combining standard HTTP for most chains and custom for Pharos Devnet
  transports: {
    ...Object.fromEntries(
      [mainnet, polygon, optimism, arbitrum, base, pharosTestnet].map(chain => [
        chain.id,
        http(chain.rpcUrls.default.http[0])
      ])
    ),
    ...customTransports,
  },
});

// Provider component to wrap the application
export function WalletProvider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

// Export the connect button for easy access
export { ConnectButton }; 