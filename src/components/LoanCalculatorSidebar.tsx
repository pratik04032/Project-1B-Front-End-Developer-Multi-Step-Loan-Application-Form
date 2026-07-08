import React, { useState, useEffect } from "react";
import { Calculator, ChevronDown, ChevronUp, RefreshCw, Sparkles, Check, HelpCircle } from "lucide-react";
import { LoanType } from "../types";
import { formatINR } from "../utils/validators";

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
            EMI sandbox &amp; Estimator
          </h3>
        </div>
        <span className="text-[9px] font-mono bg-zinc-100 text-zinc-600 px-1.5 py-0.5 rounded font-medium">
          RBI Compliant APR
        </span>
      </div>

      {/* Calculator Type Switcher */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider block">
          Calculator Mode
        </label>
        <div className="grid grid-cols-3 gap-1 bg-zinc-100 p-0.5 rounded text-center">
          {(["Personal", "Home", "Business"] as LoanType[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                setCalcType(t);
                setInterestRate(DEFAULT_INTEREST_RATES[t]);
              }}
              className={`py-1 text-xs font-medium rounded transition-all cursor-pointer ${
                calcType === t
                  ? "bg-white text-zinc-950 shadow-xs"
                  : "text-zinc-500 hover:text-zinc-800"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Loan Amount Range Slider */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs">
          <span className="font-medium text-zinc-700">Principal Amount</span>
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
          <span className="font-medium text-zinc-700">Loan Tenure</span>
          <span className="font-mono font-medium text-zinc-950">
            {tenure} months ({Math.floor(tenure / 12)} years)
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
          <span>{minTenure} Mo</span>
          <span>{maxTenure} Mo</span>
        </div>
      </div>

      {/* Interest Rate Slider */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs">
          <span className="font-medium text-zinc-700">Estimated Interest Rate</span>
          <span className="font-mono font-medium text-zinc-950">{interestRate.toFixed(2)}% p.a.</span>
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
            Estimated Monthly EMI
          </span>
          <span className="text-xl font-bold font-mono text-zinc-950 block mt-1">
            {formatINR(Math.round(emi))}
          </span>
          <span className="text-[9px] text-zinc-400 font-mono mt-0.5 block">
            Includes principal + amortized interest
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-center text-xs">
          <div className="space-y-0.5">
            <span className="text-[9px] text-zinc-500 uppercase tracking-wider">Interest Payable</span>
            <p className="font-mono font-semibold text-zinc-800">{formatINR(Math.round(totalInterest))}</p>
          </div>
          <div className="space-y-0.5">
            <span className="text-[9px] text-zinc-500 uppercase tracking-wider">Total Repayment</span>
            <p className="font-mono font-semibold text-zinc-800">{formatINR(Math.round(totalPayment))}</p>
          </div>
        </div>

        {/* Breakdown bar */}
        <div className="space-y-1 pt-1">
          <div className="h-1.5 w-full flex rounded-full overflow-hidden">
            <div
              className="bg-zinc-900"
              style={{ width: `${principalPercentage}%` }}
              title={`Principal: ${principalPercentage.toFixed(1)}%`}
            ></div>
            <div
              className="bg-zinc-300"
              style={{ width: `${interestPercentage}%` }}
              title={`Interest: ${interestPercentage.toFixed(1)}%`}
            ></div>
          </div>
          <div className="flex justify-between text-[9px] font-mono text-zinc-400">
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-zinc-900 inline-block"></span>
              Principal ({principalPercentage.toFixed(0)}%)
            </span>
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-zinc-300 inline-block"></span>
              Interest ({interestPercentage.toFixed(0)}%)
            </span>
          </div>
        </div>
      </div>

      {/* Sync with Application Button */}
      <div>
        {isSynced ? (
          <div className="flex items-center justify-center gap-1.5 py-2 px-3 border border-zinc-200 bg-zinc-50 text-zinc-600 text-[11px] font-medium rounded-md w-full">
            <Check className="h-3.5 w-3.5 text-zinc-900" />
            Synced with Application Form
          </div>
        ) : (
          <button
            type="button"
            onClick={handleSyncClick}
            className="flex items-center justify-center gap-2 py-2 px-3 bg-zinc-900 hover:bg-zinc-800 text-white text-[11px] font-semibold rounded-md w-full transition-colors cursor-pointer shadow-sm"
          >
            <RefreshCw className="h-3.5 w-3.5 animate-spin-slow" />
            Sync with Application Form
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
          <span>Yearly Amortization Break-up</span>
          {showAmortization ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>

        {showAmortization && (
          <div className="mt-3 overflow-x-auto max-h-48 overflow-y-auto border border-zinc-200/80 rounded scrollbar-thin scrollbar-thumb-zinc-200">
            <table className="w-full text-left border-collapse font-mono text-[10px]">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-500">
                  <th className="p-2 font-medium">Year</th>
                  <th className="p-2 font-medium">Principal</th>
                  <th className="p-2 font-medium">Interest</th>
                  <th className="p-2 font-medium">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-zinc-800">
                {schedule.map((row) => (
                  <tr key={row.year} className="hover:bg-zinc-50/50">
                    <td className="p-2 font-semibold">Yr {row.year}</td>
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
        )}
      </div>
    </div>
  );
}
