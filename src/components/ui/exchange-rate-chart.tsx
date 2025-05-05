import React, { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatChartDate, formatCurrency, calculatePercentageChange, formatPercentage } from "@/lib/utils";
import { HistoricalRatePoint } from "@/lib/api";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";

interface ExchangeRateChartProps {
  data: HistoricalRatePoint[];
  baseCurrency: string;
  targetCurrency: string;
  amount?: number;
}

interface CustomTooltipProps extends TooltipProps<number, string> {
  baseCurrency: string;
  targetCurrency: string;
  amount: number;
}

// Custom tooltip component
const CustomTooltip = ({ 
  active, 
  payload, 
  baseCurrency, 
  targetCurrency, 
  amount 
}: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const dataPoint = payload[0].payload as HistoricalRatePoint;
    const convertedAmount = amount * dataPoint.rate;

    return (
      <div className="rounded-lg bg-white p-4 shadow-lg">
        <p className="font-medium">{dataPoint.date}</p>
        <p className="text-sm text-slate-600">
          {formatCurrency(amount, baseCurrency)} = {formatCurrency(convertedAmount, targetCurrency)}
        </p>
        <p className="text-xs text-slate-500">
          Rate: 1 {baseCurrency} = {dataPoint.rate.toFixed(6)} {targetCurrency}
        </p>
      </div>
    );
  }
  return null;
};

export function ExchangeRateChart({
  data,
  baseCurrency,
  targetCurrency,
  amount = 1,
}: ExchangeRateChartProps) {
  // Calculate percentage change from first to last data point
  const percentageChange = useMemo(() => {
    if (data.length < 2) return 0;
    const firstRate = data[0].rate;
    const lastRate = data[data.length - 1].rate;
    return calculatePercentageChange(firstRate, lastRate);
  }, [data]);

  // Determine chart color based on trend
  const strokeColor = percentageChange >= 0 ? "rgb(16, 185, 129)" : "rgb(239, 68, 68)";

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>
              {baseCurrency}/{targetCurrency} Exchange Rate
            </CardTitle>
            <CardDescription>
              30-day historical rate data
            </CardDescription>
          </div>
          <div
            className={`flex items-center gap-1 rounded-full px-2 py-1 text-sm font-medium ${
              percentageChange >= 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}
          >
            {percentageChange >= 0 ? (
              <ArrowUpIcon className="h-4 w-4" />
            ) : (
              <ArrowDownIcon className="h-4 w-4" />
            )}
            {formatPercentage(percentageChange)}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={strokeColor} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={strokeColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
              <XAxis
                dataKey="date"
                tickFormatter={formatChartDate}
                tick={{ fontSize: 12, fill: "#6B7280" }}
                tickLine={false}
                axisLine={false}
                padding={{ left: 10, right: 10 }}
              />
              <YAxis
                tickFormatter={(value) => value.toFixed(4)}
                tick={{ fontSize: 12, fill: "#6B7280" }}
                tickLine={false}
                axisLine={false}
                domain={["dataMin - 0.001", "dataMax + 0.001"]}
              />
              <Tooltip 
                content={
                  <CustomTooltip 
                    baseCurrency={baseCurrency} 
                    targetCurrency={targetCurrency} 
                    amount={amount} 
                  />
                }
              />
              <Area
                type="monotone"
                dataKey="rate"
                stroke={strokeColor}
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorRate)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
} 