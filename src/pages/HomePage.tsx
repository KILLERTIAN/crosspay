import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ArrowRight, 
  Banknote, 
  Clock, 
  Globe, 
  ShieldCheck, 
  Zap,
  BarChart4,
  RefreshCw,
  Smartphone,
  DollarSign,
} from "lucide-react";
import { useEffect, useState } from "react";
import { fetchExchangeRates } from "@/lib/api";
import { DEFAULT_EXCHANGE_RATES, formatCurrency, getCurrencyByCode, SUPPORTED_CURRENCIES } from "@/lib/utils";
import { CSSProperties } from "react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import FadeIn from "@/components/ui/FadeIn";

// Reusable component for animating numbers
function AnimatedNumber({ 
  value, 
  duration = 2000, 
  formatter = (val: number) => val.toFixed(0)
}: { 
  value: number; 
  duration?: number; 
  formatter?: (val: number) => string; 
}) {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let startTime: number;
    let animationFrameId: number;
    
    const updateCount = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      
      const progress = timestamp - startTime;
      const progressPercentage = Math.min(progress / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuad = (x: number) => 1 - (1 - x) * (1 - x);
      
      setCount(Math.floor(easeOutQuad(progressPercentage) * value));
      
      if (progressPercentage < 1) {
        animationFrameId = requestAnimationFrame(updateCount);
      } else {
        setCount(value);
      }
    };
    
    animationFrameId = requestAnimationFrame(updateCount);
    
    return () => cancelAnimationFrame(animationFrameId);
  }, [value, duration]);
  
  return <>{formatter(count)}</>;
}

export function HomePage() {
  const [conversionRates, setConversionRates] = useState<Record<string, number>>(DEFAULT_EXCHANGE_RATES);
  const [selectedPair, setSelectedPair] = useState<{ from: string; to: string }>({ from: "USD", to: "MXN" });
  const [amount, setAmount] = useState(1000);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [exampleAmounts, setExampleAmounts] = useState({
    mxn: { convertedAmount: 0, fee: 10, competitorFee: 45, rate: 0, percentChange: 0 },
    inr: { convertedAmount: 0, fee: 10, competitorFee: 40, rate: 0, percentChange: 0 },
    php: { convertedAmount: 0, fee: 10, competitorFee: 55, rate: 0, percentChange: 0 },
    eur: { convertedAmount: 0, fee: 10, competitorFee: 35, rate: 0, percentChange: 0 },
    gbp: { convertedAmount: 0, fee: 10, competitorFee: 35, rate: 0, percentChange: 0 },
    vnd: { convertedAmount: 0, fee: 10, competitorFee: 50, rate: 0, percentChange: 0 },
  });
  
  // Format the current date for display
  const formattedLastUpdated = lastUpdated 
    ? lastUpdated.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;
  
  const fetchRates = async () => {
    setIsLoading(true);
    try {
      const rates = await fetchExchangeRates(selectedPair.from);
      setConversionRates(rates);
      
      // Update example amounts with rate fluctuations
      const exampleBaseAmount = 1000;
      setExampleAmounts({
        mxn: { 
          convertedAmount: exampleBaseAmount * (rates["MXN"] || DEFAULT_EXCHANGE_RATES["MXN"]),
          rate: rates["MXN"] || DEFAULT_EXCHANGE_RATES["MXN"],
          percentChange: -0.87, // For demonstration - in production use real data
          fee: 10,
          competitorFee: 45
        },
        inr: { 
          convertedAmount: exampleBaseAmount * (rates["INR"] || DEFAULT_EXCHANGE_RATES["INR"]),
          rate: rates["INR"] || DEFAULT_EXCHANGE_RATES["INR"],
          percentChange: -1.93, // For demonstration - in production use real data
          fee: 10,
          competitorFee: 40
        },
        php: { 
          convertedAmount: exampleBaseAmount * (rates["PHP"] || DEFAULT_EXCHANGE_RATES["PHP"]),
          rate: rates["PHP"] || DEFAULT_EXCHANGE_RATES["PHP"],
          percentChange: 1.55, // For demonstration - in production use real data
          fee: 10,
          competitorFee: 55
        },
        eur: { 
          convertedAmount: exampleBaseAmount * (rates["EUR"] || DEFAULT_EXCHANGE_RATES["EUR"]),
          rate: rates["EUR"] || DEFAULT_EXCHANGE_RATES["EUR"],
          percentChange: 0.87, // For demonstration - in production use real data
          fee: 10,
          competitorFee: 35
        },
        gbp: { 
          convertedAmount: exampleBaseAmount * (rates["GBP"] || DEFAULT_EXCHANGE_RATES["GBP"]),
          rate: rates["GBP"] || DEFAULT_EXCHANGE_RATES["GBP"],
          percentChange: 0.24, // For demonstration - in production use real data
          fee: 10,
          competitorFee: 35
        },
        vnd: { 
          convertedAmount: exampleBaseAmount * (rates["VND"] || DEFAULT_EXCHANGE_RATES["VND"]),
          rate: rates["VND"] || DEFAULT_EXCHANGE_RATES["VND"],
          percentChange: 1.96, // For demonstration - in production use real data
          fee: 10,
          competitorFee: 50
        }
      });
      
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Failed to fetch exchange rates", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch exchange rates when the component mounts or when the base currency changes
  useEffect(() => {
    fetchRates();
    
    // Set up refresh interval (every 5 minutes)
    const intervalId = setInterval(fetchRates, 5 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, [selectedPair.from]);
  
  // Calculate converted amount for the selected currency pair
  const convertedAmount = amount * (conversionRates[selectedPair.to] || DEFAULT_EXCHANGE_RATES[selectedPair.to]);
  
  // Get currency details for display
  const fromCurrency = getCurrencyByCode(selectedPair.from);
  const toCurrency = getCurrencyByCode(selectedPair.to);
  
  // Handle amount change
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      setAmount(value);
    } else {
      setAmount(0);
    }
  };
  
  // Handle currency changes
  const handleFromCurrencyChange = (value: string) => {
    setSelectedPair(prev => ({ ...prev, from: value }));
  };
  
  const handleToCurrencyChange = (value: string) => {
    setSelectedPair(prev => ({ ...prev, to: value }));
  };
  
  // Animated background style
  const gradientStyle: CSSProperties = {
    background: "linear-gradient(-45deg, #4f46e5, #3b82f6, #60a5fa, #4f46e5)",
    backgroundSize: "400% 400%",
    animation: "gradient 15s ease infinite",
  };

  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <style>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        
        .float {
          animation: float 6s ease-in-out infinite;
        }
        
        .float-delayed {
          animation: float 6s ease-in-out 2s infinite;
        }
      `}</style>
      
      <section style={gradientStyle} className="py-24 text-white">
        <div className="container mx-auto px-4">
          <div className="grid items-center gap-8 md:grid-cols-2">
            <FadeIn direction="right">
              <div className="space-y-8">
                <div>
                  <h1 className="text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
                    Cross-Border Payments Redefined
                  </h1>
                  <p className="mt-6 text-lg text-blue-100 md:text-xl">
                    Send money internationally with near-zero fees, instant settlement, and full
                    regulatory compliance. Powered by RWA-backed tokens and the Pharos Network.
                  </p>
                </div>
                
                <div className="grid gap-4 rounded-xl bg-white/10 p-4 backdrop-blur-sm md:grid-cols-3">
                  <div className="text-center">
                    <div className="text-3xl font-bold">
                      <AnimatedNumber value={1} formatter={() => "<1"} />%
                    </div>
                    <div className="text-sm text-blue-100">Transaction Fee</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold">
                      <AnimatedNumber value={1} formatter={() => "<1"} />s
                    </div>
                    <div className="text-sm text-blue-100">Settlement Time</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold">
                      <AnimatedNumber value={30} />+
                    </div>
                    <div className="text-sm text-blue-100">Countries</div>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-4">
                  <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
                    <Link to="/send-money">Send Money Now</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="border-white text-black">
                    <Link to="/about">How It Works</Link>
                  </Button>
                </div>
              </div>
            </FadeIn>
            
            <div className="relative">
              <div className="float mx-auto w-full max-w-md rounded-2xl bg-white/20 p-6 backdrop-blur-lg">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-lg font-medium">Currency Converter</h3>
                  {lastUpdated && (
                    <div className="flex items-center gap-1 text-xs text-blue-100">
                      <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
                      <span>Updated: {formattedLastUpdated}</span>
                    </div>
                  )}
                </div>
                
                <div className="space-y-4">
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/70" />
                    <Input
                      type="number"
                      min="0"
                      value={amount}
                      onChange={handleAmountChange}
                      className="border-white/30 bg-white/20 pl-10 text-white placeholder:text-white/50"
                      placeholder="Enter amount"
                    />
                  </div>
                
                  <div className="grid grid-cols-3 items-center gap-2">
                    <div className="col-span-1">
                      <Select value={selectedPair.from} onValueChange={handleFromCurrencyChange}>
                        <SelectTrigger className="border-white/30 bg-white/20 text-white">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{fromCurrency?.flag}</span>
                            <span>{selectedPair.from}</span>
                          </div>
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
                    
                    <div className="flex justify-center">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="rounded-full bg-white/20 text-white hover:bg-white/30 hover:text-white"
                        onClick={fetchRates}
                        disabled={isLoading}
                      >
                        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                        <span className="sr-only">Refresh rates</span>
                      </Button>
                    </div>
                    
                    <div className="col-span-1">
                      <Select value={selectedPair.to} onValueChange={handleToCurrencyChange}>
                        <SelectTrigger className="border-white/30 bg-white/20 text-white">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{toCurrency?.flag}</span>
                            <span>{selectedPair.to}</span>
                          </div>
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
                  
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs">You Send</p>
                      <p className="text-2xl font-bold">{formatCurrency(amount, selectedPair.from)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs">Recipient Gets</p>
                      <p className="text-2xl font-bold">
                        {formatCurrency(convertedAmount, selectedPair.to)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-2 text-center text-xs text-blue-100">
                    1 {selectedPair.from} = {(conversionRates[selectedPair.to] || DEFAULT_EXCHANGE_RATES[selectedPair.to]).toFixed(4)} {selectedPair.to}
                  </div>
                  
                  <Button asChild className="mt-2 w-full bg-white text-blue-600">
                    <Link to="/send-money">
                      Start Transfer <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
              
              <div className="float-delayed absolute -bottom-6 -right-6 rounded-xl bg-white/10 p-4 backdrop-blur-sm md:right-12">
                <div className="flex items-center gap-3">
                  <Zap className="h-10 w-10 text-yellow-300" />
                  <div>
                    <p className="text-sm font-medium">Instant Transfer</p>
                    <p className="text-xs text-blue-100">Settlement in &lt;1 second</p>
                  </div>
                </div>
              </div>
              
              <div className="float absolute -left-2 -top-10 rounded-xl bg-white/10 p-4 backdrop-blur-sm md:left-0">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-10 w-10 text-green-300" />
                  <div>
                    <p className="text-sm font-medium">Fully Compliant</p>
                    <p className="text-xs text-blue-100">Meets all regulations</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Exchange Rates Section */}
      <section className="bg-slate-50 py-16">
        <div className="container mx-auto px-4">
          <FadeIn direction="up">
            <div className="mx-auto mb-8 max-w-2xl text-center">
              <h2 className="mb-3 text-2xl font-bold md:text-3xl lg:text-4xl">Live Exchange Rates</h2>
              <p className="text-base md:text-lg text-slate-600">
                See real-time rates for popular currencies across the globe
              </p>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs md:text-sm text-slate-500">
                <RefreshCw className={`h-3 w-3 md:h-4 md:w-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Rates {lastUpdated ? `updated ${formattedLastUpdated}` : 'updating...'}</span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={fetchRates} 
                  disabled={isLoading}
                  className="h-7 rounded-full px-3 text-xs"
                >
                  Refresh Rates
                </Button>
              </div>
            </div>
          </FadeIn>
          
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3">
            {/* Euro Card */}
            <FadeIn direction="up" delay={0.1}>
              <Card className="overflow-hidden transition-all duration-300 hover:shadow-md hover:scale-[1.02] hover:bg-slate-50 cursor-pointer h-[230px] flex flex-col w-full">
                <div className="flex items-center justify-between p-3 md:p-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl md:text-2xl font-bold">EU</span>
                      <div>
                        <p className="font-medium text-sm md:text-base">Euro</p>
                        <p className="text-xs text-slate-500">EUR</p>
                      </div>
                    </div>
                  </div>
                  <div className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                    exampleAmounts.eur.percentChange >= 0
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}>
                    {exampleAmounts.eur.percentChange >= 0 ? (
                      <ArrowRight className="h-3 w-3 rotate-45" />
                    ) : (
                      <ArrowRight className="h-3 w-3 -rotate-45" />
                    )}
                    {exampleAmounts.eur.percentChange >= 0 ? "+" : ""}{exampleAmounts.eur.percentChange.toFixed(2)}%
                  </div>
                </div>
                <div className="border-t p-3 md:p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-xs md:text-sm text-slate-600">
                      <span className="text-xs">US</span>
                      <span>$1,000.00</span>
                      <ArrowRight className="h-3 w-3" />
                      <span className="text-xs">EU</span>
                    </div>
                    <div className="mt-1 md:mt-2">
                      <p className="text-xl md:text-2xl font-bold">€{exampleAmounts.eur.convertedAmount.toFixed(2)}</p>
                    </div>
                    <div className="mt-1 md:mt-2 text-xs text-slate-500">
                      1 USD = {exampleAmounts.eur.rate.toFixed(4)} EUR
                    </div>
                  </div>
                  
                  {/* Live Pulse Indicator */}
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="relative flex h-2 w-2 mr-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                      </span>
                      <span className="text-xs text-slate-500">Live</span>
                    </div>
                    <span className="text-xs text-slate-400">Updated: {formattedLastUpdated}</span>
                  </div>
                </div>
              </Card>
            </FadeIn>

            {/* British Pound Card */}
            <FadeIn direction="up" delay={0.2}>
              <Card className="overflow-hidden transition-all duration-300 hover:shadow-md hover:scale-[1.02] hover:bg-slate-50 cursor-pointer h-[230px] flex flex-col w-full">
                <div className="flex items-center justify-between p-3 md:p-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl md:text-2xl font-bold">GB</span>
                      <div>
                        <p className="font-medium text-sm md:text-base">British Pound</p>
                        <p className="text-xs text-slate-500">GBP</p>
                      </div>
                    </div>
                  </div>
                  <div className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                    exampleAmounts.gbp.percentChange >= 0
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}>
                    {exampleAmounts.gbp.percentChange >= 0 ? (
                      <ArrowRight className="h-3 w-3 rotate-45" />
                    ) : (
                      <ArrowRight className="h-3 w-3 -rotate-45" />
                    )}
                    {exampleAmounts.gbp.percentChange >= 0 ? "+" : ""}{exampleAmounts.gbp.percentChange.toFixed(2)}%
                  </div>
                </div>
                <div className="border-t p-3 md:p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-xs md:text-sm text-slate-600">
                      <span className="text-xs">US</span>
                      <span>$1,000.00</span>
                      <ArrowRight className="h-3 w-3" />
                      <span className="text-xs">GB</span>
                    </div>
                    <div className="mt-1 md:mt-2">
                      <p className="text-xl md:text-2xl font-bold">£{exampleAmounts.gbp.convertedAmount.toFixed(2)}</p>
                    </div>
                    <div className="mt-1 md:mt-2 text-xs text-slate-500">
                      1 USD = {exampleAmounts.gbp.rate.toFixed(4)} GBP
                    </div>
                  </div>
                  
                  {/* Live Pulse Indicator */}
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="relative flex h-2 w-2 mr-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                      </span>
                      <span className="text-xs text-slate-500">Live</span>
                    </div>
                    <span className="text-xs text-slate-400">Updated: {formattedLastUpdated}</span>
                  </div>
                </div>
              </Card>
            </FadeIn>

            {/* Indian Rupee Card */}
            <FadeIn direction="up" delay={0.3}>
              <Card className="overflow-hidden transition-all duration-300 hover:shadow-md hover:scale-[1.02] hover:bg-slate-50 cursor-pointer h-[230px] flex flex-col w-full">
                <div className="flex items-center justify-between p-3 md:p-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl md:text-2xl font-bold">IN</span>
                      <div>
                        <p className="font-medium text-sm md:text-base">Indian Rupee</p>
                        <p className="text-xs text-slate-500">INR</p>
                      </div>
                    </div>
                  </div>
                  <div className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                    exampleAmounts.inr.percentChange >= 0
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}>
                    {exampleAmounts.inr.percentChange >= 0 ? (
                      <ArrowRight className="h-3 w-3 rotate-45" />
                    ) : (
                      <ArrowRight className="h-3 w-3 -rotate-45" />
                    )}
                    {exampleAmounts.inr.percentChange >= 0 ? "+" : ""}{exampleAmounts.inr.percentChange.toFixed(2)}%
                  </div>
                </div>
                <div className="border-t p-3 md:p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-xs md:text-sm text-slate-600">
                      <span className="text-xs">US</span>
                      <span>$1,000.00</span>
                      <ArrowRight className="h-3 w-3" />
                      <span className="text-xs">IN</span>
                    </div>
                    <div className="mt-1 md:mt-2">
                      <p className="text-xl md:text-2xl font-bold">₹{exampleAmounts.inr.convertedAmount.toFixed(2)}</p>
                    </div>
                    <div className="mt-1 md:mt-2 text-xs text-slate-500">
                      1 USD = {exampleAmounts.inr.rate.toFixed(4)} INR
                    </div>
                  </div>
                  
                  {/* Live Pulse Indicator */}
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="relative flex h-2 w-2 mr-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                      </span>
                      <span className="text-xs text-slate-500">Live</span>
                    </div>
                    <span className="text-xs text-slate-400">Updated: {formattedLastUpdated}</span>
                  </div>
                </div>
              </Card>
            </FadeIn>

            {/* Mexican Peso Card */}
            <FadeIn direction="up" delay={0.4}>
              <Card className="overflow-hidden transition-all duration-300 hover:shadow-md hover:scale-[1.02] hover:bg-slate-50 cursor-pointer h-[230px] flex flex-col w-full">
                <div className="flex items-center justify-between p-3 md:p-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl md:text-2xl font-bold">MX</span>
                      <div>
                        <p className="font-medium text-sm md:text-base">Mexican Peso</p>
                        <p className="text-xs text-slate-500">MXN</p>
                      </div>
                    </div>
                  </div>
                  <div className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                    exampleAmounts.mxn.percentChange >= 0
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}>
                    {exampleAmounts.mxn.percentChange >= 0 ? (
                      <ArrowRight className="h-3 w-3 rotate-45" />
                    ) : (
                      <ArrowRight className="h-3 w-3 -rotate-45" />
                    )}
                    {exampleAmounts.mxn.percentChange >= 0 ? "+" : ""}{exampleAmounts.mxn.percentChange.toFixed(2)}%
                  </div>
                </div>
                <div className="border-t p-3 md:p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-xs md:text-sm text-slate-600">
                      <span className="text-xs">US</span>
                      <span>$1,000.00</span>
                      <ArrowRight className="h-3 w-3" />
                      <span className="text-xs">MX</span>
                    </div>
                    <div className="mt-1 md:mt-2">
                      <p className="text-xl md:text-2xl font-bold">MX${exampleAmounts.mxn.convertedAmount.toFixed(2)}</p>
                    </div>
                    <div className="mt-1 md:mt-2 text-xs text-slate-500">
                      1 USD = {exampleAmounts.mxn.rate.toFixed(4)} MXN
                    </div>
                  </div>
                  
                  {/* Live Pulse Indicator */}
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="relative flex h-2 w-2 mr-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                      </span>
                      <span className="text-xs text-slate-500">Live</span>
                    </div>
                    <span className="text-xs text-slate-400">Updated: {formattedLastUpdated}</span>
                  </div>
                </div>
              </Card>
            </FadeIn>

            {/* Vietnamese Dong Card */}
            <FadeIn direction="up" delay={0.5}>
              <Card className="overflow-hidden transition-all duration-300 hover:shadow-md hover:scale-[1.02] hover:bg-slate-50 cursor-pointer h-[230px] flex flex-col w-full">
                <div className="flex items-center justify-between p-3 md:p-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl md:text-2xl font-bold">VN</span>
                      <div>
                        <p className="font-medium text-sm md:text-base">Vietnamese Dong</p>
                        <p className="text-xs text-slate-500">VND</p>
                      </div>
                    </div>
                  </div>
                  <div className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                    exampleAmounts.vnd.percentChange >= 0
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}>
                    {exampleAmounts.vnd.percentChange >= 0 ? (
                      <ArrowRight className="h-3 w-3 rotate-45" />
                    ) : (
                      <ArrowRight className="h-3 w-3 -rotate-45" />
                    )}
                    {exampleAmounts.vnd.percentChange >= 0 ? "+" : ""}{exampleAmounts.vnd.percentChange.toFixed(2)}%
                  </div>
                </div>
                <div className="border-t p-3 md:p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-xs md:text-sm text-slate-600">
                      <span className="text-xs">US</span>
                      <span>$1,000.00</span>
                      <ArrowRight className="h-3 w-3" />
                      <span className="text-xs">VN</span>
                    </div>
                    <div className="mt-1 md:mt-2">
                      <p className="text-xl md:text-2xl font-bold">₫{exampleAmounts.vnd.convertedAmount.toFixed(0)}</p>
                    </div>
                    <div className="mt-1 md:mt-2 text-xs text-slate-500">
                      1 USD = {exampleAmounts.vnd.rate.toFixed(4)} VND
                    </div>
                  </div>
                  
                  {/* Live Pulse Indicator */}
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="relative flex h-2 w-2 mr-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                      </span>
                      <span className="text-xs text-slate-500">Live</span>
                    </div>
                    <span className="text-xs text-slate-400">Updated: {formattedLastUpdated}</span>
                  </div>
                </div>
              </Card>
            </FadeIn>

            {/* Philippine Peso Card */}
            <FadeIn direction="up" delay={0.6}>
              <Card className="overflow-hidden transition-all duration-300 hover:shadow-md hover:scale-[1.02] hover:bg-slate-50 cursor-pointer h-[230px] flex flex-col w-full">
                <div className="flex items-center justify-between p-3 md:p-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl md:text-2xl font-bold">PH</span>
                      <div>
                        <p className="font-medium text-sm md:text-base">Philippine Peso</p>
                        <p className="text-xs text-slate-500">PHP</p>
                      </div>
                    </div>
                  </div>
                  <div className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                    exampleAmounts.php.percentChange >= 0
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}>
                    {exampleAmounts.php.percentChange >= 0 ? (
                      <ArrowRight className="h-3 w-3 rotate-45" />
                    ) : (
                      <ArrowRight className="h-3 w-3 -rotate-45" />
                    )}
                    {exampleAmounts.php.percentChange >= 0 ? "+" : ""}{exampleAmounts.php.percentChange.toFixed(2)}%
                  </div>
                </div>
                <div className="border-t p-3 md:p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-xs md:text-sm text-slate-600">
                      <span className="text-xs">US</span>
                      <span>$1,000.00</span>
                      <ArrowRight className="h-3 w-3" />
                      <span className="text-xs">PH</span>
                    </div>
                    <div className="mt-1 md:mt-2">
                      <p className="text-xl md:text-2xl font-bold">₱{exampleAmounts.php.convertedAmount.toFixed(2)}</p>
                    </div>
                    <div className="mt-1 md:mt-2 text-xs text-slate-500">
                      1 USD = {exampleAmounts.php.rate.toFixed(4)} PHP
                    </div>
                  </div>
                  
                  {/* Live Pulse Indicator */}
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="relative flex h-2 w-2 mr-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                      </span>
                      <span className="text-xs text-slate-500">Live</span>
                    </div>
                    <span className="text-xs text-slate-400">Updated: {formattedLastUpdated}</span>
                  </div>
                </div>
              </Card>
            </FadeIn>
          </div>
          
          <div className="mt-8 text-center">
            <FadeIn>
              <Button asChild className="bg-indigo-600 hover:bg-indigo-700 shadow-md transition-all hover:shadow-lg">
                <Link to="/rates" className="flex items-center gap-2">
                  <span>View All Exchange Rates</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <FadeIn direction="up">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <h2 className="mb-4 text-3xl font-bold md:text-4xl">Why Choose CrossPay?</h2>
              <p className="text-lg text-slate-600">
                Our next-generation protocol outperforms traditional remittance systems in every way
                that matters.
              </p>
            </div>
          </FadeIn>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <FadeIn direction="up" delay={0.1}>
              <Card>
                <CardContent className="flex flex-col items-center p-6 text-center">
                  <div className="mb-4 rounded-full bg-blue-100 p-3">
                    <Zap className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="mb-2 text-xl font-medium">Instant Settlement</h3>
                  <p className="text-slate-600">
                    Transactions settle in under 1 second, compared to 1-5 days with traditional banks.
                  </p>
                </CardContent>
              </Card>
            </FadeIn>

            <FadeIn direction="up" delay={0.2}>
              <Card>
                <CardContent className="flex flex-col items-center p-6 text-center">
                  <div className="mb-4 rounded-full bg-green-100 p-3">
                    <Banknote className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="mb-2 text-xl font-medium">Near-Zero Fees</h3>
                  <p className="text-slate-600">
                    Pay just 1% in fees, compared to 3-10% with traditional remittance services.
                  </p>
                </CardContent>
              </Card>
            </FadeIn>

            <FadeIn direction="up" delay={0.3}>
              <Card>
                <CardContent className="flex flex-col items-center p-6 text-center">
                  <div className="mb-4 rounded-full bg-purple-100 p-3">
                    <ShieldCheck className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="mb-2 text-xl font-medium">Fully Compliant</h3>
                  <p className="text-slate-600">
                    Our system integrates with local payment rails and follows all regional regulations.
                  </p>
                </CardContent>
              </Card>
            </FadeIn>

            <FadeIn direction="up" delay={0.4}>
              <Card>
                <CardContent className="flex flex-col items-center p-6 text-center">
                  <div className="mb-4 rounded-full bg-yellow-100 p-3">
                    <Globe className="h-6 w-6 text-yellow-600" />
                  </div>
                  <h3 className="mb-2 text-xl font-medium">Global Coverage</h3>
                  <p className="text-slate-600">
                    Send money to over 30 countries with more being added every month.
                  </p>
                </CardContent>
              </Card>
            </FadeIn>

            <FadeIn direction="up" delay={0.5}>
              <Card>
                <CardContent className="flex flex-col items-center p-6 text-center">
                  <div className="mb-4 rounded-full bg-red-100 p-3">
                    <Clock className="h-6 w-6 text-red-600" />
                  </div>
                  <h3 className="mb-2 text-xl font-medium">24/7 Availability</h3>
                  <p className="text-slate-600">
                    Send money any time, day or night, weekends and holidays included.
                  </p>
                </CardContent>
              </Card>
            </FadeIn>

            <FadeIn direction="up" delay={0.6}>
              <Card>
                <CardContent className="flex flex-col items-center p-6 text-center">
                  <div className="mb-4 rounded-full bg-indigo-100 p-3">
                    <BarChart4 className="h-6 w-6 text-indigo-600" />
                  </div>
                  <h3 className="mb-2 text-xl font-medium">Price Stability</h3>
                  <p className="text-slate-600">
                    RWA-backed tokens eliminate crypto price volatility for reliable transfers.
                  </p>
                </CardContent>
              </Card>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Mobile App Section */}
      <section className="bg-gradient-to-r from-indigo-500 via-indigo-600 to-blue-600 py-20 text-white">
        <div className="container mx-auto px-4">
          <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center px-4 py-16">
            <FadeIn direction="right" delay={0.1}>
              <div className="order-2 md:order-1 flex justify-center md:justify-start relative">
                <div className="relative w-[300px] h-[620px] rounded-[40px] bg-gradient-to-b from-indigo-800 to-indigo-950 p-4 shadow-2xl overflow-hidden border-4 border-indigo-700/30">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-700/20 via-transparent to-indigo-600/30"></div>
                  
                  {/* iPhone notch */}
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[120px] h-[28px] bg-black rounded-b-2xl z-10 flex items-center justify-center">
                    <div className="w-[60px] h-[6px] bg-indigo-900 rounded-full"></div>
                  </div>
                  
                  <div className="relative h-full w-full rounded-[32px] bg-indigo-900 overflow-hidden">
                    <div className="relative h-full w-full overflow-auto scrollbar-hide pb-20">
                      {/* App content */}
                      <div className="relative h-full">
                        {/* App background with animated gradient */}
                        <div className="absolute inset-0 bg-gradient-to-b from-indigo-700 to-indigo-950 overflow-hidden">
                          <div className="absolute inset-0 opacity-20">
                            <div className="absolute top-0 -left-[100px] right-0 h-[500px] w-[500px] rounded-full bg-indigo-400 filter blur-3xl animate-pulse" style={{ animationDuration: '8s' }}></div>
                            <div className="absolute bottom-0 -right-[100px] h-[500px] w-[500px] rounded-full bg-blue-400 filter blur-3xl animate-pulse" style={{ animationDuration: '10s' }}></div>
                          </div>
                        </div>
                        
                        {/* App header */}
                        <div className="pt-10 px-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="text-[14px] font-bold text-white">CrossPay</h4>
                              <p className="text-[10px] text-blue-100">Welcome back, Alex</p>
                            </div>
                            <div className="h-8 w-8 rounded-full bg-white/20 p-1.5">
                              <div className="h-full w-full rounded-full bg-indigo-100 text-center text-[12px] font-bold text-indigo-600 leading-5">A</div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Balance Card */}
                        <div className="mt-6 px-4">
                          <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm shadow-lg border border-white/10">
                            <p className="text-[10px] text-blue-100">Available Balance</p>
                            <p className="text-2xl font-bold text-white">$2,458.50</p>
                            <div className="mt-3 grid grid-cols-2 gap-2">
                              <button className="rounded-lg bg-white/20 py-2 text-[11px] font-medium text-white hover:bg-white/30 transition-colors">Add Money</button>
                              <button className="rounded-lg bg-white py-2 text-[11px] font-medium text-indigo-600 hover:bg-blue-50 transition-colors">Send Money</button>
                            </div>
                          </div>
                        </div>
                        
                        {/* Quick Actions */}
                        <div className="mt-6 px-4">
                          <p className="mb-3 text-[12px] font-medium text-white">Quick Actions</p>
                          <div className="grid grid-cols-4 gap-2">
                            <div className="flex flex-col items-center">
                              <div className="rounded-full bg-white/20 p-2 hover:bg-white/30 transition-all duration-300 transform hover:scale-110">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M9 13L15 7M9 17H14M9 17V12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  <path d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z" stroke="white" strokeWidth="2"/>
                                </svg>
                              </div>
                              <p className="mt-1 text-[8px] font-medium text-white">Send</p>
                            </div>
                            <div className="flex flex-col items-center">
                              <div className="rounded-full bg-white/20 p-2 hover:bg-white/30 transition-all duration-300 transform hover:scale-110">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M15 11L9 17M15 7H10M15 7V12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  <path d="M12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3Z" stroke="white" strokeWidth="2"/>
                                </svg>
                              </div>
                              <p className="mt-1 text-[8px] font-medium text-white">Receive</p>
                            </div>
                            <div className="flex flex-col items-center">
                              <div className="rounded-full bg-white/20 p-2 hover:bg-white/30 transition-all duration-300 transform hover:scale-110">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M16 8V5L19 8M19 8L16 11M19 8H13.5C10.4624 8 8 10.4624 8 13.5V13.5C8 16.5376 10.4624 19 13.5 19H15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              </div>
                              <p className="mt-1 text-[8px] font-medium text-white">Transfer</p>
                            </div>
                            <div className="flex flex-col items-center">
                              <div className="rounded-full bg-white/20 p-2 hover:bg-white/30 transition-all duration-300 transform hover:scale-110">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M9 12H15M12 9V15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              </div>
                              <p className="mt-1 text-[8px] font-medium text-white">More</p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Recent Transactions */}
                        <div className="mt-6 px-4">
                          <p className="mb-3 text-[12px] font-medium text-white">Recent Transactions</p>
                          <div className="rounded-xl bg-white/10 p-2 backdrop-blur-sm border border-white/10">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between rounded-lg p-2 hover:bg-white/5 transition-colors">
                                <div className="flex items-center gap-2">
                                  <div className="h-8 w-8 rounded-full bg-green-400/20 p-2">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                      <path d="M15 11L9 17M9 17H14M9 17V12" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                      <path d="M12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3Z" stroke="#4ade80" strokeWidth="2"/>
                                    </svg>
                                  </div>
                                  <div>
                                    <p className="text-[11px] font-medium text-white">Received</p>
                                    <p className="text-[9px] text-blue-100">From Maria C.</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-[11px] font-medium text-green-400">+$850.00</p>
                                  <p className="text-[8px] text-blue-100">Today</p>
                                </div>
                              </div>
                              
                              <div className="flex items-center justify-between rounded-lg p-2 hover:bg-white/5 transition-colors">
                                <div className="flex items-center gap-2">
                                  <div className="h-8 w-8 rounded-full bg-red-400/20 p-2">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                      <path d="M9 13L15 7M15 7H10M15 7V12" stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                      <path d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z" stroke="#f87171" strokeWidth="2"/>
                                    </svg>
                                  </div>
                                  <div>
                                    <p className="text-[11px] font-medium text-white">Sent Money</p>
                                    <p className="text-[9px] text-blue-100">To Carlos P.</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-[11px] font-medium text-red-400">-$320.50</p>
                                  <p className="text-[8px] text-blue-100">Yesterday</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Bottom Navigation */}
                        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-around rounded-t-3xl bg-white/10 p-3 backdrop-blur-md border-t border-white/10">
                          <div className="flex flex-col items-center">
                            <div className="rounded-full bg-white/20 p-1.5">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M3 12L5 10M5 10L12 3L19 10M5 10V20C5 20.5523 5.44772 21 6 21H9M19 10L21 12M19 10V20C19 20.5523 18.5523 21 18 21H15M9 21C9.55228 21 10 20.5523 10 20V16C10 15.4477 10.4477 15 11 15H13C13.5523 15 14 15.4477 14 16V20C14 20.5523 14.4477 21 15 21M9 21H15" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </div>
                            <p className="mt-1 text-[8px] font-medium text-white">Home</p>
                          </div>
                          <div className="flex flex-col items-center">
                            <div className="rounded-full bg-transparent p-1.5">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M21 7.5V6.75C21 5.50736 19.9926 4.5 18.75 4.5H5.25C4.00736 4.5 3 5.50736 3 6.75V17.25C3 18.4926 4.00736 19.5 5.25 19.5H18.75C19.9926 19.5 21 18.4926 21 17.25V16.5M12 15L16.5 15M12 10.5H16.5M8.25 8.25H5.25V11.25H8.25V8.25ZM8.25 15H5.25V18H8.25V15Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </div>
                            <p className="mt-1 text-[8px] font-medium text-white/60">Activity</p>
                          </div>
                          <div className="flex flex-col items-center">
                            <div className="rounded-full bg-transparent p-1.5">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M16.5 10.5V6.75C16.5 4.26472 14.4853 2.25 12 2.25C9.51472 2.25 7.5 4.26472 7.5 6.75V10.5M6.75 21.75H17.25C18.4926 21.75 19.5 20.7426 19.5 19.5V12.75C19.5 11.5074 18.4926 10.5 17.25 10.5H6.75C5.50736 10.5 4.5 11.5074 4.5 12.75V19.5C4.5 20.7426 5.50736 21.75 6.75 21.75Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </div>
                            <p className="mt-1 text-[8px] font-medium text-white/60">Security</p>
                          </div>
                          <div className="flex flex-col items-center">
                            <div className="rounded-full bg-transparent p-1.5">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M15.75 6C15.75 8.07107 14.0711 9.75 12 9.75C9.92893 9.75 8.25 8.07107 8.25 6C8.25 3.92893 9.92893 2.25 12 2.25C14.0711 2.25 15.75 3.92893 15.75 6ZM4.5 20.25C4.5 16.6675 7.41751 13.75 11 13.75H13C16.5825 13.75 19.5 16.6675 19.5 20.25C19.5 20.6642 19.1642 21 18.75 21H5.25C4.83579 21 4.5 20.6642 4.5 20.25Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </div>
                            <p className="mt-1 text-[8px] font-medium text-white/60">Profile</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Decorative elements */}
                  <div className="absolute -left-6 -top-6 h-32 w-32 rounded-full bg-blue-300/30 blur-2xl"></div>
                  <div className="absolute -bottom-10 -right-10 h-48 w-48 rounded-full bg-indigo-300/30 blur-3xl"></div>
                </div>
              </div>
            </FadeIn>
            
            <FadeIn direction="left" delay={0.2}>
              <div className="order-1 md:order-2">
                <h2 className="mb-6 text-2xl md:text-3xl font-bold lg:text-4xl">CrossPay Mobile App</h2>
                <p className="mb-6 text-base md:text-lg text-blue-100">
                  Send money globally with just a few taps. Our mobile app brings the power of CrossPay right to your fingertips.
                </p>
                
                <div className="space-y-5 mt-6 md:mt-8">
                  <FadeIn direction="left" delay={0.3}>
                    <div className="flex items-start gap-4">
                      <div className="rounded-full bg-white/20 p-3 shadow-lg border border-white/10 transform transition-all duration-300 hover:scale-110">
                        <Smartphone className="h-5 w-5 md:h-6 md:w-6" />
                      </div>
                      <div>
                        <h3 className="text-lg md:text-xl font-medium">Instant Transfers</h3>
                        <p className="text-sm md:text-base text-blue-100">
                          Send money across borders in seconds, not days. Our blockchain technology ensures near-instant settlement.
                        </p>
                      </div>
                    </div>
                  </FadeIn>
                  
                  <FadeIn direction="left" delay={0.4}>
                    <div className="flex items-start gap-4">
                      <div className="rounded-full bg-white/20 p-3 shadow-lg border border-white/10 transform transition-all duration-300 hover:scale-110">
                        <ShieldCheck className="h-5 w-5 md:h-6 md:w-6" />
                      </div>
                      <div>
                        <h3 className="text-lg md:text-xl font-medium">Bank-Level Security</h3>
                        <p className="text-sm md:text-base text-blue-100">
                          Advanced encryption and multi-factor authentication keep your money and personal information safe.
                        </p>
                      </div>
                    </div>
                  </FadeIn>
                  
                  <FadeIn direction="left" delay={0.5}>
                    <div className="flex items-start gap-4">
                      <div className="rounded-full bg-white/20 p-3 shadow-lg border border-white/10 transform transition-all duration-300 hover:scale-110">
                        <BarChart4 className="h-5 w-5 md:h-6 md:w-6" />
                      </div>
                      <div>
                        <h3 className="text-lg md:text-xl font-medium">Track All Activity</h3>
                        <p className="text-sm md:text-base text-blue-100">
                          Monitor your transfers in real-time with detailed transaction history and instant notifications.
                        </p>
                      </div>
                    </div>
                  </FadeIn>
                </div>
                
                <FadeIn delay={0.6}>
                  <div className="mt-8 md:mt-10 flex flex-wrap items-center gap-4">
                    <Button className="bg-white text-indigo-600 hover:bg-blue-50 shadow-lg transform transition-all duration-300 hover:translate-y-[-2px]">
                      <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12.8496 7.58906C13.3516 7.00781 14.1406 6.5625 14.8828 6.49219C14.9297 7.28906 14.6602 8.08594 14.1699 8.6875C13.6563 9.30469 12.9141 9.72656 12.1016 9.65625C12.0313 8.88281 12.3477 8.08594 12.8496 7.58906ZM14.8008 9.89844C15.9375 9.89844 16.8438 10.543 17.4141 11.0918C17.1211 11.2793 16.125 11.8496 16.1367 13.1367C16.1367 14.6426 17.3789 15.1445 17.4023 15.1562C17.3789 15.2148 17.1445 16.0156 16.5273 16.8281C16.0488 17.4688 15.5352 18.1094 14.707 18.1094C13.9258 18.1094 13.6797 17.6895 12.7734 17.6895C11.9102 17.6895 11.5234 18.1211 10.8125 18.1211C10.0312 18.1211 9.47266 17.4453 8.95312 16.8164C8.30078 16.0352 7.77344 14.8398 7.77344 13.7031C7.77344 11.8379 9.02344 10.8379 10.2266 10.8379C11.0195 10.8379 11.6719 11.3047 12.1504 11.3047C12.6055 11.3047 13.3594 10.8027 14.2891 10.8027C14.4648 10.8027 14.6406 10.8262 14.8008 10.8379V9.89844ZM20.4375 7.21094V16.7812C20.4375 18.3105 19.1855 19.5625 17.6562 19.5625H6.34375C4.81445 19.5625 3.5625 18.3105 3.5625 16.7812V7.21094C3.5625 5.69336 4.81445 4.44141 6.34375 4.44141H17.6562C19.1855 4.44141 20.4375 5.69336 20.4375 7.21094Z" fill="#4338ca"/>
                      </svg>
                      App Store
                    </Button>
                    <Button className="bg-white text-indigo-600 hover:bg-blue-50 shadow-lg transform transition-all duration-300 hover:translate-y-[-2px]">
                      <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12.0598 3.16406L18.158 12.1758C18.1814 12.2109 18.158 12.2461 18.1111 12.2461H15.9814L19.0246 16.8867C19.7587 17.9414 18.9775 19.2988 17.7236 19.2988H6.16333C5.19458 19.2988 4.6459 18.1973 5.19458 17.3691L11.9072 6.9375C11.9541 6.86719 12.0129 6.86719 12.0598 6.9375V3.16406ZM12.0598 3.16406C12.0598 3.16406 5.60083 12.9453 5.57739 12.9805M12.0246 16.125L15.3408 12.2461H12.0246V16.125Z" fill="#4338ca"/>
                      </svg>
                      Google Play
                    </Button>
                    <span className="text-sm text-blue-100 animate-pulse">Coming Soon!</span>
                  </div>
                </FadeIn>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-slate-50 py-16">
        <div className="container mx-auto px-4">
          <FadeIn direction="up">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="mb-4 text-3xl font-bold md:text-4xl">Ready to Experience CrossPay?</h2>
              <p className="mb-8 text-lg text-slate-600">
                Join thousands of people who are already saving money and time on their international
                transfers.
              </p>
              <Button asChild size="lg">
                <Link to="/send-money" className="inline-flex items-center gap-2">
                  Start Your First Transfer <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
} 