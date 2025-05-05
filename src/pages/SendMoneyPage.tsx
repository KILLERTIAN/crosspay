import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTransactionForm } from "@/hooks/useTransactionForm";
import { formatCurrency, SUPPORTED_CURRENCIES, getCurrencyByCode } from "@/lib/utils";
import { 
  ArrowLeft, 
  ArrowRight, 
  ArrowRightLeft,
  Check, 
  Coins, 
  DollarSign,
  Loader2,
  Send, 
  Shield,
  Zap, 
  Wallet,
  AlertCircle,
  LinkIcon
} from "lucide-react";
import { ExchangeRateChart } from "@/components/ui/exchange-rate-chart";
import { generateHistoricalRates } from "@/lib/api";

// Temporary solution until we properly add the Alert and Badge components
const Alert = ({ children, variant, className }: { children: React.ReactNode, variant?: string, className?: string }) => (
  <div className={`p-4 rounded-md mb-4 ${
    variant === 'destructive' ? 'bg-red-100 text-red-800' : 
    variant === 'warning' ? 'bg-amber-100 text-amber-800' : 
    'bg-blue-100 text-blue-800'
  } ${className || ''}`}>
    {children}
  </div>
);

const AlertTitle = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={`font-bold mb-1 ${className || ''}`}>{children}</div>
);

const AlertDescription = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={className || ''}>{children}</div>
);

// Add back the Badge component
const Badge = ({ children, variant, className }: { children: React.ReactNode, variant?: string, className?: string }) => (
  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
    variant === 'success' ? 'bg-green-100 text-green-800' : 
    variant === 'destructive' ? 'bg-red-100 text-red-800' : 
    'bg-blue-100 text-blue-800'
  } ${className || ''}`}>
    {children}
  </span>
);

// Declare global window property for mock account
declare global {
  interface Window {
    mockAccount?: string;
  }
}

// Define types for transaction form values to avoid any
interface TransactionFormValues {
  amount: number;
  fromCurrency: string;
  toCurrency: string;
  recipientName: string;
  recipientEmail: string;
  recipientAccountId: string;
  recipientPhone: string;
  [key: string]: string | number;
}

// Define type for createTransaction function
type CreateTransactionFn = (
  recipient: string,
  assetId: number,
  amount: string,
  fromCurrency: string,
  toCurrency: string
) => Promise<number>;

// Mock data for useRWACrossPay hook
const useRWACrossPay = () => {
  // Use any previously set mock account
  const [account] = useState<string | null>(window.mockAccount || null);
  const [isVerifiedUser] = useState(true);
  const [tokenBalance] = useState('1000000000000000000000');
  const tokenSymbol = "RWA";

  // Token conversion rates
  const TOKEN_TO_CURRENCY_RATES: Record<string, number> = {
    'USD': 1,      // 1 token = 1 USD
    'EUR': 0.93,   // 1 token = 0.93 EUR
    'GBP': 0.79,   // 1 token = 0.79 GBP
    'INR': 83.43,  // 1 token = 83.43 INR
    'MXN': 16.77,  // 1 token = 16.77 MXN
    'VND': 25170,  // 1 token = 25170 VND
    'PHP': 58.23   // 1 token = 58.23 PHP
  };

  // Currency to token conversion
  const currencyToToken = (amount: number, currency: string): number => {
    if (!TOKEN_TO_CURRENCY_RATES[currency]) return amount;
    return amount / TOKEN_TO_CURRENCY_RATES[currency];
  };

  // Format token amount
  const formatTokenAmount = (amount: string | number): string => {
    const value = typeof amount === 'string' ? amount : amount.toString();
    // Simple formatting for the mock - divide by 10^18
    const valueNum = parseFloat(value) / 10**18;
    return valueNum.toFixed(6);
  };

  // Create transaction
  const createTransaction = async (
    recipient: string,
    assetId: number,
    amount: string,
    fromCurrency: string,
    toCurrency: string
  ): Promise<number> => {
    // Mock implementation
    console.log(`Creating transaction: ${recipient}, ${assetId}, ${amount}, ${fromCurrency}, ${toCurrency}`);
    // Simulate a blockchain delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    // Return a mock transaction ID
    return Math.floor(Math.random() * 1000000);
  };

  return {
    account,
    isVerifiedUser,
    tokenBalance,
    tokenSymbol,
    currencyToToken,
    formatTokenAmount,
    createTransaction
  };
};

// Mock ConnectButton component
const ConnectButton = ({ isConnecting, setIsConnecting }: { isConnecting: boolean, setIsConnecting: (connecting: boolean) => void }) => {
  const handleConnect = async () => {
    setIsConnecting(true);
    
    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In a real implementation, this would connect to MetaMask
    window.mockAccount = '0x123456789abcdef123456789abcdef123456789a';
    
    setIsConnecting(false);
    
    // Force a refresh to update the component
    window.location.reload();
  };
  
  return (
    <Button onClick={handleConnect} disabled={isConnecting}>
      {isConnecting ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Connecting...
        </>
      ) : (
        <>
          <Wallet className="mr-2 h-4 w-4" />
          Connect Wallet
        </>
      )}
    </Button>
  );
};

// Default asset ID to use for transactions
const DEFAULT_ASSET_ID = 1;

// Fix the function signature of handleBlockchainTransaction to avoid duplicate declaration
const processBlockchainTransaction = async (
  account: string | null,
  isVerifiedUser: boolean,
  hasEnoughTokens: boolean,
  tokenSymbol: string,
  createTransaction: CreateTransactionFn,
  formValues: TransactionFormValues,
  tokenAmount: number,
  setTransactionId: (id: number | null) => void,
  goToNextStep: () => void,
  setErrorMessage: (msg: string | null) => void
) => {
  if (!account) {
    setErrorMessage('Please connect your wallet first');
    return;
  }

  if (!isVerifiedUser) {
    setErrorMessage('Your account is not verified. Please contact support for verification.');
    return;
  }

  if (!hasEnoughTokens) {
    setErrorMessage(`You don't have enough ${tokenSymbol} tokens to complete this transaction.`);
    return;
  }

  try {
    const recipient = formValues.recipientAccountId || formValues.recipientEmail;
    
    // Convert the token amount to the correct format with 18 decimals (assuming ERC20 standard)
    const tokenAmountInWei = BigInt(Math.floor(tokenAmount * 10**18)).toString();
    
    // Create the transaction
    const txId = await createTransaction(
      recipient,
      DEFAULT_ASSET_ID,
      tokenAmountInWei,
      formValues.fromCurrency,
      formValues.toCurrency
    );
    
    if (txId) {
      setTransactionId(txId);
      goToNextStep();
    } else {
      setErrorMessage('Transaction failed. Please try again.');
    }
  } catch (error) {
    console.error('Transaction error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Transaction failed. Please try again.';
    setErrorMessage(errorMessage);
  }
};

export function SendMoneyPage() {
  const {
    formValues,
    handleInputChange,
    currentStep,
    goToNextStep,
    goToPreviousStep,
    prepareTransactionSummary,
    transactionSummary,
    isSubmitting,
    isLoadingRates,
    exchangeRates,
  } = useTransactionForm();
  
  const {
    account,
    isVerifiedUser,
    tokenBalance,
    tokenSymbol,
    currencyToToken,
    formatTokenAmount,
    createTransaction
  } = useRWACrossPay();

  const [historicalData, setHistoricalData] = useState(
    generateHistoricalRates(formValues.fromCurrency, formValues.toCurrency)
  );
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [transactionId, setTransactionId] = useState<number | null>(null);
  const [isWalletConnecting, setIsWalletConnecting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Generate new historical data when currencies change
  useEffect(() => {
    setHistoricalData(
      generateHistoricalRates(formValues.fromCurrency, formValues.toCurrency)
    );
  }, [formValues.fromCurrency, formValues.toCurrency]);

  // Handle successful submission
  useEffect(() => {
    if (currentStep > 3) {
      setShowSuccessMessage(true);
    }
  }, [currentStep]);

  // Get currency details
  const fromCurrencyDetails = getCurrencyByCode(formValues.fromCurrency);
  const toCurrencyDetails = getCurrencyByCode(formValues.toCurrency);

  // Calculate converted amount for preview
  const convertedAmount = 
    formValues.amount * (exchangeRates[formValues.toCurrency] || 0);

  // Convert to token amounts
  const tokenAmount = currencyToToken(formValues.amount, formValues.fromCurrency);
  
  // Format token amount
  const formattedTokenAmount = !isNaN(tokenAmount) 
    ? tokenAmount.toFixed(6) 
    : '0';

  // Check if user has enough tokens
  const hasEnoughTokens = parseFloat(tokenBalance) >= tokenAmount;

  // Handle blockchain transaction using the renamed function
  const handleBlockchainTransaction = async () => {
    await processBlockchainTransaction(
      account,
      isVerifiedUser,
      hasEnoughTokens,
      tokenSymbol,
      createTransaction,
      formValues as unknown as TransactionFormValues,
      tokenAmount,
      setTransactionId,
      goToNextStep,
      setErrorMessage
    );
  };

  // Custom submit transaction function
  const submitTransaction = async () => {
    try {
      await handleBlockchainTransaction();
    } catch (error) {
      console.error('Error submitting transaction:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="text-center">
          <h1 className="mb-4 text-4xl font-bold">Send Money Internationally</h1>
          <p className="text-lg text-slate-600">
            Fast, secure cross-border payments with near-zero fees and instant settlement.
          </p>
        </div>

        {!account && (
          <Alert variant="warning" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Wallet Connection Required</AlertTitle>
            <AlertDescription>
              Connect your wallet to send funds across borders using our blockchain-powered system.
              <div className="mt-4">
                <ConnectButton 
                  isConnecting={isWalletConnecting}
                  setIsConnecting={setIsWalletConnecting}
                />
              </div>
            </AlertDescription>
          </Alert>
        )}

        {account && !isVerifiedUser && (
          <Alert variant="warning" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Account Not Verified</AlertTitle>
            <AlertDescription>
              Your account is not verified for cross-border transfers. Please contact support.
            </AlertDescription>
          </Alert>
        )}

        {account && (
          <div className="flex items-center justify-between rounded-lg bg-slate-50 p-4 mb-6">
            <div className="flex items-center gap-3">
              <Wallet className="h-5 w-5 text-slate-600" />
              <div className="text-sm">
                <p className="font-medium">{account.substring(0, 6)}...{account.substring(account.length - 4)}</p>
                <p className="text-slate-500">{formatTokenAmount(tokenBalance)} {tokenSymbol}</p>
              </div>
            </div>
            <Badge variant={isVerifiedUser ? "success" : "destructive"}>
              {isVerifiedUser ? "Verified" : "Unverified"}
            </Badge>
          </div>
        )}

        {errorMessage && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        {!showSuccessMessage ? (
          <>
            <div className="flex items-center justify-center">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${
                    currentStep >= 1 ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {currentStep > 1 ? <Check className="h-5 w-5" /> : "1"}
                </div>
                <div className={`h-0.5 w-10 ${currentStep >= 2 ? "bg-blue-600" : "bg-slate-200"}`} />
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${
                    currentStep >= 2 ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {currentStep > 2 ? <Check className="h-5 w-5" /> : "2"}
                </div>
                <div className={`h-0.5 w-10 ${currentStep >= 3 ? "bg-blue-600" : "bg-slate-200"}`} />
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${
                    currentStep >= 3 ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-600"
                  }`}
                >
                  3
                </div>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>
                  {currentStep === 1 && "Transfer Details"}
                  {currentStep === 2 && "Recipient Information"}
                  {currentStep === 3 && "Review & Confirm"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label htmlFor="amount" className="block text-sm font-medium">
                        Amount
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                        <Input
                          id="amount"
                          type="number"
                          min="1"
                          value={formValues.amount}
                          onChange={(e) => handleInputChange("amount", Number(e.target.value))}
                          placeholder="Enter amount"
                          className="pl-10"
                        />
                      </div>
                      {formValues.amount > 0 && (
                        <div className="flex justify-between text-xs">
                          <p className="text-slate-500">
                          Fee: {formatCurrency(formValues.amount * 0.01, formValues.fromCurrency)} (1%)
                        </p>
                          <p className="text-slate-500">
                            Token Amount: ~{formattedTokenAmount} {tokenSymbol}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <label htmlFor="fromCurrency" className="block text-sm font-medium">
                          From Currency
                        </label>
                        <Select 
                          value={formValues.fromCurrency} 
                          onValueChange={(value) => handleInputChange("fromCurrency", value)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                          <SelectContent>
                            {SUPPORTED_CURRENCIES.map((currency) => (
                              <SelectItem key={currency.value} value={currency.value}>
                                <div className="flex items-center gap-2">
                                  <span>{currency.flag}</span>
                                  <span>{currency.label}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="toCurrency" className="block text-sm font-medium">
                          To Currency
                        </label>
                        <Select 
                          value={formValues.toCurrency} 
                          onValueChange={(value) => handleInputChange("toCurrency", value)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                          <SelectContent>
                            {SUPPORTED_CURRENCIES.map((currency) => (
                              <SelectItem key={currency.value} value={currency.value}>
                                <div className="flex items-center gap-2">
                                  <span>{currency.flag}</span>
                                  <span>{currency.label}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {formValues.amount > 0 && formValues.fromCurrency && formValues.toCurrency && (
                      <div className="space-y-4">
                        <div className="overflow-hidden rounded-md bg-gradient-to-r from-blue-50 to-indigo-50 p-4">
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <p className="text-sm text-slate-500">You Send</p>
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{fromCurrencyDetails?.flag}</span>
                                <span className="text-xl font-bold">
                                  {formatCurrency(formValues.amount, formValues.fromCurrency)}
                                </span>
                              </div>
                              <div className="text-xs text-slate-500">
                                {formattedTokenAmount} {tokenSymbol}
                              </div>
                            </div>
                            <ArrowRightLeft className="h-5 w-5 text-slate-400" />
                            <div className="space-y-1 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <p className="text-sm text-slate-500">Recipient Gets</p>
                                {isLoadingRates && (
                                  <Loader2 className="h-3 w-3 animate-spin text-slate-500" />
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{toCurrencyDetails?.flag}</span>
                                <span className="text-xl font-bold text-green-600">
                                  {formatCurrency(convertedAmount, formValues.toCurrency)}
                                </span>
                              </div>
                              <div className="text-xs text-slate-500">
                                {formattedTokenAmount} {tokenSymbol}
                              </div>
                            </div>
                          </div>
                          <div className="mt-4 text-xs text-slate-500">
                            Exchange Rate: 1 {formValues.fromCurrency} = {
                              exchangeRates[formValues.toCurrency]?.toFixed(4) || '...'
                            } {formValues.toCurrency}
                          </div>
                        </div>
                        
                        <ExchangeRateChart 
                          data={historicalData}
                          baseCurrency={formValues.fromCurrency}
                          targetCurrency={formValues.toCurrency}
                          amount={formValues.amount}
                        />
                      </div>
                    )}

                    <div className="flex justify-end">
                      <Button 
                        onClick={goToNextStep} 
                        disabled={formValues.amount <= 0 || !hasEnoughTokens}
                      >
                        Continue <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                    
                    {!hasEnoughTokens && formValues.amount > 0 && (
                      <div className="text-center text-red-500 text-sm">
                        Insufficient tokens. You need {formattedTokenAmount} {tokenSymbol} for this transaction.
                      </div>
                    )}
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label htmlFor="recipientName" className="block text-sm font-medium">
                        Recipient Name
                      </label>
                      <Input
                        id="recipientName"
                        value={formValues.recipientName}
                        onChange={(e) => handleInputChange("recipientName", e.target.value)}
                        placeholder="Enter recipient's full name"
                      />
                    </div>

                      <div className="space-y-2">
                        <label htmlFor="recipientEmail" className="block text-sm font-medium">
                        Recipient Email
                        </label>
                        <Input
                          id="recipientEmail"
                          type="email"
                          value={formValues.recipientEmail}
                          onChange={(e) => handleInputChange("recipientEmail", e.target.value)}
                        placeholder="Enter recipient's email"
                        />
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="recipientPhone" className="block text-sm font-medium">
                        Recipient Phone (Optional)
                        </label>
                        <Input
                          id="recipientPhone"
                        type="tel"
                          value={formValues.recipientPhone}
                          onChange={(e) => handleInputChange("recipientPhone", e.target.value)}
                        placeholder="Enter recipient's phone number"
                        />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="recipientAccountId" className="block text-sm font-medium">
                        Recipient Wallet Address
                      </label>
                      <Input
                        id="recipientAccountId"
                        value={formValues.recipientAccountId}
                        onChange={(e) => handleInputChange("recipientAccountId", e.target.value)}
                        placeholder="Enter recipient's wallet address"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Button variant="outline" onClick={goToPreviousStep}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back
                      </Button>
                      <Button
                        onClick={prepareTransactionSummary}
                        disabled={
                          !formValues.recipientName ||
                          !formValues.recipientEmail ||
                          (!formValues.recipientAccountId && !formValues.recipientEmail)
                        }
                      >
                        Continue <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {currentStep === 3 && transactionSummary && (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div className="rounded-md bg-slate-50 p-4">
                        <h3 className="mb-2 font-medium">Transaction Summary</h3>
                        <dl className="space-y-2">
                          <div className="flex justify-between">
                            <dt className="text-slate-500">Amount</dt>
                            <dd className="font-medium">
                              {formatCurrency(
                                transactionSummary.amount,
                                transactionSummary.fromCurrency
                              )}
                            </dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-slate-500">Fee</dt>
                            <dd>
                              {formatCurrency(
                                transactionSummary.fee,
                                transactionSummary.fromCurrency
                              )}
                            </dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-slate-500">Total</dt>
                            <dd className="font-medium">
                              {formatCurrency(
                                transactionSummary.totalAmount,
                                transactionSummary.fromCurrency
                              )}
                            </dd>
                          </div>
                          <div className="border-t border-slate-200 my-2"></div>
                          <div className="flex justify-between">
                            <dt className="text-slate-500">Recipient Gets</dt>
                            <dd className="font-medium text-green-600">
                              {formatCurrency(
                                transactionSummary.convertedAmount,
                                transactionSummary.toCurrency
                              )}
                            </dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-slate-500">Exchange Rate</dt>
                            <dd>
                              1 {transactionSummary.fromCurrency} ={" "}
                              {transactionSummary.exchangeRate.toFixed(4)}{" "}
                              {transactionSummary.toCurrency}
                            </dd>
                        </div>
                          <div className="flex justify-between">
                            <dt className="text-slate-500">Token Amount</dt>
                            <dd>
                              ~{formattedTokenAmount} {tokenSymbol}
                            </dd>
                          </div>
                          <div className="border-t border-slate-200 my-2"></div>
                          <div className="flex justify-between">
                            <dt className="text-slate-500">Recipient</dt>
                            <dd>{formValues.recipientName}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-slate-500">Delivery Time</dt>
                            <dd>{transactionSummary.estimatedDeliveryTime}</dd>
                          </div>
                        </dl>
                      </div>

                      <div className="rounded-md bg-blue-50 p-4">
                        <div className="flex items-center gap-2">
                          <Shield className="h-5 w-5 text-blue-500" />
                          <h3 className="font-medium text-blue-700">Secure Transfer</h3>
                        </div>
                        <p className="mt-1 text-sm text-blue-600">
                          Your transaction is protected by our secure blockchain technology.
                          Funds will be transferred directly to the recipient using the asset
                          tokenization platform.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <Button variant="outline" onClick={goToPreviousStep}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back
                      </Button>
                      <Button onClick={submitTransaction} disabled={isSubmitting}>
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing
                          </>
                        ) : (
                          <>
                            Confirm & Pay <Send className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                  <Check className="h-6 w-6 text-green-600" />
              </div>
                <h2 className="mt-4 text-xl font-bold">Transfer Successful!</h2>
                <p className="mb-4 mt-2 text-slate-600">
                  Your funds are on the way to the recipient.
              </p>

                {transactionId && (
                  <div className="mb-6 rounded-md bg-slate-50 p-4 text-center">
                    <p className="text-sm text-slate-500">Transaction ID</p>
                    <p className="font-mono font-medium">#{transactionId}</p>
                    <Button variant="link" size="sm" className="mt-2">
                      <LinkIcon className="mr-1 h-3 w-3" /> View on Explorer
                    </Button>
                  </div>
                )}
                
                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-center">
                  <Button variant="outline" onClick={() => window.location.reload()}>
                    Send Another
                  </Button>
                  <Button>
                    <Coins className="mr-2 h-4 w-4" />
                    View Transaction
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4 rounded-md bg-slate-50 p-6">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-500" />
            <h3 className="font-medium">Why Choose CrossPay?</h3>
          </div>
          <div className="grid gap-4 text-sm md:grid-cols-3">
            <div>
              <h4 className="font-medium">Fast Settlement</h4>
              <p className="text-slate-600">
                Near-instant transfers across borders using blockchain technology.
              </p>
            </div>
            <div>
              <h4 className="font-medium">Low Fees</h4>
              <p className="text-slate-600">
                1% flat fee, significantly lower than traditional transfer services.
              </p>
          </div>
            <div>
              <h4 className="font-medium">Secure & Transparent</h4>
              <p className="text-slate-600">
                Blockchain-verified transactions with full audit trail.
              </p>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
} 