import { useState, useEffect, useCallback } from 'react';
import { Web3Provider } from '@ethersproject/providers';
import { Contract } from '@ethersproject/contracts';
import RWACrossPayABI from '@/abis/RWACrossPay.json';
import ERC20ABI from '@/abis/ERC20.json';

// Contract addresses
const RWA_CROSSPAY_ADDRESS = '0x1532E3302eF5951Ad8420FAAe017AAe6BD9DF2F5';
const RWA_TOKEN_ADDRESS = '0xaf0F4f6Ed69DBE5C59BF3e473cB9D6CF9F40C6aF';

// Currency codes to ISO mapping
export const CURRENCY_TO_ISO: Record<string, string> = {
  'USD': 'US',
  'EUR': 'EU',
  'GBP': 'GB',
  'INR': 'IN',
  'MXN': 'MX',
  'VND': 'VN',
  'PHP': 'PH'
};

// Exchange rates (token to currency)
export const TOKEN_TO_CURRENCY: Record<string, number> = {
  'USD': 1,      // 1 token = 1 USD
  'EUR': 0.93,   // 1 token = 0.93 EUR
  'GBP': 0.79,   // 1 token = 0.79 GBP
  'INR': 83.43,  // 1 token = 83.43 INR
  'MXN': 16.77,  // 1 token = 16.77 MXN
  'VND': 25170,  // 1 token = 25170 VND
  'PHP': 58.23   // 1 token = 58.23 PHP
};

// Asset type
export interface Asset {
  id: number;
  assetType: string;
  description: string;
  value: string;
  verified: boolean;
  tokenAddress: string;
}

// Transaction status enum
export enum TransactionStatus {
  Pending = 0,
  Completed = 1,
  Refunded = 2,
  Rejected = 3
}

// Transaction type
export interface Transaction {
  id: number;
  sender: string;
  recipient: string;
  assetId: number;
  amount: string;
  fee: string;
  fromCountry: string;
  toCountry: string;
  timestamp: number;
  status: TransactionStatus;
}

// Custom hook for interacting with the RWACrossPay contract
export function useRWACrossPay() {
  const [provider, setProvider] = useState<Web3Provider | null>(null);
  const [crossPayContract, setCrossPayContract] = useState<Contract | null>(null);
  const [tokenContract, setTokenContract] = useState<Contract | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoadingAssets, setIsLoadingAssets] = useState(false);
  const [isVerifiedUser, setIsVerifiedUser] = useState(false);
  const [tokenBalance, setTokenBalance] = useState<string>('0');
  const [tokenName, setTokenName] = useState<string>('');
  const [tokenSymbol, setTokenSymbol] = useState<string>('');
  const [tokenDecimals, setTokenDecimals] = useState<number>(18);

  // Initialize provider and contracts
  useEffect(() => {
    const init = async () => {
      // Check if window.ethereum is available
      if (window.ethereum) {
        try {
          // Request account access
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          
          // Create provider
          const web3Provider = new Web3Provider(window.ethereum);
          setProvider(web3Provider);
          
          // Create contract instances
          const crossPay = new Contract(RWA_CROSSPAY_ADDRESS, RWACrossPayABI, web3Provider.getSigner());
          const token = new Contract(RWA_TOKEN_ADDRESS, ERC20ABI, web3Provider.getSigner());
          
          setCrossPayContract(crossPay);
          setTokenContract(token);
          setAccount(accounts[0]);

          // Get token details
          const name = await token.name();
          const symbol = await token.symbol();
          const decimals = await token.decimals();
          setTokenName(name);
          setTokenSymbol(symbol);
          setTokenDecimals(Number(decimals));

          // Load assets and check verification status
          loadAssets();
          checkVerificationStatus(accounts[0]);
          loadTokenBalance(accounts[0]);

          // Setup event listener for account changes
          window.ethereum.on('accountsChanged', (newAccounts: string[]) => {
            setAccount(newAccounts[0]);
            checkVerificationStatus(newAccounts[0]);
            loadTokenBalance(newAccounts[0]);
          });
        } catch (error) {
          console.error('Error initializing web3:', error);
        }
      } else {
        console.log('Please install MetaMask or another Ethereum wallet');
      }
    };

    init();

    // Cleanup
    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
      }
    };
  }, []);

  // Check if user is verified
  const checkVerificationStatus = async (address: string) => {
    if (crossPayContract) {
      try {
        const verified = await crossPayContract.verifiedUsers(address);
        setIsVerifiedUser(verified);
      } catch (error) {
        console.error('Error checking user verification status:', error);
      }
    }
  };

  // Load user's token balance
  const loadTokenBalance = async (address: string) => {
    if (tokenContract) {
      try {
        const balance = await tokenContract.balanceOf(address);
        setTokenBalance(balance.toString());
      } catch (error) {
        console.error('Error loading token balance:', error);
      }
    }
  };

  // Load assets from the contract
  const loadAssets = async () => {
    if (crossPayContract) {
      try {
        setIsLoadingAssets(true);
        const assetCount = await crossPayContract.assetCount();
        const assetList: Asset[] = [];

        for (let i = 1; i <= assetCount; i++) {
          const asset = await crossPayContract.getAsset(i);
          assetList.push({
            id: i,
            assetType: asset.assetType,
            description: asset.description,
            value: asset.value.toString(),
            verified: asset.verified,
            tokenAddress: asset.tokenAddress
          });
        }

        setAssets(assetList);
      } catch (error) {
        console.error('Error loading assets:', error);
      } finally {
        setIsLoadingAssets(false);
      }
    }
  };

  // Get transaction by ID
  const getTransaction = async (txId: number): Promise<Transaction | null> => {
    if (crossPayContract) {
      try {
        const transaction = await crossPayContract.getTransaction(txId);
        return {
          id: txId,
          sender: transaction.sender,
          recipient: transaction.recipient,
          assetId: transaction.assetId.toNumber(),
          amount: transaction.amount.toString(),
          fee: transaction.fee.toString(),
          fromCountry: transaction.fromCountry,
          toCountry: transaction.toCountry,
          timestamp: transaction.timestamp.toNumber(),
          status: transaction.status
        };
      } catch (error) {
        console.error('Error getting transaction:', error);
      }
    }
    return null;
  };

  // Convert currency amount to token amount
  const currencyToToken = (amount: number, currency: string): number => {
    if (!TOKEN_TO_CURRENCY[currency]) return amount;
    return amount / TOKEN_TO_CURRENCY[currency];
  };

  // Convert token amount to currency amount
  const tokenToCurrency = (amount: number, currency: string): number => {
    if (!TOKEN_TO_CURRENCY[currency]) return amount;
    return amount * TOKEN_TO_CURRENCY[currency];
  };

  // Format token amount with proper decimals
  const formatTokenAmount = (amount: string | number): string => {
    const decimals = tokenDecimals;
    const value = typeof amount === 'string' ? amount : amount.toString();
    
    // Check if the value is already formatted
    if (value.includes('.')) {
      return value;
    }
    
    // Add necessary zeros to reach the correct decimal places
    const paddedValue = value.padStart(decimals + 1, '0');
    const integerPart = paddedValue.slice(0, -decimals) || '0';
    const decimalPart = paddedValue.slice(-decimals);
    
    // Remove trailing zeros from the decimal part
    const trimmedDecimalPart = decimalPart.replace(/0+$/, '');
    
    // Return the formatted amount
    return trimmedDecimalPart.length > 0 
      ? `${integerPart}.${trimmedDecimalPart}` 
      : integerPart;
  };

  // Approve token transfer
  const approveTokens = async (amount: string): Promise<boolean> => {
    if (tokenContract && account) {
      try {
        const tx = await tokenContract.approve(RWA_CROSSPAY_ADDRESS, amount);
        await tx.wait();
        return true;
      } catch (error) {
        console.error('Error approving tokens:', error);
        return false;
      }
    }
    return false;
  };

  // Create transaction with RWA tokens
  const createTransaction = async (
    recipient: string,
    assetId: number,
    amount: string,
    fromCurrency: string,
    toCurrency: string
  ): Promise<number | null> => {
    if (crossPayContract && account && isVerifiedUser) {
      try {
        // First, approve the token transfer
        const approved = await approveTokens(amount);
        if (!approved) {
          throw new Error('Token approval failed');
        }

        // Convert currency codes to ISO country codes
        const fromCountry = CURRENCY_TO_ISO[fromCurrency] || 'US';
        const toCountry = CURRENCY_TO_ISO[toCurrency] || 'US';

        // Create the transaction
        const tx = await crossPayContract.createTransaction(
          recipient,
          assetId,
          amount,
          fromCountry,
          toCountry
        );
        const receipt = await tx.wait();

        // Find transaction ID from the events
        const event = receipt.events?.find(
          (e: any) => e.event === 'TransactionCreated'
        );
        if (event && event.args) {
          return event.args.txId.toNumber();
        }
      } catch (error) {
        console.error('Error creating transaction:', error);
      }
    }
    return null;
  };

  return {
    account,
    provider,
    crossPayContract,
    tokenContract,
    assets,
    isLoadingAssets,
    isVerifiedUser,
    tokenBalance,
    tokenName,
    tokenSymbol,
    tokenDecimals,
    loadAssets,
    getTransaction,
    currencyToToken,
    tokenToCurrency,
    formatTokenAmount,
    approveTokens,
    createTransaction,
  };
} 