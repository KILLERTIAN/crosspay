/**
 * Utility functions for handling cross-border payments with the RWACrossPay contract
 */

// Contract addresses
export const RWA_CROSSPAY_ADDRESS = '0x1532E3302eF5951Ad8420FAAe017AAe6BD9DF2F5';
export const RWA_TOKEN_ADDRESS = '0xaf0F4f6Ed69DBE5C59BF3e473cB9D6CF9F40C6aF';

// Default asset ID to use for transactions (can be configured for each asset type)
export const DEFAULT_ASSET_ID = 1;

// Exchange rates from token to different currencies
export const TOKEN_TO_CURRENCY: Record<string, number> = {
  'USD': 1,      // 1 token = 1 USD
  'EUR': 0.93,   // 1 token = 0.93 EUR
  'GBP': 0.79,   // 1 token = 0.79 GBP
  'INR': 83.43,  // 1 token = 83.43 INR
  'MXN': 16.77,  // 1 token = 16.77 MXN
  'VND': 25170,  // 1 token = 25170 VND
  'PHP': 58.23   // 1 token = 58.23 PHP
};

// Convert currency amount to token amount
export function currencyToToken(amount: number, currency: string): number {
  if (!TOKEN_TO_CURRENCY[currency]) return amount;
  return amount / TOKEN_TO_CURRENCY[currency];
}

// Convert token amount to currency amount
export function tokenToCurrency(amount: number, currency: string): number {
  if (!TOKEN_TO_CURRENCY[currency]) return amount;
  return amount * TOKEN_TO_CURRENCY[currency];
}

// Create a mock transaction for testing
export async function mockCreateTransaction(
  recipient: string,
  assetId: number,
  amount: string,
  fromCurrency: string,
  toCurrency: string
): Promise<number> {
  console.log(`Creating transaction:
    Recipient: ${recipient}
    Asset ID: ${assetId}
    Amount: ${amount}
    From Currency: ${fromCurrency}
    To Currency: ${toCurrency}
  `);
  
  // Simulate blockchain delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Return a mock transaction ID
  return Math.floor(Math.random() * 1000000);
}

// Mock wallet connection
export async function mockConnectWallet(): Promise<string> {
  // Simulate connection delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Return a mock wallet address
  return '0x123456789abcdef123456789abcdef123456789a';
}

// Format token amount with proper decimals
export function formatTokenAmount(amount: string | number, decimals = 18): string {
  const value = typeof amount === 'string' ? amount : amount.toString();
  
  // Simple formatting - divide by 10^decimals
  const valueNum = parseFloat(value) / Math.pow(10, decimals);
  return valueNum.toFixed(6);
}

// Get transaction status string
export function getTransactionStatusText(status: number): string {
  const statusMap = {
    0: 'Pending',
    1: 'Completed',
    2: 'Refunded',
    3: 'Rejected'
  };
  
  return statusMap[status as keyof typeof statusMap] || 'Unknown';
} 