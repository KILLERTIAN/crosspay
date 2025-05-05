import { useState } from "react";
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
import { 
  ArrowRight, 
  ArrowRightLeft,
  Check, 
  Loader2,
  Send, 
  Wallet,
  AlertCircle,
  LinkIcon
} from "lucide-react";
import { 
  formatCurrency, 
  SUPPORTED_CURRENCIES, 
  getCurrencyByCode 
} from "@/lib/utils";
import {
  DEFAULT_ASSET_ID,
  RWA_CROSSPAY_ADDRESS,
  currencyToToken,
  formatTokenAmount,
  mockConnectWallet,
  mockCreateTransaction
} from "@/lib/crossPayTransactions";

// Form values type
interface FormValues {
  amount: number;
  fromCurrency: string;
  toCurrency: string;
  recipientName: string;
  recipientEmail: string;
  recipientWallet: string;
}

// Default form values
const DEFAULT_FORM: FormValues = {
  amount: 1000,
  fromCurrency: "USD",
  toCurrency: "MXN",
  recipientName: "",
  recipientEmail: "",
  recipientWallet: ""
};

// Alert component for notifications
function Alert({ 
  children, 
  variant 
}: { 
  children: React.ReactNode; 
  variant: "info" | "success" | "warning" | "error";
}) {
  const bgColor = 
    variant === "error" ? "bg-red-100 text-red-800" : 
    variant === "warning" ? "bg-yellow-100 text-yellow-800" : 
    variant === "success" ? "bg-green-100 text-green-800" : 
    "bg-blue-100 text-blue-800";
  
  return (
    <div className={`rounded-md p-4 mb-4 ${bgColor}`}>
      {children}
    </div>
  );
}

export function CrossBorderPaymentDemo() {
  // Component state
  const [form, setForm] = useState<FormValues>(DEFAULT_FORM);
  const [step, setStep] = useState(1);
  const [wallet, setWallet] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txId, setTxId] = useState<number | null>(null);
  
  // Token conversion calculations
  const tokenAmount = currencyToToken(form.amount, form.fromCurrency);
  const tokenBalance = 1000; // Mock token balance
  const hasEnoughTokens = tokenAmount <= tokenBalance;
  
  // Exchange rates (simplified for demo)
  const exchangeRate = form.fromCurrency === form.toCurrency 
    ? 1 
    : form.toCurrency === "USD" 
      ? 1 / currencyToToken(1, form.fromCurrency) 
      : currencyToToken(1, form.toCurrency) / currencyToToken(1, form.fromCurrency);
  
  // Recipient will get this amount in their currency
  const convertedAmount = form.amount * exchangeRate;
  
  // Fee calculation (1%)
  const fee = form.amount * 0.01;
  const totalAmount = form.amount + fee;
  
  // Currency details
  const fromCurrencyDetails = getCurrencyByCode(form.fromCurrency);
  const toCurrencyDetails = getCurrencyByCode(form.toCurrency);
  
  // Handle form input changes
  const handleChange = (field: keyof FormValues, value: string | number) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };
  
  // Connect wallet
  const connectWallet = async () => {
    setConnecting(true);
    setError(null);
    
    try {
      const address = await mockConnectWallet();
      setWallet(address);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to connect wallet";
      setError(errorMessage);
    } finally {
      setConnecting(false);
    }
  };
  
  // Go to next step
  const nextStep = () => {
    setStep(prev => prev + 1);
  };
  
  // Submit payment transaction
  const submitPayment = async () => {
    if (!wallet) {
      setError("Please connect your wallet first");
      return;
    }
    
    if (!hasEnoughTokens) {
      setError("Insufficient token balance");
      return;
    }
    
    if (!form.recipientName || !form.recipientWallet) {
      setError("Please fill all required fields");
      return;
    }
    
    setSubmitting(true);
    setError(null);
    
    try {
      // Convert token amount to wei format (assuming 18 decimals)
      const amountInWei = BigInt(Math.floor(tokenAmount * 10**18)).toString();
      
      // Call the mock transaction creation function
      const id = await mockCreateTransaction(
        form.recipientWallet,
        DEFAULT_ASSET_ID,
        amountInWei,
        form.fromCurrency,
        form.toCurrency
      );
      
      setTxId(id);
      nextStep();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Transaction failed";
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };
  
  // Reset form
  const reset = () => {
    setForm(DEFAULT_FORM);
    setStep(1);
    setTxId(null);
    setError(null);
  };
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6 text-center">Cross-Border Payment Demo</h1>
      
      {/* Wallet connection */}
      <div className="mb-6 flex justify-between items-center">
        {wallet ? (
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-blue-500" />
            <div>
              <div className="font-medium">{wallet.substring(0, 6)}...{wallet.substring(wallet.length - 4)}</div>
              <div className="text-sm text-gray-500">Balance: {tokenBalance} RWA</div>
            </div>
          </div>
        ) : (
          <div>Not connected</div>
        )}
        
        {!wallet && (
          <Button onClick={connectWallet} disabled={connecting}>
            {connecting ? (
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
        )}
      </div>
      
      {/* Error messages */}
      {error && (
        <Alert variant="error">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 mt-0.5" />
            <div>
              <div className="font-medium">Error</div>
              <div>{error}</div>
            </div>
          </div>
        </Alert>
      )}
      
      {/* Success step */}
      {step === 3 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <Check className="h-6 w-6 text-green-600" />
              </div>
              <h2 className="mt-4 text-xl font-bold">Payment Successful!</h2>
              <p className="mb-4 mt-2 text-gray-600">
                Your cross-border payment has been sent successfully.
              </p>

              {txId && (
                <div className="mb-6 rounded-md bg-gray-50 p-4 text-center">
                  <p className="text-sm text-gray-500">Transaction ID</p>
                  <p className="font-mono font-medium">#{txId}</p>
                  <Button variant="link" size="sm" className="mt-2">
                    <LinkIcon className="mr-1 h-3 w-3" /> View on Explorer
                  </Button>
                </div>
              )}

              <div className="mt-6">
                <Button onClick={reset}>Send Another Payment</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>
              {step === 1 ? "Payment Details" : "Recipient Information"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {step === 1 ? (
              <>
                {/* Step 1: Payment details */}
                <div className="space-y-4">
                  {/* Amount input */}
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Amount
                    </label>
                    <Input
                      type="number"
                      value={form.amount}
                      onChange={(e) => handleChange("amount", parseFloat(e.target.value) || 0)}
                      min="1"
                    />
                    <div className="mt-1 text-sm text-gray-500 flex justify-between">
                      <div>Fee: {formatCurrency(fee, form.fromCurrency)} (1%)</div>
                      <div>≈ {formatTokenAmount(tokenAmount.toString())} RWA</div>
                    </div>
                  </div>
                  
                  {/* From/To currencies */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        From Currency
                      </label>
                      <Select 
                        value={form.fromCurrency}
                        onValueChange={(value) => handleChange("fromCurrency", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                        <SelectContent>
                          {SUPPORTED_CURRENCIES.map((currency) => (
                            <SelectItem key={currency.value} value={currency.value}>
                              <div className="flex items-center">
                                <span className="mr-2">{currency.flag}</span>
                                <span>{currency.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        To Currency
                      </label>
                      <Select
                        value={form.toCurrency}
                        onValueChange={(value) => handleChange("toCurrency", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                        <SelectContent>
                          {SUPPORTED_CURRENCIES.map((currency) => (
                            <SelectItem key={currency.value} value={currency.value}>
                              <div className="flex items-center">
                                <span className="mr-2">{currency.flag}</span>
                                <span>{currency.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {/* Exchange rate display */}
                  {form.amount > 0 && form.fromCurrency && form.toCurrency && (
                    <div className="rounded-md bg-gray-50 p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-sm text-gray-500">You send</div>
                          <div className="flex items-center gap-1 mt-1">
                            <span className="text-xl">{fromCurrencyDetails?.flag}</span>
                            <span className="text-xl font-bold">
                              {formatCurrency(form.amount, form.fromCurrency)}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {formatTokenAmount(tokenAmount.toString())} RWA
                          </div>
                        </div>
                        
                        <ArrowRightLeft className="h-5 w-5 text-gray-400" />
                        
                        <div className="text-right">
                          <div className="text-sm text-gray-500">Recipient gets</div>
                          <div className="flex items-center gap-1 mt-1 justify-end">
                            <span className="text-xl">{toCurrencyDetails?.flag}</span>
                            <span className="text-xl font-bold text-green-600">
                              {formatCurrency(convertedAmount, form.toCurrency)}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {formatTokenAmount(tokenAmount.toString())} RWA
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-500 mt-3">
                        Exchange Rate: 1 {form.fromCurrency} = {exchangeRate.toFixed(4)} {form.toCurrency}
                      </div>
                    </div>
                  )}
                  
                  {/* Warning if not enough tokens */}
                  {!hasEnoughTokens && form.amount > 0 && (
                    <div className="text-red-600 text-sm">
                      Insufficient tokens. You need {formatTokenAmount(tokenAmount.toString())} RWA for this transaction.
                    </div>
                  )}
                  
                  {/* Next button */}
                  <div className="flex justify-end mt-4">
                    <Button 
                      onClick={nextStep} 
                      disabled={form.amount <= 0 || !wallet || !hasEnoughTokens}
                    >
                      Continue <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Step 2: Recipient information */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Recipient Name
                    </label>
                    <Input
                      value={form.recipientName}
                      onChange={(e) => handleChange("recipientName", e.target.value)}
                      placeholder="Enter recipient's name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Recipient Email
                    </label>
                    <Input
                      type="email"
                      value={form.recipientEmail}
                      onChange={(e) => handleChange("recipientEmail", e.target.value)}
                      placeholder="Enter recipient's email"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Recipient Wallet Address
                    </label>
                    <Input
                      value={form.recipientWallet}
                      onChange={(e) => handleChange("recipientWallet", e.target.value)}
                      placeholder="Enter recipient's wallet address"
                    />
                  </div>
                  
                  {/* Payment summary */}
                  <div className="rounded-md bg-gray-50 p-4 mt-4">
                    <h3 className="font-medium mb-2">Payment Summary</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-gray-500">Amount:</div>
                      <div className="text-right font-medium">
                        {formatCurrency(form.amount, form.fromCurrency)}
                      </div>
                      
                      <div className="text-gray-500">Fee:</div>
                      <div className="text-right">
                        {formatCurrency(fee, form.fromCurrency)}
                      </div>
                      
                      <div className="text-gray-500">Total:</div>
                      <div className="text-right font-medium">
                        {formatCurrency(totalAmount, form.fromCurrency)}
                      </div>
                      
                      <div className="text-gray-500 pt-2">Recipient gets:</div>
                      <div className="text-right font-medium text-green-600 pt-2">
                        {formatCurrency(convertedAmount, form.toCurrency)}
                      </div>
                      
                      <div className="text-gray-500">Token amount:</div>
                      <div className="text-right">
                        {formatTokenAmount(tokenAmount.toString())} RWA
                      </div>
                    </div>
                  </div>
                  
                  {/* Submit button */}
                  <div className="flex justify-end mt-4">
                    <Button
                      onClick={submitPayment}
                      disabled={
                        !form.recipientName || 
                        !form.recipientWallet || 
                        !wallet || 
                        !hasEnoughTokens ||
                        submitting
                      }
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          Complete Payment <Send className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Contract info */}
      <div className="mt-6 text-sm text-gray-500">
        <p>Using RWACrossPay contract at: {RWA_CROSSPAY_ADDRESS}</p>
        <p>Default asset ID: {DEFAULT_ASSET_ID}</p>
      </div>
    </div>
  );
} 