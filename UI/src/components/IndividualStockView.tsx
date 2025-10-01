import { useState, useEffect } from "react";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Plus,
  Settings,
  Calendar,
  Clock,
  Activity,
  Target,
  Percent,
  Sigma,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import { Button } from "./ui/button";

interface IndividualStockViewProps {
  stockSymbol: string;
  onBack: () => void;
}

// Mock detailed stock data
const mockStockDetails = {
  AAPL: {
    symbol: "AAPL",
    name: "Apple Inc.",
    price: 178.85,
    change: 2.34,
    changePercent: 1.33,
    stats: {
      meanReturn: 12.45,
      medianReturn: 11.2,
      standardDev: 24.67,
      kurtosis: 1.89,
      skewness: -0.23,
      sharpeRatio: 0.87,
      beta: 1.12,
      volatility: 28.34,
    },
  },
  MSFT: {
    symbol: "MSFT",
    name: "Microsoft Corporation",
    price: 415.26,
    change: -3.21,
    changePercent: -0.77,
    stats: {
      meanReturn: 15.23,
      medianReturn: 14.1,
      standardDev: 22.45,
      kurtosis: 2.12,
      skewness: 0.15,
      sharpeRatio: 1.02,
      beta: 0.89,
      volatility: 25.67,
    },
  },
  GOOGL: {
    symbol: "GOOGL",
    name: "Alphabet Inc.",
    price: 138.21,
    change: 1.87,
    changePercent: 1.37,
    stats: {
      meanReturn: 14.67,
      medianReturn: 13.45,
      standardDev: 26.78,
      kurtosis: 1.67,
      skewness: -0.12,
      sharpeRatio: 0.94,
      beta: 1.05,
      volatility: 29.12,
    },
  },
};

// Generate comprehensive chart data with statistics
const generateDetailedChartData = (
  symbol: string,
  days: number = 90,
) => {
  const stock =
    mockStockDetails[symbol as keyof typeof mockStockDetails];
  if (!stock) return [];

  const basePrice = stock.price;
  const data = [];

  for (let i = 0; i < days; i++) {
    const randomReturn = (Math.random() - 0.5) * 0.1; // ±5% daily change
    const trendReturn = Math.sin(i / 20) * 0.02; // Cyclical trend
    const price =
      basePrice *
      (1 + randomReturn + trendReturn) *
      (1 + i * 0.001);

    data.push({
      day: i + 1,
      date: new Date(
        Date.now() - (days - i) * 24 * 60 * 60 * 1000,
      ).toLocaleDateString(),
      price: price,
      meanReturn: stock.stats.meanReturn,
      medianReturn: stock.stats.medianReturn,
      upperBand: price * 1.1,
      lowerBand: price * 0.9,
      volume: Math.floor(Math.random() * 50000000) + 10000000,
    });
  }

  return data;
};

// Mock company-specific news
const generateCompanyNews = (symbol: string) => [
  {
    title: `${symbol} Reports Strong Q3 Earnings, Beats Expectations`,
    time: "2 hours ago",
    source: "Reuters",
    sentiment: "positive",
  },
  {
    title: `Analysts Upgrade ${symbol} Price Target Following Innovation Announcement`,
    time: "4 hours ago",
    source: "Bloomberg",
    sentiment: "positive",
  },
  {
    title: `${symbol} Faces Regulatory Scrutiny in European Markets`,
    time: "1 day ago",
    source: "Financial Times",
    sentiment: "neutral",
  },
];

// Mock sentiment data specific to company
const generateCompanySentiment = (symbol: string) => [
  { metric: "Social Media", sentiment: 72, color: "#10B981" },
  { metric: "News Coverage", sentiment: 68, color: "#3B82F6" },
  {
    metric: "Analyst Reports",
    sentiment: 85,
    color: "#8B5CF6",
  },
  {
    metric: "Investor Forums",
    sentiment: -15,
    color: "#EF4444",
  },
];

export function IndividualStockView({
  stockSymbol,
  onBack,
}: IndividualStockViewProps) {
  const [chartData, setChartData] = useState<any[]>([]);
  const [selectedIndicators, setSelectedIndicators] = useState([
    "price",
    "meanReturn",
  ]);
  const [timeframe, setTimeframe] = useState("90D");

  const stockDetails =
    mockStockDetails[
      stockSymbol as keyof typeof mockStockDetails
    ];

  useEffect(() => {
    const data = generateDetailedChartData(stockSymbol);
    setChartData(data);
  }, [stockSymbol]);

  if (!stockDetails) {
    return (
      <div className="flex-1 p-6 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        <Button onClick={onBack} className="mb-4">
          <ArrowLeft className="mr-2" size={16} />
          Back to Search
        </Button>
        <div className="text-white">Stock not found</div>
      </div>
    );
  }

  const toggleIndicator = (indicator: string) => {
    setSelectedIndicators((prev) =>
      prev.includes(indicator)
        ? prev.filter((i) => i !== indicator)
        : [...prev, indicator],
    );
  };

  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex flex-col overflow-hidden">
    <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-6 h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center gap-4 flex-shrink-0">
            <Button
              onClick={onBack}
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-white"
            >
              <ArrowLeft className="mr-2" size={16} />
              Back to Search
            </Button>
            <div>
              <h1 className="text-3xl font-medium text-white">
                {stockDetails.symbol} - Individual Analysis
              </h1>
              <p className="text-slate-400">
                {stockDetails.name}
              </p>
            </div>
          </div>

          {/* Main Content Area - Top 60% */}
          <div className="flex-1 grid grid-cols-[20%_80%] gap-6">
            {/* Left Column - Combined Rectangle (Stats + Controls) */}
            <div className="bg-slate-800/60 backdrop-blur-md rounded-xl border border-slate-600/30 shadow-2xl p-4 flex flex-col">
              {/* Statistical Metrics Section */}
              <div className="mb-6">
                <h3 className="text-white text-sm font-medium mb-3 flex items-center gap-2">
                  <BarChart3 size={16} />
                  Statistical Metrics
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-slate-700/50 p-2 rounded-lg">
                      <div className="flex items-center gap-1 mb-1">
                        <Target
                          size={12}
                          className="text-blue-400"
                        />
                        <span className="text-slate-400">
                          Mean Return
                        </span>
                      </div>
                      <div className="text-white font-medium">
                        {stockDetails.stats.meanReturn.toFixed(
                          2,
                        )}
                        %
                      </div>
                    </div>

                    <div className="bg-slate-700/50 p-2 rounded-lg">
                      <div className="flex items-center gap-1 mb-1">
                        <Activity
                          size={12}
                          className="text-green-400"
                        />
                        <span className="text-slate-400">
                          Median Return
                        </span>
                      </div>
                      <div className="text-white font-medium">
                        {stockDetails.stats.medianReturn.toFixed(
                          2,
                        )}
                        %
                      </div>
                    </div>

                    <div className="bg-slate-700/50 p-2 rounded-lg">
                      <div className="flex items-center gap-1 mb-1">
                        <Sigma
                          size={12}
                          className="text-purple-400"
                        />
                        <span className="text-slate-400">
                          Std Dev
                        </span>
                      </div>
                      <div className="text-white font-medium">
                        {stockDetails.stats.standardDev.toFixed(
                          2,
                        )}
                        %
                      </div>
                    </div>

                    <div className="bg-slate-700/50 p-2 rounded-lg">
                      <div className="flex items-center gap-1 mb-1">
                        <Percent
                          size={12}
                          className="text-yellow-400"
                        />
                        <span className="text-slate-400">
                          Kurtosis
                        </span>
                      </div>
                      <div className="text-white font-medium">
                        {stockDetails.stats.kurtosis.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">
                        Beta
                      </span>
                      <span className="text-white">
                        {stockDetails.stats.beta.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">
                        Sharpe Ratio
                      </span>
                      <span className="text-white">
                        {stockDetails.stats.sharpeRatio.toFixed(
                          2,
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">
                        Volatility
                      </span>
                      <span className="text-white">
                        {stockDetails.stats.volatility.toFixed(
                          1,
                        )}
                        %
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-slate-600/30 mb-4"></div>

              {/* Chart Controls Section */}
              <div className="flex-1">
                <h3 className="text-white text-sm font-medium mb-3 flex items-center gap-2">
                  <Settings size={16} />
                  Chart Controls
                </h3>

                <div className="space-y-4">
                  {/* Time Series Controls */}
                  <div>
                    <h4 className="text-slate-400 text-xs mb-2">
                      Time Series
                    </h4>
                    <div className="grid grid-cols-2 gap-1 text-xs">
                      {["30D", "90D", "1Y", "5Y"].map(
                        (period) => (
                          <Button
                            key={period}
                            size="sm"
                            variant={
                              timeframe === period
                                ? "default"
                                : "ghost"
                            }
                            onClick={() => setTimeframe(period)}
                            className="h-8 text-xs"
                          >
                            {period}
                          </Button>
                        ),
                      )}
                    </div>
                  </div>

                  {/* Indicators */}
                  <div>
                    <h4 className="text-slate-400 text-xs mb-2">
                      Indicators
                    </h4>
                    <div className="space-y-1">
                      {[
                        {
                          key: "price",
                          label: "Price",
                          color: "#3B82F6",
                        },
                        {
                          key: "meanReturn",
                          label: "Mean Return",
                          color: "#10B981",
                        },
                        {
                          key: "medianReturn",
                          label: "Median Return",
                          color: "#F59E0B",
                        },
                        {
                          key: "upperBand",
                          label: "Upper Band",
                          color: "#EF4444",
                        },
                        {
                          key: "lowerBand",
                          label: "Lower Band",
                          color: "#EF4444",
                        },
                      ].map((indicator) => (
                        <label
                          key={indicator.key}
                          className="flex items-center gap-2 text-xs cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedIndicators.includes(
                              indicator.key,
                            )}
                            onChange={() =>
                              toggleIndicator(indicator.key)
                            }
                            className="rounded border-slate-600"
                          />
                          <div
                            className="w-2 h-2 rounded"
                            style={{
                              backgroundColor: indicator.color,
                            }}
                          ></div>
                          <span className="text-slate-300">
                            {indicator.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Presets */}
                  <div>
                    <h4 className="text-slate-400 text-xs mb-2">
                      Presets
                    </h4>
                    <div className="space-y-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full h-8 text-xs"
                      >
                        Technical Analysis
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full h-8 text-xs"
                      >
                        Risk Metrics
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Main Chart */}
            <div className="bg-slate-800/60 backdrop-blur-md rounded-xl border border-slate-600/30 shadow-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-medium text-white">
                    {stockDetails.symbol} Detailed Analysis
                  </h2>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-2xl font-medium text-white">
                      ${stockDetails.price.toFixed(2)}
                    </span>
                    <div
                      className={`flex items-center gap-1 ${
                        stockDetails.change >= 0
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      {stockDetails.change >= 0 ? (
                        <TrendingUp size={16} />
                      ) : (
                        <TrendingDown size={16} />
                      )}
                      <span>
                        {stockDetails.change >= 0 ? "+" : ""}$
                        {stockDetails.change.toFixed(2)} (
                        {stockDetails.changePercent.toFixed(2)}
                        %)
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="h-[calc(100%-100px)]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <XAxis
                      dataKey="day"
                      stroke="#94A3B8"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#94A3B8"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        border: "1px solid #334155",
                        borderRadius: "8px",
                        color: "#fff",
                      }}
                    />
                    <Legend />

                    {selectedIndicators.includes("price") && (
                      <Line
                        type="monotone"
                        dataKey="price"
                        stroke="#3B82F6"
                        strokeWidth={2}
                        dot={false}
                        name="Stock Price"
                      />
                    )}
                    {selectedIndicators.includes(
                      "meanReturn",
                    ) && (
                      <Line
                        type="monotone"
                        dataKey="meanReturn"
                        stroke="#10B981"
                        strokeWidth={1}
                        strokeDasharray="5 5"
                        dot={false}
                        name="Mean Return"
                      />
                    )}
                    {selectedIndicators.includes(
                      "medianReturn",
                    ) && (
                      <Line
                        type="monotone"
                        dataKey="medianReturn"
                        stroke="#F59E0B"
                        strokeWidth={1}
                        strokeDasharray="3 3"
                        dot={false}
                        name="Median Return"
                      />
                    )}
                    {selectedIndicators.includes(
                      "upperBand",
                    ) && (
                      <Line
                        type="monotone"
                        dataKey="upperBand"
                        stroke="#EF4444"
                        strokeWidth={1}
                        strokeOpacity={0.6}
                        dot={false}
                        name="Upper Band"
                      />
                    )}
                    {selectedIndicators.includes(
                      "lowerBand",
                    ) && (
                      <Line
                        type="monotone"
                        dataKey="lowerBand"
                        stroke="#EF4444"
                        strokeWidth={1}
                        strokeOpacity={0.6}
                        dot={false}
                        name="Lower Band"
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer - Fixed at bottom of screen */}
      <div className="bg-slate-800/60 backdrop-blur-md border-t border-slate-600/30 shadow-2xl p-6 flex-shrink-0">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-48">
            {/* Company News */}
            <div className="space-y-4">
              <h4 className="text-white text-sm mb-3 flex items-center gap-2">
                <Clock size={16} />
                {stockDetails.symbol} News
              </h4>
              <div className="space-y-3 overflow-y-auto max-h-36">
                {generateCompanyNews(stockDetails.symbol).map(
                  (news, index) => (
                    <div
                      key={index}
                      className="border-l-2 border-blue-500 pl-3 py-2"
                    >
                      <p className="text-white text-sm font-medium leading-tight mb-1">
                        {news.title}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span>{news.source}</span>
                        <span>•</span>
                        <span>{news.time}</span>
                        <div
                          className={`px-2 py-1 rounded text-xs ${
                            news.sentiment === "positive"
                              ? "bg-green-400/20 text-green-400"
                              : news.sentiment === "negative"
                                ? "bg-red-400/20 text-red-400"
                                : "bg-slate-400/20 text-slate-400"
                          }`}
                        >
                          {news.sentiment}
                        </div>
                      </div>
                    </div>
                  ),
                )}
              </div>
            </div>

            {/* Company Sentiment */}
            <div className="space-y-4">
              <h4 className="text-white text-sm mb-3 flex items-center gap-2">
                <Activity size={16} />
                {stockDetails.symbol} Sentiment
              </h4>
              <div className="h-36">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={generateCompanySentiment(
                      stockDetails.symbol,
                    )}
                    margin={{
                      top: 10,
                      right: 10,
                      left: 10,
                      bottom: 50,
                    }}
                  >
                    <XAxis
                      dataKey="metric"
                      stroke="#94A3B8"
                      fontSize={10}
                      angle={-45}
                      textAnchor="end"
                      height={40}
                    />
                    <YAxis
                      stroke="#94A3B8"
                      fontSize={10}
                      domain={[-50, 100]}
                    />
                    <Bar
                      dataKey="sentiment"
                      radius={[2, 2, 0, 0]}
                    >
                      {generateCompanySentiment(
                        stockDetails.symbol,
                      ).map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Company Data Releases */}
            <div className="space-y-4">
              <h4 className="text-white text-sm mb-3 flex items-center gap-2">
                <Calendar size={16} />
                {stockDetails.symbol} Schedule
              </h4>
              <div className="space-y-3 overflow-y-auto max-h-36">
                <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                  <div>
                    <p className="text-white text-sm">
                      Q4 Earnings Call
                    </p>
                    <p className="text-slate-400 text-xs">
                      Expected EPS: $2.15
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-300 text-xs">
                      Oct 28
                    </p>
                    <p className="text-slate-400 text-xs">
                      After Market
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                  <div>
                    <p className="text-white text-sm">
                      Product Launch Event
                    </p>
                    <p className="text-slate-400 text-xs">
                      New Product Line
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-300 text-xs">
                      Nov 15
                    </p>
                    <p className="text-slate-400 text-xs">
                      2:00 PM EST
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                  <div>
                    <p className="text-white text-sm">
                      Analyst Meeting
                    </p>
                    <p className="text-slate-400 text-xs">
                      Strategy Update
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-300 text-xs">
                      Dec 5
                    </p>
                    <p className="text-slate-400 text-xs">
                      9:00 AM EST
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}