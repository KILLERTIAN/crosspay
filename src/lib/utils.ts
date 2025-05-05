import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "VND" ? 0 : 2,
  }).format(amount)
}

export function calculateFee(amount: number, feePercentage = 0.01): number {
  return amount * feePercentage
}

export const SUPPORTED_CURRENCIES = [
  { value: "USD", label: "USD - US Dollar", flag: "🇺🇸" },
  { value: "EUR", label: "EUR - Euro", flag: "🇪🇺" },
  { value: "GBP", label: "GBP - British Pound", flag: "🇬🇧" },
  { value: "INR", label: "INR - Indian Rupee", flag: "🇮🇳" },
  { value: "MXN", label: "MXN - Mexican Peso", flag: "🇲🇽" },
  { value: "VND", label: "VND - Vietnamese Dong", flag: "🇻🇳" },
  { value: "PHP", label: "PHP - Philippine Peso", flag: "🇵🇭" },
]

// Default exchange rates (fallback if API fails)
export const DEFAULT_EXCHANGE_RATES: Record<string, number> = {
  USD: 1,
  EUR: 0.93,
  GBP: 0.79,
  INR: 83.43,
  MXN: 16.77,
  VND: 25170,
  PHP: 58.23,
}

export function convertCurrency(
  amount: number, 
  fromCurrency: string, 
  toCurrency: string, 
  exchangeRates: Record<string, number> = DEFAULT_EXCHANGE_RATES
): number {
  const fromRate = exchangeRates[fromCurrency]
  const toRate = exchangeRates[toCurrency]
  
  if (!fromRate || !toRate) {
    throw new Error(`Currency conversion not supported for ${fromCurrency} to ${toCurrency}`)
  }
  
  // When using the API, base currency is already factored in, so calculation is simpler
  if (fromCurrency === "USD") {
    // Direct conversion from USD (our base currency in the API)
    return amount * toRate
  } else if (toCurrency === "USD") {
    // Convert to USD
    return amount / fromRate
  } else {
    // Convert via USD
    return (amount / fromRate) * toRate
  }
}

// Format date for the chart
export function formatChartDate(dateStr: string): string {
  const date = new Date(dateStr)
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date)
}

// Calculate percentage change between two values
export function calculatePercentageChange(oldValue: number, newValue: number): number {
  return ((newValue - oldValue) / oldValue) * 100
}

// Format percentage with + or - sign
export function formatPercentage(value: number): string {
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(2)}%`
}

// Find currency details by code
export function getCurrencyByCode(code: string) {
  return SUPPORTED_CURRENCIES.find(currency => currency.value === code)
}
