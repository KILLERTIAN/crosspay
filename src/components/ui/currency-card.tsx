import { ArrowDownIcon, ArrowRightIcon, ArrowUpIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatPercentage, getCurrencyByCode } from "@/lib/utils";

interface CurrencyCardProps {
  baseCurrency: string;
  targetCurrency: string;
  rate: number;
  previousRate?: number;
  amount?: number;
  onClick?: () => void;
}

export function CurrencyCard({
  baseCurrency,
  targetCurrency,
  rate,
  previousRate,
  amount = 1000,
  onClick,
}: CurrencyCardProps) {
  // Calculate percentage change if previous rate is provided
  const percentageChange = previousRate ? ((rate - previousRate) / previousRate) * 100 : null;
  const convertedAmount = amount * rate;
  
  // Get currency details
  const baseDetails = getCurrencyByCode(baseCurrency);
  const targetDetails = getCurrencyByCode(targetCurrency);

  return (
    <Card 
      className={`overflow-hidden transition-all duration-200 hover:shadow-md ${onClick ? 'cursor-pointer' : ''}`} 
      onClick={onClick}
    >
      <CardContent className="p-0">
        <div className="flex flex-col">
          <div className="flex items-center justify-between border-b p-4">
            <div className="flex items-center gap-3">
              <div className="text-2xl">{targetDetails?.flag}</div>
              <div>
                <h3 className="font-medium">{targetDetails?.label.split(' - ')[1]}</h3>
                <p className="text-xs text-slate-500">{targetCurrency}</p>
              </div>
            </div>
            {percentageChange !== null && (
              <div
                className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                  percentageChange >= 0
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {percentageChange >= 0 ? (
                  <ArrowUpIcon className="h-3 w-3" />
                ) : (
                  <ArrowDownIcon className="h-3 w-3" />
                )}
                {formatPercentage(percentageChange)}
              </div>
            )}
          </div>
          
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <span>{baseDetails?.flag}</span>
                <span>{formatCurrency(amount, baseCurrency)}</span>
                <ArrowRightIcon className="h-3 w-3" />
                <span>{targetDetails?.flag}</span>
              </div>
            </div>
            <div className="mt-1">
              <span className="text-xl font-bold">
                {formatCurrency(convertedAmount, targetCurrency)}
              </span>
            </div>
            <div className="mt-2 text-xs text-slate-500">
              1 {baseCurrency} = {rate.toFixed(4)} {targetCurrency}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 