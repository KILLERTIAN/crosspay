import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  SUPPORTED_CURRENCIES,
  DEFAULT_EXCHANGE_RATES,
  formatCurrency,
} from "@/lib/utils";
import { fetchExchangeRates, generateHistoricalRates } from "@/lib/api";
import { RefreshCcw, TrendingUp, BarChart4, DollarSign, ArrowDownUp, ArrowUp, ArrowDown } from "lucide-react";
import { ExchangeRateChart } from "@/components/ui/exchange-rate-chart";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

// Helper to generate random price movement
const generateRandomFluctuation = (baseRate: number, volatility = 0.002) => {
  // Random fluctuation between -volatility and +volatility
  const randomChange = (Math.random() * 2 - 1) * volatility;
  return baseRate * (1 + randomChange);
};

// Types for the LiveRateCard component
interface LiveRateCardProps {
  baseCurrency: string;
  targetCurrency: string;
  rate: number;
  previousRate: number;
  amount: number;
  onClick: () => void;
  currency: {
    flag: string;
    value: string;
    label: string;
  };
}

// Live Rate Card Component with Animations
const LiveRateCard = ({
  baseCurrency,
  targetCurrency,
  rate,
  previousRate,
  amount,
  onClick,
  currency,
}: LiveRateCardProps) => {
  const [currentRate, setCurrentRate] = useState(rate);
  const [prevRate, setPrevRate] = useState(previousRate);
  const [isIncreasing, setIsIncreasing] = useState(false);
  const [isDecreasing, setIsDecreasing] = useState(false);
  const [lastChange, setLastChange] = useState(new Date());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Update the rate with random fluctuations
  useEffect(() => {
    // Update the base rate when prop changes
    setCurrentRate(rate);
    setPrevRate(previousRate);

    // Clear any existing timer when currency or base currency changes
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // Set up periodic rate updates
    timerRef.current = setInterval(() => {
      setPrevRate(currentRate);
      const newRate = generateRandomFluctuation(currentRate);
      setCurrentRate(newRate);
      
      // Set direction for animation
      setIsIncreasing(newRate > currentRate);
      setIsDecreasing(newRate < currentRate);
      setLastChange(new Date());
      
      // Reset direction flags after animation completes
      setTimeout(() => {
        setIsIncreasing(false);
        setIsDecreasing(false);
      }, 1000);
    }, 3000 + Math.random() * 5000); // Random interval between 3-8 seconds

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [baseCurrency, targetCurrency, rate, currentRate, previousRate]);

  // Calculate percent change
  const percentChange = ((currentRate - prevRate) / prevRate) * 100;
  const convertedAmount = amount * currentRate;
  
  // Format time of last update
  const formattedTime = lastChange.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit'
  });
  
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
      layout
    >
      <Card 
        className={`cursor-pointer overflow-hidden transition-colors duration-300 hover:bg-slate-50 ${
          isIncreasing 
            ? 'border-green-400 shadow-green-100' 
            : isDecreasing 
              ? 'border-red-400 shadow-red-100' 
              : ''
        }`}
        onClick={onClick}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <span className="text-2xl mr-2">{currency.flag}</span>
              <div>
                <p className="font-bold text-lg">{targetCurrency}</p>
                <p className="text-xs text-slate-500">{currency.label.split(' - ')[1]}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center justify-end">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={`rate-${currentRate}`}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="font-bold text-lg"
                  >
                    {currentRate.toFixed(4)}
                  </motion.p>
                </AnimatePresence>
                {percentChange !== 0 && (
                  <Badge variant={percentChange > 0 ? "success" : "destructive"} className="ml-2">
                    {percentChange > 0 ? <ArrowUp className="h-3 w-3 mr-1" /> : <ArrowDown className="h-3 w-3 mr-1" />}
                    {Math.abs(percentChange).toFixed(3)}%
                  </Badge>
                )}
              </div>
              <p className="text-xs text-slate-500">
                1 {baseCurrency} = {currentRate.toFixed(4)} {targetCurrency}
              </p>
            </div>
          </div>
          
          <div className="flex justify-between items-end">
            <AnimatePresence mode="wait">
              <motion.div
                key={`amount-${convertedAmount}`}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="text-2xl font-bold"
              >
                {formatCurrency(convertedAmount, targetCurrency)}
              </motion.div>
            </AnimatePresence>
            <div className="flex flex-col items-end">
              <Button variant="ghost" size="sm" className="p-1 h-auto">
                <TrendingUp className="h-4 w-4 mr-1" /> Chart
              </Button>
              <p className="text-xs text-slate-400 mt-1">Updated: {formattedTime}</p>
            </div>
          </div>
          
          {/* Live Pulse Indicator */}
          <div className="mt-3 flex items-center">
            <span className="relative flex h-2 w-2 mr-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-xs text-slate-500">Live</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export function RatesPage() {
  const [amount, setAmount] = useState(1000);
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [selectedTargetCurrency, setSelectedTargetCurrency] = useState<string | null>(null);
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>(DEFAULT_EXCHANGE_RATES);
  const [historicalData, setHistoricalData] = useState(generateHistoricalRates("USD", "EUR"));
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [liveUpdateActive, setLiveUpdateActive] = useState(true);
  const liveUpdateTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Format the current date for display
  const formattedLastUpdated = lastUpdated.toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  // Fetch exchange rates on page load and when base currency changes
  useEffect(() => {
    fetchRates();
  }, [fromCurrency]);

  // Simulate live updates of all exchange rates
  useEffect(() => {
    if (liveUpdateActive) {
      // Update all rates periodically to simulate live market
      liveUpdateTimerRef.current = setInterval(() => {
        setExchangeRates(prevRates => {
          const newRates = { ...prevRates };
          
          // Update each rate with a small random fluctuation
          Object.keys(newRates).forEach(currency => {
            newRates[currency] = generateRandomFluctuation(newRates[currency], 0.0005);
          });
          
          return newRates;
        });
        
        // Also update the last updated timestamp
        setLastUpdated(new Date());
      }, 15000); // Every 15 seconds update base rates
      
      return () => {
        if (liveUpdateTimerRef.current) {
          clearInterval(liveUpdateTimerRef.current);
        }
      };
    }
  }, [liveUpdateActive]);

  // Fetch exchange rates
  const fetchRates = async () => {
    setIsLoading(true);
    try {
      const rates = await fetchExchangeRates(fromCurrency);
      setExchangeRates(rates);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Failed to fetch exchange rates:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle live updates
  const toggleLiveUpdates = () => {
    setLiveUpdateActive(!liveUpdateActive);
  };

  // Handle selecting a currency for detailed view
  const handleSelectCurrency = (currencyCode: string) => {
    setSelectedTargetCurrency(currencyCode);
    setHistoricalData(generateHistoricalRates(fromCurrency, currencyCode));
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      setAmount(value);
    } else {
      setAmount(0);
    }
  };

  const handleFromCurrencyChange = (value: string) => {
    setFromCurrency(value);
    setSelectedTargetCurrency(null);
  };

  // Prepare currency cards
  const currencyCards = SUPPORTED_CURRENCIES
    .filter(c => c.value !== fromCurrency)
    .map(currency => {
      const rate = exchangeRates[currency.value] || DEFAULT_EXCHANGE_RATES[currency.value];
      
      // For demo purposes, we'll use a slightly different rate for the "previous" value
      const previousRate = rate * (1 + (Math.random() * 0.04 - 0.02));
      
      return (
        <LiveRateCard
          key={currency.value}
          baseCurrency={fromCurrency}
          targetCurrency={currency.value}
          rate={rate}
          previousRate={previousRate}
          amount={amount}
          onClick={() => handleSelectCurrency(currency.value)}
          currency={currency}
        />
      );
    });

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto space-y-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h1 className="mb-4 text-4xl font-bold">Live Exchange Rates</h1>
          <p className="text-lg text-slate-600">
            Real-time exchange rates for CrossPay transfers. Our rates are updated continuously and
            typically offer better value than traditional banks.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Currency Converter</CardTitle>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <div className="flex items-center">
                    <RefreshCcw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                    <span>Updated: {formattedLastUpdated}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant={liveUpdateActive ? "default" : "outline"} 
                      size="sm" 
                      onClick={toggleLiveUpdates}
                      className={liveUpdateActive ? "bg-green-600 hover:bg-green-700" : ""}
                    >
                      {liveUpdateActive ? (
                        <>
                          <span className="relative flex h-2 w-2 mr-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                          </span>
                          Live
                        </>
                      ) : "Enable Live"}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={fetchRates} 
                      disabled={isLoading}
                    >
                      Refresh
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="amount" className="block text-sm font-medium">
                    Amount
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <Input
                      id="amount"
                      type="number"
                      min="0"
                      step="1"
                      value={amount}
                      onChange={handleAmountChange}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="fromCurrency" className="block text-sm font-medium">
                    From Currency
                  </label>
                  <Select value={fromCurrency} onValueChange={handleFromCurrencyChange}>
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
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <Tabs defaultValue="cards" className="w-full">
              <div className="mb-4 flex items-center justify-between">
                <TabsList>
                  <TabsTrigger value="cards" className="flex items-center gap-2">
                    <BarChart4 className="h-4 w-4" />
                    <span>Live Cards</span>
                  </TabsTrigger>
                  <TabsTrigger value="list" className="flex items-center gap-2">
                    <ArrowDownUp className="h-4 w-4" />
                    <span>List</span>
                  </TabsTrigger>
                </TabsList>
                <div className="text-sm text-slate-500">
                  Click on a currency to see detailed chart
                </div>
              </div>
              
              <TabsContent value="cards" className="mt-0">
                <motion.div layout className="grid gap-4 sm:grid-cols-2">
                  {currencyCards}
                </motion.div>
              </TabsContent>
              
              <TabsContent value="list" className="mt-0">
                <Card>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="p-4 text-left">Currency</th>
                            <th className="p-4 text-left">Rate</th>
                            <th className="p-4 text-left">Converted Amount</th>
                            <th className="p-4 text-left">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {SUPPORTED_CURRENCIES
                            .filter(c => c.value !== fromCurrency)
                            .map(currency => {
                              const rate = exchangeRates[currency.value] || DEFAULT_EXCHANGE_RATES[currency.value];
                              const convertedAmount = amount * rate;
                              
                              return (
                                <motion.tr 
                                  key={currency.value} 
                                  className="border-b hover:bg-slate-50 cursor-pointer"
                                  whileHover={{ backgroundColor: "#f8fafc" }}
                                  onClick={() => handleSelectCurrency(currency.value)}
                                >
                                  <td className="p-4">
                                    <div className="flex items-center gap-2">
                                      <span className="text-xl">{currency.flag}</span>
                                      <div>
                                        <p className="font-medium">{currency.value}</p>
                                        <p className="text-xs text-slate-500">{currency.label.split(' - ')[1]}</p>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="p-4">
                                    <AnimatePresence mode="wait">
                                      <motion.p 
                                        key={`list-rate-${rate}`}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="font-medium flex items-center"
                                      >
                                        {rate.toFixed(4)}
                                        {liveUpdateActive && (
                                          <span className="relative flex h-2 w-2 ml-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                          </span>
                                        )}
                                      </motion.p>
                                    </AnimatePresence>
                                    <p className="text-xs text-slate-500">
                                      1 {fromCurrency} = {rate.toFixed(4)} {currency.value}
                                    </p>
                                  </td>
                                  <td className="p-4 font-medium">
                                    <AnimatePresence mode="wait">
                                      <motion.div
                                        key={`list-amount-${convertedAmount}`}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                      >
                                        {formatCurrency(convertedAmount, currency.value)}
                                      </motion.div>
                                    </AnimatePresence>
                                  </td>
                                  <td className="p-4">
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleSelectCurrency(currency.value);
                                      }}
                                    >
                                      <TrendingUp className="h-4 w-4 mr-1" /> View Chart
                                    </Button>
                                  </td>
                                </motion.tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="lg:col-span-1"
          >
            {selectedTargetCurrency ? (
              <ExchangeRateChart 
                data={historicalData}
                baseCurrency={fromCurrency}
                targetCurrency={selectedTargetCurrency}
                amount={amount}
              />
            ) : (
              <Card className="flex items-center justify-center h-full bg-slate-50">
                <CardContent className="p-6 text-center">
                  <TrendingUp className="mx-auto mb-4 h-10 w-10 text-slate-400" />
                  <h3 className="mb-2 text-lg font-medium">Select a Currency</h3>
                  <p className="text-sm text-slate-500">
                    Click on any currency card or list item to view detailed historical rates.
                  </p>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card>
            <CardContent className="p-6">
              <h2 className="mb-4 text-xl font-bold">About Our Rates</h2>
              <p className="mb-4 text-slate-600">
                CrossPay offers competitive exchange rates that are typically better than traditional banks
                and remittance services. Our rates are derived from real-time market rates with a minimal
                margin.
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="font-medium">Traditional Bank</span>
                  <span className="text-red-600">3-5% margin on exchange rate</span>
                </div>
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="font-medium">Western Union</span>
                  <span className="text-red-600">3-7% margin on exchange rate</span>
                </div>
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="font-medium">MoneyGram</span>
                  <span className="text-red-600">4-10% margin on exchange rate</span>
                </div>
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="font-medium">CrossPay</span>
                  <span className="text-green-600">&lt;1% margin on exchange rate</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
} 