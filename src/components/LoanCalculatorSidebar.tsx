import React, { useState, useEffect } from "react";
import { Calculator, ChevronDown, ChevronUp, RefreshCw, Sparkles, Check, HelpCircle } from "lucide-react";
import { LoanType } from "../types";
import { formatINR } from "../utils/validators";
import { useLanguage } from "../context/LanguageContext";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";

interface LoanCalculatorSidebarProps {
  currentLoanType: LoanType;
  appAmount: number;
  appTenure: number;
  onSyncToApp: (amount: number, tenure: number, type: LoanType) => void;
}

// Typical interest rates for different loan products in India
const DEFAULT_INTEREST_RATES: Record<LoanType, number> = {
  Personal: 10.5,
  Home: 8.65,
  Business: 13.5
};

export default function LoanCalculatorSidebar({
  currentLoanType,
  appAmount,
  appTenure,
  onSyncToApp
}: LoanCalculatorSidebarProps) {
  const { t, language } = useLanguage();
  // Local state for interactive sandbox
  const [calcType, setCalcType] = useState<LoanType>(currentLoanType);
  const [amount, setAmount] = useState<number>(appAmount || 500000);
  const [tenure, setTenure] = useState<number>(appTenure || 60);
  const [interestRate, setInterestRate] = useState<number>(DEFAULT_INTEREST_RATES[currentLoanType]);
  
  const [showAmortization, setShowAmortization] = useState(false);
  const [isSynced, setIsSynced] = useState(false);

  // Sync back local state if props change from outer app
  useEffect(() => {
    setCalcType(currentLoanType);
    setInterestRate(DEFAULT_INTEREST_RATES[currentLoanType]);
  }, [currentLoanType]);

  useEffect(() => {
    if (appAmount) setAmount(appAmount);
  }, [appAmount]);

  useEffect(() => {
    if (appTenure) setTenure(appTenure);
  }, [appTenure]);

  // Check if current calculator values match the application values
  useEffect(() => {
    const isMatching = amount === appAmount && tenure === appTenure && calcType === currentLoanType;
    setIsSynced(isMatching);
  }, [amount, tenure, calcType, appAmount, appTenure, currentLoanType]);

  // Dynamic limits based on calculator loan type
  const minAmount = 50000;
  const maxAmount =
    calcType === "Personal" ? 1000000 : calcType === "Home" ? 10000000 : 5000000;
  
  const minTenure = 12;
  const maxTenure =
    calcType === "Personal" ? 60 : calcType === "Home" ? 360 : 120;

  // Ensure local state falls within correct bounds if type changes
  useEffect(() => {
    if (amount > maxAmount) setAmount(maxAmount);
    if (amount < minAmount) setAmount(minAmount);
    if (tenure > maxTenure) setTenure(maxTenure);
    if (tenure < minTenure) setTenure(minTenure);
  }, [calcType]);

  // Calculate EMI
  const calculateEMI = () => {
    const P = amount;
    const r = interestRate / 12 / 100;
    const n = tenure;
    
    if (r === 0) return P / n;
    
    const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    return emi;
  };

  const emi = calculateEMI();
  const totalPayment = emi * tenure;
  const totalInterest = Math.max(0, totalPayment - amount);
  const interestPercentage = totalPayment > 0 ? (totalInterest / totalPayment) * 100 : 0;
  const principalPercentage = 100 - interestPercentage;

  // Generate Year-by-Year Amortization Schedule
  const generateAmortizationSchedule = () => {
    const schedule = [];
    let balance = amount;
    const monthlyRate = interestRate / 12 / 100;
    
    let yearlyPrincipal = 0;
    let yearlyInterest = 0;
    
    for (let month = 1; month <= tenure; month++) {
      const interest = balance * monthlyRate;
      const principal = emi - interest;
      balance = Math.max(0, balance - principal);
      
      yearlyPrincipal += principal;
      yearlyInterest += interest;
      
      if (month % 12 === 0 || month === tenure) {
        schedule.push({
          year: Math.ceil(month / 12),
          principalPaid: yearlyPrincipal,
          interestPaid: yearlyInterest,
          totalPaid: yearlyPrincipal + yearlyInterest,
          remainingBalance: balance
        });
        
        yearlyPrincipal = 0;
        yearlyInterest = 0;
      }
    }
    return schedule;
  };

  const schedule = generateAmortizationSchedule();

  const principalLabel = t("principalBreakdown") || "Principal";
  const interestLabel = t("interestBreakdown") || "Interest";

  const chartData = schedule.map((row) => ({
    name: language === "hi" ? `वर्ष ${row.year}` : language === "or" ? `ବର୍ଷ ${row.year}` : `Yr ${row.year}`,
    [principalLabel]: Math.round(row.principalPaid),
    [interestLabel]: Math.round(row.interestPaid)
  }));

  const formatYAxis = (value: number) => {
    if (value >= 100000) {
      return `₹${(value / 100000).toFixed(1)}L`;
    }
    if (value >= 1000) {
      return `₹${(value / 1000).toFixed(0)}K`;
    }
    return `₹${value}`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-zinc-200 p-2 shadow-md rounded text-[10px] font-sans">
          <p className="font-semibold text-zinc-900 mb-0.5">{label}</p>
          {payload.map((entry: any) => (
            <div key={entry.name} className="flex items-center gap-1 text-zinc-600">
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: entry.color }} />
              <span>{entry.name}:</span>
              <span className="font-mono font-semibold text-zinc-900">{formatINR(Math.round(entry.value))}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const handleSyncClick = () => {
    onSyncToApp(amount, tenure, calcType);
  };

  return (
    <div className="bg-white border border-zinc-200/80 rounded-lg p-5 space-y-6 text-zinc-950 animate-fadeIn" id="amortization-calculator-sidebar">
      {/* Sidebar Header */}
      <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
        <div className="flex items-center gap-2">
          <Calculator className="h-4 w-4 text-zinc-900" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-800">
            {t("calcHeader")}
          </h3>
        </div>
        <span className="text-[9px] font-mono bg-zinc-100 text-zinc-600 px-1.5 py-0.5 rounded font-medium">
          {t("rbiTag")}
        </span>
      </div>

      {/* Calculator Type Switcher */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider block">
          {t("calcMode")}
        </label>
        <div className="grid grid-cols-3 gap-1 bg-zinc-100 p-0.5 rounded text-center">
          {(["Personal", "Home", "Business"] as LoanType[]).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => {
                setCalcType(mode);
                setInterestRate(DEFAULT_INTEREST_RATES[mode]);
              }}
              className={`py-1 text-xs font-medium rounded transition-all cursor-pointer ${
                calcType === mode
                  ? "bg-white text-zinc-950 shadow-xs"
                  : "text-zinc-500 hover:text-zinc-800"
              }`}
            >
              {t(mode)}
            </button>
          ))}
        </div>
      </div>

      {/* Loan Amount Range Slider */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs">
          <span className="font-medium text-zinc-700">{t("principalAmt")}</span>
          <span className="font-mono font-medium text-zinc-950">{formatINR(amount)}</span>
        </div>
        <input
          type="range"
          min={minAmount}
          max={maxAmount}
          step={25000}
          value={amount}
          onChange={(e) => setAmount(parseInt(e.target.value) || minAmount)}
          className="w-full h-1 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-zinc-900"
        />
        <div className="flex justify-between text-[9px] font-mono text-zinc-400">
          <span>{formatINR(minAmount)}</span>
          <span>{formatINR(maxAmount)}</span>
        </div>
      </div>

      {/* Loan Tenure Slider */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs">
          <span className="font-medium text-zinc-700">{t("loanTenureLabel")}</span>
          <span className="font-mono font-medium text-zinc-950">
            {language === "hi"
              ? `${tenure} महीने (${Math.floor(tenure / 12)} वर्ष)`
              : language === "or"
              ? `${tenure} ମାସ (${Math.floor(tenure / 12)} ବର୍ଷ)`
              : `${tenure} months (${Math.floor(tenure / 12)} years)`}
          </span>
        </div>
        <input
          type="range"
          min={minTenure}
          max={maxTenure}
          step={calcType === "Home" ? 12 : 6}
          value={tenure}
          onChange={(e) => setTenure(parseInt(e.target.value) || minTenure)}
          className="w-full h-1 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-zinc-900"
        />
        <div className="flex justify-between text-[9px] font-mono text-zinc-400">
          <span>{minTenure} {language === "hi" ? "महीने" : language === "or" ? "ମାସ" : "Mo"}</span>
          <span>{maxTenure} {language === "hi" ? "महीने" : language === "or" ? "ମାସ" : "Mo"}</span>
        </div>
      </div>

      {/* Interest Rate Slider */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs">
          <span className="font-medium text-zinc-700">{t("estInterestRate")}</span>
          <span className="font-mono font-medium text-zinc-950">
            {interestRate.toFixed(2)}{language === "hi" ? "% प्रति वर्ष" : language === "or" ? "% ପ୍ରତି ବର୍ଷ" : "% p.a."}
          </span>
        </div>
        <input
          type="range"
          min={6.0}
          max={20.0}
          step={0.05}
          value={interestRate}
          onChange={(e) => setInterestRate(parseFloat(e.target.value) || 8.0)}
          className="w-full h-1 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-zinc-900"
        />
        <div className="flex justify-between text-[9px] font-mono text-zinc-400">
          <span>6.00%</span>
          <span>20.00%</span>
        </div>
      </div>

      {/* Output Stats Summary Card */}
      <div className="bg-zinc-50 border border-zinc-200/60 rounded p-4 space-y-3.5">
        <div className="text-center pb-2.5 border-b border-zinc-200/60">
          <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-mono font-medium block">
            {t("emiLabel")}
          </span>
          <span className="text-xl font-bold font-mono text-zinc-950 block mt-1">
            {formatINR(Math.round(emi))}
          </span>
          <span className="text-[9px] text-zinc-400 font-mono mt-0.5 block">
            {t("emiSub")}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-center text-xs">
          <div className="space-y-0.5">
            <span className="text-[9px] text-zinc-500 uppercase tracking-wider">{t("interestPayable")}</span>
            <p className="font-mono font-semibold text-zinc-800">{formatINR(Math.round(totalInterest))}</p>
          </div>
          <div className="space-y-0.5">
            <span className="text-[9px] text-zinc-500 uppercase tracking-wider">{t("totalRepayment")}</span>
            <p className="font-mono font-semibold text-zinc-800">{formatINR(Math.round(totalPayment))}</p>
          </div>
        </div>

        {/* Breakdown bar */}
        <div className="space-y-1 pt-1">
          <div className="h-1.5 w-full flex rounded-full overflow-hidden">
            <div
              className="bg-zinc-900"
              style={{ width: `${principalPercentage}%` }}
              title={`${t("principalBreakdown")}: ${principalPercentage.toFixed(1)}%`}
            ></div>
            <div
              className="bg-zinc-300"
              style={{ width: `${interestPercentage}%` }}
              title={`${t("interestBreakdown")}: ${interestPercentage.toFixed(1)}%`}
            ></div>
          </div>
          <div className="flex justify-between text-[9px] font-mono text-zinc-400">
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-zinc-900 inline-block"></span>
              {t("principalBreakdown")} ({principalPercentage.toFixed(0)}%)
            </span>
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-zinc-300 inline-block"></span>
              {t("interestBreakdown")} ({interestPercentage.toFixed(0)}%)
            </span>
          </div>
        </div>
      </div>

      {/* Sync with Application Button */}
      <div>
        {isSynced ? (
          <div className="flex items-center justify-center gap-1.5 py-2 px-3 border border-zinc-200 bg-zinc-50 text-zinc-600 text-[11px] font-medium rounded-md w-full">
            <Check className="h-3.5 w-3.5 text-zinc-900" />
            {t("syncedApp")}
          </div>
        ) : (
          <button
            type="button"
            onClick={handleSyncClick}
            className="flex items-center justify-center gap-2 py-2 px-3 bg-zinc-900 hover:bg-zinc-800 text-white text-[11px] font-semibold rounded-md w-full transition-colors cursor-pointer shadow-sm"
          >
            <RefreshCw className="h-3.5 w-3.5 animate-spin-slow" />
            {t("syncApp")}
          </button>
        )}
      </div>

      {/* Detailed Amortization Schedule Dropdown */}
      <div className="border-t border-zinc-100 pt-3">
        <button
          type="button"
          onClick={() => setShowAmortization(!showAmortization)}
          className="flex items-center justify-between w-full text-xs text-zinc-600 hover:text-zinc-950 font-medium py-1 cursor-pointer transition-colors"
        >
          <span>{t("amortizationHeader")}</span>
          {showAmortization ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>

        {showAmortization && (
          <div className="mt-3 space-y-4">
            {/* Recharts Line Chart */}
            <div className="bg-zinc-50 border border-zinc-200/80 rounded p-2 h-44" id="amortization-chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 5, right: 10, left: -10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "#71717a", fontSize: 8 }}
                    axisLine={{ stroke: "#e4e4e7" }}
                    tickLine={{ stroke: "#e4e4e7" }}
                  />
                  <YAxis
                    tickFormatter={formatYAxis}
                    tick={{ fill: "#71717a", fontSize: 8 }}
                    axisLine={{ stroke: "#e4e4e7" }}
                    tickLine={{ stroke: "#e4e4e7" }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    verticalAlign="top"
                    height={20}
                    iconSize={6}
                    wrapperStyle={{ fontSize: 8, fontFamily: "sans-serif", paddingBottom: "4px" }}
                  />
                  <Line
                    type="monotone"
                    dataKey={principalLabel}
                    stroke="#18181b"
                    strokeWidth={1.5}
                    dot={{ r: 1.5 }}
                    activeDot={{ r: 3 }}
                  />
                  <Line
                    type="monotone"
                    dataKey={interestLabel}
                    stroke="#2563eb"
                    strokeWidth={1.5}
                    dot={{ r: 1.5 }}
                    activeDot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Amortization Table */}
            <div className="overflow-x-auto max-h-48 overflow-y-auto border border-zinc-200/80 rounded scrollbar-thin scrollbar-thumb-zinc-200">
              <table className="w-full text-left border-collapse font-mono text-[10px]">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-500">
                    <th className="p-2 font-medium">{t("yearLabel")}</th>
                    <th className="p-2 font-medium">{t("principalBreakdown")}</th>
                    <th className="p-2 font-medium">{t("interestBreakdown")}</th>
                    <th className="p-2 font-medium">{t("balanceLabel")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 text-zinc-800">
                  {schedule.map((row) => (
                    <tr key={row.year} className="hover:bg-zinc-50/50">
                      <td className="p-2 font-semibold">{language === "hi" ? `वर्ष ${row.year}` : language === "or" ? `ବର୍ଷ ${row.year}` : `Yr ${row.year}`}</td>
                      <td className="p-2">{formatINR(Math.round(row.principalPaid))}</td>
                      <td className="p-2">{formatINR(Math.round(row.interestPaid))}</td>
                      <td className="p-2 font-medium text-zinc-900">
                        {row.remainingBalance <= 0 ? "NIL" : formatINR(Math.round(row.remainingBalance))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
