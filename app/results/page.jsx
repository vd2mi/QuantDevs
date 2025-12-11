"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useUploadStore } from "@/store/upload";
import {
  Card,
  ProgressCircle,
} from "@tremor/react";
import {
  IconArrowLeft,
  IconTrendingUp,
  IconTrendingDown,
  IconAlertTriangle,
  IconCheck,
  IconCreditCard,
} from "@tabler/icons-react";
const BNPL_COLORS = {
  Tabby: "#3DC6A0",
  Tamara: "#FF4B91",
  Cashew: "#8B5CF6",
  Other: "#F59E0B",
};
function IncomeSpendingChart({ data }) {
  const maxValue = Math.max(...data.flatMap(d => [d.Income, d.Spending]));
  
  // Calculate averages
  const avgIncome = data.length > 0 
    ? data.reduce((sum, d) => sum + d.Income, 0) / data.length 
    : 0;
  const avgSpending = data.length > 0 
    ? data.reduce((sum, d) => sum + d.Spending, 0) / data.length 
    : 0;
  
  return (
    <div className="h-full flex flex-col">
      
      <div className="flex items-center justify-center gap-6 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-emerald-500"></div>
          <span className="text-gray-300 text-sm">Income</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-rose-500"></div>
          <span className="text-gray-300 text-sm">Spending</span>
        </div>
      </div>
      <div className="flex-1 flex items-end gap-2 px-2 pb-2">
        {data.map((item, index) => {
          const incomeHeight = maxValue > 0 ? (item.Income / maxValue) * 100 : 0;
          const spendingHeight = maxValue > 0 ? (item.Spending / maxValue) * 100 : 0;
          return (
            <div key={index} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex items-end justify-center gap-1 h-60">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${incomeHeight}%` }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="w-6 bg-emerald-500 relative group cursor-pointer"
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-neutral-800 px-2 py-1 rounded text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    SAR {item.Income.toLocaleString()}
                  </div>
                </motion.div>
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${spendingHeight}%` }}
                  transition={{ duration: 0.6, delay: index * 0.1 + 0.05 }}
                  className="w-6 bg-rose-500 relative group cursor-pointer"
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-neutral-800 px-2 py-1 rounded text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    SAR {item.Spending.toLocaleString()}
                  </div>
                </motion.div>
              </div>
              <span className="text-gray-400 text-xs">{item.month}</span>
            </div>
          );
        })}
      </div>
      
      {/* Average metrics to fill blank space */}
      <div className="mt-4 pt-4 border-t border-neutral-700/50 grid grid-cols-2 gap-4">
        <div className="bg-neutral-900/50 rounded-lg p-3">
          <div className="text-xs text-neutral-400 mb-1">Avg Monthly Income</div>
          <div className="text-lg font-semibold text-emerald-400">
            SAR {avgIncome.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
        </div>
        <div className="bg-neutral-900/50 rounded-lg p-3">
          <div className="text-xs text-neutral-400 mb-1">Avg Monthly Spending</div>
          <div className="text-lg font-semibold text-rose-400">
            SAR {avgSpending.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
        </div>
      </div>
    </div>
  );
}
function MonthlyBalanceChart({ data }) {
  if (!data || data.length === 0) return null;
  // FIX #4: Ensure all values are numeric, handle NaN
  const safe = (v) => Number.isFinite(v) ? v : 0;
  
  // FIX #4: Format month labels
  const formatMonth = (monthStr) => {
    const [year, month] = (monthStr || "").split("-");
    const names = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const idx = parseInt(month, 10) - 1;
    return isNaN(idx) ? monthStr || "" : `${names[idx]} ${year}`;
  };
  const values = data.map(d => safe(d.Balance)).filter(v => v !== null && v !== undefined);
  if (values.length === 0) return null;
  const maxValue = Math.max(...values);
  const minValue = Math.min(...values);
  const range = maxValue - minValue || 1;
  const niceMax = Math.ceil(maxValue / 5000) * 5000;
  const niceMin = Math.floor(minValue / 5000) * 5000;
  const niceRange = niceMax - niceMin || 1;
  const yAxisValues = [0, 1, 2, 3, 4].map(i => 
    Math.round(niceMax - (i * niceRange / 4))
  );
  const pointsPercent = data.map((item, index) => {
    const balance = safe(item.Balance);
    const xPercent = (index / (data.length - 1)) * 100;
    const yPercent = ((niceMax - balance) / niceRange) * 100;
    return { xPercent, yPercent, value: balance, label: item.date };
  });
  const svgPoints = data.map((item, index) => {
    const balance = safe(item.Balance);
    const x = (index / (data.length - 1)) * 100;
    const y = ((niceMax - balance) / niceRange) * 100;
    return { x, y, value: balance, label: item.date };
  });
  const linePath = svgPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const zeroLineY = niceMin < 0 ? ((niceMax - 0) / niceRange) * 100 : 100;
  const areaPath = niceMin < 0 
    ? `${linePath} L 100 ${zeroLineY} L 0 ${zeroLineY} Z`
    : `${linePath} L 100 100 L 0 100 Z`;
  return (
    <div className="h-full w-full flex">
      
      <div className="w-14 flex flex-col justify-between py-2 pr-2">
        {yAxisValues.map((val, i) => (
          <span key={i} className="text-[10px] text-gray-500 text-right">
            {Math.abs(val) >= 1000 ? `${(val / 1000).toFixed(0)}k` : val.toLocaleString()}
          </span>
        ))}
      </div>
      
      <div className="flex-1 flex flex-col">
        
        <div className="flex-1 relative">
          
          <div className="absolute inset-0 flex flex-col justify-between">
            {[0, 1, 2, 3, 4].map((i) => (
              <div 
                key={i} 
                className="w-full h-px bg-gray-700/50" 
                style={{ borderStyle: 'dashed' }}
              />
            ))}
          </div>
          
          <svg 
            className="absolute inset-0 w-full h-full overflow-visible" 
            viewBox="0 0 100 100" 
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="balanceGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.02" />
              </linearGradient>
            </defs>
            
            <path
              d={areaPath}
              fill="url(#balanceGradient)"
            />
            
            <path
              d={linePath}
              fill="none"
              stroke="#22d3ee"
              strokeWidth="0.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
              style={{ strokeWidth: '3px' }}
            />
            
            {svgPoints.map((point, i) => (
              <circle
                key={i}
                cx={point.x}
                cy={point.y}
                r="0.15"
                fill="#22d3ee"
                vectorEffect="non-scaling-stroke"
                style={{ r: '1.5px' }}
                className="cursor-pointer"
              />
            ))}
          </svg>
          
          {pointsPercent.map((point, i) => (
            <div
              key={i}
              className="absolute w-6 h-6 -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-10"
              style={{
                left: `${point.xPercent}%`,
                top: `${point.yPercent}%`,
              }}
            >
              
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-neutral-800 px-2 py-1 rounded text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                SAR {point.value.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
        
        <div className="h-6 flex justify-between pt-2">
          {data.map((item, i) => (
            <span key={i} className="text-[10px] text-gray-500 text-center" style={{ width: `${100 / data.length}%` }}>
              {formatMonth(item.date)}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
function getScoreInterpretation(score) {
  if (score >= 750) {
    return {
      label: "Excellent",
      description: "Very low risk",
      color: "emerald",
      textColor: "text-emerald-400",
      bgColor: "bg-emerald-500/20",
    };
  } else if (score >= 650) {
    return {
      label: "Good",
      description: "Eligible for most loans",
      color: "blue",
      textColor: "text-blue-400",
      bgColor: "bg-blue-500/20",
    };
  } else if (score >= 550) {
    return {
      label: "Fair",
      description: "Might require guarantees",
      color: "yellow",
      textColor: "text-yellow-400",
      bgColor: "bg-yellow-500/20",
    };
  } else {
    return {
      label: "High Risk",
      description: "Not eligible",
      color: "red",
      textColor: "text-red-400",
      bgColor: "bg-red-500/20",
    };
  }
}
function getBNPLRiskLevel(bnplDepth) {
  if (bnplDepth > 0.3) {
    return { label: "High BNPL risk", color: "text-red-400", icon: IconAlertTriangle };
  } else if (bnplDepth >= 0.15) {
    return { label: "Moderate BNPL exposure", color: "text-yellow-400", icon: IconCreditCard };
  } else {
    return { label: "Healthy BNPL level", color: "text-emerald-400", icon: IconCheck };
  }
}
function BNPLBarChart({ data }) {
  const maxValue = Math.max(...data.map(d => d.amount), 1); 
  return (
    <div className="w-full flex flex-col pb-2 min-h-[280px]">
      
      <div className="flex-1 flex items-end justify-around gap-3 px-2 min-h-[200px]">
        {data.map((item, index) => {
          const percentage = (item.amount / maxValue) * 100;
          const color = BNPL_COLORS[item.name] || BNPL_COLORS.Other;
          return (
            <div key={item.name} className="flex flex-col items-center gap-2 flex-1">
              
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.1 + 0.5 }}
                className="text-white text-xs font-semibold"
              >
                SAR {item.amount.toLocaleString()}
              </motion.span>
              
              <div className="h-56 w-14 bg-neutral-700/30 relative flex flex-col justify-end">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${percentage}%` }}
                  transition={{ duration: 0.8, delay: index * 0.1, ease: "easeOut" }}
                  className="w-full relative flex items-center justify-center"
                  style={{ backgroundColor: color }}
                >
                  
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-9 h-9 rounded-md bg-white/95 flex items-center justify-center overflow-hidden shadow-lg">
                      {item.name === "Tabby" && (
                        <img src="/icons/tabby.png" alt="Tabby" className="w-7 h-7 object-contain" />
                      )}
                      {item.name === "Tamara" && (
                        <img src="/icons/tamara.png" alt="Tamara" className="w-7 h-7 object-contain" />
                      )}
                      {item.name === "Cashew" && (
                        <img src="/icons/cashew.jpg" alt="Cashew" className="w-7 h-7 object-contain" />
                      )}
                      {item.name === "Other" && (
                        <span className="text-amber-500 font-bold text-sm">?</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/10 to-white/20" />
                </motion.div>
              </div>
              
              <span className="text-gray-400 text-xs font-medium mt-1">{item.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
const currencyFormatter = (value) => `SAR ${value.toLocaleString()}`;
export default function ResultsPage() {
  const router = useRouter();
  const { results, file, clearAll } = useUploadStore();
  useEffect(() => {
    if (!results) {
      router.push("/");
    }
  }, [results, router]);
  if (!results) {
    return null;
  }
  const { features, score, summary } = results;
  const scoreInfo = getScoreInterpretation(score);
  
  // FIX #1: Ensure all months are included, default to 0
  const allMonthsSet = new Set([
    ...features.monthlyIncome.map(m => m.month),
    ...features.monthlySpending.map(m => m.month)
  ]);
  const allMonths = Array.from(allMonthsSet).sort();
  
  const incomeMap = new Map(features.monthlyIncome.map(m => [m.month, m.amount]));
  const spendingMap = new Map(features.monthlySpending.map(m => [m.month, m.amount]));
  
  const incomeSpendingData = allMonths.map(month => ({
    month: month,
    Income: incomeMap.get(month) || 0,
    Spending: spendingMap.get(month) || 0,
  }));
  const bnplData = [
    { 
      name: "Tabby", 
      amount: features.bnplBreakdown.tabby,
      remainingInstallments: features.bnplRemainingInstallments?.tabby || 0,
      monthlyPayment: features.estimatedMonthlyBnplPayment?.tabby || 0,
    },
    { 
      name: "Tamara", 
      amount: features.bnplBreakdown.tamara,
      remainingInstallments: features.bnplRemainingInstallments?.tamara || 0,
      monthlyPayment: features.estimatedMonthlyBnplPayment?.tamara || 0,
    },
    { 
      name: "Cashew", 
      amount: features.bnplBreakdown.cashew,
      remainingInstallments: features.bnplRemainingInstallments?.cashew || 0,
      monthlyPayment: features.estimatedMonthlyBnplPayment?.cashew || 0,
    },
    { 
      name: "Other", 
      amount: features.bnplBreakdown.other,
      remainingInstallments: features.bnplRemainingInstallments?.other || 0,
      monthlyPayment: features.estimatedMonthlyBnplPayment?.other || 0,
    },
  ];
  // FIX #6: Improved BNPL Burnout Model
  const calculateBnplBurnout = () => {
    const safe = (v) => Number.isFinite(v) ? v : 0;
    let totalMonthlyBnpl = safe(bnplData.reduce((sum, item) => sum + safe(item.monthlyPayment), 0));
    
    // Fallback: If monthly payments are 0 but BNPL amounts exist, estimate monthly payment
    // Assume 4-installment plan (common for BNPL services)
    if (totalMonthlyBnpl === 0 && bnplData.some(item => item.amount > 0)) {
      const totalBnplAmount = bnplData.reduce((sum, item) => sum + safe(item.amount), 0);
      // Estimate: if we see transactions but no monthly payments, assume they're ongoing
      // Use total amount / 4 as monthly payment estimate
      totalMonthlyBnpl = safe(totalBnplAmount / 4);
    }
    
    // Calculate average monthly disposable income (income - spending)
    const avgMonthlyIncome = features.monthlyIncome.length > 0
      ? features.monthlyIncome.reduce((sum, m) => sum + safe(m.amount), 0) / features.monthlyIncome.length
      : safe(features.totalIncome) / Math.max(1, allMonths.length);
    
    const avgMonthlySpending = features.monthlySpending.length > 0
      ? features.monthlySpending.reduce((sum, m) => sum + safe(m.amount), 0) / features.monthlySpending.length
      : safe(features.totalSpent) / Math.max(1, allMonths.length);
    
    const avgMonthlyDisposableIncome = safe(avgMonthlyIncome - avgMonthlySpending);
    
    // FIX #1: Burnout timeline = (total remaining BNPL payments) / (avg monthly disposable income)
    const totalRemainingPayments = bnplData.reduce((sum, item) => {
      // Use monthly payment if available, otherwise estimate from amount
      const monthlyPayment = safe(item.monthlyPayment) > 0 
        ? safe(item.monthlyPayment) 
        : safe(item.amount) / 4; // Fallback: assume 4-installment plan
      return sum + safe(item.remainingInstallments) * monthlyPayment;
    }, 0);
    
    let timeline = 0;
    let riskLevel = "low";
    
    // Calculate BNPL-to-disposable-income ratio (more accurate than timeline alone)
    const bnplToDisposableRatio = avgMonthlyDisposableIncome > 0 
      ? totalMonthlyBnpl / avgMonthlyDisposableIncome 
      : (totalMonthlyBnpl > 0 ? 1 : 0); // If no disposable income but BNPL exists, ratio = 1 (high risk)
    
    const bnplToIncomeRatio = avgMonthlyIncome > 0 ? totalMonthlyBnpl / avgMonthlyIncome : 0;
    
    if (avgMonthlyDisposableIncome <= 0) {
      // Floor: If disposable income ≤ 0 → risk = HIGH, timeline = 1 month
      timeline = 1;
      riskLevel = "high";
    } else if (totalMonthlyBnpl === 0) {
      timeline = Infinity;
      riskLevel = "low";
    } else {
      timeline = totalRemainingPayments / avgMonthlyDisposableIncome;
      
      // FIX #1: Use BNPL-to-disposable-income ratio for risk classification
      // Only classify as HIGH RISK if BNPL burden > 30% of disposable income
      // Small BNPL amounts (< 10% of disposable income) should be LOW RISK regardless of timeline
      if (bnplToDisposableRatio < 0.1) {
        // BNPL < 10% of disposable income = LOW RISK (even if timeline is short)
        riskLevel = "low";
      } else if (bnplToDisposableRatio >= 0.3) {
        // BNPL ≥ 30% of disposable income = HIGH RISK
        riskLevel = "high";
      } else if (bnplToDisposableRatio >= 0.15 || timeline < 1.5) {
        // BNPL 15-30% OR timeline < 1.5 months = MODERATE RISK
        riskLevel = "moderate";
      } else {
        // Otherwise LOW RISK
        riskLevel = "low";
      }
    }
    
    return {
      totalMonthlyBnpl: safe(totalMonthlyBnpl),
      bnplToIncomeRatio: safe(bnplToIncomeRatio),
      monthsUntilBurnout: timeline === Infinity ? null : Math.ceil(safe(timeline)),
      riskLevel,
      avgMonthlyDisposableIncome: safe(avgMonthlyDisposableIncome),
    };
  };
  
  // Calculate burnout
  const bnplBurnout = calculateBnplBurnout();
  
  // FIX #3: Ensure BNPL exposure badge matches burnout risk for consistency
  // Use burnout risk level to determine exposure badge if BNPL exists
  const getConsistentBNPLRisk = () => {
    if (!bnplData.some(item => item.amount > 0)) {
      return getBNPLRiskLevel(features.bnplDepth); // No BNPL, use depth-based risk
    }
    // If BNPL exists, use burnout risk level for consistency
    if (bnplBurnout.riskLevel === "high") {
      return { label: "High BNPL risk", color: "text-red-400", icon: IconAlertTriangle };
    } else if (bnplBurnout.riskLevel === "moderate") {
      return { label: "Moderate BNPL exposure", color: "text-yellow-400", icon: IconCreditCard };
    } else {
      return { label: "Healthy BNPL level", color: "text-emerald-400", icon: IconCheck };
    }
  };
  
  const bnplRisk = getConsistentBNPLRisk();
  
  // FIX #1: Fix NaN in Monthly Balance Trend - backend now returns { month, balance }
  const safe = (v) => Number.isFinite(v) ? v : 0;
  const balanceData = features.monthlyBalances.map((item, index) => {
    let balance = 0;
    let date = `Month ${index + 1}`;
    
    if (typeof item === 'object') {
      // Backend now returns { month, balance } - handle both old and new format
      balance = safe(item.balance !== undefined ? item.balance : (item.Balance !== undefined ? item.Balance : 0));
      date = item.month || item.date || date;
    } else {
      balance = safe(item);
    }
    
    return {
      date,
      Balance: balance,
    };
  });
  const handleNewAnalysis = () => {
    clearAll();
    router.push("/");
  };
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white overflow-y-auto">
      
      <header className="border-b border-neutral-800 bg-[#0a0a0a]/90 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={handleNewAnalysis}
            className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors"
          >
            <IconArrowLeft className="w-5 h-5" />
            <span>New Analysis</span>
          </button>
          <h1 className="text-xl font-semibold">
            Analysis Results
          </h1>
          <div className="text-sm text-neutral-500">
            {file?.name}
          </div>
        </div>
      </header>
      <div className="max-w-7xl mx-auto px-4 py-8 pb-16">
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative overflow-hidden rounded-2xl mb-8">
            
            <div className="absolute inset-0 bg-gradient-to-br from-violet-900/40 via-neutral-900 to-indigo-900/40" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-500/20 via-transparent to-transparent" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-indigo-500/20 via-transparent to-transparent" />
            
            <div className="relative z-10 p-8 border border-violet-500/20 rounded-2xl backdrop-blur-sm">
              <h2 className="text-xl font-semibold text-white mb-6 text-center">Credit Score</h2>
              <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                <div className="relative">
                  
                  <div className={`absolute inset-0 blur-2xl opacity-30 rounded-full ${
                    score >= 750 ? 'bg-emerald-500' : 
                    score >= 650 ? 'bg-blue-500' : 
                    score >= 550 ? 'bg-yellow-500' : 'bg-red-500'
                  }`} />
                  <ProgressCircle
                    value={(score / 850) * 100}
                    size="xl"
                    color={scoreInfo.color}
                    strokeWidth={12}
                  >
                    <div className="text-center">
                      <span className="text-4xl font-bold text-white">{score}</span>
                      <span className="text-neutral-500 text-sm block">/850</span>
                    </div>
                  </ProgressCircle>
                </div>
                <div className="text-center md:text-left">
                  <div className={`inline-block px-4 py-2 rounded-full ${scoreInfo.bgColor} ${scoreInfo.textColor} font-semibold mb-2`}>
                    {scoreInfo.label}
                  </div>
                  <p className="text-neutral-400">{scoreInfo.description}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
        
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="relative overflow-hidden rounded-2xl min-h-[550px] border border-neutral-700/50">
              
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/30 via-neutral-900 to-rose-900/30" />
              <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-rose-500/10 rounded-full blur-3xl" />
              <div className="relative z-10 p-6 h-full flex flex-col">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <IconTrendingUp className="w-5 h-5 text-emerald-400" />
                  Income vs Spending
                </h3>
                <div className="bg-neutral-800/40 rounded-xl p-4 backdrop-blur-sm flex-1">
                  <IncomeSpendingChart data={incomeSpendingData} />
                </div>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="relative overflow-hidden rounded-2xl min-h-[550px] border border-neutral-700/50">
              
              <div className="absolute inset-0 bg-gradient-to-br from-teal-900/30 via-neutral-900 to-pink-900/30" />
              <div className="absolute top-0 left-0 w-32 h-32 bg-teal-500/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-pink-500/10 rounded-full blur-3xl" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-violet-500/10 rounded-full blur-3xl" />
              <div className="relative z-10 p-6 h-full flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <IconCreditCard className="w-5 h-5 text-violet-400" />
                    BNPL Exposure
                  </h3>
                  {(() => {
                    const RiskIcon = bnplRisk.icon;
                    return (
                      <div className={`flex items-center gap-2 ${bnplRisk.color} text-sm px-3 py-1 rounded-full bg-neutral-800/50`}>
                        <RiskIcon className="w-4 h-4" />
                        <span className="font-medium">{bnplRisk.label}</span>
                      </div>
                    );
                  })()}
                </div>
                <div className="bg-neutral-800/40 rounded-xl p-4 backdrop-blur-sm flex flex-col">
                  <div className="flex-shrink-0 mb-4" style={{ minHeight: '280px' }}>
                    <BNPLBarChart data={bnplData} />
                  </div>
                  
                  {bnplData.some(item => item.amount > 0) && (
                    <div className="mt-4 pt-4 border-t border-neutral-700/50 flex-shrink-0">
                      <h4 className="text-sm font-semibold text-neutral-300 mb-3">Installment Details</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {bnplData.filter(item => item.amount > 0).map((item) => (
                          <div key={item.name} className="bg-neutral-900/50 rounded-lg p-2.5">
                            <div className="text-xs text-neutral-400 mb-1">{item.name}</div>
                            <div className="text-sm font-semibold text-white">
                              {currencyFormatter(item.monthlyPayment)}/mo
                            </div>
                            <div className="text-xs text-neutral-500 mt-0.5">
                              {item.remainingInstallments} payments remaining
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
        
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="relative overflow-hidden rounded-2xl h-[450px] border border-neutral-700/50">
              
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/30 via-neutral-900 to-blue-900/30" />
              <div className="absolute top-0 left-1/2 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl -translate-x-1/2" />
              <div className="relative z-10 p-6 h-full flex flex-col">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                  </svg>
                  Monthly Balance Trend
                </h3>
                <div className="bg-neutral-800/40 rounded-xl p-4 backdrop-blur-sm flex-1">
                  <MonthlyBalanceChart data={balanceData} />
                </div>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            {/* FIX #5: Reduce height to improve spacing */}
            <div className="relative overflow-hidden rounded-2xl border border-neutral-700/50">
              
              <div className="absolute inset-0 bg-gradient-to-br from-amber-900/20 via-neutral-900 to-orange-900/20" />
              <div className="absolute bottom-0 right-0 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl" />
              <div className="relative z-10 p-6 h-full flex flex-col">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Financial Summary
                </h3>
                <div className="space-y-2 bg-neutral-800/40 rounded-xl p-3 backdrop-blur-sm flex-1 overflow-y-auto">
                  
                  <div className="flex items-center justify-between py-1.5 px-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <span className="text-neutral-300 text-[15px]">Total Income</span>
                    <span className="text-emerald-400 font-semibold text-[15px] flex items-center gap-1">
                      <IconTrendingUp className="w-4 h-4" />
                      SAR {features.totalIncome.toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between py-1.5 px-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20">
                    <span className="text-neutral-300 text-[15px]">Total Spending</span>
                    <span className="text-rose-400 font-semibold text-[15px] flex items-center gap-1">
                      <IconTrendingDown className="w-4 h-4" />
                      SAR {features.totalSpent.toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between py-1.5 px-2.5 rounded-lg bg-neutral-700/30">
                    <span className="text-neutral-400 text-[15px]">Savings Ratio</span>
                    <span className={`font-semibold text-[15px] ${features.savingsRatio > 0.3 ? "text-emerald-400" : "text-yellow-400"}`}>
                      {(features.savingsRatio * 100).toFixed(1)}%
                    </span>
                  </div>
                  
                  {/* FIX #8: Add new metrics */}
                  {features.averageMonthlySavings !== undefined && (
                    <div className="flex items-center justify-between py-1.5 px-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                      <span className="text-neutral-300 text-[15px]">Avg Monthly Savings</span>
                      <span className="text-emerald-400 font-semibold text-[15px]">
                        SAR {features.averageMonthlySavings.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </span>
                    </div>
                  )}
                  
                  {/* FIX #6: Add Avg Monthly Disposable */}
                  <div className="flex items-center justify-between py-1.5 px-2.5 rounded-lg bg-neutral-700/30">
                    <span className="text-neutral-400 text-[15px]">Avg Monthly Disposable</span>
                    <span className={`font-semibold text-[15px] ${bnplBurnout.avgMonthlyDisposableIncome >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                      SAR {bnplBurnout.avgMonthlyDisposableIncome.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between py-1.5 px-2.5 rounded-lg bg-neutral-700/30">
                    <span className="text-neutral-400 text-[15px]">BNPL Ratio</span>
                    <span className={`font-semibold text-[15px] ${bnplRisk.color}`}>
                      {(features.bnplDepth * 100).toFixed(1)}%
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between py-1.5 px-2.5 rounded-lg bg-neutral-700/30">
                    <span className="text-neutral-400 text-[15px]">Income Stability</span>
                    <span className={`font-semibold text-[15px] ${features.incomeStability > 0.8 ? "text-emerald-400" : "text-yellow-400"}`}>
                      {(features.incomeStability * 100).toFixed(1)}%
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between py-1.5 px-2.5 rounded-lg bg-neutral-700/30">
                    <span className="text-neutral-400 text-[15px]">Spending Volatility</span>
                    <span className={`font-semibold text-[15px] ${features.spendingVolatility < 0.3 ? "text-emerald-400" : "text-yellow-400"}`}>
                      {(features.spendingVolatility * 100).toFixed(1)}%
                    </span>
                  </div>
                  
                  {/* FIX #8: Top 5 Spending Categories */}
                  {features.topSpendingCategories && features.topSpendingCategories.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-neutral-700/50">
                      <h4 className="text-sm font-semibold text-neutral-300 mb-2">Top Spending Categories</h4>
                      <div className="space-y-1.5">
                        {features.topSpendingCategories.map((cat, idx) => (
                          <div key={idx} className="flex items-center justify-between py-1 px-2 rounded bg-neutral-700/20">
                            <span className="text-neutral-400 text-xs capitalize">{cat.category || "other"}</span>
                            <span className="text-neutral-300 font-medium text-xs">
                              SAR {cat.amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* FIX #8: Recurring Merchants */}
                  {features.recurringMerchants && features.recurringMerchants.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-neutral-700/50">
                      <h4 className="text-sm font-semibold text-neutral-300 mb-2">Recurring Merchants</h4>
                      <div className="space-y-1">
                        {features.recurringMerchants.slice(0, 5).map((merchant, idx) => (
                          <div key={idx} className="flex items-center justify-between py-1 px-2 rounded bg-neutral-700/20">
                            <span className="text-neutral-400 text-xs truncate flex-1">{merchant.merchant}</span>
                            <span className="text-neutral-500 text-xs ml-2">{merchant.transactionCount}x</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* FIX #8: Spending Spikes */}
                  {features.spendingSpikes && features.spendingSpikes.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-neutral-700/50">
                      <h4 className="text-sm font-semibold text-amber-400 mb-2 flex items-center gap-1">
                        <IconAlertTriangle className="w-4 h-4" />
                        Spending Spikes
                      </h4>
                      <div className="space-y-1.5">
                        {features.spendingSpikes.slice(0, 3).map((spike, idx) => (
                          <div key={idx} className="flex items-start justify-between py-1 px-2 rounded bg-amber-500/10 border border-amber-500/20">
                            <div className="flex-1 min-w-0">
                              <p className="text-neutral-300 text-xs truncate">{spike.description || "Transaction"}</p>
                              <p className="text-neutral-500 text-xs">{spike.date}</p>
                            </div>
                            <div className="text-right ml-2">
                              <span className="text-amber-400 font-semibold text-xs">
                                SAR {spike.amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                              </span>
                              <p className="text-amber-500/70 text-xs">+{spike.deviation}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {features.salaryWarnings && features.salaryWarnings.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-neutral-700/50 p-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                      <div className="flex items-start gap-1.5">
                        <IconAlertTriangle className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-yellow-400 font-medium text-sm">Warnings</p>
                          {features.salaryWarnings.map((warning, idx) => (
                            <p key={idx} className="text-yellow-200/80 text-sm mt-0.5">
                              {warning}
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* BNPL Burnout Prediction Section - Show if there are BNPL transactions */}
        {/* Show burnout analysis if there are BNPL transactions, even if monthly payments are 0 */}
        {bnplData.some(item => item.amount > 0) ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="mb-8"
          >
            <div className="relative overflow-hidden rounded-2xl">
              <div className={`absolute inset-0 ${
                bnplBurnout.riskLevel === "high" 
                  ? "bg-gradient-to-br from-red-900/40 via-neutral-900 to-orange-900/30"
                  : bnplBurnout.riskLevel === "moderate"
                  ? "bg-gradient-to-br from-yellow-900/30 via-neutral-900 to-amber-900/20"
                  : "bg-gradient-to-br from-emerald-900/20 via-neutral-900 to-teal-900/20"
              }`} />
              <div className="absolute top-0 right-0 w-40 h-40 bg-red-500/10 rounded-full blur-3xl" />
              <div className="relative z-10 p-6 border border-neutral-700/50 rounded-2xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <IconAlertTriangle className={`w-5 h-5 ${
                      bnplBurnout.riskLevel === "high" ? "text-red-400" 
                      : bnplBurnout.riskLevel === "moderate" ? "text-yellow-400" 
                      : "text-emerald-400"
                    }`} />
                    BNPL Burnout Prediction
                  </h3>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    bnplBurnout.riskLevel === "high"
                      ? "bg-red-500/20 text-red-400 border border-red-500/30"
                      : bnplBurnout.riskLevel === "moderate"
                      ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                      : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  }`}>
                    {bnplBurnout.riskLevel === "high" ? "High Risk" 
                      : bnplBurnout.riskLevel === "moderate" ? "Moderate Risk" 
                      : "Low Risk"}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-neutral-800/60 rounded-xl p-4 border border-neutral-700/50">
                    <div className="text-sm text-neutral-400 mb-1">Monthly BNPL Burden</div>
                    <div className="text-2xl font-bold text-white">
                      {currencyFormatter(bnplBurnout.totalMonthlyBnpl)}
                    </div>
                    <div className="text-xs text-neutral-500 mt-1">
                      {(bnplBurnout.bnplToIncomeRatio * 100).toFixed(1)}% of monthly income
                    </div>
                  </div>
                  <div className="bg-neutral-800/60 rounded-xl p-4 border border-neutral-700/50">
                    <div className="text-sm text-neutral-400 mb-1">Estimated Burnout Timeline</div>
                    {bnplBurnout.monthsUntilBurnout ? (
                      <>
                        <div className="text-2xl font-bold text-white">
                          {bnplBurnout.monthsUntilBurnout} months
                        </div>
                        <div className="text-xs text-neutral-500 mt-1">
                          At current spending rate
                        </div>
                      </>
                    ) : (
                      <div className="text-lg font-semibold text-emerald-400">
                        No immediate risk
                      </div>
                    )}
                  </div>
                  <div className="bg-neutral-800/60 rounded-xl p-4 border border-neutral-700/50">
                    <div className="text-sm text-neutral-400 mb-1">Recommendation</div>
                    <div className="text-sm text-neutral-300 mt-2">
                      {bnplBurnout.riskLevel === "high" 
                        ? "Consider consolidating BNPL payments or reducing new purchases. Your BNPL burden is high relative to income."
                        : bnplBurnout.riskLevel === "moderate"
                        ? "Monitor your BNPL usage. Consider paying off installments early to reduce monthly burden."
                        : "Your BNPL usage is manageable. Continue monitoring to maintain healthy financial habits."}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="mb-8"
          >
            <div className="relative overflow-hidden rounded-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/20 via-neutral-900 to-teal-900/20" />
              <div className="relative z-10 p-6 border border-emerald-500/20 rounded-2xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <IconCheck className="w-5 h-5 text-emerald-400" />
                    BNPL Burnout Prediction
                  </h3>
                  <div className="px-3 py-1 rounded-full text-sm font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    No Burnout Risk
                  </div>
                </div>
                <div className="bg-neutral-800/60 rounded-xl p-4 border border-neutral-700/50">
                  <div className="text-sm text-neutral-300">
                    <p className="mb-2">✅ No active BNPL burnout risk detected in your statement.</p>
                    <p className="text-neutral-400 text-xs">
                      You either have no BNPL transactions or all BNPL installments have been completed. This is positive for your credit score. If you're considering BNPL services, be aware they can impact your creditworthiness and monthly obligations.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-8"
        >
          <div className="relative overflow-hidden rounded-2xl">
            
            <div className="absolute inset-0 bg-gradient-to-br from-violet-900/40 via-neutral-900 to-indigo-900/40" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-500/10 via-transparent to-transparent" />
            <div className="relative z-10 p-6 border border-violet-500/20 rounded-2xl backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-violet-500"></span>
                </span>
                AI Summary
              </h3>
              <p className="text-neutral-300 leading-relaxed">
                {summary}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
