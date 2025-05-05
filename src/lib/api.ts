import { DEFAULT_EXCHANGE_RATES } from "./utils";

// Function to fetch real exchange rates from ExchangeRate-API
export async function fetchExchangeRates(baseCurrency: string) {
  try {
    // In a real app, you would use your API key
    const response = await fetch(`https://open.er-api.com/v6/latest/${baseCurrency}`);
    const data = await response.json();
    
    // If successful, return the rates
    if (data && data.rates) {
      return data.rates;
    }
    
    // Fallback to default rates if API fails
    return DEFAULT_EXCHANGE_RATES;
  } catch (error) {
    console.error("Error fetching exchange rates:", error);
    return DEFAULT_EXCHANGE_RATES;
  }
}

// Function to fetch crypto rates from CoinGecko
export async function fetchCryptoRates(baseCurrency: string = "usd") {
  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,tether,usd-coin,binancecoin,ripple,cardano,solana&vs_currencies=${baseCurrency}&include_24hr_change=true`
    );
    const data = await response.json();
    
    // Transform the data to a more usable format
    const transformedRates: Record<string, number> = {};
    
    if (data) {
      Object.entries(data).forEach(([crypto, ratesData]) => {
        // Convert crypto names to uppercase tickers
        const cryptoMap: Record<string, string> = {
          'bitcoin': 'BTC',
          'ethereum': 'ETH',
          'tether': 'USDT',
          'usd-coin': 'USDC',
          'binancecoin': 'BNB',
          'ripple': 'XRP',
          'cardano': 'ADA',
          'solana': 'SOL'
        };
        
        const cryptoTicker = cryptoMap[crypto] || crypto.toUpperCase();
        
        // For each crypto, get the rate for the requested base currency
        const rates = ratesData as Record<string, number>;
        const rate = rates[baseCurrency.toLowerCase()];
        
        // Convert rate to base currency per crypto unit (inverse)
        if (rate) {
          transformedRates[cryptoTicker] = 1 / rate;
        }
      });
    }
    
    return transformedRates;
  } catch (error) {
    console.error("Error fetching crypto rates:", error);
    return {};
  }
}

// Function to fetch stablecoin exchange rates
export async function fetchStablecoinRates(baseCurrency: string = "usd") {
  try {
    // For stablecoins, we'll use CoinGecko but filter for just stablecoins
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=tether,usd-coin,dai,binance-usd,true-usd,frax&vs_currencies=${baseCurrency}`
    );
    const data = await response.json();
    
    // Transform the data to a more usable format
    const transformedRates: Record<string, number> = {};
    
    if (data) {
      Object.entries(data).forEach(([stablecoin, ratesData]) => {
        // Convert stablecoin names to uppercase tickers
        const stablecoinMap: Record<string, string> = {
          'tether': 'USDT',
          'usd-coin': 'USDC',
          'dai': 'DAI',
          'binance-usd': 'BUSD',
          'true-usd': 'TUSD',
          'frax': 'FRAX'
        };
        
        const stablecoinTicker = stablecoinMap[stablecoin] || stablecoin.toUpperCase();
        
        // For each stablecoin, get the rate for the requested base currency
        const rates = ratesData as Record<string, number>;
        const rate = rates[baseCurrency.toLowerCase()];
        
        // Convert rate to base currency per stablecoin unit (inverse)
        if (rate) {
          transformedRates[stablecoinTicker] = 1 / rate;
        }
      });
    }
    
    return transformedRates;
  } catch (error) {
    console.error("Error fetching stablecoin rates:", error);
    return {};
  }
}

// Fixed accurate exchange rates for demo purposes (when APIs fail)
export const ACCURATE_EXCHANGE_RATES: Record<string, Record<string, number>> = {
  "USD": {
    "EUR": 0.9298,   // 1 USD = 0.9298 EUR
    "GBP": 0.7971,   // 1 USD = 0.7971 GBP
    "JPY": 157.55,   // 1 USD = 157.55 JPY
    "CAD": 1.3655,   // 1 USD = 1.3655 CAD
    "AUD": 1.5208,   // 1 USD = 1.5208 AUD
    "CNY": 7.2389,   // 1 USD = 7.2389 CNY
    "INR": 83.4795,  // 1 USD = 83.4795 INR
    "PHP": 56.39,    // 1 USD = 56.39 PHP
    "MXN": 16.9215,  // 1 USD = 16.9215 MXN
    "BRL": 5.1129,   // 1 USD = 5.1129 BRL
    "KRW": 1371.75,  // 1 USD = 1371.75 KRW
    "SGD": 1.3596,   // 1 USD = 1.3596 SGD
    "HKD": 7.8122,   // 1 USD = 7.8122 HKD
    "CHF": 0.9082,   // 1 USD = 0.9082 CHF
    "SEK": 10.5892,  // 1 USD = 10.5892 SEK
    "ZAR": 18.9178,  // 1 USD = 18.9178 ZAR
  },
  "EUR": {
    "USD": 1.0758,   // 1 EUR = 1.0758 USD
    "GBP": 0.8573,   // 1 EUR = 0.8573 GBP
    "JPY": 169.63,   // 1 EUR = 169.63 JPY
    "CAD": 1.4689,   // 1 EUR = 1.4689 CAD
    "AUD": 1.6357,   // 1 EUR = 1.6357 AUD
    "CNY": 7.7857,   // 1 EUR = 7.7857 CNY
    "INR": 89.7845,  // 1 EUR = 89.7845 INR
    "PHP": 60.6443,  // 1 EUR = 60.6443 PHP
    "MXN": 18.1986,  // 1 EUR = 18.1986 MXN
    "BRL": 5.5031,   // 1 EUR = 5.5031 BRL
    "KRW": 1475.53,  // 1 EUR = 1475.53 KRW
    "SGD": 1.4624,   // 1 EUR = 1.4624 SGD
    "HKD": 8.3997,   // 1 EUR = 8.3997 HKD
    "CHF": 0.9767,   // 1 EUR = 0.9767 CHF
    "SEK": 11.3893,  // 1 EUR = 11.3893 SEK
    "ZAR": 20.3456,  // 1 EUR = 20.3456 ZAR
  }
};

// Define the type for historical data points
export interface HistoricalRatePoint {
  date: string;
  rate: number;
}

// Generate historical data for demo purposes
export function generateHistoricalRates(baseCurrency: string, targetCurrency: string): HistoricalRatePoint[] {
  const baseRate = ACCURATE_EXCHANGE_RATES[baseCurrency]?.[targetCurrency] || 
                  1 / (ACCURATE_EXCHANGE_RATES[targetCurrency]?.[baseCurrency] || 1.0);
  
  const today = new Date();
  const data: HistoricalRatePoint[] = [];
  
  // Generate data for the past 30 days
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    
    // Create a small random fluctuation around the base rate
    const volatility = 0.005; // 0.5% daily volatility
    const fluctuation = 1 + (Math.random() * 2 - 1) * volatility;
    const rate = baseRate * fluctuation;
    
    data.push({
      date: date.toISOString().split('T')[0],
      rate: parseFloat(rate.toFixed(4)),
    });
  }
  
  return data;
} 